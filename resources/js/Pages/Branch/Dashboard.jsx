import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    Building2, 
    Users, 
    Truck, 
    Sparkles, 
    LogOut, 
    Map, 
    Plus, 
    Clock, 
    CheckCircle2, 
    Phone, 
    MessageCircle, 
    Camera, 
    Trash2, 
    AlertCircle, 
    ChevronRight,
    X,
    Shield,
    UserPlus,
    LayoutGrid,
    List,
    Receipt,
    Printer,
    CheckSquare,
    UserCheck,
    Wrench,
    ArrowRight,
    DollarSign,
    Calendar
} from 'lucide-react';

export default function BranchDashboard({
    branch,
    orders = [],
    staffMembers = [],
    stats = {},
    userRole = 'branch_staff',
    canManageStaff = false,
    filters = {}
}) {
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'staff' | 'treatments' | 'hours'
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');

    // Form: Edit Jam Buka Operasional Gerai oleh Kepala Cabang
    const initialDailyHours = branch.operating_hours_daily ? { ...branch.operating_hours_daily } : {};
    ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].forEach(d => {
        if (!initialDailyHours[d]) {
            if (d === 'Sabtu' || d === 'Minggu') {
                initialDailyHours[d] = branch.is_open_weekend ? `${branch.weekend_open_hour || '10:00'} - ${branch.weekend_close_hour || '20:00'}` : 'Tutup';
            } else {
                initialDailyHours[d] = `${branch.open_hour || '09:00'} - ${branch.close_hour || '21:00'}`;
            }
        }
    });

    const hoursForm = useForm({
        open_hour: branch.open_hour || '09:00',
        close_hour: branch.close_hour || '18:00',
        weekend_open_hour: branch.weekend_open_hour || '10:00',
        weekend_close_hour: branch.weekend_close_hour || '17:00',
        is_open_weekend: branch.is_open_weekend ?? true,
        operating_hours_daily: initialDailyHours,
    });

    const handleUpdateOperatingHours = (e) => {
        e.preventDefault();
        hoursForm.put('/branch/operating-hours', {
            preserveScroll: true,
        });
    };
    
    // Action Modals State
    const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
    const [isAddSpecialModalOpen, setIsAddSpecialModalOpen] = useState(false);
    
    // Workflow Transition Modals
    const [assignCourierModalOrder, setAssignCourierModalOrder] = useState(null);
    const [intakeDiagnosisModalOrder, setIntakeDiagnosisModalOrder] = useState(null);
    const [startTreatmentModalOrder, setStartTreatmentModalOrder] = useState(null);
    const [qcPackingModalOrder, setQcPackingModalOrder] = useState(null);
    const [completeOrderModalOrder, setCompleteOrderModalOrder] = useState(null);
    const [receiptModalOrder, setReceiptModalOrder] = useState(null);

    // Form: Tambah Staf oleh Kepala Cabang
    const staffForm = useForm({
        name: '',
        email: '',
        password: '',
        phone: '',
    });

    // Form: Tambah Treatment Khusus
    const treatmentForm = useForm({
        name: '',
        category: 'Custom & Repair',
        description: '',
        price: '',
        est_duration: '2 - 3 Hari',
        badge_label: '',
    });

    // Forms: Workflow Transition Forms
    const courierForm = useForm({
        courier_name: '',
    });

    const diagnosisForm = useForm({
        diagnosis_notes: '',
        before_photo_url: '',
    });

    const treatmentStartForm = useForm({
        technician_name: '',
    });

    const qcForm = useForm({
        after_photo_url: '',
    });

    const completeForm = useForm({
        payment_method: 'QRIS',
        payment_status: 'PAID',
    });

    const handleToggleSacGo = () => {
        router.post('/branch/toggle-sac-go', {}, { preserveScroll: true });
    };

    // Quick direct status transition
    const handleQuickStatusChange = (orderId, newStatus) => {
        router.post(`/branch/orders/${orderId}/status`, { status: newStatus }, { preserveScroll: true });
    };

    // Transition 1: Assign Courier -> OUT_FOR_PICKUP
    const handleAssignCourier = (e) => {
        e.preventDefault();
        if (!assignCourierModalOrder) return;
        router.post(`/branch/orders/${assignCourierModalOrder.id}/status`, {
            status: 'OUT_FOR_PICKUP',
            courier_name: courierForm.data.courier_name || 'Kurir SAC GO Cabang',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                courierForm.reset();
                setAssignCourierModalOrder(null);
            }
        });
    };

    // Transition 2: Workshop Intake & Diagnosis -> INTAKE_VERIFIED
    const handleIntakeDiagnosis = (e) => {
        e.preventDefault();
        if (!intakeDiagnosisModalOrder) return;
        router.post(`/branch/orders/${intakeDiagnosisModalOrder.id}/status`, {
            status: 'INTAKE_VERIFIED',
            diagnosis_notes: diagnosisForm.data.diagnosis_notes,
            before_photo_url: diagnosisForm.data.before_photo_url,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                diagnosisForm.reset();
                setIntakeDiagnosisModalOrder(null);
            }
        });
    };

    // Transition 3: Start Treatment -> IN_PROGRESS
    const handleStartTreatment = (e) => {
        e.preventDefault();
        if (!startTreatmentModalOrder) return;
        router.post(`/branch/orders/${startTreatmentModalOrder.id}/status`, {
            status: 'IN_PROGRESS',
            technician_name: treatmentStartForm.data.technician_name || 'Teknisi Workshop',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                treatmentStartForm.reset();
                setStartTreatmentModalOrder(null);
            }
        });
    };

    // Transition 4: QC & Packaging -> READY
    const handleQcPacking = (e) => {
        e.preventDefault();
        if (!qcPackingModalOrder) return;
        router.post(`/branch/orders/${qcPackingModalOrder.id}/status`, {
            status: qcPackingModalOrder.service_type === 'SAC_GO' ? 'READY_FOR_DELIVERY' : 'READY_FOR_PICKUP',
            after_photo_url: qcForm.data.after_photo_url,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                qcForm.reset();
                setQcPackingModalOrder(null);
            }
        });
    };

    // Transition 5: Selesaikan Pesanan & Settlement -> COMPLETED
    const handleCompleteOrder = (e) => {
        e.preventDefault();
        if (!completeOrderModalOrder) return;
        router.post(`/branch/orders/${completeOrderModalOrder.id}/status`, {
            status: 'COMPLETED',
            payment_status: 'PAID',
            payment_method: completeForm.data.payment_method,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                completeForm.reset();
                setCompleteOrderModalOrder(null);
            }
        });
    };

    const handleCreateStaff = (e) => {
        e.preventDefault();
        staffForm.post('/branch/staff', {
            preserveScroll: true,
            onSuccess: () => {
                staffForm.reset();
                setIsAddStaffModalOpen(false);
            },
        });
    };

    const handleDeleteStaff = (staff) => {
        if (confirm(`Yakin ingin menonaktifkan staf '${staff.name}'?`)) {
            router.delete(`/branch/staff/${staff.id}`, { preserveScroll: true });
        }
    };

    const handleCreateSpecialTreatment = (e) => {
        e.preventDefault();
        treatmentForm.post('/branch/special-treatments', {
            preserveScroll: true,
            onSuccess: () => {
                treatmentForm.reset();
                setIsAddSpecialModalOpen(false);
            },
        });
    };

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
    };

    // Categorized Orders for Kanban Board
    const kanbanColumns = useMemo(() => {
        return [
            {
                id: 'inbound',
                title: '1. Pesanan Masuk',
                subtitle: 'Menunggu konfirmasi / jadwal',
                badgeColor: 'bg-blue-50 text-blue-900 border-blue-200',
                orders: orders.filter(o => ['BOOKED', 'PENDING_CONFIRMATION'].includes(o.status)),
            },
            {
                id: 'pickup',
                title: '2. Penjemputan SAC GO',
                subtitle: 'Kurir menuju lokasi / balik',
                badgeColor: 'bg-cyan-50 text-cyan-900 border-cyan-200',
                orders: orders.filter(o => ['OUT_FOR_PICKUP', 'PICKED_UP'].includes(o.status)),
            },
            {
                id: 'workshop',
                title: '3. Treatment Workshop',
                subtitle: 'Intake diagnosis & cuci',
                badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
                orders: orders.filter(o => ['INTAKE_VERIFIED', 'IN_PROGRESS'].includes(o.status)),
            },
            {
                id: 'qc_ready',
                title: '4. QC & Siap Keluar',
                subtitle: 'Lolos inspeksi & packaging',
                badgeColor: 'bg-purple-50 text-purple-900 border-purple-200',
                orders: orders.filter(o => ['READY', 'READY_FOR_DELIVERY', 'READY_FOR_PICKUP'].includes(o.status)),
            },
            {
                id: 'completed',
                title: '5. Selesai & Bergaransi',
                subtitle: 'Lunas & Garansi 3 Hari',
                badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-300',
                orders: orders.filter(o => o.status === 'COMPLETED'),
            },
        ];
    }, [orders]);

    const generateCustomerWaLink = (order) => {
        const statusNotes = {
            BOOKED: 'Pesanan Anda telah kami terima dan terdaftar di antrean workshop Shoes and Care.',
            PENDING_CONFIRMATION: 'Pesanan Anda sedang kami jadwalkan untuk penjemputan oleh kurir SAC GO.',
            OUT_FOR_PICKUP: `Kurir kami (${order.courier_name || 'SAC GO'}) sedang dalam perjalanan menuju lokasi Anda.`,
            PICKED_UP: 'Sepatu Anda telah berhasil dijemput oleh kurir resmi dan sedang dibawa ke workshop.',
            INTAKE_VERIFIED: 'Sepatu telah tiba di workshop cabang kami dan selesai dilakukan diagnosis bahan.',
            IN_PROGRESS: `Sepatu sedang ditangani teliti oleh teknisi kami (${order.technician_name || 'Tim Shoes and Care'}).`,
            READY: 'Sepatu Anda telah selesai dirawat, lolos Quality Control, dan siap diserahkan!',
            READY_FOR_DELIVERY: 'Sepatu Anda lolos QC dan siap dikirimkan kembali oleh kurir SAC GO ke alamat Anda.',
            READY_FOR_PICKUP: 'Sepatu Anda siap diambil di meja kasir gerai kami. Ditunggu kedatangannya!',
            COMPLETED: 'Terima kasih telah mempercayakan perawatan sepatu Anda di Shoes and Care! Garansi cuci aktif selama 3 hari kerja.',
        };

        const note = statusNotes[order.status] || 'Status pesanan Anda telah diperbarui.';
        const text = `Halo Kak ${order.customer_name},\n\nUpdate dari *Shoes and Care ${branch.branch_name}* untuk pesanan *${order.order_code}*:\n\n*Status:* [${order.status}]\n${note}\n\nAnda dapat mengecek linimasa & foto garansi di:\nhttp://127.0.0.1:8000/track?code=${order.order_code}\n\nTerima kasih!`;

        let phone = (order.customer_phone || '').replace(/\D/g, '');
        if (phone.startsWith('0')) phone = '62' + phone.slice(1);
        return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    };

    return (
        <div className="min-h-screen bg-[#fcfbf9] text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
            <Head title={`Portal Gerai ${branch.branch_name} - Shoes and Care GIS`} />

            {/* Top Navigation */}
            <header className="bg-white/95 backdrop-blur-md border-b border-stone-200/90 sticky top-0 z-30 px-4 lg:px-8 py-3 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-black border border-stone-200 flex items-center justify-center p-0.5 shrink-0">
                            <img src="/images/logo.png" alt="Shoes and Care" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-bold text-base tracking-tight text-slate-900 truncate">
                                    {branch.branch_name}
                                </h1>
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                                    userRole === 'branch_manager'
                                        ? 'bg-blue-50 text-blue-900 border-blue-300'
                                        : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                }`}>
                                    {userRole === 'branch_manager' ? 'Kepala Cabang' : 'Staf Gerai'}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                                {branch.district?.name} &bull; Jam Operasional: {branch.open_hour} - {branch.close_hour} WIB
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-slate-700 border border-stone-200/90 shadow-2xs transition"
                        >
                            <Map className="w-3.5 h-3.5 text-amber-600" />
                            <span className="hidden sm:inline">Lihat di Peta GIS</span>
                        </Link>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-red-50 hover:text-red-700 text-slate-600 border border-stone-200/80 transition cursor-pointer"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Keluar</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Container */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
                {/* SAC GO Instant Control Banner */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                            stats.is_pickup_available
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-stone-100 text-stone-400 border-stone-200'
                        }`}>
                            <Truck className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-sm text-slate-900">
                                    Fitur Layanan SAC GO (Antar-Jemput Cabang)
                                </h2>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    stats.is_pickup_available
                                        ? 'bg-emerald-100/70 text-emerald-900 border-emerald-300'
                                        : 'bg-stone-100 text-stone-600 border-stone-300'
                                }`}>
                                    {stats.is_pickup_available ? 'READY / AKTIF' : 'NONAKTIF SEMENTARA'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                {stats.is_pickup_available
                                    ? 'Konsumen dapat memesan antar-jemput gratis di area Anda. Klik tombol di kanan jika kurir sedang penuh/hujan.'
                                    : 'Layanan jemput sementara dinonaktifkan. Konsumen hanya diarahkan datang langsung ke gerai (Walk-In).'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleToggleSacGo}
                        className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer self-stretch sm:self-auto justify-center ${
                            stats.is_pickup_available
                                ? 'bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-300'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold'
                        }`}
                    >
                        <span>{stats.is_pickup_available ? 'Matikan SAC GO Sementara' : 'Aktifkan SAC GO Sekarang'}</span>
                    </button>
                </div>

                {/* Branch KPI Counters */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-xs space-y-1">
                        <span className="text-[10px] font-semibold uppercase text-stone-500">Pesanan Masuk</span>
                        <div className="text-xl font-bold text-blue-700 font-mono">{stats.orders_booked || 0}</div>
                        <span className="text-[10px] text-stone-400">Menunggu Respon</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-xs space-y-1">
                        <span className="text-[10px] font-semibold uppercase text-stone-500">Penjemputan</span>
                        <div className="text-xl font-bold text-cyan-700 font-mono">{stats.orders_pickup || 0}</div>
                        <span className="text-[10px] text-stone-400">Kurir OTW / Diambil</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-xs space-y-1">
                        <span className="text-[10px] font-semibold uppercase text-stone-500">Workshop Treatment</span>
                        <div className="text-xl font-bold text-amber-700 font-mono">{stats.orders_in_progress || 0}</div>
                        <span className="text-[10px] text-stone-400">Sedang Dicuci/Repair</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-xs space-y-1">
                        <span className="text-[10px] font-semibold uppercase text-stone-500">QC & Siap Antar</span>
                        <div className="text-xl font-bold text-purple-700 font-mono">{stats.orders_ready || 0}</div>
                        <span className="text-[10px] text-stone-400">Selesai QC & Packing</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-xs space-y-1 col-span-2 md:col-span-1">
                        <span className="text-[10px] font-semibold uppercase text-stone-500">Selesai & Bergaransi</span>
                        <div className="text-xl font-bold text-emerald-700 font-mono">{stats.orders_completed || 0}</div>
                        <span className="text-[10px] text-stone-400">Lunas & Garansi 3 Hari</span>
                    </div>
                </div>

                {/* Tabs Segment Control & Kanban/List Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/90 pb-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-medium">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                                activeTab === 'orders'
                                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                                    : 'bg-white hover:bg-stone-50 text-slate-600 border border-stone-200/80'
                            }`}
                        >
                            <Truck className="w-4 h-4" />
                            <span>Siklus Pesanan Sepatu ({orders.length})</span>
                        </button>

                        {/* Tab Manajemen Staf: HANYA untuk Kepala Cabang atau Super Admin */}
                        {canManageStaff && (
                            <button
                                onClick={() => setActiveTab('staff')}
                                className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                                    activeTab === 'staff'
                                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                                        : 'bg-white hover:bg-stone-50 text-slate-600 border border-stone-200/80'
                                }`}
                            >
                                <Users className="w-4 h-4" />
                                <span>Manajemen Staf ({staffMembers.length})</span>
                            </button>
                        )}

                        <button
                            onClick={() => setActiveTab('treatments')}
                            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                                activeTab === 'treatments'
                                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                                    : 'bg-white hover:bg-stone-50 text-slate-600 border border-stone-200/80'
                            }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Menu Treatment Gerai</span>
                        </button>

                        {/* Tab Edit Jam Buka: HANYA untuk Kepala Cabang atau Super Admin */}
                        {canManageStaff && (
                            <button
                                onClick={() => setActiveTab('hours')}
                                className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                                    activeTab === 'hours'
                                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                                        : 'bg-white hover:bg-stone-50 text-slate-600 border border-stone-200/80'
                                }`}
                            >
                                <Clock className="w-4 h-4" />
                                <span>Jam Buka Gerai</span>
                            </button>
                        )}
                    </div>

                    {activeTab === 'orders' && (
                        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200/80 self-start sm:self-auto">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                    viewMode === 'kanban'
                                        ? 'bg-white text-slate-900 shadow-2xs'
                                        : 'text-stone-500 hover:text-slate-800'
                                }`}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>Kanban SOP</span>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                    viewMode === 'list'
                                        ? 'bg-white text-slate-900 shadow-2xs'
                                        : 'text-stone-500 hover:text-slate-800'
                                }`}
                            >
                                <List className="w-3.5 h-3.5" />
                                <span>Daftar Tabel</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* TAB 1: SIKLUS PESANAN SEPATU */}
                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        {/* SOP Explanation Header Banner */}
                        <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
                                        STANDAR OPERASIONAL PROSEDUR
                                    </span>
                                    <h3 className="font-bold text-sm tracking-tight text-white">
                                        Pipeline Pengerjaan Sepatu (6 Tahapan)
                                    </h3>
                                </div>
                                <p className="text-xs text-stone-300 max-w-2xl">
                                    Inbound Booking &rarr; Penjemputan Kurir &rarr; Intake & Diagnosis Workshop (Foto Before) &rarr; Cuci/Treatment Teknisi &rarr; QC & Packaging (Foto After) &rarr; Outbound, Pembayaran & Garansi 3 Hari.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-stone-400 font-mono">
                                    {orders.length} Total Pesanan Terdaftar
                                </span>
                            </div>
                        </div>

                        {/* KANBAN BOARD VIEW */}
                        {viewMode === 'kanban' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start">
                                {kanbanColumns.map((col) => (
                                    <div key={col.id} className="bg-stone-100/70 rounded-3xl p-3 border border-stone-200/90 space-y-3 min-h-[480px] flex flex-col">
                                        {/* Column Header */}
                                        <div className="p-2 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-0.5">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-xs text-slate-900">{col.title}</h4>
                                                <span className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded-full border ${col.badgeColor}`}>
                                                    {col.orders.length}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-stone-400 truncate">{col.subtitle}</p>
                                        </div>

                                        {/* Column Cards */}
                                        <div className="space-y-2.5 flex-1">
                                            {col.orders.length === 0 ? (
                                                <div className="text-center py-10 text-stone-400 text-[11px] italic">
                                                    Tidak ada antrean
                                                </div>
                                            ) : (
                                                col.orders.map((ord) => (
                                                    <div 
                                                        key={ord.id} 
                                                        className="bg-white rounded-2xl p-3 border border-stone-200/90 shadow-2xs hover:shadow-xs transition space-y-2.5 text-xs text-slate-700"
                                                    >
                                                        {/* Header Card */}
                                                        <div className="flex items-start justify-between gap-1 pb-1.5 border-b border-stone-100">
                                                            <div>
                                                                <span className="font-mono font-bold text-slate-900 text-[11px] block">
                                                                    {ord.order_code}
                                                                </span>
                                                                <span className="text-[10px] text-stone-400">
                                                                    {new Date(ord.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                                </span>
                                                            </div>
                                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                                                                ord.service_type === 'SAC_GO'
                                                                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                                                                    : 'bg-stone-50 text-stone-700 border-stone-200'
                                                            }`}>
                                                                {ord.service_type}
                                                            </span>
                                                        </div>

                                                        {/* Customer & Shoe Detail */}
                                                        <div className="space-y-1">
                                                            <div className="font-semibold text-slate-900 text-xs truncate">
                                                                {ord.customer_name}
                                                            </div>
                                                            <div className="text-[11px] text-stone-500 font-mono">
                                                                {ord.customer_phone}
                                                            </div>
                                                            <div className="text-[11px] text-slate-600 line-clamp-1">
                                                                {ord.shoe_type} ({ord.pair_count} pasang)
                                                            </div>
                                                            <div className="text-[11px] font-bold text-amber-700 font-mono">
                                                                {formatRupiah(ord.total_price)}
                                                            </div>
                                                        </div>

                                                        {/* Logistics / Technician Info Badge */}
                                                        {ord.courier_name && (
                                                            <div className="p-1.5 rounded-lg bg-cyan-50/80 border border-cyan-200 text-[10px] text-cyan-900 flex items-center gap-1">
                                                                <Truck className="w-3 h-3 shrink-0" />
                                                                <span className="truncate">Kurir: <strong>{ord.courier_name}</strong></span>
                                                            </div>
                                                        )}

                                                        {ord.technician_name && (
                                                            <div className="p-1.5 rounded-lg bg-amber-50/80 border border-amber-200 text-[10px] text-amber-900 flex items-center gap-1">
                                                                <Wrench className="w-3 h-3 shrink-0" />
                                                                <span className="truncate">Teknisi: <strong>{ord.technician_name}</strong></span>
                                                            </div>
                                                        )}

                                                        {/* Photo status indicator */}
                                                        <div className="flex items-center gap-2 pt-1 text-[10px] text-stone-500">
                                                            <span className={ord.before_photo_url ? 'text-emerald-700 font-bold' : 'text-stone-400'}>
                                                                {ord.before_photo_url ? '✓ Before' : '○ No Before'}
                                                            </span>
                                                            &bull;
                                                            <span className={ord.after_photo_url ? 'text-emerald-700 font-bold' : 'text-stone-400'}>
                                                                {ord.after_photo_url ? '✓ After' : '○ No After'}
                                                            </span>
                                                        </div>

                                                        {/* Action Buttons Depending on Current Column */}
                                                        <div className="pt-2 border-t border-stone-100 flex flex-col gap-1.5">
                                                            {/* Column 1: Inbound Actions */}
                                                            {col.id === 'inbound' && (
                                                                <>
                                                                    {ord.service_type === 'SAC_GO' ? (
                                                                        <button
                                                                            onClick={() => {
                                                                                setAssignCourierModalOrder(ord);
                                                                                courierForm.setData('courier_name', ord.courier_name || '');
                                                                            }}
                                                                            className="w-full py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                                                                        >
                                                                            <Truck className="w-3 h-3" />
                                                                            <span>Tugaskan Kurir Jemput</span>
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => {
                                                                                setIntakeDiagnosisModalOrder(ord);
                                                                                diagnosisForm.setData({
                                                                                    diagnosis_notes: ord.diagnosis_notes || '',
                                                                                    before_photo_url: ord.before_photo_url || '',
                                                                                });
                                                                            }}
                                                                            className="w-full py-1.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                                                                        >
                                                                            <CheckSquare className="w-3 h-3" />
                                                                            <span>Intake Walk-In & Diagnosis</span>
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}

                                                            {/* Column 2: Pickup Actions */}
                                                            {col.id === 'pickup' && (
                                                                <>
                                                                    {ord.status === 'OUT_FOR_PICKUP' && (
                                                                        <button
                                                                            onClick={() => handleQuickStatusChange(ord.id, 'PICKED_UP')}
                                                                            className="w-full py-1.5 px-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                                                                        >
                                                                            <span>✓ Sepatu Diambil Kurir</span>
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => {
                                                                            setIntakeDiagnosisModalOrder(ord);
                                                                            diagnosisForm.setData({
                                                                                diagnosis_notes: ord.diagnosis_notes || '',
                                                                                before_photo_url: ord.before_photo_url || '',
                                                                            });
                                                                        }}
                                                                        className="w-full py-1.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                                                                    >
                                                                        <Camera className="w-3 h-3" />
                                                                        <span>Tiba di Workshop & Foto Before</span>
                                                                    </button>
                                                                </>
                                                            )}

                                                            {/* Column 3: Workshop Treatment Actions */}
                                                            {col.id === 'workshop' && (
                                                                <>
                                                                    {ord.status === 'INTAKE_VERIFIED' && (
                                                                        <button
                                                                            onClick={() => {
                                                                                setStartTreatmentModalOrder(ord);
                                                                                treatmentStartForm.setData('technician_name', ord.technician_name || '');
                                                                            }}
                                                                            className="w-full py-1.5 px-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                                                                        >
                                                                            <Wrench className="w-3 h-3" />
                                                                            <span>Mulai Cuci (Pilih Teknisi)</span>
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => {
                                                                            setQcPackingModalOrder(ord);
                                                                            qcForm.setData('after_photo_url', ord.after_photo_url || '');
                                                                        }}
                                                                        className="w-full py-1.5 px-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                                                                    >
                                                                        <Sparkles className="w-3 h-3" />
                                                                        <span>Lolos QC & Foto After</span>
                                                                    </button>
                                                                </>
                                                            )}

                                                            {/* Column 4: QC & Ready Actions */}
                                                            {col.id === 'qc_ready' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            setCompleteOrderModalOrder(ord);
                                                                            completeForm.setData({
                                                                                payment_method: ord.payment_method || 'QRIS',
                                                                                payment_status: 'PAID',
                                                                            });
                                                                        }}
                                                                        className="w-full py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                                                                    >
                                                                        <DollarSign className="w-3 h-3" />
                                                                        <span>Serahkan & Selesaikan (Lunas)</span>
                                                                    </button>

                                                                    <button
                                                                        onClick={() => setReceiptModalOrder(ord)}
                                                                        className="w-full py-1 px-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 text-[10px] font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                                                                    >
                                                                        <Receipt className="w-3 h-3" />
                                                                        <span>Lihat E-Receipt</span>
                                                                    </button>
                                                                </>
                                                            )}

                                                            {/* Column 5: Completed Actions */}
                                                            {col.id === 'completed' && (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center justify-between text-[10px] text-emerald-800 font-semibold bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                                                                        <span>Garansi 3 Hari Aktif</span>
                                                                        <Shield className="w-3 h-3 text-emerald-600" />
                                                                    </div>
                                                                    <button
                                                                        onClick={() => setReceiptModalOrder(ord)}
                                                                        className="w-full py-1 px-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 text-[10px] font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                                                                    >
                                                                        <Receipt className="w-3 h-3" />
                                                                        <span>Cetak Nota & Garansi</span>
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {/* WhatsApp Notification Button */}
                                                            <a
                                                                href={generateCustomerWaLink(ord)}
                                                                target="_blank"
                                                                className="w-full py-1 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-semibold transition flex items-center justify-center gap-1"
                                                            >
                                                                <MessageCircle className="w-3 h-3 text-emerald-600" />
                                                                <span>Kirim WA Konsumen</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* TABLE LIST VIEW */}
                        {viewMode === 'list' && (
                            <div className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-xs space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs text-slate-700">
                                        <thead className="bg-stone-50 border-b border-stone-200/90 text-stone-500 uppercase text-[10px] font-bold">
                                            <tr>
                                                <th className="py-3 px-4">Invoice & Tanggal</th>
                                                <th className="py-3 px-4">Konsumen</th>
                                                <th className="py-3 px-4">Sepatu & Menu</th>
                                                <th className="py-3 px-4">Status & Petugas</th>
                                                <th className="py-3 px-4">Biaya & Bayar</th>
                                                <th className="py-3 px-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-100">
                                            {orders.map((ord) => (
                                                <tr key={ord.id} className="hover:bg-stone-50/60 transition">
                                                    <td className="py-3 px-4">
                                                        <span className="font-mono font-bold text-slate-900 block">{ord.order_code}</span>
                                                        <span className="text-[10px] text-stone-400">
                                                            {new Date(ord.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="font-semibold text-slate-900">{ord.customer_name}</div>
                                                        <div className="text-[11px] font-mono text-stone-500">{ord.customer_phone}</div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div>{ord.shoe_type} ({ord.pair_count} pasang)</div>
                                                        <div className="text-[10px] text-stone-400 truncate max-w-xs">{ord.pickup_address}</div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${
                                                            ord.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' :
                                                            ['READY', 'READY_FOR_DELIVERY', 'READY_FOR_PICKUP'].includes(ord.status) ? 'bg-purple-50 text-purple-900 border-purple-300' :
                                                            ['INTAKE_VERIFIED', 'IN_PROGRESS'].includes(ord.status) ? 'bg-amber-50 text-amber-900 border-amber-300' :
                                                            'bg-blue-50 text-blue-900 border-blue-200'
                                                        }`}>
                                                            {ord.status}
                                                        </span>
                                                        {ord.technician_name && (
                                                            <div className="text-[10px] text-stone-500 mt-0.5">Teknisi: {ord.technician_name}</div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="font-mono font-bold text-amber-700">{formatRupiah(ord.total_price)}</div>
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                                                            ord.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                                                        }`}>
                                                            {ord.payment_status || 'UNPAID'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right space-x-1">
                                                        <button
                                                            onClick={() => setReceiptModalOrder(ord)}
                                                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 transition"
                                                            title="Lihat E-Receipt"
                                                        >
                                                            <Receipt className="w-3.5 h-3.5" />
                                                        </button>
                                                        <a
                                                            href={generateCustomerWaLink(ord)}
                                                            target="_blank"
                                                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 inline-block transition"
                                                            title="Kirim WA Konsumen"
                                                        >
                                                            <MessageCircle className="w-3.5 h-3.5" />
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: MANAJEMEN STAF (KHUSUS KEPALA CABANG) */}
                {activeTab === 'staff' && canManageStaff && (
                    <div className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">Manajemen Staf Gerai {branch.branch_name}</h3>
                                <p className="text-xs text-slate-500">
                                    Sebagai Kepala Cabang, Anda dapat membuat akun login untuk teknisi cuci, kasir, dan kurir SAC GO
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAddStaffModalOpen(true)}
                                className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Buat Akun Staf Baru</span>
                            </button>
                        </div>

                        {staffMembers.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 text-xs">
                                Belum ada staf yang didaftarkan oleh Kepala Cabang. Klik tombol di atas untuk membuat akun staf baru.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {staffMembers.map((st) => (
                                    <div key={st.id} className="p-4 rounded-2xl border border-stone-200/90 bg-stone-50/40 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                                Staf Cabang
                                            </span>
                                            <button
                                                onClick={() => handleDeleteStaff(st)}
                                                className="p-1 text-slate-400 hover:text-red-600 transition"
                                                title="Hapus Akun Staf"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-sm text-slate-900">{st.name}</h4>
                                        <div className="text-[11px] font-mono text-stone-500">Email: {st.email}</div>
                                        {st.phone && <div className="text-[11px] font-mono text-stone-500">Telp: {st.phone}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: MENU TREATMENT CABANG */}
                {activeTab === 'treatments' && (
                    <div className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">Daftar Layanan di Gerai {branch.branch_name}</h3>
                                <p className="text-xs text-slate-500">
                                    Termasuk 6 master treatment standar Shoes and Care serta menu spesialisasi lokal
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAddSpecialModalOpen(true)}
                                className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Tambah Menu Khusus Gerai</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {branch.treatments?.map((t) => (
                                <div key={t.id} className="p-4 rounded-2xl border border-stone-200/90 bg-stone-50/40 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                                            t.treatment_type === 'KHUSUS'
                                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                                : 'bg-stone-100 text-stone-600 border-stone-200'
                                        }`}>
                                            {t.treatment_type === 'KHUSUS' ? 'Khusus Gerai' : 'Standar SAC'}
                                        </span>
                                        <span className="text-xs font-bold text-amber-700 font-mono">
                                            {t.price > 0 ? formatRupiah(t.price) : 'GRATIS'}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-900">{t.name}</h4>
                                    <p className="text-[11px] text-slate-600 leading-relaxed">{t.description}</p>
                                    <div className="text-[10px] text-stone-400 font-mono pt-1 border-t border-stone-200/60">
                                        Durasi: {t.est_duration}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 4: EDIT JAM BUKA OPERASIONAL GERAI (KHUSUS KEPALA CABANG) */}
                {activeTab === 'hours' && canManageStaff && (
                    <div className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-base text-slate-900">
                                            Pengaturan Jam Operasional Gerai
                                        </h3>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                                            Wewenang Kepala Cabang
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Kelola jam buka resmi {branch.branch_name}. Perubahan jadwal operasional akan langsung terhubung ke Peta GIS Konsumen dan Google Maps.
                                    </p>
                                </div>
                            </div>

                            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Sinkron Real-Time ke Web GIS
                            </span>
                        </div>

                        <form onSubmit={handleUpdateOperatingHours} className="space-y-6 text-xs">
                            {/* Card 1: Pengaturan Cepat Weekday & Weekend */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/80 border border-stone-200/90 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-amber-600" />
                                        1. Pengaturan Jam Buka (Hari Kerja & Akhir Pekan)
                                    </span>
                                    <span className="text-[10px] text-stone-500 font-mono">Format: HH:mm WIB</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Sesi Weekday */}
                                    <div className="bg-white p-4 rounded-xl border border-stone-200/80 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-800 text-[11px]">
                                                Hari Kerja (Senin - Jumat)
                                            </span>
                                            <span className="text-[10px] font-mono text-stone-400 bg-stone-50 px-2 py-0.5 rounded">
                                                Weekday
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-medium text-stone-500 block mb-1">Jam Buka</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={hoursForm.data.open_hour}
                                                    onChange={(e) => hoursForm.setData('open_hour', e.target.value)}
                                                    placeholder="09:00"
                                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-mono text-center text-xs font-semibold text-slate-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-medium text-stone-500 block mb-1">Jam Tutup</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={hoursForm.data.close_hour}
                                                    onChange={(e) => hoursForm.setData('close_hour', e.target.value)}
                                                    placeholder="18:00"
                                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-mono text-center text-xs font-semibold text-slate-900"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sesi Weekend */}
                                    <div className="bg-white p-4 rounded-xl border border-stone-200/80 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-800 text-[11px]">
                                                Akhir Pekan (Sabtu & Minggu)
                                            </span>
                                            <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                                                <input
                                                    type="checkbox"
                                                    checked={hoursForm.data.is_open_weekend}
                                                    onChange={(e) => hoursForm.setData('is_open_weekend', e.target.checked)}
                                                    className="rounded text-amber-500"
                                                />
                                                <span className={hoursForm.data.is_open_weekend ? 'font-bold text-emerald-700' : 'text-rose-600'}>
                                                    {hoursForm.data.is_open_weekend ? 'Buka di Weekend' : 'Libur di Weekend'}
                                                </span>
                                            </label>
                                        </div>

                                        {hoursForm.data.is_open_weekend ? (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] font-medium text-stone-500 block mb-1">Jam Buka Weekend</label>
                                                    <input
                                                        type="text"
                                                        value={hoursForm.data.weekend_open_hour}
                                                        onChange={(e) => hoursForm.setData('weekend_open_hour', e.target.value)}
                                                        placeholder="09:00"
                                                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-mono text-center text-xs font-semibold text-slate-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-medium text-stone-500 block mb-1">Jam Tutup Weekend</label>
                                                    <input
                                                        type="text"
                                                        value={hoursForm.data.weekend_close_hour}
                                                        onChange={(e) => hoursForm.setData('weekend_close_hour', e.target.value)}
                                                        placeholder="18:00"
                                                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-mono text-center text-xs font-semibold text-slate-900"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] text-center font-medium">
                                                Gerai ditandai libur / tutup pada akhir pekan (Sabtu & Minggu)
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updated = { ...(hoursForm.data.operating_hours_daily || {}) };
                                            ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].forEach((d) => {
                                                updated[d] = `${hoursForm.data.open_hour || '09:00'} - ${hoursForm.data.close_hour || '18:00'}`;
                                            });
                                            ['Sabtu', 'Minggu'].forEach((d) => {
                                                updated[d] = hoursForm.data.is_open_weekend
                                                    ? `${hoursForm.data.weekend_open_hour || '09:00'} - ${hoursForm.data.weekend_close_hour || '18:00'}`
                                                    : 'Tutup';
                                            });
                                            hoursForm.setData('operating_hours_daily', updated);
                                        }}
                                        className="text-xs px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                                        <span>Terapkan Jam Weekday & Weekend ke Seluruh 7 Hari di Bawah</span>
                                    </button>
                                </div>
                            </div>

                            {/* Card 2: Rincian Buka Harian (Senin s/d Minggu) */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-600" />
                                        2. Rincian Jadwal Jam Operasional Harian (Senin s/d Minggu)
                                    </span>
                                    <span className="text-[10px] text-stone-500 italic">
                                        Ketik "Tutup" pada hari libur gerai
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((d) => {
                                        const currentDayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][new Date().getDay()];
                                        const isToday = d === currentDayName;
                                        return (
                                            <div
                                                key={d}
                                                className={`p-3 rounded-xl border transition ${
                                                    isToday
                                                        ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-200'
                                                        : 'bg-stone-50/60 border-stone-200/80 hover:bg-stone-50'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-slate-800 text-[11px]">{d}</span>
                                                        {isToday && (
                                                            <span className="text-[9px] bg-amber-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded-full">
                                                                Hari Ini
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updated = { ...(hoursForm.data.operating_hours_daily || {}) };
                                                            updated[d] = updated[d] === 'Tutup' ? `${hoursForm.data.open_hour || '09:00'} - ${hoursForm.data.close_hour || '18:00'}` : 'Tutup';
                                                            hoursForm.setData('operating_hours_daily', updated);
                                                        }}
                                                        className="text-[10px] text-stone-400 hover:text-stone-700 underline"
                                                    >
                                                        Toggle Tutup
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={hoursForm.data.operating_hours_daily?.[d] || ''}
                                                    onChange={(e) => {
                                                        const updated = { ...(hoursForm.data.operating_hours_daily || {}) };
                                                        updated[d] = e.target.value;
                                                        hoursForm.setData('operating_hours_daily', updated);
                                                    }}
                                                    placeholder="09:00 - 18:00 atau Tutup"
                                                    className="w-full p-2 bg-white border border-stone-200 rounded-lg font-mono text-xs font-semibold text-slate-900"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tombol Simpan */}
                            <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
                                <button
                                    type="submit"
                                    disabled={hoursForm.processing}
                                    className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 text-xs shadow-xs transition cursor-pointer flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{hoursForm.processing ? 'Menyimpan...' : 'Simpan Jam Operasional Gerai'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>

            {/* MODAL 1: TUGASKAN KURIR SAC GO */}
            {assignCourierModalOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-md flex flex-col shadow-xl overflow-hidden text-xs">
                        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">Penugasan Kurir SAC GO</h3>
                                <p className="text-[11px] text-stone-500">Order: {assignCourierModalOrder.order_code}</p>
                            </div>
                            <button onClick={() => setAssignCourierModalOrder(null)} className="p-1 rounded-lg hover:bg-stone-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleAssignCourier} className="p-4 space-y-3">
                            <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                                <div className="text-[11px] text-stone-500 uppercase font-semibold">Alamat Jemput Konsumen:</div>
                                <div className="font-semibold text-slate-900">{assignCourierModalOrder.customer_name} ({assignCourierModalOrder.customer_phone})</div>
                                <div className="text-[11px] text-slate-600 leading-relaxed">{assignCourierModalOrder.pickup_address}</div>
                            </div>
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Nama Petugas Kurir *</label>
                                <input
                                    type="text"
                                    required
                                    value={courierForm.data.courier_name}
                                    onChange={(e) => courierForm.setData('courier_name', e.target.value)}
                                    placeholder="Contoh: Kurir Doni / Staf Rizal"
                                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAssignCourierModalOrder(null)}
                                    className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                                >
                                    Jadwalkan Kurir OTW
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: INTAKE & DIAGNOSIS WORKSHOP */}
            {intakeDiagnosisModalOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-md flex flex-col shadow-xl overflow-hidden text-xs">
                        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">Intake & Diagnosis Workshop</h3>
                                <p className="text-[11px] text-stone-500">Order: {intakeDiagnosisModalOrder.order_code}</p>
                            </div>
                            <button onClick={() => setIntakeDiagnosisModalOrder(null)} className="p-1 rounded-lg hover:bg-stone-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleIntakeDiagnosis} className="p-4 space-y-3">
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Catatan Diagnosis Bahan & Kerusakan Awal</label>
                                <textarea
                                    rows="3"
                                    value={diagnosisForm.data.diagnosis_notes}
                                    onChange={(e) => diagnosisForm.setData('diagnosis_notes', e.target.value)}
                                    placeholder="Misal: Sol midsole sudah rapuh/lem getas, upper suede ada noda luntur, insole kotor wajar."
                                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                            </div>
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">URL Foto Kondisi Awal (Before)</label>
                                <input
                                    type="text"
                                    value={diagnosisForm.data.before_photo_url}
                                    onChange={(e) => diagnosisForm.setData('before_photo_url', e.target.value)}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-[11px]"
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIntakeDiagnosisModalOrder(null)}
                                    className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                                >
                                    Simpan Diagnosis & Siap Cuci
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: MULAI TREATMENT / CUCI */}
            {startTreatmentModalOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-md flex flex-col shadow-xl overflow-hidden text-xs">
                        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">Mulai Pengerjaan Teknisi</h3>
                                <p className="text-[11px] text-stone-500">Order: {startTreatmentModalOrder.order_code}</p>
                            </div>
                            <button onClick={() => setStartTreatmentModalOrder(null)} className="p-1 rounded-lg hover:bg-stone-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleStartTreatment} className="p-4 space-y-3">
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Nama Teknisi Penanggung Jawab *</label>
                                <input
                                    type="text"
                                    required
                                    value={treatmentStartForm.data.technician_name}
                                    onChange={(e) => treatmentStartForm.setData('technician_name', e.target.value)}
                                    placeholder="Contoh: Teknisi Budi / Tim Washing Bay"
                                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStartTreatmentModalOrder(null)}
                                    className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                                >
                                    Mulai Pengerjaan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: QC & PACKAGING (FOTO AFTER) */}
            {qcPackingModalOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-md flex flex-col shadow-xl overflow-hidden text-xs">
                        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">Quality Control & Packaging Garansi</h3>
                                <p className="text-[11px] text-stone-500">Order: {qcPackingModalOrder.order_code}</p>
                            </div>
                            <button onClick={() => setQcPackingModalOrder(null)} className="p-1 rounded-lg hover:bg-stone-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleQcPacking} className="p-4 space-y-3">
                            <div className="p-3 bg-purple-50 rounded-xl space-y-1.5 border border-purple-200 text-[11px]">
                                <div className="font-bold text-purple-900">Standard QC Shoes and Care:</div>
                                <div className="text-purple-800 space-y-0.5">
                                    <div>&bull; Upper bersih dari debu/minyak</div>
                                    <div>&bull; Midsole bebas kerikil dan noda kotoran</div>
                                    <div>&bull; Disterilisasi dan wangi segar</div>
                                </div>
                            </div>
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">URL Foto Hasil Akhir (After) *</label>
                                <input
                                    type="text"
                                    required
                                    value={qcForm.data.after_photo_url}
                                    onChange={(e) => qcForm.setData('after_photo_url', e.target.value)}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-[11px]"
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setQcPackingModalOrder(null)}
                                    className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                                >
                                    Lolos QC & Siap Diantar/Ambil
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 5: SETTLEMENT PEMBAYARAN & SELESAI */}
            {completeOrderModalOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-md flex flex-col shadow-xl overflow-hidden text-xs">
                        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">Penyelesaian Pesanan & Garansi</h3>
                                <p className="text-[11px] text-stone-500">Order: {completeOrderModalOrder.order_code}</p>
                            </div>
                            <button onClick={() => setCompleteOrderModalOrder(null)} className="p-1 rounded-lg hover:bg-stone-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleCompleteOrder} className="p-4 space-y-3">
                            <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-stone-500">Total Tagihan:</span>
                                    <span className="font-mono font-bold text-sm text-amber-700">{formatRupiah(completeOrderModalOrder.total_price)}</span>
                                </div>
                                <div className="text-[10px] text-stone-400">Garansi cuci ulang 3 hari kerja akan otomatis diaktifkan.</div>
                            </div>
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Metode Pembayaran *</label>
                                <select
                                    value={completeForm.data.payment_method}
                                    onChange={(e) => completeForm.setData('payment_method', e.target.value)}
                                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                                >
                                    <option value="QRIS">QRIS Standar Nasional</option>
                                    <option value="COD">COD (Bayar Tunai ke Kurir)</option>
                                    <option value="TRANSFER">Transfer Bank</option>
                                    <option value="CASH">Tunai di Kasir Gerai</option>
                                </select>
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCompleteOrderModalOrder(null)}
                                    className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                                >
                                    Konfirmasi Lunas & Aktifkan Garansi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 6: DIGITAL E-RECEIPT & KARTU GARANSI */}
            {receiptModalOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm print:p-0">
                    <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-xs flex flex-col print:shadow-none print:border-none print:w-full">
                        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50 print:hidden">
                            <span className="font-bold text-xs text-slate-700">E-Receipt Resmi Shoes and Care</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="py-1 px-2.5 rounded-lg bg-stone-200 hover:bg-stone-300 font-semibold flex items-center gap-1 transition"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Cetak</span>
                                </button>
                                <button onClick={() => setReceiptModalOrder(null)} className="p-1 rounded-lg hover:bg-stone-200">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Printable Area */}
                        <div className="p-6 space-y-5 font-sans">
                            {/* Receipt Header */}
                            <div className="text-center space-y-1 pb-4 border-b border-dashed border-stone-300">
                                <div className="h-10 w-10 mx-auto rounded-xl bg-black flex items-center justify-center p-0.5">
                                    <img src="/images/logo.png" alt="Shoes and Care" className="w-full h-full object-contain" />
                                </div>
                                <h3 className="font-black text-base text-slate-900 tracking-tight">SHOES AND CARE</h3>
                                <p className="text-[11px] text-stone-500">{branch.branch_name}</p>
                                <p className="text-[10px] text-stone-400">{branch.full_address}</p>
                                <p className="text-[10px] text-stone-400">WhatsApp: {branch.whatsapp_number}</p>
                            </div>

                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div>
                                    <span className="text-stone-400 block">No. Invoice:</span>
                                    <span className="font-mono font-bold text-slate-900">{receiptModalOrder.order_code}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-stone-400 block">Tanggal:</span>
                                    <span>{new Date(receiptModalOrder.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                                </div>
                                <div>
                                    <span className="text-stone-400 block">Konsumen:</span>
                                    <span className="font-semibold text-slate-900">{receiptModalOrder.customer_name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-stone-400 block">Layanan:</span>
                                    <span>{receiptModalOrder.service_type === 'SAC_GO' ? 'SAC GO Antar-Jemput' : 'Walk-In'}</span>
                                </div>
                            </div>

                            {/* Itemized List */}
                            <div className="border-t border-b border-dashed border-stone-300 py-3 space-y-2">
                                <div className="flex justify-between font-bold text-slate-900">
                                    <span>{receiptModalOrder.shoe_type} ({receiptModalOrder.pair_count} pasang)</span>
                                </div>
                                {receiptModalOrder.items?.map((it) => (
                                    <div key={it.id} className="flex justify-between text-[11px] text-stone-600 pl-2">
                                        <span>• {it.treatment_name}</span>
                                        <span className="font-mono">{formatRupiah(it.price)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Totals & Payment */}
                            <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between font-bold text-slate-900 text-sm">
                                    <span>TOTAL:</span>
                                    <span className="font-mono text-amber-700">{formatRupiah(receiptModalOrder.total_price)}</span>
                                </div>
                                <div className="flex justify-between text-[11px] text-stone-500">
                                    <span>Status Pembayaran:</span>
                                    <span className="font-bold text-emerald-700">{receiptModalOrder.payment_status || 'PAID'} ({receiptModalOrder.payment_method || 'QRIS'})</span>
                                </div>
                            </div>

                            {/* Warranty Clause */}
                            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-1">
                                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-800">
                                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>GARANSI CUCI ULANG 3 HARI KERJA</span>
                                </div>
                                <p className="text-[10px] text-stone-500 leading-relaxed">
                                    Simpan bukti ini. Jika sepatu masih kotor atau berbau dalam 3 hari sejak diterima, kami cuci ulang tanpa biaya tambahan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tambah Staf oleh Kepala Cabang */}
            {isAddStaffModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-md flex flex-col shadow-xl overflow-hidden text-xs">
                        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">Buat Akun Staf Cabang</h3>
                                <p className="text-[11px] text-stone-500">Ditugaskan di: {branch.branch_name}</p>
                            </div>
                            <button onClick={() => setIsAddStaffModalOpen(false)} className="p-1 rounded-lg hover:bg-stone-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateStaff} className="p-4 space-y-3">
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Nama Lengkap Staf *</label>
                                <input
                                    type="text"
                                    required
                                    value={staffForm.data.name}
                                    onChange={(e) => staffForm.setData('name', e.target.value)}
                                    placeholder="Contoh: Budi Santoso (Teknisi)"
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Email Login Staf *</label>
                                <input
                                    type="email"
                                    required
                                    value={staffForm.data.email}
                                    onChange={(e) => staffForm.setData('email', e.target.value)}
                                    placeholder="budi.galaxy@shoesandcare.com"
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Kata Sandi Awal *</label>
                                <input
                                    type="password"
                                    required
                                    value={staffForm.data.password}
                                    onChange={(e) => staffForm.setData('password', e.target.value)}
                                    placeholder="Minimal 6 karakter"
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Nomor Telepon Staf</label>
                                <input
                                    type="text"
                                    value={staffForm.data.phone}
                                    onChange={(e) => staffForm.setData('phone', e.target.value)}
                                    placeholder="081234567890"
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                />
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={staffForm.processing}
                                    className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 font-semibold text-slate-950"
                                >
                                    {staffForm.processing ? 'Menyimpan...' : 'Simpan Akun Staf'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Tambah Treatment Khusus Gerai */}
            {isAddSpecialModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-md flex flex-col shadow-xl overflow-hidden text-xs">
                        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                            <h3 className="font-bold text-sm text-slate-900">Tambah Treatment Khusus Gerai</h3>
                            <button onClick={() => setIsAddSpecialModalOpen(false)} className="p-1 rounded-lg hover:bg-stone-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSpecialTreatment} className="p-4 space-y-3">
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Nama Perawatan *</label>
                                <input
                                    type="text"
                                    required
                                    value={treatmentForm.data.name}
                                    onChange={(e) => treatmentForm.setData('name', e.target.value)}
                                    placeholder="Contoh: Custom Suede Dye Dark Green"
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Kategori *</label>
                                <input
                                    type="text"
                                    required
                                    value={treatmentForm.data.category}
                                    onChange={(e) => treatmentForm.setData('category', e.target.value)}
                                    placeholder="Contoh: Custom Dye, Leather Spa"
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Biaya (Rp) *</label>
                                <input
                                    type="number"
                                    required
                                    value={treatmentForm.data.price}
                                    onChange={(e) => treatmentForm.setData('price', e.target.value)}
                                    placeholder="150000"
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                                />
                            </div>
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Deskripsi Pengerjaan *</label>
                                <textarea
                                    required
                                    rows="2"
                                    value={treatmentForm.data.description}
                                    onChange={(e) => treatmentForm.setData('description', e.target.value)}
                                    placeholder="Penjelasan teknik pengerjaan dan bahan yang digunakan"
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                />
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={treatmentForm.processing}
                                    className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 font-semibold text-slate-950"
                                >
                                    {treatmentForm.processing ? 'Menyimpan...' : 'Simpan Layanan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
