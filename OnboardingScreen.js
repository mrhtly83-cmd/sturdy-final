import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';

export default function OnboardingScreen({ navigation, onGetStarted, onSeeManifesto }) {
  const handleGetStarted = () => {
    if (typeof onGetStarted === 'function') return onGetStarted();
    if (navigation?.navigate) navigation.navigate('ScriptCreator');
  };

  const handleSeeManifesto = () => {
    if (typeof onSeeManifesto === 'function') return onSeeManifesto();
    if (navigation?.navigate) navigation.navigate('Manifesto');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Calm starts here.</Text>

        <Text style={styles.subheading}>
          Instant scripts backed by science to help you handle hard parenting moments.
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>42k+</Text>
            <Text style={styles.statLabel}>families supported</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>90%</Text>
            <Text style={styles.statLabel}>report calmer moments</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleSeeManifesto}>
          <Text style={styles.secondaryButtonText}>See the Manifesto</Text>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  subheading: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  primaryButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
});

