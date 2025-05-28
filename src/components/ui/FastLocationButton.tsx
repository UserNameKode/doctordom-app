import React, { useState } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getFastLocation } from '../../utils/fastLocationUtils';
import { LocationAccuracyInfo } from '../../utils/locationUtils';
import appTheme from '../../constants/theme';

interface FastLocationButtonProps {
  onLocationReceived: (location: any, accuracyInfo: LocationAccuracyInfo) => void;
  onError?: (error: Error) => void;
  strategy?: 'instant' | 'balanced' | 'accurate';
  disabled?: boolean;
  style?: any;
}

const FastLocationButton: React.FC<FastLocationButtonProps> = ({
  onLocationReceived,
  onError,
  strategy = 'balanced',
  disabled = false,
  style
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const getButtonConfig = () => {
    switch (strategy) {
      case 'instant':
        return {
          icon: 'flash',
          text: 'Быстро',
          color: '#FF9500',
          description: 'Мгновенное определение'
        };
      case 'balanced':
        return {
          icon: 'crosshairs-gps',
          text: 'Точно',
          color: appTheme.colors.primary,
          description: 'Сбалансированное определение'
        };
      case 'accurate':
        return {
          icon: 'bullseye-arrow',
          text: 'Максимально',
          color: '#34C759',
          description: 'Максимальная точность'
        };
      default:
        return {
          icon: 'crosshairs-gps',
          text: 'Определить',
          color: appTheme.colors.primary,
          description: 'Определить местоположение'
        };
    }
  };

  const handlePress = async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);
    try {
      console.log(`🔄 Запуск ${strategy} геолокации...`);
      const result = await getFastLocation(strategy);
      
      console.log(`✅ ${strategy} геолокация завершена:`, {
        accuracy: result.accuracyInfo.accuracy,
        level: result.accuracyInfo.level,
        source: result.source
      });
      
      onLocationReceived(result.location, result.accuracyInfo);
    } catch (error) {
      console.error(`❌ Ошибка ${strategy} геолокации:`, error);
      onError?.(error instanceof Error ? error : new Error('Неизвестная ошибка'));
    } finally {
      setIsLoading(false);
    }
  };

  const config = getButtonConfig();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: config.color },
        disabled && styles.disabled,
        style
      ]}
      onPress={handlePress}
      disabled={isLoading || disabled}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <MaterialCommunityIcons 
            name={config.icon} 
            size={18} 
            color="white" 
          />
        )}
        <Text style={styles.text}>{config.text}</Text>
      </View>
      
      {strategy !== 'balanced' && (
        <Text style={styles.description}>{config.description}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: appTheme.borderRadius.small,
    paddingVertical: appTheme.spacing.s,
    paddingHorizontal: appTheme.spacing.m,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: appTheme.spacing.xs,
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default FastLocationButton; 