<?php

use App\Http\Controllers\ShoeCareMapController;
use Illuminate\Support\Facades\Route;

Route::get('/', [ShoeCareMapController::class, 'index'])->name('map.index');
Route::post('/branches', [ShoeCareMapController::class, 'storeBranch'])->name('branches.store');
Route::post('/branches/{branch}/special-treatments', [ShoeCareMapController::class, 'storeSpecialTreatment'])->name('branches.special-treatments.store');
