import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import CustomSvgIcon from './CustomSvgIcon';

interface BetterIconProps {
  name: string;
  type?: string;
  size?: number;
  color?: string;
}

const BetterIcon: React.FC<BetterIconProps> = ({ 
  name, 
  type, 
  size = 24, 
  color = '#000000' 
}) => {
  // Маппинг иконок с использованием кастомных SVG и разных наборов для разнообразия
  const getIconData = (iconName: string, iconType?: string): { library: string; name: string } => {
    // Навигационные иконки
    if (iconType === 'navigation') {
      switch (iconName) {
        case 'services': return { library: 'CustomSvg', name: 'brush-cleaning' };
        case 'orders': return { library: 'CustomSvg', name: 'clock' };
        case 'profile': return { library: 'Ionicons', name: 'person-circle-outline' };
        default: return { library: 'Ionicons', name: 'help-circle-outline' };
      }
    }
    
    // Категории услуг - используем кастомные SVG и разные библиотеки для разнообразия
    if (iconType === 'category') {
      switch (iconName) {
        // Строительство и ремонт - Кастомные SVG
        case 'construction': return { library: 'CustomSvg', name: 'drill' };
        case 'renovation': return { library: 'CustomSvg', name: 'drill' };
        case 'painting': return { library: 'FontAwesome5', name: 'paint-roller' };
        case 'roofing': return { library: 'CustomSvg', name: 'brick-wall' };
        case 'flooring': return { library: 'MaterialCommunityIcons', name: 'texture-box' };
        case 'repair': return { library: 'CustomSvg', name: 'drill' };
        
        // Коммунальные услуги - Кастомные SVG и Ionicons
        case 'plumbing': return { library: 'CustomSvg', name: 'bath' };
        case 'electrical': return { library: 'CustomSvg', name: 'plug-zap' };
        case 'cleaning': return { library: 'CustomSvg', name: 'brush-cleaning' };
        case 'ventilation': return { library: 'CustomSvg', name: 'wind' };
        case 'lucide--snowflake': return { library: 'Ionicons', name: 'snow-outline' };
        case 'lucide--toilet': return { library: 'FontAwesome5', name: 'toilet' };
        case 'lucide--bath': return { library: 'CustomSvg', name: 'bath' };
        case 'lucide--lightbulb': return { library: 'Ionicons', name: 'bulb-outline' };
        
        // Мебель и дом - Кастомные SVG и Feather
        case 'furniture': return { library: 'CustomSvg', name: 'armchair' };
        case 'lucide--armchair': return { library: 'CustomSvg', name: 'armchair' };
        case 'lucide--house': return { library: 'Feather', name: 'home' };
        case 'windows': return { library: 'MaterialCommunityIcons', name: 'window-closed-variant' };
        case 'window-repair': return { library: 'CustomSvg', name: 'panels-top-left' };
        case 'mosquito-nets': return { library: 'CustomSvg', name: 'columns-4' };
        case 'doors': return { library: 'CustomSvg', name: 'door-open' };
        case 'lucide--key-round': return { library: 'Ionicons', name: 'key-outline' };
        
        // Транспорт - Кастомные SVG и FontAwesome5
        case 'car': return { library: 'FontAwesome5', name: 'car' };
        case 'delivery': return { library: 'CustomSvg', name: 'truck' };
        case 'travel': return { library: 'FontAwesome5', name: 'plane' };
        case 'lucide--truck': return { library: 'CustomSvg', name: 'truck' };
        case 'lucide--forklift': return { library: 'MaterialCommunityIcons', name: 'forklift' };
        
        // Красота и здоровье - разные библиотеки
        case 'beauty': return { library: 'Ionicons', name: 'cut-outline' };
        case 'massage': return { library: 'MaterialCommunityIcons', name: 'hand-heart' };
        case 'fitness': return { library: 'Ionicons', name: 'fitness-outline' };
        case 'yoga': return { library: 'MaterialCommunityIcons', name: 'yoga' };
        case 'medical': return { library: 'FontAwesome5', name: 'user-md' };
        case 'dental': return { library: 'FontAwesome5', name: 'tooth' };
        case 'swimming': return { library: 'FontAwesome5', name: 'swimmer' };
        
        // Технологии - Feather и AntDesign
        case 'computer': return { library: 'Feather', name: 'monitor' };
        case 'appliance-repair': return { library: 'CustomSvg', name: 'microwave' };
        case 'mobile': return { library: 'Feather', name: 'smartphone' };
        case 'tablet': return { library: 'Feather', name: 'tablet' };
        case 'internet': return { library: 'Feather', name: 'wifi' };
        case 'design': return { library: 'AntDesign', name: 'edit' };
        case 'ai': return { library: 'AntDesign', name: 'robot' };
        case 'gaming': return { library: 'Ionicons', name: 'game-controller-outline' };
        case 'vr': return { library: 'MaterialCommunityIcons', name: 'virtual-reality' };
        case 'lucide--drill': return { library: 'CustomSvg', name: 'drill' };
        case 'lucide--washing-machine': return { library: 'CustomSvg', name: 'microwave' };
        case 'lucide--monitor-cog': return { library: 'MaterialCommunityIcons', name: 'monitor-dashboard' };
        
        // Развлечения - Ionicons и FontAwesome5
        case 'photo': return { library: 'Ionicons', name: 'camera-outline' };
        case 'video': return { library: 'Ionicons', name: 'videocam-outline' };
        case 'music': return { library: 'Ionicons', name: 'musical-notes-outline' };
        case 'party': return { library: 'FontAwesome5', name: 'glass-cheers' };
        case 'wedding': return { library: 'FontAwesome5', name: 'ring' };
        case 'gift': return { library: 'Ionicons', name: 'gift-outline' };
        
        // Еда - Ionicons
        case 'food': return { library: 'Ionicons', name: 'restaurant-outline' };
        case 'cake': return { library: 'FontAwesome5', name: 'birthday-cake' };
        case 'pizza': return { library: 'FontAwesome5', name: 'pizza-slice' };
        case 'coffee': return { library: 'Ionicons', name: 'cafe-outline' };
        case 'restaurant': return { library: 'Ionicons', name: 'restaurant-outline' };
        
        // Спорт - FontAwesome5
        case 'football': return { library: 'FontAwesome5', name: 'football-ball' };
        case 'basketball': return { library: 'FontAwesome5', name: 'basketball-ball' };
        case 'tennis': return { library: 'FontAwesome5', name: 'table-tennis' };
        case 'golf': return { library: 'FontAwesome5', name: 'golf-ball' };
        case 'fishing': return { library: 'FontAwesome5', name: 'fish' };
        case 'hiking': return { library: 'FontAwesome5', name: 'hiking' };
        case 'camping': return { library: 'FontAwesome5', name: 'campground' };
        
        // Семья и дети - Ionicons
        case 'baby': return { library: 'Ionicons', name: 'happy-outline' };
        case 'elderly': return { library: 'FontAwesome5', name: 'user-friends' };
        case 'pet': return { library: 'Ionicons', name: 'paw-outline' };
        
        // Образование - Ionicons
        case 'education': return { library: 'Ionicons', name: 'school-outline' };
        case 'language': return { library: 'Ionicons', name: 'language-outline' };
        case 'book': return { library: 'Ionicons', name: 'book-outline' };
        
        // Бизнес - Кастомные SVG, AntDesign и FontAwesome5
        case 'finance': return { library: 'AntDesign', name: 'dollarcircleo' };
        case 'bank': return { library: 'FontAwesome5', name: 'university' };
        case 'insurance': return { library: 'FontAwesome5', name: 'shield-alt' };
        case 'legal': return { library: 'FontAwesome5', name: 'gavel' };
        case 'consulting': return { library: 'CustomSvg', name: 'briefcase-business' };
        case 'marketing': return { library: 'FontAwesome5', name: 'bullhorn' };
        case 'sales': return { library: 'AntDesign', name: 'linechart' };
        case 'support': return { library: 'FontAwesome5', name: 'headset' };
        
        // Безопасность - Ionicons
        case 'security': return { library: 'Ionicons', name: 'shield-checkmark-outline' };
        case 'alarm': return { library: 'Ionicons', name: 'alarm-outline' };
        case 'camera-security': return { library: 'FontAwesome5', name: 'video' };
        case 'lucide--lock': return { library: 'Ionicons', name: 'lock-closed-outline' };
        
        // Логистика - FontAwesome5
        case 'logistics': return { library: 'FontAwesome5', name: 'boxes' };
        case 'warehouse': return { library: 'FontAwesome5', name: 'warehouse' };
        case 'factory': return { library: 'FontAwesome5', name: 'industry' };
        
        // IT - Feather
        case 'server': return { library: 'Feather', name: 'server' };
        case 'database': return { library: 'Feather', name: 'database' };
        case 'backup': return { library: 'Feather', name: 'upload-cloud' };
        case 'cloud': return { library: 'Feather', name: 'cloud' };
        case 'network': return { library: 'Feather', name: 'share-2' };
        
        // Покупки - Ionicons
        case 'shopping': return { library: 'Ionicons', name: 'bag-outline' };
        case 'fashion': return { library: 'Ionicons', name: 'shirt-outline' };
        case 'jewelry': return { library: 'FontAwesome5', name: 'gem' };
        case 'watch': return { library: 'FontAwesome5', name: 'clock' };
        case 'glasses': return { library: 'FontAwesome5', name: 'glasses' };
        
        // Искусство - Feather
        case 'art': return { library: 'Feather', name: 'edit-3' };
        case 'architecture': return { library: 'MaterialCommunityIcons', name: 'home-analytics' };
        case 'engineering': return { library: 'Feather', name: 'settings' };
        case 'science': return { library: 'Ionicons', name: 'flask-outline' };
        case 'chemistry': return { library: 'FontAwesome5', name: 'flask' };
        case 'biology': return { library: 'MaterialCommunityIcons', name: 'dna' };
        case 'physics': return { library: 'MaterialCommunityIcons', name: 'atom' };
        case 'math': return { library: 'FontAwesome5', name: 'calculator' };
        
        // Криптовалюты - FontAwesome5
        case 'crypto': return { library: 'FontAwesome5', name: 'bitcoin' };
        case 'blockchain': return { library: 'MaterialCommunityIcons', name: 'link-variant' };
        
        // Сад - Ionicons
        case 'garden': return { library: 'Ionicons', name: 'flower-outline' };
        
        default: return { library: 'FontAwesome5', name: 'tools' };
      }
    }
    
    // UI иконки - Feather для чистого вида
    if (iconType === 'ui') {
      switch (iconName) {
        case 'chevron-right': return { library: 'Feather', name: 'chevron-right' };
        case 'chevron-left': return { library: 'Feather', name: 'chevron-left' };
        case 'chevron-up': return { library: 'Feather', name: 'chevron-up' };
        case 'chevron-down': return { library: 'Feather', name: 'chevron-down' };
        case 'check': return { library: 'Feather', name: 'check' };
        case 'filter': return { library: 'Feather', name: 'filter' };
        case 'search': return { library: 'Feather', name: 'search' };
        case 'calendar': return { library: 'Feather', name: 'calendar' };
        case 'map-pin': return { library: 'Feather', name: 'map-pin' };
        case 'user': return { library: 'Feather', name: 'user' };
        case 'heart': return { library: 'Feather', name: 'heart' };
        case 'clock': return { library: 'CustomSvg', name: 'clock' };
        case 'logout': return { library: 'Feather', name: 'log-out' };
        default: return { library: 'Feather', name: 'help-circle' };
      }
    }
    
    // Прямое имя иконки - используем MaterialCommunityIcons по умолчанию
    return { library: 'MaterialCommunityIcons', name: iconName || 'help-circle-outline' };
  };

  const iconData = getIconData(name, type);

  // Рендерим иконку из соответствующей библиотеки
  switch (iconData.library) {
    case 'CustomSvg':
      return <CustomSvgIcon name={iconData.name} size={size} color={color} />;
    case 'Ionicons':
      return <Ionicons name={iconData.name as any} size={size} color={color} />;
    case 'Feather':
      return <Feather name={iconData.name as any} size={size} color={color} />;
    case 'FontAwesome5':
      return <FontAwesome5 name={iconData.name as any} size={size} color={color} />;
    case 'AntDesign':
      return <AntDesign name={iconData.name as any} size={size} color={color} />;
    case 'Entypo':
      return <Entypo name={iconData.name as any} size={size} color={color} />;
    case 'MaterialCommunityIcons':
    default:
      return <MaterialCommunityIcons name={iconData.name as any} size={size} color={color} />;
  }
};

export default BetterIcon; 