import * as Location from 'expo-location';

/**
 * Утилиты для работы с геолокацией
 */

export interface LocationAccuracyInfo {
  accuracy: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
  color: string;
}

/**
 * Определяет уровень точности GPS
 */
export const getAccuracyInfo = (accuracy?: number): LocationAccuracyInfo => {
  if (!accuracy) {
    return {
      accuracy: 0,
      level: 'poor',
      description: 'Точность неизвестна',
      color: '#FF6B6B'
    };
  }

  if (accuracy <= 5) {
    return {
      accuracy,
      level: 'excellent',
      description: 'Отличная точность',
      color: '#51CF66'
    };
  }

  if (accuracy <= 20) {
    return {
      accuracy,
      level: 'good', 
      description: 'Хорошая точность',
      color: '#69DB7C'
    };
  }

  if (accuracy <= 100) {
    return {
      accuracy,
      level: 'fair',
      description: 'Средняя точность',
      color: '#FFD43B'
    };
  }

  return {
    accuracy,
    level: 'poor',
    description: 'Низкая точность',
    color: '#FF8787'
  };
};

/**
 * Проверяет, находится ли устройство в помещении (по уровню точности)
 */
export const isLikelyIndoors = (accuracy?: number): boolean => {
  return !accuracy || accuracy > 200;
};

/**
 * Конфигурация для разных сценариев определения местоположения
 */
export const LocationConfigs = {
  // Быстрое определение для UI
  quick: {
    accuracy: Location.Accuracy.Balanced,
    enableHighAccuracy: false,
  },
  
  // Для навигации и точного позиционирования
  precise: {
    accuracy: Location.Accuracy.Highest,
    enableHighAccuracy: true,
  },
  
  // Максимальная точность для критических операций
  ultraprecise: {
    accuracy: Location.Accuracy.BestForNavigation,
    enableHighAccuracy: true,
  }
};

/**
 * Получает местоположение с прогрессивным улучшением точности
 */
export const getLocationWithProgressiveAccuracy = async (): Promise<{
  location: Location.LocationObject;
  accuracyInfo: LocationAccuracyInfo;
}> => {
  let bestLocation: Location.LocationObject | null = null;
  let bestAccuracy = Infinity;

  // Этап 1: Быстрое определение
  try {
    console.log('🔄 Быстрое определение местоположения...');
    const quickLocation = await Location.getCurrentPositionAsync(LocationConfigs.quick);
    bestLocation = quickLocation;
    bestAccuracy = quickLocation.coords.accuracy || Infinity;
    console.log(`📊 Быстрое определение: ${bestAccuracy.toFixed(0)}м`);
  } catch (error) {
    console.log('⚠️ Быстрое определение не удалось');
  }

  // Этап 2: Высокая точность
  try {
    console.log('🔄 Высокая точность...');
    const preciseLocation = await Location.getCurrentPositionAsync(LocationConfigs.precise);
    const newAccuracy = preciseLocation.coords.accuracy || Infinity;
    
    if (newAccuracy < bestAccuracy * 0.7) {
      bestLocation = preciseLocation;
      bestAccuracy = newAccuracy;
      console.log(`✅ Улучшена точность: ${bestAccuracy.toFixed(0)}м`);
    }
  } catch (error) {
    console.log('⚠️ Высокая точность недоступна');
  }

  // Этап 3: Сверхвысокая точность (только если нужно)
  if (bestAccuracy > 50) {
    try {
      console.log('🔄 Максимальная точность...');
      const ultraLocation = await Location.getCurrentPositionAsync(LocationConfigs.ultraprecise);
      const ultraAccuracy = ultraLocation.coords.accuracy || Infinity;
      
      if (ultraAccuracy < bestAccuracy) {
        bestLocation = ultraLocation;
        bestAccuracy = ultraAccuracy;
        console.log(`🎯 Максимальная точность: ${bestAccuracy.toFixed(0)}м`);
      }
    } catch (error) {
      console.log('⚠️ Максимальная точность недоступна');
    }
  }

  if (!bestLocation) {
    throw new Error('Не удалось получить координаты');
  }

  const accuracyInfo = getAccuracyInfo(bestAccuracy);
  
  return {
    location: bestLocation,
    accuracyInfo
  };
};

/**
 * Проверяет валидность координат
 */
export const isValidLocation = (latitude: number, longitude: number): boolean => {
  // Проверяем базовые диапазоны
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return false;
  }
  
  // Проверяем, что это не нулевые координаты (часто означает ошибку)
  if (latitude === 0 && longitude === 0) {
    return false;
  }
  
  // Можно добавить дополнительные проверки по региону
  return true;
};

/**
 * Рассчитывает расстояние между двумя точками в метрах
 */
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371000; // Радиус Земли в метрах
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

/**
 * Предлагает оптимальные настройки на основе условий
 */
export const getOptimalLocationConfig = (
  scenario: 'address' | 'navigation' | 'delivery' | 'emergency'
) => {
  switch (scenario) {
    case 'address':
      return LocationConfigs.precise;
    case 'navigation':
      return LocationConfigs.ultraprecise;
    case 'delivery':
      return LocationConfigs.precise;
    case 'emergency':
      return LocationConfigs.ultraprecise;
    default:
      return LocationConfigs.quick;
  }
}; 