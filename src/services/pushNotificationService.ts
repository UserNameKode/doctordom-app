import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { remoteConfigService } from './remoteConfigService';

// Настройка поведения уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationType {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  template: {
    title: string;
    body: string;
  };
}

// Типы уведомлений для бытовых услуг - только 4 основных для конкретного пользователя
export const NOTIFICATION_TYPES: Record<string, NotificationType> = {
  WORKER_ASSIGNED: {
    id: 'WORKER_ASSIGNED',
    name: 'Мастер назначен',
    description: 'Уведомление о назначении мастера',
    enabled: true,
    sound: true,
    vibration: true,
    template: {
      title: 'Мастер назначен! 👨‍🔧',
      body: 'На ваш заказ назначен мастер {workerName}! Мастер приедет {scheduledDate} в {scheduledTime}. Мы уведомим вас за час до визита!'
    }
  },

  REMINDER_1H: {
    id: 'REMINDER_1H',
    name: 'Напоминание за час',
    description: 'Напоминание за 1 час до визита',
    enabled: true,
    sound: true,
    vibration: true,
    template: {
      title: 'Мастер скоро приедет! ⏰',
      body: 'Через 1 час к вам приедет Мастер {workerName}! Пожалуйста будьте дома'
    }
  },

  RATING_REQUEST: {
    id: 'RATING_REQUEST',
    name: 'Запрос оценки',
    description: 'Просьба оценить качество работы',
    enabled: true,
    sound: false,
    vibration: false,
    template: {
      title: 'Оцените работу мастера! ⭐',
      body: 'Как прошел визит мастера? Оставьте отзывы и помогите нам стать лучше!'
    }
  },

  RECEIPT_READY: {
    id: 'RECEIPT_READY',
    name: 'Чек готов',
    description: 'Уведомление о готовности чека',
    enabled: true,
    sound: false,
    vibration: false,
    template: {
      title: 'Чек готов! 🧾',
      body: 'Чек на услугу доступен в вашем личном кабинете! Спасибо что выбрали нас!'
    }
  }
};

class PushNotificationService {
  private pushToken: string | null = null;
  private userId: string | null = null;

