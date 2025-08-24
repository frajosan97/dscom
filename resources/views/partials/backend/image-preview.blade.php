@if($row->image)
    <img src="{{ asset($row->image) }}" alt="Image Preview" class="img-thumbnail" style="max-width: 40px; max-height: 40px;">
@else
    No Image
@endif