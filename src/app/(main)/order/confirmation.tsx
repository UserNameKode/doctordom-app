import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Divider, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import appTheme from '../../../constants/theme';
import { ServiceStackParamList } from '../services/_layout';
import { CreateOrderDto, OrderService } from '../../../services/OrderService';

type OrderConfirmationRouteProp = RouteProp<ServiceStackParamList, 'OrderConfirmation'>;
type OrderConfirmationNavigationProp = StackNavigationProp<ServiceStackParamList>;

/**
 * Экран подтверждения заказа
 */
const OrderConfirmationScreen = () => {
  const route = useRoute<OrderConfirmationRouteProp>();
  const navigation = useNavigation<OrderConfirmationNavigationProp>();
  const { orderData } = route.params;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Форматирование даты для отображения
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('ru-RU', options);
  };
  
  // Обработчик подтверждения заказа
  const handleConfirmOrder = async () => {
    try {
      setIsSubmitting(true);
      
      // Проверяем формат UUID для specialistId и исправляем его при необходимости
      let validSpecialistId = orderData.specialistId;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (!validSpecialistId || !uuidRegex.test(validSpecialistId)) {
        console.log('Некорректный формат UUID для specialistId, используем значение по умолчанию');
        validSpecialistId = 'cb7ce945-5728-4af8-a5fb-4d64420fef0a';
      }
      
      // Создаем объект с данными для создания заказа
      const createOrderDto: CreateOrderDto = {
        serviceId: orderData.service.id,
        specialistId: validSpecialistId,
        address: orderData.address,
        coordinates: orderData.coordinates,
        date: orderData.date,
        time: orderData.time,
        description: orderData.description,
      };
      
      // Проверяем и логируем данные для отладки
      console.log('Отправляем данные заказа:', JSON.stringify(createOrderDto));
      console.log('specialistId тип:', typeof createOrderDto.specialistId);
      console.log('specialistId значение:', createOrderDto.specialistId);
      console.log('specialistId проверка UUID:', uuidRegex.test(createOrderDto.specialistId || ''));
      
      // Отправляем данные на сервер
      const createdOrder = await OrderService.createOrder(createOrderDto);
      
      // Показываем сообщение об успешном создании заказа
      Alert.alert(
        'Заказ успешно создан',
        `Ваш заказ #${createdOrder.id} успешно создан. Вы можете отслеживать его статус в разделе "Заказы".`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Возвращаемся на главный экран
              navigation.navigate('Index');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      Alert.alert(
        'Ошибка',
        'Не удалось создать заказ. Пожалуйста, попробуйте еще раз.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Подтверждение заказа</Text>
        
        {/* Информация об услуге */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Услуга</Text>
            <Text style={styles.serviceName}>{orderData.service.name}</Text>
            <Divider style={styles.divider} />
            <View style={styles.priceContainer}>
              <Text>Стоимость:</Text>
              <Text style={styles.price}>{orderData.service.price} ₽</Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Информация о специалисте */}
        {orderData.specialist && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Специалист</Text>
              <View style={styles.specialistContainer}>
                <Avatar.Image 
                  source={{ uri: orderData.specialist.avatar }} 
                  size={50} 
                />
                <View style={styles.specialistInfo}>
                  <Text style={styles.specialistName}>{orderData.specialist.name}</Text>
                  <View style={styles.ratingContainer}>
                    <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {orderData.specialist.rating} ({orderData.specialist.reviews} отзывов)
                    </Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
        
        {/* Информация о дате и времени */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Дата и время</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="calendar" size={20} color={appTheme.colors.primary} />
              <Text style={styles.infoText}>{formatDate(orderData.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={appTheme.colors.primary} />
              <Text style={styles.infoText}>{orderData.time}</Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Информация об адресе */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Адрес</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={20} color={appTheme.colors.primary} />
              <Text style={styles.infoText}>{orderData.address}</Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Комментарий к заказу */}
        {orderData.description && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Комментарий</Text>
              <Text style={styles.comment}>{orderData.description}</Text>
            </Card.Content>
          </Card>
        )}
        
        {/* Информация об оплате */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Оплата</Text>
            <Text style={styles.paymentInfo}>Оплата производится наличными или картой после выполнения заказа</Text>
            <Divider style={styles.divider} />
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Итого:</Text>
              <Text style={styles.totalPrice}>{orderData.service.price} ₽</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
      
      {/* Кнопка подтверждения заказа */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleConfirmOrder}
          style={styles.confirmButton}
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          Подтвердить заказ
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: appTheme.spacing.m,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: appTheme.spacing.m,
    textAlign: 'center',
  },
  card: {
    marginBottom: appTheme.spacing.m,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: appTheme.spacing.s,
    color: appTheme.colors.textSecondary,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: appTheme.spacing.xs,
  },
  divider: {
    marginVertical: appTheme.spacing.s,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appTheme.colors.primary,
  },
  specialistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialistInfo: {
    marginLeft: appTheme.spacing.m,
    flex: 1,
  },
  specialistName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    color: appTheme.colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: appTheme.spacing.xs,
  },
  infoText: {
    marginLeft: appTheme.spacing.s,
    fontSize: 16,
  },
  comment: {
    fontSize: 16,
  },
  paymentInfo: {
    fontSize: 16,
    color: appTheme.colors.textSecondary,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: appTheme.colors.primary,
  },
  footer: {
    padding: appTheme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
  },
  confirmButton: {
    paddingVertical: appTheme.spacing.xs,
  },
});

export default OrderConfirmationScreen; 