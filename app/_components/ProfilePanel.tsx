import React from 'react';
import { View, Text } from 'react-native';

type Props = {
  mode?: 'tab' | 'full';
};

const ProfilePanel = ({ mode = 'full' }: Props) => {
  return (
    <View className="p-6">
      <Text className="text-2xl font-bold text-white mb-4">Account</Text>
      <View className="bg-white/10 p-4 rounded-xl">
        <Text className="text-white">Profile Settings ({mode} view)</Text>
      </View>
    </View>
  );
};

export default ProfilePanel;