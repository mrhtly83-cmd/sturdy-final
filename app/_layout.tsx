import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Session, AuthChangeEvent } from '@supabase/supabase-js'; // Import types
import { supabase } from './_utils/supabaseMobile'; // Import from the new local file
import "./globals.css"; 

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Add types to event and session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      
      if (!session && segments[0] !== '(auth)') {
        router.replace('/(auth)/Login'); 
      } 
      else if (session && segments[0] === '(auth)') {
        router.replace('/(tabs)');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [segments]);

  return (
    <SafeAreaProvider>
      <Slot />
    </SafeAreaProvider>
  );
}
