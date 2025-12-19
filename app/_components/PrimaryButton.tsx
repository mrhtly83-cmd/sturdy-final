import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function PrimaryButton({ title, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} className="bg-blue-600 p-4 rounded-lg">
      <Text className="text-white text-center font-bold">{title}</Text>
    </TouchableOpacity>
  );
}