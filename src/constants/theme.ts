import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { Dimensions } from 'react-native';

// Размеры экрана для адаптивного дизайна
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Определение основных цветов приложения в соответствии с disign.md
const colors = {
  primary: '#95C11F',  // Основной акцентный цвет (зеленый из дизайна)
  secondary: '#077BC0', // Вторичный цвет (голубой из дизайна)
  darkBlue: '#182237',  // Темно-синий из дизайна
  background: '#F5F5FA', // Фон приложения (серый фон из дизайна)
  surface: '#FFFFFF',  // Поверхности (карточки и т.д.)
  text: '#182237',     // Основной текст (темно-синий из дизайна)
  textSecondary: '#646473', // Вторичный текст (из дизайна)
  primaryDark: '#7da119', // Темная версия зеленого для hover-состояний
  error: '#D32F2F',    // Цвет ошибки
  success: '#388E3C',  // Цвет успеха
  warning: '#FFA000',  // Цвет предупреждения
  info: '#077BC0',     // Информационный цвет (голубой)
  border: '#E0E0E0',   // Цвет границ
  disabled: '#9E9E9E', // Цвет отключенных элементов
  white: '#FFFFFF',    // Белый цвет
  cardBackground: '#FFFFFF', // Фон карточек
  historyCardBackground: '#F1F1F1', // Фон карточек истории заказов
  
  // Добавляем цвета для списка услуг
  jobBackground: '#FFFFFF',       // Фон невыбранной услуги
  jobSelectedBackground: '#182237',  // Фон выбранной услуги (темно-синий)
  jobSelectedText: '#FFFFFF',     // Цвет текста выбранной услуги (белый)
  jobShadow: 'rgba(0, 0, 0, 0.08)',   // Тень для невыбранной услуги
  
  // Расширение палитры для градиентов и эффектов
  gradients: {
    primary: ['#95C11F', '#78A118'],  // Зеленый градиент
    secondary: ['#077BC0', '#056094'], // Голубой градиент
    dark: ['#182237', '#111827'],      // Темно-синий градиент
    light: ['#FFFFFF', '#F5F5FA'],     // Светлый градиент
    accent: ['#95C11F', '#077BC0'],    // Акцентный градиент
  },
  
  // Цвета с прозрачностью для оверлеев и теней
  overlay: {
    light: 'rgba(255, 255, 255, 0.7)',
    dark: 'rgba(24, 34, 55, 0.7)',
    primary: 'rgba(149, 193, 31, 0.15)',
    secondary: 'rgba(7, 123, 192, 0.15)',
  }
};

// Определение размеров шрифтов
const fontSizes = {
  small: 12,
  medium: 14,
  regular: 16,
  large: 18,
  heading3: 22,
  heading2: 24,
  heading1: 28,
};

// Определение отступов (в соответствии с дизайном)
const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

// Определение радиусов скругления (из дизайна)
const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xl: 16,
  xxl: 28, // Для круглых кнопок (из дизайна - 56px диаметр)
};

// Определение теней (соответственно дизайну)
const shadows = {
  small: {
    shadowColor: 'rgba(24, 34, 55, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  medium: {
    shadowColor: 'rgba(24, 34, 55, 0.1)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: 'rgba(7, 123, 192, 0.15)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  button: {
    shadowColor: 'rgba(149, 193, 31, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  // Добавляем тень для элементов списка услуг
  jobItem: {
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 5,
  }
};

// Анимационные константы
const animation = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    // Можно использовать с Animated.timing
    // Соответствуют стандартным функциям Easing из React Native
    standard: 'standard',
    accelerate: 'accelerate',
    decelerate: 'decelerate',
    elastic: 'elastic',
  },
};

// Настройка шрифтов для React Native Paper
const fontConfig = {
  web: {
    regular: {
      fontFamily: 'Inter-Regular',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'Inter-Medium',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'Inter-Light',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'Inter-Thin',
      fontWeight: '100' as const,
    },
    bold: {
      fontFamily: 'Inter-Bold', 
      fontWeight: '700' as const,
    },
  },
  ios: {
    regular: {
      fontFamily: 'Inter-Regular',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'Inter-Medium',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'Inter-Light',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'Inter-Thin',
      fontWeight: '100' as const,
    },
    bold: {
      fontFamily: 'Inter-Bold', 
      fontWeight: '700' as const,
    },
  },
  android: {
    regular: {
      fontFamily: 'Inter-Regular',
      fontWeight: 'normal' as const,
    },
    medium: {
      fontFamily: 'Inter-Medium',
      fontWeight: 'normal' as const,
    },
    light: {
      fontFamily: 'Inter-Light',
      fontWeight: 'normal' as const,
    },
    thin: {
      fontFamily: 'Inter-Thin',
      fontWeight: 'normal' as const,
    },
    bold: {
      fontFamily: 'Inter-Bold', 
      fontWeight: 'normal' as const,
    },
  },
};

// Типографика компонентов по дизайну
const typography = {
  screenTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: fontSizes.heading1,
    color: colors.text,
  },
  screenSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: fontSizes.regular,
    color: colors.textSecondary,
  },
  cardTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: fontSizes.large,
    color: colors.text,
  },
  cardSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: fontSizes.regular,
    color: colors.textSecondary,
  },
  button: {
    fontFamily: 'Inter-Medium',
    fontSize: fontSizes.medium,
    letterSpacing: 0.5,
  },
  // Добавляем типографику для списка услуг
  jobTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: fontSizes.regular,
    color: colors.text,
  },
  jobSalary: {
    fontFamily: 'Inter-Regular',
    fontSize: fontSizes.medium,
    color: colors.textSecondary,
  },
};

// Создаем тему на основе базовой темы Paper
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    onSurface: colors.text,
    onBackground: colors.text,
    disabled: colors.disabled,
    placeholder: colors.textSecondary,
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: colors.secondary,
    darkBlue: colors.darkBlue,
  },
  roundness: borderRadius.medium,
};

// Экспортируем все константы для доступа в приложении
export default {
  colors,
  fontSizes,
  spacing,
  borderRadius,
  shadows,
  theme,
  typography,
  animation,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
}; 