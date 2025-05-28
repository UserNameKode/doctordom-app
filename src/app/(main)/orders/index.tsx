import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Divider, SegmentedButtons, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import appTheme from '../../../constants/theme';
import { OrdersStackParamList } from './_layout';
import { Order, OrderService } from '../../../services/OrderService';

type OrdersNavigationProp = StackNavigationProp<OrdersStackParamList>;

/**
 * Компонент карточки заказа
 */
const OrderCard = ({ order, onPress }: { order: Order; onPress: () => void }) => {
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

  const statusInfo = getStatusInfo(order.status);

  // Определяем фон карточки в зависимости от типа (активный заказ или история)
  const isHistoryOrder = order.status === 'completed' || order.status === 'cancelled';
  const cardStyle = [
    styles.orderCard, 
    isHistoryOrder ? styles.historyOrderCard : null
  ];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={cardStyle}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <Text variant="titleMedium" style={styles.orderTitle}>{order.serviceName}</Text>
            <Chip 
              mode="flat" 
              textStyle={{ color: statusInfo.color }}
              style={[styles.statusChip, { borderColor: statusInfo.color }]}
            >
              {statusInfo.text}
            </Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="calendar" size={16} color={appTheme.colors.textSecondary} />
              <Text style={styles.infoText}>{order.date}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color={appTheme.colors.textSecondary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {order.address}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account" size={16} color={appTheme.colors.textSecondary} />
              <Text style={styles.infoText}>{order.specialistName || 'Не назначен'}</Text>
            </View>
          </View>
          
          <View style={styles.orderFooter}>
            <Text variant="titleMedium" style={styles.priceText}>{order.price} ₽</Text>
            <TouchableOpacity 
              style={styles.detailsButton}
              onPress={onPress}
            >
              <Text variant="bodyMedium" style={styles.detailsButtonText}>Подробнее</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={appTheme.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.orderActions}>
            <MaterialCommunityIcons name="chevron-right" size={20} color={appTheme.colors.primary} />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

/**
 * Экран заказов
 */
const OrdersScreen = () => {
  const [selectedTab, setSelectedTab] = useState('active');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const navigation = useNavigation<OrdersNavigationProp>();

  // Функция для загрузки заказов
  const loadOrders = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      console.log('OrdersScreen: Загружаем заказы...');
      const userOrders = await OrderService.getUserOrders();
      console.log('OrdersScreen: Получено заказов:', userOrders.length);
      setOrders(userOrders);
      filterOrders(selectedTab, userOrders);
    } catch (error) {
      console.error('Ошибка при загрузке заказов:', error);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  // Функция для обновления списка (pull to refresh)
  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadOrders(false);
    setIsRefreshing(false);
  };

  // Эффект для загрузки заказов при монтировании компонента
  useEffect(() => {
    loadOrders();
  }, []);

  // Автоматическое обновление при возвращении на экран
  useFocusEffect(
    React.useCallback(() => {
      console.log('OrdersScreen: Экран получил фокус, обновляем заказы');
      loadOrders(false); // Загружаем без показа loader'а
    }, [])
  );

  // Фильтрация заказов по выбранной вкладке
  const filterOrders = (tab: string, ordersList = orders) => {
    if (tab === 'active') {
      const activeStatuses: Order['status'][] = ['pending', 'confirmed', 'in_progress'];
      setFilteredOrders(ordersList.filter(order => activeStatuses.includes(order.status)));
    } else {
      const historyStatuses: Order['status'][] = ['completed', 'cancelled'];
      setFilteredOrders(ordersList.filter(order => historyStatuses.includes(order.status)));
    }
  };

  // Обработчик изменения вкладки
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    filterOrders(tab);
  };

  // Обработчик нажатия на карточку заказа
  const handleOrderPress = (order: Order) => {
    // Навигация на экран деталей заказа
    navigation.navigate('OrderDetails', { orderId: order.id });
  };

  // Компонент для отображения пустого списка
  const renderEmptyList = () => {
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="clipboard-text-off" size={64} color={appTheme.colors.disabled} />
        <Text style={styles.emptyTitle}>Заказов пока нет</Text>
        <Text style={styles.emptySubtitle}>
          Оформите первый заказ в разделе "Услуги"
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Добавляем отступ сверху */}
      <View style={styles.topSpacer} />

      {/* Переключатель вкладок - перемещен ниже */}
      <SegmentedButtons
        value={selectedTab}
        onValueChange={handleTabChange}
        buttons={[
          {
            value: 'active',
            label: 'Активные',
            icon: 'clipboard-list',
          },
          {
            value: 'history',
            label: 'История',
            icon: 'history',
          },
        ]}
        style={styles.segmentedButtons}
      />

      {/* Список заказов */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appTheme.colors.primary} />
          <Text style={styles.loadingText}>Загрузка заказов...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={({ item }) => (
            <OrderCard 
              order={item} 
              onPress={() => handleOrderPress(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[appTheme.colors.primary]}
            />
          }
        />
      )}

      {/* Плавающая кнопка "Создать заказ" */}
      <FAB
        icon="plus"
        label="Создать заказ"
        style={styles.fab}
        onPress={() => {
          // Навигация на экран категорий услуг
          navigation.getParent()?.navigate('Services');
        }}
        color={appTheme.colors.white}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  segmentedButtons: {
    margin: appTheme.spacing.m,
  },
  ordersList: {
    padding: appTheme.spacing.m,
  },
  orderCard: {
    marginBottom: appTheme.spacing.m,
    borderRadius: appTheme.borderRadius.medium,
    backgroundColor: appTheme.colors.white,
    ...appTheme.shadows.medium,
  },
  historyOrderCard: {
    backgroundColor: appTheme.colors.historyCardBackground,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: appTheme.spacing.s,
  },
  orderTitle: {
    flex: 1,
    fontWeight: 'bold',
    color: appTheme.colors.secondary,
  },
  statusChip: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  divider: {
    marginVertical: appTheme.spacing.s,
  },
  orderInfo: {
    marginVertical: appTheme.spacing.s,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: appTheme.spacing.xs,
  },
  infoText: {
    marginLeft: appTheme.spacing.s,
    color: appTheme.colors.textSecondary,
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: appTheme.spacing.s,
  },
  priceText: {
    fontWeight: 'bold',
    color: appTheme.colors.primary,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsButtonText: {
    color: appTheme.colors.primary,
    marginRight: appTheme.spacing.xs,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: appTheme.spacing.xl,
  },
  emptyTitle: {
    marginTop: appTheme.spacing.m,
    color: appTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: appTheme.spacing.m,
  },
  emptySubtitle: {
    marginTop: appTheme.spacing.m,
    color: appTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: appTheme.spacing.m,
  },
  topSpacer: {
    height: appTheme.spacing.xl * 1.5,
  },
  fab: {
    position: 'absolute',
    margin: appTheme.spacing.m,
    right: 0,
    bottom: 0,
    backgroundColor: appTheme.colors.primary,
  },
  listContainer: {
    padding: appTheme.spacing.m,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: appTheme.spacing.s,
  },
});

export default OrdersScreen; 