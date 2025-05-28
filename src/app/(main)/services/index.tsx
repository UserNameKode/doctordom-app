import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, StatusBar, Platform } from 'react-native';
import { Text, List, Searchbar, ActivityIndicator, Divider, Chip } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BetterIcon from '../../../components/BetterIcon';

import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { ServiceStackParamList } from './_layout';
import { getCategories, getServices } from '../../../lib/supabase';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import appTheme from '../../../constants/theme';

// Интерфейс для категории услуг
interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  servicesCount: number;
  subCategories?: SubCategory[];
}

// Интерфейс для подкатегории услуг
interface SubCategory {
  id: string;
  name: string;
  servicesCount: number;
}

// Интерфейс для услуги
interface Service {
  id: string;
  name: string;
  category_id: string;
  price: number;
  description?: string;
}

type ServiceCategoriesNavigationProp = StackNavigationProp<ServiceStackParamList, 'Index'>;

/**
 * Функция для правильного склонения слова "услуга"
 */
const getServicesCountText = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'услуг';
  }

  if (lastDigit === 1) {
    return 'услуга';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'услуги';
  }

  return 'услуг';
};

// Компонент для органичной волны
const WaveShape = ({ height = 120, color1 = '#95C11F', color2 = '#FFFFFF' }) => {
  const { width } = Dimensions.get('window');
  
  return (
    <Svg height={height} width={width} style={{ position: 'absolute', bottom: 0 }}>
      <Defs>
        <SvgLinearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={color1} />
          <Stop offset="100%" stopColor={color2} />
        </SvgLinearGradient>
      </Defs>
      <Path
        d={`M0,${height * 0.3} Q${width * 0.25},${height * 0.1} ${width * 0.5},${height * 0.4} T${width},${height * 0.2} L${width},${height} L0,${height} Z`}
        fill="url(#waveGradient)"
      />
    </Svg>
  );
};

/**
 * Экран категорий услуг
 */
