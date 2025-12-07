<?php

namespace App\Models\Erp\Hrm;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Erp\Finance\Transaction;
use App\Models\User;

class SalaryPayment extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'salary_payments';

    protected $fillable = [
        'salary_id',
        'transaction_id',
        'amount',
        'payment_date',
        'payment_method',
        'reference_no',
        'notes',
        'paid_by',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
        'verified_at' => 'datetime',
    ];

    // Payment method constants
    const METHOD_CASH = 'cash';
    const METHOD_BANK_TRANSFER = 'bank_transfer';
    const METHOD_CHEQUE = 'cheque';
    const METHOD_ONLINE = 'online';
    const METHOD_MOBILE = 'mobile';

    public static function getPaymentMethods()
    {
        return [
            self::METHOD_CASH,
            self::METHOD_BANK_TRANSFER,
            self::METHOD_CHEQUE,
            self::METHOD_ONLINE,
            self::METHOD_MOBILE,
        ];
    }

    // Relationships
    public function salary()
    {
        return $this->belongsTo(Salary::class);
    }

    // public function transaction()
    // {
    //     return $this->belongsTo(Transaction::class);
    // }

    public function paidByUser()
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    public function verifiedByUser()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // Scopes
    public function scopeByDate($query, $date)
    {
        return $query->where('payment_date', $date);
    }

    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('payment_date', [$startDate, $endDate]);
    }

    public function scopeByMethod($query, $method)
    {
        return $query->where('payment_method', $method);
    }

    // Methods
    public function markAsVerified($userId)
    {
        $this->update([
            'verified_by' => $userId,
            'verified_at' => now(),
        ]);
    }

    public function isVerified()
    {
        return !is_null($this->verified_at);
    }
}