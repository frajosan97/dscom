<div class="btn-group btn-group-sm text-nowrap float-end gap-2" role="group">
    <button class="btn btn-sm btn-outline-primary rounded text-nowrap edit-btn" data-id="{{ $row->id }}">
        <i class="bi bi-pen me-1"></i>Edit
    </button>
    <button class="btn btn-sm btn-outline-danger rounded text-nowrap delete-btn" data-id="{{ $row->id }}">
        <i class="bi bi-trash me-1"></i>Delete
    </button>
</div>