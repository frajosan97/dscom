<div class="btn-group btn-group-sm text-nowrap text-end float-end gap-2" role="group">
    <button class="rounded btn btn-sm btn-outline-primary edit-btn" data-employee="{{ $row }}">
        <i class="bi bi-eye"></i>
    </button>
    <button class="rounded btn btn-sm btn-outline-danger delete-btn" data-id="{{ $row->id }}">
        <i class="bi bi-trash"></i>
    </button>
</div>