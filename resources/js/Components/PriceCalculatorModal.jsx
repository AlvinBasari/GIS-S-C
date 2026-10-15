import React, { useState, useMemo } from 'react';
import { 
    X, 
    Calculator, 
    Sparkles, 
    Clock, 
    Check, 
    MessageCircle, 
    Layers,
    ShieldCheck,
    Truck
} from 'lucide-react';

export default function PriceCalculatorModal({ 
    branches, 
    initialBranch, 
    onClose,
    onProceedToBooking = () => {},
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
        const items = selectedTreatments.map((t) => `- ${t.name} (${t.price > 0 ? formatRupiah(t.price) : 'GRATIS'})`).join('\n');
        const sacGoText = activeBranch.is_pickup_available ? '✓ Menggunakan Layanan Antar-Jemput SAC GO (Gratis Radius 5 KM)' : '- Datang Langsung ke Gerai (Walk-in)';
        
        return `${greeting}\n\nSaya ingin konsultasi & booking perawatan sepatu dari *Shoes and Care GIS*:\n` +
               `*Jenis Sepatu:* ${selectedShoeType}\n` +
               `*Jumlah:* ${pairCount} pasang\n` +
               `*Metode Layanan:* ${sacGoText}\n` +
               `*Layanan Dipilih:*\n${items || '- Belum dipilih'}\n\n` +
               `*Total Estimasi Biaya:* ${formatRupiah(subtotal)}\n\n` +
               `Mohon konfirmasi jadwal & ketersediaan slot. Terima kasih!`;
    }, [activeBranch, customerName, selectedShoeType, pairCount, selectedTreatments, subtotal]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden font-sans">
                {/* Modal Header */}
                <div className="p-4 sm:p-5 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/70">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                            <Calculator className="w-4 h-4" strokeWidth={1.75} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 tracking-tight">
                                Kalkulator Biaya & Estimasi Perawatan
                            </h2>
                            <p className="text-xs text-slate-500">
                                Simulasi biaya transparan berdasarkan jenis bahan dan menu cabang
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-slate-500 hover:text-slate-800 transition border border-stone-200/70"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs bg-[#f8fafc]/50">
                    {/* Langkah 1: Pilih Cabang */}
                    <div className="space-y-1">
                        <label className="text-[11px] uppercase font-semibold text-stone-600 block tracking-wider">
                            1. Pilih Outlet Tujuan:
                        </label>
                        <select
                            value={selectedBranchId}
                            onChange={(e) => {
                                setSelectedBranchId(e.target.value);
                                setSelectedTreatments([]);
                            }}
                            className="w-full p-2 bg-white border border-stone-200/90 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-amber-500 shadow-xs cursor-pointer"
                        >
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.brand_name} - {b.branch_name} ({b.district_name.includes('Bekasi') ? 'Kec. ' + b.district_name : b.district_name})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Langkah 2: Jenis Sepatu & Jumlah Pasang */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[11px] uppercase font-semibold text-stone-600 block tracking-wider">
                                2. Jenis Bahan Sepatu:
                            </label>
                            <select
                                value={selectedShoeType}
                                onChange={(e) => setSelectedShoeType(e.target.value)}
                                className="w-full p-2 bg-white border border-stone-200/90 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-amber-500 shadow-xs cursor-pointer"
                            >
                                <option value="Sneakers Casual / Canvas">Sneakers Casual / Canvas</option>
                                <option value="Leather / Kulit Asli">Leather / Kulit Asli</option>
                                <option value="Suede / Nubuck Lembut">Suede / Nubuck Lembut</option>
                                <option value="Running / Sepatu Olahraga">Running / Sepatu Olahraga</option>
                                <option value="Boots Formal / Outdoor">Boots Formal / Outdoor</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] uppercase font-semibold text-stone-600 block tracking-wider">
                                Jumlah Pasang:
                            </label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4].map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setPairCount(n)}
                                        className={`flex-1 py-1.5 rounded-xl font-mono text-xs font-semibold border transition shadow-xs ${
                                            pairCount === n
                                                ? 'bg-amber-500 text-slate-950 border-amber-500'
                                                : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-50'
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
                            <label className="text-[11px] uppercase font-semibold text-stone-600 block tracking-wider">
                                3. Pilih Layanan di {activeBranch.branch_name}:
                            </label>

                            {/* Layanan Khusus */}
                            {activeBranch.special_treatments && activeBranch.special_treatments.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[10px] font-semibold text-amber-800 flex items-center gap-1 uppercase tracking-wider">
                                        <Sparkles className="w-3 h-3 text-amber-600" />
                                        <span>Spesialisasi Cabang Ini:</span>
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {activeBranch.special_treatments.map((st) => {
                                            const isChecked = selectedTreatments.some((t) => t.id === st.id);
                                            return (
                                                <div
                                                    key={st.id}
                                                    onClick={() => toggleTreatment(st)}
                                                    className={`p-2.5 rounded-2xl border cursor-pointer transition flex items-start justify-between gap-2 shadow-xs ${
                                                        isChecked
                                                            ? 'bg-amber-50/90 border-amber-400 text-slate-900 ring-1 ring-amber-400/40'
                                                            : 'bg-white border-stone-200/90 hover:border-stone-300 text-slate-700'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="font-semibold text-xs text-slate-900">{st.name}</div>
                                                        <span className="text-[10px] text-amber-800 block mt-0.5 font-mono">
                                                            {st.est_duration}
                                                        </span>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <span className="font-mono font-bold text-amber-800 text-xs">
                                                            {formatRupiah(st.price)}
                                                        </span>
                                                        <div className={`w-4 h-4 rounded-md mt-1 ml-auto flex items-center justify-center border ${
                                                            isChecked ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-stone-300 bg-stone-50'
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
                                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1">
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
                                                className={`p-2 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-2 shadow-xs ${
                                                    isChecked
                                                        ? 'bg-emerald-50 border-emerald-400 text-slate-900 ring-1 ring-emerald-400/40'
                                                        : 'bg-white border-stone-200/90 hover:border-stone-300 text-slate-700'
                                                }`}
                                            >
                                                <div>
                                                    <div className="font-semibold text-xs text-slate-900">{gt.name}</div>
                                                    <span className="text-[10px] text-stone-500 font-mono">{gt.est_duration}</span>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="font-mono font-bold text-slate-800 text-xs">
                                                        {formatRupiah(gt.price)}
                                                    </span>
                                                    <div className={`w-4 h-4 rounded-md mt-0.5 ml-auto flex items-center justify-center border ${
                                                        isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300 bg-stone-50'
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
                        <label className="text-[11px] text-stone-600 block">
                            Nama Anda (opsional untuk pesan WhatsApp):
                        </label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Contoh: Alvin"
                            className="w-full p-2 bg-white border border-stone-200/90 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-amber-500 shadow-xs"
                        />
                    </div>
                </div>

                {/* Footer Total & In-App Booking Action */}
                <div className="p-4 bg-stone-50/90 border-t border-stone-200/80 flex items-center justify-between gap-4">
                    <div>
                        <span className="text-[10px] text-stone-500 block font-mono">
                            Estimasi Total ({pairCount} Pasang):
                        </span>
                        <div className="text-lg font-bold text-amber-700 font-mono">
                            {formatRupiah(subtotal)}
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={subtotal === 0 || !activeBranch}
                        onClick={() => {
                            if (subtotal > 0 && activeBranch) {
                                onProceedToBooking(
                                    activeBranch, 
                                    selectedTreatments.map(t => t.id), 
                                    pairCount, 
                                    selectedShoeType
                                );
                            }
                        }}
                        className={`py-2.5 px-5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-xs cursor-pointer ${
                            subtotal > 0 && activeBranch
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                    >
                        <Truck className="w-4 h-4" />
                        <span>Lanjut Booking Sekarang (In-App) →</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
