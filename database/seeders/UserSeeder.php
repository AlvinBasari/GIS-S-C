<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Akun Super Admin (Pusat / HQ)
        User::updateOrCreate(
            ['email' => 'admin@shoesandcare.com'],
            [
                'name' => 'HQ Super Admin (Pusat)',
                'password' => Hash::make('password'),
                'role' => 'superadmin',
                'branch_id' => null,
                'phone' => '087739311899',
                'is_active' => true,
            ]
        );

        // Cari cabang percontohan
        $branchGalaxy = Branch::where('branch_name', 'like', '%Galaxy%')->first();
        $branchTebet = Branch::where('branch_name', 'like', '%Tebet%')->first();
        $branchSagan = Branch::where('branch_name', 'like', '%Sagan%')->first();

        // 2. Akun Kepala Cabang Galaxy
        if ($branchGalaxy) {
            $kepalaGalaxy = User::updateOrCreate(
                ['email' => 'kepala.galaxy@shoesandcare.com'],
                [
                    'name' => 'Kepala Cabang Galaxy',
                    'password' => Hash::make('password'),
                    'role' => 'branch_manager',
                    'branch_id' => $branchGalaxy->id,
                    'phone' => '085161667972',
                    'is_active' => true,
                ]
            );

            // Staf yang dibuat oleh Kepala Cabang Galaxy
            User::updateOrCreate(
                ['email' => 'staff.galaxy@shoesandcare.com'],
                [
                    'name' => 'Teknisi Cuci & Treatment Galaxy',
                    'password' => Hash::make('password'),
                    'role' => 'branch_staff',
                    'branch_id' => $branchGalaxy->id,
                    'phone' => '085161667973',
                    'is_active' => true,
                ]
            );
        }

        // 3. Akun Kepala Cabang Tebet
        if ($branchTebet) {
            User::updateOrCreate(
                ['email' => 'kepala.tebet@shoesandcare.com'],
                [
                    'name' => 'Kepala Cabang Tebet',
                    'password' => Hash::make('password'),
                    'role' => 'branch_manager',
                    'branch_id' => $branchTebet->id,
                    'phone' => '081383848730',
                    'is_active' => true,
                ]
            );
        }

        // 4. Akun Kepala Cabang Sagan Yogyakarta
        if ($branchSagan) {
            User::updateOrCreate(
                ['email' => 'kepala.sagan@shoesandcare.com'],
                [
                    'name' => 'Kepala Cabang Sagan Yogyakarta',
                    'password' => Hash::make('password'),
                    'role' => 'branch_manager',
                    'branch_id' => $branchSagan->id,
                    'phone' => '087739311899',
                    'is_active' => true,
                ]
            );
        }
    }
}
