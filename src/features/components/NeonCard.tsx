import React, { ReactNode, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../../styles/theme';

interface NeonCardProps {
  children: ReactNode;
  glow?: boolean;
  glowColor?: string;
  onClick?: () => void;
  style?: object;
}

export function NeonCard({ children, glow = false, glowColor, onClick, style }: NeonCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const cardContent = (
    <Animated.View
      style={[
        styles.card,
        glow && styles.glow,
        glowColor && glow ? { shadowColor: glowColor } : {},
        { opacity: fadeAnim, transform: [{ translateY }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onClick) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onClick}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  glow: {
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
});
