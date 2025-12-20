import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
      <View className="items-center">
        <Text className="text-4xl font-bold text-blue-600">Sturdy Parents</Text>
        <Text className="text-gray-500 mt-4 text-center text-lg">
          The foundation is now stable.
        </Text>
      </View>

      <TouchableOpacity 
        onPress={() => router.push('/(auth)/Login')}
        className="mt-10 bg-blue-600 py-4 px-10 rounded-xl"
      >
        <Text className="text-white font-bold text-lg">Enter App</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}