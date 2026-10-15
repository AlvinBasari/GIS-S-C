<!DOCTYPE html>
<html lang="id" class="h-full bg-[#f8fafc] text-slate-800 antialiased">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>{{ config('app.name', 'Shoes and Care GIS') }}</title>
    <link rel="icon" type="image/png" href="/images/logo.png">
    <meta name="description" content="Shoes and Care GIS - Sistem Informasi Geografis & Layanan Antar-Jemput SAC GO Kota Bekasi. Cuci sepatu premium bergaransi #1 di Indonesia.">

    <!-- Google Fonts: Plus Jakarta Sans & JetBrains Mono -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="h-full bg-[#f8fafc] font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 overflow-x-hidden selection:bg-amber-500 selection:text-white">
    @inertia
</body>
</html>
