<div class="btn-group btn-group-sm text-nowrap text-end float-end gap-2" role="group">
    <a class="rounded btn btn-outline-primary" href="{{ route('employee.show', $row->id) }}">
        <i class="bi bi-eye"></i>
    </a>
    <button class="rounded btn btn-sm btn-outline-danger delete-btn" data-id="{{ $row->id }}">
        <i class="bi bi-trash"></i>
    </button>
</div>