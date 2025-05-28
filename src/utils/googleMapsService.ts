// Google Maps API сервис для геокодирования и поиска адресов

interface GoogleMapsGeocodeResult {
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    location_type: string;
    viewport: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
  };
  place_id: string;
  types: string[];
}

interface GoogleMapsGeocodeResponse {
  results: GoogleMapsGeocodeResult[];
  status: string;
}

interface Address {
  id: string;
  description: string;
  latitude: number;
  longitude: number;
}

class GoogleMapsService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Поиск адресов по запросу
  async searchAddresses(query: string, region: { latitude: number; longitude: number }): Promise<Address[]> {
    if (query.trim().length < 3) {
      return [];
    }

    try {
      const location = `${region.latitude},${region.longitude}`;
      const url = `${this.baseUrl}/geocode/json?address=${encodeURIComponent(query)}&location=${location}&radius=50000&language=ru&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data: GoogleMapsGeocodeResponse = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        return data.results.slice(0, 5).map((result, index) => ({
          id: result.place_id || `result_${index}`,
          description: result.formatted_address,
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        }));
      }

      return [];
    } catch (error) {
      console.error('Ошибка при поиске адресов:', error);
      throw new Error('Не удалось выполнить поиск адресов');
    }
  }

  // Обратное геокодирование (получение адреса по координатам)
  async reverseGeocode(latitude: number, longitude: number): Promise<Address | null> {
    try {
      // Улучшенные параметры для более точного геокодирования
      const url = `${this.baseUrl}/geocode/json?latlng=${latitude},${longitude}&language=ru&result_type=street_address|premise|subpremise&key=${this.apiKey}`;
      
      console.log('🌍 Обратное геокодирование для координат:', latitude, longitude);
      
      const response = await fetch(url);
      const data: GoogleMapsGeocodeResponse = await response.json();

      console.log('📍 Результаты геокодирования:', data.status, 'Найдено:', data.results?.length || 0);

      if (data.status === 'OK' && data.results.length > 0) {
        // Фильтруем результаты для получения наиболее точного адреса
        let bestResult = null;
        
        // Сначала ищем точный адрес (street_address)
        for (const result of data.results) {
          console.log('🏠 Тип результата:', result.types);
          console.log('📝 Адрес:', result.formatted_address);
          
          // Пропускаем Plus Codes и неточные адреса
          if (result.formatted_address.includes('+') || 
              result.types.includes('plus_code')) {
            console.log('⏭️ Пропускаем Plus Code');
            continue;
          }
          
          // Приоритет точным адресам
          if (result.types.includes('street_address') || 
              result.types.includes('premise') ||
              result.types.includes('subpremise')) {
            bestResult = result;
            console.log('✅ Найден точный адрес');
            break;
          }
          
          // Если точного нет, берем первый подходящий
          if (!bestResult && !result.types.includes('political')) {
            bestResult = result;
          }
        }
        
        // Если не нашли точный адрес, делаем второй запрос без фильтров
        if (!bestResult || bestResult.formatted_address.includes('+')) {
          console.log('🔄 Повторный запрос без фильтров...');
          const fallbackUrl = `${this.baseUrl}/geocode/json?latlng=${latitude},${longitude}&language=ru&key=${this.apiKey}`;
          
          const fallbackResponse = await fetch(fallbackUrl);
          const fallbackData: GoogleMapsGeocodeResponse = await fallbackResponse.json();
          
          if (fallbackData.status === 'OK' && fallbackData.results.length > 0) {
            // Ищем результат без Plus Code
            bestResult = fallbackData.results.find(result => 
              !result.formatted_address.includes('+') && 
              !result.types.includes('plus_code')
            ) || fallbackData.results[0];
          }
        }
        
        if (bestResult) {
          console.log('🎯 Итоговый адрес:', bestResult.formatted_address);
          return {
            id: bestResult.place_id || 'current',
            description: bestResult.formatted_address,
            latitude: bestResult.geometry.location.lat,
            longitude: bestResult.geometry.location.lng,
          };
        }
      }

      console.log('❌ Не удалось найти подходящий адрес');
      return null;
    } catch (error) {
      console.error('❌ Ошибка при обратном геокодировании:', error);
      throw new Error('Не удалось определить адрес по координатам');
    }
  }

  // Поиск адресов с автодополнением (Places API)
  async searchPlaces(query: string, region: { latitude: number; longitude: number }): Promise<Address[]> {
    console.log('🔍 Поиск мест:', query);
    
    if (query.trim().length < 3) {
      console.log('❌ Запрос слишком короткий');
      return [];
    }

    try {
      const location = `${region.latitude},${region.longitude}`;
      const url = `${this.baseUrl}/place/autocomplete/json?input=${encodeURIComponent(query)}&location=${location}&radius=50000&language=ru&components=country:ru&key=${this.apiKey}`;
      
      console.log('🌐 URL запроса:', url.replace(this.apiKey, 'API_KEY_HIDDEN'));
      
      const response = await fetch(url);
      const data = await response.json();

      console.log('📡 Ответ от API:', data.status, 'Результатов:', data.predictions?.length || 0);

      if (data.status === 'OK' && data.predictions.length > 0) {
        // Получаем детали для каждого предложения
        const detailedResults = await Promise.all(
          data.predictions.slice(0, 5).map(async (prediction: any) => {
            return await this.getPlaceDetails(prediction.place_id);
          })
        );

        const filteredResults = detailedResults.filter(result => result !== null) as Address[];
        console.log('✅ Найдено адресов:', filteredResults.length);
        return filteredResults;
      }

      console.log('❌ Нет результатов или ошибка API:', data.status);
      return [];
    } catch (error) {
      console.error('❌ Ошибка при поиске мест:', error);
      throw new Error('Не удалось выполнить поиск мест');
    }
  }

  // Получение деталей места по place_id
  private async getPlaceDetails(placeId: string): Promise<Address | null> {
    try {
      const url = `${this.baseUrl}/place/details/json?place_id=${placeId}&fields=formatted_address,geometry&language=ru&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        const result = data.result;
        return {
          id: placeId,
          description: result.formatted_address,
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        };
      }

      return null;
    } catch (error) {
      console.error('Ошибка при получении деталей места:', error);
      return null;
    }
  }

  // Поиск ближайших мест в радиусе (для неточной геолокации)
  async searchNearbyPlaces(latitude: number, longitude: number, radius: number = 500): Promise<Address[]> {
    try {
      console.log('🔍 Поиск ближайших мест в радиусе', radius, 'метров');
      
      // Используем обычное геокодирование с увеличенным радиусом
      const url = `${this.baseUrl}/geocode/json?latlng=${latitude},${longitude}&language=ru&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data: GoogleMapsGeocodeResponse = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        // Фильтруем и ограничиваем результаты
        const places = data.results
          .filter(result => 
            !result.formatted_address.includes('+') && 
            !result.types.includes('plus_code') &&
            (result.types.includes('street_address') || 
             result.types.includes('premise') ||
             result.types.includes('establishment'))
          )
          .slice(0, 5)
          .map((result, index) => ({
            id: result.place_id || `nearby_${index}`,
            description: result.formatted_address,
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
          }));

        console.log('✅ Найдено ближайших мест:', places.length);
        return places;
      }

      return [];
    } catch (error) {
      console.error('❌ Ошибка при поиске ближайших мест:', error);
      return [];
    }
  }
}

// Singleton instance
let googleMapsService: GoogleMapsService | null = null;

export const initializeGoogleMapsService = (apiKey: string) => {
  console.log('🗺️ Инициализация Google Maps Service...');
  console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'НЕ ПРЕДОСТАВЛЕН');
  googleMapsService = new GoogleMapsService(apiKey);
  console.log('✅ Google Maps Service инициализирован');
};

export const getGoogleMapsService = (): GoogleMapsService => {
  if (!googleMapsService) {
    throw new Error('Google Maps Service не инициализирован. Вызовите initializeGoogleMapsService сначала.');
  }
  return googleMapsService;
};

export { GoogleMapsService };
export type { Address }; 