// app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/app/_utils/supabaseClient'; // Adjusted path
import { generateScript } from '@/app/_utils/api'; // Import our new helper
import { useRouter } from 'expo-router';

const Dashboard = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [dailyTip, setDailyTip] = useState('Welcome back! Your AI parenting partner is ready.');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // If no session, maybe redirect to login?
      // router.replace('/(auth)/Login');
    }
    setLoading(false);
  };

  const handleQuickTest = async () => {
    try {
      setLoading(true);
      // Hardcoded test for MVP connection check
      const script = await generateScript({
        message: "My 5 year old won't put on shoes",
        struggle: "Resistance/Defiance",
        childAge: "5"
      });
      Alert.alert("Sturdy Suggestion", script);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-6" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-slate-900">Sturdy Parents</Text>
        <Text className="text-slate-500 mt-2">Design the words that calm your home.</Text>
      </View>

      {/* Daily Tip Card */}
      <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <Text className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Daily Insight</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#2563EB" />
        ) : (
          <Text className="text-slate-700 leading-relaxed text-base">{dailyTip}</Text>
        )}
      </View>

      {/* Primary Action */}
      <TouchableOpacity 
        className="bg-blue-600 p-4 rounded-xl items-center shadow-md active:bg-blue-700"
        onPress={() => router.push('/create')} // Assuming you have a /create route
      >
        <Text className="text-white font-bold text-lg">Create New Script</Text>
      </TouchableOpacity>

      {/* Debug Button (Remove before prod) */}
      <TouchableOpacity 
        className="mt-4 p-4 rounded-xl items-center border border-slate-200"
        onPress={handleQuickTest}
      >
        <Text className="text-slate-500">Test API Connection</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Dashboard;
