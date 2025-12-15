import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function ManifestoScreen({ navigation, onBack }) {
  const handleBack = () => {
    if (typeof onBack === 'function') return onBack();
    if (navigation?.goBack) navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>The Manifesto</Text>
        <Text style={styles.paragraph}>
          Connection before correction. Repair builds trust. Calm is contagious.
        </Text>
        <Text style={styles.paragraph}>
          Use Sturdy as a coach for language that keeps boundaries firm and attachment intact.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleBack}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    marginTop: 24,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  buttonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
});

