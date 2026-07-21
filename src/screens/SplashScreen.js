import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideUp = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // Fade in and scale up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(slideUp, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      // Start continuous rotation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      ).start(),
      // Start pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start(),
    ]);

    // Navigate to Home after 4 seconds
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#0a0a0a', '#1a0a2e', '#0a1a3e', '#0a0a0a']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {/* Background particles effect */}
      <View style={styles.particlesContainer}>
        {[...Array(20)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: Math.random() * 0.5 + 0.2,
                transform: [{
                  scale: pulseAnim.interpolate({
                    inputRange: [1, 1.15],
                    outputRange: [0.5 + Math.random() * 0.5, 1 + Math.random() * 0.5],
                  })
                }],
              },
            ]}
          />
        ))}
      </View>

      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideUp },
            ],
          },
        ]}
      >
        {/* DNA Icon with rotation */}
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ rotate: spin }, { scale: pulseAnim }] },
          ]}
        >
          <LinearGradient
            colors={['#00d4ff', '#7b2cbf', '#ff006e']}
            style={styles.iconGradient}
          >
            <Ionicons name="infinite" size={80} color="#fff" />
          </LinearGradient>
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>GENETIC CIPHER</Text>
        <Text style={styles.subtitle}>الشفرة الوراثية</Text>

        {/* Tagline */}
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>مستحيلة التقليد</Text>
          <View style={styles.dot} />
          <Text style={styles.tagline}>فريدة لكل جهاز</Text>
          <View style={styles.dot} />
          <Text style={styles.tagline}>تتطور كل يوم</Text>
        </View>

        {/* Loading indicator */}
        <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingFill,
                {
                  width: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>جاري توليد بصمتك الوراثية...</Text>
        </Animated.View>
      </Animated.View>

      {/* Version */}
      <Text style={styles.version}>v1.0.0</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00d4ff',
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 6,
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 20,
    color: '#00d4ff',
    marginTop: 8,
    fontWeight: '600',
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  tagline: {
    color: '#888',
    fontSize: 12,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00d4ff',
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
    width: width * 0.7,
  },
  loadingBar: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingFill: {
    height: '100%',
    backgroundColor: '#00d4ff',
    borderRadius: 2,
  },
  loadingText: {
    color: '#666',
    fontSize: 11,
    marginTop: 10,
  },
  version: {
    position: 'absolute',
    bottom: 30,
    color: '#333',
    fontSize: 12,
  },
});

export default SplashScreen;
