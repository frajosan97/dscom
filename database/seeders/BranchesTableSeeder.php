<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BranchesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $branches = [
            [
                'name' => 'Head Quota',
                'code' => 'HQ',
                'email' => 'hq@dscomtechnologies.com',
                'phone' => '+243810000001',
                'manager_name' => 'John Doe',
                'manager_contact' => '+243820000001',
                'address' => '123 Main Street, Gombe',
                'city' => 'Kinshasa',
                'state' => 'Kinshasa',
                'country' => 'drc',
                'postal_code' => '00100',
                'latitude' => -4.4419311,
                'longitude' => 15.2662931,
                'opening_time' => '08:00:00',
                'closing_time' => '18:00:00',
                'working_days' => json_encode([1, 2, 3, 4, 5]), // Monday to Friday
                'is_active' => true,
                'is_online' => true,
                'has_pickup' => true,
                'has_delivery' => true,
                'delivery_radius' => 10,
                'delivery_fee' => 5.00,
                'currency' => 'CDF',
                'notes' => 'This is the main branch of our company',
            ]
        ];

        DB::table('branches')->insert($branches);
    }
}
