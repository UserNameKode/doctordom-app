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
  Easing,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import appTheme from '../../constants/theme';

// Анимированные компоненты
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedText = Animated.createAnimatedComponent(Text);

interface ServiceCardProps {
  id: string;
  name: string;
  price: string;
  iconSource: ImageSourcePropType;
  isSelected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  // Для анимации списка
  index?: number;
  isAppearing?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  name,
  price,
  iconSource,
  isSelected = false,
  onPress,
  style,
  index = 0,
  isAppearing = false
}) => {
  // Анимированные значения
  const cardScale = useSharedValue(isAppearing ? 0.8 : 1);
  const cardOpacity = useSharedValue(isAppearing ? 0 : 1);
  
  // Анимация нажатия
  const handlePressIn = () => {
    cardScale.value = withTiming(0.98, { duration: 150 });
  };
  
  const handlePressOut = () => {
    cardScale.value = withTiming(1, { duration: 200 });
  };
  
  // Анимация появления карточки (каскадная)
  React.useEffect(() => {
    if (isAppearing) {
      cardOpacity.value = withDelay(
        index * 80, // Задержка для каскадной анимации
        withTiming(1, { duration: 300 })
      );
      
      cardScale.value = withDelay(
        index * 80,
        withSequence(
          withTiming(1.02, { duration: 250, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 200 })
        )
      );
    }
  }, [isAppearing, index]);
  
  // Анимация изменения фона при выборе
  const animatedCardStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      cardScale.value,
      [0.98, 1],
      [appTheme.colors.background, isSelected ? appTheme.colors.darkBlue : appTheme.colors.white]
    );
    
    return {
      backgroundColor,
      transform: [{ scale: cardScale.value }],
      opacity: cardOpacity.value,
    };
  });
  
  // Анимация цвета текста
  const animatedTitleStyle = useAnimatedStyle(() => {
    const color = isSelected ? appTheme.colors.white : appTheme.colors.text;
    return { color };
  });
  
  const animatedPriceStyle = useAnimatedStyle(() => {
    const color = isSelected ? 'rgba(255, 255, 255, 0.8)' : appTheme.colors.textSecondary;
    return { color };
  });
  
  return (
    <AnimatedTouchable
      style={[styles.container, animatedCardStyle, style]}
      activeOpacity={0.95}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {isSelected && (
        <LinearGradient
          colors={['rgba(149, 193, 31, 0.05)', 'rgba(7, 123, 192, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.selectedGradient}
        />
      )}
      
      <View style={[styles.iconContainer, isSelected && styles.selectedIconContainer]}>
        <Image source={iconSource} style={styles.icon} />
      </View>
      
      <View style={styles.textContainer}>
        <AnimatedText style={[styles.title, animatedTitleStyle]}>
          {name}
        </AnimatedText>
        <AnimatedText style={[styles.price, animatedPriceStyle]}>
          {price}
        </AnimatedText>
      </View>
      
      {isSelected && (
        <View style={styles.checkmarkContainer}>
          <LinearGradient
            colors={[appTheme.colors.primary, appTheme.colors.secondary]}
            style={styles.checkmark}
          >
            <Text style={styles.checkmarkText}>✓</Text>
          </LinearGradient>
        </View>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 80,
    borderRadius: appTheme.borderRadius.xl,
    padding: appTheme.spacing.m,
    marginBottom: appTheme.spacing.m,
    backgroundColor: appTheme.colors.white,
    overflow: 'hidden',
    ...appTheme.shadows.small,
  },
  selectedGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: appTheme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: appTheme.spacing.m,
  },
  selectedIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...appTheme.typography.cardTitle,
    marginBottom: 4,
  },
  price: {
    ...appTheme.typography.cardSubtitle,
  },
  checkmarkContainer: {
    marginLeft: appTheme.spacing.s,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: appTheme.colors.white,
    fontSize: 14,
  },
});

export default ServiceCard; 