const ServiceCategoriesScreen = () => {
  const navigation = useNavigation<ServiceCategoriesNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ServiceCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Эффект для загрузки категорий при монтировании компонента
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        // Получаем категории из Supabase
        const { data: categoriesData, error: categoriesError } = await getCategories();
        
        if (categoriesError) {
          throw categoriesError;
        }
        
        if (!categoriesData || categoriesData.length === 0) {
          setCategories([]);
          setFilteredCategories([]);
          return;
        }
        
        // Получаем услуги для подсчета их количества в каждой категории
        const { data: servicesData, error: servicesError } = await getServices();
        
        if (servicesError) {
          throw servicesError;
        }
        
        // Сохраняем все услуги для поиска
        if (servicesData) {
          setServices(servicesData);
        }
        
        // Преобразуем данные в формат, необходимый для отображения
        const formattedCategories: ServiceCategory[] = categoriesData.map(category => {
          // Подсчитываем количество услуг в категории
          const categoryServices = servicesData?.filter(service => service.category_id === category.id) || [];
          
          
          return {
            id: category.id,
            name: category.name,
            icon: category.icon || 'window-open-variant', // Меняем иконку по умолчанию на окно
            description: category.description || `Услуги категории ${category.name}`,
            servicesCount: categoryServices.length,
            // В текущей структуре БД подкатегории не предусмотрены,
            // но можно добавить их в будущем
          };
        });
        
        setCategories(formattedCategories);
        setFilteredCategories(formattedCategories);
      } catch (error) {
        console.error('Ошибка при загрузке категорий услуг:', error);
        // В случае ошибки используем пустой массив
        setCategories([]);
        setFilteredCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Обработчик изменения поискового запроса
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredCategories(categories);
      setFilteredServices([]);
      setIsSearchMode(false);
    } else {
      setIsSearchMode(true);
      
      // Фильтруем категории
      const filteredCats = categories.filter(category => 
        category.name.toLowerCase().includes(query.toLowerCase()) || 
        category.description.toLowerCase().includes(query.toLowerCase()) ||
        category.subCategories?.some(sub => sub.name.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredCategories(filteredCats);
      
      // Фильтруем услуги
      const filteredServs = services.filter(service => 
        service.name.toLowerCase().includes(query.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredServices(filteredServs);
    }
  };

  // Обработчик нажатия на услугу
  const handleServicePress = (service: Service) => {
    navigation.navigate('Detail', {
      serviceId: service.id,
    });
  };

  // Обработчик нажатия на категорию
  const handleCategoryPress = (category: ServiceCategory) => {
    if (category.subCategories && category.subCategories.length > 0) {
      // Если есть подкатегории, раскрываем/скрываем список
      toggleCategoryExpansion(category.id);
    } else {
      // Если нет подкатегорий, переходим к списку услуг
      navigation.navigate('List', {
        categoryId: category.id,
        categoryName: category.name,
      });
    }
  };

  // Обработчик нажатия на подкатегорию
  const handleSubCategoryPress = (categoryId: string, subCategory: SubCategory) => {
    navigation.navigate('List', {
      categoryId,
      subCategoryId: subCategory.id,
      categoryName: subCategory.name,
    });
  };

  // Переключение состояния раскрытия категории
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Проверка, раскрыта ли категория
  const isCategoryExpanded = (categoryId: string) => {
    return expandedCategories.includes(categoryId);
  };

  // Функция для получения иконки категории
  const getCategoryIcon = (categoryName: string) => {
    const nameLower = categoryName.toLowerCase();
    
    // Используем разнообразные и интересные иконки
    // ВАЖНО: Более специфичные условия должны быть выше общих!
    if (nameLower.includes('окна') || nameLower.includes('стекла') || nameLower.includes('ремонт окон')) return { name: 'window-repair', type: 'category' };
    if (nameLower.includes('москитные сетки') || nameLower.includes('москитная сетка')) return { name: 'mosquito-nets', type: 'category' };
    if (nameLower.includes('вентиляция') || nameLower.includes('кондиционеры') || nameLower.includes('вентиляция и кондиционеры')) return { name: 'ventilation', type: 'category' };
    if (nameLower.includes('ремонт бытовой техники') || nameLower.includes('бытовой техники')) return { name: 'appliance-repair', type: 'category' };
    if (nameLower.includes('ремонт техники')) return { name: 'computer', type: 'category' };
    if (nameLower.includes('ремонт') || nameLower.includes('строительство')) return { name: 'construction', type: 'category' };
    if (nameLower.includes('уборка') || nameLower.includes('клининг')) return { name: 'cleaning', type: 'category' };
    if (nameLower.includes('сантехник') || nameLower.includes('водопровод')) return { name: 'plumbing', type: 'category' };
    if (nameLower.includes('электрик') || nameLower.includes('электричество')) return { name: 'electrical', type: 'category' };
    if (nameLower.includes('покраска') || nameLower.includes('малярные')) return { name: 'painting', type: 'category' };
    if (nameLower.includes('мебель') || nameLower.includes('сборка')) return { name: 'furniture', type: 'category' };
    if (nameLower.includes('техника')) return { name: 'computer', type: 'category' };
    if (nameLower.includes('автомобиль') || nameLower.includes('авто')) return { name: 'car', type: 'category' };
    if (nameLower.includes('одежда') || nameLower.includes('текстиль')) return { name: 'fashion', type: 'category' };
    if (nameLower.includes('красота') || nameLower.includes('парикмахер')) return { name: 'beauty', type: 'category' };
    if (nameLower.includes('массаж') || nameLower.includes('спа')) return { name: 'massage', type: 'category' };
    if (nameLower.includes('фитнес') || nameLower.includes('спорт')) return { name: 'fitness', type: 'category' };
    if (nameLower.includes('фото') || nameLower.includes('съемка')) return { name: 'photo', type: 'category' };
    if (nameLower.includes('видео') || nameLower.includes('монтаж')) return { name: 'video', type: 'category' };
    if (nameLower.includes('музыка') || nameLower.includes('звук')) return { name: 'music', type: 'category' };
    if (nameLower.includes('обучение') || nameLower.includes('образование')) return { name: 'education', type: 'category' };
    if (nameLower.includes('язык') || nameLower.includes('переводы')) return { name: 'language', type: 'category' };
    if (nameLower.includes('дом') || nameLower.includes('квартира')) return { name: 'lucide--house', type: 'category' };
    if (nameLower.includes('двери') || nameLower.includes('замки')) return { name: 'doors', type: 'category' };
    if (nameLower.includes('ключи')) return { name: 'lucide--key-round', type: 'category' };
    if (nameLower.includes('кондиционер') || nameLower.includes('климат')) return { name: 'lucide--snowflake', type: 'category' };
    if (nameLower.includes('грузоперевозки') || nameLower.includes('переезд')) return { name: 'delivery', type: 'category' };
    if (nameLower.includes('ванна') || nameLower.includes('душ')) return { name: 'lucide--bath', type: 'category' };
    if (nameLower.includes('безопасность') || nameLower.includes('охрана')) return { name: 'security', type: 'category' };
    if (nameLower.includes('животные') || nameLower.includes('питомцы')) return { name: 'pet', type: 'category' };
    if (nameLower.includes('еда') || nameLower.includes('кулинария')) return { name: 'food', type: 'category' };
    if (nameLower.includes('торт') || nameLower.includes('выпечка')) return { name: 'cake', type: 'category' };
    if (nameLower.includes('кофе') || nameLower.includes('бариста')) return { name: 'coffee', type: 'category' };
    if (nameLower.includes('пицца')) return { name: 'pizza', type: 'category' };
    if (nameLower.includes('подарки') || nameLower.includes('сувениры')) return { name: 'gift', type: 'category' };
    if (nameLower.includes('праздник') || nameLower.includes('мероприятие')) return { name: 'party', type: 'category' };
    if (nameLower.includes('свадьба')) return { name: 'wedding', type: 'category' };
    if (nameLower.includes('дети') || nameLower.includes('няня')) return { name: 'baby', type: 'category' };
    if (nameLower.includes('пожилые') || nameLower.includes('сиделка')) return { name: 'elderly', type: 'category' };
    if (nameLower.includes('медицина') || nameLower.includes('врач')) return { name: 'medical', type: 'category' };
    if (nameLower.includes('стоматолог') || nameLower.includes('зубы')) return { name: 'dental', type: 'category' };
    if (nameLower.includes('йога') || nameLower.includes('медитация')) return { name: 'yoga', type: 'category' };
    if (nameLower.includes('плавание') || nameLower.includes('бассейн')) return { name: 'swimming', type: 'category' };
    if (nameLower.includes('теннис')) return { name: 'tennis', type: 'category' };
    if (nameLower.includes('футбол')) return { name: 'football', type: 'category' };
    if (nameLower.includes('баскетбол')) return { name: 'basketball', type: 'category' };
    if (nameLower.includes('гольф')) return { name: 'golf', type: 'category' };
    if (nameLower.includes('рыбалка')) return { name: 'fishing', type: 'category' };
    if (nameLower.includes('туризм') || nameLower.includes('путешествия')) return { name: 'travel', type: 'category' };
    if (nameLower.includes('отель') || nameLower.includes('гостиница')) return { name: 'hotel', type: 'category' };
    if (nameLower.includes('ресторан') || nameLower.includes('кафе')) return { name: 'restaurant', type: 'category' };
    if (nameLower.includes('покупки') || nameLower.includes('шоппинг')) return { name: 'shopping', type: 'category' };
    if (nameLower.includes('украшения') || nameLower.includes('ювелир')) return { name: 'jewelry', type: 'category' };
    if (nameLower.includes('часы')) return { name: 'watch', type: 'category' };
    if (nameLower.includes('очки') || nameLower.includes('линзы')) return { name: 'glasses', type: 'category' };
    if (nameLower.includes('книги') || nameLower.includes('литература')) return { name: 'book', type: 'category' };
    if (nameLower.includes('искусство') || nameLower.includes('живопись')) return { name: 'art', type: 'category' };
    if (nameLower.includes('дизайн')) return { name: 'design', type: 'category' };
    if (nameLower.includes('архитектура')) return { name: 'architecture', type: 'category' };
    if (nameLower.includes('инженерия')) return { name: 'engineering', type: 'category' };
    if (nameLower.includes('наука')) return { name: 'science', type: 'category' };
    if (nameLower.includes('финансы') || nameLower.includes('бухгалтерия')) return { name: 'finance', type: 'category' };
    if (nameLower.includes('банк')) return { name: 'bank', type: 'category' };
    if (nameLower.includes('страхование')) return { name: 'insurance', type: 'category' };
    if (nameLower.includes('юридические') || nameLower.includes('право')) return { name: 'legal', type: 'category' };
    if (nameLower.includes('консультации')) return { name: 'consulting', type: 'category' };
    if (nameLower.includes('маркетинг') || nameLower.includes('реклама')) return { name: 'marketing', type: 'category' };
    if (nameLower.includes('продажи')) return { name: 'sales', type: 'category' };
    if (nameLower.includes('поддержка') || nameLower.includes('помощь')) return { name: 'support', type: 'category' };
    if (nameLower.includes('логистика')) return { name: 'logistics', type: 'category' };
    if (nameLower.includes('склад')) return { name: 'warehouse', type: 'category' };
    if (nameLower.includes('производство')) return { name: 'factory', type: 'category' };
    if (nameLower.includes('интернет') || nameLower.includes('wifi')) return { name: 'internet', type: 'category' };
    if (nameLower.includes('сеть') || nameLower.includes('network')) return { name: 'network', type: 'category' };
    if (nameLower.includes('сервер')) return { name: 'server', type: 'category' };
    if (nameLower.includes('база данных')) return { name: 'database', type: 'category' };
    if (nameLower.includes('резервное копирование')) return { name: 'backup', type: 'category' };
    if (nameLower.includes('облако') || nameLower.includes('cloud')) return { name: 'cloud', type: 'category' };
    if (nameLower.includes('мобильные') || nameLower.includes('телефон')) return { name: 'mobile', type: 'category' };
    if (nameLower.includes('планшет')) return { name: 'tablet', type: 'category' };
    if (nameLower.includes('игры') || nameLower.includes('геймдев')) return { name: 'gaming', type: 'category' };
    if (nameLower.includes('vr') || nameLower.includes('виртуальная реальность')) return { name: 'vr', type: 'category' };
    if (nameLower.includes('ai') || nameLower.includes('искусственный интеллект')) return { name: 'ai', type: 'category' };
    if (nameLower.includes('блокчейн')) return { name: 'blockchain', type: 'category' };
    if (nameLower.includes('криптовалюта') || nameLower.includes('биткоин')) return { name: 'crypto', type: 'category' };
    
    // Иконка по умолчанию
    return { name: 'repair', type: 'category' };
  };

  // Компонент для отображения пустого списка
  const renderEmptyList = () => {
    if (isLoading) return null;
    
          return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="emoticon-sad-outline" size={64} color={appTheme.colors.disabled} />
          <Text style={styles.emptyText}>Категории не найдены</Text>
          <Text style={styles.emptySubtext}>Попробуйте изменить поисковый запрос</Text>
        </View>
      );
  };

  // Рендер элемента услуги
  const renderServiceItem = ({ item }: { item: Service }) => {
    // Находим категорию для этой услуги
    const category = categories.find(cat => cat.id === item.category_id);
    
    return (
      <TouchableOpacity onPress={() => handleServicePress(item)}>
        <View style={styles.serviceItem}>
          <View style={styles.serviceContent}>
            <Text style={styles.serviceName}>{item.name}</Text>
            {category && (
              <Chip icon="tag" style={styles.categoryChip}>
                {category.name}
              </Chip>
            )}
            <Text style={styles.servicePrice}>{item.price} ₽</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={appTheme.colors.primary} />
        </View>
        <Divider />
      </TouchableOpacity>
    );
  };

  // Рендер элемента категории с новым дизайном
  const renderCategoryItem = ({ item }: { item: ServiceCategory }) => {
    const hasSubCategories = item.subCategories && item.subCategories.length > 0;
    const isExpanded = isCategoryExpanded(item.id);
    const categoryIcon = getCategoryIcon(item.name);
    
    return (
      <View style={styles.categoryItemWrapper}>
        <TouchableOpacity
          style={styles.modernCategoryItem}
          onPress={() => handleCategoryPress(item)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F8F9FA']}
            style={styles.categoryGradient}
          >
            <View style={styles.categoryIconContainer}>
              <View style={styles.iconCircle}>
                <BetterIcon 
                  name={categoryIcon.name} 
                  type={categoryIcon.type as any}
                  size={28} 
                  color={appTheme.colors.primary} 
                />
              </View>
            </View>
            
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>{item.name}</Text>
            </View>
            
            <View style={styles.categoryArrow}>
              <MaterialCommunityIcons 
                name={hasSubCategories ? (isExpanded ? 'chevron-up' : 'chevron-down') : 'chevron-right'} 
                size={24} 
                color={appTheme.colors.textSecondary} 
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
        
        {hasSubCategories && isExpanded && (
          <View style={styles.subCategoriesContainer}>
            {item.subCategories?.map(subCategory => (
              <TouchableOpacity
                key={subCategory.id}
                style={styles.subCategoryItem}
                onPress={() => handleSubCategoryPress(item.id, subCategory)}
              >
                <View style={styles.subCategoryContent}>
                  <Text style={styles.subCategoryTitle}>{subCategory.name}</Text>
                </View>
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={20} 
                  color={appTheme.colors.textSecondary} 
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* Баннер с логотипом */}
      <View style={styles.bannerContainer}>
        <Image 
          source={require('../../../../assets/images/banners/Ya8sKX8S6rk.jpg')} 
          style={styles.bannerImage}
          resizeMode="contain"
        />
      </View>
      
      {/* Строка поиска (перекрывает часть баннера) */}
      <View style={styles.searchbarContainer}>
        <Searchbar
          placeholder="Поиск услуг и категорий"
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={appTheme.colors.primary}
        />
      </View>

      {/* Контент с новым дизайном */}
      <View style={styles.contentSection}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={appTheme.colors.primary} />
            <Text style={styles.loadingText}>Загрузка категорий...</Text>
          </View>
        ) : isSearchMode && filteredServices.length > 0 ? (
          <>
            {filteredCategories.length > 0 && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Категории</Text>
              </View>
            )}
            
            {filteredCategories.length > 0 && (
              <FlatList
                data={filteredCategories}
                keyExtractor={item => `cat-${item.id}`}
                renderItem={renderCategoryItem}
                ListEmptyComponent={null}
                contentContainerStyle={styles.listContent}
                scrollEnabled={false}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
              />
            )}
            
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Услуги</Text>
            </View>
            
            <FlatList
              data={filteredServices}
              keyExtractor={item => `service-${item.id}`}
              renderItem={renderServiceItem}
              ListEmptyComponent={null}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <FlatList
            data={filteredCategories}
            keyExtractor={item => item.id}
            renderItem={renderCategoryItem}
            ListEmptyComponent={renderEmptyList}
            contentContainerStyle={styles.listContent}
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
    backgroundColor: '#FFFFFF',
  },
  
  // Стили для баннера
  bannerContainer: {
    width: '100%',
    height: 300,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginTop: 0,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  
  // Стили для поиска
  searchbarContainer: {
    position: 'relative',
    marginTop: -55,
    zIndex: 1,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchbar: {
    elevation: 5,
    backgroundColor: '#fff',
    borderRadius: 25,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // Новые стили для контента
  contentSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 24,
  },
  
  // Новые стили для категорий
  categoryItemWrapper: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  modernCategoryItem: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  categoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 80,
  },
  categoryIconContainer: {
    marginRight: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(149, 193, 31, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: appTheme.colors.text,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    fontWeight: '400',
  },
  categoryArrow: {
    marginLeft: 12,
  },
  
  // Стили для подкатегорий
  subCategoriesContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginTop: 8,
    paddingVertical: 8,
  },
  subCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  subCategoryContent: {
    flex: 1,
  },
  subCategoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: appTheme.colors.text,
    marginBottom: 2,
  },
  subCategoryCount: {
    fontSize: 13,
    color: appTheme.colors.textSecondary,
  },
  
  // Стили для секций
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: appTheme.colors.text,
  },
  
  // Обновленные общие стили
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
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: appTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    textAlign: 'center',
  },
  
  // Стили для услуг в поиске
  serviceItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceContent: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: appTheme.colors.text,
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 15,
    color: appTheme.colors.primary,
    fontWeight: '600',
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(149, 193, 31, 0.1)',
    marginTop: 8,
  },
  

  pageHeaderContainer: {
    display: 'none',
  },
  pageHeaderTitle: {
    display: 'none',
  },
  headerContainer: {
    display: 'none',
  },
  logoTextContainer: {
    display: 'none',
  },
  logoWithIconContainer: {
    display: 'none',
  },
  logoImageContainer: {
    display: 'none',
  },
  greenCircleLogo: {
    display: 'none',
  },
  iconContainer: {
    display: 'none',
  },
  circleText: {
    display: 'none',
  },
  textContainer: {
    display: 'none',
  },
  headerTitleGreen: {
    display: 'none',
  },
  categoriesList: {
    display: 'none',
  },
  categoryItem: {
    display: 'none',
  },
  subCategoryIconPlaceholder: {
    display: 'none',
  },
  searchResultsHeader: {
    display: 'none',
  },
  searchResultsTitle: {
    display: 'none',
  },
});

export default ServiceCategoriesScreen;