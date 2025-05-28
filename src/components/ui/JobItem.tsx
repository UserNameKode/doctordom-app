import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  ImageSourcePropType,
  ViewStyle
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  interpolateColor,
  Easing
} from 'react-native-reanimated';
import appTheme from '../../constants/theme';

// Анимированные компоненты
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedText = Animated.createAnimatedComponent(Text);

interface JobItemProps {
  id: string;
  title: string;
  price: string;
  icon?: ImageSourcePropType | React.ReactNode;
  isSelected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const JobItem: React.FC<JobItemProps> = ({
  id,
  title,
  price,
  icon,
  isSelected = false,
  onPress,
  style
}) => {
  // Анимированное значение для масштабирования при нажатии
  const scale = useSharedValue(1);
  
  // Обработчики нажатия для анимации
  const handlePressIn = () => {
    scale.value = withTiming(0.98, { 
      duration: 150, 
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
    });
  };
  
  const handlePressOut = () => {
    scale.value = withTiming(1, { 
      duration: 200, 
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
    });
  };
  
  // Анимированные стили для карточки
  const animatedCardStyle = useAnimatedStyle(() => {
    const backgroundColor = isSelected 
      ? appTheme.colors.jobSelectedBackground 
      : appTheme.colors.jobBackground;
    
    return {
      transform: [{ scale: scale.value }],
      backgroundColor,
    };
  });
  
  // Анимированные стили для текста
  const animatedTitleStyle = useAnimatedStyle(() => {
    const color = isSelected 
      ? appTheme.colors.jobSelectedText 
      : appTheme.colors.text;
    
    return { color };
  });
  
  const animatedPriceStyle = useAnimatedStyle(() => {
    const color = isSelected 
      ? appTheme.colors.jobSelectedText 
      : appTheme.colors.textSecondary;
    
    return { color };
  });
  
  // Функция для определения типа иконки
  const renderIcon = () => {
    if (!icon) return null;
    
    // Проверяем, является ли иконка React компонентом или ImageSourcePropType
    if (React.isValidElement(icon)) {
      return (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      );
    } else {
      return (
        <View style={styles.iconContainer}>
          <Image source={icon as ImageSourcePropType} style={styles.icon} />
        </View>
      );
    }
  };
  
  return (
    <AnimatedTouchable
      style={[styles.container, animatedCardStyle, style]}
      activeOpacity={0.95}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {renderIcon()}
      
      <View style={styles.contentContainer}>
        <AnimatedText style={[styles.title, animatedTitleStyle]}>
          {title}
        </AnimatedText>
        <AnimatedText style={[styles.price, animatedPriceStyle]}>
          {price}
        </AnimatedText>
      </View>
      
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedIndicatorText}>✓</Text>
        </View>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: appTheme.spacing.m,
    marginBottom: appTheme.spacing.m,
    borderRadius: appTheme.borderRadius.xl,
    backgroundColor: appTheme.colors.jobBackground,
    ...appTheme.shadows.jobItem,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: appTheme.borderRadius.medium,
    backgroundColor: appTheme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: appTheme.spacing.m,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    ...appTheme.typography.jobTitle,
    marginBottom: 4,
  },
  price: {
    ...appTheme.typography.jobSalary,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: appTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: appTheme.spacing.m,
  },
  selectedIndicatorText: {
    color: appTheme.colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default JobItem; 