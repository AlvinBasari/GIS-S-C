import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import Navbar from '../Components/Navbar';
import Sidebar from '../Components/Sidebar';
import MapView from '../Components/MapView';
import BranchDetailModal from '../Components/BranchDetailModal';
import PriceCalculatorModal from '../Components/PriceCalculatorModal';
import BookingModal from '../Components/BookingModal';

export default function ShoeCareMap({
    branches = [],
    districts = [],
    masterTreatments = [],
    spatialStats = {},
    filters = {}
}) {
    // State Filter & Pencarian
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedDistrict, setSelectedDistrict] = useState(filters.district_id || 'all');
    const [filterSpecialOnly, setFilterSpecialOnly] = useState(false);
    const [selectedTreatmentCategory, setSelectedTreatmentCategory] = useState('all');

    // State Interaksi Cabang & Peta
    const [activeBranch, setActiveBranch] = useState(null);

    // State GPS User Geolocation
    const [userLocation, setUserLocation] = useState(
        filters.user_lat && filters.user_lng 
            ? { lat: Number(filters.user_lat), lng: Number(filters.user_lng) } 
            : null
    );
    const [isLocating, setIsLocating] = useState(false);

    // State Modal Dialogs (Pelanggan)
    const [detailModalBranch, setDetailModalBranch] = useState(null);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [calculatorInitialBranch, setCalculatorInitialBranch] = useState(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [bookingInitialBranch, setBookingInitialBranch] = useState(null);
    const [bookingInitialTreatments, setBookingInitialTreatments] = useState([]);
    const [bookingInitialPairCount, setBookingInitialPairCount] = useState(1);
    const [bookingInitialShoeType, setBookingInitialShoeType] = useState('Sneakers Casual / Canvas');

    // Fungsi Trigger GPS Geolocation
    const handleLocateUser = () => {
        if (!navigator.geolocation) {
            alert('Browser Anda tidak mendukung deteksi lokasi geolokasi.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };
                setUserLocation(coords);
                setIsLocating(false);

                // Kirim koordinat ke controller via Inertia visit untuk kalkulasi jarak Haversine
                router.get('/', {
                    ...filters,
                    user_lat: coords.lat,
                    user_lng: coords.lng,
                }, {
                    preserveState: true,
                    preserveScroll: true,
                });
            },
            (err) => {
                console.warn('Gagal mendapatkan GPS:', err.message);
                setIsLocating(false);
                alert('Tidak dapat mengakses lokasi perangkat. Menggunakan lokasi default.');
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    // Filter Cabang secara responsif di Frontend
    const filteredBranches = useMemo(() => {
        return branches.filter((branch) => {
            // Filter Kecamatan
            if (selectedDistrict !== 'all' && branch.district_id !== Number(selectedDistrict)) {
                return false;
            }

            // Filter SAC GO Antar-Jemput
            if (filterSpecialOnly && !branch.is_pickup_available) {
                return false;
            }

            // Filter Kategori Treatment
            if (selectedTreatmentCategory !== 'all') {
                const hasInSpecial = branch.special_treatments?.some(
                    (st) => st.category.toLowerCase().includes(selectedTreatmentCategory.toLowerCase())
                );
                const hasInGeneral = branch.general_treatments?.some(
                    (gt) => gt.category.toLowerCase().includes(selectedTreatmentCategory.toLowerCase())
                );
                if (!hasInSpecial && !hasInGeneral) {
                    return false;
                }
            }

            // Filter Search Query
            if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase();
                const matchName = branch.brand_name.toLowerCase().includes(query) || 
                                  branch.branch_name.toLowerCase().includes(query);
                const matchAddress = branch.full_address.toLowerCase().includes(query) || 
                                     (branch.benchmark_notes && branch.benchmark_notes.toLowerCase().includes(query)) ||
                                     branch.kelurahan.toLowerCase().includes(query) ||
                                     branch.district_name.toLowerCase().includes(query);
                const matchSpecial = branch.special_treatments?.some((st) => 
                    st.name.toLowerCase().includes(query) || st.description.toLowerCase().includes(query)
                );
                const matchGeneral = branch.general_treatments?.some((gt) => 
                    gt.name.toLowerCase().includes(query)
                );

                if (!matchName && !matchAddress && !matchSpecial && !matchGeneral) {
                    return false;
                }
            }

            return true;
        });
    }, [branches, selectedDistrict, filterSpecialOnly, selectedTreatmentCategory, searchQuery]);

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
            <Head title="Shoes and Care GIS - Layanan Cuci Sepatu & Antar-Jemput SAC GO" />

            {/* Top Navigation Konsumen */}
            <Navbar
                totalBranches={branches.length}
                totalDistricts={districts.length}
                onOpenCalculator={() => {
                    setCalculatorInitialBranch(activeBranch || branches[0]);
                    setIsCalculatorOpen(true);
                }}
                onOpenBooking={() => {
                    setBookingInitialBranch(activeBranch || branches[0]);
                    setIsBookingOpen(true);
                }}
                onLocateUser={handleLocateUser}
                isLocating={isLocating}
                userLocation={userLocation}
            />

            {/* Main Interactive Screen (Split: Left Drawer + Right GIS Canvas) */}
            <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
                {/* Left Sidebar Drawer */}
                <Sidebar
                    branches={filteredBranches}
                    districts={districts}
                    selectedDistrict={selectedDistrict}
                    setSelectedDistrict={setSelectedDistrict}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filterSpecialOnly={filterSpecialOnly}
                    setFilterSpecialOnly={setFilterSpecialOnly}
                    selectedTreatmentCategory={selectedTreatmentCategory}
                    setSelectedTreatmentCategory={setSelectedTreatmentCategory}
                    activeBranch={activeBranch}
                    onSelectBranch={(branch) => setActiveBranch(branch)}
                    onOpenBranchDetail={(branch) => setDetailModalBranch(branch)}
                    userLocation={userLocation}
                />

                {/* Right Interactive GIS Map */}
                <MapView
                    branches={filteredBranches}
                    districts={districts}
                    activeBranch={activeBranch}
                    onSelectBranch={(branch) => setActiveBranch(branch)}
                    onOpenBranchDetail={(branch) => setDetailModalBranch(branch)}
                    userLocation={userLocation}
                />
            </div>

            {/* Modals Konsumen */}
            {detailModalBranch && (
                <BranchDetailModal
                    branch={detailModalBranch}
                    onClose={() => setDetailModalBranch(null)}
                    onOpenCalculatorWithBranch={(branch) => {
                        setCalculatorInitialBranch(branch);
                        setIsCalculatorOpen(true);
                    }}
                    onOpenBookingWithBranch={(branch) => {
                        setBookingInitialBranch(branch);
                        setBookingInitialTreatments([]);
                        setIsBookingOpen(true);
                        setDetailModalBranch(null);
                    }}
                />
            )}

            {isCalculatorOpen && (
                <PriceCalculatorModal
                    branches={branches}
                    initialBranch={calculatorInitialBranch}
                    onClose={() => setIsCalculatorOpen(false)}
                    onProceedToBooking={(branch, treatmentIds, pairs, shoeType) => {
                        setBookingInitialBranch(branch);
                        setBookingInitialTreatments(treatmentIds);
                        setBookingInitialPairCount(pairs);
                        setBookingInitialShoeType(shoeType);
                        setIsBookingOpen(true);
                        setIsCalculatorOpen(false);
                    }}
                />
            )}

            {isBookingOpen && (
                <BookingModal
                    branches={branches}
                    initialBranch={bookingInitialBranch}
                    initialTreatments={bookingInitialTreatments}
                    initialPairCount={bookingInitialPairCount}
                    initialShoeType={bookingInitialShoeType}
                    onClose={() => {
                        setIsBookingOpen(false);
                        setBookingInitialTreatments([]);
                    }}
                    userLocation={userLocation}
                />
            )}
        </div>
    );
}
