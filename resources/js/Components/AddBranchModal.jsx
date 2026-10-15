import React, { useState, useEffect, useRef } from 'react';
import { 
    X, 
    Plus, 
    MapPin, 
    Sparkles, 
    Check, 
    Clock, 
    Building2,
    Truck
} from 'lucide-react';
import { useForm } from '@inertiajs/react';
import L from 'leaflet';

export default function AddBranchModal({ districts, onClose }) {
    const miniMapRef = useRef(null);
    const miniMapInstanceRef = useRef(null);
    const pickerMarkerRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        brand_name: 'Shoes and Care',
        branch_name: '',
        district_id: districts[0]?.id || 1,
        full_address: '',
        benchmark_notes: '',
        kelurahan: '',
        latitude: -6.2625000,
        longitude: 106.9856000,
        whatsapp_number: '',
        phone_number: '',
        open_hour: '09:00',
        close_hour: '21:00',
        is_pickup_available: true,
        pickup_coverage: 'Radius 5 km (Layanan Jemput & Antar Gratis)',
    });

    // Inisialisasi Leaflet Mini Map Picker
    useEffect(() => {
        if (!miniMapRef.current || miniMapInstanceRef.current) return;

        const map = L.map(miniMapRef.current, {
            center: [data.latitude, data.longitude],
            zoom: 13,
            zoomControl: true,
            attributionControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const marker = L.marker([data.latitude, data.longitude], {
            draggable: true,
        }).addTo(map);

        marker.bindTooltip('Geser pin atau klik di peta', { permanent: true, direction: 'top' });

        marker.on('dragend', (e) => {
            const position = marker.getLatLng();
            setData((prev) => ({
                ...prev,
                latitude: Number(position.lat.toFixed(7)),
                longitude: Number(position.lng.toFixed(7)),
            }));
        });

        map.on('click', (e) => {
            marker.setLatLng(e.latlng);
            setData((prev) => ({
                ...prev,
                latitude: Number(e.latlng.lat.toFixed(7)),
                longitude: Number(e.latlng.lng.toFixed(7)),
            }));
        });

        miniMapInstanceRef.current = map;
        pickerMarkerRef.current = marker;

        return () => {
            map.remove();
            miniMapInstanceRef.current = null;
        };
    }, []);

    // Sinkronisasi saat district dipilih
    const handleDistrictChange = (e) => {
        const distId = Number(e.target.value);
        setData('district_id', distId);

        const found = districts.find((d) => d.id === distId);
        if (found && miniMapInstanceRef.current && pickerMarkerRef.current) {
            miniMapInstanceRef.current.flyTo([found.center_lat, found.center_lng], 14);
            pickerMarkerRef.current.setLatLng([found.center_lat, found.center_lng]);
            setData((prev) => ({
                ...prev,
                district_id: distId,
                latitude: found.center_lat,
                longitude: found.center_lng,
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/branches', {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden font-sans">
                {/* Modal Header */}
                <div className="p-4 sm:p-5 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/70">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-700">
                            <Building2 className="w-4 h-4" strokeWidth={1.75} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 tracking-tight">
                                Daftarkan Cabang Shoe Care Baru
                            </h2>
                            <p className="text-xs text-slate-500">
                                Petakan lokasi gerai dan spesifikasi layanan cabang Shoes and Care
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-500 hover:text-slate-800 transition border border-stone-200/80"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-5 text-xs">
                    {/* Bagian 1: Identitas Gerai */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                            <span className="w-5 h-5 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center text-amber-700 font-mono text-[11px] font-semibold">1</span>
                            <span>Identitas Brand & Outlet</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-slate-600 block mb-1 font-medium">Nama Brand / Jasa *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.brand_name}
                                    onChange={(e) => setData('brand_name', e.target.value)}
                                    placeholder="Contoh: Shoes and Care, Sneaklin"
                                    className="w-full p-2.5 bg-stone-50/60 border border-stone-200/90 rounded-xl text-slate-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition"
                                />
                                {errors.brand_name && <span className="text-red-500 text-[10px] mt-0.5">{errors.brand_name}</span>}
                            </div>
                            <div>
                                <label className="text-slate-600 block mb-1 font-medium">Nama Cabang / Lokasi *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.branch_name}
                                    onChange={(e) => setData('branch_name', e.target.value)}
                                    placeholder="Contoh: Cabang Grand Galaxy City"
                                    className="w-full p-2.5 bg-stone-50/60 border border-stone-200/90 rounded-xl text-slate-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition"
                                />
                                {errors.branch_name && <span className="text-red-500 text-[10px] mt-0.5">{errors.branch_name}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Bagian 2: Alamat Rinci & Lokasi Wilayah */}
                    <div className="space-y-3 pt-3 border-t border-stone-100">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                            <span className="w-5 h-5 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center text-amber-700 font-mono text-[11px] font-semibold">2</span>
                            <span>Wilayah & Alamat Lengkap</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-slate-600 block mb-1 font-medium">Wilayah / Kecamatan *</label>
                                <select
                                    value={data.district_id}
                                    onChange={handleDistrictChange}
                                    className="w-full p-2.5 bg-stone-50/60 border border-stone-200/90 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition cursor-pointer"
                                >
                                    {districts.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-slate-600 block mb-1 font-medium">Kelurahan *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.kelurahan}
                                    onChange={(e) => setData('kelurahan', e.target.value)}
                                    placeholder="Contoh: Jaka Setia"
                                    className="w-full p-2.5 bg-stone-50/60 border border-stone-200/90 rounded-xl text-slate-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-slate-600 block mb-1 font-medium">Alamat Lengkap (Jalan, RT/RW, No. Ruko) *</label>
                                <textarea
                                    required
                                    rows="2"
                                    value={data.full_address}
                                    onChange={(e) => setData('full_address', e.target.value)}
                                    placeholder="Contoh: Ruko Grand Galaxy City Blok RGG No. 25, Jl. Boulevard Raya"
                                    className="w-full p-2.5 bg-stone-50/60 border border-stone-200/90 rounded-xl text-slate-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-slate-600 block mb-1 font-medium">Petunjuk Patokan Lokasi</label>
                                <input
                                    type="text"
                                    value={data.benchmark_notes}
                                    onChange={(e) => setData('benchmark_notes', e.target.value)}
                                    placeholder="Contoh: Sebelah Kopi Kenangan, seberang SPBU Pertamina"
                                    className="w-full p-2.5 bg-stone-50/60 border border-stone-200/90 rounded-xl text-slate-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bagian 3: Titik Koordinat Peta Interaktif */}
                    <div className="space-y-3 pt-3 border-t border-stone-100">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                                <span className="w-5 h-5 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center text-amber-700 font-mono text-[11px] font-semibold">3</span>
                                <span>Penentuan Titik Koordinat Peta (GIS)</span>
                            </h3>
                            <div className="text-[11px] text-stone-500 font-mono">
                                Lat: <span className="text-amber-700 font-semibold">{data.latitude}</span>, Lng: <span className="text-amber-700 font-semibold">{data.longitude}</span>
                            </div>
                        </div>
                        <p className="text-[11px] text-stone-500">
                            Geser pin marker atau klik di peta untuk menentukan koordinat presisi gerai.
                        </p>
                        <div className="h-48 w-full rounded-2xl overflow-hidden border border-stone-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                            <div ref={miniMapRef} className="w-full h-full" />
                        </div>
                    </div>

                    {/* Bagian 4: Kontak & Jam Buka */}
                    <div className="space-y-3 pt-3 border-t border-stone-100">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                            <span className="w-5 h-5 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center text-amber-700 font-mono text-[11px] font-semibold">4</span>
                            <span>Kontak & Operasional</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="text-slate-600 block mb-1 font-medium">Nomor WhatsApp *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.whatsapp_number}
                                    onChange={(e) => setData('whatsapp_number', e.target.value)}
                                    placeholder="6281234567890"
                                    className="w-full p-2.5 bg-stone-50/60 border border-stone-200/90 rounded-xl text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition"
                                />
                            </div>
                            <div>
                                <label className="text-slate-600 block mb-1 font-medium">Jam Buka *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.open_hour}
                                    onChange={(e) => setData('open_hour', e.target.value)}
                                    placeholder="09:00"
                                    className="w-full p-2.5 bg-stone-50/60 border border-stone-200/90 rounded-xl text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition"
                                />
                            </div>
                            <div>
                                <label className="text-slate-600 block mb-1 font-medium">Jam Tutup *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.close_hour}
                                    onChange={(e) => setData('close_hour', e.target.value)}
                                    placeholder="21:00"
                                    className="w-full p-2.5 bg-stone-50/60 border border-stone-200/90 rounded-xl text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bagian 5: Layanan Khusus: SAC GO (Fitur Antar-Jemput) */}
                    <div className="space-y-3 pt-3 border-t border-stone-100">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                                <span className="w-5 h-5 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center text-amber-700 font-mono text-[11px] font-semibold">5</span>
                                <Truck className="w-3.5 h-3.5 text-amber-600" />
                                <span>Layanan Khusus: SAC GO (Fitur Antar-Jemput)</span>
                            </h3>
                            <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                                Gratis Radius 5 KM
                            </span>
                        </div>

                        {/* SAC GO Toggle Control */}
                        <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/90 space-y-3">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="font-semibold text-slate-900 text-xs flex items-center gap-2">
                                        <span>Aktifkan Fitur Antar-Jemput SAC GO?</span>
                                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                            data.is_pickup_available 
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                                : 'bg-stone-200 text-stone-600 border border-stone-300'
                                        }`}>
                                            {data.is_pickup_available ? 'YES (AKTIF)' : 'NO (NON-AKTIF)'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        {data.is_pickup_available 
                                            ? 'Cabang ini melayani penjemputan dan pengantaran sepatu gratis hingga radius 5 km dari lokasi gerai.' 
                                            : 'Cabang ini hanya melayani pelanggan langsung di tempat (Walk-in Outlet).'}
                                    </p>
                                </div>

                                {/* Toggle Buttons YES / NO */}
                                <div className="flex items-center p-1 bg-stone-200/80 rounded-xl border border-stone-300/70 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setData('is_pickup_available', true)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            data.is_pickup_available
                                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        YES
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('is_pickup_available', false)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            !data.is_pickup_available
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        NO
                                    </button>
                                </div>
                            </div>

                            {data.is_pickup_available && (
                                <div className="pt-2.5 border-t border-stone-200/80 flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/70">
                                    <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                                    <span>
                                        <strong>SAC GO Siap Digunakan:</strong> Pelanggan dapat memesan pickup melalui tombol WhatsApp resmi cabang secara otomatis.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200/80 bg-stone-50/70 p-4 -mx-5 -mb-5 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-stone-100 transition font-medium text-xs"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-sm hover:shadow transition text-xs disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Daftarkan Gerai'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
