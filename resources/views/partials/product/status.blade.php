<!-- return if is activem is featuredm is new, is best seller is featured -->
<?php
$isActive = $row->is_active;
$isFeatured = $row->is_featured;
$isNew = $row->is_new;
$isBestSeller = $row->is_best_seller;
$isOnSale = $row->is_on_sale;
?>

@if ($isActive)
<span class="badge bg-success">Active</span>
@else
<span class="badge bg-danger">Inactive</span>
@endif

@if ($isFeatured)
<span class="badge bg-info">Featured</span>
@endif

@if ($isNew)
<span class="badge bg-primary">New</span>
@endif

@if ($isBestSeller)
<span class="badge bg-warning">Best Seller</span>
@endif

@if ($isOnSale)
<span class="badge bg-danger">On Sale</span>
@endif