<div class="d-flex align-items-center">
    <div class="avatar-sm me-2">
        <div class="avatar-title bg-primary bg-opacity-10 rounded-circle px-1">
            <i class="bi bi-person fs-5 text-primary"></i>
        </div>
    </div>
    <div>
        <h6 class="mb-0">{{ $row?->user?->name }}</h6>
        <small class="text-muted">{{ $row?->user?->designation }}</small>
    </div>
</div>