import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LucideIcon } from 'lucide-react';

type Stat = { value: string; label: string };
type Highlight = { title: string; description: string; icon: LucideIcon };

type Props = {
  stats: Stat[];
  highlights: Highlight[];
  onGetStarted: () => void;
  onSeeManifesto: () => void;
};

const OnboardingScreen = ({ stats, highlights, onGetStarted, onSeeManifesto }: Props) => {
  return (
    <ScrollView className="flex-1">
      <View className="p-8 pt-16 items-center">
        <Text className="text-4xl font-bold text-white text-center mb-4">
          Welcome to Sturdy
        </Text>
        <Text className="text-white/70 text-center mb-8 text-lg">
          Your calm parenting partner.
        </Text>

        <TouchableOpacity 
          onPress={onGetStarted} 
          className="bg-teal-600 w-full py-4 rounded-xl mb-4"
        >
          <Text className="text-white text-center font-bold text-lg">Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSeeManifesto}>
          <Text className="text-teal-200 text-center font-medium">Read Manifesto</Text>
        </TouchableOpacity>

        {/* Display Stats if needed */}
        <View className="flex-row justify-around w-full mt-8">
            {stats.map((s, i) => (
                <View key={i} className="items-center">
                    <Text className="text-white font-bold">{s.value}</Text>
                    <Text className="text-white/60 text-xs">{s.label}</Text>
                </View>
            ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default OnboardingScreen;