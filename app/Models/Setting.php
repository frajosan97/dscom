<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'options',
        'description',
        'is_public',
        'is_encrypted',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'is_encrypted' => 'boolean',
        'options' => 'array',
    ];

    // No direct relationships for settings
    // They are system-wide configuration values

    /**
     * Get setting value with decryption if needed
     */
    public function getValueAttribute($value)
    {
        if ($this->is_encrypted && !empty($value)) {
            return decrypt($value);
        }
        return $value;
    }

    /**
     * Set setting value with encryption if needed
     */
    public function setValueAttribute($value)
    {
        if ($this->is_encrypted && !empty($value)) {
            $this->attributes['value'] = encrypt($value);
        } else {
            $this->attributes['value'] = $value;
        }
    }
}