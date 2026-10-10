import React, { useState } from 'react';
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
    Check
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

    // Helper: Hitung status buka/tutup berdasarkan jam sekarang
    const getOperatingStatus = (openHour, closeHour) => {
        if (!openHour || !closeHour) return { isOpen: true, text: 'Buka' };
        
        const now = new Date();
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
        <aside className="w-full lg:w-[410px] xl:w-[450px] bg-slate-900/95 border-r border-slate-800 flex flex-col h-[calc(100vh-53px)] z-20 shrink-0">
            {/* Header / Search & Filter Section */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-900 space-y-3">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama gerai, jalan, layanan, atau patokan..."
                        className="w-full pl-9 pr-9 py-2 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition font-sans"
                    />
                    {searchQuery ? (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                            <X className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                    ) : (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 hidden sm:inline">
                            /
                        </span>
                    )}
                </div>

                {/* Kecamatan Select */}
                <div className="relative">
                    <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full py-1.5 pl-3 pr-8 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400 transition appearance-none cursor-pointer"
                    >
                        <option value="all">Semua Kecamatan (12 Wilayah Kota Bekasi)</option>
                        {districts.map((d) => (
                            <option key={d.id} value={d.id}>
                                Kec. {d.name} ({d.branches_count ?? 0} Gerai)
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
                        className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition border ${
                            !filterSpecialOnly && selectedTreatmentCategory === 'all'
                                ? 'bg-amber-400 text-slate-950 border-amber-400 font-semibold'
                                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750'
                        }`}
                    >
                        Semua Menu
                    </button>

                    <button
                        onClick={() => setFilterSpecialOnly(!filterSpecialOnly)}
                        className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition flex items-center gap-1 border ${
                            filterSpecialOnly
                                ? 'bg-amber-400/15 text-amber-300 border-amber-400/40 font-semibold'
                                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750'
                        }`}
                    >
                        <Sparkles className="w-3 h-3 text-amber-400" strokeWidth={1.75} />
                        <span>Layanan Khusus</span>
                    </button>

                    {['Cleaning', 'Treatment', 'Repair', 'Custom'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedTreatmentCategory(selectedTreatmentCategory === cat ? 'all' : cat)}
                            className={`px-2.5 py-1 rounded-md whitespace-nowrap transition border ${
                                selectedTreatmentCategory === cat
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-semibold'
                                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Sub-header Summary Counter */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 font-mono">
                    <span>
                        Menampilkan <strong className="text-white font-sans">{branches.length}</strong> gerai
                    </span>
                    {userLocation && (
                        <span className="text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Urut terdekat dari Anda
                        </span>
                    )}
                </div>
            </div>

            {/* List of Branch Cards */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {branches.length === 0 ? (
                    <div className="text-center py-12 px-4 space-y-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                            <Search className="w-4 h-4" />
                        </div>
                        <h3 className="font-semibold text-xs text-slate-200">Tidak ada gerai ditemukan</h3>
                        <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                            Coba sesuaikan kata kunci pencarian, ganti filter kecamatan, atau reset filter layanan.
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedDistrict('all');
                                setFilterSpecialOnly(false);
                                setSelectedTreatmentCategory('all');
                            }}
                            className="text-xs px-3 py-1.5 rounded-md bg-slate-800 text-amber-400 border border-slate-700 hover:bg-slate-700 transition"
                        >
                            Reset Filter
                        </button>
                    </div>
                ) : (
                    branches.map((branch) => {
                        const isSelected = activeBranch?.id === branch.id;
                        const status = getOperatingStatus(branch.open_hour, branch.close_hour);
                        const initials = getBrandInitials(branch.brand_name);
                        const hasSpecial = branch.special_treatments && branch.special_treatments.length > 0;

                        return (
                            <div
                                key={branch.id}
                                onClick={() => onSelectBranch(branch)}
                                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                                    isSelected
                                        ? 'bg-slate-800/90 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                                        : 'bg-slate-950/60 hover:bg-slate-850/80 border-slate-800/90 hover:border-slate-700'
                                }`}
                            >
                                {/* Top Header: Monogram Avatar + Branch Identity + Rating */}
                                <div className="flex items-start gap-2.5 mb-2">
                                    {/* Shoe Care Icon Box */}
                                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M2.5 16c0-.8.6-1.5 1.5-1.5h1.5l2.2-4.5c.4-.8 1.2-1.4 2.1-1.4h3.5l2.4 2.5h3.8c1.6 0 3 1.3 3 3v2H2.5v0z"/>
                                            <path d="M2 18h20v1a1.5 1.5 0 0 1-1.5 1.5H3.5A1.5 1.5 0 0 1 2 19.5V18z"/>
                                            <path d="M8.5 12.5l2 2"/>
                                            <path d="M11 12l2 2"/>
                                        </svg>
                                    </div>

                                    {/* Name & Subtitle */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                                {branch.brand_name}
                                            </span>
                                            <span className="text-[10px] text-slate-400">•</span>
                                            <span className="text-[10px] text-slate-300 font-medium">
                                                Kec. {branch.district_name}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-sm text-white group-hover:text-amber-400 truncate mt-0.5">
                                            {branch.branch_name}
                                        </h3>
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-xs shrink-0 font-mono">
                                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                        <span className="font-semibold text-white text-[11px]">{branch.rating}</span>
                                    </div>
                                </div>

                                {/* Address & Benchmark */}
                                <div className="space-y-1 mb-2 text-xs text-slate-300">
                                    <p className="line-clamp-2 leading-relaxed flex items-start gap-1.5 text-[11px]">
                                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" strokeWidth={1.75} />
                                        <span>{branch.full_address}</span>
                                    </p>
                                    {branch.benchmark_notes && (
                                        <p className="text-[11px] text-slate-400 pl-4.5 italic line-clamp-1">
                                            Patokan: {branch.benchmark_notes}
                                        </p>
                                    )}
                                </div>

                                {/* Operational Status & Distance Row */}
                                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 mb-2 flex-wrap font-mono">
                                    <div className="flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${status.isOpen ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                                        <span className={status.isOpen ? 'text-emerald-400 font-medium font-sans' : 'text-slate-400 font-sans'}>
                                            {status.text}
                                        </span>
                                    </div>

                                    {branch.distance_km !== null && (
                                        <div className="flex items-center gap-1 text-slate-300">
                                            <Navigation className="w-2.5 h-2.5 text-blue-400" />
                                            <span>{branch.distance_km} km</span>
                                        </div>
                                    )}

                                    {branch.is_pickup_available && (
                                        <span className="text-[10px] text-blue-400 font-sans px-1.5 py-0.2 rounded bg-blue-500/10 border border-blue-500/20">
                                            Antar-Jemput
                                        </span>
                                    )}
                                </div>

                                {/* Specialty Treatments Callout Box (Treatment Khusus) */}
                                {hasSpecial && (
                                    <div className="mb-2.5 p-2 rounded-lg bg-amber-400/5 border border-amber-400/15 space-y-1">
                                        <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 tracking-tight">
                                            <Sparkles className="w-2.5 h-2.5" />
                                            <span>Spesialisasi Cabang:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {branch.special_treatments.slice(0, 2).map((st) => (
                                                <span
                                                    key={st.id}
                                                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-amber-400/20 flex items-center gap-1 font-mono"
                                                >
                                                    <span className="font-sans text-slate-200">{st.name}</span>
                                                    <span className="text-amber-400 font-semibold">{formatRupiah(st.price)}</span>
                                                </span>
                                            ))}
                                            {branch.special_treatments.length > 2 && (
                                                <span className="text-[10px] text-slate-400 px-1 py-0.5">
                                                    +{branch.special_treatments.length - 2} lainnya
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Bar */}
                                <div className="flex items-center gap-1.5 pt-0.5">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onOpenBranchDetail(branch);
                                        }}
                                        className="flex-1 py-1.5 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1 transition"
                                    >
                                        <span>Rincian Layanan ({branch.total_treatments_count})</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>

                                    <a
                                        href={`https://wa.me/${branch.whatsapp_number}?text=Halo%20${encodeURIComponent(branch.brand_name)}%20${encodeURIComponent(branch.branch_name)},%20saya%20melihat%20lokasi%20Anda%20di%20Web%20GIS%20Shoe%20Care%20Bekasi.%20Saya%20ingin%20konsultasi%20perawatan%20sepatu.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1.5 px-2.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1 transition shadow-sm"
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
                                        className="p-1.5 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                                        title="Petunjuk Arah Google Maps"
                                    >
                                        <Navigation className="w-3.5 h-3.5 text-blue-400" />
                                    </a>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </aside>
    );
}
