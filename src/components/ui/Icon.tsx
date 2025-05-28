import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Типы иконок
export type IconType = 'category' | 'navigation' | 'ui' | 'material';

// Интерфейс пропсов
interface IconProps {
  name: string;
  type?: IconType;
  size?: number;
  color?: string;
  style?: any;
}

// Импорты SVG иконок
import { 
  categoryIconsMap, 
  navigationIconsMap, 
  uiIconsMap,
  fallbackIcons 
} from '../../utils/iconLoader';

/**
 * Универсальный компонент иконки
 * Поддерживает как пользовательские SVG иконки, так и MaterialCommunityIcons
 */
const Icon: React.FC<IconProps> = ({ 
  name, 
  type = 'material', 
  size = 24, 
  color = '#000000',
  style 
}) => {
  // Функция для получения SVG иконки
  const getSvgIcon = (iconName: string, iconType: IconType): string | null => {
    console.log(`🔍 Looking for icon: ${iconName} (${iconType})`);
    let result = null;
    switch (iconType) {
      case 'category':
        result = categoryIconsMap[iconName] || null;
        break;
      case 'navigation':
        result = navigationIconsMap[iconName] || null;
        console.log(`📋 Navigation icons available:`, Object.keys(navigationIconsMap));
        break;
      case 'ui':
        result = uiIconsMap[iconName] || null;
        break;
      default:
        result = null;
    }
    console.log(`🎯 Icon result for ${iconName}:`, result ? 'FOUND' : 'NOT FOUND');
    return result;
  };

  // Если это пользовательская иконка
  if (type !== 'material') {
    const svgContent = getSvgIcon(name, type);
    
    if (svgContent) {
      // Заменяем цвет в SVG
      const coloredSvg = svgContent
        .replace(/currentColor/g, color)
        .replace(/#000000/g, color)
        .replace(/fill="[^"]*"/g, `fill="${color}"`)
        .replace(/stroke="[^"]*"/g, `stroke="${color}"`);

      console.log(`✅ Loading SVG icon: ${name} (${type})`);
      return (
        <View style={[{ width: size, height: size }, style]}>
          <SvgXml 
            xml={coloredSvg} 
            width={size} 
            height={size} 
          />
        </View>
      );
    }
    
    // Если SVG не найден, используем fallback MaterialCommunityIcons
    console.warn(`❌ SVG icon "${name}" of type "${type}" not found. Using fallback.`);
  }

  // Получаем fallback иконку
  const getFallbackIcon = (iconName: string, iconType: IconType): string => {
    const fallbackMap = fallbackIcons[iconType as keyof typeof fallbackIcons];
    return (fallbackMap as any)?.[iconName] || 'help-circle-outline';
  };

  // Fallback на MaterialCommunityIcons
  const fallbackIconName = type !== 'material' ? getFallbackIcon(name, type) : name;
  
  return (
    <MaterialCommunityIcons 
      name={fallbackIconName as any} 
      size={size} 
      color={color} 
      style={style}
    />
  );
};

export default Icon; 