<div class="btn-group gap-2 w-100 text-end">
    <a class="btn btn-sm btn-outline-secondary text-nowrap rounded" href="{{ route('sales.show', $row->id) }}">
        <i class="bi bi-briefcase me-1"></i> View
    </a>
    <a class="btn btn-sm btn-outline-success text-nowrap rounded" href="{{ route('sales.show', $row->id) }}">
        <i class="bi bi-briefcase me-1"></i> Invoice
    </a>
</div>