import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
    Layers, 
    Compass, 
    Navigation, 
    Sliders, 
    Flame, 
    Radio, 
    Map as MapIcon, 
    Globe, 
    Eye, 
    Star,
    MessageCircle,
    ChevronRight,
    MapPin,
    RotateCcw
} from 'lucide-react';

export default function MapView({
    branches = [],
    districts = [],
    activeBranch = null,
    onSelectBranch = () => {},
    onOpenBranchDetail = () => {},
    userLocation = null,
}) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);
    const bufferLayerRef = useRef(null);
    const heatLayerRef = useRef(null);
    const geojsonLayerRef = useRef(null);
    const userMarkerRef = useRef(null);
    const tileLayerRef = useRef(null);

    // Layer Controls
    const [activeBasemap, setActiveBasemap] = useState('osm'); // 'osm' | 'esri_street' | 'esri_sat'
    const [showDistricts, setShowDistricts] = useState(true);
    const [showBuffer, setShowBuffer] = useState(false);
    const [bufferRadiusKm, setBufferRadiusKm] = useState(2.0);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [showControls, setShowControls] = useState(true);

    // Basemaps definition (100% free, unwatermarked)
    const basemaps = {
        osm: {
            name: 'Peta Jalan',
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            maxZoom: 19,
            subdomains: 'abc',
        },
        esri_street: {
            name: 'Esri Street',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
            maxZoom: 19,
            subdomains: ['server'],
        },
        esri_sat: {
            name: 'Citra Satelit',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            maxZoom: 18,
            subdomains: ['server'],
        },
    };

    // Format Rupiah
    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
    };

    // Helper brand monogram
    const getBrandInitials = (name) => {
        if (!name) return 'SC';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Inisialisasi Map Leaflet
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const initialCenter = [-6.2383, 106.9756]; // Pusat Kota Bekasi
        const map = L.map(mapContainerRef.current, {
            center: initialCenter,
            zoom: 12,
            zoomControl: false,
            attributionControl: false,
        });

        // Add custom subtle attribution in bottom right
        L.control.attribution({ position: 'bottomright', prefix: false })
            .addAttribution('Shoes and Care GIS &bull; OSM / Esri')
            .addTo(map);

        // Add Zoom Control at bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Basemap Tile Layer
        const initialTile = L.tileLayer(basemaps.osm.url, {
            maxZoom: basemaps.osm.maxZoom,
            subdomains: basemaps.osm.subdomains,
        }).addTo(map);
        tileLayerRef.current = initialTile;

        // Layer Groups
        markersLayerRef.current = L.layerGroup().addTo(map);
        bufferLayerRef.current = L.layerGroup().addTo(map);
        heatLayerRef.current = L.layerGroup().addTo(map);

        mapInstanceRef.current = map;

        // Fetch & render GeoJSON batas 12 kecamatan Kota Bekasi
        fetch('/geojson/bekasi_districts.json')
            .then((res) => res.json())
            .then((data) => {
                if (!mapInstanceRef.current) return;

                geojsonLayerRef.current = L.geoJSON(data, {
                    style: (feature) => ({
                        fillColor: feature.properties.color || '#f59e0b',
                        weight: 1.5,
                        opacity: 0.7,
                        color: feature.properties.color || '#f59e0b',
                        fillOpacity: 0.12,
                        dashArray: '3, 4',
                    }),
                    onEachFeature: (feature, layer) => {
                        const districtBranches = branches.filter(
                            (b) => b.district_name.toLowerCase() === feature.properties.name.toLowerCase()
                        );

                        layer.bindTooltip(
                            `<div class="p-2 text-xs text-slate-800 bg-white/95 rounded-xl shadow-xl border border-stone-200/90 font-sans">
                                <div class="font-semibold text-slate-900">Kecamatan ${feature.properties.name}</div>
                                <div class="text-[11px] text-amber-600 font-mono mt-0.5">${districtBranches.length} Gerai Terdata</div>
                            </div>`,
                            { sticky: true, className: 'leaflet-custom-tooltip' }
                        );

                        layer.on({
                            mouseover: (e) => {
                                const l = e.target;
                                l.setStyle({
                                    weight: 2.5,
                                    fillOpacity: 0.25,
                                    dashArray: '',
                                });
                            },
                            mouseout: (e) => {
                                if (geojsonLayerRef.current) {
                                    geojsonLayerRef.current.resetStyle(e.target);
                                }
                            },
                        });
                    },
                }).addTo(map);
            })
            .catch((err) => console.error('Gagal memuat GeoJSON Bekasi:', err));

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Ganti Tile Layer Basemap
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        if (tileLayerRef.current) {
            mapInstanceRef.current.removeLayer(tileLayerRef.current);
        }

        const selected = basemaps[activeBasemap] || basemaps.osm;
        const newTile = L.tileLayer(selected.url, {
            maxZoom: selected.maxZoom,
            subdomains: selected.subdomains,
        }).addTo(mapInstanceRef.current);
        tileLayerRef.current = newTile;
    }, [activeBasemap]);

    // Render Markers Cabang Shoes & Care
    useEffect(() => {
        if (!mapInstanceRef.current || !markersLayerRef.current) return;

        markersLayerRef.current.clearLayers();

        branches.forEach((branch) => {
            const isSelected = activeBranch?.id === branch.id;
            const hasSpecial = branch.special_treatments && branch.special_treatments.length > 0;
            // Vector SVG Pin Marker dengan Icon Sepatu & Label Nama Brand yang jelas
            const iconHtml = `
                <div class="relative flex flex-col items-center cursor-pointer group w-full">
                    ${isSelected ? `
                        <div class="absolute top-0 w-9 h-9 rounded-full bg-amber-400/40 animate-pin-ring pointer-events-none"></div>
                    ` : ''}
                    <div class="w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-md relative ${
                        isSelected
                            ? 'bg-amber-500 text-slate-950 ring-2 ring-white shadow-amber-500/30'
                            : hasSpecial
                                ? 'bg-white text-amber-600 border border-amber-400 shadow-sm ring-1 ring-amber-100'
                                : 'bg-white text-slate-700 border border-slate-200 shadow-sm ring-1 ring-slate-100'
                    }">
                        <!-- Icon Vektor Shoe Care (Sepatu Sneaker) -->
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M2.5 16c0-.8.6-1.5 1.5-1.5h1.5l2.2-4.5c.4-.8 1.2-1.4 2.1-1.4h3.5l2.4 2.5h3.8c1.6 0 3 1.3 3 3v2H2.5v0z"/>
                            <path d="M2 18h20v1a1.5 1.5 0 0 1-1.5 1.5H3.5A1.5 1.5 0 0 1 2 19.5V18z"/>
                            <path d="M8.5 12.5l2 2"/>
                            <path d="M11 12l2 2"/>
                        </svg>
                        ${hasSpecial ? `
                            <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white shadow-xs" title="Memiliki Layanan Khusus"></span>
                        ` : ''}
                    </div>
                    <div class="w-1.5 h-1.5 rotate-45 -mt-1 border-r border-b ${isSelected ? 'bg-amber-500 border-amber-500' : 'bg-white border-slate-200'}"></div>
                    
                    <!-- Label Nama Cabang Shoes & Care yang Jelas di Bawah Pin -->
                    <div class="mt-1 px-2 py-0.5 rounded-md bg-white/95 text-[10px] text-slate-800 border border-stone-200/90 shadow-sm whitespace-nowrap max-w-[120px] truncate leading-tight ${isSelected ? 'border-amber-500 text-amber-900 font-bold bg-amber-50' : 'font-medium'}">
                        ${branch.branch_name.replace('Cabang ', '')}
                    </div>
                </div>
            `;

            const customIcon = L.divIcon({
                html: iconHtml,
                className: 'custom-pin-marker',
                iconSize: [110, 56],
                iconAnchor: [55, 36],
                popupAnchor: [0, -36],
            });

            const marker = L.marker([branch.latitude, branch.longitude], { icon: customIcon });

            const districtLabel = branch.district_name.includes('Bekasi') ? `Kec. ${branch.district_name}` : branch.district_name;
            const daysList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
            const todayIdx = new Date().getDay();
            const todayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][todayIdx];

            let dailyRowsHtml = '';
            if (branch.operating_hours_daily) {
                dailyRowsHtml = daysList.map((d) => {
                    const h = branch.operating_hours_daily[d] || 'Tutup';
                    const isClosed = h === 'Tutup';
                    const isToday = d === todayName;
                    return `
                        <div class="flex items-center justify-between py-0.5 px-1.5 rounded ${isToday ? 'bg-amber-100 font-bold text-amber-950' : 'text-slate-600'}">
                            <span class="flex items-center gap-1">${d} ${isToday ? '<span class="text-[8px] bg-amber-500 text-slate-950 px-1 rounded font-extrabold">Hari Ini</span>' : ''}</span>
                            <span class="font-mono ${isClosed ? 'text-rose-600 font-bold' : 'text-slate-900'}">${isClosed ? 'Tutup' : h + ' WIB'}</span>
                        </div>
                    `;
                }).join('');
            }

            // Tooltip saat hover untuk nama lengkap cabang
            marker.bindTooltip(
                `<div class="p-2 text-xs text-slate-800 bg-white rounded-xl shadow-xl border border-stone-200 font-sans">
                    <strong class="text-amber-700 block">${branch.brand_name}</strong>
                    <span class="text-slate-600">${branch.branch_name} &bull; ${districtLabel}</span>
                </div>`,
                { direction: 'top', offset: [0, -36], className: 'leaflet-custom-tooltip' }
            );

            // Popup Card HTML
            const popupContent = document.createElement('div');
            popupContent.className = 'w-72 bg-white text-slate-800 rounded-2xl overflow-hidden font-sans border border-stone-200/90 shadow-xl';
            popupContent.innerHTML = `
                <div class="p-3 border-b border-stone-200/80 bg-stone-50/80 flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-lg bg-black border border-stone-200 overflow-hidden flex items-center justify-center shrink-0">
                            <img src="/images/logo.png" alt="Shoes and Care" class="w-full h-full object-contain p-0.5" />
                        </div>
                        <div>
                            <span class="text-[9px] uppercase font-semibold tracking-wider text-stone-500">
                                ${branch.brand_name}
                            </span>
                            <h4 class="font-bold text-sm text-slate-900 leading-tight mt-0.5">${branch.branch_name}</h4>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="text-xs font-semibold text-amber-600 flex items-center gap-0.5 justify-end font-mono">
                            ★ ${branch.rating}
                        </span>
                        <span class="text-[10px] text-stone-500">${districtLabel}</span>
                    </div>
                </div>
                <div class="p-3 space-y-2 text-xs">
                    <p class="text-slate-600 text-[11px] leading-relaxed line-clamp-2">${branch.full_address}</p>
                    ${branch.benchmark_notes ? `
                        <p class="text-[10px] text-stone-500 italic">Patokan: ${branch.benchmark_notes}</p>
                    ` : ''}
                    <div class="space-y-1.5 text-[11px] pt-1 border-t border-stone-100">
                        <div class="flex items-center justify-between font-mono text-slate-600">
                            <span>Hari Ini (${todayName}): <strong class="text-slate-900">${branch.operating_hours_daily?.[todayName] ? (branch.operating_hours_daily[todayName] === 'Tutup' ? '<span class=\"text-rose-600 font-sans\">Tutup</span>' : branch.operating_hours_daily[todayName] + ' WIB') : (branch.open_hour + ' - ' + branch.close_hour + ' WIB')}</strong></span>
                            ${branch.distance_km !== null ? `<span class="text-emerald-600 font-semibold">${branch.distance_km} km</span>` : ''}
                        </div>
                        
                        <details class="text-[10px] bg-amber-50/70 rounded-xl p-2 border border-amber-200/80 group cursor-pointer">
                            <summary class="font-bold text-amber-900 flex items-center justify-between outline-none">
                                <span>🕒 Jadwal Buka (Senin - Minggu)</span>
                                <span class="text-[9px] text-amber-800 font-medium">Buka Rincian ▾</span>
                            </summary>
                            <div class="mt-1.5 pt-1 border-t border-amber-200/60 font-sans space-y-0.5">
                                ${dailyRowsHtml || `
                                    <div class="flex justify-between py-0.5"><span>Senin - Jumat:</span><span class="font-mono">${branch.open_hour || '09:00'} - ${branch.close_hour || '21:00'} WIB</span></div>
                                    <div class="flex justify-between py-0.5"><span>Sabtu - Minggu:</span><span class="font-mono">${branch.is_open_weekend ? `${branch.weekend_open_hour || '10:00'} - ${branch.weekend_close_hour || '20:00'} WIB` : 'Tutup'}</span></div>
                                `}
                            </div>
                        </details>
                    </div>
                    ${branch.is_pickup_available ? `
                        <div class="bg-emerald-50/90 p-2 rounded-xl border border-emerald-200/90 text-[11px] text-emerald-900 flex items-center justify-between">
                            <div>
                                <span class="text-[9px] font-bold text-emerald-800 block uppercase tracking-wider">SAC GO Antar-Jemput:</span>
                                <span class="font-medium">Gratis (Radius 5 km)</span>
                            </div>
                            <span class="text-[9px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                                READY
                            </span>
                        </div>
                    ` : `
                        <div class="bg-stone-50 p-1.5 rounded-xl border border-stone-200/80 text-[10px] text-stone-500">
                            Khusus Walk-in di Gerai (SAC GO Non-Aktif)
                        </div>
                    `}
                </div>
                <div class="p-2.5 bg-stone-50/90 border-t border-stone-200 flex items-center gap-2">
                    <button id="btn-detail-${branch.id}" class="flex-1 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-slate-800 text-xs font-medium border border-stone-200 shadow-xs transition">
                        Detail Layanan
                    </button>
                    <a href="https://wa.me/${branch.whatsapp_number}?text=Halo%20Shoes%20and%20Care%20${encodeURIComponent(branch.branch_name)},%20saya%20melihat%20dari%20Shoes%20and%20Care%20GIS." target="_blank" class="p-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition flex items-center gap-1 shadow-xs">
                        WA
                    </a>
                </div>
            `;

            setTimeout(() => {
                const btnDetail = popupContent.querySelector(`#btn-detail-${branch.id}`);
                if (btnDetail) {
                    btnDetail.addEventListener('click', () => {
                        onOpenBranchDetail(branch);
                    });
                }
            }, 100);

            marker.bindPopup(popupContent, { maxWidth: 300 });

            marker.on('click', () => {
                onSelectBranch(branch);
            });

            markersLayerRef.current.addLayer(marker);
        });
    }, [branches, activeBranch]);

    // Pan / Zoom ke Cabang Terpilih
    useEffect(() => {
        if (!mapInstanceRef.current || !activeBranch) return;

        mapInstanceRef.current.flyTo(
            [activeBranch.latitude, activeBranch.longitude],
            15,
            { duration: 1.2 }
        );
    }, [activeBranch]);

    // Render Marker Lokasi User (GPS)
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        if (userLocation) {
            if (userMarkerRef.current) {
                userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
            } else {
                const userIcon = L.divIcon({
                    html: `
                        <div class="relative flex items-center justify-center">
                            <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
                            <div class="absolute w-8 h-8 bg-blue-400/40 rounded-full animate-ping pointer-events-none"></div>
                        </div>
                    `,
                    className: 'user-pin-marker',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                });

                userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
                    .bindTooltip('<strong class="text-xs">Lokasi Anda</strong>', { permanent: false })
                    .addTo(mapInstanceRef.current);
            }

            mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1 });
        }
    }, [userLocation]);

    // Toggle Layer Batas Kecamatan
    useEffect(() => {
        if (!geojsonLayerRef.current || !mapInstanceRef.current) return;

        if (showDistricts) {
            if (!mapInstanceRef.current.hasLayer(geojsonLayerRef.current)) {
                mapInstanceRef.current.addLayer(geojsonLayerRef.current);
            }
        } else {
            if (mapInstanceRef.current.hasLayer(geojsonLayerRef.current)) {
                mapInstanceRef.current.removeLayer(geojsonLayerRef.current);
            }
        }
    }, [showDistricts]);

    // Toggle Buffer Zone Radius (Fase 3 Spatial Feature)
    useEffect(() => {
        if (!bufferLayerRef.current || !mapInstanceRef.current) return;

        bufferLayerRef.current.clearLayers();

        if (showBuffer) {
            branches
                .filter((b) => b.is_pickup_available)
                .forEach((branch) => {
                    const circle = L.circle([branch.latitude, branch.longitude], {
                        radius: bufferRadiusKm * 1000,
                        color: '#f59e0b',
                        fillColor: '#f59e0b',
                        fillOpacity: 0.08,
                        weight: 1.5,
                    });

                    circle.bindTooltip(
                        `Jangkauan SAC GO ${branch.branch_name} (${bufferRadiusKm} km)`,
                        { sticky: true }
                    );

                    bufferLayerRef.current.addLayer(circle);
                });
        }
    }, [showBuffer, bufferRadiusKm, branches]);

    // Toggle Heatmap / Density Circles (Fase 3 Spatial Feature)
    useEffect(() => {
        if (!heatLayerRef.current || !mapInstanceRef.current) return;

        heatLayerRef.current.clearLayers();

        if (showHeatmap) {
            branches.forEach((branch) => {
                const heatCircle = L.circle([branch.latitude, branch.longitude], {
                    radius: 2000,
                    color: '#ef4444',
                    fillColor: '#ef4444',
                    fillOpacity: 0.16,
                    weight: 0,
                });
                const innerCircle = L.circle([branch.latitude, branch.longitude], {
                    radius: 900,
                    color: '#f59e0b',
                    fillColor: '#f59e0b',
                    fillOpacity: 0.32,
                    weight: 0,
                });

                heatLayerRef.current.addLayer(heatCircle);
                heatLayerRef.current.addLayer(innerCircle);
            });
        }
    }, [showHeatmap, branches]);

    // Auto-fit bounds saat cabang difilter (berdasarkan kecamatan / search)
    useEffect(() => {
        if (!mapInstanceRef.current || !branches || branches.length === 0) return;

        // Jika terfilter (kurang dari 65 cabang), fokuskan peta ke kelompok cabang yang cocok
        if (branches.length < 65) {
            const validBranches = branches.filter((b) => b.latitude && b.longitude);
            if (validBranches.length > 0) {
                const bounds = L.latLngBounds(validBranches.map((b) => [b.latitude, b.longitude]));
                if (bounds.isValid()) {
                    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, duration: 1 });
                }
            }
        }
    }, [branches]);

    // Fit seluruh Indonesia (semua 69 cabang)
    const handleFitAll = () => {
        if (!mapInstanceRef.current || !branches || branches.length === 0) return;
        const validBranches = branches.filter((b) => b.latitude && b.longitude);
        if (validBranches.length > 0) {
            const bounds = L.latLngBounds(validBranches.map((b) => [b.latitude, b.longitude]));
            if (bounds.isValid()) {
                mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], duration: 1.2 });
            }
        }
    };

    // Reset center to Kota Bekasi
    const handleResetCenter = () => {
        if (!mapInstanceRef.current) return;
        mapInstanceRef.current.flyTo([-6.2383, 106.9756], 12, { duration: 1 });
    };

    return (
        <div className="relative flex-1 h-[calc(100vh-53px)] bg-[#f8fafc] overflow-hidden">
            {/* Leaflet Map Canvas */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Floating Map Workbench Dock (Top-Right) */}
            <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                {/* Floating Workbench Card */}
                <div className="bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-3.5 w-64 space-y-3 text-xs text-slate-700">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                            <Layers className="w-4 h-4 text-amber-600" strokeWidth={1.75} />
                            <span>Lapisan Peta GIS</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleFitAll}
                                className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-[10px] font-semibold text-slate-700 transition border border-stone-200/80"
                                title="Lihat Sebaran Seluruh Indonesia"
                            >
                                Indonesia
                            </button>
                            <button
                                onClick={handleResetCenter}
                                className="p-1 rounded-lg hover:bg-stone-100 text-slate-400 hover:text-slate-800 transition"
                                title="Fokus Area Bekasi"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Basemap Segment Control */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider">
                            Pilihan Basemap:
                        </label>
                        <div className="grid grid-cols-3 gap-1 bg-stone-100/80 p-1 rounded-xl border border-stone-200/70">
                            {Object.entries(basemaps).map(([key, item]) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveBasemap(key)}
                                    className={`py-1 rounded-lg text-[11px] font-medium transition text-center ${
                                        activeBasemap === key
                                            ? 'bg-white text-slate-900 font-bold shadow-xs border border-stone-200/50'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* GIS Overlay Toggles */}
                    <div className="space-y-2 pt-1 border-t border-stone-100">
                        <label className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider">
                            Analisis Spasial:
                        </label>

                        {/* Batas Kecamatan */}
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-slate-700 group-hover:text-slate-900 transition">Batas 12 Kecamatan</span>
                            <input
                                type="checkbox"
                                checked={showDistricts}
                                onChange={(e) => setShowDistricts(e.target.checked)}
                                className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            />
                        </label>

                        {/* Buffer Jangkauan */}
                        <div className="space-y-1.5">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-slate-700 group-hover:text-slate-900 transition">Buffer Jangkauan Layanan</span>
                                <input
                                    type="checkbox"
                                    checked={showBuffer}
                                    onChange={(e) => setShowBuffer(e.target.checked)}
                                    className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                />
                            </label>
                            {showBuffer && (
                                <div className="pl-2 pt-1 border-l-2 border-amber-400 space-y-1">
                                    <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                                        <span>Radius Servis:</span>
                                        <span className="text-amber-700 font-bold">{bufferRadiusKm} km</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="5.0"
                                        step="0.5"
                                        value={bufferRadiusKm}
                                        onChange={(e) => setBufferRadiusKm(parseFloat(e.target.value))}
                                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Heatmap Densitas */}
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-slate-700 group-hover:text-slate-900 transition">Heatmap Kepadatan Gerai</span>
                            <input
                                type="checkbox"
                                checked={showHeatmap}
                                onChange={(e) => setShowHeatmap(e.target.checked)}
                                className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
