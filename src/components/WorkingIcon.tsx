import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface WorkingIconProps {
  name: string;
  type?: string;
  size?: number;
  color?: string;
}

const WorkingIcon: React.FC<WorkingIconProps> = ({ 
  name, 
  type, 
  size = 24, 
  color = '#000000' 
}) => {
  // Маппинг наших иконок на MaterialCommunityIcons
  const getIconName = (iconName: string, iconType?: string): string => {
    // Навигационные иконки
    if (iconType === 'navigation') {
      switch (iconName) {
        case 'services': return 'view-grid-outline';
        case 'orders': return 'clipboard-text-outline';
        case 'profile': return 'account-circle-outline';
        case 'lucide--paintbrush': return 'brush';
        case 'lucide--history': return 'history';
        case 'lucide--circle-user-round': return 'account-circle';
        case 'lucide--send': return 'send';
        default: return 'help-circle-outline';
      }
    }
    
    // Категории услуг - более разнообразные и интересные иконки
    if (iconType === 'category') {
      switch (iconName) {
        // Основные категории
        case 'repair': return 'hammer-wrench';
        case 'cleaning': return 'spray-bottle';
        case 'plumbing': return 'pipe-wrench';
        case 'electrical': return 'flash';
        case 'furniture': return 'sofa';
        case 'garden': return 'flower-tulip';
        
        // Lucide иконки - более специфичные
        case 'lucide--drill': return 'drill';
        case 'lucide--washing-machine': return 'washing-machine';
        case 'lucide--toilet': return 'toilet';
        case 'lucide--lightbulb': return 'lightbulb-on';
        case 'lucide--armchair': return 'chair-rolling';
        case 'lucide--house': return 'home-variant';
        case 'lucide--truck': return 'truck-delivery';
        case 'lucide--paintbrush': return 'format-paint';
        case 'lucide--door-open': return 'door-open';
        case 'lucide--key-round': return 'key-variant';
        case 'lucide--monitor-cog': return 'monitor-dashboard';
        case 'lucide--snowflake': return 'snowflake';
        case 'lucide--forklift': return 'forklift';
        case 'lucide--bath': return 'bathtub';
        case 'lucide--lock': return 'lock';
        
        // Дополнительные интересные иконки для разных услуг
        case 'beauty': return 'face-woman-shimmer';
        case 'massage': return 'hand-heart';
        case 'fitness': return 'dumbbell';
        case 'photo': return 'camera';
        case 'video': return 'video';
        case 'music': return 'music-note';
        case 'education': return 'school';
        case 'language': return 'translate';
        case 'computer': return 'laptop';
        case 'phone': return 'cellphone';
        case 'car': return 'car';
        case 'motorcycle': return 'motorbike';
        case 'bicycle': return 'bicycle';
        case 'pet': return 'dog';
        case 'food': return 'food';
        case 'cake': return 'cake-variant';
        case 'coffee': return 'coffee';
        case 'pizza': return 'pizza';
        case 'gift': return 'gift';
        case 'party': return 'party-popper';
        case 'wedding': return 'ring';
        case 'baby': return 'baby-face';
        case 'elderly': return 'account-supervisor';
        case 'medical': return 'medical-bag';
        case 'dental': return 'tooth';
        case 'eye': return 'eye';
        case 'heart': return 'heart-pulse';
        case 'yoga': return 'yoga';
        case 'swimming': return 'swim';
        case 'tennis': return 'tennis';
        case 'football': return 'soccer';
        case 'basketball': return 'basketball';
        case 'golf': return 'golf';
        case 'fishing': return 'fish';
        case 'hiking': return 'hiking';
        case 'camping': return 'tent';
        case 'travel': return 'airplane';
        case 'hotel': return 'bed';
        case 'restaurant': return 'silverware-fork-knife';
        case 'shopping': return 'shopping';
        case 'fashion': return 'tshirt-crew';
        case 'jewelry': return 'diamond-stone';
        case 'watch': return 'watch';
        case 'glasses': return 'glasses';
        case 'book': return 'book-open-variant';
        case 'newspaper': return 'newspaper';
        case 'magazine': return 'magazine-pistol';
        case 'art': return 'palette';
        case 'design': return 'design';
        case 'architecture': return 'home-analytics';
        case 'engineering': return 'cog';
        case 'science': return 'flask';
        case 'chemistry': return 'test-tube';
        case 'biology': return 'dna';
        case 'physics': return 'atom';
        case 'math': return 'calculator';
        case 'finance': return 'currency-usd';
        case 'bank': return 'bank';
        case 'insurance': return 'shield-check';
        case 'legal': return 'gavel';
        case 'consulting': return 'account-tie';
        case 'marketing': return 'bullhorn';
        case 'sales': return 'chart-line';
        case 'support': return 'headset';
        case 'delivery': return 'truck-fast';
        case 'logistics': return 'package-variant';
        case 'warehouse': return 'warehouse';
        case 'factory': return 'factory';
        case 'construction': return 'hard-hat';
        case 'renovation': return 'home-edit';
        case 'painting': return 'roller-shade';
        case 'flooring': return 'texture-box';
        case 'roofing': return 'home-roof';
        case 'windows': return 'window-closed-variant';
        case 'doors': return 'door';
        case 'security': return 'security';
        case 'alarm': return 'alarm-bell';
        case 'camera-security': return 'cctv';
        case 'internet': return 'wifi';
        case 'network': return 'lan';
        case 'server': return 'server';
        case 'database': return 'database';
        case 'backup': return 'backup-restore';
        case 'cloud': return 'cloud';
        case 'mobile': return 'cellphone-android';
        case 'tablet': return 'tablet';
        case 'gaming': return 'gamepad-variant';
        case 'vr': return 'virtual-reality';
        case 'ai': return 'robot';
        case 'blockchain': return 'link-variant';
        case 'crypto': return 'bitcoin';
        
        default: return 'tools';
      }
    }
    
    // UI иконки
    if (iconType === 'ui') {
      switch (iconName) {
        case 'chevron-right': return 'chevron-right';
        case 'chevron-left': return 'chevron-left';
        case 'chevron-up': return 'chevron-up';
        case 'chevron-down': return 'chevron-down';
        case 'check': return 'check';
        case 'filter': return 'filter-variant';
        case 'search': return 'magnify';
        case 'calendar': return 'calendar';
        case 'map-pin': return 'map-marker';
        case 'user': return 'account';
        case 'sad-face': return 'emoticon-sad-outline';
        case 'heart': return 'heart';
        case 'clock': return 'clock-outline';
        case 'logout': return 'logout';
        default: return 'help-circle-outline';
      }
    }
    
    // Прямое имя иконки
    return iconName || 'help-circle-outline';
  };

  const iconName = getIconName(name, type);

  return (
    <MaterialCommunityIcons 
      name={iconName as any} 
      size={size} 
      color={color} 
    />
  );
};

export default WorkingIcon; 