import { supabase } from '../lib/supabase';
import { NOTIFICATION_TYPES, isNotificationEnabled } from '../config/notificationConfig';

// Интерфейсы для массовых рассылок
export interface MassNotificationRequest {
  title: string;
  body: string;
  data?: any;
  targetAudience: 'all' | 'ios' | 'android' | 'custom';
  customUserIds?: string[];
  scheduledAt?: string; // ISO дата для отложенной отправки
  notificationType?: keyof typeof NOTIFICATION_TYPES;
}

export interface NotificationStats {
  totalUsers: number;
  sentCount: number;
  failedCount: number;
  deliveredCount: number;
  openedCount: number;
}

class MassNotificationService {
  
  /**
   * Отправка массового уведомления всем пользователям
   */
  async sendToAll(
    title: string, 
    body: string, 
    data?: any,
    notificationType?: keyof typeof NOTIFICATION_TYPES
  ): Promise<NotificationStats> {
    
    // Проверяем, включен ли тип уведомления
    if (notificationType && !isNotificationEnabled(notificationType)) {
      throw new Error(`Тип уведомления ${notificationType} отключен в конфигурации`);
    }

    return this.sendMassNotification({
      title,
      body,
      data,
      targetAudience: 'all',
      notificationType
    });
  }

  /**
   * Отправка уведомления по платформе
   */
  async sendByPlatform(
    platform: 'ios' | 'android',
    title: string,
    body: string,
    data?: any
  ): Promise<NotificationStats> {
    return this.sendMassNotification({
      title,
      body,
      data,
      targetAudience: platform
    });
  }

