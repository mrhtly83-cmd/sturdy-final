import React, { useEffect } from 'react';
import { useRouter } from 'next/router'; // Adjust based on your routing library
import { supabase } from '../supabaseClient'; // Adjust the import based on your project structure
import { Linking } from 'expo-linking';

const Layout = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    // Handle incoming URLs
    const handleIncomingURL = (url: string) => {
      // Process the URL as needed, here we just log it
      console.log('Incoming URL:', url);
    };

    const subscription = Linking.addEventListener('url', ({ url }) => handleIncomingURL(url));

    // Supabase Auth Listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Redirect or do something with authenticated session
        console.log('User is logged in:', session);
      } else {
        // Handle unauthenticated state if needed
        console.log('User is logged out');
      }
    });

    // Clean up listeners on unmount
    return () => {
      subscription.remove();
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
