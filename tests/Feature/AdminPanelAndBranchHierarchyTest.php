<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\BranchTreatment;
use App\Models\MasterTreatment;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminPanelAndBranchHierarchyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * Test guest tidak dapat mengakses Admin Panel dan diarahkan ke login.
     */
    public function test_guest_is_redirected_from_admin_panel(): void
    {
        $response = $this->get('/admin');
        $response->assertRedirect('/login');
    }

    /**
     * Test Super Admin dapat login dan mengakses dashboard pusat.
     */
    public function test_superadmin_can_access_admin_dashboard(): void
    {
        $superadmin = User::where('role', 'superadmin')->first();

        $response = $this->actingAs($superadmin)->get('/admin');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->has('branches')
            ->has('stats')
        );
    }

    /**
     * Test Super Admin dapat mengakses peta GIS Command Center Admin HQ tersendiri.
     */
    public function test_superadmin_can_access_dedicated_admin_map(): void
    {
        $superadmin = User::where('role', 'superadmin')->first();

        $response = $this->actingAs($superadmin)->get('/admin/map');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/AdminMap')
            ->has('branches')
            ->has('districts')
            ->has('spatialStats')
        );
    }

    /**
     * Test Super Admin dapat toggle SAC GO untuk gerai dari admin panel.
     */
    public function test_superadmin_can_toggle_sac_go_on_branch(): void
    {
        $superadmin = User::where('role', 'superadmin')->first();
        $branch = Branch::first();
        $initial = $branch->is_pickup_available;

        $response = $this->actingAs($superadmin)->post("/admin/branches/{$branch->id}/toggle-sac-go");

        $response->assertRedirect();
        $this->assertEquals(! $initial, $branch->fresh()->is_pickup_available);
    }

    /**
     * Test Super Admin dapat mendaftarkan akun Kepala Cabang baru.
     */
    public function test_superadmin_can_create_branch_manager_account(): void
    {
        $superadmin = User::where('role', 'superadmin')->first();
        $branch = Branch::first();

        $payload = [
            'branch_id' => $branch->id,
            'name' => 'Kepala Baru Bandung',
            'email' => 'kepala.bandung@shoesandcare.com',
            'password' => 'secret123',
            'phone' => '081234567890',
        ];

        $response = $this->actingAs($superadmin)->post('/admin/managers', $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'name' => 'Kepala Baru Bandung',
            'email' => 'kepala.bandung@shoesandcare.com',
            'role' => 'branch_manager',
            'branch_id' => $branch->id,
        ]);
    }

    /**
     * Test Kepala Cabang dapat login dan mengakses portal cabang miliknya.
     */
    public function test_branch_manager_can_access_branch_portal(): void
    {
        $manager = User::where('role', 'branch_manager')->first();

        $response = $this->actingAs($manager)->get('/branch');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Branch/Dashboard')
            ->where('canManageStaff', true)
            ->has('branch')
        );
    }

    /**
     * Test Kepala Cabang BISA membuat akun staf untuk cabangnya.
     */
    public function test_branch_manager_can_create_staff_account(): void
    {
        $manager = User::where('role', 'branch_manager')->first();

        $payload = [
            'name' => 'Staf Teknisi Baru',
            'email' => 'staf.baru@shoesandcare.com',
            'password' => 'secret123',
            'phone' => '087711223344',
        ];

        $response = $this->actingAs($manager)->post('/branch/staff', $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'name' => 'Staf Teknisi Baru',
            'email' => 'staf.baru@shoesandcare.com',
            'role' => 'branch_staff',
            'branch_id' => $manager->branch_id,
        ]);
    }

    /**
     * Test Staf Cabang TIDAK BISA membuat akun staf (akses ditolak / 403).
     */
    public function test_branch_staff_cannot_create_staff_account(): void
    {
        $staff = User::where('role', 'branch_staff')->first();

        $payload = [
            'name' => 'Staf Ilegal',
            'email' => 'staf.ilegal@shoesandcare.com',
            'password' => 'secret123',
        ];

        $response = $this->actingAs($staff)->post('/branch/staff', $payload);
        $response->assertStatus(403);
    }

    /**
     * Test Konsumen dapat melakukan booking SAC GO online.
     */
    public function test_customer_can_book_sac_go_order(): void
    {
        $branch = Branch::where('is_pickup_available', true)->first();
        $treatment = BranchTreatment::where('branch_id', $branch->id)->first();

        $payload = [
            'branch_id' => $branch->id,
            'customer_name' => 'Alvin Basari',
            'customer_phone' => '085161667972',
            'pickup_address' => 'Jl. Pulo Sirih Barat Blok FE No. 12',
            'pickup_lat' => -6.2625000,
            'pickup_lng' => 106.9856000,
            'service_type' => 'SAC_GO',
            'pair_count' => 2,
            'shoe_type' => 'Sneakers Casual / Canvas',
            'notes' => 'Tolong dibersihkan noda midsole',
            'treatments' => [$treatment->id],
        ];

        $response = $this->post('/booking', $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'branch_id' => $branch->id,
            'customer_name' => 'Alvin Basari',
            'customer_phone' => '085161667972',
            'service_type' => 'SAC_GO',
            'status' => 'BOOKED',
        ]);
    }

    /**
     * Test booking SAC GO ditolak jika cabang berada di luar wilayah Jakarta/Yogyakarta (is_pickup_available = false).
     */
    public function test_customer_cannot_book_sac_go_on_disabled_branch(): void
    {
        $branch = Branch::where('is_pickup_available', false)->first();
        $treatment = BranchTreatment::where('branch_id', $branch->id)->first();

        $payload = [
            'branch_id' => $branch->id,
            'customer_name' => 'Budi Santoso',
            'customer_phone' => '08123456789',
            'pickup_address' => 'Jl. Luar Wilayah No. 10',
            'service_type' => 'SAC_GO',
            'pair_count' => 1,
            'shoe_type' => 'Sneakers',
            'treatments' => [$treatment->id],
        ];

        $response = $this->post('/booking', $payload);

        $response->assertSessionHasErrors(['service_type']);
        $this->assertDatabaseMissing('orders', [
            'customer_name' => 'Budi Santoso',
            'service_type' => 'SAC_GO',
        ]);
    }

    /**
     * Test Konsumen dapat melacak status pesanan sepatu secara real-time.
     */
    public function test_customer_can_track_order_status(): void
    {
        $branch = Branch::first();
        $order = Order::create([
            'order_code' => 'SAC-202610-TEST',
            'branch_id' => $branch->id,
            'customer_name' => 'Budi Santoso',
            'customer_phone' => '081299887766',
            'pickup_address' => 'Jl. Boulevard Raya No. 1',
            'service_type' => 'SAC_GO',
            'status' => 'IN_PROGRESS',
            'pair_count' => 1,
            'shoe_type' => 'Leather Shoes',
            'total_price' => 90000,
        ]);

        $response = $this->get('/track?code=SAC-202610-TEST');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Track/OrderTracking')
            ->where('order.order_code', 'SAC-202610-TEST')
            ->where('order.status', 'IN_PROGRESS')
        );
    }

    /**
     * Test Staf Cabang dapat menjalankan alur 6 tahapan SOP pesanan sepatu hingga selesai bergaransi.
     */
    public function test_branch_staff_can_advance_order_through_6_stage_sop_lifecycle(): void
    {
        $staff = User::where('role', 'branch_staff')->first();
        $order = Order::create([
            'order_code' => 'SAC-SOP-202610-001',
            'branch_id' => $staff->branch_id,
            'customer_name' => 'Doni Darmawan',
            'customer_phone' => '081234567890',
            'pickup_address' => 'Jl. Kemang Raya No. 10',
            'service_type' => 'SAC_GO',
            'status' => 'BOOKED',
            'pair_count' => 1,
            'shoe_type' => 'Sneakers Casual',
            'total_price' => 75000,
            'payment_status' => 'UNPAID',
        ]);

        // Tahap 1 -> 2: Tugaskan Kurir Jemput (OUT_FOR_PICKUP)
        $res1 = $this->actingAs($staff)->post("/branch/orders/{$order->id}/status", [
            'status' => 'OUT_FOR_PICKUP',
            'courier_name' => 'Kurir Anton',
        ]);
        $res1->assertRedirect();
        $this->assertEquals('OUT_FOR_PICKUP', $order->fresh()->status);
        $this->assertEquals('Kurir Anton', $order->fresh()->courier_name);

        // Tahap 2: Kurir Mengambil Sepatu (PICKED_UP)
        $res2 = $this->actingAs($staff)->post("/branch/orders/{$order->id}/status", [
            'status' => 'PICKED_UP',
        ]);
        $res2->assertRedirect();
        $this->assertEquals('PICKED_UP', $order->fresh()->status);

        // Tahap 3: Intake & Diagnosis Workshop (INTAKE_VERIFIED)
        $res3 = $this->actingAs($staff)->post("/branch/orders/{$order->id}/status", [
            'status' => 'INTAKE_VERIFIED',
            'diagnosis_notes' => 'Upper suede ada noda oli, midsole menguning.',
            'before_photo_url' => 'https://example.com/before.jpg',
        ]);
        $res3->assertRedirect();
        $orderFresh3 = $order->fresh();
        $this->assertEquals('INTAKE_VERIFIED', $orderFresh3->status);
        $this->assertEquals('Upper suede ada noda oli, midsole menguning.', $orderFresh3->diagnosis_notes);
        $this->assertEquals('https://example.com/before.jpg', $orderFresh3->before_photo_url);

        // Tahap 4: Teknisi Mulai Treatment Cuci (IN_PROGRESS)
        $res4 = $this->actingAs($staff)->post("/branch/orders/{$order->id}/status", [
            'status' => 'IN_PROGRESS',
            'technician_name' => 'Teknisi Rizal',
        ]);
        $res4->assertRedirect();
        $this->assertEquals('IN_PROGRESS', $order->fresh()->status);
        $this->assertEquals('Teknisi Rizal', $order->fresh()->technician_name);

        // Tahap 5: Quality Control Lolos & Foto After (READY_FOR_DELIVERY)
        $res5 = $this->actingAs($staff)->post("/branch/orders/{$order->id}/status", [
            'status' => 'READY_FOR_DELIVERY',
            'after_photo_url' => 'https://example.com/after.jpg',
        ]);
        $res5->assertRedirect();
        $orderFresh5 = $order->fresh();
        $this->assertEquals('READY_FOR_DELIVERY', $orderFresh5->status);
        $this->assertEquals('https://example.com/after.jpg', $orderFresh5->after_photo_url);

        // Tahap 6: Outbound, Settlement & Aktivasi Garansi (COMPLETED)
        $res6 = $this->actingAs($staff)->post("/branch/orders/{$order->id}/status", [
            'status' => 'COMPLETED',
            'payment_status' => 'PAID',
            'payment_method' => 'QRIS',
        ]);
        $res6->assertRedirect();
        $orderFresh6 = $order->fresh();
        $this->assertEquals('COMPLETED', $orderFresh6->status);
        $this->assertEquals('PAID', $orderFresh6->payment_status);
        $this->assertEquals('QRIS', $orderFresh6->payment_method);
        $this->assertNotNull($orderFresh6->completed_at);
        $this->assertNotNull($orderFresh6->warranty_until);
        $this->assertTrue($orderFresh6->isWarrantyActive());
    }

    /**
     * Test Staf Cabang tidak bisa mengubah status order milik cabang lain.
     */
    public function test_staff_cannot_update_order_of_another_branch(): void
    {
        $staff = User::where('role', 'branch_staff')->first();
        $anotherBranch = Branch::where('id', '!=', $staff->branch_id)->first();

        $foreignOrder = Order::create([
            'order_code' => 'SAC-FOREIGN-001',
            'branch_id' => $anotherBranch->id,
            'customer_name' => 'Customer Lain',
            'customer_phone' => '0899999999',
            'pickup_address' => 'Jl. Lain No. 99',
            'service_type' => 'WALK_IN',
            'status' => 'BOOKED',
            'pair_count' => 1,
            'shoe_type' => 'Sneakers',
            'total_price' => 50000,
        ]);

        $response = $this->actingAs($staff)->post("/branch/orders/{$foreignOrder->id}/status", [
            'status' => 'IN_PROGRESS',
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test Super Admin Pusat dapat mengubah harga Master Treatment dan menyinkronkan ke seluruh cabang.
     */
    public function test_superadmin_can_update_master_treatment_price_and_sync_to_branches(): void
    {
        $superadmin = User::where('role', 'superadmin')->first();
        $treatment = MasterTreatment::first();

        $payload = [
            'name' => $treatment->name,
            'category' => $treatment->category,
            'description' => 'Deskripsi layanan teruji resmi Shoes and Care.',
            'default_price' => 75000,
            'est_duration' => '1-2 Hari',
            'is_popular' => true,
            'sync_to_branches' => true,
        ];

        $response = $this->actingAs($superadmin)->put("/admin/treatments/{$treatment->id}", $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('master_treatments', [
            'id' => $treatment->id,
            'default_price' => 75000,
            'is_popular' => true,
        ]);

        // Pastikan seluruh branch treatment yang menginduk ke master treatment ini ikut berubah harganya
        $branchTreatmentsCount = BranchTreatment::where('master_treatment_id', $treatment->id)->count();
        $this->assertGreaterThan(0, $branchTreatmentsCount);

        $matchingUpdated = BranchTreatment::where('master_treatment_id', $treatment->id)
            ->where('price', 75000)
            ->count();
        $this->assertEquals($branchTreatmentsCount, $matchingUpdated);
    }

    /**
     * Test Super Admin Pusat dapat mengubah harga Master Treatment tanpa menyinkronkan ke cabang jika opsi sync dimatikan.
     */
    public function test_superadmin_can_update_master_treatment_without_sync(): void
    {
        $superadmin = User::where('role', 'superadmin')->first();
        $treatment = MasterTreatment::first();
        $originalBranchPrice = BranchTreatment::where('master_treatment_id', $treatment->id)->first()->price;

        $payload = [
            'name' => $treatment->name,
            'category' => $treatment->category,
            'description' => $treatment->description,
            'default_price' => 99000,
            'est_duration' => $treatment->est_duration,
            'is_popular' => false,
            'sync_to_branches' => false,
        ];

        $response = $this->actingAs($superadmin)->put("/admin/treatments/{$treatment->id}", $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('master_treatments', [
            'id' => $treatment->id,
            'default_price' => 99000,
        ]);

        // Harga di cabang tetap menggunakan harga lama karena sync_to_branches = false
        $this->assertDatabaseHas('branch_treatments', [
            'master_treatment_id' => $treatment->id,
            'price' => $originalBranchPrice,
        ]);
    }

    /**
     * Test Super Admin Pusat dapat mengubah harga spesifik pada cabang tertentu.
     */
    public function test_superadmin_can_update_specific_branch_treatment_price(): void
    {
        $superadmin = User::where('role', 'superadmin')->first();
        $branchTreatment = BranchTreatment::first();

        $response = $this->actingAs($superadmin)->put("/admin/branch-treatments/{$branchTreatment->id}", [
            'price' => 45000,
            'est_duration' => '3 Jam Express',
            'is_available' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('branch_treatments', [
            'id' => $branchTreatment->id,
            'price' => 45000,
            'est_duration' => '3 Jam Express',
        ]);
    }

    /**
     * Test Akun non-superadmin tidak diizinkan mengubah harga Master Treatment.
     */
    public function test_non_superadmin_cannot_update_treatment_price(): void
    {
        $manager = User::where('role', 'branch_manager')->first();
        $treatment = MasterTreatment::first();

        $response = $this->actingAs($manager)->put("/admin/treatments/{$treatment->id}", [
            'name' => 'Hacked',
            'category' => 'Hacked',
            'description' => 'Hacked',
            'default_price' => 1000,
            'est_duration' => 'Instant',
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test SAC Jatiwaringin tidak memiliki nama (Jawara) dan tidak memiliki layanan SAC GO (Walk-in only).
     */
    public function test_sac_jatiwaringin_has_no_jawara_in_name_and_no_sac_go(): void
    {
        // Pastikan tidak ada gerai dengan kata 'Jawara'
        $this->assertDatabaseMissing('branches', [
            'branch_name' => 'SAC Jatiwaringin (Jawara)',
        ]);

        // Pastikan gerai SAC Jatiwaringin ada dan is_pickup_available = false
        $branch = Branch::where('branch_name', 'SAC Jatiwaringin')->first();
        $this->assertNotNull($branch);
        $this->assertFalse((bool) $branch->is_pickup_available);

        // Pastikan tidak ada BranchTreatment SAC GO untuk gerai ini
        $this->assertDatabaseMissing('branch_treatments', [
            'branch_id' => $branch->id,
            'name' => 'SAC GO (Fitur Antar-Jemput)',
        ]);
    }

    /**
     * Test Super Admin Pusat dapat mengubah jam buka cabang untuk weekday dan weekend.
     */
    public function test_superadmin_can_update_branch_operating_hours_weekday_and_weekend(): void
    {
        $superadmin = User::where('role', 'superadmin')->first();
        $branch = Branch::first();

        $payload = [
            'open_hour' => '08:30',
            'close_hour' => '20:30',
            'weekend_open_hour' => '11:00',
            'weekend_close_hour' => '19:00',
            'is_open_weekend' => true,
        ];

        $response = $this->actingAs($superadmin)->put("/admin/branches/{$branch->id}", $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('branches', [
            'id' => $branch->id,
            'open_hour' => '08:30',
            'close_hour' => '20:30',
            'weekend_open_hour' => '11:00',
            'weekend_close_hour' => '19:00',
            'is_open_weekend' => true,
        ]);
    }

    /**
     * Test Super Admin Pusat dapat menandai gerai tutup pada akhir pekan (weekend).
     */
    public function test_superadmin_can_mark_branch_closed_on_weekends(): void
    {
        $superadmin = User::where('role', 'superadmin')->first();
        $branch = Branch::first();

        $payload = [
            'open_hour' => '09:00',
            'close_hour' => '21:00',
            'is_open_weekend' => false,
        ];

        $response = $this->actingAs($superadmin)->put("/admin/branches/{$branch->id}", $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('branches', [
            'id' => $branch->id,
            'is_open_weekend' => false,
        ]);
    }

    /**
     * Test Non-superadmin (Kepala Cabang) dilarang mengubah data cabang via Admin Pusat.
     */
    public function test_non_superadmin_cannot_update_branch_via_admin(): void
    {
        $manager = User::where('role', 'branch_manager')->first();
        $branch = Branch::first();

        $response = $this->actingAs($manager)->put("/admin/branches/{$branch->id}", [
            'open_hour' => '06:00',
            'close_hour' => '23:00',
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test Kepala Cabang dapat mengubah jam operasional gerainya secara mandiri.
     */
    public function test_branch_manager_can_update_operating_hours(): void
    {
        $manager = User::where('role', 'branch_manager')->first();
        $branch = $manager->branch;

        $payload = [
            'open_hour' => '08:00',
            'close_hour' => '17:00',
            'weekend_open_hour' => '09:00',
            'weekend_close_hour' => '15:00',
            'is_open_weekend' => true,
            'operating_hours_daily' => [
                'Senin' => '08:00 - 17:00',
                'Selasa' => '08:00 - 17:00',
                'Rabu' => '08:00 - 17:00',
                'Kamis' => '08:00 - 17:00',
                'Jumat' => '08:00 - 17:00',
                'Sabtu' => '09:00 - 15:00',
                'Minggu' => '09:00 - 15:00',
            ],
        ];

        $response = $this->actingAs($manager)->put('/branch/operating-hours', $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('branches', [
            'id' => $branch->id,
            'open_hour' => '08:00',
            'close_hour' => '17:00',
            'weekend_open_hour' => '09:00',
            'weekend_close_hour' => '15:00',
            'is_open_weekend' => true,
        ]);

        $fresh = $branch->fresh();
        $this->assertEquals('08:00 - 17:00', $fresh->operating_hours_daily['Senin']);
        $this->assertEquals('09:00 - 15:00', $fresh->operating_hours_daily['Sabtu']);
    }

    /**
     * Test Staf Cabang dilarang mengubah jam operasional gerai (403 Forbidden).
     */
    public function test_branch_staff_cannot_update_operating_hours(): void
    {
        $staff = User::where('role', 'branch_staff')->first();

        $payload = [
            'open_hour' => '07:00',
            'close_hour' => '22:00',
        ];

        $response = $this->actingAs($staff)->put('/branch/operating-hours', $payload);
        $response->assertStatus(403);
    }
}
