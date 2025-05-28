import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, signIn, signUp, signOut, getCurrentUser, getUserProfile } from '../lib/supabase';
import { handleSupabaseError } from '../lib/supabaseConnection';
import { pushNotificationService } from '../services/pushNotificationService';

// Типы для контекста аутентификации
type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; userExists: boolean; message?: string; } | undefined>;
  logout: () => Promise<void>;
};

// Создаем контекст с начальными значениями
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Ключи для хранения данных в AsyncStorage
const USER_STORAGE_KEY = '@doctordom:user';

// Провайдер контекста аутентификации
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Логируем изменение пользователя
  useEffect(() => {
    console.log('AuthContext: Пользователь изменился:', user?.id, user?.email);
  }, [user]);

  // Эффект для проверки сохраненного состояния авторизации при запуске
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        console.log('AuthContext: Проверяем сохраненное состояние авторизации...');
        
        // Проверяем сессию в Supabase
        const { data: { user: supabaseUser } } = await getCurrentUser();
        
        console.log('AuthContext: Текущий пользователь Supabase:', supabaseUser?.id, supabaseUser?.email);
        
        if (supabaseUser) {
          // Если есть активная сессия, получаем профиль пользователя
          const { data: profile, error: profileError } = await getUserProfile(supabaseUser.id);
          console.log('Профиль пользователя:', profile);
          
          // Если профиль не найден, создаем его
          if (profileError || !profile) {
            console.log('Профиль не найден при загрузке, создаем новый профиль');
            
            // Создаем базовый профиль пользователя
            const newProfile = {
              id: supabaseUser.id,
              name: 'Пользователь',
              email: supabaseUser.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            // Сохраняем профиль в базу данных
            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert(newProfile);
              
            if (createProfileError) {
              console.error('Ошибка при создании профиля:', createProfileError);
              setIsLoading(false);
              return;
            }
            
            // Используем созданный профиль
            const userData: User = {
              id: supabaseUser.id,
              name: newProfile.name,
              email: supabaseUser.email || '',
            };
            
            setUser(userData);
            console.log('Пользователь установлен с новым профилем при загрузке:', userData);
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
            
            // Инициализируем push уведомления
            try {
              await pushNotificationService.initialize(supabaseUser.id);
              console.log('✅ Push уведомления инициализированы при загрузке');
            } catch (pushError) {
              console.error('❌ Ошибка инициализации push уведомлений при загрузке:', pushError);
            }
          } else {
            // Используем существующий профиль
            const userData: User = {
              id: supabaseUser.id,
              name: profile.name || 'Пользователь',
              email: supabaseUser.email || '',
            };
            
            setUser(userData);
            console.log('Пользователь установлен:', userData);
            // Сохраняем данные пользователя в AsyncStorage
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
            
            // Инициализируем push уведомления
            try {
              await pushNotificationService.initialize(supabaseUser.id);
              console.log('✅ Push уведомления инициализированы при загрузке существующего профиля');
            } catch (pushError) {
              console.error('❌ Ошибка инициализации push уведомлений при загрузке:', pushError);
            }
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
    
    // Подписываемся на изменения состояния авторизации
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Событие авторизации:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // При входе обновляем данные пользователя
          const { data: profile, error: profileError } = await getUserProfile(session.user.id);
          console.log('Профиль после входа:', profile);
          
          // Если профиль не найден, создаем его
          if (profileError || !profile) {
            console.log('Профиль не найден при событии авторизации, создаем новый профиль');
            
            // Создаем базовый профиль пользователя
            const newProfile = {
              id: session.user.id,
              name: 'Пользователь',
              email: session.user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            // Сохраняем профиль в базу данных
            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert(newProfile);
              
            if (createProfileError) {
              console.error('Ошибка при создании профиля:', createProfileError);
              return;
            }
            
            // Используем созданный профиль
            const userData: User = {
              id: session.user.id,
              name: newProfile.name,
              email: session.user.email || '',
            };
            
            setUser(userData);
            console.log('Пользователь установлен с новым профилем при событии авторизации:', userData);
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
          } else {
            // Используем существующий профиль
            const userData: User = {
              id: session.user.id,
              name: profile.name || 'Пользователь',
              email: session.user.email || '',
            };
            
            setUser(userData);
            console.log('Пользователь установлен после входа:', userData);
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
          }
        } else if (event === 'SIGNED_OUT') {
          // При выходе очищаем данные пользователя
          console.log('Пользователь вышел из системы');
          setUser(null);
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
        }
      }
    );

    // Отписываемся при размонтировании компонента
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Функция для входа в аккаунт
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Попытка входа:', email);
      
      // Вызываем функцию входа из Supabase
      const { data, error } = await signIn(email, password);
      
      if (error) {
        console.error('Ошибка при входе:', error);
        throw new Error(handleSupabaseError(error));
      }
      
      console.log('Успешный вход:', data.user?.id);
      
      if (data.user) {
        // Получаем профиль пользователя
        const { data: profile, error: profileError } = await getUserProfile(data.user.id);
        console.log('Профиль после успешного входа:', profile);
        
        // Если профиль не найден, создаем его
        if (profileError || !profile) {
          console.log('Профиль не найден, создаем новый профиль');
          
          // Создаем базовый профиль пользователя
          const newProfile = {
            id: data.user.id,
            name: 'Пользователь',
            email: data.user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          // Сохраняем профиль в базу данных
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert(newProfile);
            
          if (createProfileError) {
            console.error('Ошибка при создании профиля:', createProfileError);
            throw new Error('Не удалось создать профиль пользователя');
          }
          
          // Используем созданный профиль
          const userData: User = {
            id: data.user.id,
            name: newProfile.name,
            email: data.user.email || '',
          };
          
          setUser(userData);
          console.log('Пользователь установлен с новым профилем:', userData);
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        } else {
          // Используем существующий профиль
          const userData: User = {
            id: data.user.id,
            name: profile.name || 'Пользователь',
            email: data.user.email || '',
          };
          
          setUser(userData);
          console.log('Пользователь установлен после успешного входа:', userData);
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
          
          // Инициализируем push уведомления после успешного входа
          try {
            await pushNotificationService.initialize(data.user.id);
            console.log('✅ Push уведомления инициализированы для пользователя');
          } catch (pushError) {
            console.error('❌ Ошибка инициализации push уведомлений:', pushError);
          }
        }
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для регистрации
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Регистрируем пользователя через Supabase
      const { data, error } = await signUp(email, password);
      
      if (error) {
        // Проверяем, если пользователь уже существует
        if (error.message.includes('User already registered') || 
            error.message.includes('already registered') ||
            error.message.includes('already exists')) {
          // Для существующего пользователя возвращаем специальный результат вместо исключения
          return { 
            success: false, 
            userExists: true, 
            message: 'Профиль с таким адресом электронной почты уже существует. Попробуйте войти в аккаунт.' 
          };
        }
        
        console.error('Ошибка при регистрации:', error);
        throw new Error(handleSupabaseError(error));
      }
      
      if (data.user) {
        // Создаем профиль пользователя
        await supabase.from('profiles').insert({
          id: data.user.id,
          name,
          email,
          created_at: new Date().toISOString(),
        });
        
        const userData: User = {
          id: data.user.id,
          name,
          email,
        };
        
        setUser(userData);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        
        return { success: true, userExists: false };
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для выхода из аккаунта
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Удаляем push токен перед выходом
      try {
        await pushNotificationService.removePushToken();
        console.log('✅ Push токен удален при выходе');
      } catch (pushError) {
        console.error('❌ Ошибка удаления push токена:', pushError);
      }
      
      // Выходим из аккаунта через Supabase
      const { error } = await signOut();
      
      if (error) throw error;
      
      // Удаляем данные пользователя
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      
      setUser(null);
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      throw new Error('Не удалось выйти из аккаунта');
    } finally {
      setIsLoading(false);
    }
  };

  // Проверка аутентификации
  const isAuthenticated = user !== null;

  // Предоставляем значения контекста
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Хук для использования контекста аутентификации
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}; 