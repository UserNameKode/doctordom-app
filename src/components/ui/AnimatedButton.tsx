import React from 'react';
import { TouchableOpacity, StyleSheet, Animated, Easing, ViewStyle, TextStyle, View } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import appTheme from '../../constants/theme';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  mode?: 'primary' | 'secondary' | 'outline' | 'text';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Анимированная кнопка с эффектом нажатия
 */
const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  icon,
  mode = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const theme = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  // Определение стилей в зависимости от режима
  const getButtonStyle = () => {
    switch (mode) {
      case 'primary':
        return {
          backgroundColor: disabled ? theme.colors.surfaceDisabled : theme.colors.primary,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? theme.colors.surfaceDisabled : theme.colors.secondary,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? theme.colors.surfaceDisabled : theme.colors.primary,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: disabled ? theme.colors.surfaceDisabled : theme.colors.primary,
          borderWidth: 0,
        };
    }
  };
  
  // Определение стиля текста в зависимости от режима
  const getTextStyle = () => {
    switch (mode) {
      case 'primary':
      case 'secondary':
        return { color: theme.colors.onPrimary };
      case 'outline':
        return { color: disabled ? theme.colors.surfaceDisabled : theme.colors.primary };
      case 'text':
        return { color: disabled ? theme.colors.surfaceDisabled : theme.colors.primary };
      default:
        return { color: theme.colors.onPrimary };
    }
  };
  
  // Анимация при нажатии
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.button,
          getButtonStyle(),
          style,
        ]}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator 
              size={24} 
              color={mode === 'outline' || mode === 'text' ? theme.colors.primary : theme.colors.onPrimary} 
            />
          </View>
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  loadingContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    width: 24,
    height: 24,
  },
});

export default AnimatedButton; 