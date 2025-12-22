import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Import types to fix "parameter implicitly has any type" errors
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
// Import from the new local file
import { supabase } from './_utils/supabaseClient.native';
import "./globals.css";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
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