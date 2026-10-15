import React, { useState } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { 
    Building2, 
    Users, 
    Layers, 
    Sparkles, 
    LogOut, 
    Map, 
    Plus, 
    Search, 
    CheckCircle2, 
    Clock, 
    Phone, 
    Trash2, 
    Edit3, 
    Truck, 
    ShieldCheck, 
    ExternalLink, 
    X,
    MapPin,
    AlertCircle,
    Tag,
    Check
} from 'lucide-react';

export default function AdminDashboard({
    branches = [],
    districts = [],
    masterTreatments = [],
    recentOrders = [],
    stats = {},
    filters = {}
}) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('branches'); // 'branches' | 'managers' | 'treatments' | 'orders'
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedDistrict, setSelectedDistrict] = useState(filters.district_id || 'all');

    // Modals & Edit States
    const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
    const [isAddManagerModalOpen, setIsAddManagerModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);

    // Form Edit Cabang & Jam Operasional (Weekday & Weekend)
    const branchEditForm = useForm({
        branch_name: '',
        district_id: '',
        full_address: '',
        benchmark_notes: '',
        whatsapp_number: '',
        phone_number: '',
        latitude: -6.2625000,
        longitude: 106.9856000,
        open_hour: '09:00',
        close_hour: '21:00',
        weekend_open_hour: '10:00',
        weekend_close_hour: '20:00',
        is_open_weekend: true,
        is_pickup_available: false,
    });

    // Master Treatment Edit State & Form
    const [editingTreatment, setEditingTreatment] = useState(null);
    const masterTreatmentForm = useForm({
        name: '',
        category: '',
        description: '',
        default_price: 0,
        est_duration: '',
        is_popular: false,
        sync_to_branches: true,
    });

    // Branch Specific Treatments Modal State & Form
    const [selectedBranchForTreatments, setSelectedBranchForTreatments] = useState(null);
    const [editingBranchTreatment, setEditingBranchTreatment] = useState(null);
    const branchTreatmentForm = useForm({
        price: 0,
        est_duration: '',
        is_available: true,
    });

    // Form Tambah Cabang
    const branchForm = useForm({
        district_id: districts[0]?.id || 1,
        brand_name: 'Shoes and Care',
        branch_name: '',
        full_address: '',
        benchmark_notes: '',
        kelurahan: 'Pusat',
        latitude: -6.2625000,
        longitude: 106.9856000,
        whatsapp_number: '6285161667972',
        phone_number: '085161667972',
        open_hour: '09:00',
        close_hour: '21:00',
        weekend_open_hour: '10:00',
        weekend_close_hour: '20:00',
        is_open_weekend: true,
        is_pickup_available: true,
        pickup_coverage: 'Radius 5 km (Layanan Jemput & Antar Gratis / SAC GO)',
    });

    // Form Tambah Kepala Cabang
    const managerForm = useForm({
        branch_id: branches[0]?.id || '',
        name: '',
        email: '',
        password: '',
        phone: '',
    });

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get('/admin', { search: searchQuery, district_id: selectedDistrict }, { preserveState: true });
    };

    const handleDistrictChange = (districtId) => {
        setSelectedDistrict(districtId);
        router.get('/admin', { search: searchQuery, district_id: districtId }, { preserveState: true });
    };

    const handleCreateBranch = (e) => {
        e.preventDefault();
        branchForm.post('/admin/branches', {
            preserveScroll: true,
            onSuccess: () => {
                branchForm.reset();
                setIsAddBranchModalOpen(false);
            },
        });
    };

    const handleCreateManager = (e) => {
        e.preventDefault();
        managerForm.post('/admin/managers', {
            preserveScroll: true,
            onSuccess: () => {
                managerForm.reset();
                setIsAddManagerModalOpen(false);
            },
        });
    };

    const handleDeleteBranch = (branch) => {
        if (confirm(`Yakin ingin menghapus gerai '${branch.branch_name}'?`)) {
            router.delete(`/admin/branches/${branch.id}`, { preserveScroll: true });
        }
    };

    const handleOpenEditBranch = (b) => {
        setEditingBranch(b);
        branchEditForm.setData({
            branch_name: b.branch_name || '',
            district_id: b.district_id || '',
            full_address: b.full_address || '',
            benchmark_notes: b.benchmark_notes || '',
            whatsapp_number: b.whatsapp_number || '',
            phone_number: b.phone_number || '',
            latitude: b.latitude || -6.2625,
            longitude: b.longitude || 106.9856,
            open_hour: b.open_hour || '09:00',
            close_hour: b.close_hour || '21:00',
            weekend_open_hour: b.weekend_open_hour || '10:00',
            weekend_close_hour: b.weekend_close_hour || '20:00',
            is_open_weekend: b.is_open_weekend ?? true,
            is_pickup_available: Boolean(b.is_pickup_available),
        });
    };

    const handleUpdateBranch = (e) => {
        e.preventDefault();
        if (!editingBranch) return;
        branchEditForm.put(`/admin/branches/${editingBranch.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingBranch(null);
            },
        });
    };

    const handleOpenEditMasterTreatment = (mt) => {
        setEditingTreatment(mt);
        masterTreatmentForm.setData({
            name: mt.name || '',
            category: mt.category || '',
            description: mt.description || '',
            default_price: mt.default_price || 0,
            est_duration: mt.est_duration || '',
            is_popular: Boolean(mt.is_popular),
            sync_to_branches: true,
        });
    };

    const handleUpdateMasterTreatment = (e) => {
        e.preventDefault();
        if (!editingTreatment) return;
        masterTreatmentForm.put(`/admin/treatments/${editingTreatment.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingTreatment(null);
            },
        });
    };

    const handleOpenEditBranchTreatment = (bt) => {
        setEditingBranchTreatment(bt);
        branchTreatmentForm.setData({
            price: bt.price || 0,
            est_duration: bt.est_duration || '',
            is_available: bt.is_available ?? true,
        });
    };

    const handleUpdateBranchTreatment = (e) => {
        e.preventDefault();
        if (!editingBranchTreatment) return;
        branchTreatmentForm.put(`/admin/branch-treatments/${editingBranchTreatment.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (selectedBranchForTreatments) {
                    const updatedTreatments = (selectedBranchForTreatments.treatments || []).map((t) =>
                        t.id === editingBranchTreatment.id
                            ? { ...t, price: branchTreatmentForm.data.price, est_duration: branchTreatmentForm.data.est_duration, is_available: branchTreatmentForm.data.is_available }
                            : t
                    );
                    setSelectedBranchForTreatments({
                        ...selectedBranchForTreatments,
                        treatments: updatedTreatments,
                    });
                }
                setEditingBranchTreatment(null);
            },
        });
    };

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
    };

    return (
        <div className="min-h-screen bg-[#fcfbf9] text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
            <Head title="Admin Panel Pusat (HQ) - Shoes and Care GIS" />

            {/* Top Navigation Bar */}
            <header className="bg-white/95 backdrop-blur-md border-b border-stone-200/90 sticky top-0 z-30 px-4 lg:px-8 py-3 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-black border border-stone-200 flex items-center justify-center p-0.5 shrink-0">
                            <img src="/images/logo.png" alt="Shoes and Care" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-base tracking-tight text-slate-900">
                                    Shoes and Care <span className="text-amber-600">HQ Pusat</span>
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-semibold">
                                    Super Admin
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                                Pusat Kontrol 69 Gerai Nasional & Manajemen Layanan SAC GO
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/admin/map"
                            className="inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 shadow-xs transition"
                        >
                            <Map className="w-3.5 h-3.5" />
                            <span>Peta GIS Admin HQ</span>
                        </Link>

                        <Link
                            href="/"
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-slate-700 border border-stone-200/90 shadow-2xs transition hidden md:inline-flex"
                        >
                            <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                            <span>Web Pelanggan</span>
                        </Link>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-red-50 hover:text-red-700 text-slate-600 border border-stone-200/80 transition"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Keluar</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
                {/* Flash Feedback Alert */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between text-xs shadow-xs">
                        <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-medium">{flash.success}</span>
                        </div>
                    </div>
                )}

                {/* KPI Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-stone-500">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Total Cabang</span>
                            <Building2 className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 font-mono">{stats.total_branches}</div>
                        <span className="text-[11px] text-stone-400">Tersebar di {stats.total_districts} Wilayah Nasional</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-stone-500">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">SAC GO Aktif</span>
                            <Truck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-700 font-mono">{stats.total_sac_go_active}</div>
                        <span className="text-[11px] text-stone-400">Gerai Siap Antar-Jemput</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-stone-500">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Kepala Cabang</span>
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-blue-700 font-mono">{stats.total_managers}</div>
                        <span className="text-[11px] text-stone-400">Akun Pengelola Resmi</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-stone-500">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Total Pesanan</span>
                            <Sparkles className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-purple-700 font-mono">{stats.total_orders}</div>
                        <span className="text-[11px] text-stone-400">SAC GO & Walk-in</span>
                    </div>
                </div>

                {/* Tabs Segment Control */}
                <div className="flex items-center gap-1 border-b border-stone-200/90 pb-2 overflow-x-auto scrollbar-none text-xs font-medium">
                    <button
                        onClick={() => setActiveTab('branches')}
                        className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                            activeTab === 'branches'
                                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                                : 'bg-white hover:bg-stone-50 text-slate-600 border border-stone-200/80'
                        }`}
                    >
                        <Building2 className="w-4 h-4" />
                        <span>Manajemen 69 Cabang</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('managers')}
                        className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                            activeTab === 'managers'
                                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                                : 'bg-white hover:bg-stone-50 text-slate-600 border border-stone-200/80'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Akun Kepala Cabang</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('treatments')}
                        className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                            activeTab === 'treatments'
                                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                                : 'bg-white hover:bg-stone-50 text-slate-600 border border-stone-200/80'
                        }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Master Treatment Nasional</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                            activeTab === 'orders'
                                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                                : 'bg-white hover:bg-stone-50 text-slate-600 border border-stone-200/80'
                        }`}
                    >
                        <Truck className="w-4 h-4" />
                        <span>Supervisi Order Nasional</span>
                    </button>
                </div>

                {/* TAB 1: MANAJEMEN 69 CABANG */}
                {activeTab === 'branches' && (
                    <div className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-lg">
                                <div className="relative flex-1">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari cabang, alamat, jalan..."
                                        className="w-full pl-9 pr-3 py-1.5 bg-stone-50/70 border border-stone-200/90 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500"
                                    />
                                </div>
                                <select
                                    value={selectedDistrict}
                                    onChange={(e) => handleDistrictChange(e.target.value)}
                                    className="py-1.5 px-3 bg-stone-50/70 border border-stone-200/90 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-amber-500"
                                >
                                    <option value="all">Semua Wilayah</option>
                                    {districts.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.branches_count})</option>
                                    ))}
                                </select>
                            </form>

                            <button
                                onClick={() => setIsAddBranchModalOpen(true)}
                                className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer self-start sm:self-auto"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Tambah Cabang Baru</span>
                            </button>
                        </div>

                        {/* Branches Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                                <thead>
                                    <tr className="border-b border-stone-200/90 text-stone-400 uppercase text-[10px] tracking-wider font-semibold">
                                        <th className="py-2.5 px-3">Nama Gerai</th>
                                        <th className="py-2.5 px-3">Wilayah</th>
                                        <th className="py-2.5 px-3">SAC GO</th>
                                        <th className="py-2.5 px-3">Kepala Cabang</th>
                                        <th className="py-2.5 px-3">Jam Operasional</th>
                                        <th className="py-2.5 px-3">WhatsApp</th>
                                        <th className="py-2.5 px-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {branches.map((b) => (
                                        <tr key={b.id} className="hover:bg-stone-50/80 transition">
                                            <td className="py-3 px-3">
                                                <div className="font-semibold text-slate-900">{b.branch_name}</div>
                                                <div className="text-[11px] text-stone-500 truncate max-w-xs">{b.full_address}</div>
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-slate-700 text-[11px] font-medium">
                                                    {b.district?.name}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3">
                                                {b.is_pickup_available ? (
                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                                                        READY
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 border border-stone-200 text-[10px]">
                                                        Walk-in Only
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3">
                                                {b.users && b.users.length > 0 ? (
                                                    <div className="text-slate-800 font-medium">{b.users[0].name}</div>
                                                ) : (
                                                    <span className="text-amber-700 text-[11px] italic">Belum Ada Akun</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 font-mono text-[11px]">
                                                <div className="flex items-center gap-1.5 text-slate-800">
                                                    <span className="text-[9px] uppercase font-bold px-1 py-0.5 rounded bg-stone-100 text-stone-600 font-sans">Sen-Jum</span>
                                                    <span>{b.open_hour || '09:00'} - {b.close_hour || '21:00'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] mt-0.5 text-stone-500">
                                                    <span className="text-[9px] uppercase font-bold px-1 py-0.5 rounded bg-amber-50 text-amber-800 font-sans">Sab-Min</span>
                                                    {b.is_open_weekend ? (
                                                        <span className="text-amber-900 font-semibold">{b.weekend_open_hour || '10:00'} - {b.weekend_close_hour || '20:00'}</span>
                                                    ) : (
                                                        <span className="text-rose-600 italic font-sans font-medium">Libur / Tutup</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-3">
                                                <a
                                                    href={`https://wa.me/${b.whatsapp_number}`}
                                                    target="_blank"
                                                    className="text-emerald-700 hover:underline font-mono text-[11px]"
                                                >
                                                    {b.whatsapp_number}
                                                </a>
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleOpenEditBranch(b)}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-800 hover:bg-amber-50 transition"
                                                        title="Edit Jam Operasional & Profil Cabang"
                                                    >
                                                        <Clock className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedBranchForTreatments(b)}
                                                        className="p-1.5 rounded-lg text-amber-700 hover:text-amber-900 hover:bg-amber-50 transition"
                                                        title="Kelola Harga Treatment Khusus Cabang Ini"
                                                    >
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBranch(b)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                                        title="Hapus Cabang"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 2: AKUN KEPALA CABANG */}
                {activeTab === 'managers' && (
                    <div className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">Direktori Akun Kepala Cabang</h3>
                                <p className="text-xs text-slate-500">
                                    Setiap Kepala Cabang dapat login untuk mengelola gerai dan membuat akun staf di cabangnya
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAddManagerModalOpen(true)}
                                className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Buat Akun Kepala Cabang</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {branches.filter(b => b.users && b.users.length > 0).map(b => (
                                <div key={b.id} className="p-4 rounded-2xl border border-stone-200/90 bg-stone-50/50 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                            {b.district?.name}
                                        </span>
                                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                                            Aktif
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-900">{b.branch_name}</h4>
                                    <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-stone-200/60 font-sans">
                                        <div><strong>Kepala Cabang:</strong> {b.users[0]?.name}</div>
                                        <div className="text-[11px] font-mono text-stone-500">Email: {b.users[0]?.email}</div>
                                        <div className="text-[11px] font-mono text-stone-500">Telp: {b.users[0]?.phone || b.whatsapp_number}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 3: MASTER TREATMENT NASIONAL */}
                {activeTab === 'treatments' && (
                    <div className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">Katalog {masterTreatments.length} Master Treatment Resmi Shoes and Care</h3>
                                <p className="text-xs text-slate-500">
                                    Standar layanan dan harga acuan yang otomatis terdistribusi ke seluruh 69 cabang nasional
                                </p>
                            </div>
                            <div className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 self-start sm:self-auto">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Super Admin dapat mengubah harga & sinkron ke semua cabang</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {masterTreatments.map((mt) => (
                                <div key={mt.id} className="p-4 rounded-2xl border border-stone-200/90 bg-stone-50/40 flex flex-col justify-between space-y-3 hover:border-amber-300 transition">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                                                {mt.category}
                                            </span>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-amber-700 font-mono">
                                                    {formatRupiah(mt.default_price)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="font-bold text-sm text-slate-900">{mt.name}</h4>
                                            {mt.is_popular && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                                                    Populer
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">{mt.description}</p>
                                    </div>

                                    <div className="pt-2 border-t border-stone-200/60 space-y-2">
                                        <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                                            <span>Estimasi Durasi:</span>
                                            <span className="text-slate-800 font-semibold">{mt.est_duration}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEditMasterTreatment(mt)}
                                            className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                                        >
                                            <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                                            <span>Edit Harga & Detail Layanan</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 4: SUPERVISI ORDER NASIONAL */}
                {activeTab === 'orders' && (
                    <div className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-xs space-y-4">
                        <div className="pb-3 border-b border-stone-100">
                            <h3 className="font-bold text-sm text-slate-900">Supervisi Pesanan Antar-Jemput SAC GO Nasional</h3>
                            <p className="text-xs text-slate-500">
                                Pemantauan pesanan yang masuk dari konsumen di seluruh Indonesia secara real-time
                            </p>
                        </div>

                        {recentOrders.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 text-xs">
                                Belum ada pesanan aktif yang terdaftar di sistem.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-slate-600">
                                    <thead>
                                        <tr className="border-b border-stone-200/90 text-stone-400 uppercase text-[10px] tracking-wider font-semibold">
                                            <th className="py-2.5 px-3">No. Invoice</th>
                                            <th className="py-2.5 px-3">Konsumen</th>
                                            <th className="py-2.5 px-3">Cabang Tujuan</th>
                                            <th className="py-2.5 px-3">Layanan</th>
                                            <th className="py-2.5 px-3">Total Biaya</th>
                                            <th className="py-2.5 px-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {recentOrders.map((ord) => (
                                            <tr key={ord.id} className="hover:bg-stone-50/80 transition">
                                                <td className="py-3 px-3 font-mono font-bold text-slate-900">
                                                    {ord.order_code}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="font-medium text-slate-800">{ord.customer_name}</div>
                                                    <div className="text-[11px] font-mono text-stone-400">{ord.customer_phone}</div>
                                                </td>
                                                <td className="py-3 px-3 font-medium text-slate-700">
                                                    {ord.branch?.branch_name}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-medium">
                                                        {ord.service_type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 font-mono font-semibold text-amber-700">
                                                    {formatRupiah(ord.total_price)}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                                                        {ord.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modal Tambah Cabang Baru */}
            {isAddBranchModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden text-xs">
                        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                            <h3 className="font-bold text-sm text-slate-900">Tambah Cabang Baru (Pusat HQ)</h3>
                            <button onClick={() => setIsAddBranchModalOpen(false)} className="p-1 rounded-lg hover:bg-stone-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateBranch} className="p-4 overflow-y-auto space-y-3 flex-1">
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Nama Cabang *</label>
                                <input
                                    type="text"
                                    required
                                    value={branchForm.data.branch_name}
                                    onChange={(e) => branchForm.setData('branch_name', e.target.value)}
                                    placeholder="Contoh: SAC Sudirman Grand Mall"
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-medium text-slate-700 block mb-1">Wilayah / Kota *</label>
                                    <select
                                        value={branchForm.data.district_id}
                                        onChange={(e) => branchForm.setData('district_id', e.target.value)}
                                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                    >
                                        {districts.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="font-medium text-slate-700 block mb-1">No. WhatsApp *</label>
                                    <input
                                        type="text"
                                        required
                                        value={branchForm.data.whatsapp_number}
                                        onChange={(e) => branchForm.setData('whatsapp_number', e.target.value)}
                                        placeholder="628123456789"
                                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Alamat Lengkap *</label>
                                <textarea
                                    required
                                    rows="2"
                                    value={branchForm.data.full_address}
                                    onChange={(e) => branchForm.setData('full_address', e.target.value)}
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-medium text-slate-700 block mb-1">Latitude (Koordinat GPS) *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        value={branchForm.data.latitude}
                                        onChange={(e) => branchForm.setData('latitude', e.target.value)}
                                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="font-medium text-slate-700 block mb-1">Longitude (Koordinat GPS) *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        value={branchForm.data.longitude}
                                        onChange={(e) => branchForm.setData('longitude', e.target.value)}
                                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                                    />
                                </div>
                            </div>
                            {/* Jadwal Jam Buka Weekday & Weekend */}
                            <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                                <span className="font-semibold text-slate-800 block text-[11px]">Jadwal Jam Operasional Cabang</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-[10px] text-stone-500 block">Weekday Buka (Sen-Jum)</span>
                                        <input
                                            type="text"
                                            value={branchForm.data.open_hour}
                                            onChange={(e) => branchForm.setData('open_hour', e.target.value)}
                                            placeholder="09:00"
                                            className="w-full p-1.5 bg-white border border-stone-200 rounded-lg font-mono text-center text-xs"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-stone-500 block">Weekday Tutup (Sen-Jum)</span>
                                        <input
                                            type="text"
                                            value={branchForm.data.close_hour}
                                            onChange={(e) => branchForm.setData('close_hour', e.target.value)}
                                            placeholder="21:00"
                                            className="w-full p-1.5 bg-white border border-stone-200 rounded-lg font-mono text-center text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200/60">
                                    <div>
                                        <span className="text-[10px] text-stone-500 block">Weekend Buka (Sab-Min)</span>
                                        <input
                                            type="text"
                                            value={branchForm.data.weekend_open_hour}
                                            onChange={(e) => branchForm.setData('weekend_open_hour', e.target.value)}
                                            placeholder="10:00"
                                            className="w-full p-1.5 bg-white border border-stone-200 rounded-lg font-mono text-center text-xs"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-stone-500 block">Weekend Tutup (Sab-Min)</span>
                                        <input
                                            type="text"
                                            value={branchForm.data.weekend_close_hour}
                                            onChange={(e) => branchForm.setData('weekend_close_hour', e.target.value)}
                                            placeholder="20:00"
                                            className="w-full p-1.5 bg-white border border-stone-200 rounded-lg font-mono text-center text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={branchForm.data.is_pickup_available}
                                        onChange={(e) => branchForm.setData('is_pickup_available', e.target.checked)}
                                        className="w-4 h-4 rounded text-amber-500"
                                    />
                                    <span>Aktifkan Layanan SAC GO (Antar-Jemput)</span>
                                </label>
                                <button
                                    type="submit"
                                    disabled={branchForm.processing}
                                    className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 font-semibold text-slate-950"
                                >
                                    {branchForm.processing ? 'Menyimpan...' : 'Simpan Cabang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit Jam Operasional & Profil Cabang */}
            {editingBranch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-xl overflow-hidden text-xs">
                        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900">Edit Jam Operasional & Profil Cabang</h3>
                                    <p className="text-[11px] text-stone-500">{editingBranch.branch_name} ({editingBranch.district?.name})</p>
                                </div>
                            </div>
                            <button onClick={() => setEditingBranch(null)} className="p-1 rounded-lg hover:bg-stone-200 transition">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateBranch} className="p-5 overflow-y-auto space-y-4 flex-1">
                            {/* Informasi Wewenang Jam Buka Dialihkan ke Kepala Cabang */}
                            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 mt-0.5">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div className="flex-1 space-y-1.5">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <h4 className="font-bold text-slate-900 text-xs">Jadwal Jam Operasional Gerai</h4>
                                        <span className="text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                            Dikelola Kepala Cabang
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-stone-500 leading-relaxed">
                                        Fitur edit jam buka operasional telah dialihkan ke Kepala Cabang gerai ini. Kepala Cabang dapat mengatur jam buka hari kerja, akhir pekan, dan rincian 7 hari langsung di Portal Cabang.
                                    </p>
                                    <div className="text-[11px] font-mono text-slate-700 bg-white p-2.5 rounded-xl border border-stone-200 flex items-center justify-between">
                                        <span>Hari Kerja (Sen-Jum): <strong>{editingBranch.open_hour || '09:00'} - {editingBranch.close_hour || '21:00'} WIB</strong></span>
                                        <span>Weekend: {editingBranch.is_open_weekend ? <strong>{editingBranch.weekend_open_hour || '10:00'} - {editingBranch.weekend_close_hour || '20:00'} WIB</strong> : <span className="text-rose-600 font-bold">Libur</span>}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Informasi Cabang & Kontak */}
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Nama Cabang / Gerai *</label>
                                <input
                                    type="text"
                                    required
                                    value={branchEditForm.data.branch_name}
                                    onChange={(e) => branchEditForm.setData('branch_name', e.target.value)}
                                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Wilayah / Kota *</label>
                                    <select
                                        value={branchEditForm.data.district_id}
                                        onChange={(e) => branchEditForm.setData('district_id', e.target.value)}
                                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 focus:outline-none"
                                    >
                                        {districts.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Nomor WhatsApp *</label>
                                    <input
                                        type="text"
                                        required
                                        value={branchEditForm.data.whatsapp_number}
                                        onChange={(e) => branchEditForm.setData('whatsapp_number', e.target.value)}
                                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Alamat Lengkap *</label>
                                <textarea
                                    required
                                    rows="2"
                                    value={branchEditForm.data.full_address}
                                    onChange={(e) => branchEditForm.setData('full_address', e.target.value)}
                                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={branchEditForm.data.is_pickup_available}
                                        onChange={(e) => branchEditForm.setData('is_pickup_available', e.target.checked)}
                                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                                    />
                                    <div>
                                        <span className="font-medium text-slate-800">Layanan SAC GO (Antar-Jemput)</span>
                                        <span className="text-[10px] text-stone-500 block">Tersedia untuk wilayah Jakarta dan Yogyakarta</span>
                                    </div>
                                </label>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingBranch(null)}
                                        className="py-2 px-3.5 rounded-xl border border-stone-200 text-slate-600 hover:bg-stone-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={branchEditForm.processing}
                                        className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 shadow-xs transition"
                                    >
                                        {branchEditForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Buat Akun Kepala Cabang */}
            {isAddManagerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-md flex flex-col shadow-xl overflow-hidden text-xs">
                        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                            <h3 className="font-bold text-sm text-slate-900">Buat Akun Kepala Cabang</h3>
                            <button onClick={() => setIsAddManagerModalOpen(false)} className="p-1 rounded-lg hover:bg-stone-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateManager} className="p-4 space-y-3">
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Pilih Cabang Bertugas *</label>
                                <select
                                    required
                                    value={managerForm.data.branch_id}
                                    onChange={(e) => managerForm.setData('branch_id', e.target.value)}
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                >
                                    {branches.map((b) => (
                                        <option key={b.id} value={b.id}>{b.branch_name} ({b.district?.name})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Nama Lengkap Kepala Cabang *</label>
                                <input
                                    type="text"
                                    required
                                    value={managerForm.data.name}
                                    onChange={(e) => managerForm.setData('name', e.target.value)}
                                    placeholder="Contoh: Rian Pratama"
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Email Login *</label>
                                <input
                                    type="email"
                                    required
                                    value={managerForm.data.email}
                                    onChange={(e) => managerForm.setData('email', e.target.value)}
                                    placeholder="rian.galaxy@shoesandcare.com"
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Kata Sandi Awal *</label>
                                <input
                                    type="password"
                                    required
                                    value={managerForm.data.password}
                                    onChange={(e) => managerForm.setData('password', e.target.value)}
                                    placeholder="Minimal 6 karakter"
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Nomor Telepon / WA</label>
                                <input
                                    type="text"
                                    value={managerForm.data.phone}
                                    onChange={(e) => managerForm.setData('phone', e.target.value)}
                                    placeholder="081234567890"
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                />
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={managerForm.processing}
                                    className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 font-semibold text-slate-950"
                                >
                                    {managerForm.processing ? 'Menyimpan...' : 'Buat Akun'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit Master Treatment */}
            {editingTreatment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl overflow-hidden text-xs">
                        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900">Edit Harga Master Treatment</h3>
                                    <p className="text-[11px] text-stone-500">{editingTreatment.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditingTreatment(null)}
                                className="p-1 rounded-lg hover:bg-stone-200 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateMasterTreatment} className="p-5 overflow-y-auto space-y-4 flex-1">
                            <div>
                                <label className="font-semibold text-slate-800 block mb-1">Nama Layanan Treatment *</label>
                                <input
                                    type="text"
                                    required
                                    value={masterTreatmentForm.data.name}
                                    onChange={(e) => masterTreatmentForm.setData('name', e.target.value)}
                                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 focus:outline-none"
                                />
                                {masterTreatmentForm.errors.name && (
                                    <p className="text-red-600 text-[11px] mt-1">{masterTreatmentForm.errors.name}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-800 block mb-1">Kategori Treatment *</label>
                                    <input
                                        type="text"
                                        required
                                        value={masterTreatmentForm.data.category}
                                        onChange={(e) => masterTreatmentForm.setData('category', e.target.value)}
                                        placeholder="Contoh: Deep Cleaning"
                                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 focus:outline-none"
                                    />
                                    {masterTreatmentForm.errors.category && (
                                        <p className="text-red-600 text-[11px] mt-1">{masterTreatmentForm.errors.category}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="font-semibold text-slate-800 block mb-1">Estimasi Durasi Pengerjaan *</label>
                                    <input
                                        type="text"
                                        required
                                        value={masterTreatmentForm.data.est_duration}
                                        onChange={(e) => masterTreatmentForm.setData('est_duration', e.target.value)}
                                        placeholder="Contoh: 2-3 Hari"
                                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 focus:outline-none"
                                    />
                                    {masterTreatmentForm.errors.est_duration && (
                                        <p className="text-red-600 text-[11px] mt-1">{masterTreatmentForm.errors.est_duration}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="font-semibold text-slate-800">Harga Standar / Acuan Nasional (Rp) *</label>
                                    <span className="text-xs font-bold text-amber-700 font-mono">
                                        {formatRupiah(Number(masterTreatmentForm.data.default_price) || 0)}
                                    </span>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-stone-400 text-xs">Rp</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="500"
                                        required
                                        value={masterTreatmentForm.data.default_price}
                                        onChange={(e) => masterTreatmentForm.setData('default_price', e.target.value)}
                                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-semibold focus:bg-white focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                                {masterTreatmentForm.errors.default_price && (
                                    <p className="text-red-600 text-[11px] mt-1">{masterTreatmentForm.errors.default_price}</p>
                                )}
                            </div>

                            <div>
                                <label className="font-semibold text-slate-800 block mb-1">Deskripsi & Ruang Lingkup Layanan *</label>
                                <textarea
                                    rows="3"
                                    required
                                    value={masterTreatmentForm.data.description}
                                    onChange={(e) => masterTreatmentForm.setData('description', e.target.value)}
                                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 focus:outline-none"
                                />
                                {masterTreatmentForm.errors.description && (
                                    <p className="text-red-600 text-[11px] mt-1">{masterTreatmentForm.errors.description}</p>
                                )}
                            </div>

                            <div className="space-y-2 pt-2 border-t border-stone-100">
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={masterTreatmentForm.data.is_popular}
                                        onChange={(e) => masterTreatmentForm.setData('is_popular', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                                    />
                                    <div>
                                        <span className="font-medium text-slate-800">Tandai Layanan Populer</span>
                                        <p className="text-[11px] text-stone-500">Akan menampilkan lencana khusus & direkomendasikan pada aplikasi konsumen</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-2.5 cursor-pointer bg-amber-50/70 p-3 rounded-2xl border border-amber-200">
                                    <input
                                        type="checkbox"
                                        checked={masterTreatmentForm.data.sync_to_branches}
                                        onChange={(e) => masterTreatmentForm.setData('sync_to_branches', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                                    />
                                    <div>
                                        <span className="font-bold text-amber-950">Sinkronkan ke Seluruh 69 Cabang (Rekomendasi)</span>
                                        <p className="text-[11px] text-amber-800 leading-relaxed">
                                            Jika dicentang, harga treatment pada seluruh gerai cabang Shoes and Care di seluruh Indonesia akan langsung diperbarui serentak mengikuti harga baru ini.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingTreatment(null)}
                                    className="py-2 px-4 rounded-xl border border-stone-200 text-slate-600 hover:bg-stone-50 font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={masterTreatmentForm.processing}
                                    className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 shadow-xs transition disabled:opacity-50"
                                >
                                    {masterTreatmentForm.processing ? 'Menyimpan...' : 'Simpan Perubahan Harga'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Kelola Harga Khusus Cabang Tertentu */}
            {selectedBranchForTreatments && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden text-xs">
                        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">
                                    Kelola Harga Treatment Cabang: {selectedBranchForTreatments.branch_name}
                                </h3>
                                <p className="text-[11px] text-stone-500">
                                    {selectedBranchForTreatments.district?.name} • Super Admin dapat mengubah harga khusus untuk cabang ini
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedBranchForTreatments(null);
                                    setEditingBranchTreatment(null);
                                }}
                                className="p-1 rounded-lg hover:bg-stone-200 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1 space-y-3">
                            {editingBranchTreatment ? (
                                <form onSubmit={handleUpdateBranchTreatment} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-xs text-slate-900">Edit Harga: {editingBranchTreatment.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => setEditingBranchTreatment(null)}
                                            className="text-stone-400 hover:text-slate-600 text-xs"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Harga Cabang (Rp) *</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="500"
                                                required
                                                value={branchTreatmentForm.data.price}
                                                onChange={(e) => branchTreatmentForm.setData('price', e.target.value)}
                                                className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-mono font-semibold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Estimasi Durasi</label>
                                            <input
                                                type="text"
                                                value={branchTreatmentForm.data.est_duration}
                                                onChange={(e) => branchTreatmentForm.setData('est_duration', e.target.value)}
                                                className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                                        <button
                                            type="button"
                                            onClick={() => setEditingBranchTreatment(null)}
                                            className="py-1.5 px-3 rounded-lg border border-stone-200 text-slate-600"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={branchTreatmentForm.processing}
                                            className="py-1.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 font-bold text-slate-950"
                                        >
                                            {branchTreatmentForm.processing ? 'Menyimpan...' : 'Simpan Harga Cabang'}
                                        </button>
                                    </div>
                                </form>
                            ) : null}

                            <div className="space-y-2">
                                {selectedBranchForTreatments.treatments && selectedBranchForTreatments.treatments.length > 0 ? (
                                    selectedBranchForTreatments.treatments.map((t) => (
                                        <div key={t.id} className="p-3 bg-stone-50/70 border border-stone-200/80 rounded-xl flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-900 truncate">{t.name}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200/80 text-stone-600 font-mono">
                                                        {t.category}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-stone-500">
                                                    Durasi: {t.est_duration || '-'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className="text-right">
                                                    <div className="font-mono font-bold text-amber-700">{formatRupiah(t.price)}</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEditBranchTreatment(t)}
                                                    className="py-1.5 px-2.5 rounded-lg bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700 font-semibold text-xs flex items-center gap-1 transition"
                                                >
                                                    <Edit3 className="w-3 h-3 text-amber-600" />
                                                    <span>Ubah</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-stone-400 text-xs">
                                        Belum ada data treatment untuk cabang ini.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
