import React from 'react';
import { 
    X, 
    BarChart3, 
    Layers, 
    Sparkles, 
    TrendingUp, 
    MapPin, 
    ShieldCheck, 
    Compass
} from 'lucide-react';

export default function SpatialAnalysisModal({ 
    spatialStats, 
    districts, 
    onClose 
}) {
    if (!spatialStats) return null;

    const totalBranches = spatialStats.total_branches || 1;
    const districtDist = spatialStats.districts_distribution || [];

    // Urutkan berdasarkan jumlah gerai
    const sortedDistricts = [...districtDist].sort((a, b) => b.count - a.count);
    const lowDistricts = sortedDistricts.filter((d) => d.count === 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden font-sans">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/70">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-700">
                            <BarChart3 className="w-4 h-4" strokeWidth={1.75} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 tracking-tight">
                                Analisis Spasial Shoes and Care GIS
                            </h2>
                            <p className="text-xs text-slate-500">
                                Evaluasi sebaran geografis, konsentrasi kompetisi, dan sebaran layanan SAC GO di seluruh Indonesia
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

                {/* Body Content */}
                <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
                    {/* Statistik Spasial Metric Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/80 space-y-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                            <span className="text-[10px] text-stone-500 uppercase font-semibold block tracking-wider">Total Gerai</span>
                            <div className="text-xl font-bold text-amber-700 font-mono">{spatialStats.total_branches}</div>
                            <span className="text-[10px] text-stone-400 block">Seluruh Indonesia</span>
                        </div>

                        <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/80 space-y-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                            <span className="text-[10px] text-stone-500 uppercase font-semibold block tracking-wider">Wilayah Aktif</span>
                            <div className="text-xl font-bold text-blue-700 font-mono">{spatialStats.total_districts}</div>
                            <span className="text-[10px] text-stone-400 block">{spatialStats.total_districts} Wilayah Administratif</span>
                        </div>

                        <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/80 space-y-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                            <span className="text-[10px] text-stone-500 uppercase font-semibold block tracking-wider">Menu Standar</span>
                            <div className="text-xl font-bold text-emerald-700 font-mono">{spatialStats.general_treatments_count}</div>
                            <span className="text-[10px] text-stone-400 block">Layanan Resmi Jaringan</span>
                        </div>

                        <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/80 space-y-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                            <span className="text-[10px] text-stone-500 uppercase font-semibold block tracking-wider">Gerai SAC GO</span>
                            <div className="text-xl font-bold text-purple-700 font-mono">{spatialStats.sac_go_count || spatialStats.special_treatments_count}</div>
                            <span className="text-[10px] text-stone-400 block">Antar-Jemput Aktif</span>
                        </div>
                    </div>

                    {/* Distribusi per Kecamatan */}
                    <div className="p-4 rounded-2xl bg-stone-50/60 border border-stone-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                                <Layers className="w-3.5 h-3.5 text-amber-600" />
                                <span>Distribusi Konsentrasi Gerai per Wilayah</span>
                            </h3>
                            <span className="text-[10px] text-stone-500 font-mono">{sortedDistricts.length} Wilayah</span>
                        </div>

                        <div className="space-y-2 pt-1">
                            {sortedDistricts.map((item) => {
                                const percentage = Math.round((item.count / totalBranches) * 100);
                                return (
                                    <div key={item.name} className="space-y-1">
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-700 font-medium">{item.name.includes('Bekasi') ? 'Kec. ' + item.name : item.name}</span>
                                            <span className="text-slate-500 font-mono">
                                                <strong className="text-slate-900 font-semibold">{item.count}</strong> gerai ({percentage}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-stone-200/80 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.max(percentage, item.count > 0 ? 5 : 0)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Analisis Peluang Pasar (Market Opportunity Gap) */}
                    <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/70 space-y-2.5">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Insight Peluang Pasar & Kesenjangan Layanan (Market Gap)</span>
                        </h3>
                        <p className="text-slate-700 leading-relaxed text-[11px]">
                            Berdasarkan densitas spasial, kawasan <strong className="text-slate-900">Bekasi Selatan</strong> dan <strong className="text-slate-900">Bekasi Barat</strong> menunjukkan tingkat konsentrasi tertinggi (area prime pasar menengah-atas).
                        </p>
                        {lowDistricts.length > 0 && (
                            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-900 text-[11px] leading-relaxed">
                                <strong className="font-semibold text-blue-950">Rekomendasi Ekspansi:</strong> Wilayah seperti{' '}
                                <span className="font-semibold text-blue-950">
                                    {lowDistricts.map((d) => `Kec. ${d.name}`).join(', ')}
                                </span>{' '}
                                belum terlayani outlet resmi terdaftar dan merupakan peluang ekspansi potensial untuk pembukaan cabang baru atau drop-point pickup care.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3.5 border-t border-stone-200/80 bg-stone-50/80 flex items-center justify-between text-[11px] text-stone-500">
                    <span>Shoes and Care GIS Analytics Engine v1.4</span>
                    <button
                        onClick={onClose}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-200/80 hover:bg-stone-300 text-slate-700 font-medium transition"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
