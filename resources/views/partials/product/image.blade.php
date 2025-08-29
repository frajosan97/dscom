<!-- return ptoduct primary image -->
@if($row->defaultImage?->image_path)
    <img src="{{ asset('/storage/' . $row->defaultImage->image_path) }}" alt="" alt="" class="img-fluid img-thumbnail"
        style="max-width: 30px; object-fit: cover;" />
@else
    <img src="{{ asset('/storage/images/others/no-image.jpg') }}" alt="" alt="" class="img-fluid img-thumbnail"
        style="max-width: 30px; object-fit: cover;" />
@endif