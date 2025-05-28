// Сначала подтягиваем полифиллы
import 'react-native-url-polyfill/auto';

// Затем импортируем необходимые модули
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as Crypto from 'expo-crypto';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Конфигурация Supabase
// Эти переменные безопасно использовать в клиентском приложении, так как Supabase 
// имеет Row Level Security на уровне базы данных
const supabaseUrl = SUPABASE_URL || 'https://kgwfqllhnmjmhrmlhjsm.supabase.co';
const supabaseAnonKey = SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd2ZxbGxobm1qbWhybWxoanNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzQ4MzQsImV4cCI6MjA1OTk1MDgzNH0.edYUFD1fV4IYdASvIV2Bww4faS7bNuB9KgX_79H3ij4';

// Отладочная информация
console.log('🔑 Supabase URL:', supabaseUrl);
console.log('🔑 Supabase Key из ENV:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'НЕ НАЙДЕН');
console.log('🔑 Supabase Key итоговый:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'НЕ НАЙДЕН');
console.log('🔑 Длина ключа:', supabaseAnonKey?.length || 0);

// Создаем клиент Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Вспомогательные функции для работы с Supabase Auth
export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({ email, password });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

export const getSession = async () => {
  return await supabase.auth.getSession();
};

// Функция для обновления профиля пользователя
export const updateUserProfile = async (userId: string, profileData: any) => {
  return await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId);
};

// Функция для получения профиля пользователя
export const getUserProfile = async (userId: string) => {
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
};

// Функция для создания профиля пользователя
export const createUserProfile = async (profileData: any) => {
  return await supabase
    .from('profiles')
    .insert(profileData);
};

// Функция для загрузки аватара пользователя
export const uploadAvatar = async (userId: string, filePath: string, fileData: Blob) => {
  const fileExt = filePath.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath2 = `avatars/${fileName}`;

  const { data, error } = await supabase.storage
    .from('user-avatars')
    .upload(filePath2, fileData);

  if (error) throw error;

  // Обновляем URL аватара в профиле пользователя
  const avatarUrl = `${supabaseUrl}/storage/v1/object/public/user-avatars/${filePath2}`;
  
  await updateUserProfile(userId, {
    avatar_url: avatarUrl,
    updated_at: new Date().toISOString(),
  });

  return avatarUrl;
};

// Функция для получения услуг
export const getServices = async (categoryId?: string) => {
  let query = supabase.from('services').select('*');
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  return await query;
};

// Функция для получения услуги по ID
export const getServiceById = async (serviceId: string) => {
  return await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single();
};

// Функция для получения категорий услуг
export const getCategories = async () => {
  return await supabase
    .from('categories')
    .select('*');
};

// Функция для получения специалистов
export const getSpecialists = async (serviceId?: string) => {
  // Временное решение с моковыми данными для тестирования
  const mockSpecialists = [
    {
      id: '24278a56-eae7-4e59-9bae-443cb50a67fb',
      name: 'Иванов Иван Иванович',
      specialty: 'Мастер по ремонту',
      rating: 4.8,
      experience_years: 5,
      photo_url: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 'cb7ce945-5728-4af8-a5fb-4d64420fef0a',
      name: 'Петрова Анна Сергеевна',
      specialty: 'Мастер-универсал',
      rating: 4.9,
      experience_years: 7,
      photo_url: 'https://randomuser.me/api/portraits/women/44.jpg'
    }
  ];

  return { data: mockSpecialists, error: null };
};

// Функция для создания заказа
export const createOrder = async (orderData: any) => {
  try {
    // Проверяем формат UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    // Проверяем service_id
    if (orderData.service_id && typeof orderData.service_id === 'string') {
      if (!uuidRegex.test(orderData.service_id)) {
        orderData.service_id = '00000000-0000-0000-0000-000000000001';
      }
    }
    
    // Проверяем specialist_id
    if (orderData.specialist_id && typeof orderData.specialist_id === 'string') {
      if (!uuidRegex.test(orderData.specialist_id)) {
        orderData.specialist_id = 'cb7ce945-5728-4af8-a5fb-4d64420fef0a';
      }
    }
    
    // Выполняем запрос к Supabase
    const result = await supabase
      .from('orders')
      .insert(orderData)
      .select();
    
    return result;
  } catch (error) {
    throw error;
  }
};

// Функция для получения заказов пользователя
export const getUserOrders = async (userId: string) => {
  try {
    console.log('getUserOrders: Получаем заказы для пользователя ID:', userId);
    
    // Получаем заказы пользователя
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*, specialists(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      console.error('getUserOrders: Ошибка при получении заказов:', ordersError);
      throw ordersError;
    }
    
    console.log('getUserOrders: Найдено заказов:', ordersData?.length || 0);
    
    if (!ordersData || ordersData.length === 0) {
      console.log('getUserOrders: Заказы не найдены, возвращаем пустой массив');
      return { data: [], error: null };
    }
    
    // Получаем ID всех услуг из заказов
    const serviceIds = ordersData.map(order => order.service_id);
    console.log('getUserOrders: Загружаем услуги для ID:', serviceIds);
    
    // Получаем информацию об услугах отдельным запросом
    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .in('id', serviceIds);
    
    if (servicesError) {
      console.error('getUserOrders: Ошибка при получении услуг:', servicesError);
      throw servicesError;
    }
    
    console.log('getUserOrders: Найдено услуг:', servicesData?.length || 0);
    
    // Объединяем данные заказов с данными услуг
    const enrichedOrders = ordersData.map(order => {
      const service = servicesData?.find(s => s.id === order.service_id) || null;
      const enrichedOrder = {
        ...order,
        services: service
      };
      console.log('getUserOrders: Обогащенный заказ:', enrichedOrder.id, 'услуга:', service?.name);
      return enrichedOrder;
    });
    
    console.log('getUserOrders: Возвращаем заказов:', enrichedOrders.length);
    return { data: enrichedOrders, error: null };
  } catch (error) {
    console.error('Ошибка при получении заказов пользователя:', error);
    throw error;
  }
};

// Функция для добавления отзыва
export const addReview = async (reviewData: any) => {
  return await supabase
    .from('reviews')
    .insert(reviewData);
};

// Функция для получения отзывов о специалисте
export const getSpecialistReviews = async (specialistId: string) => {
  return await supabase
    .from('reviews')
    .select('*, profiles(*)')
    .eq('specialist_id', specialistId)
    .order('created_at', { ascending: false });
};

// Функция для получения статистики пользователя
export const getUserStats = async (userId: string) => {
  try {
    // Получаем количество заказов
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, created_at')
      .eq('user_id', userId);

    if (ordersError) throw ordersError;

    const completedOrders = orders?.filter(order => order.status === 'completed').length || 0;
    const activeOrders = orders?.filter(order => ['pending', 'confirmed', 'in_progress'].includes(order.status)).length || 0;

    // Получаем количество избранных услуг
    const { data: favorites, error: favoritesError } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId);

    if (favoritesError) {
      console.error('Ошибка при получении избранных услуг:', favoritesError);
    }

    const favoriteServices = favorites?.length || 0;

    // Определяем дату регистрации
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const memberSince = profile?.created_at 
      ? new Date(profile.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
      : 'Недавно';

    return {
      data: {
        completedOrders,
        activeOrders,
        favoriteServices,
        memberSince
      },
      error: null
    };
  } catch (error) {
    console.error('Ошибка при получении статистики пользователя:', error);
    return { data: null, error };
  }
};

// Функция для получения сохраненных адресов пользователя
export const getUserSavedAddresses = async (userId: string) => {
  try {
    // Получаем адреса из специальной таблицы user_addresses
    const { data: addresses, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!addresses || addresses.length === 0) {
      // Если нет сохраненных адресов, пытаемся получить уникальные адреса из заказов
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('address, lat, lng')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        return { data: [], error: null };
      }

      // Создаем уникальный список адресов из заказов
      const uniqueAddresses = orders.reduce((acc: any[], order) => {
        const exists = acc.some(addr => addr.address === order.address);
        if (!exists && order.address) {
          acc.push({
            id: `temp_${acc.length + 1}`,
            title: acc.length === 0 ? 'Последний адрес' : `Адрес ${acc.length + 1}`,
            address: order.address,
            latitude: parseFloat(order.lat) || 55.7558,
            longitude: parseFloat(order.lng) || 37.6176,
            isDefault: acc.length === 0,
          });
        }
        return acc;
      }, []);

      return { data: uniqueAddresses, error: null };
    }

    // Преобразуем данные из базы в нужный формат
    const formattedAddresses = addresses.map(addr => ({
      id: addr.id,
      title: addr.title,
      address: addr.address,
      latitude: parseFloat(addr.latitude) || 55.7558,
      longitude: parseFloat(addr.longitude) || 37.6176,
      isDefault: addr.is_default,
    }));

    return { data: formattedAddresses, error: null };
  } catch (error) {
    console.error('Ошибка при получении сохраненных адресов:', error);
    return { data: [], error };
  }
};

