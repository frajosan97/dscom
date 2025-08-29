@props(['row'])
<div class="btn-group float-end text-nowrap gap-2">
    <!-- View/See Details -->
    <a class="btn btn-sm btn-outline-primary rounded-0 view-btn" href="{{ route('sales.show', $row->id) }}">
        <i class="bi bi-eye"></i>
    </a>

    <!-- Return -->
    <button class="btn btn-sm btn-outline-warning rounded-0 return-btn" data-id="{{ $row->id }}" title="Return">
        <i class="bi bi-arrow-return-left"></i>
    </button>

    <!-- Delete/Remove -->
    <button class="btn btn-sm btn-outline-danger rounded-0 delete-btn" data-id="{{ $row->id }}" title="Delete">
        <i class="bi bi-trash"></i>
    </button>

    <!-- Print -->
    <button class="btn btn-sm btn-outline-secondary rounded-0 print-btn" data-data="{{ $row }}" title="Print">
        <i class="bi bi-printer"></i>
    </button>
</div>