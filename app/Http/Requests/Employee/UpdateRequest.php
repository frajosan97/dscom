<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\File;
use Carbon\Carbon;

class UpdateRequest extends FormRequest
{
    /**
     * The employee instance.
     */
    protected $employee;

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
        // Get the employee ID from route parameters
        $employee = $this->getEmployee();
        $employeeId = $employee ? $employee->id : null;

        return [
            'first_name' => 'required|string|min:2|max:255',
            'last_name' => 'required|string|min:2|max:255',

            'email' => [
                'nullable',
                'email',
                'max:255',
                'unique:users,email,' . $employeeId,
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                'unique:users,phone,' . $employeeId,
            ],
            'username' => [
                'nullable',
                'string',
                'min:3',
                'max:255',
                'unique:users,username,' . $employeeId,
            ],

            'password' => 'nullable|string|min:6',
            'confirm_password' => 'required_with:password|same:password',

            'gender' => 'required|in:male,female,other',

            'date_of_birth' => [
                'nullable',
                'date',
                'before:today',
                'after_or_equal:' . Carbon::now()->subYears(70)->format('Y-m-d'),
            ],

            'qualification' => 'nullable|string|max:255',
            'designation' => 'nullable|string|max:255',

            'salary_type' => 'nullable|in:monthly,weekly,daily',
            'salary' => 'nullable|numeric|min:0',

            'blood_group' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',

            'role' => 'required|string|exists:roles,name',

            'ending_date' => 'nullable|date|after_or_equal:today',
            'opening_balance' => 'nullable|numeric|min:0',

            'address' => 'nullable|string|max:500',
            'description' => 'nullable|string|max:1000',

            'status' => 'required|in:active,inactive',

            'profileImage' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif',
                'max:5120',
                File::types(['jpeg', 'png', 'jpg', 'gif'])->max(5 * 1024),
            ],

            'idCard' => [
                'nullable',
                'file',
                'mimes:jpeg,png,jpg,pdf,doc,docx',
                'max:10240',
                File::types(['jpeg', 'png', 'jpg', 'pdf', 'doc', 'docx'])->max(10 * 1024),
            ],

            'document' => [
                'nullable',
                'file',
                'mimes:pdf,jpeg,png,jpg,doc,docx,xls,xlsx',
                'max:10240',
                File::types(['pdf', 'jpeg', 'png', 'jpg', 'doc', 'docx', 'xls', 'xlsx'])->max(10 * 1024),
            ],

            // For file removal
            'remove_profile_image' => 'nullable|boolean',
            'remove_id_card' => 'nullable|boolean',
            'remove_document' => 'nullable|boolean',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $phone = preg_replace('/[^0-9+]/', '', $this->phone);

        $this->merge([
            'phone' => $phone,
            'opening_balance' => $this->opening_balance ?? 0,
            'ending_date' => $this->ending_date
                ? Carbon::parse($this->ending_date)->format('Y-m-d')
                : null,
            'remove_profile_image' => $this->boolean('remove_profile_image'),
            'remove_id_card' => $this->boolean('remove_id_card'),
            'remove_document' => $this->boolean('remove_document'),
        ]);
    }

    /**
     * Handle file uploads and removals
     */
    protected function handleFileOperations(): array
    {
        $data = [];
        $employee = $this->getEmployee();

        // Profile Image
        if ($this->hasFile('profileImage')) {
            $data['profile_image'] = $this->storeFile(
                $this->file('profileImage'),
                'employee/profile-images'
            );
        } elseif ($this->remove_profile_image) {
            $data['profile_image'] = null;
        }

        // ID Card
        if ($this->hasFile('idCard')) {
            $data['id_card'] = $this->storeFile(
                $this->file('idCard'),
                'employee/id-cards'
            );
        } elseif ($this->remove_id_card) {
            $data['id_card'] = null;
        }

        // Document
        if ($this->hasFile('document')) {
            $data['document'] = $this->storeFile(
                $this->file('document'),
                'employee/documents'
            );
        } elseif ($this->remove_document) {
            $data['document'] = null;
        }

        return $data;
    }

    /**
     * Store file with unique name
     */
    protected function storeFile($file, string $directory): string
    {
        $extension = $file->getClientOriginalExtension();
        $name = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);

        $fileName = Str::slug($name)
            . '_' . time()
            . '_' . Str::random(8)
            . '.' . $extension;

        return $file->storeAs($directory, $fileName, 'public');
    }

    /**
     * Custom validation messages
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required',
            'last_name.required' => 'Last name is required',

            'email.email' => 'Please provide a valid email address',
            'email.unique' => 'This email is already registered',

            'phone.required' => 'Phone number is required',
            'phone.unique' => 'This phone number is already registered',

            'username.min' => 'Username must be at least 3 characters',
            'username.unique' => 'This username is already taken',

            'password.min' => 'Password must be at least 6 characters',

            'confirm_password.same' => 'Password confirmation does not match',
            'confirm_password.required_with' =>
                'Password confirmation is required when password is provided',

            'status.required' => 'Status is required',
            'status.in' => 'Status must be either active or inactive',
        ];
    }

    /**
     * Custom attribute names
     */
    public function attributes(): array
    {
        return [
            'first_name' => 'first name',
            'last_name' => 'last name',
            'profileImage' => 'profile image',
            'idCard' => 'ID card',
            'confirm_password' => 'confirm password',
        ];
    }

    /**
     * Get the employee instance
     */
    protected function getEmployee()
    {
        if (!$this->employee) {
            $employee = $this->route('employee');
            
            // If it's an object, use it directly
            if (is_object($employee)) {
                $this->employee = $employee;
            } 
            // If it's an ID, fetch the model
            elseif (is_numeric($employee)) {
                $this->employee = \App\Models\User::find($employee);
            }
        }

        return $this->employee;
    }

    /**
     * Get the validated data for update
     */
    public function validated($key = null, $default = null): array
    {
        $validated = parent::validated();

        // Remove file removal fields from validated data
        unset(
            $validated['remove_profile_image'],
            $validated['remove_id_card'],
            $validated['remove_document']
        );

        $fileOperations = $this->handleFileOperations();

        // Handle password update
        if ($this->filled('password')) {
            $validated['password'] = Hash::make($this->password);
        } else {
            unset($validated['password']);
        }

        // Remove confirm_password field
        unset($validated['confirm_password']);

        // Handle username if not provided but email is
        if (empty($validated['username']) && isset($validated['email'])) {
            $validated['username'] = strtok($validated['email'], '@');
        }

        // Calculate age from date of birth
        if (isset($validated['date_of_birth'])) {
            $validated['age'] = Carbon::parse($validated['date_of_birth'])->age;
        }

        // Ensure status is properly formatted
        if (isset($validated['status'])) {
            $validated['status'] = $validated['status'] === 'active' ? 'active' : 'inactive';
        }

        // Format opening_balance
        if (isset($validated['opening_balance'])) {
            $validated['opening_balance'] = (float) $validated['opening_balance'];
        }

        // Add updated timestamp
        $validated['updated_at'] = now();

        return array_merge($validated, $fileOperations);
    }

    /**
     * Get data to be validated from the request.
     * Override to exclude password fields if they're empty
     */
    public function validationData(): array
    {
        $data = parent::validationData();

        // If password is empty, don't validate confirm_password
        if (empty($data['password'])) {
            unset($data['confirm_password']);
        }

        return $data;
    }
}