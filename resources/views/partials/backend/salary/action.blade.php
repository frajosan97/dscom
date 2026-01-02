<div class="btn-group btn-group-sm gap-2" role="group">
    <button class="btn rounded btn-outline-primary edit-btn" data-id="{{ $row?->id }}" title="Edit">
        <i class="bi bi-pencil"></i>
    </button>
    <button class="btn rounded btn-outline-info view-btn" data-id="{{ $row?->id }}" title="View">
        <i class="bi bi-eye"></i>
    </button>
    @if (!$row?->status==='paid')
    <button class="btn rounded btn-outline-success pay-btn" data-id="{{ $row?->id }}" 
        title="Mark Paid">
        <i class="bi bi-cash-coin"></i>
    </button>
    @endif
    <button class="btn rounded btn-outline-danger delete-btn" data-id="{{ $row?->id }}" title="Delete">
        <i class="bi bi-trash"></i>
    </button>
</div>