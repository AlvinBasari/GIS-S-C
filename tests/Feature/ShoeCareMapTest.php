<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\District;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ShoeCareMapTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * Test halaman utama Web GIS Shoe Care dapat diakses dengan props Inertia lengkap.
     */
    public function test_main_web_gis_page_is_accessible_and_renders_inertia_data(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('ShoeCareMap')
            ->has('branches')
            ->has('districts')
            ->has('masterTreatments')
            ->has('spatialStats')
        );
    }

    /**
     * Test filter cabang berdasarkan kecamatan.
     */
    public function test_can_filter_branches_by_district(): void
    {
        $bekasiSelatan = District::where('name', 'Bekasi Selatan')->first();

        $response = $this->get('/?district_id='.$bekasiSelatan->id);

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('ShoeCareMap')
            ->has('branches', fn (Assert $branches) => $branches
                ->each(fn (Assert $branch) => $branch
                    ->where('district_id', $bekasiSelatan->id)
                    ->etc()
                )
            )
        );
    }

    /**
     * Test filter cabang yang hanya memiliki treatment khusus.
     */
    public function test_can_filter_branches_with_special_treatments_only(): void
    {
        $response = $this->get('/?has_special=1');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('ShoeCareMap')
            ->has('branches')
        );
    }

    /**
     * Test pendaftaran cabang baru dengan koordinat spasial dan treatment khusus.
     */
    public function test_can_store_new_branch_with_special_treatment(): void
    {
        $district = District::first();

        $payload = [
            'district_id' => $district->id,
            'brand_name' => 'Kicks Atelier',
            'branch_name' => 'Cabang Galaxy 2',
            'full_address' => 'Jl. Pulo Sirih Barat No. 88, Bekasi Selatan',
            'benchmark_notes' => 'Dekat Kolam Renang Tirtamas Galaxy',
            'kelurahan' => 'Jaka Setia',
            'latitude' => -6.2678120,
            'longitude' => 106.9789100,
            'whatsapp_number' => '6281234567890',
            'open_hour' => '09:00',
            'close_hour' => '21:00',
            'is_pickup_available' => true,
            'pickup_coverage' => 'Radius 5 km',
            'special_treatment_name' => 'Custom Embroidery Sneaker',
            'special_treatment_price' => 200000,
            'special_treatment_desc' => 'Bordir manual inisial nama pada sneakers kanvas.',
            'special_treatment_duration' => '3 Hari',
            'special_treatment_badge' => 'Eksklusif Galaxy 2',
        ];

        $response = $this->post('/branches', $payload);

        $response->assertRedirect('/');

        $this->assertDatabaseHas('branches', [
            'brand_name' => 'Kicks Atelier',
            'branch_name' => 'Cabang Galaxy 2',
            'kelurahan' => 'Jaka Setia',
        ]);

        $this->assertDatabaseHas('branch_treatments', [
            'name' => 'Custom Embroidery Sneaker',
            'treatment_type' => 'KHUSUS',
            'price' => 200000,
        ]);
    }

    /**
     * Test penambahan treatment khusus ke cabang yang sudah ada.
     */
    public function test_can_add_special_treatment_to_existing_branch(): void
    {
        $branch = Branch::first();

        $payload = [
            'name' => 'Custom Suede Dye Dark Green',
            'category' => 'Custom Dye',
            'description' => 'Pewarnaan ulang bahan suede menjadi hijau botol pekat.',
            'price' => 175000,
            'est_duration' => '4 Hari',
            'badge_label' => 'Spesialis Suede Dye',
        ];

        $response = $this->post("/branches/{$branch->id}/special-treatments", $payload);

        $response->assertRedirect('/');

        $this->assertDatabaseHas('branch_treatments', [
            'branch_id' => $branch->id,
            'name' => 'Custom Suede Dye Dark Green',
            'treatment_type' => 'KHUSUS',
            'price' => 175000,
        ]);
    }
}
