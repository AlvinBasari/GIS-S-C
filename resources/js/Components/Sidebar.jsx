import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { 
    Search, 
    MapPin, 
    Star, 
    Clock, 
    Navigation, 
    Sparkles, 
    ChevronRight, 
    MessageCircle,
    X,
    SlidersHorizontal,
    Check,
    Truck
} from 'lucide-react';

export default function Sidebar({
    branches,
    districts,
    selectedDistrict,
    setSelectedDistrict,
    searchQuery,
    setSearchQuery,
    filterSpecialOnly,
    setFilterSpecialOnly,
    selectedTreatmentCategory,
    setSelectedTreatmentCategory,
    activeBranch,
    onSelectBranch,
    onOpenBranchDetail,
    userLocation
}) {
    // Format Rupiah
    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
    };

    // Helper: Hitung status buka/tutup berdasarkan jam operasional resmi hari ini
    const getOperatingStatus = (branch) => {
        if (!branch) return { isOpen: true, text: 'Buka' };

        const now = new Date();
        const dayIdx = now.getDay(); // 0 is Sunday, 1 is Monday, ...
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const todayName = dayNames[dayIdx];
        const isWeekend = dayIdx === 0 || dayIdx === 6;

        // Cek jam operasional harian terdaftar di Google Maps untuk hari ini
        if (branch.operating_hours_daily && branch.operating_hours_daily[todayName]) {
            const todaySchedule = branch.operating_hours_daily[todayName];
            if (todaySchedule === 'Tutup') {
                return { isOpen: false, text: `Tutup Hari Ini (${todayName})` };
            }
            const parts = todaySchedule.split(' - ');
            if (parts.length === 2) {
                const [openH, openM] = parts[0].split(':').map(Number);
                const [closeH, closeM] = parts[1].split(':').map(Number);
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                const openMinutes = openH * 60 + (openM || 0);
                const closeMinutes = closeH * 60 + (closeM || 0);
                const isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
                return {
                    isOpen,
                    text: isOpen ? `Buka • Tutup ${parts[1]} WIB` : `Tutup • Buka ${parts[0]} WIB`
                };
            }
        }

        if (isWeekend && branch.is_open_weekend === false) {
            return { isOpen: false, text: 'Tutup • Libur Akhir Pekan' };
        }

        const openHour = isWeekend ? (branch.weekend_open_hour || '10:00') : (branch.open_hour || '09:00');
        const closeHour = isWeekend ? (branch.weekend_close_hour || '20:00') : (branch.close_hour || '21:00');

        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [openH, openM] = openHour.split(':').map(Number);
        const [closeH, closeM] = closeHour.split(':').map(Number);
        const openMinutes = openH * 60 + (openM || 0);
        const closeMinutes = closeH * 60 + (closeM || 0);

        const isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
        return {
            isOpen,
            text: isOpen ? `Buka • Tutup ${closeHour} WIB` : `Tutup • Buka ${openHour} WIB`
        };
    };

    // Ambil inisial brand (contoh: "Shoes and Care" -> "SC")
    const getBrandInitials = (name) => {
        if (!name) return 'SC';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <aside className="w-full lg:w-[410px] xl:w-[450px] bg-white/95 border-r border-stone-200/90 flex flex-col h-[calc(100vh-53px)] z-20 shrink-0 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.03)]">
            {/* Header / Search & Filter Section */}
            <div className="p-4 border-b border-stone-200/80 bg-stone-50/70 space-y-3">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama gerai, jalan, layanan, atau patokan..."
                        className="w-full pl-9 pr-9 py-2 bg-white border border-stone-200/90 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 shadow-xs transition font-sans"
                    />
                    {searchQuery ? (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        >
                            <X className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                    ) : (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 hidden sm:inline">
                            /
                        </span>
                    )}
                </div>

                {/* Kecamatan Select */}
                <div className="relative">
                    <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full py-1.5 pl-3 pr-8 bg-white border border-stone-200/90 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-amber-500 transition shadow-xs appearance-none cursor-pointer"
                    >
                        <option value="all">Semua Wilayah ({districts.reduce((acc, d) => acc + (d.branches_count || 0), 0) || branches.length} Gerai)</option>
                        {districts.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.name} ({d.branches_count ?? 0} Gerai)
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                        ▼
                    </div>
                </div>

                {/* Treatment Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                    <button
                        onClick={() => {
                            setFilterSpecialOnly(false);
                            setSelectedTreatmentCategory('all');
                        }}
                        className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition border ${
                            !filterSpecialOnly && selectedTreatmentCategory === 'all'
                                ? 'bg-amber-500 text-slate-950 border-amber-500 font-semibold shadow-xs'
                                : 'bg-white text-slate-600 border-stone-200 hover:bg-stone-50 shadow-xs'
                        }`}
                    >
                        Semua Menu
                    </button>

                    <button
                        onClick={() => setFilterSpecialOnly(!filterSpecialOnly)}
                        className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 border ${
                            filterSpecialOnly
                                ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold shadow-xs'
                                : 'bg-white text-slate-600 border-stone-200 hover:bg-stone-50 shadow-xs'
                        }`}
                    >
                        <Truck className="w-3.5 h-3.5 text-amber-600" strokeWidth={1.75} />
                        <span>SAC GO (Antar-Jemput)</span>
                    </button>

                    {['Cleaning', 'Treatment', 'Repair', 'Custom'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedTreatmentCategory(selectedTreatmentCategory === cat ? 'all' : cat)}
                            className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition border ${
                                selectedTreatmentCategory === cat
                                    ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold shadow-xs'
                                    : 'bg-white text-slate-600 border-stone-200 hover:bg-stone-50 shadow-xs'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Sub-header Summary Counter */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 font-mono">
                    <span>
                        Menampilkan <strong className="text-slate-900 font-sans">{branches.length}</strong> gerai
                    </span>
                    {userLocation && (
                        <span className="text-emerald-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Urut terdekat dari Anda
                        </span>
                    )}
                </div>
            </div>

            {/* List of Branch Cards */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#f8fafc]/50">
                {branches.length === 0 ? (
                    <div className="text-center py-12 px-4 space-y-3 bg-white border border-stone-200/80 rounded-2xl shadow-xs">
                        <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-slate-500">
                            <Search className="w-4 h-4" />
                        </div>
                        <h3 className="font-semibold text-xs text-slate-800">Tidak ada gerai ditemukan</h3>
                        <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                            Coba sesuaikan kata kunci pencarian, ganti filter kecamatan, atau reset filter layanan.
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedDistrict('all');
                                setFilterSpecialOnly(false);
                                setSelectedTreatmentCategory('all');
                            }}
                            className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium transition shadow-xs"
                        >
                            Reset Filter
                        </button>
                    </div>
                ) : (
                    branches.map((branch) => {
                        const isSelected = activeBranch?.id === branch.id;
                        const status = getOperatingStatus(branch);
                        const initials = getBrandInitials(branch.brand_name);
                        const hasSpecial = branch.special_treatments && branch.special_treatments.length > 0;

                        return (
                            <div
                                key={branch.id}
                                onClick={() => onSelectBranch(branch)}
                                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                                    isSelected
                                        ? 'bg-amber-50/50 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                                        : 'bg-white hover:bg-stone-50/80 border-stone-200/90 hover:border-stone-300 shadow-[0_2px_8px_rgba(0,0,0,0.03)]'
                                }`}
                            >
                                {/* Top Header: Monogram Avatar + Branch Identity + Rating */}
                                <div className="flex items-start gap-2.5 mb-2">
                                    {/* Shoe Care Brand Avatar */}
                                    <div className="w-8 h-8 rounded-lg bg-black border border-stone-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                                        <img src="/images/logo.png" alt="Shoes and Care" className="w-full h-full object-contain p-0.5" />
                                    </div>

                                    {/* Name & Subtitle */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                                                {branch.brand_name}
                                            </span>
                                            <span className="text-[10px] text-stone-400">•</span>
                                            <span className="text-[10px] text-stone-600 font-medium">
                                                {branch.district_name.includes('Bekasi') ? `Kec. ${branch.district_name}` : branch.district_name}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-sm text-slate-900 group-hover:text-amber-600 truncate mt-0.5">
                                            {branch.branch_name}
                                        </h3>
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-stone-50 border border-stone-200/90 text-xs shrink-0 font-mono">
                                        <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                                        <span className="font-semibold text-slate-800 text-[11px]">{branch.rating}</span>
                                    </div>
                                </div>

                                {/* Address & Benchmark */}
                                <div className="space-y-1 mb-2 text-xs text-slate-600">
                                    <p className="line-clamp-2 leading-relaxed flex items-start gap-1.5 text-[11px]">
                                        <MapPin className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" strokeWidth={1.75} />
                                        <span>{branch.full_address}</span>
                                    </p>
                                    {branch.benchmark_notes && (
                                        <p className="text-[11px] text-stone-500 pl-4.5 italic line-clamp-1">
                                            Patokan: {branch.benchmark_notes}
                                        </p>
                                    )}
                                </div>

                                {/* Operational Status & Distance Row */}
                                <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1.5 border-t border-stone-100 mb-2 flex-wrap font-mono">
                                    <div className="flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${status.isOpen ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                        <span className={status.isOpen ? 'text-emerald-700 font-medium font-sans' : 'text-slate-500 font-sans'}>
                                            {status.text}
                                        </span>
                                    </div>

                                    {branch.distance_km !== null && (
                                        <div className="flex items-center gap-1 text-slate-600">
                                            <Navigation className="w-2.5 h-2.5 text-blue-500" />
                                            <span>{branch.distance_km} km</span>
                                        </div>
                                    )}

                                    {branch.is_pickup_available && (
                                        <span className="text-[10px] text-emerald-800 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 flex items-center gap-1">
                                            <Truck className="w-2.5 h-2.5 text-emerald-600" />
                                            SAC GO Ready
                                        </span>
                                    )}
                                </div>

                                {/* Layanan Khusus: SAC GO Box */}
                                {branch.is_pickup_available ? (
                                    <div className="mb-2.5 p-2 rounded-xl bg-gradient-to-r from-emerald-50/70 to-stone-50 border border-emerald-200/80 flex items-center justify-between text-[11px]">
                                        <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                                            <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                            <span><strong>SAC GO:</strong> Antar-Jemput Gratis (Radius 5 km)</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-xs shrink-0">
                                            GRATIS
                                        </span>
                                    </div>
                                ) : (
                                    <div className="mb-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200/70 text-[11px] text-stone-500 flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-stone-400" />
                                        <span>Khusus Walk-in di Outlet (Tanpa SAC GO)</span>
                                    </div>
                                )}

                                {/* Action Bar */}
                                <div className="flex items-center gap-1.5 pt-0.5">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onOpenBranchDetail(branch);
                                        }}
                                        className="flex-1 py-1.5 px-2 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-slate-800 text-xs font-medium border border-stone-200/80 flex items-center justify-center gap-1 transition shadow-xs"
                                    >
                                        <span>Rincian Layanan ({branch.total_treatments_count})</span>
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                    </button>

                                    <a
                                        href={`https://wa.me/${branch.whatsapp_number}?text=Halo%20${encodeURIComponent(branch.brand_name)}%20${encodeURIComponent(branch.branch_name)},%20saya%20melihat%20lokasi%20Anda%20di%20Web%20GIS%20Shoe%20Care%20Bekasi.%20Saya%20ingin%20konsultasi%20perawatan%20sepatu.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1 transition shadow-xs"
                                        title="Chat WhatsApp Gerai"
                                    >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        <span>WA</span>
                                    </a>

                                    <a
                                        href={branch.gmaps_url || `https://maps.google.com/?q=${branch.latitude},${branch.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1.5 px-2 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-slate-700 border border-stone-200/80 transition shadow-xs"
                                        title="Petunjuk Arah Google Maps"
                                    >
                                        <Navigation className="w-3.5 h-3.5 text-blue-500" />
                                    </a>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Discreet Internal Portal Link */}
            <div className="p-2.5 border-t border-stone-200/70 bg-stone-50/80 text-[10px] text-stone-400 flex items-center justify-between px-4 shrink-0">
                <span>© 2026 Shoes and Care GIS</span>
                <Link href="/login" className="hover:text-amber-700 transition font-medium">
                    Akses Karyawan &rarr;
                </Link>
            </div>
        </aside>
    );
}
