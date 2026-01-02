<div>
    <div class="fw-semibold">{{ $row?->month }} {{ $row?->year }}</div>
    <small class="text-muted">
        <i class="bi bi-calendar-check me-1"></i>
        {{ $row?->days_present?? 0 }}/{{ $row?->total_days?? 26 }} days
    </small>
</div>