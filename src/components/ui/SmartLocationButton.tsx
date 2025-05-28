import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Portal, Modal, List, Divider, ActivityIndicator } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import appTheme from '../../constants/theme';
import { getSmartLocation, getQualityLocation, getQuickLocation, QualityLocationService } from '../../utils/qualityLocationUtils';

interface SmartLocationButtonProps {
  onLocationReceived: (result: any) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  defaultStrategy?: 'smart' | 'quick' | 'quality';
  requiredAccuracy?: number;
  energyPreference?: 'efficiency' | 'accuracy' | 'balanced';
}

interface LocationStrategy {
  key: 'smart' | 'quick' | 'quality';
  title: string;
  description: string;
  icon: string;
  energyProfile: 'low' | 'medium' | 'high';
  estimatedTime: string;
  accuracyRange: string;
  color: string;
}

const LOCATION_STRATEGIES: LocationStrategy[] = [
  {
    key: 'quick',
    title: 'Быстрое определение',
    description: 'WiFi/Cell сети, низкое энергопотребление',
    icon: 'flash',
    energyProfile: 'low',
    estimatedTime: '3-6 сек',
    accuracyRange: '50-100м',
    color: '#4CAF50'
  },
  {
    key: 'smart',
    title: 'Умное определение',
    description: 'Автоматический выбор оптимальной стратегии',
    icon: 'brain',
    energyProfile: 'medium',
    estimatedTime: '5-15 сек',
    accuracyRange: '10-50м',
    color: '#2196F3'
  },
  {
    key: 'quality',
    title: 'Качественное определение',
    description: 'GPS + прогрессивное улучшение точности',
    icon: 'target',
    energyProfile: 'high',
    estimatedTime: '10-30 сек',
    accuracyRange: '3-20м',
    color: '#FF9800'
  }
];

const ENERGY_PREFERENCES = [
  {
    key: 'efficiency' as const,
    title: 'Энергосбережение',
    description: 'Минимальное потребление батареи',
    icon: 'battery-high'
  },
  {
    key: 'balanced' as const,
    title: 'Сбалансированно',
    description: 'Оптимальный баланс скорости и точности',
    icon: 'scale-balance'
  },
  {
    key: 'accuracy' as const,
    title: 'Максимальная точность',
    description: 'Лучшая доступная точность',
    icon: 'crosshairs-gps'
  }
];

