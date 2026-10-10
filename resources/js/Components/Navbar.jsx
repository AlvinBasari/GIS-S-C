import React from 'react';
import { 
    Compass, 
    Calculator, 
    BarChart3, 
    Plus, 
    Navigation, 
    Layers, 
    Sparkles,
    CheckCircle2
} from 'lucide-react';

export default function Navbar({ 
    totalBranches, 
    totalDistricts, 
    onOpenCalculator, 
    onOpenAnalysis, 
    onOpenAddBranch,
    onLocateUser,
    isLocating,
    userLocation
}) {
    return (
        <header className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-30 px-4 lg:px-6 py-2.5 text-slate-100">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Brand Logo & Editorial Typography */}
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shadow-sm">
                        <Compass className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-base tracking-tight text-white">
                                ShoeCare<span className="text-amber-400">GIS</span>
                            </span>
                            <span className="hidden sm:inline-flex items-center text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                Bekasi City
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 hidden md:block leading-tight">
                            Pemetaan Spasial & Direktori Layanan Jasa Perawatan Sepatu
                        </p>
                    </div>
                </div>

                {/* System Indicators (Desktop) */}
                <div className="hidden xl:flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700/60 text-slate-300 font-mono text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <strong className="text-white">{totalBranches}</strong> Gerai Terdaftar
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700/60 text-slate-300 font-mono text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        <strong className="text-white">{totalDistricts}</strong> Kecamatan
                    </div>
                </div>

                {/* Main Action Bar */}
                <div className="flex items-center gap-2">
                    {/* Geolocation Button */}
                    <button
                        onClick={onLocateUser}
                        disabled={isLocating}
                        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition border ${
                            userLocation 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
                        }`}
                        title="Deteksi Lokasi GPS Anda"
                    >
                        <Navigation className={`w-3.5 h-3.5 text-amber-400 ${isLocating ? 'animate-spin' : ''}`} strokeWidth={1.75} />
                        <span className="hidden sm:inline">{userLocation ? 'GPS Aktif' : 'Cari Terdekat'}</span>
                    </button>

                    {/* Price Calculator Modal Trigger */}
                    <button
                        onClick={onOpenCalculator}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                    >
                        <Calculator className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                        <span className="hidden sm:inline">Kalkulator</span>
                    </button>

                    {/* Spatial Analytics Modal Trigger */}
                    <button
                        onClick={onOpenAnalysis}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                    >
                        <BarChart3 className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                        <span className="hidden sm:inline">Analisis GIS</span>
                    </button>

                    {/* Add Branch Modal Trigger */}
                    <button
                        onClick={onOpenAddBranch}
                        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>Daftarkan Gerai</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
