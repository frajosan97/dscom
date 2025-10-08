<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class StoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules for creating a new customer.
     */
    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'nullable|email|max:150|unique:users,email',
            'phone' => 'required|string|max:20|unique:users,phone',
            'alternate_phone' => 'nullable|string|max:20',
            'date_of_birth' => 'required|date',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'role' => 'required|in:customer,supplier,agent',
            'opening_balance' => 'nullable|numeric|min:0',
            'balance' => 'nullable|numeric',
            'is_active' => 'boolean',
            'description' => 'nullable|string|max:1000',
            'password' => 'nullable|string|min:8',
        ];
    }

    /**
     * Custom attribute names for better readability in validation errors.
     */
    public function attributes(): array
    {
        return [
            'first_name' => 'first name',
            'last_name' => 'last name',
            'alternate_phone' => 'alternate phone',
            'date_of_birth' => 'date of birth',
            'profile_image' => 'profile image',
            'postal_code' => 'postal code',
            'opening_balance' => 'opening balance',
            'is_active' => 'active status',
        ];
    }

    /**
     * Custom validation messages for common rule failures.
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'The first name field is required.',
            'first_name.max' => 'The first name may not be greater than 100 characters.',
            'last_name.required' => 'The last name field is required.',
            'last_name.max' => 'The last name may not be greater than 100 characters.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'email.max' => 'The email may not be greater than 150 characters.',
            'phone.required' => 'The phone number field is required.',
            'phone.unique' => 'This phone number is already in use.',
            'phone.max' => 'The phone number may not be greater than 20 characters.',
            'alternate_phone.max' => 'The alternate phone may not be greater than 20 characters.',
            'date_of_birth.required' => 'The date of birth field is required.',
            'date_of_birth.date' => 'Please enter a valid date of birth.',
            'profile_image.image' => 'The profile image must be an image.',
            'profile_image.mimes' => 'The profile image must be a file of type: jpeg, png, jpg, gif.',
            'profile_image.max' => 'The profile image may not be greater than 2MB.',
            'role.required' => 'The role field is required.',
            'role.in' => 'The selected role is invalid.',
            'opening_balance.min' => 'The opening balance must be at least 0.',
            'is_active.boolean' => 'The active status must be true or false.',
        ];
    }

    /**
     * Prepare and sanitize data before validation.
     */
    protected function prepareForValidation(): void
    {
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

        // Auto-generate password if not provided
        $this->merge([
            'password' => $this->password ? Hash::make($this->password) : Hash::make(Str::random(10)),
        ]);
    }
}
