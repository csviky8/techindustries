import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import Input from '../components/Input';

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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="mb-2 text-2xl font-bold text-gray-900">Sign in</h1>
                <p className="mb-6 text-sm text-gray-500">Welcome back to SafeTek</p>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <Input
                        id="email"
                        label="Email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        error={errors.email?.[0]}
                        required
                    />
                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        value={form.password}
                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                        error={errors.password?.[0]}
                        required
                    />
                    <Button type="submit" loading={loading} className="w-full">
                        Sign in
                    </Button>
                </form>
            </div>
        </div>
    );
}
