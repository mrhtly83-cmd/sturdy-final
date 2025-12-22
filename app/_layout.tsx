import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// FIX: Changed alias '@/' to relative path '../' so Metro can find the file
import { supabase } from '../src/utils/supabaseClient';
import "./globals.css";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // If no session and not in the (auth) group, redirect to login
      if (!session && segments[0] !== '(auth)') {
        router.replace('/(auth)/Login');
      }
      // If session exists and user is trying to login, redirect to tabs
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