import React from 'react';
import { View, Text } from 'react-native';

type Props = {
  variant?: 'default' | 'inline';
};

const AuthPanel = ({ variant = 'default' }: Props) => {
  return (
    <View className={`p-6 rounded-2xl ${variant === 'inline' ? '' : 'bg-white/10'}`}>
      <Text className="text-xl font-bold text-white mb-2">Sign In</Text>
      <Text className="text-white/60 text-sm mb-4">
        {variant === 'inline' ? 'Sign in to access premium features.' : 'Manage your account securely.'}
      </Text>
      {/* Add your actual Auth UI here */}
      <View className="bg-black/30 p-4 rounded-xl">
        <Text className="text-white/40 text-center">Auth Form Placeholder</Text>
      </View>
    </View>
  );
};

export default AuthPanel;