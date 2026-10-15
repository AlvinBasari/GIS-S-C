import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { 
    X, 
    Truck, 
    Sparkles, 
    Check, 
    MapPin, 
    Phone, 
    Calendar, 
    Clock, 
    Navigation,
    ShieldCheck,
    CheckSquare,
    AlertCircle
} from 'lucide-react';

export default function BookingModal({
    branches = [],
    initialBranch = null,
    initialTreatments = [],
    initialPairCount = 1,
    initialShoeType = 'Sneakers Casual / Canvas',
    onClose = () => {},
    userLocation = null,
}) {
    const defaultBranch = initialBranch || branches[0] || {};

    const { data, setData, post, processing, errors } = useForm({
        branch_id: defaultBranch.id || '',
        customer_name: '',
        customer_phone: '',
        pickup_address: '',
        pickup_lat: userLocation ? userLocation.lat : defaultBranch.latitude,
        pickup_lng: userLocation ? userLocation.lng : defaultBranch.longitude,
        service_type: defaultBranch.is_pickup_available ? 'SAC_GO' : 'WALK_IN',
        pair_count: initialPairCount || 1,
        shoe_type: initialShoeType || 'Sneakers Casual / Canvas',
        shoe_brand: '',
        shoe_color: '',
        shoe_material: '',
        notes: '',
        treatments: initialTreatments || [], // array of treatment IDs
    });

    const activeBranch = useMemo(() => {
        return branches.find((b) => b.id === Number(data.branch_id)) || defaultBranch;
    }, [branches, data.branch_id, defaultBranch]);

    // Ambil daftar treatment dari treatments array atau general + special
    const availableTreatments = useMemo(() => {
        if (activeBranch?.treatments && activeBranch.treatments.length > 0) {
            return activeBranch.treatments;
        }
        const general = activeBranch?.general_treatments || [];
        const special = activeBranch?.special_treatments || [];
        if (general.length > 0 || special.length > 0) {
            return [...general, ...special];
        }
        return [];
    }, [activeBranch]);

    // Auto-select treatment pertama jika belum ada yang terpilih
    useEffect(() => {
        if (data.treatments.length === 0 && availableTreatments.length > 0) {
            setData('treatments', [availableTreatments[0].id]);
        }
    }, [availableTreatments]);

    // Jika cabang yang dipilih tidak menyediakan SAC GO, alihkan otomatis ke WALK_IN
    useEffect(() => {
        if (activeBranch && !activeBranch.is_pickup_available && data.service_type === 'SAC_GO') {
            setData('service_type', 'WALK_IN');
        }
    }, [activeBranch]);

    const handleTreatmentToggle = (treatmentId) => {
        if (data.treatments.includes(treatmentId)) {
            // Cegah uncheck jika hanya tersisa 1 item agar tidak kosong
            if (data.treatments.length > 1) {
                setData('treatments', data.treatments.filter((id) => id !== treatmentId));
            }
        } else {
            setData('treatments', [...data.treatments, treatmentId]);
        }
    };

    const handleUseGpsLocation = () => {
        if (userLocation) {
            setData((prev) => ({
                ...prev,
                pickup_lat: userLocation.lat,
                pickup_lng: userLocation.lng,
                pickup_address: prev.pickup_address || `Lokasi Terdeteksi GPS (${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)})`,
            }));
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setData((prev) => ({
                    ...prev,
                    pickup_lat: pos.coords.latitude,
                    pickup_lng: pos.coords.longitude,
                    pickup_address: prev.pickup_address || `Lokasi GPS (${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)})`,
                }));
            });
        }
    };

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
    };

    const estimatedTotal = useMemo(() => {
        const selected = availableTreatments.filter((t) => data.treatments.includes(t.id));
        const pricePerPair = selected.reduce((acc, curr) => acc + (curr.price || 0), 0);
        return pricePerPair * Number(data.pair_count);
    }, [availableTreatments, data.treatments, data.pair_count]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/booking', {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden font-sans">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-stone-200/80 bg-stone-50/70 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
                            <Truck className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                                    Form Pemesanan Cuci Sepatu (In-App)
                                </h2>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                                    Sistem Otomatis
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Pesanan langsung masuk antrean database cabang & pelacakan status real-time
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
                    {/* Pilih Gerai Tujuan */}
                    <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                            Pilih Gerai Shoes and Care Tujuan *
                        </label>
                        <select
                            value={data.branch_id}
                            onChange={(e) => {
                                const newBranchId = Number(e.target.value);
                                setData('branch_id', newBranchId);
                                const newBranch = branches.find((b) => b.id === newBranchId);
                                const newTreatments = newBranch?.treatments?.length ? newBranch.treatments : [...(newBranch?.general_treatments || []), ...(newBranch?.special_treatments || [])];
                                setData('treatments', newTreatments[0]?.id ? [newTreatments[0].id] : []);
                            }}
                            className="w-full p-2.5 bg-stone-50/70 border border-stone-200/90 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer text-xs"
                        >
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.branch_name} ({b.district_name}) {b.is_pickup_available ? '• SAC GO Siap' : '• Walk-in Only'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Data Konsumen */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Nama Pemilik Sepatu *</label>
                            <input
                                type="text"
                                required
                                value={data.customer_name}
                                onChange={(e) => setData('customer_name', e.target.value)}
                                placeholder="Contoh: Alvin Pratama"
                                className="w-full p-2.5 bg-stone-50/70 border border-stone-200/90 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 text-xs"
                            />
                            {errors.customer_name && <p className="text-red-500 text-[10px] mt-0.5">{errors.customer_name}</p>}
                        </div>

                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Nomor WhatsApp Aktif *</label>
                            <input
                                type="text"
                                required
                                value={data.customer_phone}
                                onChange={(e) => setData('customer_phone', e.target.value)}
                                placeholder="081234567890"
                                className="w-full p-2.5 bg-stone-50/70 border border-stone-200/90 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 font-mono text-xs"
                            />
                            {errors.customer_phone && <p className="text-red-500 text-[10px] mt-0.5">{errors.customer_phone}</p>}
                        </div>
                    </div>

                    {/* Metode Layanan: SAC GO vs Walk In */}
                    <div>
                        <label className="font-semibold text-slate-700 block mb-1">Metode Layanan *</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                disabled={!activeBranch.is_pickup_available}
                                onClick={() => setData('service_type', 'SAC_GO')}
                                className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition ${
                                    data.service_type === 'SAC_GO'
                                        ? 'bg-amber-50 border-amber-400 text-amber-950 font-semibold ring-1 ring-amber-300'
                                        : 'bg-white border-stone-200 text-slate-600 hover:bg-stone-50'
                                } ${!activeBranch.is_pickup_available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <Truck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-xs font-semibold">SAC GO Antar-Jemput</div>
                                    <div className="text-[10px] text-stone-500 font-normal">
                                        {activeBranch.is_pickup_available ? 'Gratis radius 5 km (Jkt/Jogja)' : 'Tidak tersedia di cabang ini'}
                                    </div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setData('service_type', 'WALK_IN')}
                                className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                                    data.service_type === 'WALK_IN'
                                        ? 'bg-amber-50 border-amber-400 text-amber-950 font-semibold ring-1 ring-amber-300'
                                        : 'bg-white border-stone-200 text-slate-600 hover:bg-stone-50'
                                }`}
                            >
                                <MapPin className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-xs font-semibold">Datang Langsung (Walk-In)</div>
                                    <div className="text-[10px] text-stone-500 font-normal">Kunjungi workshop Shoes and Care</div>
                                </div>
                            </button>
                        </div>

                        {!activeBranch.is_pickup_available && (
                            <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    Fitur antar-jemput <strong>SAC GO</strong> beroperasi eksklusif di wilayah <strong>DKI Jakarta & DI Yogyakarta</strong>. Untuk cabang ini, pemesanan diproses melalui kedatangan langsung ke gerai (Walk-In).
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Alamat Penjemputan */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="font-semibold text-slate-700">Alamat Penjemputan Sepatu *</label>
                            <button
                                type="button"
                                onClick={handleUseGpsLocation}
                                className="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 font-medium cursor-pointer"
                            >
                                <Navigation className="w-3 h-3" />
                                <span>Gunakan Lokasi GPS Saya</span>
                            </button>
                        </div>
                        <textarea
                            required
                            rows="2"
                            value={data.pickup_address}
                            onChange={(e) => setData('pickup_address', e.target.value)}
                            placeholder="Alamat rumah/kantor, nomor rumah, patokan, dll."
                            className="w-full p-2.5 bg-stone-50/70 border border-stone-200/90 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 text-xs"
                        />
                        {errors.pickup_address && <p className="text-red-500 text-[10px] mt-0.5">{errors.pickup_address}</p>}
                    </div>

                    {/* Rincian Sepatu */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Jenis Bahan / Model Sepatu *</label>
                            <select
                                value={data.shoe_type}
                                onChange={(e) => setData('shoe_type', e.target.value)}
                                className="w-full p-2.5 bg-stone-50/70 border border-stone-200/90 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 text-xs cursor-pointer"
                            >
                                <option value="Sneakers Casual / Canvas">Sneakers Casual / Canvas</option>
                                <option value="Running & Sport Shoes">Running & Sport Shoes</option>
                                <option value="Leather & Formal Shoes">Leather / Kulit Asli & Formal</option>
                                <option value="Suede & Nubuck Premium">Suede & Nubuck Khusus</option>
                                <option value="Boots, Heels & Flatshoes">Boots, High Heels & Flatshoes</option>
                            </select>
                        </div>

                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Jumlah Pasang Sepatu *</label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                required
                                value={data.pair_count}
                                onChange={(e) => setData('pair_count', Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full p-2.5 bg-stone-50/70 border border-stone-200/90 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 font-mono text-xs"
                            />
                        </div>
                    </div>

                    {/* Detail Merk & Warna */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Merk & Model Sepatu</label>
                            <input
                                type="text"
                                value={data.shoe_brand}
                                onChange={(e) => setData('shoe_brand', e.target.value)}
                                placeholder="Misal: Nike Air Force 1"
                                className="w-full p-2 bg-stone-50/70 border border-stone-200/90 rounded-xl text-slate-900 text-xs"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Warna Dominan</label>
                            <input
                                type="text"
                                value={data.shoe_color}
                                onChange={(e) => setData('shoe_color', e.target.value)}
                                placeholder="Misal: Putih / Hitam"
                                className="w-full p-2 bg-stone-50/70 border border-stone-200/90 rounded-xl text-slate-900 text-xs"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Material Utama</label>
                            <input
                                type="text"
                                value={data.shoe_material}
                                onChange={(e) => setData('shoe_material', e.target.value)}
                                placeholder="Misal: Leather / Canvas"
                                className="w-full p-2 bg-stone-50/70 border border-stone-200/90 rounded-xl text-slate-900 text-xs"
                            />
                        </div>
                    </div>

                    {/* Pilih Menu Perawatan */}
                    <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                            <label className="font-semibold text-slate-700 block">
                                Pilih Layanan Perawatan yang Diinginkan *
                            </label>
                            <span className="text-[10px] text-amber-700 font-semibold font-mono">
                                {data.treatments.length} layanan dipilih
                            </span>
                        </div>
                        {errors.treatments && <p className="text-red-500 text-[10px]">{errors.treatments}</p>}

                        {availableTreatments.length === 0 ? (
                            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-center text-xs text-amber-900 space-y-1">
                                <AlertCircle className="w-5 h-5 mx-auto text-amber-600" />
                                <div>Memuat layanan gerai...</div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-56 overflow-y-auto pr-1">
                                {availableTreatments.map((t) => {
                                    const isChecked = data.treatments.includes(t.id);
                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => handleTreatmentToggle(t.id)}
                                            className={`p-2.5 rounded-xl border flex items-start justify-between gap-2 cursor-pointer transition ${
                                                isChecked
                                                    ? 'bg-amber-50/70 border-amber-400 text-amber-950 font-semibold ring-2 ring-amber-300 shadow-2xs'
                                                    : 'bg-stone-50/50 hover:bg-stone-100/70 border-stone-200/90 text-slate-700'
                                            }`}
                                        >
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border ${
                                                        isChecked ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold' : 'border-stone-300 bg-white'
                                                    }`}>
                                                        {isChecked ? '✓' : ''}
                                                    </span>
                                                    <span className="text-xs font-semibold">{t.name}</span>
                                                </div>
                                                <div className="text-[10px] text-stone-500 pl-5">{t.est_duration}</div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-xs font-bold font-mono text-amber-700">
                                                    {t.price > 0 ? formatRupiah(t.price) : 'GRATIS'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Catatan Sepatu */}
                    <div>
                        <label className="font-semibold text-slate-700 block mb-1">Catatan Tambahan untuk Teknisi</label>
                        <input
                            type="text"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Misal: noda oli di bagian sol, lem sol depan terbuka"
                            className="w-full p-2 bg-stone-50/70 border border-stone-200/90 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 text-xs"
                        />
                    </div>

                    {/* Total Summary Footer */}
                    <div className="p-4 rounded-2xl bg-stone-50/90 border border-stone-200/90 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-center sm:text-left">
                            <span className="text-[10px] uppercase font-semibold text-stone-500 block">Total Biaya di Sistem:</span>
                            <div className="text-lg font-bold text-amber-700 font-mono">
                                {formatRupiah(estimatedTotal)}
                            </div>
                            <span className="text-[10px] text-stone-400">Untuk {data.pair_count} pasang sepatu • Garansi 3 Hari</span>
                        </div>

                        <button
                            type="submit"
                            disabled={processing || data.treatments.length === 0}
                            className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-40 self-stretch sm:self-auto text-center"
                        >
                            {processing ? 'Mendaftarkan ke Sistem...' : 'Konfirmasi Booking Sekarang (In-App)'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
