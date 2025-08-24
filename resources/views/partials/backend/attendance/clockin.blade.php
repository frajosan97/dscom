@if (isset($row->attendance->clock_in_display))
    <span class="text-success fw-semibold">
        <i class="bi bi-clock"></i> {{ $row->attendance->clock_in_display }}
    </span>
@else
    <button 
        class="btn btn-sm btn-outline-success d-flex align-items-center gap-1 clock-in-btn"
        data-id="{{ $row->id }}"
    >
        <i class="bi bi-check-circle"></i>
        <span>Clock In</span>
    </button>
@endif
