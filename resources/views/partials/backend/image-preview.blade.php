@props(['image'])
@if($image)
    <img src="{{ asset($image) }}" alt="Image Preview" class="img-thumbnail" style="max-width: 40px; max-height: 40px;">
@else
    No Image
@endif