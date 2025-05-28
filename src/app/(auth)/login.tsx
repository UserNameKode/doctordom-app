import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import FormInput from '../../components/forms/FormInput';
import FormButton from '../../components/forms/FormButton';
import Logo from '../../components/ui/Logo';
import appTheme from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validatePassword } from '../../utils/validation';
import { AuthStackParamList } from './_layout';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

/**
 * Экран входа в приложение
 */
const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, isLoading } = useAuth();
  
  // Состояния для полей формы
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Состояния для ошибок валидации
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Обработчик нажатия на кнопку входа
  const handleLogin = async () => {
    // Сбрасываем ошибки
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    setInfoMessage('');
    
    // Валидация полей
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    // Проверяем результаты валидации
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.message);
    }
    
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message);
    }
    
    // Если есть ошибки валидации, прерываем выполнение
    if (!emailValidation.isValid || !passwordValidation.isValid) {
      return;
    }
    
    // Вызываем функцию входа из контекста аутентификации
    try {
      await login(email, password);
      // Вход успешен, навигация произойдет автоматически через компонент RootNavigator
    } catch (error: any) {
      // Проверяем, если это информационное сообщение
      if (error.message && (
        error.message.includes('Подтвердите регистрацию') ||
        error.message.includes('подтверждения')
      )) {
        setInfoMessage(error.message);
      } else {
        // Отображаем как ошибку для остальных случаев
        setGeneralError(error.message || 'Ошибка при входе. Проверьте данные и попробуйте снова.');
      }
    }
  };
  
  // Переход к экрану регистрации
  const handleRegister = () => {
    navigation.navigate('Register');
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
          <View style={styles.logoContainer}>
            <Logo size="medium" />
          </View>
          
          <Text style={styles.title}>Вход в аккаунт</Text>
          <Text style={styles.subtitle}>Введите ваши данные для входа</Text>
          
          {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}
          {infoMessage ? (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>{infoMessage}</Text>
            </View>
          ) : null}
          
          <View style={styles.formContainer}>
            <FormInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Введите ваш email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />
            
            <FormInput
              label="Пароль"
              value={password}
              onChangeText={setPassword}
              placeholder="Введите ваш пароль"
              secureTextEntry
              error={passwordError}
            />
            
            <FormButton
              title="Войти"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />
            
            <Divider style={styles.divider} />
            
            <View style={styles.registerContainer}>
              <Text>Еще нет аккаунта? </Text>
              <FormButton
                title="Зарегистрироваться"
                onPress={handleRegister}
                mode="text"
                textColor={appTheme.colors.primary}
              />
            </View>
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
  logoContainer: {
    alignItems: 'center',
    marginTop: appTheme.spacing.xl,
    marginBottom: appTheme.spacing.l,
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
  loginButton: {
    marginTop: appTheme.spacing.m,
  },
  divider: {
    marginVertical: appTheme.spacing.l,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: appTheme.colors.error,
    textAlign: 'center',
    marginBottom: appTheme.spacing.m,
  },
  infoContainer: {
    backgroundColor: appTheme.colors.primary + '15',
    padding: appTheme.spacing.m,
    borderRadius: appTheme.borderRadius.medium,
    marginBottom: appTheme.spacing.m,
  },
  infoText: {
    color: appTheme.colors.text,
    textAlign: 'center',
  },
});

export default LoginScreen; 