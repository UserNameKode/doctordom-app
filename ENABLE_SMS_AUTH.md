# 🔓 Включение SMS-аутентификации

## 📋 **Быстрое включение**

SMS-аутентификация уже реализована, но временно отключена. Для включения выполните следующие шаги:

### **1. Включить экран в навигации**

В файле `src/app/(auth)/_layout.tsx`:

```typescript
// Раскомментируйте импорт
import PhoneLogin from './phone-login';

// Раскомментируйте в типах
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Name: {
    email: string;
    password: string;
  };
  PhoneLogin: undefined; // ← Раскомментировать
};

// Раскомментируйте экран в навигации
<Stack.Screen
  name="PhoneLogin"
  component={PhoneLogin}
/>
```

### **2. Добавить кнопку на экран входа**

В файле `src/app/(auth)/login.tsx`:

```typescript
// После кнопки "Войти" добавьте:
<FormButton
  title="Войти по SMS"
  onPress={() => navigation.navigate('PhoneLogin')}
  mode="outlined"
  style={styles.smsButton}
  icon="cellphone-message"
/>

// И добавьте стиль:
smsButton: {
  marginTop: appTheme.spacing.s,
},
```

### **3. Настроить SMS-провайдера в Supabase**

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Перейдите в **Authentication** → **Settings**
3. Включите **Phone Auth**
4. Настройте Twilio или другого провайдера
5. Протестируйте отправку SMS

### **4. Протестировать**

1. Запустите приложение
2. Нажмите "Войти по SMS"
3. Введите свой номер телефона
4. Проверьте получение SMS
5. Введите код подтверждения

## ✅ **Готово!**

После выполнения этих шагов пользователи смогут входить по SMS.

## 📚 **Подробная документация**

Полная инструкция по настройке находится в файле `SMS_SETUP.md`. 