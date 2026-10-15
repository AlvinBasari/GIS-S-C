<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\BranchTreatment;
use App\Models\District;
use App\Models\MasterTreatment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ShoeCareMapController extends Controller
{
    /**
     * Tampilkan halaman utama Web GIS Shoe Care Kota Bekasi.
     */
    public function index(Request $request): Response
    {
        $districts = District::withCount('branches')->get();
        $masterTreatments = MasterTreatment::where('is_active', true)->get();

        $query = Branch::query()
            ->with(['district', 'treatments'])
            ->where('is_active', true);

        // Filter kata kunci pencarian nama cabang / alamat / merk
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('brand_name', 'like', "%{$search}%")
                    ->orWhere('branch_name', 'like', "%{$search}%")
                    ->orWhere('full_address', 'like', "%{$search}%")
                    ->orWhere('benchmark_notes', 'like', "%{$search}%");
            });
        }

        // Filter kecamatan
        if ($request->filled('district_id') && $request->input('district_id') !== 'all') {
            $query->where('district_id', $request->input('district_id'));
        }

        // Filter cabang yang memiliki fitur SAC GO (antar-jemput) atau filter khusus
        if (($request->filled('has_special') && $request->boolean('has_special')) ||
            ($request->filled('has_sac_go') && $request->boolean('has_sac_go'))) {
            $query->where('is_pickup_available', true);
        }

        // Filter cabang yang menyediakan master treatment tertentu
        if ($request->filled('master_treatment_id') && $request->input('master_treatment_id') !== 'all') {
            $masterId = $request->input('master_treatment_id');
            $query->whereHas('treatments', function ($q) use ($masterId) {
                $q->where('master_treatment_id', $masterId);
            });
        }

        $branches = $query->get()->map(function (Branch $branch) use ($request) {
            $userLat = $request->input('user_lat');
            $userLng = $request->input('user_lng');

            // Hitung jarak Haversine (km) jika user mengirimkan koordinat GPS
            $distanceKm = null;
            if ($userLat !== null && $userLng !== null) {
                $distanceKm = $this->calculateHaversineDistance(
                    (float) $userLat,
                    (float) $userLng,
                    $branch->latitude,
                    $branch->longitude
                );
            }

            return [
                'id' => $branch->id,
                'district_id' => $branch->district_id,
                'district_name' => $branch->district?->name ?? 'Bekasi',
                'district_color' => $branch->district?->color_code ?? '#f59e0b',
                'brand_name' => $branch->brand_name,
                'branch_name' => $branch->branch_name,
                'slug' => $branch->slug,
                'full_address' => $branch->full_address,
                'benchmark_notes' => $branch->benchmark_notes,
                'kelurahan' => $branch->kelurahan,
                'postal_code' => $branch->postal_code,
                'latitude' => $branch->latitude,
                'longitude' => $branch->longitude,
                'phone_number' => $branch->phone_number,
                'whatsapp_number' => $branch->whatsapp_number,
                'instagram_handle' => $branch->instagram_handle,
                'gmaps_url' => $branch->gmaps_url,
                'rating' => $branch->rating,
                'review_count' => $branch->review_count,
                'open_hour' => $branch->open_hour,
                'close_hour' => $branch->close_hour,
                'weekend_open_hour' => $branch->weekend_open_hour ?? '10:00',
                'weekend_close_hour' => $branch->weekend_close_hour ?? '20:00',
                'is_open_weekend' => (bool) $branch->is_open_weekend,
                'is_pickup_available' => (bool) $branch->is_pickup_available,
                'pickup_coverage' => $branch->pickup_coverage,
                'image_url' => $branch->image_url,
                'treatments' => $branch->treatments->values(),
                'general_treatments' => $branch->treatments->where('treatment_type', 'UMUM')->values(),
                'special_treatments' => $branch->treatments->where('treatment_type', 'KHUSUS')->values(),
                'total_treatments_count' => $branch->treatments->count(),
            ];
        });

        // Urutkan berdasarkan jarak jika koordinat user tersedia
        if ($request->filled('user_lat') && $request->filled('user_lng')) {
            $branches = $branches->sortBy('distance_km')->values();
        }

        // Statistik Wilayah & GIS untuk Shoes and Care GIS
        $spatialStats = [
            'total_branches' => Branch::count(),
            'total_districts' => District::count(),
            'total_treatments' => BranchTreatment::count(),
            'special_treatments_count' => Branch::where('is_pickup_available', true)->count(),
            'sac_go_count' => Branch::where('is_pickup_available', true)->count(),
            'general_treatments_count' => BranchTreatment::where('treatment_type', 'UMUM')->count(),
            'districts_distribution' => $districts->map(fn (District $d) => [
                'name' => $d->name,
                'count' => $d->branches_count,
                'color' => $d->color_code,
            ]),
        ];

        return Inertia::render('ShoeCareMap', [
            'branches' => $branches,
            'districts' => $districts,
            'masterTreatments' => $masterTreatments,
            'spatialStats' => $spatialStats,
            'filters' => $request->only(['search', 'district_id', 'has_special', 'has_sac_go', 'master_treatment_id', 'user_lat', 'user_lng']),
        ]);
    }

    /**
     * Tambah data cabang baru dengan penentuan koordinat dan treatment.
     */
    public function storeBranch(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'district_id' => 'required|exists:districts,id',
            'brand_name' => 'required|string|max:100',
            'branch_name' => 'required|string|max:100',
            'full_address' => 'required|string',
            'benchmark_notes' => 'nullable|string|max:255',
            'kelurahan' => 'required|string|max:100',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'whatsapp_number' => 'required|string|max:25',
            'phone_number' => 'nullable|string|max:25',
            'instagram_handle' => 'nullable|string|max:50',
            'open_hour' => 'nullable|string',
            'close_hour' => 'nullable|string',
            'is_pickup_available' => 'nullable|boolean',
            'pickup_coverage' => 'nullable|string',
        ]);

        $slug = Str::slug($validated['brand_name'].' '.$validated['branch_name'].' '.rand(100, 999));
        $isPickup = $request->boolean('is_pickup_available');
        $pickupCoverage = $validated['pickup_coverage'] ?? ($isPickup ? 'Radius 5 km (Layanan Jemput & Antar Gratis)' : null);

        $branch = Branch::create([
            'district_id' => $validated['district_id'],
            'brand_name' => $validated['brand_name'],
            'branch_name' => $validated['branch_name'],
            'slug' => $slug,
            'full_address' => $validated['full_address'],
            'benchmark_notes' => $validated['benchmark_notes'] ?? null,
            'kelurahan' => $validated['kelurahan'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'whatsapp_number' => $validated['whatsapp_number'],
            'phone_number' => $validated['phone_number'] ?? null,
            'instagram_handle' => $validated['instagram_handle'] ?? null,
            'open_hour' => $validated['open_hour'] ?? '09:00',
            'close_hour' => $validated['close_hour'] ?? '21:00',
            'is_pickup_available' => $isPickup,
            'pickup_coverage' => $pickupCoverage,
            'rating' => 4.8,
            'review_count' => 12,
            'image_url' => 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
            'is_active' => true,
        ]);

        // Aktifkan default treatment umum untuk cabang baru
        $masterTreatments = MasterTreatment::where('is_active', true)->get();
        foreach ($masterTreatments as $mt) {
            BranchTreatment::create([
                'branch_id' => $branch->id,
                'master_treatment_id' => $mt->id,
                'treatment_type' => 'UMUM',
                'name' => $mt->name,
                'category' => $mt->category,
                'description' => $mt->description,
                'price' => $mt->default_price,
                'est_duration' => $mt->est_duration,
                'is_available' => true,
                'badge_label' => 'Layanan Standar',
            ]);
        }

        // Jika fitur SAC GO (antar-jemput) diaktifkan via toggle
        if ($isPickup) {
            BranchTreatment::create([
                'branch_id' => $branch->id,
                'master_treatment_id' => null,
                'treatment_type' => 'KHUSUS',
                'name' => 'SAC GO (Fitur Antar-Jemput)',
                'category' => 'Antar-Jemput',
                'description' => 'Layanan jemput dan antar gratis hingga radius 5 km dari lokasi gerai Anda oleh tim Shoes and Care.',
                'price' => 0,
                'est_duration' => 'Same Day / Sesuai Jadwal',
                'is_available' => true,
                'is_featured' => true,
                'badge_label' => 'SAC GO Aktif',
                'notes' => 'Pemesanan antar-jemput dapat dilakukan via WhatsApp resmi cabang atau hotline SAC GO.',
            ]);
        }

        return redirect()->route('map.index')->with('success', 'Cabang baru berhasil didaftarkan ke Shoes and Care GIS!');
    }

    /**
     * Toggle status SAC GO (antar-jemput) untuk cabang yang sudah ada.
     */
    public function toggleSacGo(Branch $branch): RedirectResponse
    {
        $branch->is_pickup_available = ! $branch->is_pickup_available;
        if ($branch->is_pickup_available) {
            $branch->pickup_coverage = $branch->pickup_coverage ?: 'Radius 5 km (Layanan Jemput & Antar Gratis)';
            BranchTreatment::updateOrCreate(
                [
                    'branch_id' => $branch->id,
                    'name' => 'SAC GO (Fitur Antar-Jemput)',
                ],
                [
                    'master_treatment_id' => null,
                    'treatment_type' => 'KHUSUS',
                    'category' => 'Antar-Jemput',
                    'description' => 'Layanan jemput dan antar gratis hingga radius 5 km dari lokasi gerai Anda oleh tim Shoes and Care.',
                    'price' => 0,
                    'est_duration' => 'Same Day / Sesuai Jadwal',
                    'is_available' => true,
                    'is_featured' => true,
                    'badge_label' => 'SAC GO Aktif',
                    'notes' => 'Pemesanan antar-jemput dapat dilakukan via WhatsApp resmi cabang atau hotline SAC GO.',
                ]
            );
        } else {
            BranchTreatment::where('branch_id', $branch->id)
                ->where('name', 'SAC GO (Fitur Antar-Jemput)')
                ->delete();
        }
        $branch->save();

        return redirect()->route('map.index')->with('success', "Status SAC GO cabang {$branch->branch_name} berhasil diperbarui!");
    }

    /**
     * Tambah treatment khusus ke cabang yang sudah ada.
     */
    public function storeSpecialTreatment(Request $request, Branch $branch): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'category' => 'required|string|max:50',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'est_duration' => 'required|string|max:50',
            'badge_label' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        BranchTreatment::create([
            'branch_id' => $branch->id,
            'master_treatment_id' => null,
            'treatment_type' => 'KHUSUS',
            'name' => $validated['name'],
            'category' => $validated['category'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'est_duration' => $validated['est_duration'],
            'is_available' => true,
            'is_featured' => true,
            'badge_label' => $validated['badge_label'] ?: 'Eksklusif '.$branch->branch_name,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('map.index')->with('success', "Treatment khusus berhasil ditambahkan untuk {$branch->branch_name}!");
    }

    /**
     * Hitung jarak lurus dengan rumus Haversine (kilometer).
     */
    private function calculateHaversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadiusKm = 6371.0;

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadiusKm * $c;
    }
}
