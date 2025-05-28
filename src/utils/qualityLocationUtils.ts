import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { LocationAccuracyInfo, getAccuracyInfo } from './locationUtils';

/**
 * Качественная геолокация основанная на лучших практиках Apple, Google и научных исследованиях
 * 
 * Принципы из индустрии:
 * 1. Адаптивные стратегии (iOS Core Location, Android FusedLocationProvider)
 * 2. Энергосберегающие техники с балансированием точности
 * 3. Прогрессивное улучшение качества
 * 4. Контекстно-зависимая точность
 * 5. Гибридные подходы (GPS + WiFi + Cellular)
 */

interface QualityLocationResult {
  location: Location.LocationObject;
  accuracyInfo: LocationAccuracyInfo;
  strategy: 'quick' | 'balanced' | 'precise' | 'cached';
  timeSpent: number;
  energyProfile: 'low' | 'medium' | 'high';
  method: 'gps' | 'hybrid' | 'cached';
}

interface LocationStrategy {
  accuracy: Location.Accuracy;
  timeout: number;
  name: string;
  description: string;
  energyProfile: 'low' | 'medium' | 'high';
  expectedAccuracy: number; // в метрах
}

/**
 * Адаптивные стратегии определения местоположения
 * Основано на исследованиях Samsung Galaxy точности и Apple Core Location guidelines
 */
const ADAPTIVE_STRATEGIES: LocationStrategy[] = [
  {
    accuracy: Location.Accuracy.Low, // ~100м, батареечно эффективно
    timeout: 5000,
    name: 'quick',
    description: 'Быстрое определение (WiFi/Cell)',
    energyProfile: 'low',
    expectedAccuracy: 100
  },
  {
    accuracy: Location.Accuracy.Balanced, // ~10-20м, умеренное потребление
    timeout: 10000,
    name: 'balanced',
    description: 'Сбалансированное (GPS + сети)',
    energyProfile: 'medium',
    expectedAccuracy: 15
  },
  {
    accuracy: Location.Accuracy.High, // ~3-5м, высокое потребление
    timeout: 20000,
    name: 'precise',
    description: 'Точное определение (GPS)',
    energyProfile: 'high',
    expectedAccuracy: 5
  }
];

interface LocationCache {
  location: Location.LocationObject;
  accuracyInfo: LocationAccuracyInfo;
  timestamp: number;
  source: 'gps' | 'network' | 'passive';
}

export class QualityLocationService {
  private static instance: QualityLocationService;
  private isLocating = false;
  private abortController: AbortController | null = null;
  private locationCache: LocationCache | null = null;
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 минуты кэш
  private readonly STALE_CACHE_DURATION = 10 * 60 * 1000; // 10 минут для устаревших данных

  static getInstance(): QualityLocationService {
    if (!QualityLocationService.instance) {
      QualityLocationService.instance = new QualityLocationService();
    }
    return QualityLocationService.instance;
  }

  /**
   * Интеллектуальное получение местоположения с адаптивными стратегиями
   * Автоматически выбирает оптимальную стратегию на основе контекста
   */
  async getSmartLocation(
    requiredAccuracy: number = 50, // требуемая точность в метрах
    maxTime: number = 30000, // максимальное время ожидания
    energyPreference: 'efficiency' | 'accuracy' | 'balanced' = 'balanced'
  ): Promise<QualityLocationResult> {
    console.log(`🧠 Умное определение местоположения (точность: ${requiredAccuracy}м, энергия: ${energyPreference})`);

    // Проверяем кэш
    const cachedLocation = this.getCachedLocation(requiredAccuracy);
    if (cachedLocation) {
      console.log('⚡ Используем кэшированное местоположение');
      return cachedLocation;
    }

    // Выбираем оптимальную стратегию
    const strategy = this.selectOptimalStrategy(requiredAccuracy, energyPreference);
    console.log(`📋 Выбрана стратегия: ${strategy.description}`);

    return this.executeLocationStrategy(strategy, requiredAccuracy, maxTime);
  }

