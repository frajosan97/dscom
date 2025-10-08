<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasRoles, HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        // Authentication
        'email',
        'password',
        'username',

        // Personal Information
        'first_name',
        'last_name',
        'gender',
        'age',
        'birth_date',
        'date_of_birth',

        // Contact Information
        'phone',
        'alternate_phone',
        'address',
        'city',
        'state',
        'country',
        'postal_code',

        // Professional Information
        'qualification',
        'designation',
        'salary_type',
        'salary',
        'role',
        'branch_id',
        'department_id',

        // Medical Information
        'blood_group',

        // Financial Information
        'opening_balance',
        'balance',
        'ending_date',

        // Files & Documents
        'profile_image',
        'id_card',
        'document',

        // Additional Information
        'description',
        'status',

        // Location
        'latitude',
        'longitude',

        // Flags
        'is_active',
        'is_verified',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'birth_date' => 'date',
        'date_of_birth' => 'date',
        'ending_date' => 'date',
        'opening_balance' => 'decimal:2',
        'balance' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
        'last_login_at' => 'datetime',
    ];

    protected $appends = [
        'full_name',
        'profile_image_url',
        'computed_age',
    ];

    public function getProfileImageUrlAttribute(): ?string
    {
        if (!$this->profile_image) {
            return asset('images/default-avatar.png');
        }

        if (filter_var($this->profile_image, FILTER_VALIDATE_URL)) {
            return $this->profile_image;
        }

        return asset('storage/' . $this->profile_image);
    }

    public function getComputedAgeAttribute(): ?int
    {
        if (!$this->date_of_birth) {
            return null;
        }

        return Carbon::parse($this->date_of_birth)->age;
    }

    /**
     * Customer types constants
     */
    public const CUSTOMER_TYPE_RETAIL = 'retail';
    public const CUSTOMER_TYPE_WHOLESALE = 'wholesale';
    public const CUSTOMER_TYPE_CORPORATE = 'corporate';

    /**
     * Gender constants
     */
    public const GENDER_MALE = 'male';
    public const GENDER_FEMALE = 'female';
    public const GENDER_OTHER = 'other';
    public const GENDER_PREFER_NOT_TO_SAY = 'prefer_not_to_say';

    /**
     * Get the user's full name.
     *
     * @return string
     */
    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Get the URL to the user's avatar.
     *
     * @return string|null
     */
    public function getAvatarUrlAttribute()
    {
        if (!$this->avatar) {
            return null;
        }

        if (filter_var($this->avatar, FILTER_VALIDATE_URL)) {
            return $this->avatar;
        }

        return asset('storage/' . $this->avatar);
    }

    /**
     * Scope a query to only include active users.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include verified users.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    /**
     * Scope a query to only include customers of a specific type.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $type
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCustomerType($query, $type)
    {
        return $query->where('customer_type', $type);
    }

    /**
     * Get the branch associated with the user.
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the orders for the user.
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    /**
     * Get the services for the user.
     */
    public function services()
    {
        return $this->hasMany(RepairOrder::class, 'customer_id');
    }

    /**
     * Get the payments for the user.
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Add loyalty points to the user's account.
     *
     * @param  float  $points
     * @return void
     */
    public function addLoyaltyPoints($points)
    {
        $this->increment('loyalty_points', $points);
    }

    /**
     * Deduct loyalty points from the user's account.
     *
     * @param  float  $points
     * @return void
     */
    public function deductLoyaltyPoints($points)
    {
        $this->decrement('loyalty_points', $points);
    }

    /**
     * Add balance to the user's account.
     *
     * @param  float  $amount
     * @return void
     */
    public function addBalance($amount)
    {
        $this->increment('balance', $amount);
    }

    /**
     * Deduct balance from the user's account.
     *
     * @param  float  $amount
     * @return void
     */
    public function deductBalance($amount)
    {
        $this->decrement('balance', $amount);
    }

    /**
     * Check if the user has sufficient balance.
     *
     * @param  float  $amount
     * @return bool
     */
    public function hasSufficientBalance($amount)
    {
        return $this->balance >= $amount;
    }

    /**
     * Get the default shipping address for the user.
     */
    public function defaultShippingAddress()
    {
        return $this->addresses()->where('is_default_shipping', true)->first();
    }

    /**
     * Get the default billing address for the user.
     */
    public function defaultBillingAddress()
    {
        return $this->addresses()->where('is_default_billing', true)->first();
    }

    /**
     * Get the customer type options.
     *
     * @return array
     */
    public static function getCustomerTypeOptions()
    {
        return [
            self::CUSTOMER_TYPE_RETAIL => 'Retail',
            self::CUSTOMER_TYPE_WHOLESALE => 'Wholesale',
            self::CUSTOMER_TYPE_CORPORATE => 'Corporate',
        ];
    }

    /**
     * Get the gender options.
     *
     * @return array
     */
    public static function getGenderOptions()
    {
        return [
            self::GENDER_MALE => 'Male',
            self::GENDER_FEMALE => 'Female',
            self::GENDER_OTHER => 'Other',
            self::GENDER_PREFER_NOT_TO_SAY => 'Prefer not to say',
        ];
    }

    public function technicians()
    {
        return $this->hasOne(Technician::class);
    }

    public function department()
    {
        return $this->hasOne(Department::class);
    }

    public function attendance()
    {
        return $this->hasOne(Attendance::class);
    }

    public function getAgeAttribute()
    {
        return Carbon::parse($this->date_of_birth)->age;
    }
}
