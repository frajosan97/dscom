@props(['row'])
<div class="btn-group float-end text-nowrap gap-2">
    <a href="{{ route('customers.show', $row->id) }}" class="btn btn-sm btn-outline-primary rounded edit-btn"
        data-id="{{ $row->id }}">
        <i class="bi bi-eye"></i>
    </a>
    <button class="btn btn-sm btn-outline-danger rounded delete-btn" data-id="{{ $row->id }}">
        <i class="bi bi-trash"></i>
    </button>
</div>