  // Инициализация сервиса
  async initialize(userId: string): Promise<boolean> {
    try {
      this.userId = userId;
      
      if (!Device.isDevice) {
        console.log('📱 Push уведомления работают только на реальных устройствах');
        return false;
      }

      // Запрашиваем разрешения
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Разрешение на push уведомления не получено');
        return false;
      }

      // Получаем push токен
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || 'b5d7328e-3e0c-4b93-bb9c-252ef9c89d77';
      
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });

      this.pushToken = tokenData.data;
      console.log('📱 Push токен получен:', this.pushToken);

      // Сохраняем токен в базе данных
      await this.savePushToken(userId, this.pushToken);

      // Настраиваем слушатели уведомлений
      this.setupNotificationListeners();

      return true;
    } catch (error) {
      console.error('❌ Ошибка инициализации push уведомлений:', error);
      return false;
    }
  }

  // Настройка слушателей уведомлений
  setupNotificationListeners(): void {
    try {
      // Слушатель получения уведомлений когда приложение активно
      Notifications.addNotificationReceivedListener(notification => {
        console.log('📱 Уведомление получено:', notification);
      });

      // Слушатель нажатий на уведомления
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log('👆 Пользователь нажал на уведомление:', response);
        
        // Здесь можно добавить навигацию в зависимости от типа уведомления
        const notificationData = response.notification.request.content.data;
        if (notificationData?.type) {
          console.log('📋 Тип уведомления:', notificationData.type);
          // TODO: Добавить навигацию по типу уведомления
        }
      });

      console.log('👂 Слушатели push уведомлений настроены');
    } catch (error) {
      console.error('❌ Ошибка настройки слушателей уведомлений:', error);
    }
  }

  // Сохранение push токена в базе данных
  private async savePushToken(userId: string, token: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('push_tokens')
        .upsert({
          user_id: userId,
          token: token,
          platform: Platform.OS,
          device_id: Constants.deviceId || 'unknown',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,device_id'
        });

      if (error) {
        console.warn('⚠️ Не удалось сохранить push токен в базе данных:', error.message);
        console.log('📱 Push токен сохранен локально для тестирования');
      } else {
        console.log('✅ Push токен сохранен в базе данных');
      }
    } catch (error) {
      console.warn('⚠️ Ошибка при сохранении push токена:', error);
      console.log('📱 Push токен сохранен локально для тестирования');
    }
  }

  // Отправка настоящего push уведомления через Edge Function
  async sendRealPushNotification(
    type: string, 
    data: Record<string, any> = {},
    targetType: 'single' | 'mass' | 'targeted' = 'single',
    options: {
      userIds?: string[];
      platform?: 'all' | 'ios' | 'android';
    } = {}
  ): Promise<boolean> {
    try {
      // Получаем конфигурацию уведомлений
      const config = await remoteConfigService.getNotificationConfig();
      const notificationConfig = config[type];

      if (!notificationConfig || !notificationConfig.enabled) {
        console.log(`⚠️ Уведомление типа ${type} отключено`);
        return false;
      }

      // Подготавливаем шаблон с проверкой на undefined
      const template = notificationConfig.template || NOTIFICATION_TYPES[type]?.template || { title: 'Уведомление', body: 'Новое уведомление' };
      let { title, body } = template;
      
      // Заменяем переменные в шаблоне
      Object.keys(data).forEach(key => {
        const placeholder = `{${key}}`;
        title = title.replace(new RegExp(placeholder, 'g'), data[key]);
        body = body.replace(new RegExp(placeholder, 'g'), data[key]);
      });

      // Подготавливаем запрос
      const requestData: any = {
        type: targetType,
        title,
        body,
        data: {
          type,
          ...data
        }
      };

      // Добавляем специфичные параметры в зависимости от типа
      switch (targetType) {
        case 'single':
          if (!this.pushToken) {
            console.log('❌ Push токен не найден для single отправки');
            return false;
          }
          requestData.pushToken = this.pushToken;
          break;
        
        case 'targeted':
          if (!options.userIds || options.userIds.length === 0) {
            console.log('❌ User IDs не указаны для targeted отправки');
            return false;
          }
          requestData.userIds = options.userIds;
          break;
        
        case 'mass':
          requestData.platform = options.platform || 'all';
          break;
      }

      console.log('📨 Отправляем настоящее push уведомление:', { type, targetType, title });

      // Отправляем через Edge Function
      const { data: result, error } = await supabase.functions.invoke('send-push-notification', {
        body: requestData
      });

      if (error) {
        console.error('❌ Ошибка отправки push уведомления:', error);
        return false;
      }

      if (result?.success) {
        console.log('✅ Push уведомление отправлено успешно:', result.stats);
        return true;
      } else {
        console.error('❌ Ошибка в ответе Edge Function:', result);
        return false;
      }

    } catch (error) {
      console.error('❌ Ошибка отправки настоящего push уведомления:', error);
      return false;
    }
  }

  // Отправка локального уведомления (fallback)
  async sendLocalNotification(type: string, data: Record<string, any> = {}): Promise<boolean> {
    try {
      // Получаем конфигурацию уведомлений
      const config = await remoteConfigService.getNotificationConfig();
      const notificationConfig = config[type];

      if (!notificationConfig || !notificationConfig.enabled) {
        console.log(`⚠️ Уведомление типа ${type} отключено`);
        return false;
      }

      // Подготавливаем шаблон с проверкой на undefined
      const template = notificationConfig.template || NOTIFICATION_TYPES[type]?.template || { title: 'Уведомление', body: 'Новое уведомление' };
      let { title, body } = template;
      
      // Заменяем переменные в шаблоне
      Object.keys(data).forEach(key => {
        const placeholder = `{${key}}`;
        title = title.replace(new RegExp(placeholder, 'g'), data[key]);
        body = body.replace(new RegExp(placeholder, 'g'), data[key]);
      });

      console.log('📱 Отправляем локальное уведомление:', { type, title });

      // Отправляем локальное уведомление
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: notificationConfig.sound ? 'default' : undefined,
          data: {
            type,
            ...data
          },
        },
        trigger: null, // Немедленно
      });

      return true;
    } catch (error) {
      console.error('❌ Ошибка отправки локального уведомления:', error);
      return false;
    }
  }

  // Универсальный метод отправки (пробует настоящие push, потом локальные)
  async sendNotification(
    type: string, 
    data: Record<string, any> = {},
    preferReal: boolean = true
  ): Promise<boolean> {
    if (preferReal && this.pushToken) {
      // Пробуем отправить настоящее push уведомление
      const realSuccess = await this.sendRealPushNotification(type, data);
      if (realSuccess) {
        return true;
      }
      console.log('⚠️ Настоящее push не удалось, отправляем локальное');
    }

    // Fallback на локальное уведомление
    return await this.sendLocalNotification(type, data);
  }

  // Массовая отправка настоящих push уведомлений
  async sendMassNotification(
    type: string,
    data: Record<string, any> = {},
    platform: 'all' | 'ios' | 'android' = 'all'
  ): Promise<boolean> {
    return await this.sendRealPushNotification(type, data, 'mass', { platform });
  }

  // Отправка группе пользователей
  async sendTargetedNotification(
    type: string,
    userIds: string[],
    data: Record<string, any> = {}
  ): Promise<boolean> {
    return await this.sendRealPushNotification(type, data, 'targeted', { userIds });
  }

  // Получение всех типов уведомлений с актуальной конфигурацией
  async getNotificationTypes(): Promise<Record<string, NotificationType>> {
    try {
      const remoteConfig = await remoteConfigService.getNotificationConfig();
      
      // Объединяем локальную конфигурацию с удаленной
      const mergedConfig: Record<string, NotificationType> = {};
      
      Object.keys(NOTIFICATION_TYPES).forEach(key => {
        const localType = NOTIFICATION_TYPES[key];
        const remoteType = remoteConfig[key];
        
        mergedConfig[key] = {
          ...localType,
          enabled: remoteType?.enabled ?? localType.enabled,
          sound: remoteType?.sound ?? localType.sound,
          vibration: remoteType?.vibration ?? localType.vibration,
          template: remoteType?.template ?? localType.template
        };
      });

      return mergedConfig;
    } catch (error) {
      console.error('❌ Ошибка получения типов уведомлений:', error);
      return NOTIFICATION_TYPES;
    }
  }

  // Удаление push токена (алиас для cleanup для совместимости)
  async removePushToken(): Promise<void> {
    return await this.cleanup();
  }

  // Очистка при выходе пользователя
  async cleanup(): Promise<void> {
    try {
      if (this.userId && this.pushToken) {
        // Удаляем токен из базы данных
        await supabase
          .from('push_tokens')
          .delete()
          .eq('user_id', this.userId)
          .eq('token', this.pushToken);
        
        console.log('🧹 Push токен удален из базы данных');
      }
      
      this.pushToken = null;
      this.userId = null;
    } catch (error) {
      console.error('❌ Ошибка очистки push уведомлений:', error);
    }
  }

  // Получение текущего push токена
  getPushToken(): string | null {
    return this.pushToken;
  }

  // Проверка инициализации
  isInitialized(): boolean {
    return this.pushToken !== null && this.userId !== null;
  }

  // Планирование напоминания за час до визита
  async scheduleReminderNotification(
    orderId: string,
    workerName: string,
    scheduledDateTime: Date
  ): Promise<boolean> {
    try {
      // Вычисляем время за час до визита
      const reminderTime = new Date(scheduledDateTime.getTime() - 60 * 60 * 1000); // -1 час
      
      // Проверяем, что время напоминания в будущем
      if (reminderTime <= new Date()) {
        console.log('⚠️ Время напоминания уже прошло, отправляем немедленно');
        return await this.sendNotification('REMINDER_1H', {
          workerName,
          orderId
        });
      }

      console.log(`⏰ Планируем напоминание на ${reminderTime.toLocaleString('ru-RU')}`);

      // Планируем локальное уведомление
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Мастер скоро приедет! ⏰',
          body: `Через 1 час к вам приедет Мастер ${workerName}! Пожалуйста будьте дома`,
          data: {
            type: 'REMINDER_1H',
            orderId,
            workerName
          },
        },
        trigger: { date: reminderTime } as any,
      });

      console.log('✅ Напоминание запланировано');
      return true;
    } catch (error) {
      console.error('❌ Ошибка планирования напоминания:', error);
      return false;
    }
  }
}

