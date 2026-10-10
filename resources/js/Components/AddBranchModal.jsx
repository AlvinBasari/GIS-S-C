import React, { useState, useEffect, useRef } from 'react';
import { 
    X, 
    Plus, 
    MapPin, 
    Sparkles, 
    Check, 
    Clock, 
    Building2 
} from 'lucide-react';
import { useForm } from '@inertiajs/react';
import L from 'leaflet';

export default function AddBranchModal({ districts, onClose }) {
    const miniMapRef = useRef(null);
    const miniMapInstanceRef = useRef(null);
    const pickerMarkerRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        brand_name: '',
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
        pickup_coverage: 'Radius 5 km',
        // Optional Special Treatment
        special_treatment_name: '',
        special_treatment_price: '',
        special_treatment_duration: '2 - 3 Hari',
        special_treatment_badge: '',
        special_treatment_desc: '',
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
                {/* Modal Header */}
                <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                            <Building2 className="w-4 h-4" strokeWidth={1.75} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white tracking-tight">
                                Daftarkan Cabang Shoe Care Baru
                            </h2>
                            <p className="text-xs text-slate-400">
                                Petakan lokasi gerai dan spesifikasi layanan cabang di Kota Bekasi
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-5 text-xs">
                    {/* Bagian 1: Identitas Gerai */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                            <span className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-mono text-[11px]">1</span>
                            <span>Identitas Brand & Outlet</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-slate-400 block mb-1">Nama Brand / Jasa *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.brand_name}
                                    onChange={(e) => setData('brand_name', e.target.value)}
                                    placeholder="Contoh: Shoes and Care, Sneaklin"
                                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                                />
                                {errors.brand_name && <span className="text-red-400 text-[10px] mt-0.5">{errors.brand_name}</span>}
                            </div>
                            <div>
                                <label className="text-slate-400 block mb-1">Nama Cabang / Lokasi *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.branch_name}
                                    onChange={(e) => setData('branch_name', e.target.value)}
                                    placeholder="Contoh: Cabang Grand Galaxy City"
                                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                                />
                                {errors.branch_name && <span className="text-red-400 text-[10px] mt-0.5">{errors.branch_name}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Bagian 2: Alamat Rinci & Lokasi Wilayah */}
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                        <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                            <span className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-mono text-[11px]">2</span>
                            <span>Wilayah & Alamat Lengkap</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-slate-400 block mb-1">Kecamatan (Kota Bekasi) *</label>
                                <select
                                    value={data.district_id}
                                    onChange={handleDistrictChange}
                                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                                >
                                    {districts.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            Kec. {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-slate-400 block mb-1">Kelurahan *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.kelurahan}
                                    onChange={(e) => setData('kelurahan', e.target.value)}
                                    placeholder="Contoh: Jaka Setia"
                                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-slate-400 block mb-1">Alamat Lengkap (Jalan, RT/RW, No. Ruko) *</label>
                                <textarea
                                    required
                                    rows="2"
                                    value={data.full_address}
                                    onChange={(e) => setData('full_address', e.target.value)}
                                    placeholder="Contoh: Ruko Grand Galaxy City Blok RGG No. 25, Jl. Boulevard Raya"
                                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-slate-400 block mb-1">Petunjuk Patokan Lokasi</label>
                                <input
                                    type="text"
                                    value={data.benchmark_notes}
                                    onChange={(e) => setData('benchmark_notes', e.target.value)}
                                    placeholder="Contoh: Sebelah Kopi Kenangan, seberang SPBU Pertamina"
                                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bagian 3: Titik Koordinat Peta Interaktif */}
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                                <span className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-mono text-[11px]">3</span>
                                <span>Penentuan Titik Koordinat Peta (GIS)</span>
                            </h3>
                            <div className="text-[11px] text-slate-400 font-mono">
                                Lat: <span className="text-amber-400">{data.latitude}</span>, Lng: <span className="text-amber-400">{data.longitude}</span>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-400">
                            Geser pin marker atau klik di peta untuk menentukan koordinat presisi gerai.
                        </p>
                        <div className="h-48 w-full rounded-xl overflow-hidden border border-slate-700/80">
                            <div ref={miniMapRef} className="w-full h-full" />
                        </div>
                    </div>

                    {/* Bagian 4: Kontak & Jam Buka */}
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                        <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                            <span className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-mono text-[11px]">4</span>
                            <span>Kontak & Operasional</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="text-slate-400 block mb-1">Nomor WhatsApp *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.whatsapp_number}
                                    onChange={(e) => setData('whatsapp_number', e.target.value)}
                                    placeholder="6281234567890"
                                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 block mb-1">Jam Buka *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.open_hour}
                                    onChange={(e) => setData('open_hour', e.target.value)}
                                    placeholder="09:00"
                                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 block mb-1">Jam Tutup *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.close_hour}
                                    onChange={(e) => setData('close_hour', e.target.value)}
                                    placeholder="21:00"
                                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bagian 5: Layanan Spesialis Cabang Perdana (Opsional) */}
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>Treatment Khusus Cabang (Opsional)</span>
                            </h3>
                            <span className="text-[10px] text-slate-400">Bisa ditambah nanti</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-slate-400 block mb-1">Nama Layanan Spesialis</label>
                                <input
                                    type="text"
                                    value={data.special_treatment_name}
                                    onChange={(e) => setData('special_treatment_name', e.target.value)}
                                    placeholder="Contoh: Reglue Vibram Sol Premium"
                                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 block mb-1">Harga (Rp)</label>
                                <input
                                    type="number"
                                    value={data.special_treatment_price}
                                    onChange={(e) => setData('special_treatment_price', e.target.value)}
                                    placeholder="150000"
                                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-slate-400 block mb-1">Keterangan Layanan</label>
                                <input
                                    type="text"
                                    value={data.special_treatment_desc}
                                    onChange={(e) => setData('special_treatment_desc', e.target.value)}
                                    placeholder="Deskripsi keunggulan, material lem, atau garansi..."
                                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold transition"
                        >
                            {processing ? 'Menyimpan...' : 'Daftarkan Gerai'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
