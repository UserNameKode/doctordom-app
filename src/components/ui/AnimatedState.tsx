import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withDelay,
  Easing
} from 'react-native-reanimated';
import appTheme from '../../constants/theme';

// Предопределенные анимации
const animations = {
  loading: require('../../../assets/animations/loading.json'),
  empty: require('../../../assets/animations/empty.json'),
  success: require('../../../assets/animations/success.json'),
  error: require('../../../assets/animations/error.json'),
};

type AnimationKey = keyof typeof animations;
export type AnimationType = AnimationKey | 'custom';

const AnimatedLottie = Animated.createAnimatedComponent(LottieView);
const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedStateProps {
  type: AnimationType;
  customAnimation?: any; // Для загрузки собственной анимации
  message?: string;
  style?: ViewStyle;
  loop?: boolean;
  autoplay?: boolean;
  size?: number;
}

const AnimatedState: React.FC<AnimatedStateProps> = ({
  type,
  customAnimation,
  message,
  style,
  loop = true,
  autoplay = true,
  size = 200,
}) => {
  const lottieRef = useRef<LottieView>(null);
  
  // Анимированные значения
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const textOpacity = useSharedValue(0);
  
  // Анимация появления
  useEffect(() => {
    opacity.value = withTiming(1, { 
      duration: 600, 
      easing: Easing.out(Easing.cubic) 
    });
    
    translateY.value = withTiming(0, { 
      duration: 600, 
      easing: Easing.out(Easing.cubic)  
    });
    
    textOpacity.value = withDelay(300, withTiming(1, { 
      duration: 400, 
      easing: Easing.inOut(Easing.quad) 
    }));
  }, []);
  
  // Определяем источник анимации
  const getAnimationSource = () => {
    if (type === 'custom' && customAnimation) {
      return customAnimation;
    }
    
    // Используем встроенные анимации или заглушки
    return type !== 'custom' ? animations[type] : animations.loading;
  };
  
  // Анимированные стили
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
  
  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: translateY.value * 0.5 }],
  }));
  
  return (
    <View style={[styles.container, style]}>
      <AnimatedLottie
        ref={lottieRef}
        source={getAnimationSource()}
        style={[
          { width: size, height: size },
          animatedStyle
        ]}
        autoPlay={autoplay}
        loop={loop}
      />
      
      {message && (
        <AnimatedText 
          style={[
            styles.text, 
            animatedTextStyle,
            type === 'error' && styles.errorText
          ]}
        >
          {message}
        </AnimatedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: appTheme.spacing.l,
  },
  text: {
    ...appTheme.typography.cardTitle,
    color: appTheme.colors.textSecondary,
    textAlign: 'center',
    marginTop: appTheme.spacing.m,
    maxWidth: 250,
  },
  errorText: {
    color: appTheme.colors.error,
  },
});

export default AnimatedState; 