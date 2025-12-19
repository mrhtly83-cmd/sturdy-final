import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Onboarding() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
      <View className="items-center">
        <Text className="text-3xl font-bold text-blue-600">Welcome to Sturdy Parents</Text>
        <Text className="text-gray-500 mt-4 text-center text-lg">
          Your journey to confident parenting starts here.
        </Text>
      </View>

      <View className="w-full mt-10 space-y-4">
        <TouchableOpacity 
          onPress={() => router.push('/(auth)/Login')}
          className="bg-blue-600 p-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-lg">Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}