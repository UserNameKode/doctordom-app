import { supabase } from './supabase';

/**
 * Проверка подключения к Supabase
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Простой запрос для проверки подключения
    const { error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      console.error('Ошибка подключения к Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Критическая ошибка подключения к Supabase:', error);
    return false;
  }
};

/**
 * Retry функция для повторных попыток
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Попытка ${attempt}/${maxRetries} неудачна:`, error);
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Экспоненциальная задержка
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};

/**
 * Безопасный вызов Supabase операций с retry
 */
export const safeSupabaseCall = async <T>(
  operation: () => Promise<{ data: T; error: any }>,
  maxRetries: number = 3
): Promise<{ data: T | null; error: any }> => {
  try {
    return await retryOperation(operation, maxRetries);
  } catch (error) {
    console.error('Все попытки исчерпаны:', error);
    return { data: null, error };
  }
};

/**
 * Проверка доступности интернета
 */
export const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    // Простой запрос к Google DNS
    const response = await fetch('https://8.8.8.8', {
      method: 'HEAD',
      mode: 'no-cors',
    });
    return true;
  } catch (error) {
    console.warn('Нет подключения к интернету');
    return false;
  }
};

/**
 * Обработчик ошибок Supabase
 */
export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Неизвестная ошибка';
  
  // Ошибки сети
  if (error.message?.includes('fetch')) {
    return 'Проблемы с подключением к интернету. Проверьте соединение.';
  }
  
  // Ошибки авторизации
  if (error.message?.includes('Invalid login credentials')) {
    return 'Неверный email или пароль';
  }
  
  if (error.message?.includes('Email not confirmed')) {
    return 'Подтвердите email по ссылке в письме';
  }
  
  if (error.message?.includes('User already registered')) {
    return 'Пользователь с таким email уже зарегистрирован';
  }
  
  // Ошибки базы данных
  if (error.code === 'PGRST116') {
    return 'Данные не найдены';
  }
  
  if (error.code === '23505') {
    return 'Такая запись уже существует';
  }
  
  // Общие ошибки
  return error.message || 'Произошла ошибка. Попробуйте позже.';
}; 