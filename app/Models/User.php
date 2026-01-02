<?php

namespace App\Models;

use App\Models\Erp\Hrm\Attendance;
use App\Models\Erp\Hrm\Salary;
use GuzzleHttp\Psr7\ServerRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasRoles, HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'email',
        'email_verified_at',
        'password',
        'username',
        'first_name',
        'last_name',
        'gender',
        'date_of_birth',
        'phone',
        'alternate_phone',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'qualification',
        'designation',
        'salary_type',
        'salary',
        'branch_id',
        'department_id',
        'blood_group',
        'opening_balance',
        'balance',
        'ending_date',
        'profile_image',
        'id_card',
        'document',
        'description',
        'status',
        'latitude',
        'longitude',
        'is_active',
        'is_verified',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'date_of_birth' => 'date',
        'salary' => 'decimal:2',
        'opening_balance' => 'decimal:2',
        'balance' => 'decimal:2',
        'ending_date' => 'date',
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
        'last_login_at' => 'datetime',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    protected $appends = ['profile_image_url'];

    // Add this accessor method for profile image URL with fallback
    public function getProfileImageUrlAttribute()
    {
        // Check if profile_image field exists and is not empty
        if (!empty($this->profile_image)) {
            try {
                // dd(asset('/storage/'.$this->profile_image));
                // Check if the file exists in storage
                if (asset('/storage/' . $this->profile_image)) {
                    return Storage::url($this->profile_image);
                }

                // If it's a full URL, return as is
                if (filter_var($this->profile_image, FILTER_VALIDATE_URL)) {
                    return $this->profile_image;
                }

                // If it's a relative path that doesn't exist in storage, fall through
            } catch (\Exception $e) {
                // Do nothing
            }
        }

        // Return fallback image based on gender or default
        return $this->getFallbackImage();
    }

    // Helper method to get fallback image
    protected function getFallbackImage()
    {
        // You can customize fallback images based on gender
        $fallbackImages = [
            'male' => asset('storage/images/avatar/avatar.png'),
            'female' => asset('storage/images/avatar/avatar.png'),
            'default' => asset('storage/images/avatar/avatar.png'),
        ];

        // Check if gender-specific fallback exists
        if (isset($this->gender) && array_key_exists(strtolower($this->gender), $fallbackImages)) {
            return $fallbackImages[strtolower($this->gender)];
        }

        // Fallback based on initials for avatar generation
        return $this->generateInitialsAvatar();
    }

    // Generate avatar with initials as fallback
    protected function generateInitialsAvatar()
    {
        $initials = '';

        if (!empty($this->first_name)) {
            $initials .= strtoupper(substr($this->first_name, 0, 1));
        }

        if (!empty($this->last_name)) {
            $initials .= strtoupper(substr($this->last_name, 0, 1));
        }

        // If no initials from name, use username or email
        if (empty($initials)) {
            if (!empty($this->username)) {
                $initials = strtoupper(substr($this->username, 0, 2));
            } elseif (!empty($this->email)) {
                $initials = strtoupper(substr($this->email, 0, 2));
            } else {
                $initials = 'U'; // Default for User
            }
        }

        // Create a simple initials-based avatar URL using a service or local generation
        // Option 1: Use UI Avatar service
        $backgroundColor = $this->getAvatarBackgroundColor();
        return "https://ui-avatars.com/api/?name=" . urlencode($initials) .
            "&color=FFFFFF&background=" . $backgroundColor .
            "&bold=true&size=256";

        // Option 2: Use local generation (you would need to implement this)
        // return route('avatar.initials', ['initials' => $initials, 'id' => $this->id]);
    }

    // Helper to get consistent background color based on user ID
    protected function getAvatarBackgroundColor()
    {
        $colors = [
            '6366F1', // Indigo
            '8B5CF6', // Violet
            'EC4899', // Pink
            '10B981', // Emerald
            'F59E0B', // Amber
            'EF4444', // Red
            '3B82F6', // Blue
            '14B8A6', // Teal
        ];

        // Use user ID to pick a consistent color for each user
        $index = $this->id ? ($this->id % count($colors)) : 0;
        return $colors[$index];
    }

    // You might also want this helper method to check if image exists
    public function hasProfileImage()
    {
        if (empty($this->profile_image)) {
            return false;
        }

        try {
            if (filter_var($this->profile_image, FILTER_VALIDATE_URL)) {
                // For URLs, you might want to do a head request to check
                // This is optional as it could be slow
                return true;
            }

            return Storage::exists($this->profile_image);
        } catch (\Exception $e) {
            return false;
        }
    }

    // Relationships
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function technician(): HasOne
    {
        return $this->hasOne(Technician::class);
    }

    public function managedDepartments(): HasMany
    {
        return $this->hasMany(Department::class, 'user_id');
    }

    public function sales(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function salary(): HasMany
    {
        return $this->hasMany(Salary::class, 'user_id');
    }

    // For customers
    public function orders(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function payments(): BelongsTo
    {
        return $this->belongsTo(OrderPayment::class);
    }

    public function services(): BelongsTo
    {
        return $this->belongsTo(RepairOrder::class);
    }

    public function attendance(): BelongsTo
    {
        return $this->belongsTo(Attendance::class, 'user_id');
    }

    public function attendanceForDate()
    {
        return $this->hasOne(Attendance::class);
    }
}