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
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

  return (
    <html lang="en">
      <head>
        {supabaseUrl && supabaseAnonKey ? (
          <>
            <meta name="sturdy:supabase-url" content={supabaseUrl} />
            <meta name="sturdy:supabase-anon-key" content={supabaseAnonKey} />
          </>
        ) : null}
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-black focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-4 focus:ring-teal-400/60"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
