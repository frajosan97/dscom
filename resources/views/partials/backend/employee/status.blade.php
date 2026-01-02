@php
    $statusIcon = $row->status == 'active' ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger';
    $verifiedIcon = $row->email_verified_at ? 'bi-patch-check-fill text-info' : 'bi-patch-exclamation-fill text-warning';
    
    $statusTitle = $row->status == 'active' ? 'Active User' : 'Inactive User';
    $verifiedTitle = $row->email_verified_at ? 'Verified' : 'Not Verified';
@endphp

<span class="badge text-bg-light border d-flex align-items-center gap-2 p-2">
    <span data-bs-toggle="tooltip" title="{{ $statusTitle }}">
        <i class="bi {{ $statusIcon }} fs-6"></i> {{ $statusTitle }}
    </span>
    
    <span class="vr opacity-50"></span>
    
    <span data-bs-toggle="tooltip" title="{{ $verifiedTitle }}">
        <i class="bi {{ $verifiedIcon }} fs-6"></i> {{ $verifiedTitle }}
    </span>
</span>