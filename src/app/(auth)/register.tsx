import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Divider, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import FormInput from '../../components/forms/FormInput';
import FormButton from '../../components/forms/FormButton';
import Logo from '../../components/ui/Logo';
import appTheme from '../../constants/theme';
import { validateEmail, validatePassword, validateConfirmPassword } from '../../utils/validation';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Name: {
    email: string;
    password: string;
  };
};

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

/**
 * Экран регистрации нового пользователя - ввод email и пароля
 */
const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  
  // Состояния для полей формы
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Состояния для ошибок валидации
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Обработчик нажатия на кнопку продолжения
  const handleContinue = async () => {
    // Сбрасываем ошибки
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    
    // Валидация полей с использованием функций валидации
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);
    
    // Устанавливаем ошибки, если они есть
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.message);
    }
    
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message);
    }
    
    if (!confirmPasswordValidation.isValid) {
      setConfirmPasswordError(confirmPasswordValidation.message);
    }
    
    // Если есть ошибки валидации, прерываем выполнение
    if (!emailValidation.isValid || !passwordValidation.isValid || !confirmPasswordValidation.isValid) {
      return;
    }
    
    // Переходим к экрану ввода имени
    navigation.navigate('Name', { email, password });
  };

  // Обработчик нажатия на кнопку перехода к входу
  const handleGoToLogin = () => {
    navigation.navigate('Login');
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
          
          <Text style={styles.title}>Регистрация</Text>
          <Text style={styles.subtitle}>Создайте аккаунт для использования приложения</Text>
          
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
              placeholder="Введите пароль"
              secureTextEntry
              error={passwordError}
            />
            
            <FormInput
              label="Подтверждение пароля"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Повторите пароль"
              secureTextEntry
              error={confirmPasswordError}
            />
            
            <FormButton
              title="Продолжить"
              onPress={handleContinue}
              style={styles.continueButton}
            />
            
            <Divider style={styles.divider} />
            
            <View style={styles.loginContainer}>
              <Text>Уже есть аккаунт? </Text>
              <FormButton
                title="Войти"
                onPress={handleGoToLogin}
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
  continueButton: {
    marginTop: appTheme.spacing.m,
  },
  divider: {
    marginVertical: appTheme.spacing.l,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RegisterScreen; 