  /**
   * Выбор оптимальной стратегии на основе требований и предпочтений
   */
  private selectOptimalStrategy(
    requiredAccuracy: number,
    energyPreference: 'efficiency' | 'accuracy' | 'balanced'
  ): LocationStrategy {
    const strategies = [...ADAPTIVE_STRATEGIES];

    // Фильтруем стратегии по требуемой точности
    const suitableStrategies = strategies.filter(s => s.expectedAccuracy <= requiredAccuracy * 2);

    if (suitableStrategies.length === 0) {
      // Если нет подходящих стратегий, используем самую точную
      return strategies[strategies.length - 1];
    }

    // Выбираем на основе энергетических предпочтений
    switch (energyPreference) {
      case 'efficiency':
        // Выбираем самую энергоэффективную из подходящих
        return suitableStrategies.find(s => s.energyProfile === 'low') || suitableStrategies[0];
      
      case 'accuracy':
        // Выбираем самую точную из подходящих
        return suitableStrategies[suitableStrategies.length - 1];
      
      case 'balanced':
      default:
        // Выбираем сбалансированную стратегию
        return suitableStrategies.find(s => s.energyProfile === 'medium') ||
               suitableStrategies[Math.floor(suitableStrategies.length / 2)];
    }
  }

  /**
   * Выполнение выбранной стратегии определения местоположения
   */
  private async executeLocationStrategy(
    strategy: LocationStrategy,
    requiredAccuracy: number,
    maxTime: number
  ): Promise<QualityLocationResult> {
    if (this.isLocating) {
      throw new Error('Геолокация уже выполняется');
    }

    this.isLocating = true;
    this.abortController = new AbortController();
    const startTime = Date.now();

    try {
      // Ограничиваем время выполнения стратегии
      const timeoutForStrategy = Math.min(strategy.timeout, maxTime);
      
      console.log(`⏱️ Выполняем ${strategy.description} (${timeoutForStrategy/1000}с)`);
      
      const location = await this.requestLocationWithTimeout(
        { 
          accuracy: strategy.accuracy,
          // Дополнительные оптимизации для Android
          ...(Platform.OS === 'android' && {
            enableHighAccuracy: strategy.energyProfile !== 'low',
            timeout: timeoutForStrategy,
            maximumAge: strategy.energyProfile === 'low' ? 60000 : 30000
          })
        },
        timeoutForStrategy
      );

      const accuracyInfo = getAccuracyInfo(location.coords.accuracy || undefined);
      const timeSpent = Date.now() - startTime;

      const result: QualityLocationResult = {
        location,
        accuracyInfo,
        strategy: strategy.name as any,
        timeSpent,
        energyProfile: strategy.energyProfile,
        method: this.determineLocationMethod(strategy, accuracyInfo)
      };

      // Кэшируем результат для будущего использования
      this.cacheLocation(location, accuracyInfo, this.determineLocationSource(strategy));

      console.log(`✅ ${strategy.description} завершено:`, {
        accuracy: `${accuracyInfo.accuracy.toFixed(0)}м`,
        level: accuracyInfo.level,
        timeSpent: `${timeSpent/1000}с`,
        energy: strategy.energyProfile,
        method: result.method
      });

      return result;

    } catch (error) {
      console.error(`❌ Ошибка выполнения ${strategy.description}:`, (error as Error).message);
      
      // Пытаемся использовать устаревший кэш как fallback
      const staleCache = this.getStaleCache();
      if (staleCache) {
        console.log('🔄 Используем устаревший кэш как fallback');
        return staleCache;
      }

      throw error;
    } finally {
      this.isLocating = false;
      this.abortController = null;
    }
  }

