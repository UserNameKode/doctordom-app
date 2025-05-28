import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { remoteConfigService, RemoteNotificationConfig } from '../services/remoteConfigService';

interface NotificationSettingsProps {
  onSettingsChange?: (settings: Record<string, boolean>) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onSettingsChange,
}) => {
  const [config, setConfig] = useState<Record<string, RemoteNotificationConfig>>({});
  const [localSettings, setLocalSettings] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Загрузка конфигурации
  const loadConfig = async () => {
    try {
      const remoteConfig = await remoteConfigService.getNotificationConfig();
      setConfig(remoteConfig);
      
      // Инициализируем локальные настройки
      const settings: Record<string, boolean> = {};
      Object.entries(remoteConfig).forEach(([type, config]) => {
        settings[type] = config.enabled;
      });
      setLocalSettings(settings);
      
      onSettingsChange?.(settings);
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить настройки уведомлений');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Обновление настроек
  const handleRefresh = () => {
    setRefreshing(true);
    remoteConfigService.forceRefresh().then(() => {
      loadConfig();
    });
  };

  // Переключение настройки (только локально)
  const toggleSetting = (type: string, value: boolean) => {
    const newSettings = { ...localSettings, [type]: value };
    setLocalSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Загрузка настроек...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>🔔 Настройки уведомлений</Text>
        <Text style={styles.subtitle}>
          Управляйте типами уведомлений, которые хотите получать
        </Text>
      </View>

      {Object.entries(config).map(([type, notificationConfig]) => (
        <View key={type} style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingIcon}>{notificationConfig.icon}</Text>
              <Text style={styles.settingTitle}>{notificationConfig.title}</Text>
            </View>
            
            {notificationConfig.description && (
              <Text style={styles.settingDescription}>
                {notificationConfig.description}
              </Text>
            )}
            
            <View style={styles.settingDetails}>
              <Text style={styles.settingDetail}>
                🔊 {notificationConfig.sound ? 'Со звуком' : 'Без звука'}
              </Text>
              <Text style={styles.settingDetail}>
                📳 {notificationConfig.vibration ? 'С вибрацией' : 'Без вибрации'}
              </Text>
            </View>
          </View>

          <View style={styles.switchContainer}>
            <Switch
              value={localSettings[type] && notificationConfig.enabled}
              onValueChange={(value) => toggleSetting(type, value)}
              disabled={!notificationConfig.enabled}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={localSettings[type] ? '#f5dd4b' : '#f4f3f4'}
            />
            
            {!notificationConfig.enabled && (
              <Text style={styles.disabledText}>Отключено администратором</Text>
            )}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshButtonText}>🔄 Обновить настройки</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Некоторые настройки могут быть заблокированы администратором
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  settingItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  settingDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  settingDetail: {
    fontSize: 12,
    color: '#888',
  },
  switchContainer: {
    alignItems: 'center',
  },
  disabledText: {
    fontSize: 10,
    color: '#dc3545',
    marginTop: 4,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#007bff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 