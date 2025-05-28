import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import appTheme from '../../constants/theme';
import ScreenTransition from './ScreenTransition';

interface StateHandlerProps {
  isLoading: boolean;
  error: Error | null;
  isEmpty?: boolean;
  children: ReactNode;
  onRetry?: () => void;
  emptyMessage?: string;
  emptyIcon?: string;
  loadingMessage?: string;
}

/**
 * Компонент для обработки различных состояний данных:
 * - Загрузка
 * - Ошибка
 * - Пустые данные
 * - Нормальное состояние (данные загружены)
 */
const StateHandler: React.FC<StateHandlerProps> = ({
  isLoading,
  error,
  isEmpty = false,
  children,
  onRetry,
  emptyMessage = 'Нет данных для отображения',
  emptyIcon = 'inbox-outline',
  loadingMessage = 'Загрузка...',
}) => {
  // Отображение индикатора загрузки
  if (isLoading) {
    return (
      <ScreenTransition type="fade">
        <View style={styles.container}>
          <ActivityIndicator size="large" color={appTheme.colors.primary} />
          <Text variant="bodyLarge" style={styles.message}>
            {loadingMessage}
          </Text>
        </View>
      </ScreenTransition>
    );
  }

  // Отображение ошибки
  if (error) {
    return (
      <ScreenTransition type="fade">
        <View style={styles.container}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={60}
            color={appTheme.colors.error}
            style={styles.icon}
          />
          <Text variant="titleMedium" style={styles.title}>
            Произошла ошибка
          </Text>
          <Text variant="bodyMedium" style={styles.message}>
            {error.message || 'Не удалось загрузить данные'}
          </Text>
          {onRetry && (
            <Button mode="contained" onPress={onRetry} style={styles.button}>
              Повторить
            </Button>
          )}
        </View>
      </ScreenTransition>
    );
  }

  // Отображение пустого состояния
  if (isEmpty) {
    return (
      <ScreenTransition type="fade">
        <View style={styles.container}>
          <MaterialCommunityIcons
            name={emptyIcon}
            size={60}
            color={appTheme.colors.primary}
            style={styles.icon}
          />
          <Text variant="titleMedium" style={styles.title}>
            Пусто
          </Text>
          <Text variant="bodyMedium" style={styles.message}>
            {emptyMessage}
          </Text>
          {onRetry && (
            <Button mode="outlined" onPress={onRetry} style={styles.button}>
              Обновить
            </Button>
          )}
        </View>
      </ScreenTransition>
    );
  }

  // Отображение данных
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    marginBottom: 16,
    textAlign: 'center',
    color: appTheme.colors.textSecondary,
  },
  button: {
    marginTop: 16,
  },
});

export default StateHandler; 