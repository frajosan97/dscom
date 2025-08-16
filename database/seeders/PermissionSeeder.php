<?php

namespace Database\Seeders;

use Spatie\Permission\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Dashboard
            'view dashboard',

            // Analysis
            'view analysis',
            'download analysis',

            // Product Management
            'view product',
            'create product',
            'edit product',
            'delete product',

            // Stock management
            'distribute stock',
            'receive stock',
            'reject stock',
            'move stock',
            'view stock',
            'adjust stock',

            // Sale Management
            'view sale',
            'create sale',
            'edit sale',
            'delete sale',

            // Employee Management
            'view employee',
            'create employee',
            'edit employee',
            'delete employee',

            // Reports Management
            'view report',
            'download report',
            'export report',

            // Services Module
            'view services',
            'create job entry',
            'assign technician',
            'take for job',
            'close job',
            'process delivery',
            'process spot delivery',
            'manage outside service',
            'contact customer',
            'process refund',
            'record service loss',
            'modify service position',
            'reprint documents',
            'view feedback',
            'view communications',
            'print barcodes',

            // Store Module
            'view store',
            'view categories',
            'manage categories',
            'view brands',
            'manage brands',
            'view products',
            'manage products',
            'process purchase',
            'process sale',
            'process returns',
            'manage inventory',

            // Accounts Module
            'view accounts',
            'view chart of accounts',
            'manage chart of accounts',
            'view ledgers',
            'manage ledgers',
            'create receipts',
            'approve receipts',
            'create payments',
            'approve payments',
            'create journal entries',
            'approve journal entries',
            'view financial reports',

            // HR Management Module
            'view hr',
            'manage users',
            'view attendance',
            'manage attendance',
            'process payroll',
            'view payroll',
            'manage staff records',
            'view staff performance',

            // Reports Module
            'view reports',
            'view mis reports',
            'view service reports',
            'view technician reports',
            'view dealer reports',
            'view account reports',
            'view stock reports',
            'view store item reports',
            'view customer reports',

            // Settings Module
            'manage settings',
            'manage slides',
            'manage roles',
            'manage permissions',
            'manage system configuration',
            'backup database',
            'restore database',
            'view system logs'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web'
            ]);
        }
    }
}
