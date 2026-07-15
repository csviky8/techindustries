import { useQuery } from '@tanstack/react-query';
import { getProjects } from '../api/projects';
import { useAuthStore } from '../store/authStore';
import Badge from '../components/Badge';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { data, isLoading } = useQuery({
        queryKey: ['projects', 1],
        queryFn: () => getProjects(1).then((r) => r.data),
    });

    const projects = data?.data ?? [];

    return (
        <div>
            <h1 className="mb-1 text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mb-8 text-sm text-gray-500">Welcome back, {user?.name}</p>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                    { label: 'Total Projects', value: data?.meta?.total ?? '—' },
                    { label: 'Active', value: projects.filter((p) => p.status === 'active').length },
                    { label: 'Completed', value: projects.filter((p) => p.status === 'completed').length },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="font-semibold text-gray-800">Recent Projects</h2>
                </div>
                {isLoading ? (
                    <div className="p-6 text-sm text-gray-400">Loading…</div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {projects.slice(0, 5).map((p) => (
                            <li key={p.id} className="flex items-center justify-between px-6 py-3">
                                <span className="text-sm font-medium text-gray-800">{p.name}</span>
                                <Badge type={p.status} />
                            </li>
                        ))}
                        {projects.length === 0 && (
                            <li className="px-6 py-4 text-sm text-gray-400">No projects yet.</li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}
