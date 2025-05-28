import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import appTheme from '../../constants/theme';
import { SmsAuthService } from '../../services/SmsAuthService';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from './_layout';

type PhoneLoginNavigationProp = StackNavigationProp<AuthStackParamList>;

const PhoneLoginScreen = () => {
  const navigation = useNavigation<PhoneLoginNavigationProp>();

  // Состояния
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<{ phone?: string; code?: string }>({});

  // Refs
  const phoneInputRef = useRef<any>(null);
  const codeInputRef = useRef<any>(null);

  // Таймер для повторной отправки SMS
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Валидация номера телефона
  const validatePhone = (phoneNumber: string): string | null => {
    if (!phoneNumber.trim()) {
      return 'Введите номер телефона';
    }
    
    if (!SmsAuthService.validatePhoneNumber(phoneNumber)) {
      return 'Неверный формат номера телефона';
    }
    
    return null;
  };

  // Валидация SMS-кода
  const validateCode = (smsCode: string): string | null => {
    if (!smsCode.trim()) {
      return 'Введите код подтверждения';
    }
    
    if (smsCode.length !== 6) {
      return 'Код должен содержать 6 цифр';
    }
    
    if (!/^\d+$/.test(smsCode)) {
      return 'Код должен содержать только цифры';
    }
    
    return null;
  };

  // Отправка SMS-кода
  const handleSendSms = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      // Валидация номера
      const phoneError = validatePhone(phone);
      if (phoneError) {
        setErrors({ phone: phoneError });
        return;
      }

      // Отправляем SMS
      const result = await SmsAuthService.sendSmsCode(phone);
      
      if (result.success) {
        setStep('code');
        setCountdown(60); // 60 секунд до повторной отправки
        Alert.alert(
          'SMS отправлен',
          `Код подтверждения отправлен на номер ${SmsAuthService.formatPhoneForDisplay(phone)}`
        );
        
        // Фокусируемся на поле ввода кода
        setTimeout(() => {
          codeInputRef.current?.focus();
        }, 100);
      } else {
        Alert.alert('Ошибка', result.message);
      }
    } catch (error) {
      console.error('Ошибка отправки SMS:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при отправке SMS');
    } finally {
      setIsLoading(false);
    }
  };

  // Подтверждение SMS-кода
  const handleVerifyCode = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      // Валидация кода
      const codeError = validateCode(code);
      if (codeError) {
        setErrors({ code: codeError });
        return;
      }

      // Подтверждаем код
      const result = await SmsAuthService.verifySmsCode(phone, code);
      
      if (result.success) {
        Alert.alert('Успех', 'Вход выполнен успешно!');
        // AuthContext автоматически обновится через onAuthStateChange
      } else {
        Alert.alert('Ошибка', result.message);
        // Очищаем поле кода при ошибке
        setCode('');
        codeInputRef.current?.focus();
      }
    } catch (error) {
      console.error('Ошибка подтверждения кода:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при подтверждении кода');
    } finally {
      setIsLoading(false);
    }
  };

  // Возврат к вводу номера
  const handleBackToPhone = () => {
    setStep('phone');
    setCode('');
    setErrors({});
    setTimeout(() => {
      phoneInputRef.current?.focus();
    }, 100);
  };

  // Форматирование номера при вводе
  const handlePhoneChange = (text: string) => {
    // Убираем все символы кроме цифр
    const cleaned = text.replace(/\D/g, '');
    
    // Ограничиваем длину
    if (cleaned.length <= 11) {
      setPhone(cleaned);
      
      // Очищаем ошибку при вводе
      if (errors.phone) {
        setErrors({ ...errors, phone: undefined });
      }
    }
  };

  // Форматирование кода при вводе
  const handleCodeChange = (text: string) => {
    // Убираем все символы кроме цифр
    const cleaned = text.replace(/\D/g, '');
    
    // Ограничиваем длину
    if (cleaned.length <= 6) {
      setCode(cleaned);
      
      // Очищаем ошибку при вводе
      if (errors.code) {
        setErrors({ ...errors, code: undefined });
      }
      
      // Автоматически отправляем код при вводе 6 цифр
      if (cleaned.length === 6) {
        setTimeout(() => {
          handleVerifyCode();
        }, 500);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="cellphone-message"
              size={64}
              color={appTheme.colors.primary}
            />
            <Text style={styles.title}>
              {step === 'phone' ? 'Вход по номеру телефона' : 'Подтверждение номера'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'phone'
                ? 'Введите номер телефона для получения SMS с кодом'
                : `Введите код, отправленный на номер ${SmsAuthService.formatPhoneForDisplay(phone)}`
              }
            </Text>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              {step === 'phone' ? (
                // Шаг 1: Ввод номера телефона
                <>
                  <TextInput
                    ref={phoneInputRef}
                    label="Номер телефона"
                    value={phone}
                    onChangeText={handlePhoneChange}
                    placeholder="8 (999) 123-45-67"
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    textContentType="telephoneNumber"
                    error={!!errors.phone}
                    disabled={isLoading}
                    left={<TextInput.Icon icon="phone" />}
                    style={styles.input}
                  />
                  {errors.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  )}
                  
                  <Text style={styles.phoneFormat}>
                    Формат: +7 (999) 123-45-67 или 8 (999) 123-45-67
                  </Text>

                  <Button
                    mode="contained"
                    onPress={handleSendSms}
                    loading={isLoading}
                    disabled={isLoading || !phone.trim()}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                  >
                    {isLoading ? 'Отправка SMS...' : 'Получить код'}
                  </Button>
                </>
              ) : (
                // Шаг 2: Ввод SMS-кода
                <>
                  <TextInput
                    ref={codeInputRef}
                    label="Код подтверждения"
                    value={code}
                    onChangeText={handleCodeChange}
                    placeholder="123456"
                    keyboardType="number-pad"
                    autoComplete="sms-otp"
                    textContentType="oneTimeCode"
                    error={!!errors.code}
                    disabled={isLoading}
                    left={<TextInput.Icon icon="message-text" />}
                    style={styles.input}
                    maxLength={6}
                  />
                  {errors.code && (
                    <Text style={styles.errorText}>{errors.code}</Text>
                  )}

                  <Text style={styles.codeInfo}>
                    Код действителен в течение 5 минут
                  </Text>

                  <Button
                    mode="contained"
                    onPress={handleVerifyCode}
                    loading={isLoading}
                    disabled={isLoading || code.length !== 6}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                  >
                    {isLoading ? 'Проверка кода...' : 'Подтвердить'}
                  </Button>

                  <Divider style={styles.divider} />

                  {/* Кнопка повторной отправки */}
                  <Button
                    mode="outlined"
                    onPress={handleSendSms}
                    disabled={countdown > 0 || isLoading}
                    style={styles.resendButton}
                  >
                    {countdown > 0
                      ? `Повторить через ${countdown} сек`
                      : 'Отправить код повторно'
                    }
                  </Button>

                  {/* Кнопка изменения номера */}
                  <Button
                    mode="text"
                    onPress={handleBackToPhone}
                    disabled={isLoading}
                    style={styles.changePhoneButton}
                  >
                    Изменить номер телефона
                  </Button>
                </>
              )}
            </Card.Content>
          </Card>

          {/* Переход к обычному входу */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Есть аккаунт с паролем?</Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              disabled={isLoading}
            >
              Войти с паролем
            </Button>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: appTheme.spacing.m,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: appTheme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: appTheme.colors.secondary,
    textAlign: 'center',
    marginTop: appTheme.spacing.m,
    marginBottom: appTheme.spacing.s,
  },
  subtitle: {
    fontSize: 16,
    color: appTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    borderRadius: appTheme.borderRadius.large,
    ...appTheme.shadows.medium,
  },
  input: {
    marginBottom: appTheme.spacing.s,
  },
  errorText: {
    color: appTheme.colors.error,
    fontSize: 12,
    marginTop: -appTheme.spacing.s,
    marginBottom: appTheme.spacing.s,
    marginLeft: appTheme.spacing.s,
  },
  phoneFormat: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    marginBottom: appTheme.spacing.m,
    textAlign: 'center',
  },
  codeInfo: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    marginBottom: appTheme.spacing.m,
    textAlign: 'center',
  },
  button: {
    marginTop: appTheme.spacing.m,
    borderRadius: appTheme.borderRadius.medium,
  },
  buttonContent: {
    paddingVertical: appTheme.spacing.s,
  },
  divider: {
    marginVertical: appTheme.spacing.m,
  },
  resendButton: {
    marginBottom: appTheme.spacing.s,
  },
  changePhoneButton: {
    marginTop: appTheme.spacing.s,
  },
  footer: {
    alignItems: 'center',
    marginTop: appTheme.spacing.xl,
  },
  footerText: {
    color: appTheme.colors.textSecondary,
    marginBottom: appTheme.spacing.s,
  },
});

export default PhoneLoginScreen; 