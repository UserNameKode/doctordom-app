import * as Location from 'expo-location';
import { LocationAccuracyInfo, getAccuracyInfo } from './locationUtils';

/**
 * Быстрые утилиты для геолокации с оптимизацией скорости
 */

interface CachedLocation {
  location: Location.LocationObject;
  timestamp: number;
  accuracy: number;
}

// Кэш последнего известного местоположения
let lastKnownLocation: CachedLocation | null = null;

// Максимальный возраст кэша в миллисекундах (5 минут)
const CACHE_MAX_AGE = 5 * 60 * 1000;

/**
 * Ускоренное получение геолокации с разными стратегиями
 */
export class FastLocationService {
  private static instance: FastLocationService;
  private isLocating = false;

  static getInstance(): FastLocationService {
    if (!FastLocationService.instance) {
      FastLocationService.instance = new FastLocationService();
    }
    return FastLocationService.instance;
  }

  /**
   * Основной метод быстрого получения местоположения
   */
  async getFastLocation(strategy: 'instant' | 'balanced' | 'accurate' = 'balanced'): Promise<{
    location: Location.LocationObject;
    accuracyInfo: LocationAccuracyInfo;
    source: 'cache' | 'fast' | 'accurate';
  }> {
    // Проверяем кэш для мгновенного ответа
    const cachedResult = this.getCachedLocation();
    if (cachedResult && strategy === 'instant') {
      console.log('⚡ Используем кэшированное местоположение');
      return {
        location: cachedResult.location,
        accuracyInfo: getAccuracyInfo(cachedResult.accuracy),
        source: 'cache'
      };
    }

    // Если уже выполняется запрос геолокации, ждем его завершения
    if (this.isLocating) {
      console.log('⏳ Ожидаем завершения текущего запроса геолокации...');
      await this.waitForCurrentLocation();
    }

    this.isLocating = true;

    try {
      switch (strategy) {
        case 'instant':
          return await this.getInstantLocation();
        case 'balanced':
          return await this.getBalancedLocation();
        case 'accurate':
          return await this.getAccurateLocation();
        default:
          return await this.getBalancedLocation();
      }
    } finally {
      this.isLocating = false;
    }
  }

  /**
   * Мгновенное местоположение (кэш + быстрый GPS)
   */
  private async getInstantLocation() {
    const cachedResult = this.getCachedLocation();
    
    // Если есть свежий кэш, используем его
    if (cachedResult && this.isCacheFresh(cachedResult, 60000)) { // 1 минута
      console.log('⚡ Кэш свежий, используем его');
      return {
        location: cachedResult.location,
        accuracyInfo: getAccuracyInfo(cachedResult.accuracy),
        source: 'cache' as const
      };
    }

    // Иначе быстрый GPS запрос
    console.log('🔄 Быстрый GPS запрос...');
    try {
      const location = await this.requestLocationWithTimeout(
        { accuracy: Location.Accuracy.Low },
        3000 // 3 секунды таймаут
      );
      
      this.cacheLocation(location);
      return {
        location,
        accuracyInfo: getAccuracyInfo(location.coords.accuracy || undefined),
        source: 'fast' as const
      };
    } catch (error) {
      // Если быстрый запрос не удался, используем старый кэш если есть
      if (cachedResult) {
        console.log('⚠️ Быстрый GPS не удался, используем старый кэш');
        return {
          location: cachedResult.location,
          accuracyInfo: getAccuracyInfo(cachedResult.accuracy),
          source: 'cache' as const
        };
      }
      throw error;
    }
  }

  /**
   * Сбалансированное местоположение (быстро + точно параллельно)
   */
  private async getBalancedLocation() {
    console.log('🔄 Сбалансированный поиск местоположения...');
    
    // Запускаем два запроса параллельно
    const promises = [
      // Быстрый запрос (3 сек таймаут)
      this.requestLocationWithTimeout(
        { accuracy: Location.Accuracy.Balanced },
        3000
      ).then(location => ({ location, type: 'fast' as const })),
      
      // Точный запрос (8 сек таймаут)
      this.requestLocationWithTimeout(
        { accuracy: Location.Accuracy.High },
        8000
      ).then(location => ({ location, type: 'accurate' as const }))
    ];

    try {
      // Ждем первый успешный результат
      const firstResult = await Promise.race(promises);
      
      console.log(`✅ Получен ${firstResult.type} результат`);
      this.cacheLocation(firstResult.location);
      
      // Запускаем в фоне улучшение точности если получили быстрый результат
      if (firstResult.type === 'fast') {
        this.improveAccuracyInBackground(promises);
      }
      
      return {
        location: firstResult.location,
        accuracyInfo: getAccuracyInfo(firstResult.location.coords.accuracy || undefined),
        source: firstResult.type === 'fast' ? 'fast' as const : 'accurate' as const
      };
    } catch (error) {
      // Если оба запроса не удались, пробуем кэш
      const cachedResult = this.getCachedLocation();
      if (cachedResult) {
        console.log('⚠️ GPS не удался, используем кэш');
        return {
          location: cachedResult.location,
          accuracyInfo: getAccuracyInfo(cachedResult.accuracy),
          source: 'cache' as const
        };
      }
      throw error;
    }
  }

