@props(['category'])
<div class="btn-group float-end text-nowrap gap-2">
    <button class="btn btn-sm btn-outline-primary rounded edit-btn" data-id="{{ $category->id }}">
        <i class="bi bi-pen me-1"></i> Edit
    </button>
    <button class="btn btn-sm btn-outline-danger rounded delete-btn" data-id="{{ $category->id }}">
        <i class="bi bi-trash me-1"></i> Delete
    </button>
</div>