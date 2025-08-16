@if($row->is_active)
    <span class="badge bg-success">Active</span>
@else
    <span class="badge bg-danger">Inactive</span>
@endif