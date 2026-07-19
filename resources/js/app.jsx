import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { router } from './src/router/index.jsx';
import { useBootstrapAuth } from './src/hooks/useBootstrapAuth.js';
import { useThemeStore } from './src/store/themeStore.js';
import './app.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
        },
    },
});

function ThemeProvider({ children }) {
    const { theme, dark } = useThemeStore();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-dark', dark);
    }, [theme, dark]);

    return children;
}

function AppBootstrap() {
    useBootstrapAuth();
    return <RouterProvider router={router} />;
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AppBootstrap />
            </ThemeProvider>
        </QueryClientProvider>
    );
}
