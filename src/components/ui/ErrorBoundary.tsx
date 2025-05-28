import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import appTheme from '../../constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKey?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Компонент для обработки ошибок в приложении
 * Перехватывает ошибки в дочерних компонентах и отображает запасной UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // В реальном приложении здесь можно логировать ошибки в сервис аналитики
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: Props): void {
    // Если resetKey изменился, сбрасываем состояние ошибки
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({
        hasError: false,
        error: null,
      });
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

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
            В приложении произошла ошибка. Пожалуйста, попробуйте снова.
          </Text>
          
          <ScrollView style={styles.errorContainer}>
            <Text variant="bodySmall" style={styles.errorText}>
              {this.state.error?.toString()}
            </Text>
          </ScrollView>
          
          <Button
            mode="contained"
            onPress={this.handleReset}
            style={styles.button}
          >
            Попробовать снова
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: appTheme.colors.background,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    maxHeight: 150,
    width: '100%',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  errorText: {
    color: appTheme.colors.error,
  },
  button: {
    marginTop: 20,
  },
});

export default ErrorBoundary; 