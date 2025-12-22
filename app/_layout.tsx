import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '@/src/utils/supabaseClient'; // Ensure this path matches your project structure
import "./globals.css"; // Ensure your CSS import matches your setup

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // If no session and not in the (auth) group, redirect to login
      if (!session && segments[0] !== '(auth)') {
        router.replace('/(auth)/Login'); // Ensure 'Login' matches your filename exactly (case-sensitive)
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
      {/* Mobile apps cannot use <html> or <body> tags. 
         <Slot /> tells Expo Router to render the current screen here.
      */}
      <Slot />
    </SafeAreaProvider>
  );
}
