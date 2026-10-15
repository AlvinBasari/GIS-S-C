<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\BranchTreatment;
use App\Models\District;
use App\Models\MasterTreatment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ShoeCareBekasiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Wilayah & Kecamatan Resmi (12 Kecamatan Kota Bekasi + Kota/Wilayah Seluruh Indonesia)
        $districts = [
            // 12 Kecamatan Kota Bekasi
            [
                'name' => 'Bekasi Selatan',
                'center_lat' => -6.2625000,
                'center_lng' => 106.9856000,
                'color_code' => '#f59e0b',
                'description' => 'Sentra perbelanjaan, hunian modern Grand Galaxy, dan kawasan kuliner aktif.',
            ],
            [
                'name' => 'Bekasi Barat',
                'center_lat' => -6.2361000,
                'center_lng' => 106.9744000,
                'color_code' => '#3b82f6',
                'description' => 'Kawasan strategis perbatasan DKI Jakarta (Kranji, Bintara, Grand Kota Bintang).',
            ],
            [
                'name' => 'Bekasi Utara',
                'center_lat' => -6.2089000,
                'center_lng' => 107.0019000,
                'color_code' => '#10b981',
                'description' => 'Kawasan mandiri prestisius Summarecon Bekasi, Harapan Baru, dan pusat gaya hidup.',
            ],
            [
                'name' => 'Bekasi Timur',
                'center_lat' => -6.2482000,
                'center_lng' => 107.0125000,
                'color_code' => '#ec4899',
                'description' => 'Pusat pemerintahan kota, stasiun KRL Bekasi Timur, dan terminal utama.',
            ],
            [
                'name' => 'Medan Satria',
                'center_lat' => -6.1833000,
                'center_lng' => 106.9833000,
                'color_code' => '#8b5cf6',
                'description' => 'Kawasan modern Kota Harapan Indah dengan komunitas dan industri dinamis.',
            ],
            [
                'name' => 'Rawalumbu',
                'center_lat' => -6.2750000,
                'center_lng' => 107.0083000,
                'color_code' => '#06b6d4',
                'description' => 'Kawasan residensial elite Kemang Pratama dan hunian Rawalumbu yang asri.',
            ],
            [
                'name' => 'Jatiasih',
                'center_lat' => -6.3050000,
                'center_lng' => 106.9633000,
                'color_code' => '#f97316',
                'description' => 'Kawasan penyangga utama akses tol JORR dengan pertumbuhan kafe & komersial pesat.',
            ],
            [
                'name' => 'Pondok Gede',
                'center_lat' => -6.2833000,
                'center_lng' => 106.9167000,
                'color_code' => '#14b8a6',
                'description' => 'Gerbang barat penghubung Bekasi dan Jakarta Timur (Jatiwaringin & Asrama Haji).',
            ],
            [
                'name' => 'Jatisampurna',
                'center_lat' => -6.3667000,
                'center_lng' => 106.9333000,
                'color_code' => '#6366f1',
                'description' => 'Kawasan koridor Transyogi Cibubur, mall, apartemen, dan perumahan modern.',
            ],
            [
                'name' => 'Mustika Jaya',
                'center_lat' => -6.3000000,
                'center_lng' => 107.0333000,
                'color_code' => '#eab308',
                'description' => 'Kawasan pemukiman berkembang pesat seperti Grand Wisata sisi barat dan Cimuning.',
            ],
            [
                'name' => 'Pondok Melati',
                'center_lat' => -6.3167000,
                'center_lng' => 106.9333000,
                'color_code' => '#84cc16',
                'description' => 'Wilayah perbatasan Jatiwarna, Jatimurni, dan akses pintu keluar tol JORR.',
            ],
            [
                'name' => 'Bantar Gebang',
                'center_lat' => -6.3333000,
                'center_lng' => 106.9833000,
                'color_code' => '#a855f7',
                'description' => 'Kawasan industri Jalan Raya Narogong dan pemukiman komersial sekitarnya.',
            ],

            // Wilayah Resmi Shoes and Care Nasional
            [
                'name' => 'Jakarta Selatan',
                'center_lat' => -6.2614930,
                'center_lng' => 106.8105990,
                'color_code' => '#ef4444',
                'description' => 'Sentra gaya hidup DKI Jakarta: Tebet, Gandaria, Lebak Bulus, dan koridor Gatot Subroto.',
            ],
            [
                'name' => 'Jakarta Timur',
                'center_lat' => -6.2250140,
                'center_lng' => 106.9004470,
                'color_code' => '#f43f5e',
                'description' => 'Kawasan Rawamangun, Pasar Rebo, dan simpul transportasi strategis Jakarta Timur.',
            ],
            [
                'name' => 'Jakarta Barat',
                'center_lat' => -6.1683290,
                'center_lng' => 106.7588490,
                'color_code' => '#d946ef',
                'description' => 'Kawasan perumahan elite Puri Kembangan dan sentra kuliner Tanjung Duren.',
            ],
            [
                'name' => 'Tangerang & Tangsel',
                'center_lat' => -6.2818960,
                'center_lng' => 106.6784920,
                'color_code' => '#0ea5e9',
                'description' => 'Kawasan modern Bintaro, Alam Sutera, Gading Serpong, Cikupa, dan Kota Tangerang.',
            ],
            [
                'name' => 'Kota Bandung',
                'center_lat' => -6.9174640,
                'center_lng' => 107.6191230,
                'color_code' => '#3b82f6',
                'description' => 'Pusat tren mode Bandung: Jl. Progo, Naripan, Batununggal, Antapani, Mekarwangi, dll.',
            ],
            [
                'name' => 'Kabupaten Bandung & Cimahi',
                'center_lat' => -6.8722740,
                'center_lng' => 107.5420420,
                'color_code' => '#2563eb',
                'description' => 'Kawasan Kota Cimahi, Kota Baru Parahyangan (KBP), dan Kopo Sukamenak.',
            ],
            [
                'name' => 'Depok & Bogor',
                'center_lat' => -6.4024840,
                'center_lng' => 106.7942410,
                'color_code' => '#059669',
                'description' => 'Kawasan pendidikan Margonda Raya, Bojongsari Depok, dan sentra wisata Kota Bogor.',
            ],
            [
                'name' => 'Karawang & Tasikmalaya',
                'center_lat' => -6.3042450,
                'center_lng' => 107.3075840,
                'color_code' => '#10b981',
                'description' => 'Kawasan pusat industri Karawang dan sentra niaga Tasikmalaya.',
            ],
            [
                'name' => 'Kota Yogyakarta',
                'center_lat' => -7.7955800,
                'center_lng' => 110.3694900,
                'color_code' => '#d97706',
                'description' => 'Kota kelahiran Shoes and Care: Headquarter Sagan, Alun-alun Kidul, dan Gondokusuman.',
            ],
            [
                'name' => 'Sleman & Bantul',
                'center_lat' => -7.7681200,
                'center_lng' => 110.3842100,
                'color_code' => '#b45309',
                'description' => 'Kawasan Ambarrukmo Plaza, Pakuwon Mall Jogja, dan Kasihan Bantul.',
            ],
            [
                'name' => 'Solo / Surakarta & Sukoharjo',
                'center_lat' => -7.5754890,
                'center_lng' => 110.8243260,
                'color_code' => '#f59e0b',
                'description' => 'Kawasan Solo Fajar Indah, Jebres, Laweyan, dan kawasan mandiri Solobaru.',
            ],
            [
                'name' => 'Kota Semarang',
                'center_lat' => -7.0051450,
                'center_lng' => 110.4381250,
                'color_code' => '#ca8a04',
                'description' => 'Kawasan Tembalang (Undip) dan sentra komersial Kota Semarang.',
            ],
            [
                'name' => 'Purwokerto',
                'center_lat' => -7.4243410,
                'center_lng' => 109.2302320,
                'color_code' => '#eab308',
                'description' => 'Sentra perkotaan Purwokerto dan Banyumas Raya.',
            ],
            [
                'name' => 'Kota Surabaya',
                'center_lat' => -7.2574720,
                'center_lng' => 112.7520880,
                'color_code' => '#6366f1',
                'description' => 'Metropolis Jawa Timur: Surabaya Timur, Pakuwon City, dan Surabaya Selatan.',
            ],
            [
                'name' => 'Kota Malang',
                'center_lat' => -7.9666200,
                'center_lng' => 112.6326320,
                'color_code' => '#8b5cf6',
                'description' => 'Kota pendidikan dan wisata Malang, Jawa Timur.',
            ],
            [
                'name' => 'Denpasar & Badung (Bali)',
                'center_lat' => -8.6704580,
                'center_lng' => 115.2126290,
                'color_code' => '#14b8a6',
                'description' => 'Kawasan Denpasar (Kreneng, Ubung, Dewata) dan pusat pariwisata Bali.',
            ],
            [
                'name' => 'Kota Makassar',
                'center_lat' => -5.1476650,
                'center_lng' => 119.4327320,
                'color_code' => '#06b6d4',
                'description' => 'Gerbang Indonesia Timur: Gerai Makassar 1 dan Makassar 2.',
            ],
            [
                'name' => 'Kota Manado',
                'center_lat' => 1.4748300,
                'center_lng' => 124.8420790,
                'color_code' => '#0284c7',
                'description' => 'Pusat gaya hidup dan maritim Kota Manado, Sulawesi Utara.',
            ],
            [
                'name' => 'Kota Banjarmasin',
                'center_lat' => -3.3166940,
                'center_lng' => 114.5901110,
                'color_code' => '#16a34a',
                'description' => 'Sentra niaga dan pemukiman Kota Banjarmasin, Kalimantan Selatan.',
            ],
            [
                'name' => 'Kota Samarinda',
                'center_lat' => -0.5021060,
                'center_lng' => 117.1537090,
                'color_code' => '#15803d',
                'description' => 'Ibu kota Kalimantan Timur dan simpul penyangga IKN.',
            ],
            [
                'name' => 'Bandar Lampung',
                'center_lat' => -5.4297410,
                'center_lng' => 105.2624970,
                'color_code' => '#ea580c',
                'description' => 'Gerbang Pulau Sumatera di Kota Bandar Lampung.',
            ],
        ];

        $districtMap = [];
        foreach ($districts as $d) {
            $created = District::updateOrCreate(
                ['name' => $d['name']],
                [
                    'slug' => Str::slug($d['name']),
                    'center_lat' => $d['center_lat'],
                    'center_lng' => $d['center_lng'],
                    'color_code' => $d['color_code'],
                    'description' => $d['description'],
                ]
            );
            $districtMap[$d['name']] = $created->id;
        }

        // 2. Master Treatments Resmi Shoes and Care (Sumber: shoesandcare.com)
        $masterTreatments = [
            [
                'category' => 'Cleaning',
                'name' => 'Fast Cleaning',
                'description' => 'Pencucian instan pada bagian upper dan midsole yang bisa ditunggu selama 15-30 menit.',
                'default_price' => 30000,
                'est_duration' => '15 - 30 Menit',
                'icon' => 'Zap',
                'is_popular' => true,
            ],
            [
                'category' => 'Cleaning',
                'name' => 'Deep Cleaning',
                'description' => 'Perawatan pembersihan sepatu secara detail dan menyeluruh pada seluruh bagian luar dan dalam.',
                'default_price' => 50000,
                'est_duration' => '1 - 3 Hari',
                'icon' => 'Sparkles',
                'is_popular' => true,
            ],
            [
                'category' => 'Treatment',
                'name' => 'Premium Treatment',
                'description' => 'Perawatan yang pengerjaannya ditujukan untuk sepatu dengan material-material khusus (suede, leather, nubuck).',
                'default_price' => 90000,
                'est_duration' => '2 - 3 Hari',
                'icon' => 'ShieldCheck',
                'is_popular' => true,
            ],
            [
                'category' => 'Treatment',
                'name' => 'Unyellowing',
                'description' => 'Perawatan yang dikhususkan untuk midsole sepatu yang telah menguning agar kembali cerah putih.',
                'default_price' => 100000,
                'est_duration' => '2 - 4 Hari',
                'icon' => 'Sun',
                'is_popular' => true,
            ],
            [
                'category' => 'Restoration',
                'name' => 'Repaint',
                'description' => 'Perawatan restorasi warna dengan penggunaan cat khusus yang ditujukan untuk mengembalikan warna awal sepatu seperti semula.',
                'default_price' => 185000,
                'est_duration' => '3 - 5 Hari',
                'icon' => 'Palette',
                'is_popular' => true,
            ],
            [
                'category' => 'Repair',
                'name' => 'Repair & Reglue Sol',
                'description' => 'Perbaikan sol lepas, pengeleman ulang presisi dengan lem standar industri, dan perbaikan struktur sepatu.',
                'default_price' => 80000,
                'est_duration' => '3 - 5 Hari',
                'icon' => 'Hammer',
                'is_popular' => false,
            ],
        ];

        $masterMap = [];
        foreach ($masterTreatments as $mt) {
            $createdMt = MasterTreatment::updateOrCreate(
                ['name' => $mt['name']],
                [
                    'category' => $mt['category'],
                    'slug' => Str::slug($mt['name']),
                    'description' => $mt['description'],
                    'default_price' => $mt['default_price'],
                    'est_duration' => $mt['est_duration'],
                    'icon' => $mt['icon'],
                    'is_popular' => $mt['is_popular'],
                    'is_active' => true,
                ]
            );
            $masterMap[$mt['name']] = $createdMt;
        }

        // 3. Muat 69 Data Cabang Resmi Shoes and Care Indonesia
        $jsonPath = database_path('seeders/shoes_and_care_69_branches.json');
        if (File::exists($jsonPath)) {
            $branchesData = json_decode(File::get($jsonPath), true);
        } else {
            $branchesData = [];
        }

        foreach ($branchesData as $bData) {
            $districtId = $districtMap[$bData['district']] ?? ($districtMap['Bekasi Selatan'] ?? 1);
            $slug = Str::slug(($bData['brand_name'] ?? 'Shoes and Care').' '.$bData['branch_name']);

            $branch = Branch::updateOrCreate(
                ['branch_name' => $bData['branch_name']],
                [
                    'slug' => $slug,
                    'district_id' => $districtId,
                    'brand_name' => $bData['brand_name'] ?? 'Shoes and Care',
                    'full_address' => $bData['full_address'],
                    'benchmark_notes' => $bData['benchmark_notes'] ?? null,
                    'kelurahan' => $bData['kelurahan'] ?? 'Pusat',
                    'postal_code' => $bData['postal_code'] ?? '10000',
                    'latitude' => $bData['latitude'],
                    'longitude' => $bData['longitude'],
                    'phone_number' => $bData['phone_number'] ?? null,
                    'whatsapp_number' => $bData['whatsapp_number'] ?? '6285161667972',
                    'instagram_handle' => $bData['instagram_handle'] ?? 'shoesandcare',
                    'gmaps_url' => $bData['gmaps_url'] ?? null,
                    'rating' => $bData['rating'] ?? 4.8,
                    'review_count' => $bData['review_count'] ?? 100,
                    'open_hour' => $bData['open_hour'] ?? '09:00',
                    'close_hour' => $bData['close_hour'] ?? '21:00',
                    'weekend_open_hour' => $bData['weekend_open_hour'] ?? '10:00',
                    'weekend_close_hour' => $bData['weekend_close_hour'] ?? '20:00',
                    'is_open_weekend' => $bData['is_open_weekend'] ?? true,
                    'gmaps_opening_hours_text' => $bData['gmaps_opening_hours_text'] ?? null,
                    'operating_hours_daily' => $bData['operating_hours_daily'] ?? null,
                    'is_pickup_available' => $bData['is_pickup_available'] ?? true,
                    'pickup_coverage' => $bData['pickup_coverage'] ?? 'Radius 5 km (Layanan Jemput & Antar Gratis / SAC GO)',
                    'image_url' => $bData['image_url'] ?? 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
                    'is_active' => true,
                ]
            );

            // Seed 6 Master Treatments resmi ke setiap cabang
            foreach ($masterTreatments as $mt) {
                BranchTreatment::updateOrCreate(
                    [
                        'branch_id' => $branch->id,
                        'name' => $mt['name'],
                    ],
                    [
                        'master_treatment_id' => $masterMap[$mt['name']]->id,
                        'treatment_type' => 'UMUM',
                        'category' => $mt['category'],
                        'description' => $mt['description'],
                        'price' => $mt['default_price'],
                        'est_duration' => $mt['est_duration'],
                        'is_available' => true,
                        'is_featured' => $mt['is_popular'],
                        'badge_label' => 'Layanan Resmi SAC',
                        'notes' => null,
                    ]
                );
            }

            // Layanan Khusus: SAC GO (Fitur Antar-Jemput - Eksklusif Wilayah Jakarta & Yogyakarta)
            if ($branch->is_pickup_available) {
                BranchTreatment::updateOrCreate(
                    [
                        'branch_id' => $branch->id,
                        'name' => 'SAC GO (Fitur Antar-Jemput)',
                    ],
                    [
                        'master_treatment_id' => null,
                        'treatment_type' => 'KHUSUS',
                        'category' => 'Antar-Jemput',
                        'description' => 'Layanan jemput dan antar gratis hingga radius 5 km dari gerai (Wilayah Jakarta & Yogyakarta). Dikerjakan oleh teknisi ahli Shoes and Care dengan jaminan garansi.',
                        'price' => 0,
                        'est_duration' => 'Same Day / Sesuai Jadwal',
                        'is_available' => true,
                        'is_featured' => true,
                        'badge_label' => 'SAC GO Aktif',
                        'notes' => 'Pemesanan antar-jemput mudah langsung via aplikasi Shoes and Care GIS.',
                    ]
                );
            } else {
                BranchTreatment::where('branch_id', $branch->id)
                    ->where('name', 'like', '%SAC GO%')
                    ->delete();
            }
        }
    }
}
