import React, { useState, useMemo } from 'react';
import { 
    X, 
    Calculator, 
    Sparkles, 
    Clock, 
    Check, 
    MessageCircle, 
    Layers,
    ShieldCheck
} from 'lucide-react';

export default function PriceCalculatorModal({ 
    branches, 
    initialBranch, 
    onClose 
}) {
    const [selectedBranchId, setSelectedBranchId] = useState(
        initialBranch?.id || (branches[0]?.id || '')
    );
    const [selectedShoeType, setSelectedShoeType] = useState('Sneakers Casual / Canvas');
    const [selectedTreatments, setSelectedTreatments] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [pairCount, setPairCount] = useState(1);

    const activeBranch = useMemo(() => {
        return branches.find((b) => b.id === Number(selectedBranchId)) || branches[0];
    }, [branches, selectedBranchId]);

    // Format Rupiah
    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
    };

    const toggleTreatment = (treatment) => {
        const exists = selectedTreatments.some((t) => t.id === treatment.id);
        if (exists) {
            setSelectedTreatments(selectedTreatments.filter((t) => t.id !== treatment.id));
        } else {
            setSelectedTreatments([...selectedTreatments, treatment]);
        }
    };

    // Subtotal
    const subtotal = useMemo(() => {
        const perPair = selectedTreatments.reduce((acc, curr) => acc + (curr.price || 0), 0);
        return perPair * pairCount;
    }, [selectedTreatments, pairCount]);

    // WhatsApp Message
    const whatsappMessage = useMemo(() => {
        if (!activeBranch) return '';
        const greeting = customerName ? `Halo ${activeBranch.brand_name} ${activeBranch.branch_name}, saya ${customerName}.` : `Halo ${activeBranch.brand_name} ${activeBranch.branch_name}.`;
        const items = selectedTreatments.map((t) => `- ${t.name} (${formatRupiah(t.price)})`).join('\n');
        
        return `${greeting}\n\nSaya ingin konsultasi & booking perawatan sepatu dari Web GIS Shoe Care Bekasi:\n` +
               `*Jenis Sepatu:* ${selectedShoeType}\n` +
               `*Jumlah:* ${pairCount} pasang\n` +
               `*Layanan Dipilih:*\n${items || '- Belum dipilih'}\n\n` +
               `*Total Estimasi:* ${formatRupiah(subtotal)}\n\n` +
               `Mohon info ketersediaan slot antrian dan jadwal antar-jemput. Terima kasih!`;
    }, [activeBranch, customerName, selectedShoeType, pairCount, selectedTreatments, subtotal]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
                {/* Modal Header */}
                <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                            <Calculator className="w-4 h-4" strokeWidth={1.75} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white tracking-tight">
                                Kalkulator Biaya & Estimasi Perawatan
                            </h2>
                            <p className="text-xs text-slate-400">
                                Simulasi biaya transparan berdasarkan jenis bahan dan menu cabang
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
                <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
                    {/* Langkah 1: Pilih Cabang */}
                    <div className="space-y-1">
                        <label className="text-[11px] uppercase font-semibold text-slate-300 block tracking-wider">
                            1. Pilih Outlet Tujuan:
                        </label>
                        <select
                            value={selectedBranchId}
                            onChange={(e) => {
                                setSelectedBranchId(e.target.value);
                                setSelectedTreatments([]);
                            }}
                            className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.brand_name} - {b.branch_name} (Kec. {b.district_name})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Langkah 2: Jenis Sepatu & Jumlah Pasang */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[11px] uppercase font-semibold text-slate-300 block tracking-wider">
                                2. Jenis Bahan Sepatu:
                            </label>
                            <select
                                value={selectedShoeType}
                                onChange={(e) => setSelectedShoeType(e.target.value)}
                                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                            >
                                <option value="Sneakers Casual / Canvas">Sneakers Casual / Canvas</option>
                                <option value="Leather / Kulit Asli">Leather / Kulit Asli</option>
                                <option value="Suede / Nubuck Lembut">Suede / Nubuck Lembut</option>
                                <option value="Running / Sepatu Olahraga">Running / Sepatu Olahraga</option>
                                <option value="Boots Formal / Outdoor">Boots Formal / Outdoor</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] uppercase font-semibold text-slate-300 block tracking-wider">
                                Jumlah Pasang:
                            </label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4].map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setPairCount(n)}
                                        className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-semibold border transition ${
                                            pairCount === n
                                                ? 'bg-amber-400 text-slate-950 border-amber-400'
                                                : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
                                        }`}
                                    >
                                        {n} Pasang
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Langkah 3: Pilih Treatment */}
                    {activeBranch && (
                        <div className="space-y-3 pt-1">
                            <label className="text-[11px] uppercase font-semibold text-slate-300 block tracking-wider">
                                3. Pilih Layanan di {activeBranch.branch_name}:
                            </label>

                            {/* Layanan Khusus */}
                            {activeBranch.special_treatments && activeBranch.special_treatments.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1 uppercase tracking-wider">
                                        <Sparkles className="w-3 h-3" />
                                        <span>Spesialisasi Cabang Ini:</span>
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {activeBranch.special_treatments.map((st) => {
                                            const isChecked = selectedTreatments.some((t) => t.id === st.id);
                                            return (
                                                <div
                                                    key={st.id}
                                                    onClick={() => toggleTreatment(st)}
                                                    className={`p-2.5 rounded-xl border cursor-pointer transition flex items-start justify-between gap-2 ${
                                                        isChecked
                                                            ? 'bg-amber-400/15 border-amber-400 text-white'
                                                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="font-semibold text-xs text-white">{st.name}</div>
                                                        <span className="text-[10px] text-amber-400/90 block mt-0.5 font-mono">
                                                            {st.est_duration}
                                                        </span>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <span className="font-mono font-semibold text-amber-400 text-xs">
                                                            {formatRupiah(st.price)}
                                                        </span>
                                                        <div className={`w-4 h-4 rounded mt-1 ml-auto flex items-center justify-center border ${
                                                            isChecked ? 'bg-amber-400 border-amber-400 text-slate-950' : 'border-slate-700'
                                                        }`}>
                                                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Layanan Umum */}
                            <div className="space-y-2 pt-1">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <Layers className="w-3 h-3" />
                                    <span>Layanan Standar:</span>
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                                    {activeBranch.general_treatments?.map((gt) => {
                                        const isChecked = selectedTreatments.some((t) => t.id === gt.id);
                                        return (
                                            <div
                                                key={gt.id}
                                                onClick={() => toggleTreatment(gt)}
                                                className={`p-2 rounded-xl border cursor-pointer transition flex items-center justify-between gap-2 ${
                                                    isChecked
                                                        ? 'bg-emerald-500/15 border-emerald-500 text-white'
                                                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                                                }`}
                                            >
                                                <div>
                                                    <div className="font-semibold text-xs text-white">{gt.name}</div>
                                                    <span className="text-[10px] text-slate-400 font-mono">{gt.est_duration}</span>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="font-mono font-semibold text-slate-200 text-xs">
                                                        {formatRupiah(gt.price)}
                                                    </span>
                                                    <div className={`w-4 h-4 rounded mt-0.5 ml-auto flex items-center justify-center border ${
                                                        isChecked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'
                                                    }`}>
                                                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Nama Pelanggan (Opsional) */}
                    <div className="space-y-1 pt-1">
                        <label className="text-[11px] text-slate-400 block">
                            Nama Anda (opsional untuk pesan WhatsApp):
                        </label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Contoh: Alvin"
                            className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                    </div>
                </div>

                {/* Footer Total & WhatsApp Action */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
                    <div>
                        <span className="text-[10px] text-slate-400 block font-mono">
                            Estimasi Total ({pairCount} Pasang):
                        </span>
                        <div className="text-lg font-bold text-amber-400 font-mono">
                            {formatRupiah(subtotal)}
                        </div>
                    </div>

                    <a
                        href={subtotal > 0 && activeBranch ? `https://wa.me/${activeBranch.whatsapp_number}?text=${encodeURIComponent(whatsappMessage)}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`py-2 px-5 rounded-xl font-medium text-xs flex items-center gap-2 transition ${
                            subtotal > 0 && activeBranch
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none'
                        }`}
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span>Kirim Booking via WhatsApp</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
