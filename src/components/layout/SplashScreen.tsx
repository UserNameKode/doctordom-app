import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import Logo from '../ui/Logo';
import appTheme from '../../constants/theme';

interface SplashScreenProps {
  onAnimationComplete?: () => void;
  duration?: number;
}

/**
 * Экран загрузки приложения с логотипом и анимацией
 */
const SplashScreen: React.FC<SplashScreenProps> = ({
  onAnimationComplete,
  duration = 2000, // 2 секунды по умолчанию
}) => {
  // Значение анимации для масштабирования
  const scaleAnim = new Animated.Value(0.3);
  // Значение анимации для непрозрачности
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    // Анимация появления и масштабирования логотипа
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: duration * 0.7,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: duration * 0.5,
        useNativeDriver: true,
      }),
    ]).start();

    // Запускаем callback после завершения времени показа
    const timer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, duration);

    // Очистка таймера при размонтировании компонента
    return () => clearTimeout(timer);
  }, [onAnimationComplete, duration, scaleAnim, opacityAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Logo size="large" withText={true} />
      </Animated.View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appTheme.colors.background,
    width,
    height,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SplashScreen; 