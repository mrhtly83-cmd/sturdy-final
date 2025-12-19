import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '../_utils/supabaseClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const token = userInfo?.data?.idToken; // Accessing idToken correctly

      if (token) {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
          token: token, // Using the token from Google
      });

      if (error) throw new Error(error.message);
        // Handle successful sign-in (e.g., navigate to another screen)
      } else {
        console.error('No token found!');
      }
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
  );
};

export default Login;

