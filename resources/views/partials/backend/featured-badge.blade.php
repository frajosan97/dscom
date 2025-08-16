@props(['isFeatured'])
@if($isFeatured)
    <span class="badge bg-primary"><i class="bi bi-star"></i> Featured</span>
@else
    N/A
@endif