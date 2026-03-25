import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { BrandingProvider } from './contexts/BrandingContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import App from './App';
import './index.css';
import './styles/pages.css';

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Toast configuration
const toastOptions = {
  duration: 4000,
  style: {
    fontFamily: 'IBM Plex Sans Arabic, Tahoma, Arial, sans-serif',
    direction: 'rtl' as const,
    borderRadius: '12px',
    padding: '12px 16px',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  success: {
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <PermissionsProvider>
            <BrandingProvider>
              <App />
              <Toaster
                position="top-left"
                reverseOrder={false}
                toastOptions={toastOptions}
              />
            </BrandingProvider>
          </PermissionsProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);

