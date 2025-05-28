import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ServiceCategoriesScreen from './index';
import ServiceListScreen from './list';
import ServiceDetailScreen from './detail';
import OrderAddressScreen from '../order/address';
import OrderDetailsScreen from '../order/details';
import OrderConfirmationScreen from '../order/confirmation';
import { COLORS } from '../../../constants/colors';

// Типы для параметров навигации
export type ServiceStackParamList = {
  Index: undefined;
  List: { categoryId: string; categoryName: string; subCategoryId?: string };
  Detail: { serviceId: string };
  OrderAddress: { serviceId: string; specialistId?: string };
  OrderDetails: { 
    serviceId: string; 
    specialistId?: string; 
    address: string; 
    coordinates: { 
      latitude: number; 
      longitude: number; 
    } 
  };
  OrderConfirmation: { 
    orderData: {
      serviceId: string;
      specialistId?: string;
      address: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
      date: Date;
      time: string;
      description: string;
      service: {
        id: string;
        name: string;
        price: number;
        duration: string;
      };
      specialist: {
        id: string;
        name: string;
        rating: number;
        reviews: number;
        avatar: string;
      };
    }
  };
};

const Stack = createStackNavigator<ServiceStackParamList>();

/**
 * Компонент навигации для раздела услуг
 */
const ServicesLayout = () => {
  // Устанавливаем статус бар в начале
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      // Для Android можно использовать дополнительные настройки если нужно
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        initialRouteName="Index"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS?.grayBg || '#F5F5FA' }
        }}
      >
        <Stack.Screen
          name="Index"
          component={ServiceCategoriesScreen}
          options={{ 
            headerShown: false 
          }}
        />
        <Stack.Screen
          name="List"
          component={ServiceListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Detail"
          component={ServiceDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderAddress"
          component={OrderAddressScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderDetails"
          component={OrderDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderConfirmation"
          component={OrderConfirmationScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </View>
  );
};

export default ServicesLayout; 