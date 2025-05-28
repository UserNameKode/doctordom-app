import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface SimpleIconProps {
  name: string;
  size?: number;
  color?: string;
}

const SimpleIcon: React.FC<SimpleIconProps> = ({ 
  name, 
  size = 24, 
  color = '#000000' 
}) => {
  // Маппинг наших иконок на MaterialCommunityIcons
  const iconMap: Record<string, string> = {
    'services': 'tools',
    'orders': 'clipboard-list',
    'profile': 'account',
    'repair': 'hammer-wrench',
    'electrical': 'lightning-bolt',
    'plumbing': 'pipe-wrench',
    'cleaning': 'broom',
    'furniture': 'sofa',
    'garden': 'flower',
    'search': 'magnify',
    'heart': 'heart',
    'star': 'star',
    'phone': 'phone',
    'message': 'message',
    'calendar': 'calendar',
  };

  const iconName = iconMap[name] || 'help-circle';

  return (
    <MaterialCommunityIcons 
      name={iconName} 
      size={size} 
      color={color} 
    />
  );
};

export default SimpleIcon; 