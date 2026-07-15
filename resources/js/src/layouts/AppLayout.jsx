import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { logout } from '../api/auth';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', roles: null },
    { to: '/projects', label: 'Projects', roles: null },
    { to: '/users', label: 'Users', roles: ['admin'] },
    { to: '/roles', label: 'Roles', roles: ['admin'] },
];

export default function AppLayout() {
    const { user, clearAuth } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout().catch(() => {});
        clearAuth();
        navigate('/login');
    };

    const visibleItems = navItems.filter(
        (item) => !item.roles || item.roles.includes(user?.role?.slug)
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
                <div className="flex h-16 items-center border-b border-gray-200 px-6">
                    <span className="text-xl font-bold text-indigo-600">SafeTek</span>
                </div>
                <nav className="flex-1 space-y-1 p-4" aria-label="Main navigation">
                    {visibleItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="border-t border-gray-200 p-4">
                    <div className="mb-2 px-3 text-xs text-gray-500">
                        <p className="font-medium text-gray-800">{user?.name}</p>
                        <p className="capitalize">{user?.role?.name}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-auto p-8">
                <Outlet />
            </main>
        </div>
    );
}
