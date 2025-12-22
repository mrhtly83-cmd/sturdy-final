import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../_utils/supabaseClient';

// 1. Keep Google Sign-In commented out for now
// import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. THIS IS THE MISSING FUNCTION
  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Login Error", error.message);
    } else {
      // Setup navigation here if needed, or rely on auth state listener
      console.log("Logged in successfully!");
    }
    setLoading(false);
  }

  async function handleSignUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Sign Up Error", error.message);
    } else {
      Alert.alert("Success", "Please check your email for confirmation!");
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity onPress={handleLogin} style={styles.button} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSignUp} style={[styles.button, styles.secondaryButton]}>
        <Text style={styles.secondaryButtonText}>Create Account</Text>
      </TouchableOpacity>

      {/* Google Sign-In (Disabled to prevent crash) */}
      {/* <TouchableOpacity onPress={() => GoogleSignin.signIn()} style={styles.googleButton}>
        <Text>Sign in with Google</Text>
      </TouchableOpacity> 
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, marginBottom: 15, borderRadius: 8, backgroundColor: '#f9f9f9' },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#007bff' },
  secondaryButtonText: { color: '#007bff', fontWeight: 'bold', fontSize: 16 }
});