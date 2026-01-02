@if (!empty($row->attendanceForDate?->clock_in))
    <span class="badge text-bg-secondary d-inline-flex align-items-center gap-1">
        <i class="bi bi-clock"></i>
        <div class="ms-1 text-start">
            {{ date('d/m/y', strtotime($row->attendanceForDate?->clock_in)) }} <br>
            <small>{{ date('h:i A', strtotime($row->attendanceForDate?->clock_in)) }}</small>
        </div>
    </span>
@else
    <button
        type="button"
        class="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 clock-in-btn"
        data-id="{{ $row->id }}"
        data-name="{{ $row->name }}"
    >
        <i class="bi bi-check-circle"></i>
        <span>Clock In</span>
    </button>
@endif
