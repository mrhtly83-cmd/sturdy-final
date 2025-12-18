import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TailwindProvider } from 'nativewind';  // Assuming NativeWind is set up

const index = () => {
  const insets = useSafeAreaInsets();
  const [dailyTip, setDailyTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDailyTip = async () => {
    try {
      const response = await fetch('https://your-api-url/chat-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userMessage: 'Give me a daily parenting tip' }),
      });

      const data = await response.json();
      setDailyTip(data.reply);
    } catch (error) {
      console.error('Error fetching tip:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyTip();
  }, []);

  return (
    <TailwindProvider>
      <View style={{ padding: insets.top }}>
        <Text className="text-2xl font-bold">Sturdy Parents Dashboard</Text>
        
        <View className="mt-4 p-4 bg-blue-100 rounded-lg">
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Text className="text-xl">{dailyTip}</Text>
          )}
        </View>

        <View className="mt-6">
          <Text className="text-lg font-semibold">Premium Features</Text>
          <View className="flex-row justify-between mt-2">
            <Button title="Feature 1" onPress={() => { /* Handle tap */ }} />
            <Button title="Feature 2" onPress={() => { /* Handle tap */ }} />
          </View>
        </View>
      </View>
    </TailwindProvider>
  );
};

export default index;
