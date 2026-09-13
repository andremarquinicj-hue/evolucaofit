import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/app-context';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Evolução Fit',
  description: 'Acompanhe seus treinos, cargas, medidas e evolução.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Evolução Fit', statusBarStyle: 'default' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 1, themeColor: '#faf6fa' };

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="pt-BR"><body><AppProvider><AppShell>{children}</AppShell></AppProvider></body></html>
}
