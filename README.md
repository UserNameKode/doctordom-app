# 🏠 DoctorDom - Приложение бытовых услуг

> Мобильное приложение для заказа бытовых услуг с интеллектуальной системой push-уведомлений

[![React Native](https://img.shields.io/badge/React%20Native-0.72-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-49-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)

## 🚀 Возможности

### ✅ Основной функционал
- 📱 **Кроссплатформенное приложение** - iOS и Android
- 🔐 **Безопасная авторизация** - через Supabase Auth
- 📋 **Каталог услуг** - полный спектр бытовых услуг
- 📦 **Система заказов** - от создания до завершения
- 👨‍🔧 **Управление мастерами** - назначение и отслеживание
- 💳 **Готовность к платежам** - интеграция с платежными системами

### 🔔 Интеллектуальные Push-уведомления

Система отправляет **персональные уведомления** с реальными данными:

1. **"Мастер назначен"** 👨‍🔧
   ```
   На ваш заказ назначен мастер Иван! 
   Мастер приедет 15 мая в 11:00. 
   Мы уведомим вас за час до визита!
   ```

2. **"Напоминание за час"** ⏰
   ```
   Через 1 час к вам приедет Мастер Иван! 
   Пожалуйста будьте дома
   ```

3. **"Запрос оценки"** ⭐
   ```
   Как прошел визит мастера? 
   Оставьте отзывы и помогите нам стать лучше!
   ```

4. **"Чек готов"** 🧾
   ```
   Чек на услугу доступен в вашем личном кабинете! 
   Спасибо что выбрали нас!
   ```

## 🛠 Технологический стек

### Frontend
- **React Native** - кроссплатформенная разработка
- **Expo** - инструменты разработки и сборки
- **TypeScript** - типобезопасность
- **React Navigation 6** - навигация
- **React Native Paper** - UI компоненты

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - база данных
- **Row Level Security** - безопасность данных
- **Edge Functions** - серверная логика

### Push-уведомления
- **Expo Push API** - доставка уведомлений
- **Apple Push Notifications** - нативная поддержка iOS
- **Удаленная конфигурация** - управление через Supabase

## 📱 Скриншоты

```
🏠 Главная        📋 Услуги        📦 Заказы        👤 Профиль
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│             │   │             │   │             │   │             │
│   Добро     │   │  Сантехник  │   │ Активные    │   │  Настройки  │
│ пожаловать! │   │  Электрик   │   │ заказы      │   │  аккаунта   │
│             │   │  Уборка     │   │             │   │             │
│             │   │             │   │ История     │   │  Поддержка  │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

## 🚀 Быстрый старт

### Предварительные требования
- Node.js 18+
- npm или yarn
- Expo CLI
- iOS Simulator или Android Emulator

### Установка

```bash
# Клонирование репозитория
git clone https://github.com/ВАШ_USERNAME/doctordom-app.git
cd doctordom-app

# Установка зависимостей
npm install

# Запуск в режиме разработки
npx expo start
```

### Настройка окружения

1. **Создайте файл `.env`** в корне проекта:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. **Настройте Supabase проект** согласно документации в `/docs`

## 📊 Архитектура проекта

```
doctordom/
├── src/
│   ├── app/                    # Экраны приложения
│   │   ├── (auth)/            # Авторизация
│   │   └── (main)/            # Основные экраны
│   ├── components/            # Переиспользуемые компоненты
│   │   ├── ui/               # UI компоненты
│   │   └── forms/            # Формы
│   ├── services/             # Бизнес-логика
│   │   ├── pushNotificationService.ts
│   │   ├── orderService.ts
│   │   └── authService.ts
│   ├── lib/                  # Конфигурация
│   │   ├── supabase.ts
│   │   └── theme.ts
│   └── types/                # TypeScript типы
├── docs/                     # Документация
└── assets/                   # Ресурсы приложения
```

## 🔐 Безопасность

- ✅ **Row Level Security** - пользователи видят только свои данные
- ✅ **Валидация данных** - на клиенте и сервере
- ✅ **Безопасное хранение токенов** - в защищенном хранилище
- ✅ **HTTPS соединения** - все запросы зашифрованы

## 📈 Масштабируемость

Приложение готово к работе с **100,000+ пользователей**:

- **Supabase** - автомасштабирование базы данных
- **Edge Functions** - серверная логика без ограничений
- **Expo Push API** - до 100 уведомлений за запрос
- **Оптимизированные запросы** - эффективная работа с данными

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Проверка типов TypeScript
npm run type-check

# Линтинг кода
npm run lint
```

## 📱 Сборка для продакшена

### iOS
```bash
# Сборка для App Store
npx expo build:ios --type archive

# Локальная сборка
npx expo run:ios --configuration Release
```

### Android
```bash
# Сборка APK
npx expo build:android --type apk

# Сборка AAB для Google Play
npx expo build:android --type app-bundle
```

## 📋 Roadmap

### Версия 2.0
- [ ] Android поддержка push-уведомлений
- [ ] Геолокация мастеров
- [ ] Видеозвонки с мастерами
- [ ] Система лояльности

### Версия 3.0
- [ ] AI-рекомендации услуг
- [ ] Интеграция с умным домом
- [ ] Расширенная аналитика

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 📞 Поддержка

- 📧 Email: support@doctordom.ru
- 💬 Telegram: @doctordom_support
- 🐛 Issues: [GitHub Issues](https://github.com/ВАШ_USERNAME/doctordom-app/issues)

## 🎉 Благодарности

- [Expo Team](https://expo.dev/) - за отличные инструменты разработки
- [Supabase](https://supabase.com/) - за мощный backend
- [React Native Community](https://reactnative.dev/) - за экосистему

---

**✅ Статус проекта: ГОТОВО К PRODUCTION**

Приложение полностью протестировано и готово к публикации в App Store и Google Play.

---

<div align="center">
  <strong>Сделано с ❤️ для улучшения бытовых услуг</strong>
</div> 