import React, { useEffect } from 'react';
import { useRouter } from 'next/router'; // Adjust based on your routing library
import { Session, createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabase = createClient('your-supabase-url', 'your-supabase-anon-key');

const Layout = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session: Session | null) => {
      if (!session) {
        // If unauthenticated, redirect to login
        router.push('/auth/login');
      } else {
        // If authenticated, persist session in AsyncStorage
        await AsyncStorage.setItem('userSession', JSON.stringify(session));
      }
    });

    // Cleanup subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div>
      {children}
    </div>
  );
};

export default Layout;