  /**
   * Получение качественного местоположения с прогрессивным улучшением
   * Реализует подход Apple iOS Core Location
   */
  async getQualityLocation(
    maxAccuracyNeeded: number = 50,
    maxTimeAllowed: number = 30000
  ): Promise<QualityLocationResult> {
    console.log(`🎯 Прогрессивное определение местоположения (до ${maxAccuracyNeeded}м за ${maxTimeAllowed/1000}с)`);

    // Сначала проверяем кэш
    const cachedLocation = this.getCachedLocation(maxAccuracyNeeded);
    if (cachedLocation) {
      return cachedLocation;
    }

    // Пробуем последнее известное местоположение
    const lastKnown = await this.getLastKnownLocation();
    if (lastKnown && this.isLocationAcceptable(lastKnown, maxAccuracyNeeded)) {
      console.log('📍 Используем последнее известное местоположение');
      const result = this.createResult(lastKnown, 'cached', 0);
      this.cacheLocation(lastKnown.location, lastKnown.accuracyInfo, 'passive');
      return result;
    }

    // Прогрессивное улучшение
    return this.executeProgressiveLocationFix(maxAccuracyNeeded, maxTimeAllowed);
  }

  /**
   * Быстрое определение местоположения для немедленного отклика
   */
  async getQuickLocation(): Promise<QualityLocationResult> {
    console.log('⚡ Быстрое определение местоположения...');
    
    // Проверяем свежий кэш (до 30 секунд)
    if (this.locationCache && Date.now() - this.locationCache.timestamp < 30000) {
      console.log('⚡ Используем очень свежий кэш');
      return this.createResult(this.locationCache, 'cached', 0);
    }

    const startTime = Date.now();

    try {
      // Быстрый запрос с низким энергопотреблением
      const location = await this.requestLocationWithTimeout(
        { 
          accuracy: Location.Accuracy.Low,
          // Минимальные настройки для скорости
          ...(Platform.OS === 'android' && {
            enableHighAccuracy: false,
            timeout: 6000,
            maximumAge: 120000 // Разрешаем данные до 2 минут
          })
        },
        6000
      );

      const accuracyInfo = getAccuracyInfo(location.coords.accuracy || undefined);
      const result = this.createResult({ location, accuracyInfo }, 'quick', Date.now() - startTime);
      
      this.cacheLocation(location, accuracyInfo, 'network');
      return result;

    } catch (error) {
      console.log('⚠️ Быстрое определение не удалось, пробуем кэш...');
      
      const fallbackCache = this.getStaleCache();
      if (fallbackCache) {
        return fallbackCache;
      }

      throw error;
    }
  }

  /**
   * Прогрессивное определение местоположения с улучшением качества
   */
  private async executeProgressiveLocationFix(
    maxAccuracy: number,
    maxTime: number
  ): Promise<QualityLocationResult> {
    const startTime = Date.now();
    
    for (const strategy of ADAPTIVE_STRATEGIES) {
      const timeLeft = maxTime - (Date.now() - startTime);
      
      if (timeLeft <= 0) {
        console.log('⏰ Время истекло');
        break;
      }

      const timeoutForStrategy = Math.min(strategy.timeout, timeLeft);
      
      try {
        console.log(`🔄 ${strategy.description} (${timeoutForStrategy/1000}с)...`);
        
        const location = await this.requestLocationWithTimeout(
          { accuracy: strategy.accuracy },
          timeoutForStrategy
        );

        const accuracyInfo = getAccuracyInfo(location.coords.accuracy || undefined);
        const result = this.createResult({ location, accuracyInfo }, strategy.name as any, Date.now() - startTime);
        
        console.log(`✅ ${strategy.description} завершено: ${accuracyInfo.accuracy.toFixed(0)}м`);

        // Кэшируем результат
        this.cacheLocation(location, accuracyInfo, this.determineLocationSource(strategy));

        // Проверяем, достаточно ли точности
        if (accuracyInfo.accuracy <= maxAccuracy) {
          console.log(`🎯 Достигнута требуемая точность (${accuracyInfo.accuracy.toFixed(0)}м <= ${maxAccuracy}м)`);
          return result;
        }

        // Если это не последняя стратегия и есть время, продолжаем
        if (strategy !== ADAPTIVE_STRATEGIES[ADAPTIVE_STRATEGIES.length - 1]) {
          console.log(`📈 Точность ${accuracyInfo.accuracy.toFixed(0)}м недостаточна, улучшаем...`);
          continue;
        }

        // Последняя стратегия - возвращаем что есть
        console.log(`🏁 Возвращаем лучший результат: ${accuracyInfo.accuracy.toFixed(0)}м`);
        return result;

      } catch (error) {
        console.log(`⚠️ ${strategy.description} не удалось:`, (error as Error).message);
        
        // Если это последняя стратегия, пробрасываем ошибку
        if (strategy === ADAPTIVE_STRATEGIES[ADAPTIVE_STRATEGIES.length - 1]) {
          throw error;
        }
        
        continue;
      }
    }

    throw new Error('Не удалось определить местоположение ни одним способом');
  }

