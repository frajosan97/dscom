@if (!empty($row->attendanceForDate?->clock_in))
    @if (!empty($row->attendanceForDate?->clock_out))
        <span class="badge text-bg-secondary d-inline-flex align-items-center gap-1">
            <i class="bi bi-clock"></i>
            <div class="ms-1 text-start">
                {{ date('d/m/y', strtotime($row->attendanceForDate?->clock_out)) }} <br>
                <small>{{ date('h:i A', strtotime($row->attendanceForDate?->clock_out)) }}</small>
            </div>
        </span>
    @else
        <button
            type="button"
            class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 clock-out-btn"
            data-id="{{ $row->id }}"
            data-name="{{ $row->name }}"
        >
            <i class="bi bi-check-circle"></i>
            <span>Clock Out</span>
        </button>
    @endif
@else
    <span class="badge text-bg-danger d-inline-flex align-items-center gap-1">
        <i class="bi bi-exclamation-circle"></i>
        <span>Clock In First</span>
    </span>
@endif