// Функция для сохранения адреса пользователя
export const saveUserAddress = async (userId: string, addressData: {
  title: string;
  address: string;
  city?: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}) => {
  try {
    // Если это адрес по умолчанию, сначала убираем флаг с других адресов
    if (addressData.isDefault) {
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    // Добавляем новый адрес
    const { data, error } = await supabase
      .from('user_addresses')
      .insert({
        user_id: userId,
        title: addressData.title,
        address: addressData.address,
        city: addressData.city,
        latitude: addressData.latitude,
        longitude: addressData.longitude,
        is_default: addressData.isDefault || false,
      })
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Ошибка при сохранении адреса:', error);
    return { data: null, error };
  }
};

// Функция для сохранения последнего используемого адреса в профиле
export const saveUserLastAddress = async (userId: string, address: string, latitude: number, longitude: number) => {
  try {
    // Извлекаем город из адреса
    const cityMatch = address.match(/г\.\s*([А-Я][а-я]+)/i) || address.match(/^([А-Я][а-я]+)/);
    const city = cityMatch ? cityMatch[1] : null;

    // Обновляем профиль пользователя с последним адресом и городом
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        city,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();

    if (profileError) throw profileError;

    // Проверяем, существует ли уже такой адрес в сохраненных
    const { data: existingAddress, error: checkError } = await supabase
      .from('user_addresses')
      .select('id')
      .eq('user_id', userId)
      .eq('address', address)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 - это код "not found", который нормален
      throw checkError;
    }

    // Если адрес не существует, добавляем его как "Последний адрес"
    if (!existingAddress) {
      await saveUserAddress(userId, {
        title: 'Последний адрес',
        address,
        city: city || undefined,
        latitude,
        longitude,
        isDefault: false,
      });
    }

    return { data: profileData, error: null };
  } catch (error) {
    console.error('Ошибка при сохранении последнего адреса:', error);
    return { data: null, error };
  }
};

