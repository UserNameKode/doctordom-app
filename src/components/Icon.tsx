import React from 'react';
import { SvgProps } from 'react-native-svg';
import { ViewStyle } from 'react-native';

// Импорты иконок категорий
import RepairIcon from '../../assets/icons/categories/repair.svg';
import ConstructionIcon from '../../assets/icons/categories/construction.svg';
import ToolsIcon from '../../assets/icons/categories/tools.svg';
import ElectricalIcon from '../../assets/icons/categories/electrical.svg';
import ElectricalAltIcon from '../../assets/icons/categories/electrical-alt.svg';
import PlumbingIcon from '../../assets/icons/categories/plumbing.svg';
import WaterIcon from '../../assets/icons/categories/water.svg';
import BathIcon from '../../assets/icons/categories/bath.svg';
import CleaningIcon from '../../assets/icons/categories/cleaning.svg';
import VacuumIcon from '../../assets/icons/categories/vacuum.svg';
import FurnitureIcon from '../../assets/icons/categories/furniture.svg';
import AssemblyIcon from '../../assets/icons/categories/assembly.svg';
import BedIcon from '../../assets/icons/categories/bed.svg';
import ArmchairIcon from '../../assets/icons/categories/armchair.svg';
import AppliancesIcon from '../../assets/icons/categories/appliances.svg';
import RepairTechIcon from '../../assets/icons/categories/repair-tech.svg';
import GardenIcon from '../../assets/icons/categories/garden.svg';
import LandscapingIcon from '../../assets/icons/categories/landscaping.svg';
import MovingIcon from '../../assets/icons/categories/moving.svg';
import DeliveryIcon from '../../assets/icons/categories/delivery.svg';
import HandymanIcon from '../../assets/icons/categories/handyman.svg';
import LadderIcon from '../../assets/icons/categories/ladder.svg';
import VentilationIcon from '../../assets/icons/categories/ventilation.svg';
import AirConditioningIcon from '../../assets/icons/categories/air-conditioning.svg';
import PaintIcon from '../../assets/icons/categories/paint.svg';
import HouseIcon from '../../assets/icons/categories/house.svg';
import HouseSimpleIcon from '../../assets/icons/categories/house-simple.svg';

// Импорты иконок навигации
import ServicesIcon from '../../assets/icons/navigation/services.svg';
import OrdersIcon from '../../assets/icons/navigation/orders.svg';
import ProfileIcon from '../../assets/icons/navigation/profile.svg';

// Импорты UI иконок
import ChevronRightIcon from '../../assets/icons/ui/chevron-right.svg';
import ChevronLeftIcon from '../../assets/icons/ui/chevron-left.svg';
import ChevronUpIcon from '../../assets/icons/ui/chevron-up.svg';
import ChevronDownIcon from '../../assets/icons/ui/chevron-down.svg';
import CheckIcon from '../../assets/icons/ui/check.svg';
import FilterIcon from '../../assets/icons/ui/filter.svg';
import SearchIcon from '../../assets/icons/ui/search.svg';
import CalendarIcon from '../../assets/icons/ui/calendar.svg';
import MapPinIcon from '../../assets/icons/ui/map-pin.svg';
import UserIcon from '../../assets/icons/ui/user.svg';
import HeartIcon from '../../assets/icons/ui/heart.svg';
import ClockIcon from '../../assets/icons/ui/clock.svg';
import LogoutIcon from '../../assets/icons/ui/logout.svg';
import StarIcon from '../../assets/icons/ui/star.svg';
import PhoneIcon from '../../assets/icons/ui/phone.svg';
import MessageIcon from '../../assets/icons/ui/message.svg';
import LocationIcon from '../../assets/icons/ui/location.svg';
import PlusIcon from '../../assets/icons/ui/plus.svg';
import MinusIcon from '../../assets/icons/ui/minus.svg';
import XIcon from '../../assets/icons/ui/x.svg';

// Типы иконок
export type CategoryIconName = 
  | 'repair' | 'construction' | 'tools' | 'electrical' | 'electrical-alt'
  | 'plumbing' | 'water' | 'bath' | 'cleaning' | 'vacuum'
  | 'furniture' | 'assembly' | 'bed' | 'armchair' | 'appliances'
  | 'repair-tech' | 'garden' | 'landscaping' | 'moving' | 'delivery'
  | 'handyman' | 'ladder' | 'ventilation' | 'air-conditioning'
  | 'paint' | 'house' | 'house-simple';

export type NavigationIconName = 'services' | 'orders' | 'profile';

export type UIIconName = 
  | 'chevron-right' | 'chevron-left' | 'chevron-up' | 'chevron-down'
  | 'check' | 'filter' | 'search' | 'calendar' | 'map-pin'
  | 'user' | 'heart' | 'clock' | 'logout' | 'star'
  | 'phone' | 'message' | 'location' | 'plus' | 'minus' | 'x';

export type IconName = CategoryIconName | NavigationIconName | UIIconName;

// Маппинг иконок
const iconMap: Record<IconName, React.ComponentType<SvgProps>> = {
  // Категории
  'repair': RepairIcon,
  'construction': ConstructionIcon,
  'tools': ToolsIcon,
  'electrical': ElectricalIcon,
  'electrical-alt': ElectricalAltIcon,
  'plumbing': PlumbingIcon,
  'water': WaterIcon,
  'bath': BathIcon,
  'cleaning': CleaningIcon,
  'vacuum': VacuumIcon,
  'furniture': FurnitureIcon,
  'assembly': AssemblyIcon,
  'bed': BedIcon,
  'armchair': ArmchairIcon,
  'appliances': AppliancesIcon,
  'repair-tech': RepairTechIcon,
  'garden': GardenIcon,
  'landscaping': LandscapingIcon,
  'moving': MovingIcon,
  'delivery': DeliveryIcon,
  'handyman': HandymanIcon,
  'ladder': LadderIcon,
  'ventilation': VentilationIcon,
  'air-conditioning': AirConditioningIcon,
  'paint': PaintIcon,
  'house': HouseIcon,
  'house-simple': HouseSimpleIcon,
  
  // Навигация
  'services': ServicesIcon,
  'orders': OrdersIcon,
  'profile': ProfileIcon,
  
  // UI
  'chevron-right': ChevronRightIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-up': ChevronUpIcon,
  'chevron-down': ChevronDownIcon,
  'check': CheckIcon,
  'filter': FilterIcon,
  'search': SearchIcon,
  'calendar': CalendarIcon,
  'map-pin': MapPinIcon,
  'user': UserIcon,
  'heart': HeartIcon,
  'clock': ClockIcon,
  'logout': LogoutIcon,
  'star': StarIcon,
  'phone': PhoneIcon,
  'message': MessageIcon,
  'location': LocationIcon,
  'plus': PlusIcon,
  'minus': MinusIcon,
  'x': XIcon,
};

// Пропсы компонента
export interface IconProps extends SvgProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

// Компонент Icon
const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color = '#000000',
  style,
  ...props 
}) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return (
    <IconComponent
      width={size}
      height={size}
      fill={color}
      style={style}
      {...props}
    />
  );
};

export default Icon; 