import React, { useEffect, ReactNode } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';

interface ScreenTransitionProps {
  children: ReactNode;
  style?: ViewStyle;
  type?: 'fade' | 'slide' | 'scale';
  duration?: number;
}

/**
 * Компонент для анимированного перехода между экранами
 */
const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  children,
  style,
  type = 'fade',
  duration = 300,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Анимация появления экрана
    if (type === 'fade' || type === 'slide') {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }

    if (type === 'slide') {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }).start();
    }

    if (type === 'scale') {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fadeAnim, slideAnim, scaleAnim, type, duration]);

  // Определение стилей анимации в зависимости от типа
  const getAnimationStyle = () => {
    switch (type) {
      case 'fade':
        return {
          opacity: fadeAnim,
        };
      case 'slide':
        return {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
          ],
        };
      case 'scale':
        return {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
          ],
        };
      default:
        return {
          opacity: fadeAnim,
        };
    }
  };

  return (
    <Animated.View style={[styles.container, getAnimationStyle(), style]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenTransition; 