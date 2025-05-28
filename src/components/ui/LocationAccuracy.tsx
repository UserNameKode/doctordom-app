import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LocationAccuracyInfo } from '../../utils/locationUtils';
import appTheme from '../../constants/theme';

interface AdditionalLocationInfo {
  strategy?: string;
  timeSpent?: number;
  energyProfile?: 'low' | 'medium' | 'high';
  method?: 'gps' | 'hybrid' | 'cached';
}

interface LocationAccuracyProps {
  accuracyInfo: LocationAccuracyInfo;
  showDetails?: boolean;
  additionalInfo?: AdditionalLocationInfo;
}

/**
 * Компонент для отображения информации о точности геолокации
 */
const LocationAccuracy: React.FC<LocationAccuracyProps> = ({ 
  accuracyInfo, 
  showDetails = false,
  additionalInfo
}) => {
  const getIcon = () => {
    switch (accuracyInfo.level) {
      case 'excellent':
        return 'bullseye-arrow';
      case 'good':
        return 'target';
      case 'fair':
        return 'approximately-equal';
      case 'poor':
        return 'crosshairs-question';
      default:
        return 'help-circle';
    }
  };

  const getStatusText = () => {
    const baseText = `${accuracyInfo.description} (±${accuracyInfo.accuracy.toFixed(0)}м)`;
    
    if (!showDetails) return baseText;
    
    switch (accuracyInfo.level) {
      case 'excellent':
        return `${baseText} • Идеально для точного позиционирования`;
      case 'good':
        return `${baseText} • Подходит для большинства задач`;
      case 'fair':
        return `${baseText} • Рекомендуем уточнить адрес`;
      case 'poor':
        return `${baseText} • Лучше ввести адрес вручную`;
      default:
        return baseText;
    }
  };

  return (
    <View style={[styles.container, { borderColor: accuracyInfo.color }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons 
          name={getIcon()} 
          size={20} 
          color={accuracyInfo.color} 
        />
        <Text style={[styles.title, { color: accuracyInfo.color }]}>
          GPS Точность
        </Text>
      </View>
      
      <Text style={styles.status}>
        {getStatusText()}
      </Text>
      
      {showDetails && (
        <View style={styles.tips}>
          {additionalInfo && (
            <View style={styles.additionalInfo}>
              {additionalInfo.strategy && (
                <Text style={styles.infoItem}>
                  📋 {additionalInfo.strategy} стратегия
                </Text>
              )}
              {additionalInfo.timeSpent !== undefined && (
                <Text style={styles.infoItem}>
                  ⏱️ {(additionalInfo.timeSpent / 1000).toFixed(1)}с
                </Text>
              )}
              {additionalInfo.method && (
                <Text style={styles.infoItem}>
                  🛰️ {additionalInfo.method.toUpperCase()}
                </Text>
              )}
              {additionalInfo.energyProfile && (
                <Text style={styles.infoItem}>
                  🔋 {additionalInfo.energyProfile} энергия
                </Text>
              )}
            </View>
          )}
          
          {accuracyInfo.level === 'poor' && (
            <Text style={styles.tip}>
              💡 Для улучшения точности выйдите на открытое место
            </Text>
          )}
          {accuracyInfo.level === 'fair' && (
            <Text style={styles.tip}>
              💡 Подождите несколько секунд для улучшения сигнала
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.borderRadius.medium,
    borderWidth: 1,
    padding: appTheme.spacing.m,
    marginVertical: appTheme.spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: appTheme.spacing.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: appTheme.spacing.xs,
  },
  status: {
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    lineHeight: 18,
  },
  tips: {
    marginTop: appTheme.spacing.xs,
    paddingTop: appTheme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
  },
  tip: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    fontStyle: 'italic',
  },
  additionalInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appTheme.spacing.xs,
    marginBottom: appTheme.spacing.xs,
  },
  infoItem: {
    fontSize: 11,
    color: appTheme.colors.textSecondary,
    backgroundColor: appTheme.colors.background,
    paddingHorizontal: appTheme.spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
});

export default LocationAccuracy; 