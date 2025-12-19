import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '../supabaseClient'; // Adjust the import based on your project structure
import { TailwindProvider } from 'nativewind';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const { error } = await supabase.auth.signInWithIdToken({ idToken });

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPasswordSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signIn({ email, password });
    if (error) {
      console.error('Email/Password Sign-In Error:', error);
    }
    setLoading(false);
  };

  return (
    <TailwindProvider>
      <SafeAreaView className="flex-1 bg-blue-50 p-4">
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
        <View className="flex-1 justify-center">
          <Text className="text-3xl font-bold text-center mb-6">Welcome to Sturdy Parents</Text>
          
          <TouchableOpacity className="bg-blue-500 p-4 rounded-full mb-4" onPress={signInWithGoogle}>
            <Text className="text-white text-center">Sign in with Google</Text>
          </TouchableOpacity>

          <TextInput 
            className="border rounded-lg p-2 mb-2" 
            placeholder="Email" 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
To apply the suggested edit to your previous code, you need to integrate the import statement into the existing code structure. Without the previous code provided, I'll show you how to structure the code with the import statement included.

Here's an example of how you might adjust the code:
          />
          <TextInput 
            className="border rounded-lg p-2 mb-4" 
            placeholder="Password" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
          />

          <Button title="Sign In" onPress={handleEmailPasswordSignIn} />

          <View className="flex-row justify-between mt-4">
            <TouchableOpacity>
              <Text className="text-blue-500">Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text className="text-blue-500">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TailwindProvider>
  );
};

export default Login;
