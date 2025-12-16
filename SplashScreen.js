import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';

export default function SplashScreen({ onDone }) {
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.92)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(10)).current;

  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(10)).current;

  const glowOpacity = useRef(new Animated.Value(0)).current;
  const blob1 = useRef(new Animated.Value(0)).current;
  const blob2 = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;

  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    iconOpacity.setValue(0);
    iconScale.setValue(0.92);
    iconRotate.setValue(0);
    titleOpacity.setValue(0);
    titleY.setValue(10);
    taglineOpacity.setValue(0);
    taglineY.setValue(10);
    glowOpacity.setValue(0);
    blob1.setValue(0);
    blob2.setValue(0);
    loaderOpacity.setValue(0);

    const blobLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(blob1, { toValue: 1, duration: 4200, useNativeDriver: true }),
          Animated.timing(blob1, { toValue: 0, duration: 4200, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(blob2, { toValue: 1, duration: 5200, useNativeDriver: true }),
          Animated.timing(blob2, { toValue: 0, duration: 5200, useNativeDriver: true }),
        ]),
      ])
    );

    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(iconScale, { toValue: 1.02, duration: 1800, useNativeDriver: true }),
        Animated.timing(iconScale, { toValue: 0.98, duration: 1800, useNativeDriver: true }),
      ])
    );

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(glowOpacity, { toValue: 1, duration: 520, useNativeDriver: true }),
        Animated.timing(iconOpacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(iconRotate, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
      Animated.spring(iconScale, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 520, useNativeDriver: true }),
        Animated.timing(titleY, { toValue: 0, duration: 520, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 520, delay: 120, useNativeDriver: true }),
        Animated.timing(taglineY, { toValue: 0, duration: 520, delay: 120, useNativeDriver: true }),
        Animated.timing(loaderOpacity, { toValue: 1, duration: 420, delay: 260, useNativeDriver: true }),
      ]),
    ]);

    animation.start(({ finished }) => {
      if (!finished) return;
      if (typeof onDoneRef.current === 'function') onDoneRef.current();
    });

    blobLoop.start();
    breatheLoop.start();

    return () => {
      animation.stop();
      blobLoop.stop();
      breatheLoop.stop();
    };
  }, [
    blob1,
    blob2,
    glowOpacity,
    iconOpacity,
    iconRotate,
    iconScale,
    loaderOpacity,
    taglineOpacity,
    taglineY,
    titleOpacity,
    titleY,
  ]);

  const rotation = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-8deg', '0deg'],
  });

  const blob1Style = {
    transform: [
      {
        translateX: blob1.interpolate({
          inputRange: [0, 1],
          outputRange: [-26, 22],
        }),
      },
      {
        translateY: blob1.interpolate({
          inputRange: [0, 1],
          outputRange: [14, -18],
        }),
      },
      {
        scale: blob1.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.08],
        }),
      },
    ],
    opacity: blob1.interpolate({
      inputRange: [0, 1],
      outputRange: [0.45, 0.7],
    }),
  };

  const blob2Style = {
    transform: [
      {
        translateX: blob2.interpolate({
          inputRange: [0, 1],
          outputRange: [18, -18],
        }),
      },
      {
        translateY: blob2.interpolate({
          inputRange: [0, 1],
          outputRange: [-10, 18],
        }),
      },
      {
        scale: blob2.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.12],
        }),
      },
    ],
    opacity: blob2.interpolate({
      inputRange: [0, 1],
      outputRange: [0.35, 0.6],
    }),
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
        <Animated.View style={[styles.blob, styles.blob1, blob1Style]} />
        <Animated.View style={[styles.blob, styles.blob2, blob2Style]} />

        <Animated.View style={{ opacity: iconOpacity, transform: [{ scale: iconScale }, { rotate: rotation }] }}>
          <View style={styles.iconShell}>
            <Image source={require('./assets/star.png')} style={styles.icon} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleY }] }}>
          <Text style={styles.title}>STURDY PARENT</Text>
        </Animated.View>

        <Animated.View style={{ opacity: taglineOpacity, transform: [{ translateY: taglineY }] }}>
          <Text style={styles.tagline}>Tools to transform tense parenting moments into calm.</Text>
        </Animated.View>

        <Animated.View style={[styles.loaderContainer, { opacity: loaderOpacity }]}>
          <ActivityIndicator size="small" color="#10B981" />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  glow: {
    position: 'absolute',
    top: -140,
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: 'rgba(16,185,129,0.10)',
  },
  blob: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  blob1: {
    left: -120,
    top: 140,
    backgroundColor: 'rgba(16,185,129,0.10)',
  },
  blob2: {
    right: -120,
    bottom: 140,
    backgroundColor: 'rgba(245,158,11,0.10)',
  },
  iconShell: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B1220',
    shadowOpacity: 0.10,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
  },
  icon: {
    width: 64,
    height: 64,
    tintColor: '#10B981',
    resizeMode: 'contain',
  },
  title: {
    marginTop: 18,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1.4,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 320,
  },
  loaderContainer: {
    marginTop: 32,
  },
});
