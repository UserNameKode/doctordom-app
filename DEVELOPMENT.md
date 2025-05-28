# Руководство по разработке DoctorDom

## Настройка среды разработки

### 1. Установка необходимых инструментов

#### Node.js и npm
```bash
# Установите Node.js версии 18 или выше
# Скачайте с https://nodejs.org/

# Проверьте установку
node --version
npm --version
```

#### Expo CLI
```bash
npm install -g @expo/cli
```

#### Git
```bash
# Настройте Git
git config --global user.name "Ваше Имя"
git config --global user.email "your.email@example.com"
```

### 2. Клонирование и настройка проекта

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd doctordom

# Установите зависимости
npm install

# Скопируйте файл переменных окружения
cp env.example.txt .env

# Отредактируйте .env файл с вашими настройками
```

### 3. Настройка переменных окружения

Отредактируйте файл `.env` и заполните следующие переменные:

```env
# Обязательные переменные
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Для работы с картами
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 4. Настройка Supabase

1. Создайте аккаунт на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Скопируйте URL проекта и анонимный ключ
4. Добавьте их в файл `.env`

### 5. Настройка Google Maps

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com)
2. Создайте новый проект или выберите существующий
3. Включите Maps SDK for Android и Maps SDK for iOS
4. Создайте API ключ
5. Добавьте ключ в файл `.env`

### 6. Запуск проекта

```bash
# Запуск в режиме разработки
npm start

# Запуск на конкретной платформе
npm run android  # Android
npm run ios      # iOS (только macOS)
npm run web      # Веб-браузер
```

## Структура кода

### Архитектура приложения

```
src/
├── app/           # Основная логика приложения
├── components/    # Переиспользуемые UI компоненты
├── screens/       # Экраны приложения
├── services/      # API сервисы и внешние интеграции
├── utils/         # Утилиты и хелперы
├── types/         # TypeScript типы и интерфейсы
├── constants/     # Константы приложения
├── context/       # React Context для состояния
└── lib/           # Конфигурации библиотек
```

### Соглашения по именованию

- **Файлы компонентов**: PascalCase (например, `UserProfile.tsx`)
- **Файлы утилит**: camelCase (например, `dateUtils.ts`)
- **Константы**: UPPER_SNAKE_CASE (например, `API_ENDPOINTS`)
- **Переменные и функции**: camelCase

### Стиль кода

Проект использует ESLint и Prettier для поддержания единого стиля кода:

```bash
# Проверка кода
npm run lint

# Автоматическое исправление
npm run lint:fix

# Форматирование кода
npm run format
```

## Тестирование

### Запуск тестов

```bash
# Запуск всех тестов
npm test

# Запуск тестов в режиме наблюдения
npm run test:watch
```

### Написание тестов

- Используйте Jest для unit тестов
- Используйте React Native Testing Library для тестирования компонентов
- Размещайте тесты рядом с тестируемыми файлами или в папке `__tests__`

## Отладка

### React Native Debugger

1. Установите React Native Debugger
2. Запустите приложение в режиме разработки
3. Откройте меню разработчика (встряхните устройство или Cmd+D)
4. Выберите "Debug with Chrome"

### Flipper

1. Установите Flipper
2. Запустите приложение
3. Подключитесь к приложению через Flipper

## Деплой

### Сборка для тестирования

```bash
# Создание сборки для внутреннего тестирования
expo build:android --type apk
expo build:ios --type simulator
```

### Публикация в магазины

```bash
# Сборка для Google Play
expo build:android --type app-bundle

# Сборка для App Store
expo build:ios --type archive
```

## Полезные команды

```bash
# Очистка кэша
npm start -- --clear

# Обновление зависимостей
npm update

# Проверка устаревших пакетов
npm outdated

# Обновление иконок
npm run update-icons
```

## Решение проблем

### Проблемы с Metro

```bash
# Очистка кэша Metro
npx react-native start --reset-cache
```

### Проблемы с зависимостями

```bash
# Удаление node_modules и переустановка
rm -rf node_modules
npm install
```

### Проблемы с iOS

```bash
# Очистка кэша iOS
cd ios && xcodebuild clean
```

## Ресурсы

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Supabase Documentation](https://supabase.com/docs)
- [React Navigation](https://reactnavigation.org/docs/getting-started) 