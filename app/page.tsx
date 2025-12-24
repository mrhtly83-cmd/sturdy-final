'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { View } from 'react-native';
import OnboardingScreen from './_components/OnboardingScreen';
import { Heart, Shield, Sparkles } from 'lucide-react';

export default function Page() {
  const router = useRouter();

  // Navigation handlers
  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleSeeManifesto = () => {
    router.push('/manifesto');
  };

  // Content Data
  const stats = [
    { value: '10k+', label: 'Calm Moments' },
    { value: '4.9', label: 'Parent Trust' },
    { value: '24/7', label: 'Support' },
  ];

  const highlights = [
    {
      title: 'Instant Scripts',
      description: 'Get the exact words for difficult moments in seconds.',
      icon: Sparkles,
    },
    {
      title: 'Emotional Safety',
      description: 'Build a sturdy foundation of trust with your child.',
      icon: Shield,
    },
    {
      title: 'Connection First',
      description: 'Prioritize the relationship over control.',
      icon: Heart,
    },
  ];

  return (
    // This View provides the dark background context
    <View className="flex-1 bg-slate-900">
      <OnboardingScreen
        stats={stats}
        highlights={highlights}
        onGetStarted={handleGetStarted}
        onSeeManifesto={handleSeeManifesto}
      />
    </View>
  );
}