// mobile/layout.tsx
import { Slot } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import "../global.css"; // Ensure Tailwind directives are loaded if configured

export default function MobileLayout() {
  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-white">
        <Slot />
        <StatusBar style="dark" />
      </View>
    </SafeAreaProvider>
  );
}
