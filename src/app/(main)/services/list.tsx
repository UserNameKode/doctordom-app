import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar, Platform } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BetterIcon from '../../../components/BetterIcon';
import { LinearGradient } from 'expo-linear-gradient';

import { ServiceStackParamList } from './_layout';
import { getServices } from '../../../lib/supabase';
import Animated, { FadeInDown, FadeIn, SlideInRight } from 'react-native-reanimated';
import appTheme from '../../../constants/theme';

// Константы шрифтов
const FONTS = {
  regular: 'Stolz-Regular',
  medium: 'Stolz-Medium',
  bold: 'Stolz-Bold',
};

// Интерфейс для услуги
interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  unit: string;
  rating: number;
  reviewsCount: number;
  imageUrl: string | null;
  categoryId: string;
  subCategoryId?: string;
  // Добавим для нового интерфейса
  icon?: any;
  minPrice?: string;
  maxPrice?: string;
}

type ServiceListScreenRouteProp = RouteProp<ServiceStackParamList, 'List'>;
type ServiceListScreenNavigationProp = StackNavigationProp<ServiceStackParamList, 'Detail'>;

/**
 * Компонент карточки услуги в новом дизайне
 */
const ServiceCard = ({ 
  service, 
  onPress, 
  isSelected,
  index 
}: { 
  service: Service; 
  onPress: () => void;
  isSelected: boolean;
  index: number;
}) => {
  // Отображаем цену в формате "от X₽"
  const priceDisplay = `от ${service.minPrice || service.price}₽`;
  
  // Определяем иконку по умолчанию, если нет конкретной
  const iconData = service.icon || { name: 'repair', type: 'category' };
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <Animated.View 
        entering={FadeInDown.delay(index * 100).duration(400)}
        style={[
          styles.serviceCard,
          isSelected && styles.selectedServiceCard
        ]}
      >
        <View style={[
          styles.serviceIcon,
          isSelected && styles.selectedServiceIcon
        ]}>
          <BetterIcon 
            name={iconData.name} 
            type={iconData.type as any}
            size={24} 
            color={isSelected ? '#FFFFFF' : appTheme.colors.primary} 
          />
        </View>
        
        <View style={styles.serviceTextContainer}>
          <Text 
            style={[
              styles.serviceName,
              isSelected && styles.selectedServiceText
            ]}
            numberOfLines={2}
          >
            {service.name}
          </Text>
          
          <Text 
            style={[
              styles.servicePrice,
              isSelected && styles.selectedServicePrice
            ]}
          >
            {priceDisplay}
          </Text>
        </View>
        
        {isSelected && (
          <Animated.View 
            entering={SlideInRight.duration(200)} 
            style={styles.selectedIndicator}
          >
            <MaterialCommunityIcons 
              name="check" 
              size={24} 
              color="#FFFFFF" 
            />
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

/**
 * Обновленный экран списка услуг в выбранной категории
 */
const ServiceListScreen = () => {
  const route = useRoute<ServiceListScreenRouteProp>();
  const navigation = useNavigation<ServiceListScreenNavigationProp>();
  const { categoryId, categoryName } = route.params;
  const insets = useSafeAreaInsets();
  
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Эффект для загрузки услуг при монтировании компонента
  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true);
      try {
        // Получаем услуги из Supabase
        const { data: servicesData, error } = await getServices(categoryId);
        
        if (error) {
          throw error;
        }
        
        if (!servicesData || servicesData.length === 0) {
          setServices([]);
          return;
        }
        
        // Преобразуем данные в формат, необходимый для отображения
        const formattedServices: Service[] = servicesData.map(service => {
          // Используем цену из базы данных "от X"
          const basePrice = service.price_from?.toString() || '0';
          return {
            id: service.id,
            name: service.name,
            description: service.description || '',
            price: basePrice,
            unit: service.unit || 'услуга',
            rating: 0,
            reviewsCount: 0,
            imageUrl: null,
            categoryId: service.category_id,
            minPrice: basePrice,
            // Подбираем иконку на основе имени услуги
            icon: getServiceIcon(service.name)
          };
        });
        
        setServices(formattedServices);
      } catch (error) {
        console.error('Ошибка при загрузке услуг:', error);
        // В случае ошибки просто устанавливаем пустой массив
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, [categoryId, route.params.subCategoryId]);

  // Обработчик нажатия на карточку услуги
  const handleServicePress = (service: Service) => {
    setSelectedService(service.id);
    
    // Небольшая задержка перед переходом для отображения выбранного состояния
    setTimeout(() => {
      navigation.navigate('Detail', { 
        serviceId: service.id
      });
    }, 300);
  };

  // Функция для подбора иконки на основе имени услуги
  const getServiceIcon = (serviceName: string) => {
    const nameLower = serviceName.toLowerCase();
    
    // Строительство и ремонт
    if (nameLower.includes('ремонт') && nameLower.includes('квартир')) return { name: 'renovation', type: 'category' };
    if (nameLower.includes('ремонт') && nameLower.includes('дом')) return { name: 'construction', type: 'category' };
    if (nameLower.includes('ремонт') && nameLower.includes('кровл')) return { name: 'roofing', type: 'category' };
    if (nameLower.includes('ремонт') && nameLower.includes('пол')) return { name: 'flooring', type: 'category' };
    if (nameLower.includes('ремонт')) return { name: 'construction', type: 'category' };
    if (nameLower.includes('строительство')) return { name: 'construction', type: 'category' };
    if (nameLower.includes('сверление') || nameLower.includes('дрель')) return { name: 'lucide--drill', type: 'category' };
    
    // Уборка и клининг
    if (nameLower.includes('уборка') && nameLower.includes('генеральная')) return { name: 'cleaning', type: 'category' };
    if (nameLower.includes('уборка') && nameLower.includes('после ремонта')) return { name: 'construction', type: 'category' };
    if (nameLower.includes('уборка')) return { name: 'cleaning', type: 'category' };
    if (nameLower.includes('клининг')) return { name: 'cleaning', type: 'category' };
    if (nameLower.includes('мытье окон')) return { name: 'windows', type: 'category' };
    if (nameLower.includes('химчистка')) return { name: 'lucide--washing-machine', type: 'category' };
    
    // Сантехника
    if (nameLower.includes('сантехник')) return { name: 'plumbing', type: 'category' };
    if (nameLower.includes('водопровод')) return { name: 'plumbing', type: 'category' };
    if (nameLower.includes('канализация')) return { name: 'plumbing', type: 'category' };
    if (nameLower.includes('унитаз')) return { name: 'lucide--toilet', type: 'category' };
    if (nameLower.includes('ванна') || nameLower.includes('душ')) return { name: 'lucide--bath', type: 'category' };
    if (nameLower.includes('смеситель') || nameLower.includes('кран')) return { name: 'plumbing', type: 'category' };
    
    // Электрика
    if (nameLower.includes('электрик')) return { name: 'electrical', type: 'category' };
    if (nameLower.includes('проводка')) return { name: 'electrical', type: 'category' };
    if (nameLower.includes('розетки') || nameLower.includes('выключатели')) return { name: 'electrical', type: 'category' };
    if (nameLower.includes('люстра') || nameLower.includes('светильник')) return { name: 'lucide--lightbulb', type: 'category' };
    if (nameLower.includes('освещение')) return { name: 'lucide--lightbulb', type: 'category' };
    
    // Покраска и отделка
    if (nameLower.includes('покраска')) return { name: 'painting', type: 'category' };
    if (nameLower.includes('малярные')) return { name: 'painting', type: 'category' };
    if (nameLower.includes('обои')) return { name: 'painting', type: 'category' };
    if (nameLower.includes('штукатурка')) return { name: 'painting', type: 'category' };
    if (nameLower.includes('шпаклевка')) return { name: 'painting', type: 'category' };
    
    // Мебель и сборка
    if (nameLower.includes('сборка мебели')) return { name: 'furniture', type: 'category' };
    if (nameLower.includes('мебель')) return { name: 'furniture', type: 'category' };
    if (nameLower.includes('шкаф') || nameLower.includes('комод')) return { name: 'furniture', type: 'category' };
    if (nameLower.includes('кровать') || nameLower.includes('диван')) return { name: 'furniture', type: 'category' };
    if (nameLower.includes('стол') || nameLower.includes('стул')) return { name: 'furniture', type: 'category' };
    if (nameLower.includes('кухня') && nameLower.includes('сборка')) return { name: 'furniture', type: 'category' };
    
    // Техника и электроника
    if (nameLower.includes('ремонт техники')) return { name: 'computer', type: 'category' };
    if (nameLower.includes('стиральная машина')) return { name: 'lucide--washing-machine', type: 'category' };
    if (nameLower.includes('холодильник')) return { name: 'computer', type: 'category' };
    if (nameLower.includes('телевизор')) return { name: 'computer', type: 'category' };
    if (nameLower.includes('компьютер') || nameLower.includes('ноутбук')) return { name: 'computer', type: 'category' };
    if (nameLower.includes('телефон') || nameLower.includes('смартфон')) return { name: 'mobile', type: 'category' };
    if (nameLower.includes('планшет')) return { name: 'tablet', type: 'category' };
    
    // Окна и двери
    if (nameLower.includes('окна') || nameLower.includes('стекла')) return { name: 'windows', type: 'category' };
    if (nameLower.includes('двери')) return { name: 'doors', type: 'category' };
    if (nameLower.includes('ключи')) return { name: 'lucide--key-round', type: 'category' };
    if (nameLower.includes('замки')) return { name: 'doors', type: 'category' };
    if (nameLower.includes('домофон')) return { name: 'security', type: 'category' };
    
    // Грузоперевозки и доставка
    if (nameLower.includes('грузоперевозки')) return { name: 'delivery', type: 'category' };
    if (nameLower.includes('переезд')) return { name: 'delivery', type: 'category' };
    if (nameLower.includes('доставка')) return { name: 'delivery', type: 'category' };
    if (nameLower.includes('грузчики')) return { name: 'delivery', type: 'category' };
    if (nameLower.includes('вывоз мусора')) return { name: 'delivery', type: 'category' };
    
    // Красота и здоровье
    if (nameLower.includes('парикмахер') || nameLower.includes('стрижка')) return { name: 'beauty', type: 'category' };
    if (nameLower.includes('маникюр') || nameLower.includes('педикюр')) return { name: 'beauty', type: 'category' };
    if (nameLower.includes('массаж')) return { name: 'massage', type: 'category' };
    if (nameLower.includes('косметолог')) return { name: 'beauty', type: 'category' };
    if (nameLower.includes('визажист')) return { name: 'beauty', type: 'category' };
    
    // Спорт и фитнес
    if (nameLower.includes('фитнес') || nameLower.includes('тренер')) return { name: 'fitness', type: 'category' };
    if (nameLower.includes('йога')) return { name: 'yoga', type: 'category' };
    if (nameLower.includes('плавание')) return { name: 'swimming', type: 'category' };
    if (nameLower.includes('теннис')) return { name: 'tennis', type: 'category' };
    if (nameLower.includes('футбол')) return { name: 'football', type: 'category' };
    if (nameLower.includes('баскетбол')) return { name: 'basketball', type: 'category' };
    
    // Образование и обучение
    if (nameLower.includes('репетитор') || nameLower.includes('обучение')) return { name: 'education', type: 'category' };
    if (nameLower.includes('языки') || nameLower.includes('английский')) return { name: 'language', type: 'category' };
    if (nameLower.includes('музыка') || nameLower.includes('гитара')) return { name: 'music', type: 'category' };
    if (nameLower.includes('вокал') || nameLower.includes('пение')) return { name: 'music', type: 'category' };
    
    // Фото и видео
    if (nameLower.includes('фотограф') || nameLower.includes('фотосессия')) return { name: 'photo', type: 'category' };
    if (nameLower.includes('видеосъемка') || nameLower.includes('видеограф')) return { name: 'video', type: 'category' };
    if (nameLower.includes('свадебная съемка')) return { name: 'wedding', type: 'category' };
    
    // Еда и кулинария
    if (nameLower.includes('повар') || nameLower.includes('кулинар')) return { name: 'food', type: 'category' };
    if (nameLower.includes('торт') || nameLower.includes('кондитер')) return { name: 'cake', type: 'category' };
    if (nameLower.includes('пицца')) return { name: 'pizza', type: 'category' };
    if (nameLower.includes('кофе') || nameLower.includes('бариста')) return { name: 'coffee', type: 'category' };
    if (nameLower.includes('кейтеринг')) return { name: 'restaurant', type: 'category' };
    
    // Животные и питомцы
    if (nameLower.includes('выгул собак')) return { name: 'pet', type: 'category' };
    if (nameLower.includes('ветеринар')) return { name: 'pet', type: 'category' };
    if (nameLower.includes('груминг')) return { name: 'pet', type: 'category' };
    if (nameLower.includes('дрессировка')) return { name: 'pet', type: 'category' };
    
    // Дети и семья
    if (nameLower.includes('няня') || nameLower.includes('детей')) return { name: 'baby', type: 'category' };
    if (nameLower.includes('аниматор')) return { name: 'party', type: 'category' };
    if (nameLower.includes('детский праздник')) return { name: 'party', type: 'category' };
    
    // Пожилые люди
    if (nameLower.includes('сиделка') || nameLower.includes('пожилых')) return { name: 'elderly', type: 'category' };
    if (nameLower.includes('медсестра')) return { name: 'medical', type: 'category' };
    
    // Автомобили
    if (nameLower.includes('автомобиль') || nameLower.includes('машина')) return { name: 'car', type: 'category' };
    if (nameLower.includes('мойка авто')) return { name: 'car', type: 'category' };
    if (nameLower.includes('ремонт авто')) return { name: 'car', type: 'category' };
    if (nameLower.includes('шиномонтаж')) return { name: 'car', type: 'category' };
    
    // Безопасность
    if (nameLower.includes('охрана') || nameLower.includes('безопасность')) return { name: 'security', type: 'category' };
    if (nameLower.includes('сигнализация')) return { name: 'alarm', type: 'category' };
    if (nameLower.includes('видеонаблюдение')) return { name: 'camera-security', type: 'category' };
    
    // IT и технологии
    if (nameLower.includes('программист') || nameLower.includes('разработка')) return { name: 'computer', type: 'category' };
    if (nameLower.includes('сайт') || nameLower.includes('веб')) return { name: 'internet', type: 'category' };
    if (nameLower.includes('дизайн')) return { name: 'design', type: 'category' };
    if (nameLower.includes('интернет') || nameLower.includes('wifi')) return { name: 'internet', type: 'category' };
    
    // Финансы и бизнес
    if (nameLower.includes('бухгалтер') || nameLower.includes('финансы')) return { name: 'finance', type: 'category' };
    if (nameLower.includes('юрист') || nameLower.includes('право')) return { name: 'legal', type: 'category' };
    if (nameLower.includes('консультант')) return { name: 'consulting', type: 'category' };
    if (nameLower.includes('маркетинг')) return { name: 'marketing', type: 'category' };
    
    // Праздники и мероприятия
    if (nameLower.includes('праздник') || nameLower.includes('мероприятие')) return { name: 'party', type: 'category' };
    if (nameLower.includes('свадьба')) return { name: 'wedding', type: 'category' };
    if (nameLower.includes('день рождения')) return { name: 'gift', type: 'category' };
    if (nameLower.includes('корпоратив')) return { name: 'party', type: 'category' };
    
    // Иконка по умолчанию
    return { name: 'repair', type: 'category' };
  };

  // Обработчик нажатия на кнопку фильтра
  const handleFilterPress = () => {
    // Здесь будет логика открытия фильтров
    console.log('Открыть фильтры');
  };

  // Компонент для отображения пустого списка
  const renderEmptyList = () => {
    if (isLoading) return null;
    
    return (
      <Animated.View 
        entering={FadeIn.delay(200)}
        style={styles.emptyContainer}
      >
        <MaterialCommunityIcons 
          name="emoticon-sad-outline" 
          size={64} 
          color={appTheme.colors.primary} 
        />
        <Text style={styles.emptyTitleText}>Услуги не найдены</Text>
        <Text style={styles.emptySubtitleText}>
          Попробуйте изменить параметры поиска
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Хедер с элементами управления */}
      <LinearGradient
        colors={[appTheme.colors.primary, appTheme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView style={styles.headerContent}>
          <View style={styles.headerControls}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons 
                name="chevron-left" 
                size={28} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>{categoryName}</Text>
              <Text style={styles.headerSubtitle}>Выберите услугу</Text>
            </View>
            
            <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
              <MaterialCommunityIcons name="filter-variant" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Белый блок с услугами и закругленными углами */}
      <View style={styles.servicesContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={appTheme.colors.primary} />
            <Text style={styles.loadingText}>Загрузка услуг...</Text>
          </View>
        ) : (
          <FlatList
            data={services}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyList}
            renderItem={({ item, index }) => (
              <ServiceCard
                service={item}
                onPress={() => handleServicePress(item)}
                isSelected={selectedService === item.id}
                index={index}
              />
            )}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.secondary,
  },
  
  // Стили для хедера
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    justifyContent: 'center',
    minHeight: 100,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
    textAlign: 'center',
  },
  
  listContainer: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  
  // Обновленные стили для карточек услуг
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 88,
  },
  selectedServiceCard: {
    backgroundColor: appTheme.colors.darkBlue,
    shadowColor: appTheme.colors.darkBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    transform: [{ scale: 1.02 }],
  },
  serviceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(149, 193, 31, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedServiceIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  serviceTextContainer: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: appTheme.colors.text,
    marginBottom: 6,
    lineHeight: 24,
  },
  selectedServiceText: {
    color: '#FFFFFF',
  },
  servicePrice: {
    fontSize: 16,
    color: appTheme.colors.textSecondary,
    fontWeight: '500',
  },
  selectedServicePrice: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  selectedIndicator: {
    marginLeft: 12,
  },
  
  // Стили для загрузки и пустого состояния
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: appTheme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: appTheme.colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitleText: {
    fontSize: 16,
    color: appTheme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  servicesContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -40,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingBottom: 20,
  },
});

export default ServiceListScreen; 