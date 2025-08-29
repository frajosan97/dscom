@php
    $statusConfig = [
        'pending' => ['variant' => 'secondary', 'label' => 'Pending'],
        'diagnosis' => ['variant' => 'info', 'label' => 'Diagnosis'],
        'quoted' => ['variant' => 'warning', 'label' => 'Quoted'],
        'approved' => ['variant' => 'primary', 'label' => 'Approved'],
        'repairing' => ['variant' => 'info', 'label' => 'Repairing'],
        'awaiting_parts' => ['variant' => 'warning', 'label' => 'Awaiting Parts'],
        'awaiting_customer_response' => ['variant' => 'warning', 'label' => 'Awaiting Customer'],
        'completed' => ['variant' => 'success', 'label' => 'Completed'],
        'delivered' => ['variant' => 'success', 'label' => 'Delivered'],
        'cancelled' => ['variant' => 'danger', 'label' => 'Cancelled'],
        'rejected' => ['variant' => 'danger', 'label' => 'Rejected'],
    ];
@endphp

<span class="badge bg-{{ $statusConfig[$row->status]['variant'] ?? 'secondary' }} text-capitalize">
    {{ $statusConfig[$row->status]['label'] ?? $row->status }}
</span>