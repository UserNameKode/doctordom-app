import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './login';
import Register from './register';
import Name from './name';
// import PhoneLogin from './phone-login'; // Временно отключен

// Типы для параметров навигации
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Name: {
    email: string;
    password: string;
  };
  // PhoneLogin: undefined; // Временно отключен
};

const Stack = createStackNavigator<AuthStackParamList>();

/**
 * Компонент навигации для экранов авторизации
 */
const AuthLayout = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen
        name="Login"
        component={Login}
      />
      <Stack.Screen
        name="Register"
        component={Register}
      />
      <Stack.Screen
        name="Name"
        component={Name}
      />
      {/* Временно отключен SMS-вход
      <Stack.Screen
        name="PhoneLogin"
        component={PhoneLogin}
      />
      */}
    </Stack.Navigator>
  );
};

export default AuthLayout; 