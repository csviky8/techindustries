import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuthStore } from '../store/authStore';

const IconUser = () => (
    <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
    </svg>
);

const IconLock = () => (
    <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

const IconEyeOff = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
);

const IconEyeOn = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const IconTruck = () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
);

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '', remember: false });
    const [showPw, setShowPw] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    const set = (k) => (e) =>
        setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const res = await login({ login: form.email, password: form.password });
            // Save token to localStorage FIRST so axios interceptor can use it
            localStorage.setItem('token', res.data.token);
            setAuth(res.data.data, res.data.token, []);
            navigate('/dashboard');
        } catch (err) {
            const d = err.response?.data;
            setErrors(d?.errors ?? { email: [d?.message ?? 'Invalid credentials.'] });
        } finally {
            setLoading(false);
        }
    };

    return (
        /* outer wrapper — exactly viewport size, no scroll */
        <div className="relative w-screen h-screen overflow-hidden">

            {/* ── 1. Background image — covers 100% with no gaps ── */}
            <img
                src="/login-bg.jpg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center"
            />

            {/* ── 2. Dark overlay for readability ── */}
            <div className="absolute inset-0 bg-black/50" />

            {/* ── 3. Left-side form panel ── */}
            <div className="absolute inset-y-0 left-0 w-full sm:w-[420px] flex items-center justify-center px-6">

                {/* glass card */}
                <div className="w-full rounded-2xl border border-white/10 bg-[#0d1627]/85 px-8 py-10 shadow-2xl shadow-black/70 backdrop-blur-2xl">

                    {/* ── Logo ── */}
                    <div className="mb-6 flex flex-col items-center gap-1">
                        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-700/50 ring-2 ring-blue-400/30">
                            <IconTruck />
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-white">
                            GPS<span className="text-blue-400">Tek</span>
                        </h1>
                        <p className="text-xs text-slate-400">GPS Tracking Management System</p>
                    </div>

                    {/* ── Welcome ── */}
                    <div className="mb-6 text-center">
                        <p className="text-lg font-bold text-blue-400">Welcome Back!</p>
                        <p className="text-sm text-slate-400">Please sign in to continue</p>
                    </div>

                    {/* ── Form ── */}
                    <form onSubmit={handleSubmit} noValidate className="space-y-4">

                        {/* Email or Phone */}
                        <div>
                            <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30 ${errors.login ? 'border-red-500/60 bg-red-900/10' : 'border-slate-600/50 bg-white/5'}`}>
                                <IconUser />
                                <input
                                    id="login" type="text" autoComplete="username"
                                    placeholder="Email or Phone Number"
                                    value={form.email} onChange={set('email')} required
                                    className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                                />
                            </div>
                            {errors.login && <p role="alert" className="mt-1 text-xs text-red-400">{errors.login[0]}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30 ${errors.password ? 'border-red-500/60 bg-red-900/10' : 'border-slate-600/50 bg-white/5'}`}>
                                <IconLock />
                                <input
                                    id="password" type={showPw ? 'text' : 'password'} autoComplete="current-password"
                                    placeholder="Password"
                                    value={form.password} onChange={set('password')} required
                                    className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                                />
                                <button
                                    type="button" onClick={() => setShowPw(v => !v)}
                                    className="shrink-0 text-slate-400 hover:text-slate-200 transition-colors"
                                    aria-label={showPw ? 'Hide password' : 'Show password'}
                                >
                                    {showPw ? <IconEyeOff /> : <IconEyeOn />}
                                </button>
                            </div>
                            {errors.password && <p role="alert" className="mt-1 text-xs text-red-400">{errors.password[0]}</p>}
                        </div>

                        {/* Remember + Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-300">
                                <input
                                    type="checkbox" checked={form.remember} onChange={set('remember')}
                                    className="h-4 w-4 rounded border-slate-500 bg-white/5 accent-blue-500"
                                />
                                Remember me
                            </label>
                            <button type="button" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                Forgot Password?
                            </button>
                        </div>

                        {/* Sign In */}
                        <button
                            type="submit" disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/50 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading && (
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                            )}
                            Sign In
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-8 text-center text-xs text-slate-600">
                        (c) 2026 Aura Industrial. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}


