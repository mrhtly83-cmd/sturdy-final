// app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/app/_utils/supabaseClient'; 
import { generateScript } from '@/app/_utils/api'; // Import the new API helper
import { useRouter } from 'expo-router';
// import { TailwindProvider } from 'nativewind'; // If using NativeWind v2. v4 uses global.css usually.

const Dashboard = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [dailyTip, setDailyTip] = useState('Welcome back! Your AI parenting partner is ready.');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('Parent');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Handle unauthenticated state if needed
        console.log('User not logged in');
      } else {
        // Optional: Get user name from metadata
        const name = session.user.user_metadata?.full_name || 'Parent';
        setUserName(name);
      }
    };
    checkSession();
  }, []);

  // Quick connectivity test function
  const handleQuickTest = async () => {
    try {
      setLoading(true);
      const script = await generateScript({
        message: "My 5 year old won't put on shoes",
        struggle: "Resistance/Defiance",
        childAge: "5",
        tone: "Balanced"
      });
      Alert.alert("Sturdy Suggestion", script);
    } catch (e: any) {
      Alert.alert("Connection Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-slate-900">Hello, {userName}</Text>
          <Text className="text-slate-500 mt-2 text-base">Design the words that calm your home.</Text>
        </View>

        {/* Daily Tip Card */}
        <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <Text className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Daily Insight</Text>
          <Text className="text-slate-700 leading-relaxed text-lg">{dailyTip}</Text>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity 
          className="bg-blue-600 p-4 rounded-xl items-center shadow-md active:bg-blue-700 mb-6"
          onPress={() => router.push('/create')} // Ensure you have a /create route or handle navigation
        >
          <Text className="text-white font-bold text-lg">Create New Script</Text>
        </TouchableOpacity>

        {/* Test Connection Button (For Development) */}
        <View className="border-t border-slate-200 pt-6 mt-2">
          <Text className="text-slate-400 text-sm mb-4 font-medium uppercase">Developer Tools</Text>
          <TouchableOpacity 
            className="flex-row items-center justify-center p-4 rounded-xl border border-slate-300 bg-slate-100 active:bg-slate-200"
            onPress={handleQuickTest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#475569" />
            ) : (
              <Text className="text-slate-700 font-medium">Test API Connection</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;
