<div class="hours-worked">
    @php
        $clockIn = $row->attendanceForDate?->clock_in;
        $clockOut = $row->attendanceForDate?->clock_out;
    @endphp

    @if($clockIn && $clockOut)
        @php
            $hours = \Carbon\Carbon::parse($clockOut)
                ->diff(\Carbon\Carbon::parse($clockIn))
                ->format('%H:%I');
        @endphp
        {{ $hours }} hours
    @elseif($clockIn)
        <span title="Only clocked in">In: {{ \Carbon\Carbon::parse($clockIn)->format('h:i A') }}</span>
    @elseif($clockOut)
        <span class="text-danger" title="Missing clock in">⚠️ Out only</span>
    @else
        <span class="text-muted">-</span>
    @endif
</div>