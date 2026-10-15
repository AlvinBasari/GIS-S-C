import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
    Lock, 
    Mail, 
    ArrowRight, 
    ShieldCheck, 
    Building2, 
    UserCheck, 
    MapPin, 
    ArrowLeft 
} from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const [selectedRoleHint, setSelectedRoleHint] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    const setQuickAccount = (email, roleLabel) => {
        setData({
            email: email,
            password: 'password',
            remember: true,
        });
        setSelectedRoleHint(roleLabel);
    };

    return (
        <div className="min-h-screen bg-[#fcfbf9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif]">
            <Head title="Masuk Akun - Shoes and Care GIS" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-2.5 group">
                        <div className="w-12 h-12 rounded-2xl bg-black border border-stone-200/90 flex items-center justify-center p-1 shadow-sm group-hover:scale-105 transition">
                            <img src="/images/logo.png" alt="Shoes and Care" className="w-full h-full object-contain" />
                        </div>
                    </Link>
                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                        Shoes and Care <span className="text-amber-600">GIS Portal</span>
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Masuk untuk mengelola operasional gerai, pemrosesan pesanan, dan analitik nasional
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 border border-stone-200/90 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] space-y-6">
                    {/* Quick Demo Selector */}
                    <div className="space-y-2">
                        <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
                            Pilih Akses Akun:
                        </span>
                        <div className="grid grid-cols-3 gap-1.5 text-xs">
                            <button
                                type="button"
                                onClick={() => setQuickAccount('admin@shoesandcare.com', 'Super Admin (Pusat HQ)')}
                                className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                                    selectedRoleHint === 'Super Admin (Pusat HQ)'
                                        ? 'bg-amber-50 text-amber-900 border-amber-400 font-semibold shadow-xs ring-1 ring-amber-300'
                                        : 'bg-stone-50 hover:bg-stone-100/80 text-slate-700 border-stone-200/80'
                                }`}
                            >
                                <ShieldCheck className="w-4 h-4 text-amber-600" />
                                <span className="text-[11px] leading-tight">Admin Pusat (HQ)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setQuickAccount('kepala.galaxy@shoesandcare.com', 'Kepala Cabang (Galaxy)')}
                                className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                                    selectedRoleHint === 'Kepala Cabang (Galaxy)'
                                        ? 'bg-blue-50 text-blue-900 border-blue-400 font-semibold shadow-xs ring-1 ring-blue-300'
                                        : 'bg-stone-50 hover:bg-stone-100/80 text-slate-700 border-stone-200/80'
                                }`}
                            >
                                <Building2 className="w-4 h-4 text-blue-600" />
                                <span className="text-[11px] leading-tight">Kepala Cabang</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setQuickAccount('staff.galaxy@shoesandcare.com', 'Staff Cuci (Galaxy)')}
                                className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                                    selectedRoleHint === 'Staff Cuci (Galaxy)'
                                        ? 'bg-emerald-50 text-emerald-900 border-emerald-400 font-semibold shadow-xs ring-1 ring-emerald-300'
                                        : 'bg-stone-50 hover:bg-stone-100/80 text-slate-700 border-stone-200/80'
                                }`}
                            >
                                <UserCheck className="w-4 h-4 text-emerald-600" />
                                <span className="text-[11px] leading-tight">Staff Gerai</span>
                            </button>
                        </div>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                Email Terdaftar
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nama@shoesandcare.com"
                                    className="w-full pl-9 pr-3 py-2 bg-stone-50/60 border border-stone-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition font-sans"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-9 pr-3 py-2 bg-stone-50/60 border border-stone-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition font-sans"
                                />
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-[11px] mt-1">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-0 border-stone-300"
                                />
                                <span>Ingat saya</span>
                            </label>
                            <span className="text-stone-400 text-[11px]">Password default: password</span>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            <span>{processing ? 'Memproses...' : 'Masuk ke Sistem'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-slate-500">
                        <Link href="/" className="inline-flex items-center gap-1 text-slate-600 hover:text-amber-600 transition">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Kembali ke Peta GIS</span>
                        </Link>
                        <Link href="/track" className="text-amber-700 hover:text-amber-800 font-medium">
                            Lacak Status Sepatu →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
