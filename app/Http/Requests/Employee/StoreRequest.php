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
            'first_name' => 'required|string|min:2|max:255',
            'last_name' => 'required|string|min:2|max:255',

            'email' => 'nullable|email|max:255|unique:users,email',
            'phone' => 'required|string|max:20|unique:users,phone',
            'username' => 'nullable|string|min:3|max:255|unique:users,username',

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

            'salary_type' => 'nullable|in:monthly,keekly,daily',
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
        ]);
    }

    /**
     * Handle file uploads
     */
    protected function handleFileUploads(): array
    {
        $paths = [];

        if ($this->hasFile('profileImage')) {
            $paths['profile_image'] = $this->storeFile(
                $this->file('profileImage'),
                'employee/profile-images'
            );
        }

        if ($this->hasFile('idCard')) {
            $paths['id_card'] = $this->storeFile(
                $this->file('idCard'),
                'employee/id-cards'
            );
        }

        if ($this->hasFile('document')) {
            $paths['document'] = $this->storeFile(
                $this->file('document'),
                'employee/documents'
            );
        }

        return $paths;
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
            'status.in' => 'Status must be either active or Disable',
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
     * Get the validated data
     */
    public function validated($key = null, $default = null): array
    {
        $validated = parent::validated();

        $files = $this->handleFileUploads();

        $password = $this->password
            ? Hash::make($this->password)
            : Hash::make(Str::random(12));

        $username = $this->username;
        if (!$username && $this->email) {
            $username = strtok($this->email, '@');
        }

        $email = $this->email;
        if (!$email && $username) {
            $email = $username . '@' . parse_url(config('app.url'), PHP_URL_HOST);
        }

        $age = $this->date_of_birth
            ? Carbon::parse($this->date_of_birth)->age
            : null;

        return array_merge($validated, [
            'email' => $email,
            'username' => $username,
            'password' => $password,
            'phone' => $this->phone,
            'status' => $this->status === 'active' ? 'active' : 'inactive',
            'opening_balance' => (float) $this->opening_balance,
            'age' => $age,
            'created_at' => now(),
            'updated_at' => now(),
        ], $files);
    }
}
