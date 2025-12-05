<div class="btn-group float-end text-end gap-2">
    <a class="btn btn-sm p-0 px-1 btn-outline-primary text-nowrap rounded-0"
        href="{{ route('product.edit', $row->id) }}">
        <i class="bi bi-pencil"></i>
    </a>
    <a class="btn btn-sm p-0 px-1 btn-outline-primary text-nowrap rounded-0"
        href="{{ route('product.edit', $row->id) }}">
        <i class="bi bi-eye"></i>
    </a>
    <button class="btn btn-sm p-0 px-1 btn-outline-danger text-nowrap rounded-0" data-id="{{ $row->id }}">
        <i class="bi bi-trash"></i>
    </button>
</div>