import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth, RequireRole } from './guards';
import AppLayout from '../layouts/AppLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import ProjectsPage from '../pages/ProjectsPage';
import UsersPage from '../pages/UsersPage';
import RolesPage from '../pages/RolesPage';

export const router = createBrowserRouter([
    { path: '/login', element: <LoginPage /> },
    {
        element: <RequireAuth />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: '/dashboard', element: <DashboardPage /> },
                    { path: '/projects', element: <ProjectsPage /> },
                    {
                        element: <RequireRole roles={['admin']} />,
                        children: [
                            { path: '/users', element: <UsersPage /> },
                            { path: '/roles', element: <RolesPage /> },
                        ],
                    },
                    { path: '/', element: <DashboardPage /> },
                ],
            },
        ],
    },
]);
