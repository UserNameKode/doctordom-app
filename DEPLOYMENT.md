# 🚀 Инструкции по деплою DoctorDom

## 📋 Подготовка к деплою

### 1. Проверка готовности
- ✅ Все тесты проходят
- ✅ Нет TypeScript ошибок
- ✅ Линтинг пройден
- ✅ Push-уведомления настроены
- ✅ Supabase проект настроен

### 2. Обновление версии
```bash
# Обновите версию в app.json
"version": "1.0.0",
"ios": {
  "buildNumber": "1"
},
"android": {
  "versionCode": 1
}
```

## 📱 iOS Deployment

### App Store Connect
1. Создайте приложение в [App Store Connect](https://appstoreconnect.apple.com)
2. Заполните метаданные приложения
3. Загрузите скриншоты и иконки

### Сборка для iOS
```bash
# Установите EAS CLI
npm install -g @expo/eas-cli

# Войдите в аккаунт Expo
eas login

# Настройте проект
eas build:configure

# Создайте сборку для App Store
eas build --platform ios --profile production
```

### Загрузка в App Store
```bash
# Автоматическая загрузка
eas submit --platform ios --profile production
```

## 🤖 Android Deployment

### Google Play Console
1. Создайте приложение в [Google Play Console](https://play.google.com/console)
2. Настройте метаданные
3. Загрузите ресурсы

### Сборка для Android
```bash
# Создайте сборку для Google Play
eas build --platform android --profile production
```

### Загрузка в Google Play
```bash
# Автоматическая загрузка
eas submit --platform android --profile production
```

## 🔧 Конфигурация EAS

### eas.json
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

## 🔐 Переменные окружения

### Production .env
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
EXPO_PUBLIC_APP_ENV=production
```

## 📊 Мониторинг

### После деплоя проверьте:
- ✅ Push-уведомления работают
- ✅ Авторизация функционирует
- ✅ Заказы создаются
- ✅ Платежи обрабатываются
- ✅ Аналитика собирается

## 🔄 Обновления

### Patch обновления (1.0.1)
```bash
# Исправления багов
eas build --platform all --profile production
```

### Minor обновления (1.1.0)
```bash
# Новые функции
eas build --platform all --profile production
```

### Major обновления (2.0.0)
```bash
# Кардинальные изменения
eas build --platform all --profile production
```

## 📈 Аналитика

### Настройка отслеживания
- Expo Analytics
- Firebase Analytics
- Crashlytics
- Performance Monitoring

## 🆘 Troubleshooting

### Частые проблемы
1. **Сборка не проходит** - проверьте зависимости
2. **Push не работают** - проверьте сертификаты
3. **Авторизация падает** - проверьте Supabase настройки

### Логи
```bash
# Просмотр логов сборки
eas build:list

# Детали конкретной сборки
eas build:view [BUILD_ID]
``` 