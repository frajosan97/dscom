<?php

namespace App\Models\Erp\Hrm;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SalaryPayment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'salary_id',
        'amount',
        'payment_date',
        'payment_method',
        'reference_no',
        'notes',
        'paid_by',
        'verified_by',
        'verified_at'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
        'verified_at' => 'datetime'
    ];

    // Relationships
    public function salary()
    {
        return $this->belongsTo(Salary::class);
    }

    public function paidBy()
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // Scopes
    public function scopeVerified($query)
    {
        return $query->whereNotNull('verified_at');
    }

    public function scopeUnverified($query)
    {
        return $query->whereNull('verified_at');
    }
}