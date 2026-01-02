<!-- please add all these buttons -->
<div class="btn-group gap-2">
    <button type="button" class="btn btn-sm btn-outline-info reset-btn rounded" data-id="{{ $row->id }}" data-name="{{ $row->name }}">
        <i class="bi bi-arrow-clockwise"></i>
    </button>
    <button type="button" class="btn btn-sm btn-outline-primary view-btn rounded" data-id="{{ $row->id }}" data-name="{{ $row->name }}">
        <i class="bi bi-eye"></i>
    </button>
    <button type="button" class="btn btn-sm btn-outline-warning edit-btn rounded" data-id="{{ $row->id }}" data-name="{{ $row->name }}">
        <i class="bi bi-pencil"></i>
    </button>
    <button type="button" class="btn btn-sm btn-outline-danger delete-btn rounded" data-id="{{ $row->id }}" data-name="{{ $row->name }}">
        <i class="bi bi-trash"></i>
    </button>
</div>