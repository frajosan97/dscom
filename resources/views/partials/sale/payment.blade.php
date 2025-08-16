@switch($row->payment_status)
@case('pending')
<span class="badge bg-danger"><i class="bi bi-hourglass-split me-1"></i> Pending</span>
@break
@case('paid')
<span class="badge bg-success"><i class="bi bi-currency-dollar me-1"></i> Paid</span>
@break
@case('failed')
<span class="badge bg-danger"><i class="bi bi-exclamation-octagon me-1"></i> Failed</span>
@break
@case('partially_paid')
<span class="badge bg-warning text-dark"><i class="bi bi-currency-exchange me-1"></i> Partially Paid</span>
@break
@case('refunded')
<span class="badge bg-info"><i class="bi bi-arrow-counterclockwise me-1"></i> Refunded</span>
@break
@default
<span class="badge bg-primary"><i class="bi bi-question-circle me-1"></i> Unknown</span>
@endswitch