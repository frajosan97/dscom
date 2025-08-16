<!-- return ptoduct primary image -->
@if($row->defaultImage?->image_path)
<img src="{{ asset('/storage/'.$row->defaultImage->image_path) }}" alt="" style="max-width: 50px; max-height: 50px;" class="card-img-top">
@else
<img src="{{ asset('/storage/images/others/no-image.jpg') }}" alt="" style="max-width: 50px; max-height: 50px;" class="card-img-top">
@endif