<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\User;

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
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|max:255|email|unique:users,email',
            'phone' => 'nullable|string|max:20|unique:users,phone',
            'tax_number' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        $this->merge([
            'first_name' => $this->extractFirstName(),
            'last_name' => $this->extractLastName(),
            'email' => $this->getValidatedEmail(),
            'phone' => $this->getValidatedPhone(),
            'password' => $this->generatePassword(),
        ]);
    }

    /**
     * Extract first name from full name
     */
    protected function extractFirstName(): string
    {
        return explode(' ', $this->name, 2)[0] ?? '';
    }

    /**
     * Extract last name from full name
     */
    protected function extractLastName(): string
    {
        $parts = explode(' ', $this->name, 2);
        return $parts[1] ?? '';
    }

    /**
     * Generate or validate email
     */
    protected function getValidatedEmail(): string
    {
        if ($this->email) {
            return $this->email;
        }

        $base = strtolower($this->extractFirstName() . '.' . $this->extractLastName());
        $email = "{$base}@example.com";
        $counter = 1;

        while (User::where('email', $email)->exists()) {
            $email = "{$base}{$counter}@example.com";
            $counter++;
        }

        return $email;
    }

    /**
     * Generate or validate phone
     */
    protected function getValidatedPhone(): string
    {
        if ($this->phone) {
            return $this->phone;
        }

        do {
            $phone = '1' . str_pad(mt_rand(0, 999999999), 9, '0', STR_PAD_LEFT);
        } while (User::where('phone', $phone)->exists());

        return $phone;
    }

    /**
     * Generate random password
     */
    protected function generatePassword(): string
    {
        return Hash::make(Str::random(10));
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages()
    {
        return [
            'name.required' => 'The customer name is required',
            'email.unique' => 'This email is already registered',
        ];
    }

    /**
     * Get the validated data from the request.
     */
    public function validated($key = null, $default = null)
    {
        return array_merge(parent::validated(), [
            'first_name' => $this->extractFirstName(),
            'last_name' => $this->extractLastName(),
            'email' => $this->getValidatedEmail(),
            'phone' => $this->getValidatedPhone(),
            'password' => $this->generatePassword(),
        ]);
    }
}
