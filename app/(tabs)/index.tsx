import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/src/utils/supabaseClient'; // Ensure this path is correct
import { TailwindProvider } from 'nativewind';  // Assuming NativeWind is set up

const Dashboard = () => {
  const insets = useSafeAreaInsets();
  const [dailyTip, setDailyTip] = useState('Welcome back! Your AI parenting partner is ready to help.'); // Default tip
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
      }
      if (!session) {
        console.log('User not logged in');
      }
      // You can fetch daily tips here if desired
    };

    checkSession();
  }, []);

  return (
    <TailwindProvider>
      <SafeAreaView className="flex-1 p-4" style={{ paddingTop: insets.top }}>
        <Text className="text-2xl font-bold">Hello, [Parent Name]</Text>
        <View className="mt-6">
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Text className="text-lg">{dailyTip}</Text>
          )}
        </View>
        <View className="mt-6">
          <Button title="Ask Anything" onPress={() => {/* navigation logic to chat screen */}} />
        </View>
      </SafeAreaView>
    </TailwindProvider>
  );
};

export default Dashboard;
