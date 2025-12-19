import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function OutlineButton({ title, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} className="border border-blue-600 p-4 rounded-lg">
      <Text className="text-blue-600 text-center font-bold">{title}</Text>
    </TouchableOpacity>
  );
}