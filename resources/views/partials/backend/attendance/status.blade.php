@if(isset($row->attendance->status))
    @switch($row->attendance->status)
        @case('present')
            <span class="text-success fw-semibold text-capitalize">
                <i class="bi bi-check-circle"></i> present
            </span>
            @break
        @default
            <span class="text-danger fw-semibold text-capitalize">
                <i class="bi bi-x-circle"></i> absent
            </span>
    @endswitch
@endif