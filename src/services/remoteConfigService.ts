import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Интерфейс для удаленной конфигурации
export interface RemoteNotificationConfig {
  id: string;
  type: string;
  enabled: boolean;
  title: string;
  description: string;
  icon: string;
  sound: boolean;
  vibration: boolean;
  template?: {
    title: string;
    body: string;
  };
  updated_at: string;
}

// Интерфейс для настроек массовых рассылок
export interface RemoteAppSettings {
  mass_notifications_enabled: boolean;
  max_notifications_per_day: number;
  quiet_hours_start: string; // "22:00"
  quiet_hours_end: string;   // "08:00"
  maintenance_mode: boolean;
  maintenance_message: string;
  app_version_required: string;
  features_enabled: {
    push_notifications: boolean;
    location_services: boolean;
    payment_processing: boolean;
    chat_support: boolean;
  };
}

class RemoteConfigService {
  private configCache: Map<string, any> = new Map();
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 минут

  /**
   * Получение удаленной конфигурации уведомлений
   */
  async getNotificationConfig(): Promise<Record<string, RemoteNotificationConfig>> {
    try {
      const cacheKey = 'notification_config';
      
      // Проверяем кэш
      if (this.isCacheValid(cacheKey)) {
        return this.configCache.get(cacheKey);
      }

      // Загружаем из Supabase
      const { data, error } = await supabase
        .from('remote_notification_config')
        .select('*')
        .eq('active', true);

      if (error) {
        console.error('Ошибка загрузки удаленной конфигурации:', error);
        return this.getFallbackConfig();
      }

      // Преобразуем в удобный формат и адаптируем структуру
      const config = data.reduce((acc, item) => {
        // Адаптируем структуру из Supabase к ожидаемому формату
        acc[item.type] = {
          ...item,
          template: {
            title: item.title,
            body: item.description
          }
        };
        return acc;
      }, {} as Record<string, RemoteNotificationConfig>);

      // Сохраняем в кэш и локальное хранилище
      this.configCache.set(cacheKey, config);
      await AsyncStorage.setItem(`remote_${cacheKey}`, JSON.stringify(config));
      this.lastFetchTime = Date.now();

      console.log('✅ Удаленная конфигурация загружена:', Object.keys(config));
      return config;

    } catch (error) {
      console.error('❌ Ошибка получения удаленной конфигурации:', error);
      return this.getFallbackConfig();
    }
  }

  /**
   * Получение настроек приложения
   */
  async getAppSettings(): Promise<RemoteAppSettings> {
    try {
      const cacheKey = 'app_settings';
      
      if (this.isCacheValid(cacheKey)) {
        return this.configCache.get(cacheKey);
      }

      const { data, error } = await supabase
        .from('remote_app_settings')
        .select('*')
        .eq('active', true)
        .single();

      if (error) {
        console.error('Ошибка загрузки настроек приложения:', error);
        return this.getDefaultAppSettings();
      }

      this.configCache.set(cacheKey, data);
      await AsyncStorage.setItem(`remote_${cacheKey}`, JSON.stringify(data));
      this.lastFetchTime = Date.now();

      return data;

    } catch (error) {
      console.error('❌ Ошибка получения настроек приложения:', error);
      return this.getDefaultAppSettings();
    }
  }

  /**
   * Проверка, включен ли тип уведомления удаленно
   */
  async isNotificationTypeEnabled(type: string): Promise<boolean> {
    try {
      const config = await this.getNotificationConfig();
      return config[type]?.enabled ?? true; // По умолчанию включено
    } catch (error) {
      console.error('Ошибка проверки типа уведомления:', error);
      return true; // Fallback - включено
    }
  }

  /**
   * Получение всех включенных типов уведомлений
   */
  async getEnabledNotificationTypes(): Promise<string[]> {
    try {
      const config = await this.getNotificationConfig();
      return Object.entries(config)
        .filter(([_, settings]) => settings.enabled)
        .map(([type, _]) => type);
    } catch (error) {
      console.error('Ошибка получения включенных типов:', error);
      return []; // Fallback - пустой массив
    }
  }

  /**
   * Принудительное обновление конфигурации
   */
  async forceRefresh(): Promise<void> {
    this.configCache.clear();
    this.lastFetchTime = 0;
    await this.getNotificationConfig();
    await this.getAppSettings();
  }

