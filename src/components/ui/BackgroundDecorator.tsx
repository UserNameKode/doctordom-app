import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Path, G, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import appTheme from '../../constants/theme';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';

interface BackgroundDecoratorProps {
  variant?: 'top-right' | 'bottom-left' | 'center' | 'full';
  intensity?: number;
  style?: StyleProp<ViewStyle>;
  animate?: boolean;
}

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const BackgroundDecorator: React.FC<BackgroundDecoratorProps> = ({
  variant = 'top-right',
  intensity = 40,
  style,
  animate = true,
}) => {
  // Анимированные значения
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  
  // Запускаем анимацию при монтировании
  React.useEffect(() => {
    if (animate) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 60000, easing: Easing.linear }), 
        -1, // бесконечное повторение
        false
      );
      
      scale.value = withRepeat(
        withTiming(1.05, { 
          duration: 4000, 
          easing: Easing.inOut(Easing.quad) 
        }), 
        -1, 
        true
      );
    }
  }, [animate]);
  
  // Стили для анимации
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value }
      ],
    };
  });
  
  // Возвращает соответствующий SVG в зависимости от варианта
  const renderDecoration = () => {
    switch (variant) {
      case 'top-right':
        return (
          <AnimatedSvg
            width="180"
            height="180"
            viewBox="0 0 180 180"
            style={[styles.topRight, animatedStyle]}
          >
            <Defs>
              <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={appTheme.colors.secondary} stopOpacity="0.1" />
                <Stop offset="100%" stopColor={appTheme.colors.primary} stopOpacity="0.15" />
              </LinearGradient>
            </Defs>
            <Circle cx="90" cy="0" r="90" fill="url(#grad1)" />
            <G opacity="0.2">
              <Circle cx="150" cy="30" r="10" fill={appTheme.colors.primary} />
              <Circle cx="120" cy="60" r="6" fill={appTheme.colors.secondary} />
              <Circle cx="140" cy="80" r="8" fill={appTheme.colors.darkBlue} />
            </G>
          </AnimatedSvg>
        );
        
      case 'bottom-left':
        return (
          <AnimatedSvg
            width="150"
            height="150"
            viewBox="0 0 150 150"
            style={[styles.bottomLeft, animatedStyle]}
          >
            <Defs>
              <LinearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={appTheme.colors.primary} stopOpacity="0.1" />
                <Stop offset="100%" stopColor={appTheme.colors.secondary} stopOpacity="0.1" />
              </LinearGradient>
            </Defs>
            <Path
              d="M150,0 C67.2,0 0,67.2 0,150 L150,150 L150,0 Z"
              fill="url(#grad2)"
            />
            <G opacity="0.15">
              <Circle cx="30" cy="120" r="12" fill={appTheme.colors.primary} />
              <Circle cx="70" cy="100" r="8" fill={appTheme.colors.darkBlue} />
            </G>
          </AnimatedSvg>
        );
        
      case 'center':
        return (
          <AnimatedSvg
            width="300"
            height="300"
            viewBox="0 0 300 300"
            style={[styles.center, animatedStyle]}
          >
            <Defs>
              <LinearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={appTheme.colors.secondary} stopOpacity="0.03" />
                <Stop offset="100%" stopColor={appTheme.colors.primary} stopOpacity="0.05" />
              </LinearGradient>
            </Defs>
            <Circle cx="150" cy="150" r="150" fill="url(#grad3)" />
            <G opacity="0.1">
              <Circle cx="100" cy="100" r="30" fill={appTheme.colors.primary} />
              <Circle cx="200" cy="150" r="20" fill={appTheme.colors.secondary} />
              <Circle cx="120" cy="220" r="25" fill={appTheme.colors.darkBlue} />
            </G>
          </AnimatedSvg>
        );
        
      case 'full':
        return (
          <AnimatedSvg
            width={appTheme.SCREEN_WIDTH}
            height={appTheme.SCREEN_HEIGHT}
            style={[styles.full, animatedStyle]}
          >
            <Defs>
              <LinearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={appTheme.colors.background} stopOpacity="1" />
                <Stop offset="100%" stopColor={appTheme.colors.background} stopOpacity="0.8" />
              </LinearGradient>
            </Defs>
            <Rect
              x="0"
              y="0"
              width={appTheme.SCREEN_WIDTH}
              height={appTheme.SCREEN_HEIGHT}
              fill="url(#grad4)"
            />
            <G opacity="0.07">
              <Circle cx={appTheme.SCREEN_WIDTH * 0.8} cy={appTheme.SCREEN_HEIGHT * 0.2} r="100" fill={appTheme.colors.secondary} />
              <Circle cx={appTheme.SCREEN_WIDTH * 0.2} cy={appTheme.SCREEN_HEIGHT * 0.8} r="120" fill={appTheme.colors.primary} />
              <Circle cx={appTheme.SCREEN_WIDTH * 0.6} cy={appTheme.SCREEN_HEIGHT * 0.6} r="80" fill={appTheme.colors.darkBlue} />
            </G>
          </AnimatedSvg>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      {renderDecoration()}
      <BlurView intensity={intensity} style={styles.blurView} tint="light" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'hidden',
  },
  topRight: {
    position: 'absolute',
    top: -90,
    right: -90,
  },
  bottomLeft: {
    position: 'absolute',
    bottom: -50,
    left: -50,
  },
  center: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -150,
    marginTop: -150,
  },
  full: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default BackgroundDecorator; 