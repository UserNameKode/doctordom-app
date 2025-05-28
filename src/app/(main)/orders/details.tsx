import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Divider, Avatar, Portal, Dialog, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import appTheme from '../../../constants/theme';
import { OrdersStackParamList } from './_layout';
import { Order, OrderService } from '../../../services/OrderService';

// Типы для навигации
type OrderDetailsRouteProp = RouteProp<OrdersStackParamList, 'OrderDetails'>;
type OrderDetailsNavigationProp = StackNavigationProp<OrdersStackParamList, 'OrdersList'>;

/**
 * Экран деталей заказа
 */
const OrderDetailsScreen = () => {
  const route = useRoute<OrderDetailsRouteProp>();
  const navigation = useNavigation<OrderDetailsNavigationProp>();
  const { orderId } = route.params;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Загрузка данных заказа
  React.useEffect(() => {
    const loadOrderDetails = async () => {
      setIsLoading(true);
      try {
        const orderDetails = await OrderService.getOrderDetails(orderId);
        setOrder(orderDetails);
      } catch (error) {
        console.error('Ошибка при загрузке деталей заказа:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить детали заказа');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrderDetails();
  }, [orderId]);
  
  // Определяем цвет и текст статуса заказа
  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { color: appTheme.colors.warning, text: 'Ожидает подтверждения' };
      case 'confirmed':
        return { color: appTheme.colors.info, text: 'Подтвержден' };
      case 'in_progress':
        return { color: appTheme.colors.primary, text: 'В процессе' };
      case 'completed':
        return { color: appTheme.colors.success, text: 'Выполнен' };
      case 'cancelled':
        return { color: appTheme.colors.error, text: 'Отменен' };
      default:
        return { color: appTheme.colors.textSecondary, text: 'Неизвестно' };
    }
  };
  
  // Обработчик отмены заказа
  const handleCancelOrder = async () => {
    setShowCancelDialog(false);
    
    if (!order) return;
    
    try {
      setIsCancelling(true);
      const updatedOrder = await OrderService.cancelOrder(order.id);
      setOrder(updatedOrder);
      Alert.alert('Успешно', 'Заказ успешно отменен');
    } catch (error) {
      console.error('Ошибка при отмене заказа:', error);
      Alert.alert('Ошибка', 'Не удалось отменить заказ');
    } finally {
      setIsCancelling(false);
    }
  };
  
  // Проверка возможности отмены заказа
  // Отмена возможна только для активных заказов (ожидающих подтверждения или подтвержденных)
  const canCancelOrder = (status: Order['status']) => {
    return status === 'pending' || status === 'confirmed';
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={appTheme.colors.primary} />
        <Text style={styles.loadingText}>Загрузка данных заказа...</Text>
      </View>
    );
  }
  
  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Заказ не найден</Text>
      </View>
    );
  }
  
  const statusInfo = getStatusInfo(order.status);
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* Заголовок с номером заказа */}
        <View style={styles.header}>
          <Text style={styles.orderId}>
            Заказ #{order.id}
          </Text>
          <Text style={[styles.statusInTitle, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
        
        {/* Информация об услуге */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Услуга</Text>
            <Text style={styles.serviceName}>{order.serviceName}</Text>
            {order.serviceDescription && (
              <Text style={styles.serviceDescription}>{order.serviceDescription}</Text>
            )}
            <Divider style={styles.divider} />
            <View style={styles.priceContainer}>
              <Text>Стоимость:</Text>
              <Text style={styles.price}>{order.price} ₽</Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Информация о специалисте */}
        {order.specialistName && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Специалист</Text>
              <View style={styles.specialistContainer}>
                {order.specialistAvatar ? (
                  <Avatar.Image 
                    source={{ uri: order.specialistAvatar }} 
                    size={50} 
                  />
                ) : (
                  <Avatar.Icon 
                    icon="account" 
                    size={50} 
                    color="white"
                    style={{ backgroundColor: appTheme.colors.primary }}
                  />
                )}
                <View style={styles.specialistInfo}>
                  <Text style={styles.specialistName}>{order.specialistName}</Text>
                  {order.specialistRating && (
                    <View style={styles.ratingContainer}>
                      <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                      <Text style={styles.ratingText}>{order.specialistRating}</Text>
                    </View>
                  )}
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
              <Text style={styles.infoText}>{order.date}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={appTheme.colors.primary} />
              <Text style={styles.infoText}>{order.time}</Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Информация об адресе */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Адрес</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={20} color={appTheme.colors.primary} />
              <Text style={styles.infoText}>{order.address}</Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Комментарий к заказу */}
        {order.description && (
          <View style={styles.commentBlock}>
            <Text style={styles.commentTitle}>Комментарий:</Text>
            <Text style={styles.comment}>{order.description}</Text>
          </View>
        )}
        
        {/* Дополнительная информация */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Дополнительная информация</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Дата создания:</Text>
              <Text style={styles.infoValue}>{order.createdAt}</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
      
      {/* Кнопка отмены заказа */}
      {canCancelOrder(order.status) && (
        <View style={styles.footer}>
          <Button 
            mode="contained" 
            onPress={() => setShowCancelDialog(true)}
            buttonColor={appTheme.colors.error}
            disabled={isCancelling}
            loading={isCancelling}
          >
            Отменить заказ
          </Button>
        </View>
      )}
      
      {/* Диалог подтверждения отмены заказа */}
      <Portal>
        <Dialog visible={showCancelDialog} onDismiss={() => setShowCancelDialog(false)}>
          <Dialog.Title><Text>Отмена заказа</Text></Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Вы уверены, что хотите отменить заказ? Это действие нельзя будет отменить.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCancelDialog(false)}>Отмена</Button>
            <Button onPress={handleCancelOrder}>Подтвердить</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: appTheme.spacing.m,
    color: appTheme.colors.textSecondary,
  },
  header: {
    padding: appTheme.spacing.m,
    backgroundColor: '#fff',
    borderRadius: appTheme.borderRadius.medium,
    marginHorizontal: appTheme.spacing.m,
    marginTop: appTheme.spacing.m,
    marginBottom: appTheme.spacing.s,
    ...appTheme.shadows.small,
  },
  orderId: {
    fontSize: appTheme.fontSizes.large,
    fontWeight: 'bold',
    color: appTheme.colors.text,
    textAlign: 'center',
  },
  statusInTitle: {
    fontWeight: 'bold',
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
  serviceDescription: {
    color: appTheme.colors.textSecondary,
    marginBottom: appTheme.spacing.s,
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
  infoLabel: {
    color: appTheme.colors.textSecondary,
    width: 120,
  },
  infoValue: {
    flex: 1,
  },
  commentBlock: {
    marginBottom: appTheme.spacing.m,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: appTheme.spacing.s,
    color: appTheme.colors.textSecondary,
  },
  comment: {
    fontSize: 16,
  },
  footer: {
    padding: appTheme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
  },
});

export default OrderDetailsScreen; 