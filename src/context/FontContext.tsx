import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Font from 'expo-font';
import {
  Inter_100Thin,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  useFonts
} from '@expo-google-fonts/inter';

// Определение типа контекста шрифтов
type FontContextType = {
  fontsLoaded: boolean;
  fontsError: Error | null;
};

// Создаем контекст
const FontContext = createContext<FontContextType>({
  fontsLoaded: false,
  fontsError: null
});

// Хук для использования контекста шрифтов
export const useFontContext = () => useContext(FontContext);

// Провайдер для шрифтов
interface FontProviderProps {
  children: ReactNode;
}

export const FontProvider: React.FC<FontProviderProps> = ({ children }) => {
  // Состояние ошибки загрузки шрифтов
  const [fontsError, setFontsError] = useState<Error | null>(null);
  
  // Загружаем шрифты
  const [fontsLoaded] = useFonts({
    'Inter-Thin': Inter_100Thin,
    'Inter-Light': Inter_300Light,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
  });

  // Показываем индикатор загрузки или основное приложение в зависимости от состояния загрузки шрифтов
  return (
    <FontContext.Provider value={{ fontsLoaded, fontsError }}>
      {children}
    </FontContext.Provider>
  );
};

export default FontContext; 