import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Import types to fix "parameter implicitly has any type" errors
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
// FIX: Import from the new local file we just created in Step 1
import { supabase } from './_utils/supabaseMobile'; 
import "./globals.css"; 

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // We added the types (AuthChangeEvent, Session) to the variables below
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
