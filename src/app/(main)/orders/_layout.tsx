import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native-paper';
import OrdersScreen from './index';
import OrderDetailsScreen from './details';

// Типы для параметров навигации
export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetails: { orderId: string };
};

const Stack = createStackNavigator<OrdersStackParamList>();

/**
 * Компонент навигации для раздела заказов
 */
const OrdersLayout = () => {
  return (
    <Stack.Navigator
      initialRouteName="OrdersList"
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="OrdersList"
        component={OrdersScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{ 
          headerTitle: () => <Text>Детали заказа</Text>
        }}
      />
    </Stack.Navigator>
  );
};

export default OrdersLayout; 