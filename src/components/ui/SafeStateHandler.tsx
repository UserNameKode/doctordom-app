import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import appTheme from '../../constants/theme';
import AnimatedState from './AnimatedState';
import { checkNetworkConnection } from '../../lib/supabaseConnection';

interface SafeStateHandlerProps {
  isLoading?: boolean;
  error?: Error | string | null;
  onRetry?: () => void;
  loadingMessage?: string;
  children: React.ReactNode;
  showNetworkCheck?: boolean;
}

/**
 * Безопасный обработчик состояний с проверкой сети и retry логикой
 */
const SafeStateHandler: React.FC<SafeStateHandlerProps> = ({
  isLoading = false,
  error = null,
  onRetry,
  loadingMessage = 'Загрузка...',
  children,
  showNetworkCheck = true,
}) => {
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<boolean | null>(null);

  const handleRetryWithNetworkCheck = async () => {
    if (showNetworkCheck) {
      setIsCheckingNetwork(true);
      setNetworkStatus(null);
      
      try {
        const hasNetwork = await checkNetworkConnection();
        setNetworkStatus(hasNetwork);
        
        if (hasNetwork && onRetry) {
          onRetry();
        }
      } catch (error) {
        console.error('Ошибка проверки сети:', error);
        setNetworkStatus(false);
      } finally {
        setIsCheckingNetwork(false);
      }
    } else if (onRetry) {
      onRetry();
    }
  };

  // Показываем загрузку
  if (isLoading) {
    return (
      <View style={styles.container}>
        <AnimatedState 
          type="loading" 
          message={loadingMessage}
          size={80}
        />
      </View>
    );
  }

  // Показываем ошибку
  if (error) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={80}
          color={appTheme.colors.error}
          style={styles.icon}
        />
        
        <Text variant="headlineSmall" style={styles.title}>
          Что-то пошло не так
        </Text>
        
        <Text variant="bodyMedium" style={styles.message}>
          {errorMessage}
        </Text>
        
        {/* Статус сети */}
        {networkStatus !== null && (
          <View style={styles.networkStatus}>
            <MaterialCommunityIcons
              name={networkStatus ? "wifi" : "wifi-off"}
              size={24}
              color={networkStatus ? appTheme.colors.success : appTheme.colors.error}
            />
            <Text style={[
              styles.networkText,
              { color: networkStatus ? appTheme.colors.success : appTheme.colors.error }
            ]}>
              {networkStatus ? 'Интернет подключен' : 'Нет подключения к интернету'}
            </Text>
          </View>
        )}
        
        {/* Кнопки действий */}
        <View style={styles.buttonContainer}>
          {onRetry && (
            <Button
              mode="contained"
              onPress={handleRetryWithNetworkCheck}
              loading={isCheckingNetwork}
              disabled={isCheckingNetwork}
              style={styles.retryButton}
            >
              {isCheckingNetwork ? 'Проверка сети...' : 'Попробовать снова'}
            </Button>
          )}
          
          {showNetworkCheck && !isCheckingNetwork && (
            <Button
              mode="outlined"
              onPress={async () => {
                setIsCheckingNetwork(true);
                const hasNetwork = await checkNetworkConnection();
                setNetworkStatus(hasNetwork);
                setIsCheckingNetwork(false);
              }}
              style={styles.checkButton}
            >
              Проверить сеть
            </Button>
          )}
        </View>
      </View>
    );
  }

  // Показываем контент
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: appTheme.spacing.l,
    backgroundColor: appTheme.colors.background,
  },
  icon: {
    marginBottom: appTheme.spacing.m,
  },
  title: {
    marginBottom: appTheme.spacing.s,
    textAlign: 'center',
    color: appTheme.colors.text,
  },
  message: {
    marginBottom: appTheme.spacing.l,
    textAlign: 'center',
    color: appTheme.colors.textSecondary,
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: appTheme.spacing.l,
    padding: appTheme.spacing.s,
    backgroundColor: appTheme.colors.surface,
    borderRadius: 8,
  },
  networkText: {
    marginLeft: appTheme.spacing.s,
    fontSize: appTheme.fontSizes.small,
  },
  buttonContainer: {
    width: '100%',
    gap: appTheme.spacing.s,
  },
  retryButton: {
    marginBottom: appTheme.spacing.s,
  },
  checkButton: {
    borderColor: appTheme.colors.primary,
  },
});

export default SafeStateHandler; 