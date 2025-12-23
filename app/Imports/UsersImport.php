<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Spatie\Permission\Models\Role;

class UsersImport implements ToModel, WithHeadingRow, WithValidation
{
    private $rows = 0;
    private $errors = [];

    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        ++$this->rows;

        try {
            // Log::info($row);

            // Skip if row doesn't have required fields
            if (empty($row['firstname']) || empty($row['lastname']) || empty($row['email'])) {
                $this->errors[] = 'Row ' . $this->rows . ': Missing required fields';
                return null;
            }

            // Check if user already exists by email
            $existingUser = User::where('email', $row['email'])->first();

            if ($existingUser) {
                // Update existing user
                $existingUser->update([
                    'first_name' => $row['firstname'] ?? $existingUser->first_name,
                    'last_name' => $row['lastname'] ?? $existingUser->last_name,
                    'phone' => $row['phone'] ?? $existingUser->phone,
                    'designation' => $row['designation'] ?? $existingUser->designation,
                ]);

                $user = $existingUser;
            } else {
                // Create new user WITHOUT specifying ID
                $user = new User([
                    'first_name' => $row['firstname'] ?? '',
                    'last_name' => $row['lastname'] ?? '',
                    'email' => $row['email'] ?? '',
                    'phone' => $row['phone'] ?? '',
                    'designation' => $row['designation'] ?? '',
                    'password' => Hash::make($row['password'] ?? '12345678'),
                ]);

                $user->save();
            }

            // Assign role based on Excel data
            $this->assignRoles($user, $row);

            return $user;

        } catch (\Throwable $th) {
            Log::error('User import error at row ' . $this->rows . ': ' . $th->getMessage());
            $this->errors[] = 'Row ' . $this->rows . ': ' . $th->getMessage();
            return null;
        }
    }

    /**
     * Assign roles to user
     */
    private function assignRoles(User $user, array $row)
    {
        try {
            // Remove all existing roles first
            $user->roles()->detach();

            // Get role(s) from Excel - can be comma separated for multiple roles
            $rolesInput = $row['role'] ?? $row['roles'] ?? null;

            if (!$rolesInput) {
                // Assign default role if none specified
                $defaultRole = Role::where('name', 'employee')->first();
                if ($defaultRole) {
                    $user->assignRole($defaultRole);
                }
                return;
            }

            // Handle multiple roles (comma separated)
            $roleNames = array_map('trim', explode(',', $rolesInput));

            foreach ($roleNames as $roleName) {
                // Find or create role
                $role = Role::where('name', strtolower($roleName))->first();

                if (!$role) {
                    // Create new role with slugged name
                    $role = Role::firstOrCreate(
                        ['name' => Str::slug($roleName)],
                        ['name' => Str::slug($roleName), 'guard_name' => 'web']
                    );
                }

                // Assign role to user
                $user->assignRole($role);
            }

        } catch (\Throwable $th) {
            Log::error('Role assignment error for user ' . $user->email . ': ' . $th->getMessage());
            $this->errors[] = 'Row ' . $this->rows . ' - Role assignment failed: ' . $th->getMessage();
        }
    }

    /**
     * Validation rules
     */
    public function rules(): array
    {
        return [
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'designation' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string',
        ];
    }

    /**
     * Custom validation messages
     */
    public function customValidationMessages()
    {
        return [
            'firstname.required' => 'First name is required',
            'lastname.required' => 'Last name is required',
            'email.required' => 'Email is required',
            'email.email' => 'Email must be valid',
            'password.min' => 'Password must be at least 6 characters',
        ];
    }

    /**
     * Get import errors
     */
    public function getErrors()
    {
        return $this->errors;
    }

    /**
     * Get processed rows count
     */
    public function getRowCount()
    {
        return $this->rows;
    }

    /**
     * Batch inserts for performance
     */
    public function batchSize(): int
    {
        return 50; // Reduced for safety
    }

    /**
     * Chunk reading for memory management
     */
    public function chunkSize(): int
    {
        return 50; // Reduced for safety
    }
}