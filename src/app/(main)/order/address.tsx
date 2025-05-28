import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput as RNTextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Text, Button, List, Divider, Portal, Modal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import appTheme from '../../../constants/theme';
import { ServiceStackParamList } from '../services/_layout';
import { getUserSavedAddresses, saveUserAddress, SavedAddress } from '../../../lib/supabase';
import { getGoogleMapsService, initializeGoogleMapsService, Address } from '../../../utils/googleMapsService';
import { GOOGLE_MAPS_API_KEY_CONFIG, DEFAULT_REGION } from '../../../constants/config';
import { getFastLocation, preloadLocation } from '../../../utils/fastLocationUtils';
import { getQualityLocation, getQuickLocation } from '../../../utils/qualityLocationUtils';
// LocationAccuracy компонент убран по просьбе пользователя

type OrderAddressRouteProp = RouteProp<ServiceStackParamList, 'OrderAddress'>;
type OrderAddressNavigationProp = StackNavigationProp<ServiceStackParamList, 'OrderDetails'>;

/**
 * Экран выбора адреса для заказа
 */
const OrderAddressScreen = () => {  const route = useRoute<OrderAddressRouteProp>();  const navigation = useNavigation<OrderAddressNavigationProp>();  const { serviceId, specialistId } = route.params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Address[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [region, setRegion] = useState({
    latitude: 55.7558, // Москва по умолчанию
    longitude: 37.6176,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  // Состояния для ручного ввода адреса
  const [showManualAddressModal, setShowManualAddressModal] = useState(false);
  const [manualAddressCity, setManualAddressCity] = useState('');
  const [manualAddressStreet, setManualAddressStreet] = useState('');
  const [manualAddressHouse, setManualAddressHouse] = useState('');
  const [manualAddressApartment, setManualAddressApartment] = useState('');

  // Состояние точности GPS убрано по просьбе пользователя

  // Эффект для запроса разрешений на использование геолокации и загрузки сохраненных адресов
  useEffect(() => {
    const initializeScreen = async () => {
      try {
        // Инициализируем Google Maps Service
        initializeGoogleMapsService(GOOGLE_MAPS_API_KEY_CONFIG);
        
        // Только запрашиваем разрешение, но не запускаем геолокацию автоматически
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          console.log('⚠️ Разрешение на геолокацию не предоставлено');
          // Не показываем alert при загрузке, пользователь может не хотеть использовать GPS
        } else {
          console.log('✅ Разрешение на геолокацию получено');
          // Не запускаем автоматически геолокацию - пользователь сам выберет
        }
        
        // Загружаем сохраненные адреса
        await loadSavedAddresses();
      } catch (error) {
        console.error('Ошибка при инициализации экрана:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeScreen();
  }, []);

  // Быстрое получение текущего местоположения (6 секунд)
  const getLocationQuick = async () => {
    setIsLoadingLocation(true);
    
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          showPermissionAlert();
          return;
        }
      }
      
      console.log('⚡ Быстрое определение местоположения...');
      const result = await getQuickLocation();
      await handleLocationResult(result);
      
    } catch (error) {
      console.error('❌ Ошибка быстрого определения:', error);
      handleLocationError(error as Error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Качественное получение местоположения (до 30 секунд, точность до 50м)
  const getLocationQuality = async () => {
    setIsLoadingLocation(true);
    
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          showPermissionAlert();
          return;
        }
      }
      
      console.log('🎯 Качественное определение местоположения...');
      const result = await getQualityLocation(50, 30000); // 50м точность, 30с максимум
      await handleLocationResult(result);
      
    } catch (error) {
      console.error('❌ Ошибка качественного определения:', error);
      handleLocationError(error as Error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Точное получение местоположения (до 45 секунд, точность до 20м)
  const getLocationPrecise = async () => {
    setIsLoadingLocation(true);
    
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          showPermissionAlert();
          return;
        }
      }
      
      console.log('🔬 Точное определение местоположения...');
      const result = await getQualityLocation(20, 45000); // 20м точность, 45с максимум
      await handleLocationResult(result);
      
    } catch (error) {
      console.error('❌ Ошибка точного определения:', error);
      handleLocationError(error as Error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Обработка результата геолокации
  const handleLocationResult = async (result: any) => {
    const { location, accuracyInfo, strategy, timeSpent } = result;
    const { latitude, longitude } = location.coords;
    
    console.log('🎯 Местоположение получено:', { 
      latitude, 
      longitude, 
      accuracy: `${accuracyInfo.accuracy.toFixed(0)}м`,
      strategy,
      level: accuracyInfo.level,
      timeSpent: `${(timeSpent/1000).toFixed(1)}с`
    });
    
    // Информация о точности GPS убрана по просьбе пользователя
    
    // Проверяем разумность координат
    const isValidLocation = latitude >= 41 && latitude <= 81 && longitude >= 19 && longitude <= 180;
    
    if (!isValidLocation) {
      Alert.alert(
        '🌍 Некорректное местоположение',
        `GPS определил ваше местоположение как ${latitude.toFixed(4)}, ${longitude.toFixed(4)}, что находится за пределами обслуживаемой зоны.`,
        [
          { text: 'Использовать сохраненный адрес', onPress: () => showSavedAddressesFirst() },
          { text: 'Ввести адрес вручную', onPress: () => setShowManualAddressModal(true) },
          { text: 'Попробовать еще раз', onPress: getLocationQuality }
        ]
      );
      return;
    }
    
    // Обновляем регион карты с учетом точности
    const deltaBasedOnAccuracy = Math.max(0.001, (accuracyInfo.accuracy / 111320) * 2);
    const newRegion = {
      latitude,
      longitude,
      latitudeDelta: deltaBasedOnAccuracy,
      longitudeDelta: deltaBasedOnAccuracy,
    };
    
    setRegion(newRegion);
    
    // Получаем адрес в зависимости от точности
    if (accuracyInfo.level === 'excellent' || accuracyInfo.level === 'good') {
      console.log('✅ Хорошая точность GPS, получаем точный адрес...');
      await reverseGeocode(latitude, longitude);
    } else {
      console.log('🏠 Средняя точность GPS, ищем ближайшие адреса...');
      await suggestNearbyAddresses(latitude, longitude);
    }
  };

  // Обработка ошибки геолокации
  const handleLocationError = (error: Error) => {
    // Убрана установка точности GPS по просьбе пользователя
    
    const errorMessage = error.message;
    if (errorMessage.includes('время') || errorMessage.includes('timeout')) {
      Alert.alert(
        '⏱️ Время ожидания истекло',
        'GPS не смог определить местоположение за отведенное время. Возможно, вы находитесь в помещении или в месте с плохим сигналом.',
        [
          { text: 'Использовать сохраненный адрес', onPress: () => showSavedAddressesFirst() },
          { text: 'Ввести адрес вручную', onPress: () => setShowManualAddressModal(true) },
          { text: 'Попробовать снова', onPress: getLocationQuality }
        ]
      );
    } else {
      showSavedAddressesFirst();
    }
  };

  // Показать диалог с запросом разрешений
  const showPermissionAlert = () => {
    Alert.alert(
      'Разрешение на геолокацию',
      'Для определения вашего местоположения необходимо разрешение. Вы можете предоставить его в настройках устройства или ввести адрес вручную.',
      [
        { text: 'Ввести вручную', onPress: () => setShowManualAddressModal(true) },
        { text: 'Понятно', style: 'default' }
      ]
    );
  };

  // Обратное геокодирование (получение адреса по координатам)
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const googleMapsService = getGoogleMapsService();
      const address = await googleMapsService.reverseGeocode(latitude, longitude);
      
      if (address) {
        setSelectedAddress(address);
        setSearchQuery(address.description);
        return true; // Успешно получили адрес
      } else {
        console.log('❌ Не удалось найти адрес по координатам');
        return false; // Адрес не найден
      }
    } catch (error) {
      console.error('❌ Ошибка при получении адреса по координатам:', error);
      return false; // Ошибка
    }
  };

  // Умное предложение ближайших адресов при неточной геолокации  
  const suggestNearbyAddresses = async (latitude: number, longitude: number) => {
    try {
      const googleMapsService = getGoogleMapsService();
      
      // Ищем ближайшие точки интереса в радиусе
      const nearbyPlaces = await googleMapsService.searchNearbyPlaces(latitude, longitude, 500);
      
      if (nearbyPlaces.length > 0) {
        Alert.alert(
          '📍 Уточните адрес',
          'GPS определил ваше примерное местоположение. Выберите наиболее подходящий адрес:',
          [
            ...nearbyPlaces.slice(0, 3).map((place: Address) => ({
              text: place.description.length > 50 
                ? place.description.substring(0, 50) + '...' 
                : place.description,
              onPress: () => {
                setSelectedAddress(place);
                setSearchQuery(place.description);
              }
            })),
            { text: 'Ввести точный адрес', onPress: () => setShowManualAddressModal(true) },
            { text: 'Отмена', style: 'cancel' }
          ]
        );
      } else {
        // Если ничего не нашли, пробуем обычное обратное геокодирование
        const addressFound = await reverseGeocode(latitude, longitude);
        
        // Если и это не сработало, уведомляем пользователя
        if (!addressFound) {
          Alert.alert(
            '🌍 Проблема с определением адреса',
            'Не удалось определить ваш точный адрес по GPS координатам. Возможно, вы находитесь в месте с плохим покрытием или за пределами обслуживаемой зоны.',
            [
              { text: 'Использовать сохраненный адрес', onPress: () => showSavedAddressesFirst() },
              { text: 'Ввести адрес вручную', onPress: () => setShowManualAddressModal(true) },
              { text: 'Попробовать еще раз', onPress: getLocationQuality }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Ошибка при поиске ближайших адресов:', error);
      
      // При ошибке также пробуем обратное геокодирование
      const addressFound = await reverseGeocode(latitude, longitude);
      
      if (!addressFound) {
        Alert.alert(
          '❌ Ошибка определения местоположения',
          'Произошла ошибка при определении вашего адреса. Пожалуйста, выберите один из вариантов:',
          [
            { text: 'Использовать сохраненный адрес', onPress: () => showSavedAddressesFirst() },
            { text: 'Ввести адрес вручную', onPress: () => setShowManualAddressModal(true) },
            { text: 'Попробовать еще раз', onPress: getLocationQuality }
          ]
        );
      }
    }
  };

  // Показать сохраненные адреса в приоритете
  const showSavedAddressesFirst = () => {
    if (savedAddresses.length > 0) {
      Alert.alert(
        '🏠 Выберите адрес',
        'Используйте один из сохраненных адресов или введите новый:',
        [
          ...savedAddresses.slice(0, 2).map(addr => ({
            text: `${addr.title}: ${addr.address.substring(0, 40)}...`,
            onPress: () => handleSelectSavedAddress(addr)
          })),
          { text: 'Ввести новый адрес', onPress: () => setShowManualAddressModal(true) },
          { text: 'Попробовать GPS снова', onPress: getLocationQuality }
        ]
      );
    } else {
      Alert.alert(
        'Проблема с геолокацией',
        'Не удалось определить местоположение. Пожалуйста, введите адрес вручную.',
        [
          { text: 'Ввести адрес', onPress: () => setShowManualAddressModal(true) },
          { text: 'Повторить', onPress: getLocationQuality }
        ]
      );
    }
  };

  // Загрузка сохраненных адресов пользователя
  const loadSavedAddresses = async () => {
    try {
      // Импортируем supabase для получения текущего пользователя
      const { supabase } = await import('../../../lib/supabase');
      
      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('Пользователь не авторизован');
        return;
      }
      
      // Получаем сохраненные адреса пользователя
      const { data: addresses, error } = await getUserSavedAddresses(user.id);
      
      if (error) {
        console.error('Ошибка при загрузке сохраненных адресов:', error);
        return;
      }
      
      setSavedAddresses(addresses || []);
    } catch (error) {
      console.error('Ошибка при загрузке сохраненных адресов:', error);
      // В случае ошибки оставляем пустой массив
      setSavedAddresses([]);
    }
  };

  // Поиск адреса по запросу
  const searchAddress = async (query: string) => {
    if (query.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const googleMapsService = getGoogleMapsService();
      const results = await googleMapsService.searchPlaces(query, region);
      setSearchResults(results);
    } catch (error) {
      console.error('Ошибка при поиске адреса:', error);
      Alert.alert(
        'Ошибка',
        'Не удалось выполнить поиск адреса. Пожалуйста, попробуйте еще раз.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  // Обработчик выбора адреса из результатов поиска
  const handleSelectSearchResult = (address: Address) => {
    setSelectedAddress(address);
    setSearchQuery(address.description);
    setSearchResults([]);
  };

  // Обработчик выбора сохраненного адреса
  const handleSelectSavedAddress = (address: SavedAddress) => {
    const selectedAddr: Address = {
      id: address.id,
      description: address.address,
      latitude: address.latitude,
      longitude: address.longitude,
    };
    
    setSelectedAddress(selectedAddr);
    setSearchQuery(address.address);
    setSearchResults([]);
  };

  // Обработчик подтверждения ручного ввода адреса
  const handleManualAddressConfirm = () => {
    if (!manualAddressCity.trim() || !manualAddressStreet.trim() || !manualAddressHouse.trim()) {
      Alert.alert(
        'Неполный адрес',
        'Пожалуйста, заполните город, улицу и номер дома'
      );
      return;
    }
    
    const apartmentText = manualAddressApartment.trim() ? `, кв. ${manualAddressApartment.trim()}` : '';
    const fullAddress = `${manualAddressCity.trim()}, ${manualAddressStreet.trim()}, ${manualAddressHouse.trim()}${apartmentText}`;
    
    // Создаем новый адрес с координатами центра Москвы (заглушка)
    const manualAddress: Address = {
      id: 'manual',
      description: fullAddress,
      latitude: 55.7558,
      longitude: 37.6176,
    };
    
    setSelectedAddress(manualAddress);
    setSearchQuery(fullAddress);
    setShowManualAddressModal(false);
  };

  // Обработчик нажатия на кнопку "Продолжить"
  const handleContinue = () => {
    if (!selectedAddress) {
      Alert.alert(
        'Адрес не выбран',
        'Пожалуйста, выберите адрес перед продолжением.'
      );
      return;
    }
    
    navigation.navigate('OrderDetails', {
      serviceId,
      specialistId,
      address: selectedAddress.description,
      coordinates: {
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
      },
    });
  };

  // Если данные загружаются, показываем индикатор загрузки
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={appTheme.colors.primary} />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  // Стили для кнопок действий
  const actionsContainer = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: appTheme.spacing.m,
  };
  
  const actionButton = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: appTheme.spacing.s,
    flex: 1,
    backgroundColor: appTheme.colors.primary,
  };

   return (    <View 
      style={[
        styles.container, 
        Platform.OS === 'ios' ? { paddingTop: 60 } : {}
      ]} 
    >
      <View 
        style={[
          styles.headerContainer, 
          Platform.OS === 'ios' ? { marginTop: 20 } : {}
        ]}
      >
        <MaterialCommunityIcons name="map-marker" size={32} color={appTheme.colors.primary} />
        <Text style={styles.headerText}>Выберите адрес для заказа</Text>
      </View>
      
      {/* Блок для поиска и отображения адресов */}
      <View style={styles.contentContainer}>
        {/* Поисковая строка */}
        <View style={styles.searchContainer}>
          <RNTextInput
            style={styles.searchInput}
            placeholder="Введите адрес"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              searchAddress(text);
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <MaterialCommunityIcons name="close" size={20} color={appTheme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Результаты поиска */}
        {searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            {isSearching ? (
              <ActivityIndicator size="small" color={appTheme.colors.primary} />
            ) : (
              <ScrollView style={styles.searchResultsList}>
                {searchResults.map((result) => (
                  <TouchableOpacity
                    key={result.id}
                    style={styles.searchResultItem}
                    onPress={() => handleSelectSearchResult(result)}
                  >
                    <MaterialCommunityIcons name="map-marker" size={20} color={appTheme.colors.primary} />
                    <Text style={styles.searchResultText}>{result.description}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}
        
        {/* Сохраненные адреса */}
        {searchResults.length === 0 && (
          <View style={styles.savedAddressesContainer}>
            <Text style={styles.sectionTitle}>Сохраненные адреса</Text>
            {savedAddresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                style={styles.savedAddressItem}
                onPress={() => handleSelectSavedAddress(address)}
              >
                <MaterialCommunityIcons
                  name={address.isDefault ? 'home' : 'map-marker'}
                  size={24}
                  color={appTheme.colors.primary}
                />
                <View style={styles.savedAddressInfo}>
                  <Text style={styles.savedAddressTitle}>{address.title}</Text>
                  <Text style={styles.savedAddressText}>{address.address}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Кнопки действий */}
        <View style={styles.actionsContainer}>
          {/* Кнопка определения текущего местоположения */}
          <TouchableOpacity
            style={[styles.actionButton, {marginRight: appTheme.spacing.xs}]}
            onPress={getLocationQuick}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialCommunityIcons name="crosshairs-gps" size={20} color="white" />
                <Text style={styles.actionButtonText}>Мое местоположение</Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Кнопка ручного ввода адреса */}
          <TouchableOpacity
            style={[styles.actionButton, {marginLeft: appTheme.spacing.xs}]}
            onPress={() => setShowManualAddressModal(true)}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="white" />
            <Text style={styles.actionButtonText}>Ввести адрес вручную</Text>
          </TouchableOpacity>
        </View>
        
        {/* Информация о точности GPS убрана по просьбе пользователя */}
        
        {/* Выбранный адрес */}
        {selectedAddress && (
          <View style={styles.selectedAddressContainer}>
            <Text style={styles.sectionTitle}>Выбранный адрес</Text>
            <View style={styles.selectedAddressContent}>
              <MaterialCommunityIcons name="check-circle" size={24} color={appTheme.colors.primary} />
              <Text style={styles.selectedAddressText}>{selectedAddress.description}</Text>
            </View>
          </View>
        )}
        
        {/* Кнопка продолжения */}
        <Button
          mode="contained"
          onPress={handleContinue}
          style={styles.continueButton}
          disabled={!selectedAddress}
        >
          Продолжить
        </Button>
      </View>
      
      {/* Модальное окно для ручного ввода адреса */}
      <Portal>
        <Modal
          visible={showManualAddressModal}
          onDismiss={() => setShowManualAddressModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ввод адреса вручную</Text>
            <TouchableOpacity onPress={() => setShowManualAddressModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={appTheme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalInputContainer}>
            <Text style={styles.modalInputLabel}>Город</Text>
            <RNTextInput
              style={styles.modalInput}
              placeholder="Введите город"
              value={manualAddressCity}
              onChangeText={setManualAddressCity}
            />
          </View>
          
          <View style={styles.modalInputContainer}>
            <Text style={styles.modalInputLabel}>Улица</Text>
            <RNTextInput
              style={styles.modalInput}
              placeholder="Введите улицу"
              value={manualAddressStreet}
              onChangeText={setManualAddressStreet}
            />
          </View>
          
          <View style={styles.modalRowContainer}>
            <View style={[styles.modalInputContainer, {flex: 1, marginRight: appTheme.spacing.s}]}>
              <Text style={styles.modalInputLabel}>Дом</Text>
              <RNTextInput
                style={styles.modalInput}
                placeholder="Номер дома"
                value={manualAddressHouse}
                onChangeText={setManualAddressHouse}
              />
            </View>
            
            <View style={[styles.modalInputContainer, {flex: 1, marginLeft: appTheme.spacing.s}]}>
              <Text style={styles.modalInputLabel}>Квартира/офис</Text>
              <RNTextInput
                style={styles.modalInput}
                placeholder="Номер"
                value={manualAddressApartment}
                onChangeText={setManualAddressApartment}
              />
            </View>
          </View>
          
          <Button
            mode="contained"
            onPress={handleManualAddressConfirm}
            style={styles.modalConfirmButton}
          >
            Подтвердить адрес
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
    paddingTop: Platform.OS === 'ios' ? 60 : 0, // Добавляем больший отступ сверху для iOS
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: appTheme.spacing.m,
    backgroundColor: appTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
    marginTop: Platform.OS === 'ios' ? 20 : 0, // Увеличиваем отступ для заголовка на iOS
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: appTheme.spacing.s,
  },
  contentContainer: {
    flex: 1,
    padding: appTheme.spacing.m,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appTheme.colors.surface,
    borderRadius: 8,
    paddingHorizontal: appTheme.spacing.m,
    marginBottom: appTheme.spacing.m,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  clearButton: {
    padding: appTheme.spacing.xs,
  },
  searchResultsContainer: {
    backgroundColor: appTheme.colors.background,
    borderRadius: 8,
    marginBottom: appTheme.spacing.m,
    maxHeight: 200,
  },
  searchResultsList: {
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: appTheme.spacing.s,
    paddingHorizontal: appTheme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
  },
  searchResultText: {
    marginLeft: appTheme.spacing.s,
    flex: 1,
  },
  savedAddressesContainer: {
    marginBottom: appTheme.spacing.m,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: appTheme.spacing.s,
  },
  savedAddressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: appTheme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
  },
  savedAddressInfo: {
    marginLeft: appTheme.spacing.m,
    flex: 1,
  },
  savedAddressTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  savedAddressText: {
    color: appTheme.colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: appTheme.spacing.m,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: appTheme.spacing.s,
    flex: 1,
    backgroundColor: appTheme.colors.primary,
  },
  actionButtonText: {
    color: 'white',
    marginLeft: appTheme.spacing.s,
    fontWeight: 'bold',
    fontSize: 12,
  },
  selectedAddressContainer: {
    marginBottom: appTheme.spacing.m,
    backgroundColor: appTheme.colors.surface,
    borderRadius: 8,
    padding: appTheme.spacing.m,
  },
  selectedAddressContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedAddressText: {
    marginLeft: appTheme.spacing.s,
    flex: 1,
  },
  continueButton: {
    marginTop: appTheme.spacing.m,
    paddingVertical: appTheme.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: appTheme.spacing.m,
    color: appTheme.colors.textSecondary,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: appTheme.spacing.m,
    margin: appTheme.spacing.m,
    borderRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: appTheme.spacing.m,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalInputContainer: {
    marginBottom: appTheme.spacing.m,
  },
  modalInputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: appTheme.spacing.xs,
    color: appTheme.colors.textSecondary,
  },
  modalInput: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 8,
    paddingHorizontal: appTheme.spacing.m,
    paddingVertical: appTheme.spacing.s,
    fontSize: 16,
  },
  modalRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: appTheme.spacing.m,
  },
  modalConfirmButton: {
    marginTop: appTheme.spacing.s,
  },
});

export default OrderAddressScreen; 