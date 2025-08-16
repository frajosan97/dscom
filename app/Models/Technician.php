<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Technician extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'specialization',
        'skills',
        'certification',
        'experience_years',
        'service_area',
        'is_available',
        'hourly_rate',
        'notes'
    ];

    protected $casts = [
        'skills' => 'array',
        'is_available' => 'boolean',
    ];

    /**
     * Get the user associated with the technician.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the technician's completed jobs
     */
    public function completedJobs()
    {
        return $this->jobs()->where('status', 'completed');
    }

    /**
     * Get the technician's active jobs
     */
    public function activeJobs()
    {
        return $this->jobs()->where('status', 'in_progress');
    }
}
