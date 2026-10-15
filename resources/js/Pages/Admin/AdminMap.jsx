import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
    Building2, 
    Layers, 
    BarChart3, 
    Plus, 
    Search, 
    LogOut, 
    LayoutList, 
    MapPin, 
    Truck, 
    Radio, 
    Sparkles, 
    CheckCircle2, 
    Phone, 
    MessageCircle, 
    Edit3, 
    Trash2, 
    X, 
    ShieldCheck, 
    Sliders, 
    ExternalLink,
    Users
} from 'lucide-react';
import SpatialAnalysisModal from '../../Components/SpatialAnalysisModal';
import AddBranchModal from '../../Components/AddBranchModal';

export default function AdminMap({
    branches = [],
    districts = [],
    spatialStats = {},
}) {
    // Map References
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);
    const bufferLayerRef = useRef(null);
    const clickMarkerRef = useRef(null);
    const tileLayerRef = useRef(null);

    // States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [filterSacGoOnly, setFilterSacGoOnly] = useState('all'); // 'all' | 'sac_go' | 'walk_in'
    const [activeBranch, setActiveBranch] = useState(null);

    // Spatial Visual Layers
    const [activeBasemap, setActiveBasemap] = useState('osm'); // 'osm' | 'esri_street' | 'esri_sat'
    const [showBuffer, setShowBuffer] = useState(false);
    const [bufferRadiusKm, setBufferRadiusKm] = useState(5.0);

    // Clicked coordinates for adding a branch
    const [clickedCoords, setClickedCoords] = useState(null);

    // Modals
    const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);

    // Form Edit Cabang
    const editForm = useForm({
        district_id: '',
        branch_name: '',
        full_address: '',
        latitude: '',
        longitude: '',
        whatsapp_number: '',
        phone_number: '',
        open_hour: '09:00',
        close_hour: '21:00',
        weekend_open_hour: '10:00',
        weekend_close_hour: '20:00',
        is_open_weekend: true,
        is_pickup_available: true,
        is_active: true,
        operating_hours_daily: {},
    });

    const basemaps = {
        osm: {
            name: 'Peta Jalan',
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            maxZoom: 19,
        },
        esri_street: {
            name: 'Esri Street',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
            maxZoom: 19,
        },
        esri_sat: {
            name: 'Citra Satelit',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            maxZoom: 18,
        },
    };

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
    };

    // Filter branches
    const filteredBranches = useMemo(() => {
        return branches.filter((b) => {
            if (selectedDistrict !== 'all' && b.district_id !== Number(selectedDistrict)) {
                return false;
            }
            if (filterSacGoOnly === 'sac_go' && !b.is_pickup_available) {
                return false;
            }
            if (filterSacGoOnly === 'walk_in' && b.is_pickup_available) {
                return false;
            }
            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase();
                const matchName = b.branch_name.toLowerCase().includes(q) || b.brand_name.toLowerCase().includes(q);
                const matchAddress = b.full_address.toLowerCase().includes(q) || (b.district?.name && b.district.name.toLowerCase().includes(q));
                if (!matchName && !matchAddress) return false;
            }
            return true;
        });
    }, [branches, selectedDistrict, filterSacGoOnly, searchQuery]);

    // Handle Toggle SAC GO
    const handleToggleSacGo = (branchId) => {
        router.post(`/admin/branches/${branchId}/toggle-sac-go`, {}, { preserveScroll: true });
    };

    // Handle Delete Branch
    const handleDeleteBranch = (branch) => {
        if (confirm(`Yakin ingin menghapus gerai '${branch.branch_name}' dari direktori nasional?`)) {
            router.delete(`/admin/branches/${branch.id}`, { preserveScroll: true });
        }
    };

    // Open Edit Modal
    const handleOpenEditModal = (branch) => {
        setEditingBranch(branch);
        const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        const initialDaily = branch.operating_hours_daily ? { ...branch.operating_hours_daily } : {};
        days.forEach((d) => {
            if (!initialDaily[d]) {
                if (d === 'Sabtu' || d === 'Minggu') {
                    initialDaily[d] = branch.is_open_weekend !== false ? `${branch.weekend_open_hour || '10:00'} - ${branch.weekend_close_hour || '20:00'}` : 'Tutup';
                } else {
                    initialDaily[d] = `${branch.open_hour || '09:00'} - ${branch.close_hour || '21:00'}`;
                }
            }
        });

        editForm.setData({
            district_id: branch.district_id,
            branch_name: branch.branch_name,
            full_address: branch.full_address,
            latitude: branch.latitude,
            longitude: branch.longitude,
            whatsapp_number: branch.whatsapp_number,
            phone_number: branch.phone_number || '',
            open_hour: branch.open_hour || '09:00',
            close_hour: branch.close_hour || '21:00',
            weekend_open_hour: branch.weekend_open_hour || '10:00',
            weekend_close_hour: branch.weekend_close_hour || '20:00',
            is_open_weekend: branch.is_open_weekend !== false,
            is_pickup_available: Boolean(branch.is_pickup_available),
            is_active: Boolean(branch.is_active),
            operating_hours_daily: initialDaily,
        });
    };

    const handleUpdateBranch = (e) => {
        e.preventDefault();
        if (!editingBranch) return;
        editForm.put(`/admin/branches/${editingBranch.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingBranch(null);
            },
        });
    };

    // Inisialisasi Map Leaflet
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const initialCenter = [-6.2383, 106.9756]; // Pusat Bekasi
        const map = L.map(mapContainerRef.current, {
            center: initialCenter,
            zoom: 12,
            zoomControl: false,
            attributionControl: false,
        });

        L.control.attribution({ position: 'bottomright', prefix: false })
            .addAttribution('Shoes and Care Admin GIS HQ')
            .addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        tileLayerRef.current = L.tileLayer(basemaps.osm.url, {
            maxZoom: basemaps.osm.maxZoom,
        }).addTo(map);

        markersLayerRef.current = L.featureGroup().addTo(map);
        bufferLayerRef.current = L.layerGroup().addTo(map);

        // Map Click Listener to pick coordinates
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            setClickedCoords({ lat, lng });

            if (clickMarkerRef.current) {
                map.removeLayer(clickMarkerRef.current);
            }

            const clickIcon = L.divIcon({
                className: 'admin-click-pin',
                html: `
                    <div style="background-color: #ef4444; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; items-center; justify-content: center;">
                        <div style="background: white; width: 6px; height: 6px; border-radius: 50%;"></div>
                    </div>
                `,
                iconSize: [22, 22],
                iconAnchor: [11, 11],
            });

            clickMarkerRef.current = L.marker([lat, lng], { icon: clickIcon }).addTo(map);
        });

        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Ganti Basemap
    useEffect(() => {
        if (!mapInstanceRef.current || !tileLayerRef.current) return;
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
        tileLayerRef.current = L.tileLayer(basemaps[activeBasemap].url, {
            maxZoom: basemaps[activeBasemap].maxZoom,
        }).addTo(mapInstanceRef.current);
    }, [activeBasemap]);

    // Render Markers & Buffer
    useEffect(() => {
        if (!mapInstanceRef.current || !markersLayerRef.current || !bufferLayerRef.current) return;

        markersLayerRef.current.clearLayers();
        bufferLayerRef.current.clearLayers();

        filteredBranches.forEach((branch) => {
            if (!branch.latitude || !branch.longitude) return;

            const isPickup = branch.is_pickup_available;
            const markerBg = isPickup ? '#059669' : '#475569';
            const markerBorder = isPickup ? '#34d399' : '#cbd5e1';

            const customIcon = L.divIcon({
                className: 'admin-branch-marker',
                html: `
                    <div style="
                        background-color: ${markerBg};
                        border: 2px solid ${markerBorder};
                        color: white;
                        width: 32px;
                        height: 32px;
                        border-radius: 10px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 800;
                        font-size: 11px;
                        font-family: sans-serif;
                    ">
                        ${isPickup ? 'GO' : 'SC'}
                    </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            });

            const marker = L.marker([branch.latitude, branch.longitude], { icon: customIcon });

            // Popup Admin HQ
            const manager = branch.users?.[0];
            const managerHtml = manager 
                ? `<div style="margin-top: 4px; font-size: 11px; color: #1e293b;"><strong>Kepala Cabang:</strong> ${manager.name} (${manager.email})</div>`
                : `<div style="margin-top: 4px; font-size: 11px; color: #94a3b8; font-style: italic;">Belum ada akun Kepala Cabang</div>`;

            const popupContent = `
                <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; line-height: 1.4; min-width: 240px; padding: 2px;">
                    <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: ${isPickup ? '#059669' : '#64748b'};">
                        ${isPickup ? '✓ SAC GO Aktif (Radius 5 km)' : '○ Walk-in Only'}
                    </div>
                    <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                        ${branch.branch_name}
                    </div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                        ${branch.full_address}
                    </div>
                    <div style="margin-top: 4px; font-size: 10px; font-family: monospace; color: #334155;">
                        <strong>Hari Ini (${['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][new Date().getDay()]}):</strong> ${
                            branch.operating_hours_daily?.[['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][new Date().getDay()]] === 'Tutup'
                                ? '<span style="color: #e11d48; font-weight: bold;">Tutup</span>'
                                : (branch.operating_hours_daily?.[['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][new Date().getDay()]] || `${branch.open_hour}-${branch.close_hour}`) + ' WIB'
                        }
                    </div>
                    <div style="font-size: 10px; color: #64748b;">
                        Sen-Jum: ${branch.open_hour || '09:00'}-${branch.close_hour || '21:00'} | Sab-Min: ${branch.is_open_weekend ? `${branch.weekend_open_hour || '10:00'}-${branch.weekend_close_hour || '20:00'}` : '<span style="color: #e11d48;">Libur</span>'}
                    </div>
                    ${managerHtml}
                    <div style="margin-top: 6px; font-size: 11px; font-family: monospace; color: #d97706; font-weight: 700;">
                        ${branch.orders_count || 0} Total Pesanan Terdaftar
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            marker.on('click', () => {
                setActiveBranch(branch);
            });

            markersLayerRef.current.addLayer(marker);

            // Buffer Circles
            if (showBuffer && isPickup) {
                const circle = L.circle([branch.latitude, branch.longitude], {
                    radius: bufferRadiusKm * 1000,
                    color: '#059669',
                    weight: 1,
                    opacity: 0.6,
                    fillColor: '#10b981',
                    fillOpacity: 0.08,
                });
                bufferLayerRef.current.addLayer(circle);
            }
        });
    }, [filteredBranches, showBuffer, bufferRadiusKm]);

    // Fly to active branch
    const flyToBranch = (branch) => {
        setActiveBranch(branch);
        if (mapInstanceRef.current && branch.latitude && branch.longitude) {
            mapInstanceRef.current.flyTo([branch.latitude, branch.longitude], 15, { duration: 1.2 });
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfbf9] text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col h-screen overflow-hidden">
            <Head title="Peta GIS Admin HQ - Shoes and Care" />

            {/* Admin HQ Navigation Header */}
            <header className="bg-white/95 backdrop-blur-md border-b border-stone-200/90 z-30 px-4 lg:px-6 py-2.5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] shrink-0">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-black border border-stone-200 flex items-center justify-center p-0.5 shrink-0">
                            <img src="/images/logo.png" alt="Shoes and Care" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-bold text-sm tracking-tight text-slate-900">
                                    Peta GIS Admin HQ <span className="text-amber-600 font-extrabold">(Command Center)</span>
                                </h1>
                                <span className="text-[9px] font-mono font-bold px-2 py-0.2 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                                    Super Admin
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-500">
                                Manajemen Spasial 69 Gerai Nasional, Radius Penjemputan SAC GO & Evaluasi Sebaran
                            </p>
                        </div>
                    </div>

                    {/* Stats & Actions Bar */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsAnalysisOpen(true)}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-slate-700 border border-stone-200/90 shadow-2xs transition cursor-pointer"
                        >
                            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                            <span className="hidden sm:inline">Analisis Spasial Sebaran</span>
                        </button>

                        <button
                            onClick={() => setIsAddBranchOpen(true)}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 shadow-xs transition cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah Cabang Baru</span>
                        </button>

                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-slate-700 border border-stone-200/80 transition"
                        >
                            <LayoutList className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Tabel & Master Data</span>
                        </Link>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-red-50 hover:text-red-700 text-slate-600 transition cursor-pointer"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Interactive Screen */}
            <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
                {/* Left Admin Control Sidebar */}
                <aside className="w-full lg:w-[380px] xl:w-[410px] bg-white border-r border-stone-200/90 flex flex-col z-20 shrink-0 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.03)] h-[calc(100vh-53px)]">
                    {/* Filter and Search Box */}
                    <div className="p-3.5 border-b border-stone-200/80 bg-stone-50/70 space-y-2.5">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama cabang, alamat, wilayah..."
                                className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="p-1.5 bg-white border border-stone-200/90 rounded-xl text-slate-800 text-[11px]"
                            >
                                <option value="all">Semua Wilayah ({districts.length})</option>
                                {districts.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name} ({d.branches_count || 0})
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filterSacGoOnly}
                                onChange={(e) => setFilterSacGoOnly(e.target.value)}
                                className="p-1.5 bg-white border border-stone-200/90 rounded-xl text-slate-800 text-[11px]"
                            >
                                <option value="all">Semua Jenis Layanan</option>
                                <option value="sac_go">Khusus SAC GO Aktif</option>
                                <option value="walk_in">Khusus Walk-In Only</option>
                            </select>
                        </div>

                        {/* Interactive Click Tip */}
                        {clickedCoords && (
                            <div className="p-2 bg-amber-50 rounded-xl border border-amber-300 text-[11px] flex items-center justify-between animate-in fade-in">
                                <div>
                                    <span className="font-bold text-amber-950 block">Titik Dipilih di Peta:</span>
                                    <span className="font-mono text-stone-600 text-[10px]">
                                        {clickedCoords.lat.toFixed(5)}, {clickedCoords.lng.toFixed(5)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsAddBranchOpen(true)}
                                    className="py-1 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px]"
                                >
                                    + Tambah di Sini
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Branch List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 px-1">
                            <span>Menampilkan {filteredBranches.length} Gerai</span>
                            <span className="text-[10px] text-stone-400">Klik gerai untuk fokus di peta</span>
                        </div>

                        {filteredBranches.map((branch) => {
                            const isSelected = activeBranch?.id === branch.id;
                            const manager = branch.users?.[0];

                            return (
                                <div
                                    key={branch.id}
                                    onClick={() => flyToBranch(branch)}
                                    className={`p-3 rounded-2xl border transition cursor-pointer space-y-2 text-xs ${
                                        isSelected
                                            ? 'bg-amber-50/60 border-amber-400 ring-1 ring-amber-300 shadow-xs'
                                            : 'bg-white hover:bg-stone-50 border-stone-200/80 shadow-2xs'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-1">
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-xs">{branch.branch_name}</h4>
                                            <span className="text-[10px] text-stone-400 block">{branch.district?.name}</span>
                                        </div>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                                            branch.is_pickup_available
                                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                                : 'bg-stone-100 text-stone-600 border-stone-200'
                                        }`}>
                                            {branch.is_pickup_available ? 'SAC GO' : 'Walk-In'}
                                        </span>
                                    </div>

                                    <p className="text-[11px] text-stone-600 line-clamp-1">{branch.full_address}</p>

                                    <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono pt-1">
                                        <span>Sen-Jum: {branch.open_hour || '09:00'}-{branch.close_hour || '21:00'}</span>
                                        <span>Sab-Min: {branch.is_open_weekend ? `${branch.weekend_open_hour || '10:00'}-${branch.weekend_close_hour || '20:00'}` : 'Libur'}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-100">
                                        <span className="truncate">
                                            {manager ? `Kepala: ${manager.name}` : 'Belum Ada Kepala Cabang'}
                                        </span>
                                        <span className="font-mono font-bold text-amber-700">
                                            {branch.orders_count || 0} order
                                        </span>
                                    </div>

                                    {/* Action Buttons for Super Admin */}
                                    <div className="pt-1 flex items-center justify-between gap-1 text-[10px]">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleSacGo(branch.id);
                                            }}
                                            className={`px-2 py-1 rounded-lg border font-semibold transition ${
                                                branch.is_pickup_available
                                                    ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
                                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                                            }`}
                                        >
                                            {branch.is_pickup_available ? 'Matikan SAC GO' : 'Aktifkan SAC GO'}
                                        </button>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenEditModal(branch);
                                                }}
                                                className="p-1 text-slate-500 hover:text-amber-600 rounded-md hover:bg-stone-100"
                                                title="Edit Cabang"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteBranch(branch);
                                                }}
                                                className="p-1 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-50"
                                                title="Hapus Cabang"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* Right Interactive GIS Map */}
                <div className="flex-1 relative h-full">
                    <div ref={mapContainerRef} className="w-full h-full" />

                    {/* Spatial Layer Controls Panel (Top Right Floating) */}
                    <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-stone-200/90 shadow-md space-y-2 text-xs">
                        <span className="text-[10px] uppercase font-bold text-stone-500 block">Layer Peta Admin</span>
                        
                        {/* Basemap Selection */}
                        <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200/80">
                            <button
                                onClick={() => setActiveBasemap('osm')}
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition ${
                                    activeBasemap === 'osm' ? 'bg-white text-slate-900 shadow-2xs' : 'text-stone-500'
                                }`}
                            >
                                Jalan
                            </button>
                            <button
                                onClick={() => setActiveBasemap('esri_sat')}
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition ${
                                    activeBasemap === 'esri_sat' ? 'bg-white text-slate-900 shadow-2xs' : 'text-stone-500'
                                }`}
                            >
                                Satelit
                            </button>
                            <button
                                onClick={() => setActiveBasemap('esri_street')}
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition ${
                                    activeBasemap === 'esri_street' ? 'bg-white text-slate-900 shadow-2xs' : 'text-stone-500'
                                }`}
                            >
                                Street
                            </button>
                        </div>

                        {/* SAC GO Coverage Buffer Toggle */}
                        <div className="pt-1.5 border-t border-stone-100 space-y-1">
                            <label className="flex items-center justify-between gap-2 cursor-pointer text-[11px] text-slate-700">
                                <span>Lingkar Radius SAC GO</span>
                                <input
                                    type="checkbox"
                                    checked={showBuffer}
                                    onChange={(e) => setShowBuffer(e.target.checked)}
                                    className="rounded text-emerald-600 focus:ring-0"
                                />
                            </label>
                            {showBuffer && (
                                <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5">
                                    <span>Radius: {bufferRadiusKm} km</span>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        step="0.5"
                                        value={bufferRadiusKm}
                                        onChange={(e) => setBufferRadiusKm(parseFloat(e.target.value))}
                                        className="w-20 accent-emerald-600"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL TAMBAH CABANG DARI ADMIN MAP */}
            {isAddBranchOpen && (
                <AddBranchModal
                    districts={districts}
                    onClose={() => {
                        setIsAddBranchOpen(false);
                        setClickedCoords(null);
                        if (clickMarkerRef.current && mapInstanceRef.current) {
                            mapInstanceRef.current.removeLayer(clickMarkerRef.current);
                        }
                    }}
                />
            )}

            {/* MODAL ANALISIS SPASIAL NASIONAL */}
            {isAnalysisOpen && (
                <SpatialAnalysisModal
                    spatialStats={spatialStats}
                    districts={districts}
                    onClose={() => setIsAnalysisOpen(false)}
                />
            )}

            {/* MODAL EDIT CABANG */}
            {editingBranch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-lg flex flex-col shadow-xl overflow-hidden text-xs max-h-[90vh]">
                        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">Edit Data Cabang</h3>
                                <p className="text-[11px] text-stone-500">{editingBranch.branch_name}</p>
                            </div>
                            <button onClick={() => setEditingBranch(null)} className="p-1 rounded-lg hover:bg-stone-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateBranch} className="p-4 space-y-3 overflow-y-auto">
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Nama Gerai Cabang *</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.branch_name}
                                    onChange={(e) => editForm.setData('branch_name', e.target.value)}
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Wilayah / Kota *</label>
                                <select
                                    value={editForm.data.district_id}
                                    onChange={(e) => editForm.setData('district_id', Number(e.target.value))}
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                >
                                    {districts.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Alamat Lengkap *</label>
                                <textarea
                                    required
                                    rows="2"
                                    value={editForm.data.full_address}
                                    onChange={(e) => editForm.setData('full_address', e.target.value)}
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Latitude *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        value={editForm.data.latitude}
                                        onChange={(e) => editForm.setData('latitude', parseFloat(e.target.value))}
                                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Longitude *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        value={editForm.data.longitude}
                                        onChange={(e) => editForm.setData('longitude', parseFloat(e.target.value))}
                                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">WhatsApp CS *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.data.whatsapp_number}
                                        onChange={(e) => editForm.setData('whatsapp_number', e.target.value)}
                                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Status SAC GO</label>
                                    <label className="flex items-center gap-2 pt-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editForm.data.is_pickup_available}
                                            onChange={(e) => editForm.setData('is_pickup_available', e.target.checked)}
                                            className="rounded text-amber-500"
                                        />
                                        <span>SAC GO Aktif</span>
                                    </label>
                                </div>
                            </div>

                            {/* Informasi Wewenang Jam Buka Dialihkan ke Kepala Cabang */}
                            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
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

                            <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingBranch(null)}
                                    className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-slate-950"
                                >
                                    {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
