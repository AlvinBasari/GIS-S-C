import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Search, 
    ArrowLeft, 
    CheckCircle2, 
    Clock, 
    Truck, 
    Sparkles, 
    ShieldCheck, 
    MapPin, 
    Phone, 
    MessageCircle,
    Calendar,
    Camera,
    AlertCircle,
    CheckSquare,
    Wrench,
    Shield,
    Receipt,
    Printer,
    X,
    Eye
} from 'lucide-react';

export default function OrderTracking({
    searchCode = '',
    order = null,
}) {
    const [code, setCode] = useState(searchCode || '');
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        router.get('/track', { code: code.trim() }, { preserveState: true });
    };

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
    };

    // 6-Stage SOP Stepper Definition
    const stages = [
        { 
            key: 'INBOUND', 
            statuses: ['BOOKED', 'PENDING_CONFIRMATION'],
            label: '1. Pesanan Terdaftar', 
            desc: 'Booking terverifikasi, menunggu penugasan kurir / konfirmasi gerai',
            icon: CheckSquare
        },
        { 
            key: 'PICKUP', 
            statuses: ['OUT_FOR_PICKUP', 'PICKED_UP'],
            label: '2. Penjemputan SAC GO', 
            desc: 'Kurir menuju lokasi penjemputan & membawa sepatu ke workshop',
            icon: Truck
        },
        { 
            key: 'INTAKE', 
            statuses: ['INTAKE_VERIFIED'],
            label: '3. Workshop Intake & Diagnosis', 
            desc: 'Pemeriksaan kelayakan bahan, foto kondisi awal (Before), & verifikasi',
            icon: Camera
        },
        { 
            key: 'TREATMENT', 
            statuses: ['IN_PROGRESS'],
            label: '4. Treatment & Pencucian', 
            desc: 'Dikerjakan teliti oleh teknisi bersertifikat Shoes and Care',
            icon: Wrench
        },
        { 
            key: 'QC', 
            statuses: ['READY', 'READY_FOR_DELIVERY', 'READY_FOR_PICKUP'],
            label: '5. Quality Control & Packing', 
            desc: 'Pemeriksaan standar garansi, foto hasil akhir (After), siap diserahkan',
            icon: Sparkles
        },
        { 
            key: 'COMPLETED', 
            statuses: ['COMPLETED'],
            label: '6. Selesai & Garansi Aktif', 
            desc: 'Sepatu telah diterima konsumen dengan perlindungan garansi cuci 3 hari',
            icon: ShieldCheck
        },
    ];

    const getStageIndex = (status) => {
        if (!status) return -1;
        const idx = stages.findIndex(s => s.statuses.includes(status));
        return idx !== -1 ? idx : 0;
    };

    const currentStageIndex = order ? getStageIndex(order.status) : -1;

    return (
        <div className="min-h-screen bg-[#fcfbf9] text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
            <Head title="Pelacakan Pesanan Sepatu - Shoes and Care GIS" />

            {/* Header */}
            <header className="bg-white/95 backdrop-blur-md border-b border-stone-200/90 sticky top-0 z-30 px-4 lg:px-8 py-3 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="w-10 h-10 rounded-xl bg-black border border-stone-200 flex items-center justify-center p-0.5 shrink-0">
                            <img src="/images/logo.png" alt="Shoes and Care" className="w-full h-full object-contain" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-base tracking-tight text-slate-900">
                                Pelacakan Status Sepatu <span className="text-amber-600 font-extrabold">Real-Time</span>
                            </h1>
                            <p className="text-[11px] text-slate-500">
                                Standar Operasional Cuci Sepatu Premium Bergaransi #1 di Indonesia
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-slate-700 transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Kembali ke Peta</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 lg:p-8 space-y-6">
                {/* Search Bar Card */}
                <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="text-center max-w-lg mx-auto space-y-1">
                        <h2 className="text-lg font-bold text-slate-900">Cek Progres Perawatan Sepatu Anda</h2>
                        <p className="text-xs text-slate-500">
                            Masukkan Nomor Invoice (contoh: <code className="text-amber-700 font-mono font-semibold">SAC-GLX-202610-001</code>) atau Nomor WhatsApp yang Anda gunakan saat booking
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="max-w-md mx-auto flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Contoh: SAC-GLX-202610-001 / 0812..."
                                className="w-full pl-10 pr-3 py-2 bg-stone-50 border border-stone-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 font-sans"
                            />
                        </div>
                        <button
                            type="submit"
                            className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 font-semibold text-xs text-slate-950 transition shadow-xs cursor-pointer shrink-0"
                        >
                            Lacak Sekarang
                        </button>
                    </form>
                </div>

                {/* Tracking Result View */}
                {searchCode && !order && (
                    <div className="p-8 bg-white border border-stone-200/90 rounded-3xl text-center space-y-2 shadow-xs">
                        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                        <h3 className="font-bold text-sm text-slate-900">Pesanan Tidak Ditemukan</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Tidak ditemukan pesanan dengan kode atau nomor telepon <strong className="text-slate-800 font-mono">"{searchCode}"</strong>. Pastikan kode invoice sesuai dengan yang dikirimkan melalui WhatsApp.
                        </p>
                    </div>
                )}

                {order && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Order Summary & Identity Card */}
                        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono font-bold text-lg text-slate-900">
                                            {order.order_code}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                            order.service_type === 'SAC_GO' 
                                                ? 'bg-amber-50 text-amber-900 border-amber-300' 
                                                : 'bg-stone-50 text-stone-700 border-stone-300'
                                        }`}>
                                            {order.service_type === 'SAC_GO' ? 'Antar-Jemput SAC GO' : 'Walk-In di Gerai'}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                            order.payment_status === 'PAID'
                                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                                : 'bg-amber-50 text-amber-900 border-amber-300'
                                        }`}>
                                            {order.payment_status === 'PAID' ? 'LUNAS' : 'MENUNGGU PEMBAYARAN'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Ditangani resmi oleh gerai: <strong className="text-slate-800">{order.branch?.branch_name}</strong> ({order.branch?.district?.name})
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 self-start sm:self-auto">
                                    <button
                                        onClick={() => setIsReceiptModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 transition font-medium cursor-pointer"
                                    >
                                        <Receipt className="w-3.5 h-3.5" />
                                        <span>Lihat E-Receipt</span>
                                    </button>

                                    <a
                                        href={`https://wa.me/${order.branch?.whatsapp_number}?text=Halo%20Shoes%20and%20Care%20${encodeURIComponent(order.branch?.branch_name)},%20saya%20${encodeURIComponent(order.customer_name)}%20ingin%20tanya%20progres%20pesanan%20${order.order_code}`}
                                        target="_blank"
                                        className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition shadow-xs"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        <span>Hubungi Gerai</span>
                                    </a>
                                </div>
                            </div>

                            {/* Operational Badges (Courier & Technician in charge) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0">
                                        <Truck className="w-4 h-4" />
                                    </div>
                                    <div className="text-[11px] leading-tight overflow-hidden">
                                        <span className="text-stone-400 block text-[10px] uppercase font-bold">Kurir Penjemput:</span>
                                        <span className="font-semibold text-slate-900 truncate block">
                                            {order.courier_name || 'Menunggu Penugasan'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                                        <Wrench className="w-4 h-4" />
                                    </div>
                                    <div className="text-[11px] leading-tight overflow-hidden">
                                        <span className="text-stone-400 block text-[10px] uppercase font-bold">Teknisi Perawatan:</span>
                                        <span className="font-semibold text-slate-900 truncate block">
                                            {order.technician_name || 'Tim Workshop Shoes and Care'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div className="text-[11px] leading-tight overflow-hidden">
                                        <span className="text-stone-400 block text-[10px] uppercase font-bold">Garansi Cuci:</span>
                                        <span className="font-semibold text-emerald-800 truncate block">
                                            {order.status === 'COMPLETED' ? 'Aktif (3 Hari Kerja)' : 'Siap Diaktivasi Saat Selesai'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 6-Stage Timeline Stepper */}
                            <div className="space-y-3 pt-2">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                                    Linimasa Alur Pengerjaan (SOP Standar 6 Tahapan):
                                </h3>

                                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                                    {stages.map((st, idx) => {
                                        const isPast = idx <= currentStageIndex;
                                        const isCurrent = idx === currentStageIndex;

                                        return (
                                            <div key={st.key} className="relative flex items-start gap-3">
                                                <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition ${
                                                    isCurrent
                                                        ? 'bg-amber-500 text-slate-950 border-amber-600 ring-4 ring-amber-100 animate-pulse'
                                                        : isPast
                                                            ? 'bg-emerald-500 text-white border-emerald-600'
                                                            : 'bg-white text-stone-400 border-stone-300'
                                                }`}>
                                                    {isPast ? '✓' : idx + 1}
                                                </div>

                                                <div className="space-y-0.5 text-xs">
                                                    <div className={`font-bold ${isCurrent ? 'text-amber-800 text-sm' : isPast ? 'text-slate-900' : 'text-stone-400'}`}>
                                                        {st.label}
                                                    </div>
                                                    <p className={`text-[11px] ${isPast ? 'text-slate-600' : 'text-stone-400'}`}>
                                                        {st.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Diagnosis Note by Workshop */}
                            {order.diagnosis_notes && (
                                <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl text-xs space-y-1">
                                    <span className="font-bold text-amber-950 block">Catatan Diagnosis Awal Workshop:</span>
                                    <p className="text-amber-900 italic leading-relaxed">
                                        "{order.diagnosis_notes}"
                                    </p>
                                </div>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100 text-xs">
                                <div className="space-y-2 bg-stone-50/60 p-4 rounded-2xl border border-stone-200/80">
                                    <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">Rincian Sepatu:</span>
                                    <div><strong>Jenis:</strong> {order.shoe_type}</div>
                                    <div><strong>Jumlah:</strong> {order.pair_count} pasang</div>
                                    <div><strong>Alamat Penjemputan:</strong> {order.pickup_address}</div>
                                    {order.notes && <div><strong>Catatan Anda:</strong> {order.notes}</div>}
                                </div>

                                <div className="space-y-2 bg-stone-50/60 p-4 rounded-2xl border border-stone-200/80">
                                    <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">Menu Perawatan Dipilih:</span>
                                    <div className="space-y-1">
                                        {order.items?.map((it) => (
                                            <div key={it.id} className="flex justify-between items-center text-[11px]">
                                                <span>• {it.treatment_name}</span>
                                                <span className="font-mono text-stone-600">{formatRupiah(it.price)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-2 border-t border-stone-200/80 flex justify-between font-bold text-slate-900">
                                        <span>Total Biaya:</span>
                                        <span className="text-amber-700 font-mono text-sm">{formatRupiah(order.total_price)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Side-by-Side Before & After Photo Gallery */}
                        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                                <div className="flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-amber-600" />
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-900">Dokumentasi Foto Garansi Sepatu</h3>
                                        <p className="text-[11px] text-slate-500">
                                            Bukti fisik kondisi sepatu sebelum dan sesudah perawatan oleh tim Shoes and Care
                                        </p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                                    Garansi 100%
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Before Photo */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-stone-700">
                                        <span>Kondisi Awal (Before):</span>
                                        <span className="text-[10px] text-stone-400 font-normal">Saat tiba di workshop</span>
                                    </div>
                                    <div className="h-56 rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center relative group">
                                        {order.before_photo_url ? (
                                            <img 
                                                src={order.before_photo_url} 
                                                alt="Kondisi Awal Sepatu" 
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                                            />
                                        ) : (
                                            <div className="text-center p-4 space-y-1 text-stone-400">
                                                <Camera className="w-6 h-6 mx-auto text-stone-300" />
                                                <span className="text-xs italic block">Foto kondisi awal sedang diambil teknisi</span>
                                                <span className="text-[10px] text-stone-300">Diambil pada tahap Workshop Intake</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* After Photo */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-stone-700">
                                        <span>Hasil Perawatan (After):</span>
                                        <span className="text-[10px] text-emerald-700 font-semibold">Lolos Inspeksi QC</span>
                                    </div>
                                    <div className="h-56 rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center relative group">
                                        {order.after_photo_url ? (
                                            <>
                                                <img 
                                                    src={order.after_photo_url} 
                                                    alt="Hasil Perawatan Sepatu" 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                                                />
                                                <div className="absolute top-2 right-2 bg-emerald-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    <span>QC PASSED</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-4 space-y-1 text-stone-400">
                                                <Sparkles className="w-6 h-6 mx-auto text-stone-300" />
                                                <span className="text-xs italic block">Foto hasil akhir akan muncul setelah QC selesai</span>
                                                <span className="text-[10px] text-stone-300">Diambil saat lolos inspeksi akhir</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active 3-Day Warranty Guarantee Card */}
                        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-stone-900 text-white rounded-3xl p-6 shadow-xs space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                        <h3 className="font-bold text-sm tracking-tight text-white">
                                            Jaminan Garansi Cuci Ulang 3 Hari
                                        </h3>
                                    </div>
                                    <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
                                        Shoes and Care memberikan garansi kepuasan 100%. Jika dalam 3 hari setelah sepatu diterima Anda merasa ada noda yang tertinggal atau berbau tidak sedap, kami akan mencucinya kembali tanpa biaya sepeser pun.
                                    </p>
                                </div>

                                {order.status === 'COMPLETED' ? (
                                    <div className="p-3 rounded-2xl bg-emerald-900/60 border border-emerald-500/40 text-center shrink-0">
                                        <span className="text-[10px] text-emerald-300 uppercase font-bold block">Status Garansi:</span>
                                        <span className="text-xs font-bold text-emerald-100">AKTIF 3 HARI</span>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700 text-center shrink-0">
                                        <span className="text-[10px] text-stone-400 uppercase font-bold block">Status Garansi:</span>
                                        <span className="text-xs font-semibold text-stone-300">Akan Aktif Saat Selesai</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* E-Receipt Modal for Customer */}
            {isReceiptModalOpen && order && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm print:p-0">
                    <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-xs flex flex-col print:shadow-none print:border-none print:w-full">
                        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50 print:hidden">
                            <span className="font-bold text-xs text-slate-700">E-Receipt Digital Sepatu</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="py-1 px-2.5 rounded-lg bg-stone-200 hover:bg-stone-300 font-semibold flex items-center gap-1 transition"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Cetak</span>
                                </button>
                                <button onClick={() => setIsReceiptModalOpen(false)} className="p-1 rounded-lg hover:bg-stone-200">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Printable Area */}
                        <div className="p-6 space-y-5 font-sans">
                            <div className="text-center space-y-1 pb-4 border-b border-dashed border-stone-300">
                                <div className="h-10 w-10 mx-auto rounded-xl bg-black flex items-center justify-center p-0.5">
                                    <img src="/images/logo.png" alt="Shoes and Care" className="w-full h-full object-contain" />
                                </div>
                                <h3 className="font-black text-base text-slate-900 tracking-tight">SHOES AND CARE</h3>
                                <p className="text-[11px] text-stone-500">{order.branch?.branch_name}</p>
                                <p className="text-[10px] text-stone-400">{order.branch?.full_address}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div>
                                    <span className="text-stone-400 block">No. Invoice:</span>
                                    <span className="font-mono font-bold text-slate-900">{order.order_code}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-stone-400 block">Tanggal:</span>
                                    <span>{new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                                </div>
                                <div>
                                    <span className="text-stone-400 block">Nama Pemilik:</span>
                                    <span className="font-semibold text-slate-900">{order.customer_name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-stone-400 block">Layanan:</span>
                                    <span>{order.service_type === 'SAC_GO' ? 'SAC GO Antar-Jemput' : 'Walk-In Gerai'}</span>
                                </div>
                            </div>

                            <div className="border-t border-b border-dashed border-stone-300 py-3 space-y-2">
                                <div className="flex justify-between font-bold text-slate-900">
                                    <span>{order.shoe_type} ({order.pair_count} pasang)</span>
                                </div>
                                {order.items?.map((it) => (
                                    <div key={it.id} className="flex justify-between text-[11px] text-stone-600 pl-2">
                                        <span>• {it.treatment_name}</span>
                                        <span className="font-mono">{formatRupiah(it.price)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between font-bold text-slate-900 text-sm">
                                    <span>TOTAL:</span>
                                    <span className="font-mono text-amber-700">{formatRupiah(order.total_price)}</span>
                                </div>
                                <div className="flex justify-between text-[11px] text-stone-500">
                                    <span>Status Pembayaran:</span>
                                    <span className="font-bold text-emerald-700">{order.payment_status || 'UNPAID'} ({order.payment_method || 'QRIS'})</span>
                                </div>
                            </div>

                            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-1">
                                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-800">
                                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>GARANSI CUCI ULANG 3 HARI KERJA RESMI</span>
                                </div>
                                <p className="text-[10px] text-stone-500 leading-relaxed">
                                    Simpan bukti digital ini sebagai tanda klaim jika hasil cuci belum memuaskan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
