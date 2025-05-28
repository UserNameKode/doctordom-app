// ВАЖНО: Этот файл не должен использоваться в клиентском приложении!
// Service_role ключ должен использоваться только на сервере.
// Этот файл оставлен как шаблон для серверной части.

/*
import { createClient } from '@supabase/supabase-js';

// URL и ключ должны храниться в переменных окружения на сервере
const supabaseUrl = 'https://kgwfqllhnmjmhrmlhjsm.supabase.co';
const supabaseServiceRoleKey = ''; // Ключ удален в целях безопасности

// Создаем административный клиент
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Функция для подтверждения email пользователя без перехода по ссылке
export const confirmUserEmail = async (userId: string) => {
  try {
    // Обновляем статус подтверждения email для пользователя
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email_confirm: true }
    );
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Ошибка при подтверждении email пользователя:', error);
    return { data: null, error };
  }
};

// Функция для создания пользователя без подтверждения email
export const createUserWithoutConfirmation = async (email: string, password: string) => {
  try {
    // Создаем пользователя
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Сразу подтверждаем email
    });
    
    if (userError) throw userError;
    return { data: userData, error: null };
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    return { data: null, error };
  }
};
*/

// Заглушки для функций, чтобы избежать ошибок импорта
export const supabaseAdmin = null;
export const confirmUserEmail = async (userId: string) => {
  console.error('Функция confirmUserEmail недоступна в клиентском приложении');
  return { data: null, error: new Error('Функция недоступна в клиентском приложении') };
};
export const createUserWithoutConfirmation = async (email: string, password: string) => {
  console.error('Функция createUserWithoutConfirmation недоступна в клиентском приложении');
  return { data: null, error: new Error('Функция недоступна в клиентском приложении') };
}; 