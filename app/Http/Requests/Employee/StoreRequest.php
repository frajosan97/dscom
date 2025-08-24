<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;

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
            'name' => 'required|string|max:255|min:2',
            'email' => 'nullable|email|max:255|unique:users,email',
            'phone' => 'required|string|max:20|unique:users,phone',
            'username' => 'nullable|string|max:255|min:3|unique:users,username',
            'password' => 'nullable|string|min:6|confirmed',
            'gender' => 'required|in:Male,Female',
            'age' => 'nullable|integer|min:18|max:70',
            'qualification' => 'nullable|string|max:255',
            'designation' => 'nullable|string|max:255',
            'salaryType' => 'nullable|in:Monthly,Weekly,Daily',
            'salary' => 'nullable|numeric|min:0',
            'bloodGroup' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'role' => 'required|string|in:admin,manager,technician,receptionist,supervisor,sales',
            'endingDate' => 'required|date|after:today',
            'openingBalance' => 'nullable|numeric|min:0',
            'address' => 'nullable|string|max:500',
            'description' => 'nullable|string|max:1000',
            'status' => 'required|in:Enable,Disable',

            'profileImage' => [
                'nullable',
                File::types(['jpeg', 'png', 'gif', 'jpg'])
                    ->max(5 * 1024) // 5MB
            ],

            'idCard' => [
                'nullable',
                File::types(['pdf', 'jpeg', 'png', 'jpg', 'doc', 'docx'])
                    ->max(10 * 1024) // 10MB
            ],

            'document' => [
                'nullable',
                File::types(['pdf', 'jpeg', 'png', 'jpg', 'doc', 'docx'])
                    ->max(10 * 1024) // 10MB
            ],
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
            'status' => $this->status === 'Enable' ? 'active' : 'inactive',
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
    protected function getValidatedEmail(): ?string
    {
        if ($this->email) {
            return $this->email;
        }

        // Only generate email if username is provided
        if (!$this->username) {
            return null;
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
     * Generate random password if not provided
     */
    protected function generatePassword(): string
    {
        if ($this->password) {
            return Hash::make($this->password);
        }

        return Hash::make(Str::random(10));
    }

    /**
     * Handle file uploads
     */
    protected function handleFileUploads(): array
    {
        $filePaths = [];

        if ($this->hasFile('profileImage')) {
            $filePaths['profile_image'] = $this->storeFile($this->file('profileImage'), 'profile-images');
        }

        if ($this->hasFile('idCard')) {
            $filePaths['id_card'] = $this->storeFile($this->file('idCard'), 'id-cards');
        }

        if ($this->hasFile('document')) {
            $filePaths['document'] = $this->storeFile($this->file('document'), 'documents');
        }

        return $filePaths;
    }

    /**
     * Store file with unique name
     */
    protected function storeFile($file, $directory): string
    {
        $extension = $file->getClientOriginalExtension();
        $fileName = Str::random(40) . '.' . $extension;

        return $file->storeAs($directory, $fileName, 'public');
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The employee name is required',
            'name.min' => 'Name must be at least 2 characters',
            'email.email' => 'Please provide a valid email address',
            'email.unique' => 'This email is already registered',
            'phone.required' => 'Phone number is required',
            'phone.unique' => 'This phone number is already registered',
            'username.min' => 'Username must be at least 3 characters',
            'username.unique' => 'This username is already taken',
            'password.min' => 'Password must be at least 6 characters',
            'password.confirmed' => 'Password confirmation does not match',
            'age.min' => 'Employee must be at least 18 years old',
            'age.max' => 'Employee cannot be older than 70 years',
            'salary.min' => 'Salary cannot be negative',
            'salaryType.in' => 'Please select a valid salary type',
            'bloodGroup.in' => 'Please select a valid blood group',
            'role.required' => 'Role is required',
            'role.in' => 'Please select a valid role',
            'endingDate.required' => 'Ending date is required',
            'endingDate.after' => 'Ending date must be in the future',
            'openingBalance.min' => 'Opening balance cannot be negative',
            'profileImage.max' => 'Profile image must not exceed 5MB',
            'profileImage.mimes' => 'Profile image must be a JPEG, PNG, or GIF file',
            'idCard.max' => 'ID card must not exceed 10MB',
            'document.max' => 'Document must not exceed 10MB',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'full name',
            'profileImage' => 'profile image',
            'idCard' => 'ID card',
            'salaryType' => 'salary type',
            'bloodGroup' => 'blood group',
            'openingBalance' => 'opening balance',
            'endingDate' => 'ending date',
        ];
    }

    /**
     * Get the validated data from the request.
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated();

        // Handle file uploads
        $filePaths = $this->handleFileUploads();

        // Merge all data for database insertion
        return array_merge($validated, [
            'first_name' => $this->extractFirstName(),
            'last_name' => $this->extractLastName(),
            'email' => $this->getValidatedEmail(),
            'phone' => $this->getValidatedPhone(),
            'password' => $this->generatePassword(),
            'status' => $this->status === 'Enable' ? 'active' : 'inactive',
            'salary_type' => $this->salaryType,
            'blood_group' => $this->bloodGroup,
            'opening_balance' => $this->openingBalance ?? 0,
            'ending_date' => $this->endingDate,
        ], $filePaths);
    }

    /**
     * Configure the validator instance.
     */
    protected function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Additional validation for username/password combination
            if ($this->username && !$this->password) {
                $validator->errors()->add(
                    'password',
                    'Password is required when username is provided'
                );
            }

            // Validate that ending date is a valid date
            if ($this->endingDate && !strtotime($this->endingDate)) {
                $validator->errors()->add(
                    'endingDate',
                    'Please provide a valid ending date'
                );
            }
        });
    }
}