  /**
   * Точное местоположение (максимальная точность)
   */
  private async getAccurateLocation() {
    console.log('🎯 Запрос максимальной точности...');
    
    try {
      const location = await this.requestLocationWithTimeout(
        { accuracy: Location.Accuracy.BestForNavigation },
        15000 // 15 секунд таймаут
      );
      
      this.cacheLocation(location);
      return {
        location,
        accuracyInfo: getAccuracyInfo(location.coords.accuracy || undefined),
        source: 'accurate' as const
      };
    } catch (error) {
      // Fallback к менее точному запросу
      console.log('⚠️ Максимальная точность не удалась, пробуем высокую...');
      const location = await this.requestLocationWithTimeout(
        { accuracy: Location.Accuracy.High },
        8000
      );
      
      this.cacheLocation(location);
      return {
        location,
        accuracyInfo: getAccuracyInfo(location.coords.accuracy || undefined),
        source: 'accurate' as const
      };
    }
  }

  /**
   * GPS запрос с таймаутом
   */
  private async requestLocationWithTimeout(
    options: Location.LocationOptions,
    timeoutMs: number
  ): Promise<Location.LocationObject> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Location request timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      Location.getCurrentPositionAsync(options)
        .then(location => {
          clearTimeout(timer);
          resolve(location);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Улучшение точности в фоновом режиме
   */
  private async improveAccuracyInBackground(promises: Promise<any>[]) {
    try {
      // Ждем завершения всех запросов
      const results = await Promise.allSettled(promises);
      
      // Ищем более точный результат
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.type === 'accurate') {
          const improvedLocation = result.value.location;
          const currentCached = this.getCachedLocation();
          
          // Если новый результат значительно точнее, обновляем кэш
          if (currentCached && improvedLocation.coords.accuracy) {
            const improvement = currentCached.accuracy / improvedLocation.coords.accuracy;
            if (improvement > 1.5) { // Улучшение более чем в 1.5 раза
              console.log('🎯 Фоновое улучшение точности:', improvedLocation.coords.accuracy);
              this.cacheLocation(improvedLocation);
            }
          }
          break;
        }
      }
    } catch (error) {
      console.log('⚠️ Фоновое улучшение точности не удалось');
    }
  }

  /**
   * Получение кэшированного местоположения
   */
  private getCachedLocation(): CachedLocation | null {
    if (!lastKnownLocation) return null;
    
    const age = Date.now() - lastKnownLocation.timestamp;
    if (age > CACHE_MAX_AGE) {
      console.log('🗑️ Кэш устарел, очищаем');
      lastKnownLocation = null;
      return null;
    }
    
    return lastKnownLocation;
  }

  /**
   * Проверка свежести кэша
   */
  private isCacheFresh(cached: CachedLocation, maxAge: number): boolean {
    return (Date.now() - cached.timestamp) <= maxAge;
  }

  /**
   * Кэширование местоположения
   */
  private cacheLocation(location: Location.LocationObject) {
    lastKnownLocation = {
      location,
      timestamp: Date.now(),
      accuracy: location.coords.accuracy || Infinity
    };
    console.log('💾 Местоположение закэшировано');
  }

  /**
   * Ожидание завершения текущего запроса
   */
  private async waitForCurrentLocation(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.isLocating) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * Предварительная загрузка местоположения
   */
  async preloadLocation(): Promise<void> {
    if (this.isLocating) return;
    
    try {
      console.log('🔄 Предварительная загрузка местоположения...');
      await this.getFastLocation('instant');
    } catch (error) {
      console.log('⚠️ Предварительная загрузка не удалась');
    }
  }

  /**
   * Очистка кэша
   */
  clearCache(): void {
    lastKnownLocation = null;
    console.log('🗑️ Кэш местоположения очищен');
  }
}

/**
 * Утилита для получения быстрого местоположения
 */
export const getFastLocation = async (
  strategy: 'instant' | 'balanced' | 'accurate' = 'balanced'
) => {
  const service = FastLocationService.getInstance();
  return await service.getFastLocation(strategy);
};

/**
 * Предварительная загрузка геолокации (для улучшения UX)
 */
export const preloadLocation = async () => {
  const service = FastLocationService.getInstance();
  return await service.preloadLocation();
}; 