export const pushNotificationService = new PushNotificationService();

// Утилитарные функции для отправки уведомлений по типам
export const NotificationTemplates = {
  orderConfirmed: (orderNumber: string) => ({
    title: '✅ Заказ подтвержден',
    body: `Ваш заказ №${orderNumber} принят в работу. Мастер свяжется с вами в ближайшее время.`,
    data: { type: NOTIFICATION_TYPES.ORDER_CONFIRMED.id, orderNumber }
  }),

  workerAssigned: (orderNumber: string, workerName: string) => ({
    title: '👨‍🔧 Мастер назначен',
    body: `К вашему заказу №${orderNumber} назначен мастер ${workerName}`,
    data: { type: NOTIFICATION_TYPES.WORKER_ASSIGNED.id, orderNumber, workerName }
  }),

  workerArrived: (orderNumber: string) => ({
    title: '🚗 Мастер прибыл',
    body: `Мастер прибыл для выполнения заказа №${orderNumber}`,
    data: { type: NOTIFICATION_TYPES.WORKER_ARRIVED.id, orderNumber }
  }),

  orderCompleted: (orderNumber: string) => ({
    title: '🎉 Заказ выполнен',
    body: `Заказ №${orderNumber} успешно выполнен. Пожалуйста, оцените работу мастера.`,
    data: { type: NOTIFICATION_TYPES.ORDER_COMPLETED.id, orderNumber }
  }),

  paymentReceived: (amount: number) => ({
    title: '💳 Оплата получена',
    body: `Оплата в размере ${amount} ₽ успешно обработана`,
    data: { type: NOTIFICATION_TYPES.PAYMENT_RECEIVED.id, amount }
  }),

  promotion: (title: string, description: string) => ({
    title: `🎁 ${title}`,
    body: description,
    data: { type: NOTIFICATION_TYPES.PROMOTION.id }
  })
}; 