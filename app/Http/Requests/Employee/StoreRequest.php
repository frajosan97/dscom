<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\File;
use Carbon\Carbon;

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
            'password' => 'nullable|string|min:6',
            'consfirm_password' => 'required_with:password|same:password',
            'gender' => 'required|in:male,female,other',
            'date_of_birth' => 'nullable|date|before:today|after_or_equal:' . Carbon::now()->subYears(70)->format('Y-m-d'),
            'qualification' => 'nullable|string|max:255',
            'designation' => 'nullable|string|max:255',
            'salary_type' => 'nullable|in:monthly,keekly,daily',
            'salary' => 'nullable|numeric|min:0',
            'blood_group' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'role' => 'required|string|exists:roles,name',
            'ending_date' => 'nullable|date|after_or_equal:today',
            'opening_balance' => 'nullable|numeric|min:0',
            'address' => 'nullable|string|max:500',
            'description' => 'nullable|string|max:1000',
            'status' => 'required|in:Enable,Disable',

            'profileImage' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif',
                'max:5120', // 5MB
                File::types(['jpeg', 'png', 'jpg', 'gif'])
                    ->max(5 * 1024)
            ],

            'idCard' => [
                'nullable',
                'file',
                'mimes:jpeg,png,jpg,pdf,doc,docx',
                'max:10240', // 10MB
                File::types(['jpeg', 'png', 'jpg', 'pdf', 'doc', 'docx'])
                    ->max(10 * 1024)
            ],

            'document' => [
                'nullable',
                'file',
                'mimes:pdf,jpeg,png,jpg,doc,docx,xls,xlsx',
                'max:10240', // 10MB
                File::types(['pdf', 'jpeg', 'png', 'jpg', 'doc', 'docx', 'xls', 'xlsx'])
                    ->max(10 * 1024)
            ],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Clean phone number (remove spaces, dashes, parentheses)
        $phone = preg_replace('/[^0-9+]/', '', $this->phone);

        $this->merge([
            'phone' => $phone,
            'opening_balance' => $this->opening_balance ?? 0,
            'ending_date' => $this->ending_date ? Carbon::parse($this->ending_date)->format('Y-m-d') : null,
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
     * Handle file uploads
     */
    protected function handleFileUploads(): array
    {
        $filePaths = [];

        if ($this->hasFile('profileImage')) {
            $filePaths['profile_image'] = $this->storeFile($this->file('profileImage'), 'employee/profile-images');
        }

        if ($this->hasFile('idCard')) {
            $filePaths['id_card'] = $this->storeFile($this->file('idCard'), 'employee/id-cards');
        }

        if ($this->hasFile('document')) {
            $filePaths['document'] = $this->storeFile($this->file('document'), 'employee/documents');
        }

        return $filePaths;
    }

    /**
     * Store file with unique name
     */
    protected function storeFile($file, $directory): string
    {
        $extension = $file->getClientOriginalExtension();
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $fileName = Str::slug($originalName) . '_' . time() . '_' . Str::random(8) . '.' . $extension;

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
            'consfirm_password.same' => 'Password confirmation does not match',
            'consfirm_password.required_with' => 'Password confirmation is required when password is provided',
            'date_of_birth.date' => 'Please provide a valid date of birth',
            'date_of_birth.before' => 'Date of birth must be in the past',
            'date_of_birth.after_or_equal' => 'Employee must be 70 years or younger',
            'salary.min' => 'Salary cannot be negative',
            'salary_type.in' => 'Please select a valid salary type',
            'blood_group.in' => 'Please select a valid blood group',
            'role.required' => 'Role is required',
            'role.exists' => 'Selected role does not exist',
            'ending_date.date' => 'Please provide a valid date',
            'ending_date.after_or_equal' => 'Ending date must be today or in the future',
            'opening_balance.min' => 'Opening balance cannot be negative',
            'profileImage.max' => 'Profile image must not exceed 5MB',
            'profileImage.mimes' => 'Profile image must be a JPEG, PNG, JPG or GIF file',
            'profileImage.image' => 'Profile image must be an image file',
            'idCard.max' => 'ID card must not exceed 10MB',
            'idCard.mimes' => 'ID card must be a JPEG, PNG, JPG, PDF, DOC or DOCX file',
            'document.max' => 'Document must not exceed 10MB',
            'document.mimes' => 'Document must be a PDF, JPEG, PNG, JPG, DOC, DOCX, XLS or XLSX file',
            'status.required' => 'Status is required',
            'status.in' => 'Status must be either Enable or Disable',
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
            'salary_type' => 'salary type',
            'blood_group' => 'blood group',
            'opening_balance' => 'opening balance',
            'ending_date' => 'ending date',
            'consfirm_password' => 'confirm password',
            'date_of_birth' => 'date of birth',
        ];
    }

    /**
     * Get the validated data from the request.
     */
    public function validated($key = null, $default = null): array
    {
        $validated = parent::validated();

        // Handle file uploads
        $filePaths = $this->handleFileUploads();

        // Handle password - generate random if not provided
        $password = $this->password ? Hash::make($this->password) : Hash::make(Str::random(12));

        // Generate username if not provided but email exists
        $username = $this->username;
        if (!$username && $this->email) {
            $username = strtok($this->email, '@');
        }

        // Generate email if not provided but username exists
        $email = $this->email;
        if (!$email && $username) {
            $email = $username . '@' . parse_url(config('app.url'), PHP_URL_HOST);
        }

        // Calculate age from date of birth if provided
        $age = null;
        if ($this->date_of_birth) {
            $age = Carbon::parse($this->date_of_birth)->age;
        }

        // Merge all data for database insertion
        return array_merge($validated, [
            'first_name' => $this->extractFirstName(),
            'last_name' => $this->extractLastName(),
            'email' => $email,
            'username' => $username,
            'phone' => $this->phone,
            'password' => $password,
            'status' => $this->status === 'Enable' ? 'active' : 'inactive',
            'salary_type' => $this->salary_type,
            'blood_group' => $this->blood_group,
            'opening_balance' => (float) $this->opening_balance,
            'ending_date' => $this->ending_date,
            'date_of_birth' => $this->date_of_birth,
            'age' => $age,
            'created_at' => now(),
            'updated_at' => now(),
        ], $filePaths);
    }

    /**
     * Configure the validator instance.
     */
    protected function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Additional validation for username/email combination
            if (!$this->email && !$this->username) {
                $validator->errors()->add(
                    'email',
                    'Either email or username is required'
                );
            }

            // Validate that username is unique if provided
            if ($this->username) {
                $exists = \App\Models\User::where('username', $this->username)
                    ->when($this->employee, function ($query) {
                        $query->where('id', '!=', $this->employee->id);
                    })
                    ->exists();

                if ($exists) {
                    $validator->errors()->add(
                        'username',
                        'This username is already taken'
                    );
                }
            }

            // Validate that ending date is not before start date (today)
            if ($this->ending_date && Carbon::parse($this->ending_date)->lt(Carbon::today())) {
                $validator->errors()->add(
                    'ending_date',
                    'Ending date cannot be in the past'
                );
            }

            // Validate that date of birth is reasonable (not too old or future)
            if ($this->date_of_birth) {
                $dob = Carbon::parse($this->date_of_birth);
                $minAge = 18;
                $maxAge = 70;

                if ($dob->diffInYears(Carbon::now()) < $minAge) {
                    $validator->errors()->add(
                        'date_of_birth',
                        "Employee must be at least {$minAge} years old"
                    );
                }

                if ($dob->diffInYears(Carbon::now()) > $maxAge) {
                    $validator->errors()->add(
                        'date_of_birth',
                        "Employee cannot be older than {$maxAge} years"
                    );
                }
            }
        });
    }
}