<!-- priority can be low, medium and high -->
@if ($row->priority == 'low')
    <span class="badge bg-success">{{ $row->priority }}</span>
@elseif ($row->priority == 'medium')
    <span class="badge bg-warning">{{ $row->priority }}</span>
@else
    <span class="badge bg-danger">{{ $row->priority }}</span>
@endif