<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $customerId = $this->route('customer');

        return [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => [
                'nullable',
                'email',
                'max:150',
                Rule::unique('users', 'email')->ignore($customerId),
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique('users', 'phone')->ignore($customerId),
            ],
            'alternate_phone' => 'nullable|string|max:20',
            'date_of_birth' => 'required|date',
            // 'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'opening_balance' => 'nullable|numeric|min:0',
            'balance' => 'nullable|numeric',
            'is_active' => 'boolean',
            'description' => 'nullable|string|max:1000',
            'password' => 'nullable|string|min:8',
        ];
    }

    public function attributes(): array
    {
        return [
            'first_name' => 'first name',
            'last_name' => 'last name',
            'alternate_phone' => 'alternate phone',
            'date_of_birth' => 'date of birth',
            'profile_image' => 'profile photo',
            'postal_code' => 'postal code',
            'opening_balance' => 'opening balance',
            'is_active' => 'active status',
        ];
    }

    public function messages(): array
    {
        return [
            'profile_image.image' => 'The profile photo must be an image.',
            'profile_image.mimes' => 'The profile photo must be of type: jpeg, png, jpg, gif.',
            'profile_image.max' => 'The profile photo may not be greater than 2MB.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Sanitize and normalize inputs
        $this->merge([
            'is_active' => $this->boolean('is_active'),
            'opening_balance' => $this->opening_balance ?: 0,
            'balance' => $this->balance ?: 0,
            'first_name' => trim($this->first_name),
            'last_name' => trim($this->last_name),
            'email' => $this->email ? trim($this->email) : null,
            'phone' => trim($this->phone),
            'alternate_phone' => $this->alternate_phone ? trim($this->alternate_phone) : null,
            'address' => $this->address ? trim($this->address) : null,
            'city' => $this->city ? trim($this->city) : null,
            'state' => $this->state ? trim($this->state) : null,
            'country' => $this->country ? trim($this->country) : null,
            'postal_code' => $this->postal_code ? trim($this->postal_code) : null,
            'description' => $this->description ? trim($this->description) : null,
        ]);

        // ✅ Process password (only if present)
        if ($this->filled('password')) {
            $this->merge([
                'password' => Hash::make($this->password),
            ]);
        }
    }
}
