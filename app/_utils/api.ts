// app/_utils/api.ts
import { supabase } from './supabaseClient';
import { Platform } from 'react-native';

// 1. Determine Base URL
// In dev (Android Emulator), use 10.0.2.2. In iOS Simulator, use localhost.
// In Prod, use your Vercel URL.
const DEV_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const PROD_URL = 'https://your-production-app.vercel.app'; // ⚠️ UPDATE THIS

const BASE_URL = __DEV__ ? DEV_URL : PROD_URL;

export async function generateScript(payload: {
  message: string;
  tone?: string;
  childAge?: string;
  struggle?: string;
}) {
  // 2. Get the current user's session token
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('You must be logged in to generate a script.');
  }

  // 3. Call the Next.js API
  try {
    const response = await fetch(`${BASE_URL}/app/api/generate-script`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Pass Supabase token for billing checks
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate script');
    }

    // 4. Handle Response (Stream or Text)
    // For MVP robustness, we just read text. 
    // If you want streaming in RN, we need a specialized reader.
    const text = await response.text();
    return text;

  } catch (error) {
    console.error('API Call Failed:', error);
    throw error;
  }
}
