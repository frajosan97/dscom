<div class="btn-group float-end text-nowrap gap-2">
    <button class="btn btn-sm btn-outline-info rounded items-btn" data-id="{{ $row->id }}">
        <i class="bi bi-images"></i>
    </button>
    <button class="btn btn-sm btn-outline-primary rounded edit-btn" data-id="{{ $row->id }}">
        <i class="bi bi-pen"></i>
    </button>
    <button class="btn btn-sm btn-outline-danger rounded delete-btn" data-id="{{ $row->id }}">
        <i class="bi bi-trash"></i>
    </button>
</div>