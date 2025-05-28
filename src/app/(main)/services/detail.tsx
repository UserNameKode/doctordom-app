import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { Text, Button, Card, Divider, Chip, Avatar, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import appTheme from '../../../constants/theme';
import { ServiceStackParamList } from './_layout';
import { getServices, getSpecialists } from '../../../lib/supabase';

// Типы для детальной информации об услуге
interface ServiceDetail {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  price: string;
  unit: string;
  rating: number;
  reviewsCount: number;
  imageUrl: string | null;
  categoryId: string;
  specialists: Specialist[];
  features: string[];
}

interface Specialist {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  experience: number;
  imageUrl: string | null;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

type ServiceDetailScreenRouteProp = RouteProp<ServiceStackParamList, 'Detail'>;
type ServiceDetailScreenNavigationProp = StackNavigationProp<ServiceStackParamList, 'Detail'>;

/**
 * Функция для правильного склонения слова "год"
 */
const getExperienceText = (years: number): string => {
  const lastDigit = years % 10;
  const lastTwoDigits = years % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'лет';
  }

  if (lastDigit === 1) {
    return 'год';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'года';
  }

  return 'лет';
};

/**
 * Экран детальной информации об услуге
 */
const ServiceDetailScreen = () => {
  const route = useRoute<ServiceDetailScreenRouteProp>();
  const navigation = useNavigation<ServiceDetailScreenNavigationProp>();
  const { serviceId } = route.params;
  

  
  const [isLoading, setIsLoading] = useState(true);
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);

  // Эффект для загрузки данных услуги
  useEffect(() => {
    const loadServiceDetails = async () => {
      setIsLoading(true);
      try {
        // Получаем услугу по ID из Supabase
        const { data: servicesData, error: servicesError } = await getServices();
        
        if (servicesError) {
          throw servicesError;
        }
        
        // Находим услугу по ID
        const serviceData = servicesData?.find(s => s.id === serviceId);
        
        if (!serviceData) {
          console.error('Услуга не найдена');
          return;
        }
        
        // Получаем специалистов для этой услуги
        const { data: specialistsData, error: specialistsError } = await getSpecialists(serviceId);
        
        if (specialistsError) {
          console.error('Ошибка при загрузке специалистов:', specialistsError);
        }
        
        // Преобразуем данные в формат, необходимый для отображения
        const formattedService: ServiceDetail = {
          id: serviceData.id,
          name: serviceData.name,
          description: serviceData.description || '',
          fullDescription: serviceData.description || 'Подробное описание отсутствует',
          price: serviceData.price_from?.toString() || '0',
          unit: serviceData.unit || 'услуга',
          rating: 0, // В текущей схеме БД нет рейтинга
          reviewsCount: 0, // В текущей схеме БД нет счетчика отзывов
          imageUrl: null, // В текущей схеме БД нет изображений
          categoryId: serviceData.category_id,
          specialists: specialistsData?.map(specialist => ({
            id: specialist.id,
            name: specialist.name,
            rating: specialist.rating || 0,
            reviewsCount: 0, // В текущей схеме БД нет счетчика отзывов
            experience: specialist.experience_years || 0,
            imageUrl: specialist.photo_url || null,
          })) || [],
          features: [], // В текущей схеме БД нет особенностей услуги
        };
        
        setService(formattedService);
        // Пока у нас нет реальных отзывов, используем пустой массив
        setReviews([]);
      } catch (error) {
        console.error('Ошибка при загрузке данных услуги:', error);
        // В случае ошибки используем моковые данные как запасной вариант
        const serviceData = mockServices.find(s => s.id === serviceId);
        if (serviceData) {
          setService(serviceData);
          // Загружаем отзывы
          setReviews(mockReviews.filter(review => review.serviceId === serviceId));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadServiceDetails();
  }, [serviceId]);

  // Обработчик выбора специалиста
  const handleSpecialistSelect = (specialist: Specialist) => {
    setSelectedSpecialist(specialist);
    Alert.alert(
      'Специалист выбран',
      `Вы выбрали специалиста: ${specialist.name}`,
      [{ text: 'OK' }]
    );
  };

  // Обработчик нажатия на кнопку заказа
  const handleOrderPress = () => {
    if (!service) return;
    
    // Проверяем, выбран ли специалист
    if (selectedSpecialist) {
      // Переходим на экран выбора адреса
      navigation.navigate('OrderAddress', {
        serviceId: service.id,
        specialistId: selectedSpecialist.id
      });
    } else {
      Alert.alert(
        'Выберите специалиста',
        'Пожалуйста, выберите специалиста перед оформлением заказа',
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Компонент карточки специалиста
   */
  const SpecialistCard = ({ specialist }: { specialist: Specialist }) => {
    const isSelected = selectedSpecialist?.id === specialist.id;
    
    return (
      <Card 
        style={[
          styles.specialistCard,
          isSelected && styles.selectedSpecialistCard
        ]}
        onPress={() => handleSpecialistSelect(specialist)}
      >
        <Card.Content style={styles.specialistCardContent}>
          {specialist.imageUrl ? (
            <Avatar.Image size={50} source={{ uri: specialist.imageUrl }} />
          ) : (
            <Avatar.Text size={50} label={specialist.name.substring(0, 2).toUpperCase()} />
          )}
          <View style={styles.specialistInfo}>
            <Text variant="titleMedium">{specialist.name}</Text>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={16} color={appTheme.colors.warning} />
              <Text variant="bodyMedium" style={styles.ratingText}>
                {specialist.rating.toFixed(1)} ({specialist.reviewsCount})
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.experienceText}>
              Опыт работы: {specialist.experience} {getExperienceText(specialist.experience)}
            </Text>
          </View>
          {isSelected && (
            <MaterialCommunityIcons 
              name="check-circle" 
              size={24} 
              color={appTheme.colors.primary} 
              style={styles.selectedIcon}
            />
          )}
        </Card.Content>
      </Card>
    );
  };

  // Заглушка для данных услуг
  const mockServices: ServiceDetail[] = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Ремонт стиральной машины',
      description: 'Диагностика и ремонт стиральных машин любых марок',
      fullDescription: 'Профессиональный ремонт стиральных машин любых марок и моделей. Наши специалисты проведут диагностику, выявят причину неисправности и выполнят ремонт на дому. Мы используем только оригинальные запчасти и даем гарантию на все виды работ.',
      price: '1500',
      unit: 'услуга',
      rating: 4.8,
      reviewsCount: 124,
      imageUrl: 'https://placehold.co/400x200',
      categoryId: '00000000-0000-0000-0000-000000000001',
      specialists: [
        {
          id: '00000000-0000-0000-0000-000000000011',
          name: 'Иванов Иван',
          rating: 4.9,
          reviewsCount: 87,
          experience: 5,
          imageUrl: 'https://placehold.co/50x50',
        },
        {
          id: '00000000-0000-0000-0000-000000000012',
          name: 'Петров Петр',
          rating: 4.7,
          reviewsCount: 62,
          experience: 3,
          imageUrl: 'https://placehold.co/50x50',
        },
      ],
      features: [
        'Выезд на дом',
        'Гарантия 6 месяцев',
        'Оригинальные запчасти',
        'Работаем без выходных',
      ],
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Ремонт холодильника',
      description: 'Диагностика и ремонт холодильников на дому',
      fullDescription: 'Качественный ремонт холодильников всех марок и моделей с выездом на дом. Мы устраняем любые неисправности: от замены уплотнительной резинки до ремонта компрессора. Все работы выполняются с гарантией качества.',
      price: '2000',
      unit: 'услуга',
      rating: 4.6,
      reviewsCount: 98,
      imageUrl: 'https://placehold.co/400x200',
      categoryId: '00000000-0000-0000-0000-000000000001',
      specialists: [
        {
          id: '00000000-0000-0000-0000-000000000013',
          name: 'Сидоров Алексей',
          rating: 4.8,
          reviewsCount: 54,
          experience: 7,
          imageUrl: 'https://placehold.co/50x50',
        },
      ],
      features: [
        'Выезд на дом',
        'Гарантия 12 месяцев',
        'Срочный ремонт',
        'Работаем без выходных',
      ],
    },
  ];

  // Заглушка для отзывов
  const mockReviews: (Review & { serviceId: string })[] = [
    {
      id: '00000000-0000-0000-0000-000000000021',
      serviceId: '00000000-0000-0000-0000-000000000001',
      userName: 'Анна М.',
      rating: 5,
      comment: 'Отличный сервис! Мастер приехал вовремя, быстро нашел причину поломки и устранил ее. Стиральная машина работает как новая.',
      date: '15.05.2023',
    },
    {
      id: '00000000-0000-0000-0000-000000000022',
      serviceId: '00000000-0000-0000-0000-000000000001',
      userName: 'Дмитрий К.',
      rating: 4,
      comment: 'Хорошая работа, но пришлось ждать запчасти несколько дней. В целом доволен результатом.',
      date: '03.06.2023',
    },
    {
      id: '00000000-0000-0000-0000-000000000023',
      serviceId: '00000000-0000-0000-0000-000000000002',
      userName: 'Елена С.',
      rating: 5,
      comment: 'Очень быстро отреагировали на заявку. Мастер приехал в тот же день и починил холодильник за час. Рекомендую!',
      date: '22.05.2023',
    },
  ];

  // Если данные загружаются, показываем индикатор загрузки
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={appTheme.colors.primary} />
        <Text style={styles.loadingText}>Загрузка информации об услуге...</Text>
      </View>
    );
  }

  // Если услуга не найдена
  if (!service) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={appTheme.colors.error} />
        <Text style={styles.errorText}>Услуга не найдена</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Вернуться назад
        </Button>
      </View>
    );
  }

  return (
    <View 
      style={[
        styles.container, 
        Platform.OS === 'ios' ? { paddingTop: 60 } : {}
      ]}
    >
      <ScrollView contentContainerStyle={[styles.scrollContent, Platform.OS === 'ios' ? { paddingTop: 20 } : {}]}>
        {/* Изображение услуги */}
        {service.imageUrl && (
          <Image source={{ uri: service.imageUrl }} style={styles.serviceImage} />
        )}

        {/* Основная информация */}
        <View style={styles.mainInfoContainer}>
          <Text variant="headlineSmall" style={styles.serviceName}>
            {service.name}
          </Text>
          
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={20} color={appTheme.colors.warning} />
            <Text variant="titleMedium" style={styles.ratingText}>
              {service.rating.toFixed(1)}
            </Text>
            <Text variant="bodyMedium" style={styles.reviewsCount}>
              ({service.reviewsCount} {service.reviewsCount === 1 ? 'отзыв' : 
                service.reviewsCount < 5 ? 'отзыва' : 'отзывов'})
            </Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text variant="headlineSmall" style={styles.priceText}>
              от {service.price} ₽
            </Text>
            <Text variant="bodyMedium" style={styles.unitText}>
              / {service.unit}
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Описание услуги */}
        <Card style={styles.descriptionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Описание
            </Text>
            <Text variant="bodyMedium" style={styles.descriptionText}>
              {service.fullDescription}
            </Text>
          </Card.Content>
        </Card>

        {/* Особенности услуги */}
        {service.features.length > 0 && (
          <Card style={styles.featuresCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Особенности
              </Text>
              <View style={styles.featuresList}>
                {service.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <MaterialCommunityIcons name="check-circle" size={20} color={appTheme.colors.success} />
                    <Text variant="bodyMedium" style={styles.featureText}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Специалисты */}
        {service.specialists.length > 0 && (
          <Card style={styles.specialistsCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Выберите специалиста
              </Text>
              {service.specialists.map(specialist => (
                <SpecialistCard key={specialist.id} specialist={specialist} />
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Отзывы */}
        {reviews.length > 0 && (
          <Card style={styles.reviewsCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Отзывы клиентов
              </Text>
              {reviews.slice(0, 2).map(review => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text variant="titleSmall">{review.userName}</Text>
                    <Text variant="bodySmall" style={styles.reviewDate}>
                      {review.date}
                    </Text>
                  </View>
                  <View style={styles.reviewRating}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <MaterialCommunityIcons
                        key={i}
                        name={i < review.rating ? "star" : "star-outline"}
                        size={16}
                        color={appTheme.colors.warning}
                      />
                    ))}
                  </View>
                  <Text variant="bodyMedium" style={styles.reviewComment}>
                    {review.comment}
                  </Text>
                  {reviews.indexOf(review) < reviews.length - 1 && (
                    <Divider style={styles.reviewDivider} />
                  )}
                </View>
              ))}
              {reviews.length > 2 && (
                <Button
                  mode="text"
                  onPress={() => Alert.alert('Информация', 'Функция просмотра всех отзывов будет доступна в следующих версиях')}
                  style={styles.allReviewsButton}
                >
                  Показать все отзывы ({reviews.length})
                </Button>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Кнопка заказа */}
      <View style={styles.orderButtonContainer}>
        <Button
          mode="contained"
          onPress={handleOrderPress}
          style={styles.orderButton}
          labelStyle={styles.orderButtonLabel}
        >
          {selectedSpecialist ? `Заказать у ${selectedSpecialist.name}` : 'Заказать услугу'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  scrollContent: {
    paddingBottom: 80, // Для кнопки заказа внизу
  },
  serviceImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  mainInfoContainer: {
    padding: appTheme.spacing.m,
  },
  serviceName: {
    fontWeight: 'bold',
    marginBottom: appTheme.spacing.s,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: appTheme.spacing.s,
  },
  ratingText: {
    marginLeft: appTheme.spacing.xs,
    fontWeight: 'bold',
  },
  reviewsCount: {
    marginLeft: appTheme.spacing.xs,
    color: appTheme.colors.textSecondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontWeight: 'bold',
  },
  unitText: {
    marginLeft: appTheme.spacing.xs,
    color: appTheme.colors.textSecondary,
  },
  divider: {
    marginVertical: appTheme.spacing.s,
  },
  descriptionCard: {
    margin: appTheme.spacing.m,
    marginTop: 0,
    elevation: 2,
  },
  featuresCard: {
    margin: appTheme.spacing.m,
    marginTop: 0,
    elevation: 2,
  },
  specialistsCard: {
    margin: appTheme.spacing.m,
    marginTop: 0,
    elevation: 2,
  },
  reviewsCard: {
    margin: appTheme.spacing.m,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: appTheme.spacing.m,
  },
  descriptionText: {
    lineHeight: 22,
  },
  featuresList: {
    marginTop: appTheme.spacing.s,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: appTheme.spacing.s,
  },
  featureText: {
    marginLeft: appTheme.spacing.s,
  },
  specialistCard: {
    marginBottom: appTheme.spacing.s,
    elevation: 1,
  },
  selectedSpecialistCard: {
    borderColor: appTheme.colors.primary,
    borderWidth: 1,
  },
  specialistCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialistInfo: {
    marginLeft: appTheme.spacing.m,
    flex: 1,
  },
  experienceText: {
    color: appTheme.colors.textSecondary,
    marginTop: appTheme.spacing.xs,
  },
  selectedIcon: {
    marginLeft: appTheme.spacing.s,
  },
  reviewItem: {
    marginBottom: appTheme.spacing.m,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: appTheme.spacing.xs,
  },
  reviewDate: {
    color: appTheme.colors.textSecondary,
  },
  reviewRating: {
    flexDirection: 'row',
    marginBottom: appTheme.spacing.xs,
  },
  reviewComment: {
    lineHeight: 20,
  },
  reviewDivider: {
    marginVertical: appTheme.spacing.m,
  },
  allReviewsButton: {
    marginTop: appTheme.spacing.s,
  },
  orderButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: appTheme.spacing.m,
    backgroundColor: appTheme.colors.background,
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
  },
  orderButton: {
    width: '100%',
    paddingVertical: appTheme.spacing.xs,
  },
  orderButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: appTheme.spacing.m,
    color: appTheme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: appTheme.spacing.xl,
  },
  errorText: {
    marginTop: appTheme.spacing.m,
    marginBottom: appTheme.spacing.l,
    color: appTheme.colors.error,
    fontSize: 18,
    textAlign: 'center',
  },
  backButton: {
    marginTop: appTheme.spacing.m,
  },
});

export default ServiceDetailScreen; 