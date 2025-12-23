@props(['row'])
<div class="d-flex gap-1 justify-content-center">
    <button class="btn btn-sm btn-outline-info view-btn" data-id="{{ $row->id }}" title="View">
        <i class="bi bi-eye"></i>
    </button>
    <button class="btn btn-sm btn-outline-warning edit-btn" data-id="{{ $row->id }}" title="Edit">
        <i class="bi bi-pencil"></i>
    </button>
    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="{{ $row->id }}" title="Delete">
        <i class="bi bi-trash"></i>
    </button>
</div>