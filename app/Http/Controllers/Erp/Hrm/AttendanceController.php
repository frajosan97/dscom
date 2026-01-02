<?php

namespace App\Http\Controllers\Erp\Hrm;

use App\Http\Controllers\Controller;
use App\Models\Erp\Hrm\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Throwable;
use Yajra\DataTables\Facades\DataTables;

class AttendanceController extends Controller
{
    /**
     * Display attendance listing page
     */
    public function index(Request $request)
    {
        if ($request->has('draw')) {
            $date = $request->input('date') ?? now()->toDateString();

            $query = User::with([
                'department',
                'attendanceForDate' => function ($q) use ($date) {
                    $q->whereDate('attendance_date', $date);
                }
            ])->when($request->filled('search'), function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('designation', 'like', '%' . $request->search . '%');
            })->when($request->filled('department') && $request->department !== 'all', function ($q) use ($request) {
                $q->where('department_id', $request->department);
            })->when($request->filled('status') && $request->status !== 'all', function ($q) use ($request) {
                $q->whereHas('attendanceForDate', function ($q) use ($request) {
                    $q->where('status', $request->status);
                });
            });

            return DataTables::eloquent($query)
                ->addIndexColumn()
                ->addColumn('employee', fn($row) => view('partials.backend.attendance.employee', compact('row'))->render())
                ->addColumn('clock_in', fn($row) => view('partials.backend.attendance.clock_in', compact('row'))->render())
                ->addColumn('clock_out', fn($row) => view('partials.backend.attendance.clock_out', compact('row'))->render())
                ->addColumn('hours_worked', fn($row) => view('partials.backend.attendance.hours_worked', compact('row'))->render())
                ->addColumn('status', fn($row) => view('partials.backend.attendance.status', compact('row'))->render())
                ->addColumn('action', fn($row) => view('partials.backend.attendance.action', compact('row'))->render())
                ->rawColumns(['employee', 'clock_in', 'clock_out', 'hours_worked', 'status', 'action'])
                ->make(true);
        }

