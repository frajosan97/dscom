<?php

namespace App\Http\Controllers\Erp\Hrm;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;
use Yajra\DataTables\Facades\DataTables;

class AttendanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response|JsonResponse
    {
        try {
            // Handle DataTables request
            if ($request->has('draw')) {
                return $this->handleDataTableRequest($request);
            }

            // Return Inertia response for regular page load
            return Inertia::render('Backend/ERP/HRM/Attendance');
        } catch (Throwable $e) {
            Log::error($e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load attendance data',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred',
            ], 500);
        }
    }

    /**
     * Handle DataTables AJAX request
     */
    private function handleDataTableRequest(Request $request): JsonResponse
    {
        $date = $request->date ?? now()->toDateString();

        $query = User::with([
            'department:id,name',
            'attendance' => function ($query) use ($date) {
                $query->whereDate('attendance_date', $date);
            },
        ]);

        return DataTables::eloquent($query)
            ->addColumn('name', fn($row) => $row->name ?? 'N/A')
            ->addColumn('department_name', fn($row) => $row->department?->name ?? 'N/A')
            ->addColumn('clockin', fn($row) => $this->formatClockIn($row))
            ->addColumn('clockout', fn($row) => $this->formatClockOut($row))
            ->addColumn('status', fn($row) => $this->formatStatus($row))
            ->addColumn('hours_worked', fn($row) => $this->calculateHoursWorked($row))
            ->addColumn('actions', fn($row) => $this->formatActions($row))
            ->rawColumns(['clockin', 'clockout', 'status', 'actions'])
            ->toJson();
    }

    /**
     * Format clock in data
     */
    private function formatClockIn(User $user): string
    {
        // Safely get attendance collection
        $attendance = $user->attendance ?? collect(); // Ensure it's always a collection

        // Use first() on collection
        $attendanceRecord = $attendance->first();

        if (!$attendanceRecord || !$attendanceRecord->clock_in) {
            return view('partials.backend.attendance.clock-in-btn', [
                'userId' => $user->id,
                'userName' => $user->first_name . ' ' . $user->last_name,
            ])->render();
        }

        $clockInTime = Carbon::parse($attendanceRecord->clock_in)->format('h:i A');
        $isLate = $this->isLateCheckIn($attendanceRecord->clock_in);

        return view('partials.backend.attendance.clock-in-time', [
            'time' => $clockInTime,
            'isLate' => $isLate,
        ])->render();
    }

    /**
     * Format clock out data
     */
    private function formatClockOut(User $user): string
    {
        // Safely get attendance collection
        $attendance = $user->attendance ?? collect();
        $attendanceRecord = $attendance->first();

        if (!$attendanceRecord || !$attendanceRecord->clock_out) {
            if ($attendanceRecord && $attendanceRecord->clock_in) {
                return view('partials.backend.attendance.clock-out-btn', [
                    'userId' => $user->id,
                    'userName' => $user->first_name . ' ' . $user->last_name,
                ])->render();
            }
            return '-';
        }

        $clockOutTime = Carbon::parse($attendanceRecord->clock_out)->format('h:i A');
        $isEarly = $this->isEarlyCheckOut($attendanceRecord->clock_out);

        return view('partials.backend.attendance.clock-out-time', [
            'time' => $clockOutTime,
            'isEarly' => $isEarly,
        ])->render();
    }

    /**
     * Format attendance status
     */
    private function formatStatus(User $user): string
    {
        // Safely get attendance collection
        $attendance = $user->attendance ?? collect();
        $attendanceRecord = $attendance->first();
        $status = $attendanceRecord?->status ?? 'absent';

        $statusConfig = [
            'present' => ['color' => 'success', 'icon' => 'check-circle', 'label' => 'Present'],
            'absent' => ['color' => 'danger', 'icon' => 'x-circle', 'label' => 'Absent'],
            'late' => ['color' => 'warning', 'icon' => 'clock-history', 'label' => 'Late'],
            'half-day' => ['color' => 'info', 'icon' => 'clock-half', 'label' => 'Half Day'],
            'on_leave' => ['color' => 'secondary', 'icon' => 'calendar3', 'label' => 'On Leave'],
        ];

        $config = $statusConfig[$status] ?? $statusConfig['absent'];

        return view('partials.backend.attendance.status-badge', [
            'color' => $config['color'],
            'icon' => $config['icon'],
            'label' => $config['label'],
        ])->render();
    }

    /**
     * Calculate hours worked
     */
    private function calculateHoursWorked(User $user): string
    {
        // Safely get attendance collection
        $attendance = $user->attendance ?? collect();
        $attendanceRecord = $attendance->first();

        if (!$attendanceRecord || !$attendanceRecord->clock_in || !$attendanceRecord->clock_out) {
            return '-';
        }

        $start = Carbon::parse($attendanceRecord->clock_in);
        $end = Carbon::parse($attendanceRecord->clock_out);
        $hours = $start->diffInHours($end);
        $minutes = $start->diffInMinutes($end) % 60;

        return sprintf('%d:%02d', $hours, $minutes);
    }

    /**
     * Format action buttons
     */
    private function formatActions(User $user): string
    {
        // Safely get attendance collection
        $attendance = $user->attendance ?? collect();
        $attendanceRecord = $attendance->first();

        return view('partials.backend.attendance.actions', [
            'userId' => $user->id,
            'attendanceId' => $attendanceRecord?->id,
            'userName' => $user->first_name . ' ' . $user->last_name,
            'hasAttendance' => !is_null($attendanceRecord),
        ])->render();
    }

    /**
     * Check if clock-in is late
     */
    private function isLateCheckIn(string $clockInTime): bool
    {
        $expectedStart = Carbon::createFromTime(9, 0); // 9:00 AM
        $actualTime = Carbon::parse($clockInTime);

        return $actualTime->gt($expectedStart->addMinutes(15)); // Late after 9:15 AM
    }

    /**
     * Check if clock-out is early
     */
    private function isEarlyCheckOut(string $clockOutTime): bool
    {
        $expectedEnd = Carbon::createFromTime(17, 0); // 5:00 PM
        $actualTime = Carbon::parse($clockOutTime);

        return $actualTime->lt($expectedEnd->subMinutes(30)); // Early before 4:30 PM
    }

    /**
     * Get consistent avatar background color based on user ID
     */
    private function getAvatarBackgroundColor(int $userId): string
    {
        $colors = [
            '6366F1', // Indigo
            '8B5CF6', // Violet
            'EC4899', // Pink
            '10B981', // Emerald
            'F59E0B', // Amber
            'EF4444', // Red
            '3B82F6', // Blue
            '14B8A6', // Teal
        ];

        return $colors[$userId % count($colors)];
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $this->validateAttendanceRequest($request);
            $date = $validated['date'];
            $processedRecords = [];

            foreach ($validated['attendance'] as $attendanceData) {
                $processedRecords[] = $this->processAttendanceRecord($date, $attendanceData);
            }

            return response()->json([
                'success' => true,
                'message' => 'Attendance marked successfully.',
                'data' => $processedRecords,
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark attendance.',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred',
            ], 500);
        }
    }

    /**
     * Validate attendance request
     */
    private function validateAttendanceRequest(Request $request): array
    {
        return $request->validate([
            'date' => 'required|date|date_format:Y-m-d',
            'attendance' => 'required|array|min:1',
            'attendance.*.id' => 'required|exists:users,id',
            'attendance.*.clockIn' => 'nullable|date_format:H:i|date_format:h:i A',
            'attendance.*.clockOut' => 'nullable|date_format:H:i|date_format:h:i A',
            'attendance.*.status' => 'required|in:present,absent,late,half_day,on_leave',
            'attendance.*.mode' => 'nullable|in:manual,auto,qr,biometric,mobile',
            'attendance.*.remarks' => 'nullable|string|max:500',
            'attendance.*.location' => 'nullable|json',
            'attendance.*.device_info' => 'nullable|string|max:255',
        ]);
    }

    /**
     * Process individual attendance record
     */
    private function processAttendanceRecord(string $date, array $data): Attendance
    {
        $attendance = Attendance::firstOrNew([
            'user_id' => $data['id'],
            'attendance_date' => $date,
        ]);

        // Update clock in if provided
        if (!empty($data['clockIn'])) {
            $attendance->clock_in = $this->parseTime($data['clockIn'], $date);
        }

        // Update clock out if provided
        if (!empty($data['clockOut'])) {
            $attendance->clock_out = $this->parseTime($data['clockOut'], $date);
        }

        // Determine status automatically if not explicitly set
        $status = $data['status'] ?? $this->determineStatus(
            $attendance->clock_in,
            $attendance->clock_out
        );

        $attendance->status = $status;
        $attendance->mode = $data['mode'] ?? 'manual';
        $attendance->remarks = $data['remarks'] ?? null;
        $attendance->save();

        return $attendance;
    }

    /**
     * Parse time string with date
     */
    private function parseTime(?string $time, string $date): ?string
    {
        if (!$time) {
            return null;
        }

        try {
            return Carbon::createFromFormat('h:i A', $time)
                ->setDateFrom(Carbon::parse($date))
                ->format('Y-m-d H:i:s');
        } catch (\Exception $e) {
            // Try 24-hour format
            return Carbon::createFromFormat('H:i', $time)
                ->setDateFrom(Carbon::parse($date))
                ->format('Y-m-d H:i:s');
        }
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
            return 'present'; // Still working
        }

        if ($clockIn && $clockOut) {
            $start = Carbon::parse($clockIn);
            $end = Carbon::parse($clockOut);

            // Check if it's a half day (less than 4 hours)
            if ($end->diffInHours($start) < 4) {
                return 'half_day';
            }

            // Check if late (after 9:15 AM)
            $lateThreshold = Carbon::createFromTime(9, 15);
            if ($start->gt($lateThreshold)) {
                return 'late';
            }

            return 'present';
        }

        return 'absent';
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'clock_in' => 'nullable|date_format:h:i A|date_format:H:i',
                'clock_out' => 'nullable|date_format:h:i A|date_format:H:i',
                'status' => 'required|in:present,absent,late,half_day,on_leave',
                'remarks' => 'nullable|string|max:500',
                'mode' => 'nullable|in:manual,auto,qr,biometric,mobile',
            ]);

            $attendance = Attendance::findOrFail($id);

            $attendance->clock_in = $this->parseTime($validated['clock_in'] ?? null, $attendance->attendance_date);
            $attendance->clock_out = $this->parseTime($validated['clock_out'] ?? null, $attendance->attendance_date);
            $attendance->status = $validated['status'];
            $attendance->remarks = $validated['remarks'] ?? null;
            $attendance->mode = $validated['mode'] ?? $attendance->mode;
            $attendance->save();

            return response()->json([
                'success' => true,
                'message' => 'Attendance updated successfully.',
                'data' => $attendance->fresh(),
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update attendance.',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred',
            ], 500);
        }
    }

    /**
     * Bulk update attendance
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'date' => 'required|date|date_format:Y-m-d',
                'user_ids' => 'required|array|min:1',
                'user_ids.*' => 'exists:users,id',
                'status' => 'required|in:present,absent,late,half_day,on_leave',
                'remarks' => 'nullable|string|max:500',
            ]);

            $processedCount = 0;

            foreach ($validated['user_ids'] as $userId) {
                $attendance = Attendance::updateOrCreate(
                    [
                        'user_id' => $userId,
                        'attendance_date' => $validated['date'],
                    ],
                    [
                        'status' => $validated['status'],
                        'remarks' => $validated['remarks'] ?? null,
                        'mode' => 'bulk',
                    ]
                );

                if ($attendance->wasRecentlyCreated || $attendance->wasChanged()) {
                    $processedCount++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Attendance updated for {$processedCount} employees.",
                'count' => $processedCount,
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to perform bulk update.',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred',
            ], 500);
        }
    }

    /**
     * Get attendance statistics
     */
    public function stats(Request $request): JsonResponse
    {
        try {
            $date = $request->input('date', now()->toDateString());

            $totalEmployees = User::where('is_active', true)->count();

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

            return response()->json([
                'success' => true,
                'data' => [
                    'total_employees' => $totalEmployees,
                    'present_count' => $presentCount,
                    'absent_count' => $absentCount,
                    'late_count' => $lateCount,
                    'on_leave_count' => $onLeaveCount,
                    'attendance_rate' => $attendanceRate,
                    'date' => $date,
                ],
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance statistics.',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred',
            ], 500);
        }
    }

    /**
     * Get recent attendance activities
     */
    public function activities(Request $request): JsonResponse
    {
        try {
            $limit = $request->input('limit', 10);

            $activities = Attendance::with('user:id,first_name,last_name')
                ->latest()
                ->limit($limit)
                ->get()
                ->map(function ($attendance) {
                    return [
                        'id' => $attendance->id,
                        'employee_name' => $attendance->user->first_name . ' ' . $attendance->user->last_name,
                        'action' => $attendance->clock_out ? 'clock_out' : 'clock_in',
                        'time' => $attendance->clock_out
                            ? Carbon::parse($attendance->clock_out)->format('h:i A')
                            : Carbon::parse($attendance->clock_in)->format('h:i A'),
                        'status' => $attendance->status,
                        'created_at' => $attendance->created_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $activities,
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recent activities.',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred',
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $attendance = Attendance::findOrFail($id);

            $attendance->delete();

            return response()->json([
                'success' => true,
                'message' => 'Attendance record deleted successfully.',
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete attendance record.',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred',
            ], 500);
        }
    }
}