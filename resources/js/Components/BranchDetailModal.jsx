import React, { useState } from 'react';
import { 
    X, 
    MapPin, 
    Clock, 
    Phone, 
    Star, 
    Sparkles, 
    CheckCircle2, 
    ShieldCheck, 
    Navigation, 
    Plus, 
    MessageCircle,
    Layers,
    Info,
    Calendar,
    ChevronDown
} from 'lucide-react';
import { useForm } from '@inertiajs/react';

export default function BranchDetailModal({ 
    branch, 
    onClose,
    onOpenCalculatorWithBranch
}) {
    if (!branch) return null;

    const [activeTab, setActiveTab] = useState('special'); // 'special' | 'general' | 'info'
    const [showAddSpecialForm, setShowAddSpecialForm] = useState(false);

    // Form Inertia untuk menambah treatment khusus baru
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        category: 'Custom & Repair',
        description: '',
        price: '',
        est_duration: '2 - 3 Hari',
        badge_label: `Spesialisasi ${branch.branch_name}`,
        notes: '',
    });

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
    };

    const handleAddSpecial = (e) => {
        e.preventDefault();
        post(`/branches/${branch.id}/special-treatments`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowAddSpecialForm(false);
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                                {branch.brand_name}
                            </span>
                            <span className="text-[10px] text-slate-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                                Kec. {branch.district_name}
                            </span>
                            {branch.is_pickup_available && (
                                <span className="text-[10px] text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                                    Antar-Jemput Siap
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            {branch.branch_name}
                        </h2>
                        <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5 font-mono">
                            <span className="flex items-center gap-1 text-amber-400 font-semibold">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                {branch.rating} <span className="text-slate-400 font-normal">({branch.review_count} ulasan)</span>
                            </span>
                            <span>•</span>
                            <span>{branch.open_hour} - {branch.close_hour} WIB</span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center border-b border-slate-800 bg-slate-900 px-5 text-xs">
                    <button
                        onClick={() => setActiveTab('special')}
                        className={`py-3 px-3 font-medium transition border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'special'
                                ? 'border-amber-400 text-amber-400 font-semibold'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Layanan Khusus Cabang ({branch.special_treatments?.length || 0})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('general')}
                        className={`py-3 px-3 font-medium transition border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'general'
                                ? 'border-amber-400 text-amber-400 font-semibold'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Katalog Umum ({branch.general_treatments?.length || 0})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('info')}
                        className={`py-3 px-3 font-medium transition border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'info'
                                ? 'border-amber-400 text-amber-400 font-semibold'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Info className="w-3.5 h-3.5" />
                        <span>Info Alamat & Lokasi</span>
                    </button>
                </div>

                {/* Tab Content Body */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1">
                    {/* TAB 1: LAYANAN KHUSUS (TREATMENT KHUSUS PER CABANG) */}
                    {activeTab === 'special' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-400">
                                    Menu perawatan spesialis eksklusif yang hanya tersedia di cabang <strong>{branch.branch_name}</strong>.
                                </p>
                                <button
                                    onClick={() => setShowAddSpecialForm(!showAddSpecialForm)}
                                    className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 flex items-center gap-1 font-medium transition"
                                >
                                    <Plus className="w-3 h-3" />
                                    <span>Tambah Spesialisasi</span>
                                </button>
                            </div>

                            {/* Form Tambah Treatment Khusus */}
                            {showAddSpecialForm && (
                                <form onSubmit={handleAddSpecial} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Daftarkan Layanan Khusus Baru Cabang Ini</span>
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <label className="text-slate-400 block mb-1">Nama Layanan *</label>
                                            <input
                                                type="text"
                                                required
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Contoh: Repaint Leather Patina"
                                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-slate-400 block mb-1">Biaya / Harga (Rp) *</label>
                                            <input
                                                type="number"
                                                required
                                                value={data.price}
                                                onChange={(e) => setData('price', e.target.value)}
                                                placeholder="150000"
                                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-slate-400 block mb-1">Estimasi Pengerjaan *</label>
                                            <input
                                                type="text"
                                                required
                                                value={data.est_duration}
                                                onChange={(e) => setData('est_duration', e.target.value)}
                                                placeholder="2 - 3 Hari"
                                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-slate-400 block mb-1">Kategori *</label>
                                            <select
                                                value={data.category}
                                                onChange={(e) => setData('category', e.target.value)}
                                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                                            >
                                                <option value="Custom & Repair">Custom & Repair</option>
                                                <option value="Premium Treatment">Premium Treatment</option>
                                                <option value="Deep Clean Leather">Deep Clean Leather</option>
                                                <option value="Unyellowing Express">Unyellowing Express</option>
                                            </select>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="text-slate-400 block mb-1">Deskripsi & Spesifikasi Layanan *</label>
                                            <textarea
                                                required
                                                rows="2"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Jelaskan teknik, garansi, atau bahan khusus yang digunakan..."
                                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddSpecialForm(false)}
                                            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs transition"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition"
                                        >
                                            {processing ? 'Menyimpan...' : 'Simpan Layanan'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Daftar Layanan Khusus */}
                            {(!branch.special_treatments || branch.special_treatments.length === 0) ? (
                                <div className="text-center py-8 p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                                    <p className="text-xs text-slate-400">Belum ada layanan khusus yang didaftarkan untuk cabang ini.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {branch.special_treatments.map((st) => (
                                        <div
                                            key={st.id}
                                            className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 hover:border-amber-400/50 transition"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
                                                        {st.category}
                                                    </span>
                                                    <h4 className="font-semibold text-sm text-white mt-0.5">
                                                        {st.name}
                                                    </h4>
                                                </div>
                                                <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                                                    {formatRupiah(st.price)}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-300 leading-relaxed">
                                                {st.description}
                                            </p>

                                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    {st.est_duration}
                                                </span>
                                                <span className="text-emerald-400 font-sans flex items-center gap-1 text-[10px]">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    Garansi Outlet
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: KATALOG LAYANAN UMUM */}
                    {activeTab === 'general' && (
                        <div className="space-y-3">
                            <p className="text-xs text-slate-400">
                                Menu standar shoe care yang tersedia secara konsisten di seluruh jaringan cabang:
                            </p>
                            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                                {branch.general_treatments?.map((gt) => (
                                    <div key={gt.id} className="p-3 flex items-center justify-between gap-4 text-xs">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-white">{gt.name}</span>
                                                <span className="text-[10px] text-slate-400 px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                                                    {gt.category}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-[11px]">{gt.description}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="font-mono font-semibold text-amber-400 text-xs">
                                                {formatRupiah(gt.price)}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                {gt.est_duration}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: INFO ALAMAT & LOKASI */}
                    {activeTab === 'info' && (
                        <div className="space-y-4 text-xs">
                            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                                <div>
                                    <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                                        Alamat Lengkap
                                    </label>
                                    <p className="text-slate-200 leading-relaxed">{branch.full_address}</p>
                                </div>

                                {branch.benchmark_notes && (
                                    <div>
                                        <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                                            Patokan / Petunjuk Lokasi
                                        </label>
                                        <p className="text-amber-300 italic">{branch.benchmark_notes}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-slate-300">
                                    <div>
                                        <span className="text-slate-400 block text-[10px]">Kelurahan:</span>
                                        <strong>{branch.kelurahan}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[10px]">Kecamatan:</span>
                                        <strong>Kec. {branch.district_name}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[10px]">Kodepos:</span>
                                        <strong className="font-mono">{branch.postal_code || '-'}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[10px]">Koordinat:</span>
                                        <strong className="font-mono">{branch.latitude}, {branch.longitude}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action Bar */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
                    <button
                        onClick={() => onOpenCalculatorWithBranch(branch)}
                        className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                    >
                        Hitung Estimasi Biaya Cabang Ini
                    </button>

                    <div className="flex items-center gap-2">
                        <a
                            href={branch.gmaps_url || `https://maps.google.com/?q=${branch.latitude},${branch.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                        >
                            <Navigation className="w-3.5 h-3.5 text-blue-400" />
                            <span>Buka di Google Maps</span>
                        </a>

                        <a
                            href={`https://wa.me/${branch.whatsapp_number}?text=Halo%20${encodeURIComponent(branch.brand_name)}%20${encodeURIComponent(branch.branch_name)},%20saya%20melihat%20dari%20Web%20GIS%20Shoe%20Care%20Bekasi.%20Saya%20ingin%20konsultasi%20perawatan%20sepatu.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition shadow-sm"
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Chat WhatsApp</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
