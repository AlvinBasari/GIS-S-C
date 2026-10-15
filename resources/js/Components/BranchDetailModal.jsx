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
    ChevronDown,
    Truck,
    Check
} from 'lucide-react';
import { useForm, router } from '@inertiajs/react';

export default function BranchDetailModal({ 
    branch, 
    onClose,
    onOpenCalculatorWithBranch,
    onOpenBookingWithBranch = () => {},
}) {
    if (!branch) return null;

    const [activeTab, setActiveTab] = useState('special'); // 'special' | 'general' | 'info'
    const [showAddSpecialForm, setShowAddSpecialForm] = useState(false);

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDayName = dayNames[new Date().getDay()];

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden font-sans">
                {/* Modal Header */}
                <div className="p-5 border-b border-stone-200/80 bg-stone-50/70 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-black border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                            <img src="/images/logo.png" alt="Shoes and Care" className="h-full w-full object-contain p-1" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/90">
                                    {branch.brand_name}
                                </span>
                                <span className="text-[10px] text-stone-600 px-2 py-0.5 rounded-md bg-white border border-stone-200/90 shadow-2xs">
                                    {branch.district_name.includes('Bekasi') ? `Kec. ${branch.district_name}` : branch.district_name}
                                </span>
                                {branch.is_pickup_available && (
                                    <span className="text-[10px] text-blue-700 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200">
                                        Antar-Jemput Siap
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                                {branch.branch_name}
                            </h2>
                            <div className="flex items-center gap-2.5 text-xs text-slate-500 pt-0.5 font-mono flex-wrap">
                                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                    {branch.rating} <span className="text-stone-500 font-normal">({branch.review_count} ulasan)</span>
                                </span>
                                <span>•</span>
                                <span>Sen-Jum: {branch.open_hour} - {branch.close_hour} WIB</span>
                                <span>•</span>
                                <span>Sab-Min: {branch.is_open_weekend ? `${branch.weekend_open_hour || '10:00'} - ${branch.weekend_close_hour || '20:00'} WIB` : 'Libur'}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-slate-500 hover:text-slate-800 transition border border-stone-200/70"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center border-b border-stone-200/80 bg-white px-5 text-xs">
                    <button
                        onClick={() => setActiveTab('special')}
                        className={`py-3 px-3 font-medium transition border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'special'
                                ? 'border-amber-500 text-amber-800 font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Truck className="w-3.5 h-3.5 text-amber-600" />
                        <span>SAC GO (Antar-Jemput)</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${
                            branch.is_pickup_available
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-200 text-stone-600'
                        }`}>
                            {branch.is_pickup_available ? 'READY' : 'OFF'}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('general')}
                        className={`py-3 px-3 font-medium transition border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'general'
                                ? 'border-amber-500 text-amber-800 font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>Menu Treatment Resmi ({branch.general_treatments?.length || 0})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('info')}
                        className={`py-3 px-3 font-medium transition border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'info'
                                ? 'border-amber-500 text-amber-800 font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                        <span>Info Alamat & Lokasi</span>
                    </button>
                </div>

                {/* Tab Content Body */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-[#f8fafc]/50">
                    {/* TAB 1: SAC GO (FITUR ANTAR-JEMPUT) */}
                    {activeTab === 'special' && (
                        <div className="space-y-4">
                            {/* Main SAC GO Feature Showcase Card */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shrink-0">
                                            <Truck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                                <span>SAC GO (Layanan Antar-Jemput)</span>
                                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                                    branch.is_pickup_available 
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                                        : 'bg-stone-200 text-stone-600 border border-stone-300'
                                                }`}>
                                                    {branch.is_pickup_available ? 'AKTIF / TERSEDIA' : 'TIDAK TERSEDIA'}
                                                </span>
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Layanan jemput dan antar sepatu gratis hingga 5 km dari lokasi gerai {branch.branch_name}.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quick Toggle SAC GO Button for Admin / Manager */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            router.post(`/branches/${branch.id}/toggle-sac-go`, {}, {
                                                preserveScroll: true,
                                                onSuccess: () => {
                                                    branch.is_pickup_available = !branch.is_pickup_available;
                                                }
                                            });
                                        }}
                                        className="text-[11px] px-3 py-1.5 rounded-xl font-medium border border-stone-200 bg-stone-50 hover:bg-stone-100 text-slate-700 transition"
                                    >
                                        Toggle SAC GO ({branch.is_pickup_available ? 'Matikan' : 'Aktifkan'})
                                    </button>
                                </div>

                                {branch.is_pickup_available ? (
                                    <div className="space-y-3 pt-2 border-t border-stone-100">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center gap-2">
                                                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                                <span className="text-slate-700"><strong>Gratis Jemput:</strong> Radius 5 KM dari gerai</span>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center gap-2">
                                                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                                <span className="text-slate-700"><strong>Garansi Layanan:</strong> Jaminan cuci ulang</span>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center gap-2">
                                                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                                <span className="text-slate-700"><strong>Teknisi Ahli:</strong> Standar Shoes and Care</span>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center gap-2">
                                                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                                <span className="text-slate-700"><strong>Tracking WhatsApp:</strong> Update status real-time</span>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={() => onOpenBookingWithBranch(branch)}
                                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer"
                                            >
                                                <Truck className="w-4 h-4" />
                                                <span>Booking Antar-Jemput SAC GO (In-App)</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-2">
                                        <p>
                                            Gerai ini saat ini hanya menerima perawatan sepatu dengan datang langsung ke workshop (Walk-in Only).
                                        </p>
                                        <p className="text-[11px] text-amber-800">
                                            Jika Anda membutuhkan layanan antar-jemput, silakan gunakan gerai Shoes and Care terdekat lainnya yang telah mengaktifkan fitur <strong>SAC GO</strong>.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: KATALOG LAYANAN UMUM */}
                    {activeTab === 'general' && (
                        <div className="space-y-3">
                            <p className="text-xs text-slate-500">
                                Menu standar shoe care yang tersedia secara konsisten di seluruh jaringan cabang:
                            </p>
                            <div className="divide-y divide-stone-100 border border-stone-200/90 rounded-2xl overflow-hidden bg-white shadow-xs">
                                {branch.general_treatments?.map((gt) => (
                                    <div key={gt.id} className="p-3 flex items-center justify-between gap-4 text-xs">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-900">{gt.name}</span>
                                                <span className="text-[10px] text-stone-600 px-1.5 py-0.2 rounded-md bg-stone-100 border border-stone-200">
                                                    {gt.category}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-[11px]">{gt.description}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="font-mono font-bold text-amber-700 text-xs">
                                                {formatRupiah(gt.price)}
                                            </div>
                                            <div className="text-[10px] text-stone-400 font-mono mt-0.5">
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
                            <div className="p-4 rounded-2xl bg-white border border-stone-200/90 space-y-3 shadow-xs">
                                <div>
                                    <label className="text-[10px] uppercase font-semibold text-stone-500 block mb-1">
                                        Alamat Lengkap
                                    </label>
                                    <p className="text-slate-800 leading-relaxed">{branch.full_address}</p>
                                </div>

                                {branch.benchmark_notes && (
                                    <div>
                                        <label className="text-[10px] uppercase font-semibold text-stone-500 block mb-1">
                                            Patokan / Petunjuk Lokasi
                                        </label>
                                        <p className="text-amber-800 italic">{branch.benchmark_notes}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100 text-slate-600">
                                    <div>
                                        <span className="text-stone-400 block text-[10px]">Kelurahan:</span>
                                        <strong className="text-slate-800">{branch.kelurahan}</strong>
                                    </div>
                                    <div>
                                        <span className="text-stone-400 block text-[10px]">Kecamatan:</span>
                                        <strong className="text-slate-800">Kec. {branch.district_name}</strong>
                                    </div>
                                    <div>
                                        <span className="text-stone-400 block text-[10px]">Kodepos:</span>
                                        <strong className="font-mono text-slate-800">{branch.postal_code || '-'}</strong>
                                    </div>
                                    <div>
                                        <span className="text-stone-400 block text-[10px]">Koordinat:</span>
                                        <strong className="font-mono text-slate-800">{branch.latitude}, {branch.longitude}</strong>
                                    </div>
                                </div>

                                {/* Jadwal Jam Operasional Weekday & Weekend + 7 Hari Google Maps */}
                                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] uppercase font-bold text-amber-900 block tracking-wider flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                                            <span>Jadwal Jam Operasional Resmi (Google Maps)</span>
                                        </label>
                                        <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                                            Terverifikasi Google Maps
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                                        <div className="bg-white p-2.5 rounded-xl border border-amber-200/70">
                                            <span className="text-stone-500 text-[10px] block font-sans">Hari Kerja (Senin - Jumat):</span>
                                            <strong className="text-slate-900">{branch.open_hour || '09:00'} - {branch.close_hour || '21:00'} WIB</strong>
                                        </div>
                                        <div className="bg-white p-2.5 rounded-xl border border-amber-200/70">
                                            <span className="text-stone-500 text-[10px] block font-sans">Akhir Pekan (Sabtu - Minggu):</span>
                                            {branch.is_open_weekend ? (
                                                <strong className="text-amber-900">{branch.weekend_open_hour || '10:00'} - {branch.weekend_close_hour || '20:00'} WIB</strong>
                                            ) : (
                                                <strong className="text-rose-600 font-sans">Tutup / Libur</strong>
                                            )}
                                        </div>
                                    </div>

                                    {branch.operating_hours_daily && Object.keys(branch.operating_hours_daily).length > 0 && (
                                        <div className="pt-2 border-t border-amber-200/60 space-y-2">
                                            <span className="text-[10px] uppercase font-bold text-stone-600 block tracking-wider">
                                                Rincian Buka Harian (Senin s/d Minggu):
                                            </span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs bg-white p-2.5 rounded-xl border border-amber-200/70 font-sans">
                                                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => {
                                                    const hours = branch.operating_hours_daily[day] || 'Tutup';
                                                    const isClosed = hours === 'Tutup';
                                                    const isToday = currentDayName === day;
                                                    return (
                                                        <div 
                                                            key={day} 
                                                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
                                                                isToday 
                                                                    ? 'bg-amber-100/70 border border-amber-300 font-semibold' 
                                                                    : 'hover:bg-stone-50'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-1.5">
                                                                <span className={isToday ? 'text-amber-950 font-bold' : 'text-slate-700'}>{day}</span>
                                                                {isToday && (
                                                                    <span className="text-[9px] bg-amber-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded-full">
                                                                        Hari ini
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className={`font-mono text-[11px] ${isClosed ? 'text-rose-600 font-bold' : 'text-slate-900'}`}>
                                                                {isClosed ? 'Tutup' : `${hours} WIB`}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action Bar */}
                <div className="p-4 border-t border-stone-200/80 bg-stone-50/80 flex items-center justify-between gap-3">
                    <button
                        onClick={() => onOpenCalculatorWithBranch(branch)}
                        className="text-xs px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-slate-700 border border-stone-200/90 shadow-xs transition"
                    >
                        Hitung Estimasi Biaya Cabang Ini
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onOpenBookingWithBranch(branch)}
                            className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-xs cursor-pointer"
                        >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Booking Sekarang (In-App)</span>
                        </button>

                        <a
                            href={branch.gmaps_url || `https://maps.google.com/?q=${branch.latitude},${branch.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-slate-700 border border-stone-200/90 shadow-xs transition"
                        >
                            <Navigation className="w-3.5 h-3.5 text-blue-500" />
                            <span className="hidden sm:inline">Google Maps</span>
                        </a>

                        <a
                            href={`https://wa.me/${branch.whatsapp_number}?text=Halo%20${encodeURIComponent(branch.brand_name)}%20${encodeURIComponent(branch.branch_name)},%20saya%20melihat%20dari%20Web%20GIS%20Shoe%20Care.%20Saya%20ingin%20tanya%20layanan.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 transition"
                            title="Chat WhatsApp Konsultasi"
                        >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="hidden sm:inline">Tanya CS</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
