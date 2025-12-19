import './globals.css';
import type { Metadata, Viewport } from 'next';
import { useEffect } from 'react';
import { useRouter, Stack } from 'expo-router'; // Updated import
import { supabase } from '../src/utils/supabaseClient'; // Updated import
import { SafeAreaProvider } from 'react-native-safe-area-context'; // Safe area provider
import { View } from 'react-native'; // Import View for wrapping children

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => { // Added types to parameters
      if (!session && router.pathname !== '/(auth)/login') {
        router.replace('/(auth)/login'); // Redirect to login if no session
      } else if (session) {
        router.replace('/(tabs)'); // Redirect to tabs if logged in
      }
    });

    return () => {
      subscription.unsubscribe(); // Clean up subscription on component unmount
    };
  }, [router]);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase configuration is missing.');
  }

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        {supabaseUrl && supabaseAnonKey && (
          <> 
            <meta name="sturdy:supabase-url" content={supabaseUrl} />
            <meta name="sturdy:supabase-anon-key" content={supabaseAnonKey} />
          </>
        )}
      </head>
      <body>
        <SafeAreaProvider>
          <View>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-black focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-4 focus:ring-teal-400/60"
            >
              Skip to main content
            </a>
            {children}
          </View>
        </SafeAreaProvider>
      </body>
    </html>
  );
}
