import { supabase } from '../lib/supabase';

export interface SmsAuthResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class SmsAuthService {
  /**
   * Отправляет SMS с кодом подтверждения на указанный номер телефона
   */
  static async sendSmsCode(phone: string): Promise<SmsAuthResponse> {
    try {
      // Форматируем номер телефона (добавляем +7 если нужно)
      const formattedPhone = this.formatPhoneNumber(phone);
      
      console.log('Отправка SMS на номер:', formattedPhone);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          // Можно настроить шаблон SMS
          channel: 'sms',
        }
      });

      if (error) {
        console.error('Ошибка отправки SMS:', error);
        return {
          success: false,
          message: this.getErrorMessage(error.message),
          error: error.message,
        };
      }

      console.log('SMS успешно отправлен:', data);
      
      return {
        success: true,
        message: 'Код подтверждения отправлен на ваш номер телефона',
        data,
      };
    } catch (error) {
      console.error('Ошибка SmsAuthService.sendSmsCode:', error);
      return {
        success: false,
        message: 'Произошла ошибка при отправке SMS',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Подтверждает SMS-код и выполняет вход/регистрацию
   */
  static async verifySmsCode(phone: string, code: string): Promise<SmsAuthResponse> {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      
      console.log('Подтверждение SMS-кода для номера:', formattedPhone);
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: code,
        type: 'sms',
      });

      if (error) {
        console.error('Ошибка подтверждения SMS-кода:', error);
        return {
          success: false,
          message: this.getErrorMessage(error.message),
          error: error.message,
        };
      }

      console.log('SMS-код успешно подтвержден:', data);

      // Если пользователь новый, создаем профиль
      if (data.user && data.session) {
        await this.createUserProfile(data.user, formattedPhone);
      }

      return {
        success: true,
        message: 'Вход выполнен успешно',
        data,
      };
    } catch (error) {
      console.error('Ошибка SmsAuthService.verifySmsCode:', error);
      return {
        success: false,
        message: 'Произошла ошибка при подтверждении кода',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Создает профиль пользователя после SMS-аутентификации
   */
  private static async createUserProfile(user: any, phone: string) {
    try {
      // Проверяем, существует ли уже профиль
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        console.log('Профиль уже существует');
        return;
      }

      // Создаем новый профиль
      const newProfile = {
        id: user.id,
        name: 'Пользователь',
        phone: phone,
        email: user.email || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .insert(newProfile);

      if (error) {
        console.error('Ошибка создания профиля:', error);
      } else {
        console.log('Профиль успешно создан');
      }
    } catch (error) {
      console.error('Ошибка SmsAuthService.createUserProfile:', error);
    }
  }

  /**
   * Форматирует номер телефона в международный формат
   */
  private static formatPhoneNumber(phone: string): string {
    // Убираем все символы кроме цифр
    let cleaned = phone.replace(/\D/g, '');
    
    // Если номер начинается с 8, заменяем на 7
    if (cleaned.startsWith('8')) {
      cleaned = '7' + cleaned.slice(1);
    }
    
    // Если номер не начинается с 7, добавляем 7
    if (!cleaned.startsWith('7')) {
      cleaned = '7' + cleaned;
    }
    
    // Добавляем знак +
    return '+' + cleaned;
  }

  /**
   * Валидирует номер телефона
   */
  static validatePhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    
    // Проверяем российские номера (11 цифр, начинается с 7 или 8)
    if (cleaned.length === 11 && (cleaned.startsWith('7') || cleaned.startsWith('8'))) {
      return true;
    }
    
    // Проверяем номера без кода страны (10 цифр)
    if (cleaned.length === 10) {
      return true;
    }
    
    return false;
  }

  /**
   * Форматирует номер для отображения
   */
  static formatPhoneForDisplay(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
    }
    
    return phone;
  }

  /**
   * Получает понятное сообщение об ошибке
   */
  private static getErrorMessage(errorMessage: string): string {
    const errorMap: { [key: string]: string } = {
      'Invalid phone number': 'Неверный формат номера телефона',
      'Phone number not confirmed': 'Номер телефона не подтвержден',
      'Invalid token': 'Неверный код подтверждения',
      'Token has expired': 'Код подтверждения истек',
      'Too many requests': 'Слишком много запросов. Попробуйте позже',
      'Signup not allowed': 'Регистрация временно недоступна',
      'Phone rate limit exceeded': 'Превышен лимит отправки SMS. Попробуйте позже',
    };

    // Ищем точное совпадение
    if (errorMap[errorMessage]) {
      return errorMap[errorMessage];
    }

    // Ищем частичное совпадение
    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    return 'Произошла ошибка. Попробуйте еще раз';
  }

  /**
   * Проверяет, настроена ли SMS-аутентификация в Supabase
   */
  static async checkSmsConfiguration(): Promise<boolean> {
    try {
      // Пробуем отправить SMS на тестовый номер
      const testPhone = '+79999999999';
      const { error } = await supabase.auth.signInWithOtp({
        phone: testPhone,
        options: { channel: 'sms' }
      });

      // Если ошибка связана с конфигурацией, возвращаем false
      if (error && error.message.includes('SMS provider')) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Ошибка проверки SMS-конфигурации:', error);
      return false;
    }
  }
} 