  /**
   * Проверка валидности кэша
   */
  private isCacheValid(key: string): boolean {
    return (
      this.configCache.has(key) && 
      (Date.now() - this.lastFetchTime) < this.CACHE_DURATION
    );
  }

  /**
   * Fallback конфигурация при ошибках
   */
  private async getFallbackConfig(): Promise<Record<string, RemoteNotificationConfig>> {
    try {
      // Пытаемся загрузить из локального хранилища
      const cached = await AsyncStorage.getItem('remote_notification_config');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Ошибка загрузки fallback конфигурации:', error);
    }

    // Возвращаем базовую конфигурацию - только 4 основных типа
    return {
      WORKER_ASSIGNED: {
        id: '1',
        type: 'WORKER_ASSIGNED',
        enabled: true,
        title: 'Мастер назначен! 👨‍🔧',
        description: 'Уведомление о назначении мастера',
        icon: '👨‍🔧',
        sound: true,
        vibration: true,
        template: {
          title: 'Мастер назначен! 👨‍🔧',
          body: 'На ваш заказ назначен мастер {workerName}! Мастер приедет {scheduledDate} в {scheduledTime}. Мы уведомим вас за час до визита!'
        },
        updated_at: new Date().toISOString()
      },
      REMINDER_1H: {
        id: '2',
        type: 'REMINDER_1H',
        enabled: true,
        title: 'Мастер скоро приедет! ⏰',
        description: 'Напоминание за час до визита',
        icon: '⏰',
        sound: true,
        vibration: true,
        template: {
          title: 'Мастер скоро приедет! ⏰',
          body: 'Через 1 час к вам приедет Мастер {workerName}! Пожалуйста будьте дома'
        },
        updated_at: new Date().toISOString()
      },
      RATING_REQUEST: {
        id: '3',
        type: 'RATING_REQUEST',
        enabled: true,
        title: 'Оцените работу мастера! ⭐',
        description: 'Запрос оценки работы',
        icon: '⭐',
        sound: false,
        vibration: false,
        template: {
          title: 'Оцените работу мастера! ⭐',
          body: 'Как прошел визит мастера? Оставьте отзывы и помогите нам стать лучше!'
        },
        updated_at: new Date().toISOString()
      },
      RECEIPT_READY: {
        id: '4',
        type: 'RECEIPT_READY',
        enabled: true,
        title: 'Чек готов! 🧾',
        description: 'Уведомление о готовности чека',
        icon: '🧾',
        sound: false,
        vibration: false,
        template: {
          title: 'Чек готов! 🧾',
          body: 'Чек на услугу доступен в вашем личном кабинете! Спасибо что выбрали нас!'
        },
        updated_at: new Date().toISOString()
      }
    };
  }

  /**
   * Настройки приложения по умолчанию
   */
  private getDefaultAppSettings(): RemoteAppSettings {
    return {
      mass_notifications_enabled: true,
      max_notifications_per_day: 10,
      quiet_hours_start: "22:00",
      quiet_hours_end: "08:00",
      maintenance_mode: false,
      maintenance_message: "",
      app_version_required: "1.0.0",
      features_enabled: {
        push_notifications: true,
        location_services: true,
        payment_processing: true,
        chat_support: true
      }
    };
  }

  /**
   * Проверка режима обслуживания
   */
  async isMaintenanceMode(): Promise<{ enabled: boolean; message: string }> {
    try {
      const settings = await this.getAppSettings();
      return {
        enabled: settings.maintenance_mode,
        message: settings.maintenance_message || 'Приложение временно недоступно'
      };
    } catch (error) {
      return { enabled: false, message: '' };
    }
  }

  /**
   * Проверка минимальной версии приложения
   */
  async checkAppVersion(currentVersion: string): Promise<{ updateRequired: boolean; requiredVersion: string }> {
    try {
      const settings = await this.getAppSettings();
      const required = settings.app_version_required;
      
      // Простое сравнение версий (можно улучшить)
      const updateRequired = this.compareVersions(currentVersion, required) < 0;
      
      return {
        updateRequired,
        requiredVersion: required
      };
    } catch (error) {
      return { updateRequired: false, requiredVersion: currentVersion };
    }
  }

  /**
   * Простое сравнение версий
   */
  private compareVersions(version1: string, version2: string): number {
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;
      
      if (v1part < v2part) return -1;
      if (v1part > v2part) return 1;
    }
    
    return 0;
  }
}

// Экспортируем единственный экземпляр
export const remoteConfigService = new RemoteConfigService(); 