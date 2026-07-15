import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './src/router/index.jsx';
import { useBootstrapAuth } from './src/hooks/useBootstrapAuth.js';
import './app.css';

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function AppBootstrap() {
    useBootstrapAuth();
    return <RouterProvider router={router} />;
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AppBootstrap />
        </QueryClientProvider>
    );
}
