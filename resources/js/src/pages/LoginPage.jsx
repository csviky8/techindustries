import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const res = await login(form);
            setAuth(res.data.data, res.data.token);
            navigate('/dashboard');
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) setErrors(data.errors);
            else setErrors({ email: [data?.message ?? 'Login failed.'] });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4" style={{ background: 'var(--body-bg)' }}>
            <div className="card animate-in w-full max-w-sm p-8 shadow-xl">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-white text-xl font-bold"
                        style={{ background: 'var(--primary)' }}>S</div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Sign in to SafeTek</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {['email', 'password'].map(field => (
                        <div key={field}>
                            <label className="block text-sm font-medium mb-1 capitalize" style={{ color: 'var(--text-primary)' }}>
                                {field}
                            </label>
                            <input
                                type={field}
                                value={form[field]}
                                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                                required
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all"
                                style={{
                                    background: 'var(--card-bg)',
                                    borderColor: errors[field] ? '#f43f5e' : 'var(--card-border)',
                                    color: 'var(--text-primary)',
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={e => e.target.style.borderColor = errors[field] ? '#f43f5e' : 'var(--card-border)'}
                            />
                            {errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field][0]}</p>}
                        </div>
                    ))}

                    <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                        {loading ? <span className="pulse">Signing in…</span> : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
}
