<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BranchPortalController;
use App\Http\Controllers\CustomerOrderController;
use App\Http\Controllers\ShoeCareMapController;
use Illuminate\Support\Facades\Route;

// ==========================================
// 1. RUTE PUBLIK (KONSUMEN & WEB GIS)
// ==========================================
Route::get('/', [ShoeCareMapController::class, 'index'])->name('map.index');
Route::post('/branches', [ShoeCareMapController::class, 'storeBranch'])->name('branches.store');
Route::post('/branches/{branch}/special-treatments', [ShoeCareMapController::class, 'storeSpecialTreatment'])->name('branches.special-treatments.store');
Route::post('/branches/{branch}/toggle-sac-go', [ShoeCareMapController::class, 'toggleSacGo'])->name('branches.toggle-sac-go');

// Alur Konsumen: Booking & Tracking Real-Time
Route::post('/booking', [CustomerOrderController::class, 'bookOrder'])->name('customer.booking');
Route::get('/track', [CustomerOrderController::class, 'trackPage'])->name('track.index');

// Autentikasi Pengguna
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// ==========================================
// 2. ALUR ADMIN PANEL PUSAT (SUPER ADMIN / HQ)
// ==========================================
Route::middleware(['auth', 'role:superadmin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/map', [AdminDashboardController::class, 'mapView'])->name('map');
    Route::post('/branches', [AdminDashboardController::class, 'storeBranch'])->name('branches.store');
    Route::put('/branches/{branch}', [AdminDashboardController::class, 'updateBranch'])->name('branches.update');
    Route::delete('/branches/{branch}', [AdminDashboardController::class, 'deleteBranch'])->name('branches.delete');
    Route::post('/branches/{branch}/toggle-sac-go', [AdminDashboardController::class, 'toggleSacGo'])->name('branches.toggle-sac-go');
    Route::post('/managers', [AdminDashboardController::class, 'storeBranchManager'])->name('managers.store');
    Route::post('/treatments', [AdminDashboardController::class, 'storeMasterTreatment'])->name('treatments.store');
    Route::put('/treatments/{treatment}', [AdminDashboardController::class, 'updateMasterTreatment'])->name('treatments.update');
    Route::put('/branch-treatments/{branchTreatment}', [AdminDashboardController::class, 'updateBranchTreatment'])->name('branch-treatments.update');
});

// ==========================================
// 3. ALUR AKUN CABANG (KEPALA CABANG & STAFF)
// ==========================================
Route::middleware(['auth', 'role:branch_manager,branch_staff'])->prefix('branch')->name('branch.')->group(function () {
    Route::get('/', [BranchPortalController::class, 'index'])->name('dashboard');
    Route::post('/toggle-sac-go', [BranchPortalController::class, 'toggleSacGo'])->name('toggle-sac-go');
    Route::post('/orders/{order}/status', [BranchPortalController::class, 'updateOrderStatus'])->name('orders.status');
    Route::post('/orders/{order}/photos', [BranchPortalController::class, 'uploadOrderPhotos'])->name('orders.photos');
    Route::post('/special-treatments', [BranchPortalController::class, 'storeSpecialTreatment'])->name('special-treatments.store');

    // Manajemen Staf oleh Kepala Cabang
    Route::post('/staff', [BranchPortalController::class, 'storeStaff'])->name('staff.store');
    Route::delete('/staff/{staff}', [BranchPortalController::class, 'deleteStaff'])->name('staff.delete');

    // Manajemen Jam Buka Operasional oleh Kepala Cabang
    Route::put('/operating-hours', [BranchPortalController::class, 'updateOperatingHours'])->name('operating-hours.update');
});
