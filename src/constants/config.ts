import { GOOGLE_MAPS_API_KEY } from '@env';

// Конфигурация приложения

// Google Maps API Key - получаем из переменных окружения
export const GOOGLE_MAPS_API_KEY_CONFIG = GOOGLE_MAPS_API_KEY;

// Отладочная информация
console.log('🔑 Google Maps API Key загружен:', GOOGLE_MAPS_API_KEY_CONFIG ? 'ДА' : 'НЕТ');
console.log('🔑 Длина ключа:', GOOGLE_MAPS_API_KEY_CONFIG?.length || 0);

// Настройки по умолчанию для карт
export const DEFAULT_REGION = {
  latitude: 55.7558, // Москва
  longitude: 37.6176,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Настройки геолокации
export const LOCATION_SETTINGS = {
  // Максимальная точность GPS
  accuracy: 'highest' as const,
  // Не использовать кэшированные данные старше 5 секунд
  maximumAge: 5000,
  // Увеличиваем время ожидания для лучшей точности
  timeout: 25000,
  
  // Дополнительные настройки для высокой точности
  highAccuracy: {
    accuracy: 'highest' as const,
    // Минимальная дистанция для обновления позиции (в метрах)
    distanceInterval: 1,
    // Минимальное время между обновлениями (в миллисекундах)
    timeInterval: 1000,
    // Не использовать кэш вообще для критических запросов
    maximumAge: 0,
    timeout: 30000
  }
};

// Радиус поиска в метрах
export const SEARCH_RADIUS = 50000; // 50 км 