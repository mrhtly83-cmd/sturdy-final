import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';

export default function SplashScreen({ onDone }) {
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    iconOpacity.setValue(0);
    titleOpacity.setValue(0);
    taglineOpacity.setValue(0);

    // Sequential animation
    const animation = Animated.sequence([
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (!finished) return;
      if (typeof onDoneRef.current === 'function') onDoneRef.current();
    });

    return () => {
      animation.stop();
    };
  }, [iconOpacity, taglineOpacity, titleOpacity]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: iconOpacity }}>
        <Image
          source={require('./assets/star.png')}
          style={styles.icon}
        />
      </Animated.View>

      <Animated.View style={{ opacity: titleOpacity }}>
        <Text style={styles.title}>STURDY PARENT</Text>
      </Animated.View>

      <Animated.View style={{ opacity: taglineOpacity }}>
        <Text style={styles.tagline}>
          Tools to transform tense parenting moments into calm.
        </Text>
      </Animated.View>

      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="#10B981" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    width: 64,
    height: 64,
    marginBottom: 24,
    tintColor: '#10B981',
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  loaderContainer: {
    marginTop: 32,
  },
});
