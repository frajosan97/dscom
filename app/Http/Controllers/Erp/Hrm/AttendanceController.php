<?php

namespace App\Http\Controllers\Erp\Hrm;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;
use Yajra\DataTables\Facades\DataTables;

class AttendanceController extends Controller {
    /**
    * Display a listing of the resource.
    */

    public function index( Request $request ): Response|JsonResponse {
        try {
            // Handle DataTables request
            if ( $request->has( 'draw' ) ) {
                $query = User::with( [
                    'department:id,name', // Only select necessary fields
                    'attendance' => function ( $query ) use ( $request ) {
                        $query->whereDate( 'attendance_date', $request->date ?? now()->toDateString() );
                    }
                ] )->select( 'users.id', 'users.name', 'users.department_id' );

                return DataTables::eloquent( $query )
                ->addColumn( 'clockin', fn( $row ) => view( 'partials.backend.attendance.clockin', compact( 'row' ) ) )
                ->addColumn( 'clockout', fn( $row ) => view( 'partials.backend.attendance.clockout', compact( 'row' ) ) )
                ->addColumn( 'status', fn( $row ) => view( 'partials.backend.attendance.status', compact( 'row' ) ) )
                ->addColumn( 'action', fn( $row ) => view( 'partials.backend.attendance-actions', compact( 'row' ) ) )
                ->rawColumns( [ 'clockin', 'clockout', 'status', 'action' ] )
                ->make( true );
            }

            // Return Inertia response for regular page load
            return Inertia::render( 'Backend/ERP/HRM/Attendance' );
        } catch ( Throwable $e ) {
            return response()->json( [
                'success' => false,
                'message' => 'Failed to load attendance data',
                'error' => config( 'app.debug' ) ? $e->getMessage() : 'An error occurred'
            ], 500 );
        }
    }

    /**
    * Store a newly created resource in storage.
    */

    public function store( Request $request ): JsonResponse {
        try {
            $validated = $request->validate( [
                'date' => 'required|date',
                'attendance' => 'required|array',
                'attendance.*.id' => 'required|exists:users,id',
                'attendance.*.clockIn' => 'nullable|date_format:h:i A',
                'attendance.*.clockOut' => 'nullable|date_format:h:i A',
                'attendance.*.status' => 'required|in:present,absent,late,half-day',
            ] );

            $date = $validated[ 'date' ];
            $processedRecords = [];

            foreach ( $validated[ 'attendance' ] as $attendanceData ) {
                $userId = $attendanceData[ 'id' ];

                // Find existing attendance record for this user and date
                $attendance = Attendance::firstOrNew( [
                    'user_id' => $userId,
                    'attendance_date' => $date
                ] );

                // Update clock in if provided
                if ( !empty( $attendanceData[ 'clockIn' ] ) ) {
                    $attendance->clock_in = Carbon::createFromFormat( 'h:i A', $attendanceData[ 'clockIn' ] )
                    ->setDateFrom( Carbon::parse( $date ) )
                    ->format( 'Y-m-d H:i:s' );
                }

                // Update clock out if provided
                if ( !empty( $attendanceData[ 'clockOut' ] ) ) {
                    $attendance->clock_out = Carbon::createFromFormat( 'h:i A', $attendanceData[ 'clockOut' ] )
                    ->setDateFrom( Carbon::parse( $date ) )
                    ->format( 'Y-m-d H:i:s' );
                }

                // Update status
                $attendance->status = $attendanceData[ 'status' ];
                $attendance->mode = 'manual';
                $attendance->save();

                $processedRecords[] = $attendance;
            }

            return response()->json( [
                'success' => true,
                'message' => 'Attendance marked successfully.',
                'data' => $processedRecords
            ] );
        } catch ( Throwable $e ) {
            return response()->json( [
                'success' => false,
                'message' => 'Failed to mark attendance.',
                'error' => $e->getMessage(),
            ], 500 );
        }
    }

    /**
    * Update the specified resource in storage.
    */

    public function update( Request $request, string $id ): JsonResponse {
        try {
            $validated = $request->validate( [
                'clock_in' => 'nullable|date_format:h:i A',
                'clock_out' => 'nullable|date_format:h:i A',
                'status' => 'required|in:present,absent,late,half-day',
                'remarks' => 'nullable|string'
            ] );

            $attendance = Attendance::findOrFail( $id );

            if ( !empty( $validated[ 'clock_in' ] ) ) {
                $attendance->clock_in = Carbon::createFromFormat( 'h:i A', $validated[ 'clock_in' ] )
                ->setDateFrom( $attendance->attendance_date )
                ->format( 'Y-m-d H:i:s' );
            } else {
                $attendance->clock_in = null;
            }

            if ( !empty( $validated[ 'clock_out' ] ) ) {
                $attendance->clock_out = Carbon::createFromFormat( 'h:i A', $validated[ 'clock_out' ] )
                ->setDateFrom( $attendance->attendance_date )
                ->format( 'Y-m-d H:i:s' );
            } else {
                $attendance->clock_out = null;
            }

            $attendance->status = $validated[ 'status' ];
            $attendance->remarks = $validated[ 'remarks' ] ?? null;
            $attendance->save();

            return response()->json( [
                'success' => true,
                'message' => 'Attendance updated successfully.',
                'data' => $attendance
            ] );
        } catch ( Throwable $e ) {
            return response()->json( [
                'success' => false,
                'message' => 'Failed to update attendance.',
                'error' => $e->getMessage(),
            ], 500 );
        }
    }

    /**
    * Remove the specified resource from storage.
    */

    public function destroy( string $id ): JsonResponse {
        try {
            $attendance = Attendance::findOrFail( $id );
            $attendance->delete();

            return response()->json( [
                'success' => true,
                'message' => 'Attendance record deleted successfully.'
            ] );
        } catch ( Throwable $e ) {
            return response()->json( [
                'success' => false,
                'message' => 'Failed to delete attendance record.',
                'error' => $e->getMessage(),
            ], 500 );
        }
    }
}
