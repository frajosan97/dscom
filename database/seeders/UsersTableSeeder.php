<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // First, ensure the admin role exists
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

        // Define plain password for dev use
        $plainPassword = 'password123';

        // Create admin user
        $adminUser = User::create([
            'email' => 'admin@dscomtechnology.com',
            'email_verified_at' => now(),
            'password' => Hash::make($plainPassword),
            'first_name' => 'System',
            'last_name' => 'Admin',
            'gender' => 'male',
            'birth_date' => '1980-01-01',
            'phone' => '+243810000100',
            'address' => '123 Admin Street, Gombe',
            'city' => 'Kinshasa',
            'state' => 'Kinshasa',
            'country' => 'drc',
            'postal_code' => '00100',
            'branch_id' => 1,
            'customer_id' => 'CUST-ADMIN-001',
            'loyalty_points' => 0,
            'customer_type' => 'retail',
            'is_active' => true,
            'is_verified' => true,
        ]);

        // Assign admin role
        $adminUser->assignRole($adminRole);
    }
}
