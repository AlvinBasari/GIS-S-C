import React from 'react';
import { Link } from '@inertiajs/react';
import { 
    Calculator, 
    Navigation, 
    Truck, 
    Search,
    MapPin
} from 'lucide-react';

export default function Navbar({ 
    totalBranches, 
    totalDistricts, 
    onOpenCalculator, 
    onOpenBooking = () => {},
    onLocateUser,
    isLocating,
    userLocation
}) {
    return (
        <header className="bg-white/90 backdrop-blur-xl border-b border-stone-200/80 sticky top-0 z-30 px-4 lg:px-6 py-2.5 text-slate-800 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Brand Logo & Title */}
                <div className="flex items-center gap-3">
                    <Link href="/" className="h-10 w-10 rounded-xl bg-black border border-stone-300/80 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                        <img 
                            src="/images/logo.png" 
                            alt="Shoes and Care" 
                            className="h-full w-full object-contain p-0.5" 
                        />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-base tracking-tight text-slate-900">
                                Shoes and Care <span className="text-amber-600 font-extrabold">GIS</span>
                            </span>
                            <span className="hidden sm:inline-flex items-center text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                SAC GO Ready
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 hidden md:block leading-tight">
                            Layanan Cuci Sepatu Premium & Antar-Jemput SAC GO Bergaransi
                        </p>
                    </div>
                </div>

                {/* System Indicators (Desktop) */}
                <div className="hidden xl:flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100/80 border border-stone-200/90 text-stone-600 font-mono text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <strong className="text-slate-800 font-sans">{totalBranches}</strong> Gerai Resmi
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100/80 border border-stone-200/90 text-stone-600 font-mono text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <strong className="text-slate-800 font-sans">{totalDistricts}</strong> Wilayah / Kota
                    </div>
                </div>

                {/* Customer Action Bar (Zero Admin Clutter) */}
                <div className="flex items-center gap-2">
                    {/* Geolocation Button */}
                    <button
                        onClick={onLocateUser}
                        disabled={isLocating}
                        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium transition border cursor-pointer ${
                            userLocation 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100/60 shadow-xs' 
                                : 'bg-white text-slate-700 border-stone-200/90 hover:bg-stone-50 hover:text-slate-900 shadow-xs'
                        }`}
                        title="Deteksi Lokasi GPS Anda"
                    >
                        <Navigation className={`w-3.5 h-3.5 text-amber-500 ${isLocating ? 'animate-spin' : ''}`} strokeWidth={1.75} />
                        <span className="hidden sm:inline">{userLocation ? 'GPS Aktif' : 'Cari Terdekat'}</span>
                    </button>

                    {/* Track Order Link */}
                    <Link
                        href="/track"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium bg-white hover:bg-stone-50 text-slate-700 border border-stone-200/90 shadow-xs transition"
                    >
                        <Search className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                        <span className="hidden sm:inline">Lacak Sepatu</span>
                    </Link>

                    {/* Price Calculator Modal Trigger */}
                    <button
                        onClick={onOpenCalculator}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium bg-white hover:bg-stone-50 text-slate-700 border border-stone-200/90 shadow-xs transition cursor-pointer hidden sm:inline-flex"
                    >
                        <Calculator className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                        <span>Kalkulator</span>
                    </button>

                    {/* Primary Booking SAC GO Trigger */}
                    <button
                        onClick={onOpenBooking}
                        className="inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-xs cursor-pointer"
                    >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Booking SAC GO</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