  /**
   * Отправка уведомления конкретным пользователям
   */
  async sendToUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: any
  ): Promise<NotificationStats> {
    return this.sendMassNotification({
      title,
      body,
      data,
      targetAudience: 'custom',
      customUserIds: userIds
    });
  }

  /**
   * Планирование отложенной рассылки
   */
  async scheduleNotification(
    scheduledAt: Date,
    title: string,
    body: string,
    targetAudience: 'all' | 'ios' | 'android' = 'all',
    data?: any
  ): Promise<{ scheduled: boolean; scheduledId: string }> {
    
    const scheduledNotification = {
      title,
      body,
      data,
      target_audience: targetAudience,
      scheduled_at: scheduledAt.toISOString(),
      status: 'scheduled',
      created_at: new Date().toISOString()
    };

    const { data: result, error } = await supabase
      .from('scheduled_notifications')
      .insert(scheduledNotification)
      .select('id')
      .single();

    if (error) {
      console.error('Ошибка планирования уведомления:', error);
      throw new Error('Не удалось запланировать уведомление');
    }

    return {
      scheduled: true,
      scheduledId: result.id
    };
  }

  /**
   * Основная функция массовой рассылки
   */
  private async sendMassNotification(request: MassNotificationRequest): Promise<NotificationStats> {
    try {
      console.log('🚀 Начинаем массовую рассылку:', request);

      // Получаем токены пользователей
      const tokens = await this.getTargetTokens(request);
      
      if (tokens.length === 0) {
        return {
          totalUsers: 0,
          sentCount: 0,
          failedCount: 0,
          deliveredCount: 0,
          openedCount: 0
        };
      }

      // Разбиваем на батчи по 100 токенов (лимит Expo Push API)
      const batches = this.chunkArray(tokens, 100);
      let totalSent = 0;
      let totalFailed = 0;

      // Отправляем батчами
      for (const batch of batches) {
        const batchResult = await this.sendBatch(batch, request);
        totalSent += batchResult.sent;
        totalFailed += batchResult.failed;
      }

      // Сохраняем статистику
      await this.saveNotificationStats({
        title: request.title,
        body: request.body,
        target_audience: request.targetAudience,
        total_users: tokens.length,
        sent_count: totalSent,
        failed_count: totalFailed,
        created_at: new Date().toISOString()
      });

      console.log('✅ Массовая рассылка завершена:', {
        totalUsers: tokens.length,
        sent: totalSent,
        failed: totalFailed
      });

      return {
        totalUsers: tokens.length,
        sentCount: totalSent,
        failedCount: totalFailed,
        deliveredCount: 0, // Будет обновлено позже
        openedCount: 0     // Будет обновлено позже
      };

    } catch (error) {
      console.error('❌ Ошибка массовой рассылки:', error);
      throw error;
    }
  }

  /**
   * Получение токенов для целевой аудитории
   */
  private async getTargetTokens(request: MassNotificationRequest): Promise<any[]> {
    let query = supabase
      .from('push_tokens')
      .select('token, platform, user_id')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Последние 30 дней

    // Фильтрация по аудитории
    switch (request.targetAudience) {
      case 'ios':
        query = query.eq('platform', 'ios');
        break;
      case 'android':
        query = query.eq('platform', 'android');
        break;
      case 'custom':
        if (request.customUserIds && request.customUserIds.length > 0) {
          query = query.in('user_id', request.customUserIds);
        } else {
          return [];
        }
        break;
      case 'all':
      default:
        // Без дополнительных фильтров
        break;
    }

    const { data: tokens, error } = await query;

    if (error) {
      console.error('Ошибка получения токенов:', error);
      throw new Error('Не удалось получить токены пользователей');
    }

    return tokens || [];
  }

  /**
   * Отправка батча уведомлений
   */
  private async sendBatch(
    tokens: any[], 
    request: MassNotificationRequest
  ): Promise<{ sent: number; failed: number }> {
    
    const messages = tokens.map(tokenData => ({
      to: tokenData.token,
      title: request.title,
      body: request.body,
      data: {
        ...request.data,
        userId: tokenData.user_id,
        platform: tokenData.platform,
        massNotification: true
      },
      sound: 'default',
      badge: 1
    }));

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();
      
      let sent = 0;
      let failed = 0;

      if (Array.isArray(result.data)) {
        result.data.forEach((res: any) => {
          if (res.status === 'ok') {
            sent++;
          } else {
            failed++;
          }
        });
      }

      return { sent, failed };

    } catch (error) {
      console.error('Ошибка отправки батча:', error);
      return { sent: 0, failed: tokens.length };
    }
  }

  /**
   * Сохранение статистики уведомлений
   */
  private async saveNotificationStats(stats: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_stats')
        .insert(stats);

      if (error) {
        console.error('Ошибка сохранения статистики:', error);
      }
    } catch (error) {
      console.error('Ошибка сохранения статистики:', error);
    }
  }

  /**
   * Разбивка массива на батчи
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Получение статистики рассылок
   */
  async getNotificationStats(limit: number = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('notification_stats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Ошибка получения статистики:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Отмена запланированного уведомления
   */
  async cancelScheduledNotification(scheduledId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('scheduled_notifications')
        .update({ status: 'cancelled' })
        .eq('id', scheduledId);

      if (error) {
        console.error('Ошибка отмены уведомления:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Ошибка отмены уведомления:', error);
      return false;
    }
  }

  /**
   * Быстрые шаблоны для массовых рассылок
   */
  getQuickTemplates() {
    return {
      // Акции и скидки
      promotion: (discount: string, description: string) => ({
        title: `🎁 Скидка ${discount}!`,
        body: description,
        data: { type: 'PROMOTION', discount }
      }),

      // Системные уведомления
      maintenance: (startTime: string, duration: string) => ({
        title: '🔧 Техническое обслуживание',
        body: `Планируется техническое обслуживание ${startTime}. Ожидаемая продолжительность: ${duration}`,
        data: { type: 'SYSTEM_UPDATE', maintenance: true }
      }),

      // Новые услуги
      newService: (serviceName: string) => ({
        title: '🆕 Новая услуга!',
        body: `Теперь доступна услуга: ${serviceName}. Закажите прямо сейчас!`,
        data: { type: 'PROMOTION', newService: serviceName }
      }),

      // Праздничные поздравления
      holiday: (holidayName: string) => ({
        title: `🎉 С ${holidayName}!`,
        body: `Команда DoctorDom поздравляет вас с ${holidayName}! Желаем счастья и уюта в доме!`,
        data: { type: 'PROMOTION', holiday: holidayName }
      })
    };
  }
}

// Экспортируем единственный экземпляр сервиса
export const massNotificationService = new MassNotificationService(); 