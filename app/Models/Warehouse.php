<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Warehouse extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'branch_id',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'latitude',
        'longitude',
        'contact_person',
        'contact_phone',
        'contact_email',
        'contact_position',
        'opening_time',
        'closing_time',
        'working_days',
        'is_primary',
        'is_active',
        'notes',
        'metadata'
    ];

    protected $casts = [
        'working_days' => 'array',
        'metadata' => 'array',
        'is_primary' => 'boolean',
        'is_active' => 'boolean',
        'opening_time' => 'datetime:H:i',
        'closing_time' => 'datetime:H:i',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
