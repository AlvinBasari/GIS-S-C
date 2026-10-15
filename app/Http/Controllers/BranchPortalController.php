<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\BranchTreatment;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class BranchPortalController extends Controller
{
    /**
     * Tampilkan Portal Operasional Gerai Cabang.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        // Jika superadmin mengakses portal cabang tanpa branch_id, arahkan ke cabang pertama
        $branchId = $user->branch_id ?? Branch::first()?->id;

        if (! $branchId) {
            return redirect()->route('admin.dashboard')->with('error', 'Tidak ada data gerai aktif.');
        }

        $branch = Branch::with(['district', 'treatments'])->findOrFail($branchId);

        $statusFilter = $request->input('status');
        $ordersQuery = Order::where('branch_id', $branch->id)->with('items')->orderBy('created_at', 'desc');

        if ($statusFilter && $statusFilter !== 'all') {
            $ordersQuery->where('status', $statusFilter);
        }

        $orders = $ordersQuery->get();

        // Staf cabang di bawah gerai ini
        $staffMembers = User::where('branch_id', $branch->id)
            ->where('role', 'branch_staff')
            ->orderBy('name')
            ->get();

        $stats = [
            'total_orders' => Order::where('branch_id', $branch->id)->count(),
            'orders_booked' => Order::where('branch_id', $branch->id)->whereIn('status', ['BOOKED', 'PENDING_CONFIRMATION'])->count(),
            'orders_pickup' => Order::where('branch_id', $branch->id)->whereIn('status', ['OUT_FOR_PICKUP', 'PICKED_UP'])->count(),
            'orders_in_progress' => Order::where('branch_id', $branch->id)->whereIn('status', ['INTAKE_VERIFIED', 'IN_PROGRESS'])->count(),
            'orders_ready' => Order::where('branch_id', $branch->id)->whereIn('status', ['READY', 'READY_FOR_DELIVERY', 'READY_FOR_PICKUP'])->count(),
            'orders_completed' => Order::where('branch_id', $branch->id)->where('status', 'COMPLETED')->count(),
            'is_pickup_available' => (bool) $branch->is_pickup_available,
            'total_staff' => $staffMembers->count(),
        ];

        return Inertia::render('Branch/Dashboard', [
            'branch' => $branch,
            'orders' => $orders,
            'staffMembers' => $staffMembers,
            'stats' => $stats,
            'userRole' => $user->role,
            'canManageStaff' => $user->canManageStaff(),
            'filters' => [
                'status' => $statusFilter ?? 'all',
            ],
        ]);
    }

    /**
     * Toggle status mandiri SAC GO oleh personil cabang.
     */
    public function toggleSacGo(): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $branch = $user->branch ?? Branch::first();

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

        return back()->with('success', "Layanan SAC GO untuk {$branch->branch_name} berhasil {$statusText}!");
    }

    /**
     * Update status pengerjaan sepatu pada order sesuai SOP 6 Tahapan.
     */
    public function updateOrderStatus(Request $request, Order $order): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        // Pastikan order milik cabang user (kecuali superadmin)
        if (! $user->isSuperAdmin() && $order->branch_id !== $user->branch_id) {
            abort(403, 'Anda tidak berhak memperbarui pesanan cabang lain.');
        }

        $validated = $request->validate([
            'status' => 'required|string|in:BOOKED,PENDING_CONFIRMATION,OUT_FOR_PICKUP,PICKED_UP,INTAKE_VERIFIED,IN_PROGRESS,READY,READY_FOR_DELIVERY,READY_FOR_PICKUP,COMPLETED,CANCELLED',
            'courier_name' => 'nullable|string|max:100',
            'technician_name' => 'nullable|string|max:100',
            'diagnosis_notes' => 'nullable|string',
            'payment_status' => 'nullable|string|in:UNPAID,PAID',
            'payment_method' => 'nullable|string|max:50',
            'before_photo_url' => 'nullable|string',
            'after_photo_url' => 'nullable|string',
        ]);

        $order->status = $validated['status'];

        if (array_key_exists('courier_name', $validated) && $validated['courier_name'] !== null) {
            $order->courier_name = $validated['courier_name'];
        }
        if (array_key_exists('technician_name', $validated) && $validated['technician_name'] !== null) {
            $order->technician_name = $validated['technician_name'];
        }
        if (array_key_exists('diagnosis_notes', $validated) && $validated['diagnosis_notes'] !== null) {
            $order->diagnosis_notes = $validated['diagnosis_notes'];
        }
        if (array_key_exists('payment_status', $validated) && $validated['payment_status'] !== null) {
            $order->payment_status = $validated['payment_status'];
        }
        if (array_key_exists('payment_method', $validated) && $validated['payment_method'] !== null) {
            $order->payment_method = $validated['payment_method'];
        }
        if (array_key_exists('before_photo_url', $validated) && $validated['before_photo_url'] !== null) {
            $order->before_photo_url = $validated['before_photo_url'];
        }
        if (array_key_exists('after_photo_url', $validated) && $validated['after_photo_url'] !== null) {
            $order->after_photo_url = $validated['after_photo_url'];
        }

        if ($validated['status'] === 'COMPLETED') {
            $order->completed_at = now();
            $order->payment_status = 'PAID';
            $order->warranty_until = now()->addDays(3);
        }

        $order->save();

        return back()->with('success', "Status pesanan {$order->order_code} berhasil diubah menjadi {$order->status}!");
    }

    /**
     * Update foto dokumentasi Before & After.
     */
    public function uploadOrderPhotos(Request $request, Order $order): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if (! $user->isSuperAdmin() && $order->branch_id !== $user->branch_id) {
            abort(403);
        }

        $validated = $request->validate([
            'before_photo_url' => 'nullable|string',
            'after_photo_url' => 'nullable|string',
            'diagnosis_notes' => 'nullable|string',
        ]);

        $order->update($validated);

        return back()->with('success', "Dokumentasi foto garansi untuk {$order->order_code} berhasil disimpan!");
    }

    /**
     * Kepala Cabang membuat Akun Staff baru di bawah cabangnya.
     */
    public function storeStaff(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if (! $user->canManageStaff()) {
            abort(403, 'Hanya Kepala Cabang atau Super Admin yang dapat membuat akun staf.');
        }

        $branchId = $user->branch_id ?? $request->input('branch_id');

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:25',
        ]);

        User::create([
            'branch_id' => $branchId,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'branch_staff',
            'phone' => $validated['phone'] ?? null,
            'is_active' => true,
        ]);

        return back()->with('success', "Akun staf '{$validated['name']}' berhasil dibuat untuk cabang Anda!");
    }

    /**
     * Kepala Cabang menonaktifkan akun staf.
     */
    public function deleteStaff(User $staff): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if (! $user->canManageStaff()) {
            abort(403);
        }

        if (! $user->isSuperAdmin() && $staff->branch_id !== $user->branch_id) {
            abort(403, 'Anda hanya dapat mengelola staf di cabang Anda sendiri.');
        }

        $staffName = $staff->name;
        $staff->delete();

        return back()->with('success', "Akun staf '{$staffName}' telah dihapus.");
    }

    /**
     * Tambah treatment khusus cabang.
     */
    public function storeSpecialTreatment(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $branch = $user->branch ?? Branch::first();

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'category' => 'required|string|max:50',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'est_duration' => 'required|string|max:50',
            'badge_label' => 'nullable|string|max:100',
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
            'badge_label' => $validated['badge_label'] ?: 'Spesialisasi '.$branch->branch_name,
        ]);

        return back()->with('success', "Treatment khusus '{$validated['name']}' berhasil ditambahkan ke gerai Anda!");
    }

    /**
     * Update Jam Operasional Gerai oleh Kepala Cabang.
     */
    public function updateOperatingHours(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if (! $user->canManageStaff()) {
            abort(403, 'Hanya Kepala Cabang yang memiliki wewenang mengubah jam operasional gerai.');
        }

        $branch = $user->branch ?? Branch::first();
        if (! $branch) {
            abort(404, 'Gerai tidak ditemukan.');
        }

        $validated = $request->validate([
            'open_hour' => 'required|string|max:10',
            'close_hour' => 'required|string|max:10',
            'weekend_open_hour' => 'nullable|string|max:10',
            'weekend_close_hour' => 'nullable|string|max:10',
            'is_open_weekend' => 'nullable|boolean',
            'operating_hours_daily' => 'nullable|array',
            'gmaps_opening_hours_text' => 'nullable|string',
        ]);

        $isOpenWeekend = $request->has('is_open_weekend') ? $request->boolean('is_open_weekend') : true;
        $validated['is_open_weekend'] = $isOpenWeekend;

        if (isset($validated['operating_hours_daily']) && is_array($validated['operating_hours_daily'])) {
            $days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
            $daily = $validated['operating_hours_daily'];
            foreach ($days as $d) {
                if (! isset($daily[$d]) || trim($daily[$d]) === '') {
                    if ($d === 'Sabtu' || $d === 'Minggu') {
                        $daily[$d] = $isOpenWeekend ? (($validated['weekend_open_hour'] ?? '10:00').' - '.($validated['weekend_close_hour'] ?? '20:00')) : 'Tutup';
                    } else {
                        $daily[$d] = $validated['open_hour'].' - '.$validated['close_hour'];
                    }
                }
            }
            $validated['operating_hours_daily'] = $daily;
            $validated['gmaps_opening_hours_text'] = 'Sen - Jum: '.$daily['Senin'].' | Sab: '.$daily['Sabtu'].' | Min: '.$daily['Minggu'];
        }

        $branch->update($validated);

        return back()->with('success', "Jam operasional cabang '{$branch->branch_name}' berhasil diperbarui oleh Kepala Cabang!");
    }
}
