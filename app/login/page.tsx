'use client';

import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../_utils/supabaseClient'; 

export default function WebLogin() {
  const [loading, setLoading] = useState(false);

  async function handleWebGoogleLogin() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white justify-center px-6 items-center h-screen">
      <View className="items-center mb-10">
        <Text className="text-3xl font-bold text-blue-600">Sturdy Parents</Text>
        <Text className="text-gray-500 mt-2">Your AI Parenting Partner</Text>
      </View>

      <TouchableOpacity 
        onPress={handleWebGoogleLogin}
        disabled={loading}
        className="bg-blue-600 p-4 rounded-xl items-center w-64"
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