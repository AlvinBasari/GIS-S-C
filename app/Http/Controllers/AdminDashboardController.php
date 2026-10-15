<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\BranchTreatment;
use App\Models\District;
use App\Models\MasterTreatment;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    /**
     * Tampilkan Dashboard Pusat & Command Center GIS Nasional.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $districtFilter = $request->input('district_id');

        $branchesQuery = Branch::query()
            ->with([
                'district',
                'users' => fn ($q) => $q->where('role', 'branch_manager'),
                'treatments',
            ])
            ->withCount(['orders', 'treatments']);

        if ($search) {
            $branchesQuery->where(function ($q) use ($search) {
                $q->where('brand_name', 'like', "%{$search}%")
                    ->orWhere('branch_name', 'like', "%{$search}%")
                    ->orWhere('full_address', 'like', "%{$search}%");
            });
        }

        if ($districtFilter && $districtFilter !== 'all') {
            $branchesQuery->where('district_id', $districtFilter);
        }

        $branches = $branchesQuery->orderBy('id', 'desc')->get();
        $districts = District::withCount('branches')->get();
        $masterTreatments = MasterTreatment::all();

        $recentOrders = Order::query()
            ->with(['branch', 'items'])
            ->orderBy('created_at', 'desc')
            ->take(15)
            ->get();

        $stats = [
            'total_branches' => Branch::count(),
            'total_active_branches' => Branch::where('is_active', true)->count(),
            'total_sac_go_active' => Branch::where('is_pickup_available', true)->count(),
            'total_districts' => District::count(),
            'total_managers' => User::where('role', 'branch_manager')->count(),
            'total_staff' => User::where('role', 'branch_staff')->count(),
            'total_orders' => Order::count(),
            'orders_booked' => Order::where('status', 'BOOKED')->count(),
            'orders_in_progress' => Order::where('status', 'IN_PROGRESS')->count(),
            'orders_completed' => Order::where('status', 'COMPLETED')->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'branches' => $branches,
            'districts' => $districts,
            'masterTreatments' => $masterTreatments,
            'recentOrders' => $recentOrders,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'district_id' => $districtFilter ?? 'all',
            ],
        ]);
    }

    /**
     * Tampilkan Peta GIS Khusus Admin Pusat (Spatial Command Center HQ).
     */
    public function mapView(Request $request): Response
    {
        $branches = Branch::query()
            ->with(['district', 'users' => fn ($q) => $q->where('role', 'branch_manager')])
            ->withCount(['orders', 'treatments'])
            ->get();

        $districts = District::withCount('branches')->get();

        $spatialStats = [
            'total_branches' => Branch::count(),
            'total_active_branches' => Branch::where('is_active', true)->count(),
            'sac_go_branches' => Branch::where('is_pickup_available', true)->count(),
            'walk_in_only' => Branch::where('is_pickup_available', false)->count(),
            'total_districts' => District::count(),
            'total_orders' => Order::count(),
            'districts_distribution' => $districts->map(fn ($d) => [
                'id' => $d->id,
                'name' => $d->name,
                'count' => $d->branches_count,
            ]),
        ];

        return Inertia::render('Admin/AdminMap', [
            'branches' => $branches,
            'districts' => $districts,
            'spatialStats' => $spatialStats,
        ]);
    }

    /**
     * Toggle status SAC GO oleh Admin Pusat untuk gerai mana saja.
     */
    public function toggleSacGo(Branch $branch): RedirectResponse
    {
        $branch->is_pickup_available = ! $branch->is_pickup_available;
        $branch->save();

        if ($branch->is_pickup_available) {
            BranchTreatment::updateOrCreate(
                [
                    'branch_id' => $branch->id,
                    'name' => 'SAC GO (Fitur Antar-Jemput)',
                ],
                [
                    'master_treatment_id' => null,
                    'treatment_type' => 'KHUSUS',
                    'category' => 'Antar-Jemput',
                    'description' => 'Layanan jemput dan antar gratis hingga radius 5 km dari gerai.',
                    'price' => 0,
                    'est_duration' => 'Same Day / Sesuai Jadwal',
                    'is_available' => true,
                    'is_featured' => true,
                    'badge_label' => 'SAC GO Aktif',
                ]
            );
        } else {
            BranchTreatment::where('branch_id', $branch->id)
                ->where('name', 'SAC GO (Fitur Antar-Jemput)')
                ->delete();
        }

        $statusText = $branch->is_pickup_available ? 'DIAKTIFKAN' : 'DINONAKTIFKAN';

        return back()->with('success', "Fitur SAC GO untuk {$branch->branch_name} berhasil {$statusText}!");
    }

    /**
     * Tambah Cabang Baru oleh Admin Pusat.
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
            'postal_code' => 'nullable|string|max:10',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'whatsapp_number' => 'required|string|max:25',
            'phone_number' => 'nullable|string|max:25',
            'open_hour' => 'nullable|string|max:10',
            'close_hour' => 'nullable|string|max:10',
            'weekend_open_hour' => 'nullable|string|max:10',
            'weekend_close_hour' => 'nullable|string|max:10',
            'is_open_weekend' => 'nullable|boolean',
            'is_pickup_available' => 'nullable|boolean',
            'pickup_coverage' => 'nullable|string',
        ]);

        $slug = Str::slug($validated['brand_name'].' '.$validated['branch_name'].'-'.rand(100, 999));
        $isPickup = $request->boolean('is_pickup_available');

        $branch = Branch::create([
            'district_id' => $validated['district_id'],
            'brand_name' => $validated['brand_name'],
            'branch_name' => $validated['branch_name'],
            'slug' => $slug,
            'full_address' => $validated['full_address'],
            'benchmark_notes' => $validated['benchmark_notes'] ?? null,
            'kelurahan' => $validated['kelurahan'],
            'postal_code' => $validated['postal_code'] ?? '10000',
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'whatsapp_number' => $validated['whatsapp_number'],
            'phone_number' => $validated['phone_number'] ?? null,
            'instagram_handle' => 'shoesandcare',
            'open_hour' => $validated['open_hour'] ?? '09:00',
            'close_hour' => $validated['close_hour'] ?? '21:00',
            'weekend_open_hour' => $validated['weekend_open_hour'] ?? '10:00',
            'weekend_close_hour' => $validated['weekend_close_hour'] ?? '20:00',
            'is_open_weekend' => $request->has('is_open_weekend') ? $request->boolean('is_open_weekend') : true,
            'is_pickup_available' => $isPickup,
            'pickup_coverage' => $validated['pickup_coverage'] ?? ($isPickup ? 'Radius 5 km (Layanan Jemput & Antar Gratis / SAC GO)' : null),
            'rating' => 4.9,
            'review_count' => 10,
            'image_url' => 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
            'is_active' => true,
        ]);

        // Aktifkan seluruh master treatment resmi
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
                'is_featured' => $mt->is_popular,
                'badge_label' => 'Layanan Resmi SAC',
            ]);
        }

        if ($isPickup) {
            BranchTreatment::create([
                'branch_id' => $branch->id,
                'master_treatment_id' => null,
                'treatment_type' => 'KHUSUS',
                'name' => 'SAC GO (Fitur Antar-Jemput)',
                'category' => 'Antar-Jemput',
                'description' => 'Layanan jemput dan antar gratis hingga radius 5 km dari gerai. Dikerjakan oleh teknisi ahli Shoes and Care dengan jaminan garansi.',
                'price' => 0,
                'est_duration' => 'Same Day / Sesuai Jadwal',
                'is_available' => true,
                'is_featured' => true,
                'badge_label' => 'SAC GO Aktif',
            ]);
        }

        return back()->with('success', "Cabang baru '{$branch->branch_name}' berhasil ditambahkan ke direktori nasional!");
    }

    /**
     * Update Data Cabang & Jam Operasional oleh Admin Pusat.
     */
    public function updateBranch(Request $request, Branch $branch): RedirectResponse
    {
        $validated = $request->validate([
            'district_id' => 'sometimes|exists:districts,id',
            'branch_name' => 'sometimes|string|max:100',
            'full_address' => 'sometimes|string',
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',
            'whatsapp_number' => 'sometimes|string|max:25',
            'phone_number' => 'nullable|string|max:25',
            'open_hour' => 'nullable|string|max:10',
            'close_hour' => 'nullable|string|max:10',
            'weekend_open_hour' => 'nullable|string|max:10',
            'weekend_close_hour' => 'nullable|string|max:10',
            'is_open_weekend' => 'nullable|boolean',
            'is_pickup_available' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'gmaps_opening_hours_text' => 'nullable|string',
            'operating_hours_daily' => 'nullable|array',
        ]);

        if ($request->has('is_open_weekend')) {
            $validated['is_open_weekend'] = $request->boolean('is_open_weekend');
        }

        if ($request->has('is_pickup_available')) {
            $validated['is_pickup_available'] = $request->boolean('is_pickup_available');

            if ($validated['is_pickup_available']) {
                BranchTreatment::updateOrCreate(
                    [
                        'branch_id' => $branch->id,
                        'name' => 'SAC GO (Fitur Antar-Jemput)',
                    ],
                    [
                        'master_treatment_id' => null,
                        'treatment_type' => 'KHUSUS',
                        'category' => 'Antar-Jemput',
                        'description' => 'Layanan jemput dan antar gratis hingga radius 5 km dari gerai.',
                        'price' => 0,
                        'est_duration' => 'Same Day / Sesuai Jadwal',
                        'is_available' => true,
                        'is_featured' => true,
                        'badge_label' => 'SAC GO Aktif',
                    ]
                );
            } else {
                BranchTreatment::where('branch_id', $branch->id)
                    ->where('name', 'like', '%SAC GO%')
                    ->delete();
            }
        }

        $branch->update($validated);

        return back()->with('success', "Informasi dan jam operasional cabang '{$branch->branch_name}' berhasil diperbarui!");
    }

    /**
     * Hapus Cabang oleh Admin Pusat.
     */
    public function deleteBranch(Branch $branch): RedirectResponse
    {
        $name = $branch->branch_name;
        $branch->delete();

        return back()->with('success', "Cabang '{$name}' telah dihapus dari sistem.");
    }

    /**
     * Buat Akun Kepala Cabang oleh Super Admin.
     */
    public function storeBranchManager(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:25',
        ]);

        $user = User::create([
            'branch_id' => $validated['branch_id'],
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'branch_manager',
            'phone' => $validated['phone'] ?? null,
            'is_active' => true,
        ]);

        $branch = Branch::find($validated['branch_id']);

        return back()->with('success', "Akun Kepala Cabang untuk '{$branch->branch_name}' ({$user->email}) berhasil dibuat!");
    }

    /**
     * Tambah Master Treatment baru oleh Super Admin.
     */
    public function storeMasterTreatment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'category' => 'required|string|max:50',
            'description' => 'required|string',
            'default_price' => 'required|numeric|min:0',
            'est_duration' => 'required|string|max:50',
            'is_popular' => 'nullable|boolean',
        ]);

        MasterTreatment::updateOrCreate(
            ['name' => $validated['name']],
            [
                'slug' => Str::slug($validated['name']),
                'category' => $validated['category'],
                'description' => $validated['description'],
                'default_price' => $validated['default_price'],
                'est_duration' => $validated['est_duration'],
                'is_popular' => $request->boolean('is_popular'),
                'is_active' => true,
            ]
        );

        return back()->with('success', "Master Treatment '{$validated['name']}' berhasil disimpan!");
    }

    /**
     * Update Harga & Detail Master Treatment oleh Super Admin Pusat.
     * Dapat otomatis menyinkronkan perubahan harga ke seluruh 69 cabang.
     */
    public function updateMasterTreatment(Request $request, MasterTreatment $treatment): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'category' => 'required|string|max:50',
            'description' => 'required|string',
            'default_price' => 'required|numeric|min:0',
            'est_duration' => 'required|string|max:50',
            'is_popular' => 'nullable|boolean',
            'sync_to_branches' => 'nullable|boolean',
        ]);

        $treatment->update([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'description' => $validated['description'],
            'default_price' => $validated['default_price'],
            'est_duration' => $validated['est_duration'],
            'is_popular' => $request->boolean('is_popular'),
        ]);

        $syncedCount = 0;
        if ($request->boolean('sync_to_branches', true)) {
            $syncedCount = BranchTreatment::where('master_treatment_id', $treatment->id)
                ->orWhere('name', $treatment->name)
                ->update([
                    'name' => $validated['name'],
                    'category' => $validated['category'],
                    'description' => $validated['description'],
                    'price' => $validated['default_price'],
                    'est_duration' => $validated['est_duration'],
                ]);
        }

        $syncMsg = $syncedCount > 0 ? " dan otomatis disinkronkan ke {$syncedCount} cabang!" : '!';

        return back()->with('success', "Harga layanan Master Treatment '{$treatment->name}' berhasil diperbarui menjadi Rp ".number_format($treatment->default_price, 0, ',', '.')."{$syncMsg}");
    }

    /**
     * Update Harga & Status Treatment Spesifik pada Cabang Tertentu.
     */
    public function updateBranchTreatment(Request $request, BranchTreatment $branchTreatment): RedirectResponse
    {
        $validated = $request->validate([
            'price' => 'required|numeric|min:0',
            'est_duration' => 'nullable|string|max:50',
            'is_available' => 'nullable|boolean',
        ]);

        $branchTreatment->update([
            'price' => $validated['price'],
            'est_duration' => $validated['est_duration'] ?? $branchTreatment->est_duration,
            'is_available' => $request->has('is_available') ? $request->boolean('is_available') : $branchTreatment->is_available,
        ]);

        return back()->with('success', "Harga layanan '{$branchTreatment->name}' untuk cabang {$branchTreatment->branch?->branch_name} berhasil diperbarui menjadi Rp ".number_format($branchTreatment->price, 0, ',', '.'));
    }
}
