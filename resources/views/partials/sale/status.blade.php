@switch($row->status)
@case('pending')
<span class="badge bg-danger"><i class="bi bi-hourglass-split me-1"></i> Pending</span>
@break
@case('confirmed')
<span class="badge bg-primary"><i class="bi bi-check-circle me-1"></i> Confirmed</span>
@break
@case('processing')
<span class="badge bg-info"><i class="bi bi-gear-wide-connected me-1"></i> Processing</span>
@break
@case('shipped')
<span class="badge bg-warning text-dark"><i class="bi bi-truck me-1"></i> Shipped</span>
@break
@case('delivered')
<span class="badge bg-success"><i class="bi bi-check2-all me-1"></i> Delivered</span>
@break
@case('cancelled')
<span class="badge bg-danger"><i class="bi bi-x-circle me-1"></i> Cancelled</span>
@break
@case('refunded')
<span class="badge bg-info"><i class="bi bi-arrow-counterclockwise me-1"></i> Refunded</span>
@break
@case('partially_refunded')
<span class="badge bg-info"><i class="bi bi-arrow-counterclockwise me-1"></i> Partially Refunded</span>
@break
@case('on_hold')
<span class="badge bg-warning text-dark"><i class="bi bi-pause-circle me-1"></i> On Hold</span>
@break
@case('failed')
<span class="badge bg-danger"><i class="bi bi-exclamation-octagon me-1"></i> Failed</span>
@break
@case('completed')
<span class="badge bg-success"><i class="bi bi-check2-circle me-1"></i> Completed</span>
@break
@default
<span class="badge bg-primary"><i class="bi bi-question-circle me-1"></i> Unknown</span>
@endswitch