const SmartLocationButton: React.FC<SmartLocationButtonProps> = ({
  onLocationReceived,
  onError,
  disabled = false,
  defaultStrategy = 'smart',
  requiredAccuracy = 50,
  energyPreference = 'balanced'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<'smart' | 'quick' | 'quality'>(defaultStrategy as 'smart' | 'quick' | 'quality');
  const [selectedEnergyPreference, setSelectedEnergyPreference] = useState<'efficiency' | 'accuracy' | 'balanced'>(energyPreference as 'efficiency' | 'accuracy' | 'balanced');
  const [currentAccuracy, setCurrentAccuracy] = useState(requiredAccuracy);
  const [lastResult, setLastResult] = useState<any>(null);
  const [cacheInfo, setCacheInfo] = useState<any>(null);

  // Получаем информацию о кэше
  React.useEffect(() => {
    const service = QualityLocationService.getInstance();
    const info = service.getCacheInfo();
    setCacheInfo(info);
  }, []);

  const executeLocationStrategy = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setLastResult(null);

    try {
      let result;
      
      switch (selectedStrategy) {
        case 'quick':
          console.log('⚡ Выполняем быстрое определение');
          result = await getQuickLocation();
          break;
          
        case 'smart':
          console.log('🧠 Выполняем умное определение');
          result = await getSmartLocation(currentAccuracy, 30000, selectedEnergyPreference);
          break;
          
        case 'quality':
          console.log('🎯 Выполняем качественное определение');
          result = await getQualityLocation(currentAccuracy, 45000);
          break;
          
        default:
          throw new Error('Неизвестная стратегия');
      }

      console.log('✅ Местоположение получено:', {
        strategy: result.strategy,
        accuracy: `${result.accuracyInfo.accuracy.toFixed(0)}м`,
        timeSpent: `${(result.timeSpent/1000).toFixed(1)}с`,
        energyProfile: result.energyProfile,
        method: result.method
      });

      setLastResult(result);
      onLocationReceived(result);

      // Обновляем информацию о кэше
      const service = QualityLocationService.getInstance();
      const info = service.getCacheInfo();
      setCacheInfo(info);

    } catch (error) {
      console.error('❌ Ошибка определения местоположения:', error);
      
      // Только логи, без показа ошибок пользователю
      const errorMessage = (error as Error).message;
      
      if (errorMessage.includes('время') || errorMessage.includes('timeout')) {
        console.log('⏱️ Время ожидания GPS истекло');
      } else {
        console.log('🚫 Ошибка геолокации:', errorMessage);
      }

      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStrategy, selectedEnergyPreference, currentAccuracy, isLoading, onLocationReceived, onError]);

  const clearCache = useCallback(() => {
    const service = QualityLocationService.getInstance();
    service.clearCache();
    setCacheInfo(null);
    console.log('🗑️ Кэш геолокации очищен');
  }, []);

  const getStrategyInfo = (strategyKey: string) => {
    return LOCATION_STRATEGIES.find(s => s.key === strategyKey);
  };

  const currentStrategy = getStrategyInfo(selectedStrategy);

  return (
    <View style={styles.container}>
      {/* Основная кнопка */}
      <TouchableOpacity
        style={[
          styles.mainButton,
          { backgroundColor: currentStrategy?.color || appTheme.colors.primary },
          disabled && styles.disabledButton
        ]}
        onPress={executeLocationStrategy}
        disabled={disabled || isLoading}
        onLongPress={() => setShowSettings(true)}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <MaterialCommunityIcons 
            name={currentStrategy?.icon || 'crosshairs-gps'} 
            size={20} 
            color="white" 
          />
        )}
        <Text style={styles.mainButtonText}>
          {isLoading ? 'Определяем...' : currentStrategy?.title || 'Определить местоположение'}
        </Text>
      </TouchableOpacity>

      {/* Кнопка настроек */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setShowSettings(true)}
        disabled={disabled}
      >
        <MaterialCommunityIcons name="cog" size={20} color={appTheme.colors.textSecondary} />
      </TouchableOpacity>

      {/* Информация о результате убрана по просьбе пользователя */}

      {/* Информация о кэше */}
      {cacheInfo?.hasCache && (
        <View style={styles.cacheInfo}>
          <MaterialCommunityIcons name="database" size={16} color={appTheme.colors.textSecondary} />
          <Text style={styles.cacheText}>
            Кэш: {cacheInfo.accuracy?.toFixed(0)}м, {Math.round(cacheInfo.age / 1000)}с назад ({cacheInfo.source})
          </Text>
          <TouchableOpacity onPress={clearCache} style={styles.clearCacheButton}>
            <MaterialCommunityIcons name="delete" size={14} color={appTheme.colors.error} />
          </TouchableOpacity>
        </View>
      )}

      {/* Модальное окно настроек */}
      <Portal>
        <Modal
          visible={showSettings}
          onDismiss={() => setShowSettings(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Настройки геолокации</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <MaterialCommunityIcons name="close" size={24} color={appTheme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Divider style={styles.divider} />

          {/* Выбор стратегии */}
          <Text style={styles.sectionTitle}>Стратегия определения</Text>
          {LOCATION_STRATEGIES.map((strategy) => (
            <List.Item
              key={strategy.key}
              title={strategy.title}
              description={
                <View>
                  <Text style={styles.strategyDescription}>{strategy.description}</Text>
                  <View style={styles.strategyMeta}>
                    <Text style={styles.strategyMetaText}>
                      ⏱️ {strategy.estimatedTime} • 🎯 {strategy.accuracyRange} • 🔋 {strategy.energyProfile}
                    </Text>
                  </View>
                </View>
              }
              left={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name={strategy.icon}
                  size={24}
                  color={strategy.color}
                />
              )}
              right={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name={selectedStrategy === strategy.key ? 'radiobox-marked' : 'radiobox-blank'}
                  size={24}
                  color={selectedStrategy === strategy.key ? strategy.color : appTheme.colors.textSecondary}
                />
              )}
              onPress={() => setSelectedStrategy(strategy.key)}
              style={[
                styles.listItem,
                selectedStrategy === strategy.key && { backgroundColor: strategy.color + '10' }
              ]}
            />
          ))}

          <Divider style={styles.divider} />

          {/* Выбор энергетических предпочтений */}
          <Text style={styles.sectionTitle}>Энергетические предпочтения</Text>
          {ENERGY_PREFERENCES.map((pref) => (
            <List.Item
              key={pref.key}
              title={pref.title}
              description={pref.description}
              left={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name={pref.icon}
                  size={24}
                  color={appTheme.colors.primary}
                />
              )}
              right={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name={selectedEnergyPreference === pref.key ? 'radiobox-marked' : 'radiobox-blank'}
                  size={24}
                  color={selectedEnergyPreference === pref.key ? appTheme.colors.primary : appTheme.colors.textSecondary}
                />
              )}
              onPress={() => setSelectedEnergyPreference(pref.key)}
              style={[
                styles.listItem,
                selectedEnergyPreference === pref.key && { backgroundColor: appTheme.colors.primary + '10' }
              ]}
            />
          ))}

          <Divider style={styles.divider} />

          {/* Настройка точности */}
          <View style={styles.accuracySection}>
            <Text style={styles.sectionTitle}>Требуемая точность: {currentAccuracy}м</Text>
            <View style={styles.accuracyButtons}>
              {[10, 20, 50, 100].map((accuracy) => (
                <TouchableOpacity
                  key={accuracy}
                  style={[
                    styles.accuracyButton,
                    currentAccuracy === accuracy && styles.accuracyButtonSelected
                  ]}
                  onPress={() => setCurrentAccuracy(accuracy)}
                >
                  <Text
                    style={[
                      styles.accuracyButtonText,
                      currentAccuracy === accuracy && styles.accuracyButtonTextSelected
                    ]}
                  >
                    {accuracy}м
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Дополнительные действия */}
          <View style={styles.actionsSection}>
            {cacheInfo?.hasCache && (
              <Button
                mode="outlined"
                onPress={clearCache}
                icon="delete"
                style={styles.actionButton}
              >
                Очистить кэш
              </Button>
            )}
            
            <Button
              mode="contained"
              onPress={() => {
                setShowSettings(false);
                executeLocationStrategy();
              }}
              icon={currentStrategy?.icon}
              style={[styles.actionButton, { backgroundColor: currentStrategy?.color }]}
            >
              Применить и определить
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: appTheme.spacing.s,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: appTheme.spacing.m,
    backgroundColor: appTheme.colors.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  mainButtonText: {
    color: 'white',
    marginLeft: appTheme.spacing.s,
    fontWeight: 'bold',
    fontSize: 16,
  },
  settingsButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    padding: appTheme.spacing.xs,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cacheInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: appTheme.spacing.xs,
    padding: appTheme.spacing.xs,
    backgroundColor: appTheme.colors.surface,
    borderRadius: 4,
  },
  cacheText: {
    flex: 1,
    marginLeft: appTheme.spacing.xs,
    fontSize: 12,
    color: appTheme.colors.textSecondary,
  },
  clearCacheButton: {
    padding: appTheme.spacing.xs,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: appTheme.spacing.m,
    margin: appTheme.spacing.m,
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: appTheme.spacing.s,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: appTheme.spacing.m,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: appTheme.spacing.s,
    color: appTheme.colors.text,
  },
  listItem: {
    paddingVertical: appTheme.spacing.s,
    borderRadius: 8,
    marginVertical: 2,
  },
  strategyDescription: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    marginBottom: 4,
  },
  strategyMeta: {
    marginTop: 4,
  },
  strategyMetaText: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    fontStyle: 'italic',
  },
  accuracySection: {
    marginVertical: appTheme.spacing.s,
  },
  accuracyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: appTheme.spacing.s,
  },
  accuracyButton: {
    flex: 1,
    padding: appTheme.spacing.s,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    alignItems: 'center',
    marginHorizontal: 2,
    backgroundColor: appTheme.colors.surface,
  },
  accuracyButtonSelected: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  accuracyButtonText: {
    fontSize: 14,
    color: appTheme.colors.text,
  },
  accuracyButtonTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionsSection: {
    marginTop: appTheme.spacing.m,
  },
  actionButton: {
    marginVertical: appTheme.spacing.xs,
  },
});

export default SmartLocationButton; 