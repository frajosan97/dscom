@if (isset($row->attendance->clock_in_display))
    @if ($row->attendance->clock_out_display)
        <span class="text-success fw-semibold">
            <i class="bi bi-clock"></i> {{ $row->attendance->clock_out_display }}
        </span>
    @else
        <button 
            class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 clock-out-btn"
            data-id="{{ $row->id }}"
        >
            <i class="bi bi-check-circle"></i>
            <span>Clock Out</span>
        </button>
    @endif
@else
    <span class="text-danger fw-semibold">
        <i class="bi bi-exclamation-circle"></i> Clock In First
    </span>
@endif
