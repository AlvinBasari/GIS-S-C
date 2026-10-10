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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                            <BarChart3 className="w-4 h-4" strokeWidth={1.75} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white tracking-tight">
                                Analisis Spasial & Kepadatan Shoe Care
                            </h2>
                            <p className="text-xs text-slate-400">
                                Evaluasi sebaran geografis, konsentrasi kompetisi, dan peluang ekspansi Kota Bekasi
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

                {/* Body Content */}
                <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
                    {/* Statistik Spasial Metric Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">Total Gerai</span>
                            <div className="text-xl font-bold text-amber-400 font-mono">{spatialStats.total_branches}</div>
                            <span className="text-[10px] text-slate-400 block">Kota Bekasi</span>
                        </div>

                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">Kecamatan Aktif</span>
                            <div className="text-xl font-bold text-blue-400 font-mono">{spatialStats.total_districts}</div>
                            <span className="text-[10px] text-slate-400 block">12 Wilayah Administratif</span>
                        </div>

                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">Layanan Standar</span>
                            <div className="text-xl font-bold text-emerald-400 font-mono">{spatialStats.general_treatments_count}</div>
                            <span className="text-[10px] text-slate-400 block">Menu Jaringan Umum</span>
                        </div>

                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">Layanan Khusus</span>
                            <div className="text-xl font-bold text-purple-400 font-mono">{spatialStats.special_treatments_count}</div>
                            <span className="text-[10px] text-slate-400 block">Spesialisasi Cabang</span>
                        </div>
                    </div>

                    {/* Distribusi per Kecamatan */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                                <Layers className="w-3.5 h-3.5 text-amber-400" />
                                <span>Distribusi Konsentrasi Gerai per Kecamatan</span>
                            </h3>
                            <span className="text-[10px] text-slate-400 font-mono">12 Kecamatan</span>
                        </div>

                        <div className="space-y-2 pt-1">
                            {sortedDistricts.map((item) => {
                                const percentage = Math.round((item.count / totalBranches) * 100);
                                return (
                                    <div key={item.name} className="space-y-1">
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-200">Kec. {item.name}</span>
                                            <span className="text-slate-400 font-mono">
                                                <strong className="text-white font-sans">{item.count}</strong> gerai ({percentage}%)
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.max(percentage, item.count > 0 ? 5 : 0)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Analisis Peluang Pasar (Market Opportunity Gap) */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                        <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Insight Peluang Pasar & Kesenjangan Layanan (Market Gap)</span>
                        </h3>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                            Berdasarkan densitas spasial, kawasan <strong>Bekasi Selatan</strong> dan <strong>Bekasi Barat</strong> menunjukkan tingkat konsentrasi tertinggi (area prime pasar menengah-atas).
                        </p>
                        {lowDistricts.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px]">
                                <strong>Rekomendasi Ekspansi:</strong> Wilayah seperti{' '}
                                <span className="text-white font-medium">
                                    {lowDistricts.map((d) => `Kec. ${d.name}`).join(', ')}
                                </span>{' '}
                                belum terlayani outlet resmi terdaftar dan merupakan peluang ekspansi potensial untuk pembukaan cabang baru atau drop-point pickup care.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-[11px] text-slate-400">
                    <span>ShoeCareGIS Bekasi Analytics Engine v1.3</span>
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
