import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import FormInput from '../../components/forms/FormInput';
import FormButton from '../../components/forms/FormButton';
import Logo from '../../components/ui/Logo';
import appTheme from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { validateName } from '../../utils/validation';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Name: {
    email: string;
    password: string;
  };
};

type NameScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Name'>;

/**
 * Экран ввода имени пользователя при регистрации
 */
const NameScreen = () => {
  const navigation = useNavigation<NameScreenNavigationProp>();
  const route = useRoute();
  const { register, isLoading } = useAuth();
  
  // Получаем параметры из предыдущего экрана
  const { email, password } = route.params as { email: string; password: string };
  
  // Состояния для полей формы
  const [name, setName] = useState('');
  
  // Состояния для ошибок валидации
  const [nameError, setNameError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // Обработчик завершения регистрации
  const handleCompleteRegistration = async () => {
    // Сбрасываем ошибки
    setNameError('');
    setGeneralError('');
    
    // Валидация имени
    const nameValidation = validateName(name);
    
    // Устанавливаем ошибку, если она есть
    if (!nameValidation.isValid) {
      setNameError(nameValidation.message);
      return;
    }
    
    // Вызываем функцию регистрации из контекста аутентификации
    try {
      const result = await register(name, email, password);
      
      // Проверяем результат регистрации
      if (result && !result.success && result.userExists) {
        // Возвращаемся к экрану логина, если пользователь уже существует
        navigation.navigate('Login');
        return;
      }
      
      // Регистрация успешна, навигация произойдет автоматически через компонент RootNavigator
    } catch (error: any) {
      // Отображаем как ошибку для остальных случаев
      setGeneralError(error.message || 'Ошибка при регистрации. Пожалуйста, попробуйте позже.');
    }
  };

  // Обработчик нажатия на кнопку возврата
  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={handleGoBack}
              style={styles.backButton}
            />
            <Logo size="small" />
          </View>
          
          <Text style={styles.title}>Как к вам обращаться?</Text>
          <Text style={styles.subtitle}>Введите ваше имя, чтобы мы могли к вам обращаться</Text>
          
          {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}
          
          <View style={styles.formContainer}>
            <FormInput
              label="Ваше имя"
              value={name}
              onChangeText={setName}
              placeholder="Введите ваше имя"
              error={nameError}
            />
            
            <FormButton
              title="Завершить регистрацию"
              onPress={handleCompleteRegistration}
              loading={isLoading}
              style={styles.completeButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: appTheme.spacing.l,
    paddingBottom: appTheme.spacing.l,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: appTheme.spacing.m,
    marginBottom: appTheme.spacing.l,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: -appTheme.spacing.s,
  },
  title: {
    fontSize: appTheme.fontSizes.large,
    fontWeight: 'bold',
    textAlign: 'center',
    color: appTheme.colors.text,
    marginBottom: appTheme.spacing.xs,
  },
  subtitle: {
    fontSize: appTheme.fontSizes.medium,
    textAlign: 'center',
    color: appTheme.colors.textSecondary,
    marginBottom: appTheme.spacing.l,
  },
  formContainer: {
    width: '100%',
  },
  completeButton: {
    marginTop: appTheme.spacing.m,
  },
  errorText: {
    color: appTheme.colors.error,
    textAlign: 'center',
    marginBottom: appTheme.spacing.m,
  },
});

export default NameScreen; 