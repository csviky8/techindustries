import { useQuery } from '@tanstack/react-query';
import { getProjects } from '../api/projects';
import { useAuthStore } from '../store/authStore';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { data, isLoading } = useQuery({
        queryKey: ['projects', 1],
        queryFn: () => getProjects(1).then(r => r.data),
    });

    const projects = data?.data ?? [];

    const stats = [
        { label: 'Total Projects', value: data?.meta?.total ?? '—', icon: '📁' },
        { label: 'Active', value: projects.filter(p => p.status === 'active').length, icon: '🟢' },
        { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, icon: '✅' },
    ];

    return (
        <div className="animate-in">
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
            <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.name} 👋</p>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
                {stats.map((s, i) => (
                    <div key={s.label} className="card p-5 animate-in" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
                            <span className="text-xl">{s.icon}</span>
                        </div>
                        <p className="text-3xl font-bold stat-accent">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent projects */}
            <div className="card animate-in" style={{ animationDelay: '240ms' }}>
                <div className="border-b px-6 py-4" style={{ borderColor: 'var(--card-border)' }}>
                    <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Projects</h2>
                </div>
                {isLoading ? (
                    <div className="p-6 text-sm pulse" style={{ color: 'var(--text-secondary)' }}>Loading…</div>
                ) : (
                    <ul className="divide-y" style={{ '--tw-divide-opacity': 1 }}>
                        {projects.slice(0, 5).map(p => (
                            <li key={p.id} className="flex items-center justify-between px-6 py-3">
                                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                                <span className="rounded-full px-2 py-0.5 text-xs font-medium"
                                    style={{
                                        background: p.status === 'active' ? '#dcfce7' : p.status === 'completed' ? '#dbeafe' : '#f3f4f6',
                                        color: p.status === 'active' ? '#16a34a' : p.status === 'completed' ? '#2563eb' : '#6b7280',
                                    }}>
                                    {p.status}
                                </span>
                            </li>
                        ))}
                        {projects.length === 0 && (
                            <li className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>No projects yet.</li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}
