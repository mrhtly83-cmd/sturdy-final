// app/_utils/api.ts
import { supabase } from './supabaseClient';
import { Platform } from 'react-native';

// Detect environment:
// - Android Emulator uses 10.0.2.2 to access localhost
// - iOS Simulator uses localhost
// - Production uses your Vercel URL
const DEV_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

// TODO: Replace with your actual Vercel URL when deploying
const PROD_URL = 'https://sturdy-parents.vercel.app'; 

const BASE_URL = __DEV__ ? DEV_URL : PROD_URL;

type ScriptPayload = {
  message: string;
  tone?: 'Gentle' | 'Balanced' | 'Firm';
  childAge?: string;
  struggle?: string;
  mode?: 'script' | 'coparent';
};

export async function generateScript(payload: ScriptPayload) {
  // 1. Get the current user's session token to pass to the backend
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('You must be logged in to generate a script.');
  }

  try {
    const response = await fetch(`${BASE_URL}/app/api/generate-script`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Pass token for RLS/Billing checks
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server Error: ${response.status}`);
    }

    // Return the raw text script
    return await response.text();

  } catch (error) {
    console.error('API Call Failed:', error);
    throw error;
  }
}
