@props(['isActive'])
@if($isActive)
    <span class="badge bg-success"><i class="bi bi-check-circle"></i> Active</span>
@else
    <span class="badge bg-danger"><i class="bi bi-x-circle"></i> Inactive</span>
@endif