<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\BranchTreatment;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerOrderController extends Controller
{
    /**
     * Pemesanan Perawatan Sepatu (SAC GO Antar-Jemput / Walk-In) oleh Konsumen.
     */
    public function bookOrder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'customer_name' => 'required|string|max:100',
            'customer_phone' => 'required|string|max:25',
            'pickup_address' => 'required|string',
            'pickup_lat' => 'nullable|numeric|between:-90,90',
            'pickup_lng' => 'nullable|numeric|between:-180,180',
            'service_type' => 'required|in:SAC_GO,WALK_IN',
            'pair_count' => 'required|integer|min:1|max:20',
            'shoe_type' => 'required|string|max:100',
            'shoe_brand' => 'nullable|string|max:100',
            'shoe_color' => 'nullable|string|max:50',
            'shoe_material' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
            'treatments' => 'required|array|min:1',
            'treatments.*' => 'exists:branch_treatments,id',
        ]);

        $branch = Branch::findOrFail($validated['branch_id']);

        if ($validated['service_type'] === 'SAC_GO' && ! $branch->is_pickup_available) {
            return back()->withErrors([
                'service_type' => 'Layanan antar-jemput SAC GO saat ini hanya tersedia di wilayah DKI Jakarta dan DI Yogyakarta. Untuk cabang ini, silakan gunakan pemesanan Datang Langsung (Walk-In).',
            ]);
        }

        // Generate Order Code Unik Terstruktur: SAC-{KODE_CABANG}-{YYYYMM}-{RANDOM4}
        $branchCode = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $branch->branch_name), 0, 3));
        if (strlen($branchCode) < 3) {
            $branchCode = 'SAC';
        }
        $orderCode = "SAC-{$branchCode}-".date('Ym').'-'.strtoupper(substr(uniqid(), -4));

        // Hitung total harga dari treatment yang dipilih
        $treatments = BranchTreatment::whereIn('id', $validated['treatments'])->get();
        $pricePerPair = $treatments->sum('price');
        $totalPrice = $pricePerPair * (int) $validated['pair_count'];

        $order = Order::create([
            'order_code' => $orderCode,
            'branch_id' => $branch->id,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'pickup_address' => $validated['pickup_address'],
            'pickup_lat' => $validated['pickup_lat'] ?? null,
            'pickup_lng' => $validated['pickup_lng'] ?? null,
            'service_type' => $validated['service_type'],
            'status' => 'BOOKED',
            'pair_count' => $validated['pair_count'],
            'shoe_type' => $validated['shoe_type'],
            'total_price' => $totalPrice,
            'payment_status' => 'UNPAID',
            'payment_method' => $validated['service_type'] === 'SAC_GO' ? 'COD' : 'CASH',
            'notes' => $validated['notes'] ?? null,
            'pickup_time' => now(),
        ]);

        foreach ($treatments as $t) {
            OrderItem::create([
                'order_id' => $order->id,
                'branch_treatment_id' => $t->id,
                'treatment_name' => $t->name,
                'brand_model' => $validated['shoe_brand'] ?? $validated['shoe_type'],
                'color' => $validated['shoe_color'] ?? null,
                'material' => $validated['shoe_material'] ?? null,
                'price' => $t->price,
            ]);
        }

        // WhatsApp Deep-Link Message Resmi Shoes and Care
        $greeting = "Halo Shoes and Care {$branch->branch_name}, saya *{$order->customer_name}* ingin konfirmasi booking perawatan sepatu.";
        $itemsList = $treatments->map(fn ($t) => '- '.$t->name.' (Rp '.number_format($t->price, 0, ',', '.').')')->implode("\n");
        $serviceText = $order->service_type === 'SAC_GO' ? 'Antar-Jemput SAC GO' : 'Datang ke Gerai (Walk-In)';

        $waText = "{$greeting}\n\n"
            ."*No. Pesanan:* {$order->order_code}\n"
            ."*Layanan:* {$serviceText}\n"
            ."*Jenis Sepatu:* {$order->shoe_type} ({$order->pair_count} pasang)\n"
            ."*Alamat Jemput:* {$order->pickup_address}\n"
            ."*Menu Perawatan:*\n{$itemsList}\n"
            .'*Estimasi Biaya:* Rp '.number_format($order->total_price, 0, ',', '.')."\n\n"
            .'*Lacak Progres & Garansi:* http://127.0.0.1:8000/track?code='.$order->order_code."\n\n"
            .'Mohon info jadwal penjemputan dari kurir SAC GO. Terima kasih!';

        $cleanWa = preg_replace('/\D/', '', $branch->whatsapp_number);
        if (str_starts_with($cleanWa, '0')) {
            $cleanWa = '62'.substr($cleanWa, 1);
        }

        $waUrl = "https://wa.me/{$cleanWa}?text=".urlencode($waText);

        return redirect()->route('track.index', ['code' => $orderCode])
            ->with('success', "Pesanan Anda berhasil dibuat dengan Kode: {$orderCode}!")
            ->with('whatsapp_url', $waUrl);
    }

    /**
     * Halaman Pelacakan Sepatu (Track Order Real-Time).
     */
    public function trackPage(Request $request): Response
    {
        $code = trim($request->input('code', ''));
        $order = null;

        if ($code !== '') {
            $order = Order::query()
                ->where('order_code', $code)
                ->orWhere('customer_phone', $code)
                ->with(['branch.district', 'items'])
                ->first();
        }

        return Inertia::render('Track/OrderTracking', [
            'searchCode' => $code,
            'order' => $order,
        ]);
    }
}
