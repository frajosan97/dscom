<?php

namespace App\Http\Requests\Employee;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class UpdateRequest extends FormRequest
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
        $employeeId = $this->route('employee') ? $this->route('employee')->id : null;

        return [
            'first_name' => 'required|string|max:100|min:2',
            'last_name' => 'nullable|string|max:100',
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($employeeId),
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique('users', 'phone')->ignore($employeeId),
            ],
            'username' => [
                'nullable',
                'string',
                'max:50',
                'min:3',
                Rule::unique('users', 'username')->ignore($employeeId),
            ],
            'password' => 'nullable|string|min:6|confirmed',
            'gender' => 'required|in:male,female,other',
            'date_of_birth' => 'nullable|date|before:today|after_or_equal:' . Carbon::now()->subYears(70)->format('Y-m-d'),
            'qualification' => 'nullable|string|max:255',
            'designation' => 'nullable|string|max:255',
            'salary_type' => 'nullable|in:monthly,keekly,daily',
            'salary' => 'nullable|numeric|min:0|max:9999999.99',
            'blood_group' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'role' => 'required|string|exists:roles,name',
            'branch_id' => 'nullable|exists:branches,id',
            'department_id' => 'nullable|exists:departments,id',
            'ending_date' => 'nullable|date|after_or_equal:today',
            'opening_balance' => 'nullable|numeric|min:0|max:9999999.99',
            'balance' => 'nullable|numeric|min:0|max:9999999.99',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'alternate_phone' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:1000',
            'status' => 'required|in:active,inactive',
            'is_active' => 'boolean',
            'is_verified' => 'boolean',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',

            // 'profile_image' => [
            //     'nullable',
            //     'image',
            //     'mimes:jpeg,png,jpg,gif,webp',
            //     'max:5120',
            //     File::types(['jpeg', 'png', 'jpg', 'gif', 'webp'])->max(5 * 1024),
            // ],

            // 'id_card' => [
            //     'nullable',
            //     'file',
            //     'mimes:jpeg,png,jpg,pdf,doc,docx',
            //     'max:10240',
            //     File::types(['jpeg', 'png', 'jpg', 'pdf', 'doc', 'docx'])->max(10 * 1024),
            // ],

            // 'document' => [
            //     'nullable',
            //     'file',
            //     'mimes:pdf,jpeg,png,jpg,doc,docx,xls,xlsx',
            //     'max:10240',
            //     File::types(['pdf', 'jpeg', 'png', 'jpg', 'doc', 'docx', 'xls', 'xlsx'])->max(10 * 1024),
            // ],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Clean phone numbers
        $phone = preg_replace('/[^0-9+]/', '', $this->phone ?? '');
        $alternatePhone = preg_replace('/[^0-9+]/', '', $this->alternate_phone ?? '');

        $this->merge([
            'phone' => $phone,
            'alternate_phone' => $alternatePhone ?: null,
            'opening_balance' => (float) ($this->opening_balance ?? 0),
            'balance' => (float) ($this->balance ?? $this->opening_balance ?? 0),
            'salary' => $this->salary ? (float) $this->salary : null,
            'ending_date' => $this->ending_date ? Carbon::parse($this->ending_date)->format('Y-m-d') : null,
            'date_of_birth' => $this->date_of_birth ? Carbon::parse($this->date_of_birth)->format('Y-m-d') : null,
            'is_active' => $this->status === 'active',
            'is_verified' => $this->boolean('is_verified') ?? true,
        ]);
    }

    /**
     * Handle file uploads during validation.
     */
    protected function handleFileUploads(): array
    {
        $filePaths = [];

        if ($this->hasFile('profile_image')) {
            $filePaths['profile_image'] = $this->storeFile($this->file('profile_image'), 'employee/profile-images');
        }

        if ($this->hasFile('id_card')) {
            $filePaths['id_card'] = $this->storeFile($this->file('id_card'), 'employee/id-cards');
        }

        if ($this->hasFile('document')) {
            $filePaths['document'] = $this->storeFile($this->file('document'), 'employee/documents');
        }

        return $filePaths;
    }

    /**
     * Store file with unique name.
     */
    protected function storeFile($file, string $directory): string
    {
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $file->getClientOriginalExtension();
        $fileName = str($originalName)->slug()
            ->append('_' . time() . '_' . str()->random(8) . '.' . $extension)
            ->toString();

        return $file->storeAs($directory, $fileName, 'public');
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required',
            'first_name.min' => 'First name must be at least 2 characters',
            'email.email' => 'Please provide a valid email address',
            'email.unique' => 'This email is already registered',
            'phone.required' => 'Phone number is required',
            'phone.unique' => 'This phone number is already registered',
            'username.min' => 'Username must be at least 3 characters',
            'username.unique' => 'This username is already taken',
            'password.min' => 'Password must be at least 6 characters',
            'password.confirmed' => 'Password confirmation does not match',
            'date_of_birth.before' => 'Date of birth must be in the past',
            'date_of_birth.after_or_equal' => 'Employee must be 70 years or younger',
            'salary.min' => 'Salary cannot be negative',
            'salary_type.in' => 'Please select a valid salary type',
            'blood_group.in' => 'Please select a valid blood group',
            'role.required' => 'Role is required',
            'role.exists' => 'Selected role does not exist',
            'branch_id.exists' => 'Selected branch does not exist',
            'department_id.exists' => 'Selected department does not exist',
            'ending_date.after_or_equal' => 'Ending date must be today or in the future',
            'opening_balance.min' => 'Opening balance cannot be negative',
            'balance.min' => 'Balance cannot be negative',
            'profile_image.max' => 'Profile image must not exceed 5MB',
            'profile_image.mimes' => 'Profile image must be a JPEG, PNG, JPG, GIF or WEBP file',
            'id_card.max' => 'ID card must not exceed 10MB',
            'id_card.mimes' => 'ID card must be a JPEG, PNG, JPG, PDF, DOC or DOCX file',
            'document.max' => 'Document must not exceed 10MB',
            'document.mimes' => 'Document must be a PDF, JPEG, PNG, JPG, DOC, DOCX, XLS or XLSX file',
            'status.required' => 'Status is required',
            'status.in' => 'Status must be either active or inactive',
            'latitude.between' => 'Latitude must be between -90 and 90',
            'longitude.between' => 'Longitude must be between -180 and 180',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'first_name' => 'first name',
            'last_name' => 'last name',
            'profile_image' => 'profile image',
            'id_card' => 'ID card',
            'salary_type' => 'salary type',
            'blood_group' => 'blood group',
            'opening_balance' => 'opening balance',
            'ending_date' => 'ending date',
            'date_of_birth' => 'date of birth',
            'alternate_phone' => 'alternate phone',
            'postal_code' => 'postal code',
            'branch_id' => 'branch',
            'department_id' => 'department',
        ];
    }

    /**
     * Get the validated data from the request.
     */
    public function validated($key = null, $default = null): array
    {
        $validated = parent::validated($key, $default);

        // Handle file uploads
        $filePaths = $this->handleFileUploads();

        // Handle password if provided
        if ($this->filled('password')) {
            $validated['password'] = Hash::make($this->password);
        } else {
            // Remove password from data if not changing
            unset($validated['password']);
        }

        // Ensure username is set (use email username if not provided)
        if (empty($validated['username']) && !empty($validated['email'])) {
            $validated['username'] = strtok($validated['email'], '@');
        }

        // Merge all processed data
        $processedData = array_merge($validated, $filePaths, [
            'updated_by' => Auth::id(),
            'updated_at' => now(),
        ]);

        // Remove password_confirmation if present
        unset($processedData['password_confirmation']);

        return $processedData;
    }

    /**
     * Configure the validator instance.
     */
    protected function withValidator($validator): void
    {
        $employeeId = $this->route('employee') ? $this->route('employee')->id : null;

        $validator->after(function ($validator) use ($employeeId) {
            // Additional validation for ending date
            if ($this->filled('ending_date')) {
                $endingDate = Carbon::parse($this->ending_date);

                if ($endingDate->isPast()) {
                    $validator->errors()->add(
                        'ending_date',
                        'Ending date cannot be in the past'
                    );
                }

                // Check if ending date is before date of birth (logical check)
                if ($this->filled('date_of_birth')) {
                    $dob = Carbon::parse($this->date_of_birth);
                    if ($endingDate->lte($dob)) {
                        $validator->errors()->add(
                            'ending_date',
                            'Ending date must be after date of birth'
                        );
                    }
                }
            }

            // Validate date of birth age range
            if ($this->filled('date_of_birth')) {
                $dob = Carbon::parse($this->date_of_birth);
                $age = $dob->diffInYears(Carbon::now());

                if ($age < 18) {
                    $validator->errors()->add(
                        'date_of_birth',
                        'Employee must be at least 18 years old'
                    );
                }

                if ($age > 70) {
                    $validator->errors()->add(
                        'date_of_birth',
                        'Employee cannot be older than 70 years'
                    );
                }
            }

            // Validate username uniqueness with fallback
            if ($this->filled('username')) {
                $exists = User::where('username', $this->username)
                    ->when($employeeId, fn($q) => $q->where('id', '!=', $employeeId))
                    ->exists();

                if ($exists) {
                    // Suggest alternative username
                    $suggestion = $this->username . '_' . rand(100, 999);
                    $validator->errors()->add(
                        'username',
                        "This username is already taken. Try: {$suggestion}"
                    );
                }
            }

            // Validate email/username combination
            if (empty($this->email) && empty($this->username)) {
                $validator->errors()->add(
                    'email',
                    'Either email or username is required'
                );
            }

            // Validate salary with salary type
            if ($this->filled('salary') && empty($this->salary_type)) {
                $validator->errors()->add(
                    'salary_type',
                    'Salary type is required when salary is provided'
                );
            }
        });
    }
}