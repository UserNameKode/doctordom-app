import React, { useState, useEffect } from 'react';
import { StatusBar, Platform, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, LogBox } from 'react-native';
import BetterIcon from './src/components/BetterIcon';

import 'react-native-gesture-handler';
import SplashScreen from './src/components/layout/SplashScreen';
import appTheme from './src/constants/theme';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { FontProvider, useFontContext } from './src/context/FontContext';
import ProfileScreen from './src/app/(main)/profile';
import OrdersLayout from './src/app/(main)/orders/_layout';
import ServicesLayout from './src/app/(main)/services/_layout';
import ErrorBoundary from './src/components/ui/ErrorBoundary';
import SafeStateHandler from './src/components/ui/SafeStateHandler';
import AnimatedState from './src/components/ui/AnimatedState';
import BackgroundDecorator from './src/components/ui/BackgroundDecorator';
import AuthLayout from './src/app/(auth)/_layout';

// Игнорируем известные warning'и
LogBox.ignoreLogs([
  'Text strings must be rendered within a <Text> component',
  'Warning: Text strings must be rendered within a <Text> component',
]);

// Создаем навигаторы
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Корневой компонент приложения
const App = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [resetKey, setResetKey] = useState(0);

  // Имитация загрузки приложения
  useEffect(() => {
    const prepareApp = async () => {
      try {
        // Здесь может быть инициализация данных, проверка авторизации и т.д.
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsAppReady(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Произошла ошибка при загрузке приложения'));
      }
    };

    prepareApp();
  }, [resetKey]);

  // Обработчик ошибок в приложении
  const handleAppError = (error: Error) => {
    console.error('App Error:', error);
    // В реальном приложении здесь можно отправлять ошибки в сервис аналитики
  };

  // Обработчик перезапуска приложения
  const handleRetry = () => {
    setError(null);
    setIsAppReady(false);
    setResetKey(prev => prev + 1);
  };

  if (!isAppReady) {
    return (
      <SafeStateHandler isLoading={true} error={error} onRetry={handleRetry} loadingMessage="Загрузка приложения...">
        <SplashScreen />
      </SafeStateHandler>
    );
  }

      return (
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
      <ErrorBoundary
        onError={handleAppError}
        resetKey={resetKey}
      >
        <SafeAreaProvider>
          <FontProvider>
            <PaperProvider theme={appTheme.theme}>
              <AuthProvider>
                <NavigationContainer>
                  <AppContent />
                </NavigationContainer>
              </AuthProvider>
            </PaperProvider>
          </FontProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </View>
  );
};

// Оборачиваем приложение в проверку загрузки шрифтов
const AppContent = () => {
  const { fontsLoaded, fontsError } = useFontContext();

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка шрифтов...</Text>
      </View>
    );
  }

  if (fontsError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Ошибка загрузки шрифтов: {fontsError.message}
        </Text>
      </View>
    );
  }

  return <RootNavigator />;
};

// Корневой навигатор приложения с проверкой аутентификации
const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <BackgroundDecorator variant="center" intensity={30} />
        <AnimatedState 
          type="loading" 
          message="Проверка авторизации" 
          size={120} 
        />
      </View>
    );
  }

  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen 
          name="Main" 
          component={MainApp}
        />
      ) : (
        <Stack.Screen 
          name="Auth" 
          component={AuthLayout}
        />
      )}
    </Stack.Navigator>
  );
};

// Основное приложение с нижней навигацией
const MainApp = () => {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        id={undefined}
        screenOptions={{
          tabBarActiveTintColor: appTheme.colors.primary,
          tabBarInactiveTintColor: appTheme.colors.textSecondary,
          tabBarStyle: {
            paddingTop: 5,
            paddingBottom: Platform.OS === 'ios' ? 25 : 5,
            height: Platform.OS === 'ios' ? 80 : 60,
            ...appTheme.shadows.small,
          },
        }}
      >
        <Tab.Screen
          name="Services"
          component={ServicesLayout}
          options={{
            tabBarLabel: ({ color }) => <Text style={{ color }}>Услуги</Text>,
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <BetterIcon name="services" type="navigation" size={26} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Orders"
          component={OrdersLayout}
          options={{
            tabBarLabel: ({ color }) => <Text style={{ color }}>Заказы</Text>,
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <BetterIcon name="orders" type="navigation" size={26} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: ({ color }) => <Text style={{ color }}>Профиль</Text>,
            headerShown: false,
            headerTitle: () => <Text>Мой профиль</Text>,
            headerTitleAlign: 'center',
            tabBarIcon: ({ color }) => (
              <BetterIcon name="profile" type="navigation" size={26} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appTheme.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: appTheme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appTheme.colors.background,
    padding: 20,
  },
  errorText: {
    color: appTheme.colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default App;
