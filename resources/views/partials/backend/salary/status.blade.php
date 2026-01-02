@php
    $statusColors = [
        'pending' => ['warning', '⏳'],
        'processing' => ['info', '⚙️'],
        'paid' => ['success', '✔️​'],
        'rejected' => ['danger', '❌']
    ];
    
    [$color, $icon] = $statusColors[$row?->status ?? 'pending'] ?? $statusColors['pending'];
@endphp

<div class="d-flex align-items-center gap-2">
    <span class="badge bg-{{ $color }} bg-opacity-50 d-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-sm">
        <span class="fs-6">{{ $icon }}</span>
        <span class="text-capitalize fw-semibold">{{ $row?->status }}</span>
    </span>
</div>