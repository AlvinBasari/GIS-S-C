<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Tampilkan form login Shoes and Care.
     */
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->isSuperAdmin()) {
                return redirect()->route('admin.dashboard');
            }
            if ($user->isBranchUser()) {
                return redirect()->route('branch.dashboard');
            }
        }

        return Inertia::render('Auth/Login');
    }

    /**
     * Proses autentikasi pengguna.
     */
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            $user = Auth::user();

            if (! $user->is_active) {
                Auth::logout();

                return back()->withErrors([
                    'email' => 'Akun Anda dinonaktifkan. Silakan hubungi manajemen Shoes and Care.',
                ]);
            }

            if ($user->isSuperAdmin()) {
                return redirect()->intended(route('admin.dashboard'))->with('success', "Selamat datang kembali, {$user->name} (HQ Pusat)!");
            }

            return redirect()->intended(route('branch.dashboard'))->with('success', "Selamat datang kembali, {$user->name}!");
        }

        return back()->withErrors([
            'email' => 'Email atau password yang Anda masukkan tidak sesuai.',
        ])->onlyInput('email');
    }

    /**
     * Proses logout.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('map.index')->with('success', 'Anda telah berhasil keluar.');
    }
}