  /**
   * Получение последнего известного местоположения
   */
  private async getLastKnownLocation(): Promise<{ location: Location.LocationObject, accuracyInfo: LocationAccuracyInfo } | null> {
    try {
      const lastKnown = await Location.getLastKnownPositionAsync({
        maxAge: 5 * 60 * 1000, // 5 минут
        requiredAccuracy: 1000 // до 1км
      });

      if (lastKnown) {
        const accuracyInfo = getAccuracyInfo(lastKnown.coords.accuracy || undefined);
        return { location: lastKnown, accuracyInfo };
      }

      return null;
    } catch (error) {
      console.log('⚠️ Не удалось получить последнее известное местоположение');
      return null;
    }
  }

  /**
   * Запрос местоположения с таймаутом и оптимизациями
   */
  private async requestLocationWithTimeout(
    options: Location.LocationOptions,
    timeoutMs: number
  ): Promise<Location.LocationObject> {
    if (this.abortController?.signal.aborted) {
      throw new Error('Операция отменена');
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Время ожидания истекло (${timeoutMs/1000}с)`));
      }, timeoutMs);

      // Слушаем сигнал отмены
      if (this.abortController) {
        this.abortController.signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('Операция отменена'));
        });
      }

      // Оптимизированные настройки для разных платформ
      const optimizedOptions = {
        ...options,
        // Дополнительные оптимизации
        ...(Platform.OS === 'ios' && {
          // iOS специфичные настройки
          distanceInterval: options.accuracy === Location.Accuracy.Low ? 50 : 10
        })
      };

      Location.getCurrentPositionAsync(optimizedOptions)
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
   * Кэширование местоположения
   */
  private cacheLocation(
    location: Location.LocationObject,
    accuracyInfo: LocationAccuracyInfo,
    source: 'gps' | 'network' | 'passive'
  ): void {
    this.locationCache = {
      location,
      accuracyInfo,
      timestamp: Date.now(),
      source
    };
  }

  /**
   * Получение кэшированного местоположения
   */
  private getCachedLocation(requiredAccuracy: number): QualityLocationResult | null {
    if (!this.locationCache) return null;

    const age = Date.now() - this.locationCache.timestamp;
    
    // Проверяем свежесть кэша
    if (age > this.CACHE_DURATION) return null;
    
    // Проверяем точность
    if (this.locationCache.accuracyInfo.accuracy > requiredAccuracy) return null;

    return this.createResult(this.locationCache, 'cached', 0);
  }

  /**
   * Получение устаревшего кэша как fallback
   */
  private getStaleCache(): QualityLocationResult | null {
    if (!this.locationCache) return null;

    const age = Date.now() - this.locationCache.timestamp;
    
    // Используем устаревший кэш только если он не слишком старый
    if (age > this.STALE_CACHE_DURATION) return null;

    console.log(`⚠️ Используем устаревший кэш (возраст: ${Math.round(age/1000)}с)`);
    return this.createResult(this.locationCache, 'cached', 0);
  }

  /**
   * Создание результата
   */
  private createResult(
    locationData: { location: Location.LocationObject, accuracyInfo: LocationAccuracyInfo },
    strategy: 'quick' | 'balanced' | 'precise' | 'cached',
    timeSpent: number
  ): QualityLocationResult {
    return {
      location: locationData.location,
      accuracyInfo: locationData.accuracyInfo,
      strategy,
      timeSpent,
      energyProfile: this.getEnergyProfileForStrategy(strategy),
      method: this.determineMethodFromAccuracy(locationData.accuracyInfo)
    };
  }

  /**
   * Определение энергетического профиля для стратегии
   */
  private getEnergyProfileForStrategy(strategy: string): 'low' | 'medium' | 'high' {
    switch (strategy) {
      case 'quick':
      case 'cached':
        return 'low';
      case 'balanced':
        return 'medium';
      case 'precise':
        return 'high';
      default:
        return 'medium';
    }
  }

  /**
   * Определение метода определения местоположения
   */
  private determineLocationMethod(strategy: LocationStrategy, accuracyInfo: LocationAccuracyInfo): 'gps' | 'hybrid' | 'cached' {
    if (accuracyInfo.accuracy <= 10) return 'gps';
    if (strategy.energyProfile === 'low') return 'cached';
    return 'hybrid';
  }

  /**
   * Определение источника данных местоположения
   */
  private determineLocationSource(strategy: LocationStrategy): 'gps' | 'network' | 'passive' {
    switch (strategy.energyProfile) {
      case 'low': return 'network';
      case 'medium': return 'network';
      case 'high': return 'gps';
      default: return 'network';
    }
  }

  /**
   * Определение метода по точности
   */
  private determineMethodFromAccuracy(accuracyInfo: LocationAccuracyInfo): 'gps' | 'hybrid' | 'cached' {
    if (accuracyInfo.accuracy <= 5) return 'gps';
    if (accuracyInfo.accuracy <= 50) return 'hybrid';
    return 'cached';
  }

  /**
   * Проверка приемлемости точности
   */
  private isLocationAcceptable(
    locationData: { location: Location.LocationObject, accuracyInfo: LocationAccuracyInfo },
    maxAccuracyNeeded: number
  ): boolean {
    return locationData.accuracyInfo.accuracy <= maxAccuracyNeeded;
  }

  /**
   * Отмена текущей операции
   */
  cancelCurrentOperation(): void {
    if (this.abortController) {
      console.log('🚫 Отменяем операцию геолокации');
      this.abortController.abort();
    }
  }

  /**
   * Очистка кэша
   */
  clearCache(): void {
    this.locationCache = null;
    console.log('🗑️ Кэш местоположения очищен');
  }

  /**
   * Получение информации о кэше
   */
  getCacheInfo(): { hasCache: boolean; age?: number; accuracy?: number; source?: string } | null {
    if (!this.locationCache) {
      return { hasCache: false };
    }

    return {
      hasCache: true,
      age: Date.now() - this.locationCache.timestamp,
      accuracy: this.locationCache.accuracyInfo.accuracy,
      source: this.locationCache.source
    };
  }

  /**
   * Проверка статуса операции
   */
  isCurrentlyLocating(): boolean {
    return this.isLocating;
  }
}

/**
 * Умное получение местоположения с автоматическим выбором стратегии
 */
export const getSmartLocation = async (
  requiredAccuracy: number = 50,
  maxTime: number = 30000,
  energyPreference: 'efficiency' | 'accuracy' | 'balanced' = 'balanced'
): Promise<QualityLocationResult> => {
  const service = QualityLocationService.getInstance();
  return await service.getSmartLocation(requiredAccuracy, maxTime, energyPreference);
};

/**
 * Получение качественного местоположения с прогрессивным улучшением
 */
export const getQualityLocation = async (
  maxAccuracyNeeded: number = 50,
  maxTimeAllowed: number = 30000
): Promise<QualityLocationResult> => {
  const service = QualityLocationService.getInstance();
  return await service.getQualityLocation(maxAccuracyNeeded, maxTimeAllowed);
};

/**
 * Быстрое получение местоположения
 */
export const getQuickLocation = async (): Promise<QualityLocationResult> => {
  const service = QualityLocationService.getInstance();
  return await service.getQuickLocation();
}; 