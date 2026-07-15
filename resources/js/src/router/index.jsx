import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth, RequireRole } from './guards';
import AppLayout from '../layouts/AppLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import UsersPage from '../pages/UsersPage';
import RolesPage from '../pages/RolesPage';
import SettingsPage from '../pages/SettingsPage';

const Placeholder = ({ title }) => (
    <div className="animate-in">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>This page is under construction.</p>
    </div>
);

export const router = createBrowserRouter([
    { path: '/login', element: <LoginPage /> },
    {
        element: <RequireAuth />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: '/', element: <DashboardPage /> },
                    { path: '/dashboard', element: <DashboardPage /> },
                    { path: '/settings', element: <SettingsPage /> },
                    { path: '/accounts/installer', element: <Placeholder title="Installer" /> },
                    { path: '/accounts/dealer-jurisdiction', element: <Placeholder title="Dealer Jurisdiction View" /> },
                    { path: '/authorization/deployed-device', element: <Placeholder title="Deployed Device" /> },
                    { path: '/authorization/owner-change', element: <Placeholder title="Owner Change" /> },
                    { path: '/authorization/approved-device', element: <Placeholder title="Approved Device" /> },
                    { path: '/mining-devices', element: <Placeholder title="Mining Devices" /> },
                    { path: '/inventory-request/requested', element: <Placeholder title="Requested" /> },
                    { path: '/inventory-request/delivered', element: <Placeholder title="Delivered" /> },
                    { path: '/reports', element: <Placeholder title="Reports" /> },
                    { path: '/add-on-plan/year', element: <Placeholder title="Add On Year Plan" /> },
                    { path: '/user-manual', element: <Placeholder title="User Manual" /> },
                    {
                        element: <RequireRole roles={['admin']} />,
                        children: [
                            { path: '/users', element: <UsersPage /> },
                            { path: '/roles', element: <RolesPage /> },
                            { path: '/permissions', element: <Placeholder title="Permissions" /> },
                        ],
                    },
                ],
            },
        ],
    },
]);
