import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  TouchableOpacityProps, 
  ActivityIndicator, 
  View,
  ColorValue,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  Easing 
} from 'react-native-reanimated';
import appTheme from '../../constants/theme';

interface GradientButtonProps extends TouchableOpacityProps {
  title: string;
  colors?: string[];
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'subtle';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  colors = appTheme.colors.gradients.primary as string[],
  isLoading = false,
  startIcon,
  endIcon,
  variant = 'default',
  size = 'medium',
  fullWidth = false,
  style,
  onPress,
  disabled,
  ...rest
}) => {
  // Анимация нажатия
  const scale = useSharedValue(1);
  
  // Определяем высоту кнопки в зависимости от размера
  const getButtonHeight = () => {
    switch (size) {
      case 'small': return 36;
      case 'large': return 56;
      default: return 48;
    }
  };
  
  // Функции для анимации нажатия
  const handlePressIn = () => {
    scale.value = withTiming(0.96, { 
      duration: 150, 
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
    });
  };
  
  const handlePressOut = () => {
    scale.value = withTiming(1, { 
      duration: 150, 
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
    });
  };
  
  // Стили анимации
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  // Выбор цветов градиента в зависимости от варианта
  const getGradientColors = (): readonly [ColorValue, ColorValue, ...ColorValue[]] => {
    if (disabled) {
      return ['#E0E0E0', '#D0D0D0'];
    }
    
    switch (variant) {
      case 'outline':
        return ['transparent', 'transparent'];
      case 'subtle':
        return ['rgba(149, 193, 31, 0.1)', 'rgba(149, 193, 31, 0.05)'];
      default:
        return colors.length >= 2 ? colors as [ColorValue, ColorValue, ...ColorValue[]] : [colors[0] || '#95C11F', colors[1] || '#7BA428'];
    }
  };
  
  // Стили текста в зависимости от варианта
  const getTextColor = () => {
    if (disabled) {
      return appTheme.colors.disabled;
    }
    
    switch (variant) {
      case 'outline':
      case 'subtle':
        return appTheme.colors.primary;
      default:
        return appTheme.colors.white;
    }
  };
  
  // Рендер содержимого кнопки
  const renderContent = () => {
    return (
      <View style={styles.contentContainer}>
        {isLoading ? (
          <ActivityIndicator 
            color={getTextColor()} 
            size="small" 
          />
        ) : (
          <>
            {startIcon && <View style={styles.iconContainer}>{startIcon}</View>}
            <Text 
              style={[
                styles.text, 
                appTheme.typography.button, 
                { color: getTextColor() }
              ]}
            >
              {title}
            </Text>
            {endIcon && <View style={styles.iconContainer}>{endIcon}</View>}
          </>
        )}
      </View>
    );
  };
  
  return (
    <AnimatedTouchable
      activeOpacity={0.9}
      onPress={!disabled && !isLoading ? onPress : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.button,
        { height: getButtonHeight() },
        fullWidth && styles.fullWidth,
        animatedStyle,
        style
      ]}
      disabled={disabled || isLoading}
      {...rest}
    >
      <AnimatedLinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          variant === 'outline' && styles.outlineVariant,
        ]}
      >
        {renderContent()}
      </AnimatedLinearGradient>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: appTheme.borderRadius.large,
    overflow: 'hidden',
    ...appTheme.shadows.button,
    minWidth: 120,
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    flex: 1,
    borderRadius: appTheme.borderRadius.large,
  },
  outlineVariant: {
    borderWidth: 2,
    borderColor: appTheme.colors.primary,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: appTheme.spacing.l,
  },
  text: {
    textAlign: 'center',
  },
  iconContainer: {
    marginHorizontal: appTheme.spacing.xs,
  },
});

export default GradientButton; 