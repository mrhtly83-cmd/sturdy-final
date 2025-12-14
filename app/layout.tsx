import './globals.css';
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming like a real app
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  title: 'Sturdy Parent',
  description: 'Calm parenting guidance powered by AI',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sturdy',
  },
  icons: {
    apple: '/icon.png', // Uses the icon for iPhone home screen
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}