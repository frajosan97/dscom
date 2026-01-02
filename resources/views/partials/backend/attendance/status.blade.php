@if(isset($row?->attendanceForDate?->status))
    @switch($row->attendanceForDate->status)
        @case('present')
            <span class="text-success fw-semibold text-capitalize">
                <i class="bi bi-check-circle"></i> present
            </span>
            @break
        @case('late')
            <span class="text-warning fw-semibold text-capitalize">
                <i class="bi bi-clock-history"></i> late
            </span>
            @break
        @case('on_leave')
            <span class="text-info fw-semibold text-capitalize">
                <i class="bi bi-calendar3"></i> on leave
            </span>
            @break
        @case('half_day')
            <span class="text-success fw-semibold text-capitalize">
                <i class="bi bi-clock-half"></i> half day
            </span>
            @break
        @default
            <span class="text-danger fw-semibold text-capitalize">
                <i class="bi bi-x-circle"></i> absent
            </span>
    @endswitch
@else
    <span class="text-danger fw-semibold text-capitalize">
        <i class="bi bi-x-circle"></i> absent
    </span>
@endif