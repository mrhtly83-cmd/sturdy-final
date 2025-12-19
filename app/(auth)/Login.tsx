import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '../_utils/supabaseClient'; // Correct path

export default function Login() {
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      // 1. Get the token from Google
      const userInfo = await GoogleSignin.signIn();
      const token = userInfo.data?.idToken;

      if (!token) throw new Error('No ID Token found');

      // 2. Pass the token to the correct Supabase method
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: token,
      });

      if (error) alert(error.message);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white justify-center px-6">
      <View className="items-center mb-10">
        <Text className="text-3xl font-bold text-sturdy-blue">Sturdy Parents</Text>
        <Text className="text-gray-500 mt-2">Your AI Parenting Partner</Text>
      </View>

      <TouchableOpacity 
        onPress={handleGoogleLogin}
        disabled={loading}
        className="bg-sturdy-blue p-4 rounded-xl items-center"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Login with Google</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}