import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dr. Dentix',
  description: 'Sistema de gestión clínica dental',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