        return Inertia::render('Backend/ERP/HRM/Attendance');
    }

    /**
     * Get attendance statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $date = $request->input('date') ?? now()->toDateString();

            $totalEmployees = User::where('status', 'active')->count();

            $presentCount = Attendance::whereDate('attendance_date', $date)
                ->where('status', 'present')
                ->count();

            $absentCount = Attendance::whereDate('attendance_date', $date)
                ->where('status', 'absent')
                ->count();

            $lateCount = Attendance::whereDate('attendance_date', $date)
                ->where('status', 'late')
                ->count();

            $onLeaveCount = Attendance::whereDate('attendance_date', $date)
                ->where('status', 'on_leave')
                ->count();

            $attendanceRate = $totalEmployees > 0
                ? round(($presentCount / $totalEmployees) * 100, 2)
                : 0;

            $stats = [
                'totalEmployees' => $totalEmployees,
                'presentCount' => $presentCount,
                'absentCount' => $absentCount,
                'lateCount' => $lateCount,
                'onLeaveCount' => $onLeaveCount,
                'attendanceRate' => $attendanceRate,
                'date' => $date
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance statistics',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Store a new attendance record
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'attendance_date' => 'required|date|date_format:Y-m-d',
            'clock_in' => 'nullable|date_format:H:i',
            'clock_out' => 'nullable|date_format:H:i',
            'status' => 'required|in:present,absent,late,on_leave,half_day',
            'mode' => 'nullable|in:manual,auto,qr,biometric,mobile',
            'notes' => 'nullable|string|max:500',
            'location' => 'nullable|json',
            'device_info' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Check for duplicate attendance record for the same day
            $existingAttendance = Attendance::where('user_id', $request->user_id)
                ->whereDate('attendance_date', $request->attendance_date)
                ->first();

            if ($existingAttendance) {
                return response()->json([
                    'success' => false,
                    'message' => 'Attendance record already exists for this employee on the selected date'
                ], 409);
            }

            // Determine status if not provided
            $status = $request->status ?? $this->determineStatus(
                $request->clock_in,
                $request->clock_out
            );

            // Create attendance record
            $attendance = Attendance::create([
                'user_id' => $request->user_id,
                'attendance_date' => $request->attendance_date,
                'clock_in' => $request->clock_in ? Carbon::parse($request->attendance_date . ' ' . $request->clock_in) : null,
                'clock_out' => $request->clock_out ? Carbon::parse($request->attendance_date . ' ' . $request->clock_out) : null,
                'status' => $status,
                'mode' => $request->mode ?? 'manual',
                'notes' => $request->notes,
                'location' => $request->location,
                'device_info' => $request->device_info,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Attendance record created successfully',
                'data' => $attendance->load('user')
            ]);

        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Failed to create attendance record: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create attendance record',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Display attendance details
     */
    public function show(Attendance $attendance): JsonResponse
    {
        try {
            // Load relationships
            $attendance->load([
                'user'
            ]);

            // Calculate hours worked
            $attendance->hours_worked = $this->calculateHoursWorked($attendance);

            return response()->json([
                'success' => true,
                'data' => $attendance
            ]);

        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance record not found',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 404);
        }
    }

    /**
     * Update attendance record
     */
    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'clock_in' => 'nullable|date_format:H:i',
            'clock_out' => 'nullable|date_format:H:i',
            'status' => 'required|in:present,absent,late,on_leave,half_day',
            'mode' => 'nullable|in:manual,auto,qr,biometric,mobile',
            'notes' => 'nullable|string|max:500',
            'location' => 'nullable|json',
            'device_info' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $attendance = Attendance::findOrFail($id);

            // Update attendance record
            $updateData = [
                'clock_in' => $request->clock_in ? Carbon::parse($attendance->attendance_date . ' ' . $request->clock_in) : null,
                'clock_out' => $request->clock_out ? Carbon::parse($attendance->attendance_date . ' ' . $request->clock_out) : null,
                'status' => $request->status,
                'mode' => $request->mode ?? $attendance->mode,
                'notes' => $request->notes ?? $attendance->notes,
                'location' => $request->location ?? $attendance->location,
                'device_info' => $request->device_info ?? $attendance->device_info,
                'updated_by' => Auth::id(),
            ];

            $attendance->update($updateData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Attendance record updated successfully',
                'data' => $attendance->fresh()->load('user')
            ]);

        } catch (Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update attendance record',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Mark attendance as present (clock in)
     */
    public function markClockIn(Request $request, User $user): JsonResponse
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'remarks' => 'nullable|string|max:500',
                'date' => 'required|date|date_format:Y-m-d',
            ]);

            $attendance = Attendance::where('user_id', $user->id)
                ->where('attendance_date', $validated['date'])
                ->first();

            if ($attendance) {
                // check if already clocked in
                if ($attendance->clock_in) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Employee has already clocked in',
                    ]);
                }

                // continue with clock in
                $attendance->update([
                    'clock_in' => now(),
                    'mode' => $request->mode ?? 'manual',
                    'remarks' => $request->remarks,
                    'status' => 'present',
                ]);
            }

            // Create clock in record
            Attendance::create([
                'user_id' => $user->id,
                'attendance_date' => $validated['date'],
                'clock_in' => now(),
                'mode' => $request->mode ?? 'manual',
                'remarks' => $request->remarks,
                'status' => 'present',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Clock in recorded successfully'
            ]);

        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Failed to record clock in: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to record clock in',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Mark attendance as clocked out
     */
    public function markClockOut(Request $request, User $user): JsonResponse
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'remarks' => 'nullable|string|max:500',
                'date' => 'required|date|date_format:Y-m-d',
            ]);

            $attendance = Attendance::where('user_id', $user->id)
                ->where('attendance_date', $validated['date'])
                ->first();

            if (!$attendance->clock_in) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee must clock in before clocking out'
                ], 400);
            }

            if ($attendance->clock_out) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee has already clocked out'
                ], 400);
            }

            $attendance->update([
                'clock_out' => now(),
                'mode' => $request->mode ?? 'manual',
                'remarks' => $request->remarks,
                'status' => 'present',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Clock out recorded successfully',
            ]);

        } catch (Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to record clock out',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Delete attendance record
     */
    public function destroy($id): JsonResponse
    {
        try {
            $attendance = Attendance::findOrFail($id);
            $attendance->delete();

            return response()->json([
                'success' => true,
                'message' => 'Attendance record deleted successfully'
            ]);

        } catch (Throwable $e) {
            Log::error('Failed to delete attendance record: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete attendance record',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Reset attendance record
     */
    public function reset($id, Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $attendance = Attendance::findOrFail($id);

            // Store reset log
            $attendance->update([
                'clock_in' => null,
                'clock_out' => null,
                'status' => 'absent',
                'notes' => 'RESET - Reason: ' . $request->reason,
                'updated_by' => Auth::id()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Attendance record reset successfully',
                'data' => $attendance->fresh()
            ]);

        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Failed to reset attendance record: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to reset attendance record',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Bulk mark attendance
     */
    public function bulkMark(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'employee_ids' => 'required|array|min:1',
            'employee_ids.*' => 'exists:users,id',
            'status' => 'required|in:present,absent,late,on_leave,half_day',
            'date' => 'required|date|date_format:Y-m-d',
            'reason' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $processedCount = 0;
            $errors = [];

            foreach ($request->employee_ids as $employeeId) {
                try {
                    $attendance = Attendance::updateOrCreate(
                        [
                            'user_id' => $employeeId,
                            'attendance_date' => $request->date,
                        ],
                        [
                            'status' => $request->status,
                            'mode' => 'bulk',
                            'notes' => $request->reason ?? 'Bulk update',
                            'updated_by' => Auth::id(),
                        ]
                    );

                    $processedCount++;
                } catch (Throwable $e) {
                    $errors[] = "Failed to process employee ID {$employeeId}: " . $e->getMessage();
                }
            }

            DB::commit();

            $response = [
                'success' => true,
                'message' => "Attendance marked for {$processedCount} employees",
                'count' => $processedCount
            ];

            if (!empty($errors)) {
                $response['errors'] = $errors;
                $response['warning'] = 'Some employees failed to process';
            }

            return response()->json($response);

        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Failed to bulk mark attendance: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk mark attendance',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get recent activities
     */
    public function activities(Request $request): JsonResponse
    {
        try {
            $limit = $request->input('limit', 10);

            $activities = Attendance::with(['user'])
                ->latest()
                ->limit($limit)
                ->get()
                ->map(function ($attendance) {
                    return [
                        'id' => $attendance->id,
                        'employee_name' => $attendance->user->name ?? 'N/A',
                        'employee_code' => $attendance->user->code ?? 'N/A',
                        'action' => $attendance->clock_out ? 'clock_out' : ($attendance->clock_in ? 'clock_in' : 'marked'),
                        'time' => $attendance->clock_out
                            ? Carbon::parse($attendance->clock_out)->format('h:i A')
                            : ($attendance->clock_in ? Carbon::parse($attendance->clock_in)->format('h:i A') : 'N/A'),
                        'status' => $attendance->status,
                        'created_at' => $attendance->created_at->format('Y-m-d H:i:s'),
                        'icon' => $this->getActivityIcon($attendance)
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $activities
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to fetch recent activities: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recent activities',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Export attendance data
     */
    public function export(Request $request): JsonResponse
    {
        try {
            $query = Attendance::with(['user', 'user.department'])
                ->when($request->filled('date'), function ($q) use ($request) {
                    $q->whereDate('attendance_date', $request->date);
                })
                ->when($request->filled('status') && $request->status !== 'all', function ($q) use ($request) {
                    $q->where('status', $request->status);
                })
                ->when($request->filled('department') && $request->department !== 'all', function ($q) use ($request) {
                    $q->whereHas('user', function ($userQuery) use ($request) {
                        $userQuery->where('department_id', $request->department);
                    });
                })
                ->when($request->filled('search'), function ($q) use ($request) {
                    $q->whereHas('user', function ($userQuery) use ($request) {
                        $userQuery->where('name', 'like', '%' . $request->search . '%')
                            ->orWhere('code', 'like', '%' . $request->search . '%');
                    });
                })
                ->orderBy('attendance_date', 'desc')
                ->orderBy('user_id');

            $attendanceRecords = $query->get();

            // Format for export
            $exportData = $attendanceRecords->map(function ($attendance) {
                return [
                    'Employee' => $attendance->user->name ?? 'N/A',
                    'Code' => $attendance->user->code ?? 'N/A',
                    'Department' => $attendance->user->department->name ?? 'N/A',
                    'Date' => $attendance->attendance_date->format('Y-m-d'),
                    'Clock In' => $attendance->clock_in ? $attendance->clock_in->format('h:i A') : 'N/A',
                    'Clock Out' => $attendance->clock_out ? $attendance->clock_out->format('h:i A') : 'N/A',
                    'Hours Worked' => $this->calculateHoursWorked($attendance),
                    'Status' => ucfirst(str_replace('_', ' ', $attendance->status)),
                    'Mode' => ucfirst($attendance->mode),
                    'Notes' => $attendance->notes
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $exportData,
                'total' => $attendanceRecords->count(),
                'summary' => [
                    'total_attendance' => $attendanceRecords->count(),
                    'present_count' => $attendanceRecords->where('status', 'present')->count(),
                    'absent_count' => $attendanceRecords->where('status', 'absent')->count(),
                    'late_count' => $attendanceRecords->where('status', 'late')->count(),
                    'on_leave_count' => $attendanceRecords->where('status', 'on_leave')->count(),
                ]
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to export attendance: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to export attendance',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Generate QR code for attendance
     */
    public function generateQRCode(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date|date_format:Y-m-d',
            'expires_in' => 'required|integer|min:300|max:86400' // 5 minutes to 24 hours
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Generate unique QR code data
            $qrData = [
                'date' => $request->date,
                'company_id' => config('app.company_id'),
                'expires_at' => now()->addSeconds($request->expires_in)->toISOString(),
                'token' => hash('sha256', uniqid('attendance_qr_', true) . $request->date)
            ];

            // Store QR code data in cache
            $cacheKey = 'attendance_qr_' . $qrData['token'];
            cache([$cacheKey => $qrData], $request->expires_in);

            return response()->json([
                'success' => true,
                'message' => 'QR Code generated successfully',
                'data' => [
                    'qr_token' => $qrData['token'],
                    'expires_at' => $qrData['expires_at'],
                    'date' => $qrData['date']
                ]
            ]);

        } catch (Throwable $e) {
            Log::error('Failed to generate QR code: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Format clock in display
     */
    private function formatClockIn(User $user): string
    {
        $attendance = $user?->attendance?->first();

        if (!$attendance || !$attendance->clock_in) {
            return view('partials.backend.attendance.clock-in-btn', [
                'userId' => $user->id,
                'userName' => $user->name,
            ])->render();
        }

        $clockInTime = $attendance->clock_in->format('h:i A');
        $isLate = $this->isLateClockIn($attendance->clock_in);

        return view('partials.backend.attendance.clock-in-time', [
            'time' => $clockInTime,
            'isLate' => $isLate,
        ])->render();
    }

    /**
     * Format clock out display
     */
    private function formatClockOut(User $user): string
    {
        $attendance = $user?->attendance?->first();

        if (!$attendance) {
            return '-';
        }

        if ($attendance->clock_in && !$attendance->clock_out) {
            return view('partials.backend.attendance.clock-out-btn', [
                'userId' => $user->id,
                'userName' => $user->name,
            ])->render();
        }

        if ($attendance->clock_out) {
            $clockOutTime = $attendance->clock_out->format('h:i A');
            $isEarly = $this->isEarlyClockOut($attendance->clock_out);

            return view('partials.backend.attendance.clock-out-time', [
                'time' => $clockOutTime,
                'isEarly' => $isEarly,
            ])->render();
        }

        return '-';
    }

    /**
     * Determine status based on clock in/out times
     */
    private function determineStatus(?string $clockIn, ?string $clockOut): string
    {
        if (!$clockIn && !$clockOut) {
            return 'absent';
        }

        if ($clockIn && !$clockOut) {
            return $this->isLateClockIn(Carbon::parse($clockIn)) ? 'late' : 'present';
        }

        if ($clockIn && $clockOut) {
            $start = Carbon::parse($clockIn);
            $end = Carbon::parse($clockOut);

            // Check if it's a half day (less than 4 hours)
            if ($end->diffInHours($start) < 4) {
                return 'half_day';
            }

            // Check if late (after 9:15 AM)
            if ($this->isLateClockIn($start)) {
                return 'late';
            }

            return 'present';
        }

        return 'absent';
    }

    /**
     * Check if clock-in is late
     */
    private function isLateClockIn(Carbon $clockInTime): bool
    {
        $expectedStart = Carbon::createFromTime(9, 0); // 9:00 AM
        return $clockInTime->gt($expectedStart->addMinutes(15)); // Late after 9:15 AM
    }

    /**
     * Check if clock-out is early
     */
    private function isEarlyClockOut(Carbon $clockOutTime): bool
    {
        $expectedEnd = Carbon::createFromTime(17, 0); // 5:00 PM
        return $clockOutTime->lt($expectedEnd->subMinutes(30)); // Early before 4:30 PM
    }

    /**
     * Calculate hours worked
     */
    private function calculateHoursWorked(Attendance $attendance): string
    {
        if (!$attendance->clock_in || !$attendance->clock_out) {
            return '0:00';
        }

        $hours = $attendance->clock_in->diffInHours($attendance->clock_out);
        $minutes = $attendance->clock_in->diffInMinutes($attendance->clock_out) % 60;

        return sprintf('%d:%02d', $hours, $minutes);
    }

    /**
     * Get activity icon
     */
    private function getActivityIcon(Attendance $attendance): string
    {
        $icons = [
            'clock_in' => 'bi-clock',
            'clock_out' => 'bi-clock-history',
            'present' => 'bi-check-circle',
            'absent' => 'bi-x-circle',
            'late' => 'bi-clock-exclamation',
            'on_leave' => 'bi-calendar3',
            'half_day' => 'bi-clock-half'
        ];

        return $icons[$attendance->clock_out ? 'clock_out' : ($attendance->clock_in ? 'clock_in' : $attendance->status)] ?? 'bi-clock';
    }

    /**
     * Get status color
     */
    private function getStatusColor(string $status): string
    {
        $colors = [
            'present' => 'success',
            'absent' => 'danger',
            'late' => 'warning',
            'on_leave' => 'info',
            'half_day' => 'secondary'
        ];

        return $colors[$status] ?? 'secondary';
    }
}