// Функция для получения последнего используемого адреса пользователя
export const getUserLastAddress = async (userId: string) => {
  try {
    // Сначала пытаемся получить адрес по умолчанию из user_addresses
    const { data: defaultAddress, error: defaultError } = await supabase
      .from('user_addresses')
      .select('address, city')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (!defaultError && defaultAddress) {
      return {
        data: {
          address: defaultAddress.address,
          city: defaultAddress.city
        },
        error: null
      };
    }

    // Если нет адреса по умолчанию, получаем последний сохраненный адрес
    const { data: lastSavedAddress, error: savedError } = await supabase
      .from('user_addresses')
      .select('address, city')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!savedError && lastSavedAddress) {
      return {
        data: {
          address: lastSavedAddress.address,
          city: lastSavedAddress.city
        },
        error: null
      };
    }

    // Если нет сохраненных адресов, получаем последний адрес из заказов
    const { data: lastOrder, error: orderError } = await supabase
      .from('orders')
      .select('address')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (orderError || !lastOrder) {
      return { data: null, error: orderError };
    }

    // Извлекаем город из адреса
    const address = lastOrder.address;
    const cityMatch = address.match(/г\.\s*([А-Я][а-я]+)/i) || address.match(/^([А-Я][а-я]+)/);
    const city = cityMatch ? cityMatch[1] : null;

    return {
      data: {
        address,
        city
      },
      error: null
    };
  } catch (error) {
    console.error('Ошибка при получении последнего адреса пользователя:', error);
    return { data: null, error };
  }
};

// Функции для работы с избранными услугами
export const addToFavorites = async (userId: string, serviceId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        service_id: serviceId,
      })
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Ошибка при добавлении в избранное:', error);
    return { data: null, error };
  }
};

export const removeFromFavorites = async (userId: string, serviceId: string) => {
  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('service_id', serviceId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Ошибка при удалении из избранного:', error);
    return { error };
  }
};

export const getUserFavorites = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        *,
        services:service_id (
          id,
          name,
          description,
          price_from,
          category_id,
          categories:category_id (name, icon)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Ошибка при получении избранных услуг:', error);
    return { data: [], error };
  }
};

export const isServiceFavorite = async (userId: string, serviceId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('service_id', serviceId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { data: !!data, error: null };
  } catch (error) {
    console.error('Ошибка при проверке избранного:', error);
    return { data: false, error };
  }
};

// Интерфейсы для типов данных
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  price_from?: number;
  duration: string;
  category_id: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedAddress {
  id: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
} 