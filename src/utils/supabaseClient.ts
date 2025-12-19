import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react';
import { useEffect } from 'react';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Use AsyncStorage for persistence
const storageKey = 'supabase.auth.token';

// Function to persist session
const persistSession = async (session: any) => {
  if (session) {
    await AsyncStorage.setItem(storageKey, JSON.stringify(session));
  } else {
    await AsyncStorage.removeItem(storageKey);
  }
};

// AppState listener to maintain authentication
const manageAuthRefresh = () => {
  const appStateListener = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
      supabase.auth.startAutoRefresh();
    }
  });

  return () => {
    appStateListener.remove();
  };
};

// Automatically start session persistence
useEffect(() => {
  const session = supabase.auth.session();
  persistSession(session);
  
  const cleanup = manageAuthRefresh();
  return cleanup;
}, []);

export { supabase };
