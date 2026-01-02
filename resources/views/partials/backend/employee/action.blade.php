<div class="btn-group gap-2">
    <button class="btn btn-sm btn-outline-primary rounded edit-btn" data-id="{{ $row->id }}">
        <i class="bi bi-pen"></i>
    </button>
    <button class="btn btn-sm btn-outline-info rounded view-btn" data-id="{{ $row->id }}">
        <i class="bi bi-eye"></i>
    </button>
    <button class="btn btn-sm btn-outline-danger rounded delete-btn" data-id="{{ $row->id }}">
        <i class="bi bi-trash"></i>
    </button>
</div>