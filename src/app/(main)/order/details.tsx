import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Text, Button, TextInput as PaperTextInput, Divider, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import appTheme from '../../../constants/theme';
import { ServiceStackParamList } from '../services/_layout';
import { getServiceById } from '../../../lib/supabase';
import CustomCalendar from '../../../components/ui/CustomCalendar';

type OrderDetailsRouteProp = RouteProp<ServiceStackParamList, 'OrderDetails'>;
type OrderDetailsNavigationProp = StackNavigationProp<ServiceStackParamList, 'OrderConfirmation'>;

// Интерфейс для временного интервала
interface TimeInterval {
  id: string;
  start: string;
  end: string;
  available: boolean;
}

// Интерфейс для услуги
interface Service {
  id: string;
  name: string;
  price: number;
  price_from?: number;
  duration: string;
}

/**
 * Экран деталей заказа
 */
const OrderDetailsScreen = () => {  const route = useRoute<OrderDetailsRouteProp>();  const navigation = useNavigation<OrderDetailsNavigationProp>();  const { serviceId, specialistId, address, coordinates } = route.params;
  
  // Состояния
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeInterval, setSelectedTimeInterval] = useState<TimeInterval | null>(null);
  const [description, setDescription] = useState('');
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Состояния для нового календаря
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState({
    date: '',
    time: ''
  });
  
  // Заглушка для информации о специалисте
  const specialist = {
    id: specialistId || '00000000-0000-0000-0000-000000000000',
    name: 'Иванов Иван',
    rating: 4.8,
    reviews: 56,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  };
  
  // Заглушка для информации об услуге
  const servicePlaceholder = {
    id: serviceId || '00000000-0000-0000-0000-000000000000',
    name: 'Ремонт стиральной машины',
    price: 2500,
    duration: '1-2 часа',
  };
  
  // Генерация временных интервалов
  const generateTimeIntervals = (): TimeInterval[] => {
    const intervals: TimeInterval[] = [];
    const startHour = 9; // Начало рабочего дня
    const endHour = 20;  // Конец рабочего дня
    
    // Генерируем интервалы с разной длительностью для демонстрации
    let id = 0;
    for (let hour = startHour; hour < endHour - 1; hour++) {
      // Получасовые интервалы
      intervals.push({
        id: `${id++}`,
        start: `${hour.toString().padStart(2, '0')}:00`,
        end: `${hour.toString().padStart(2, '0')}:30`,
        available: Math.random() > 0.3, // Случайная доступность
      });
      
      intervals.push({
        id: `${id++}`,
        start: `${hour.toString().padStart(2, '0')}:30`,
        end: `${(hour + 1).toString().padStart(2, '0')}:00`,
        available: Math.random() > 0.3, // Случайная доступность
      });
      
      // Часовые интервалы
      intervals.push({
        id: `${id++}`,
        start: `${hour.toString().padStart(2, '0')}:00`,
        end: `${(hour + 1).toString().padStart(2, '0')}:00`,
        available: Math.random() > 0.3, // Случайная доступность
      });
      
      // Двухчасовые интервалы для некоторых часов
      if (hour < endHour - 2 && hour % 2 === 0) {
        intervals.push({
          id: `${id++}`,
          start: `${hour.toString().padStart(2, '0')}:00`,
          end: `${(hour + 2).toString().padStart(2, '0')}:00`,
          available: Math.random() > 0.3, // Случайная доступность
        });
      }
    }
    
    return intervals;
  };
  
  const timeIntervals = generateTimeIntervals();
  
  // Форматирование даты
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('ru-RU', options);
  };
  
  // Обработчик выбора даты
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };
  
  // Обработчик выбора временного интервала
  const handleTimeIntervalSelect = (interval: TimeInterval) => {
    setSelectedTimeInterval(interval);
    setShowTimePicker(false);
  };
  
  // Получение дней месяца для календаря
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Получение дня недели для первого дня месяца (0 - воскресенье, 1 - понедельник, и т.д.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Генерация календаря
  const generateCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    // Корректировка для начала недели с понедельника (0 - понедельник, 6 - воскресенье)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    const days = [];
    const weeks = [];
    
    // Добавляем пустые ячейки для дней до начала месяца
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    
    // Добавляем дни месяца
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    // Разбиваем дни на недели
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return weeks;
  };
  
  // Получение названий дней недели
  const getWeekdayNames = () => {
    return ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  };
  
  // Получение названия месяца
  const getMonthName = (month: number) => {
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[month];
  };
  
  // Переключение на предыдущий месяц
  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };
  
  // Переключение на следующий месяц
  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };
  
  // Проверка, является ли день сегодняшним
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };
  
  // Проверка, является ли день выбранным
  const isSelectedDay = (day: number) => {
    return (
      day === selectedDate.getDate()
    );
  };
  
  // Проверка, доступен ли день для выбора (прошедшие дни недоступны)
  const isDayAvailable = (day: number) => {
    const today = new Date();
    const checkDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    
    return checkDate >= new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };
  
  // Обработчик выбора дня
  const handleDaySelect = (day: number) => {
    if (!isDayAvailable(day)) return;
    
    const newDate = new Date(selectedDate);
    newDate.setDate(day);
    setSelectedDate(newDate);
  };
  
  // Обработчики для нового календаря
  const handleOpenCalendar = () => {
    setCalendarVisible(true);
  };

  const handleCalendarConfirm = (date: string, time: string) => {
    setSelectedAppointment({ date, time });
    // Обновляем старые состояния для совместимости
    const newDate = new Date(date);
    setSelectedDate(newDate);
    // Устанавливаем время как временной интервал
    setSelectedTimeInterval({
      id: 'custom',
      start: time,
      end: time,
      available: true
    });
  };
  
  // Обработчик нажатия на кнопку "Продолжить"
  const handleContinue = () => {
    if (!selectedTimeInterval) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите время для заказа');
      return;
    }
    
    // Убедимся, что specialistId имеет правильный формат UUID
    console.log('Передаем specialistId:', specialistId);
    
    // Используем UUID специалиста напрямую
    const specialistUUID = 'cb7ce945-5728-4af8-a5fb-4d64420fef0a';
    
    // Создаем объект с данными заказа
    const orderData = {
      serviceId,
      specialistId: specialistUUID, // Используем константный UUID
      address,
      coordinates,
      date: selectedDate,
      time: selectedTimeInterval ? `${selectedTimeInterval.start} - ${selectedTimeInterval.end}` : '',
      description: description.trim(),
      service: service || servicePlaceholder,
      specialist,
    };
    
    // Переходим на экран подтверждения заказа
    navigation.navigate('OrderConfirmation', { orderData });
  };
  
  useEffect(() => {
    const fetchService = async () => {
      try {
        const { data: fetchedService, error } = await getServiceById(serviceId);
        if (error) {
          console.error('Ошибка при получении услуги:', error);
        } else if (fetchedService) {
          const serviceData = {
            id: fetchedService.id,
            name: fetchedService.name,
            price: fetchedService.price_from || fetchedService.price || 2500,
            duration: fetchedService.duration || '1-2 часа'
          };
          
          setService(serviceData);
        }
      } catch (error) {
        console.error('Ошибка при получении информации о услуге:', error);
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchService();
    } else {
      console.warn('serviceId не передан');
      setLoading(false);
    }
  }, [serviceId]);
  
  return (    <View 
      style={[
        styles.container, 
        Platform.OS === 'ios' ? { paddingTop: 60 } : {}
      ]}>      <ScrollView style={styles.scrollView}>
        {/* Информация о выбранном адресе */}
        <View style={styles.addressContainer}>
          <View style={styles.addressHeader}>
            <MaterialCommunityIcons name="map-marker" size={24} color={appTheme.colors.primary} />
            <Text style={styles.addressTitle}>Адрес</Text>
          </View>
          <Text style={styles.addressText}>{address}</Text>
          <TouchableOpacity 
            style={styles.changeAddressButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.changeAddressText}>Изменить</Text>
          </TouchableOpacity>
        </View>
        
        <Divider style={styles.divider} />
        
        {/* Информация о специалисте */}
        <View style={styles.specialistContainer}>
          <Text style={styles.sectionTitle}>Специалист</Text>
          <View style={styles.specialistCard}>
            <Avatar.Image 
              source={{ uri: specialist.avatar }} 
              size={50} 
            />
            <View style={styles.specialistInfo}>
              <Text style={styles.specialistName}>{specialist.name}</Text>
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{specialist.rating} ({specialist.reviews} отзывов)</Text>
              </View>
            </View>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        {/* Выбор сроков */}
        <View style={styles.scheduleContainer}>
          <Text style={styles.sectionTitle}>Сроки</Text>
          
          {/* Новый календарь */}
          <TouchableOpacity 
            style={styles.scheduleSelector}
            onPress={handleOpenCalendar}
          >
            <View style={styles.scheduleSelectorContent}>
              <Text style={styles.scheduleSelectorLabel}>Дата и время</Text>
              <Text style={styles.scheduleSelectorValue}>
                {selectedAppointment.date && selectedAppointment.time
                  ? `${new Date(selectedAppointment.date).toLocaleDateString('ru-RU')} в ${selectedAppointment.time}`
                  : 'Выберите дату и время'}
              </Text>
            </View>
            <MaterialCommunityIcons name="calendar-month" size={24} color={appTheme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        <Divider style={styles.divider} />
        
        {/* Комментарий к заказу */}
        <View style={styles.commentContainer}>
          <PaperTextInput
            label={<Text>Комментарий к заказу</Text>}
            style={styles.commentInput}
            multiline
            value={description}
            onChangeText={setDescription}
            placeholder="Опишите детали заказа или особые пожелания"
          />
        </View>
        
        {/* Информация о стоимости */}
        <View style={styles.priceContainer}>
          <Text style={styles.sectionTitle}>Стоимость</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Загрузка информации о услуге...</Text>
            </View>
          ) : (
            <>
              <View style={styles.priceRow}>
                <Text>{service ? service.name : servicePlaceholder.name}</Text>
                <Text style={styles.priceText}>от {service ? service.price : servicePlaceholder.price} ₽</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.totalText}>Итого</Text>
                <Text style={styles.totalPrice}>от {service ? service.price : servicePlaceholder.price} ₽</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Кнопка продолжения - зафиксирована внизу */}
      <View style={styles.bottomContainer}>
        <Button
          mode="contained"
          onPress={handleContinue}
          style={styles.continueButton}
          disabled={!selectedAppointment.date || !selectedAppointment.time || loading}
        >
          Продолжить
        </Button>
      </View>
      
      {/* Новый кастомный календарь */}
      <CustomCalendar
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        onConfirm={handleCalendarConfirm}
        selectedDate={selectedAppointment.date}
        selectedTime={selectedAppointment.time}
      />
    </View>
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
  addressContainer: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 8,
    padding: appTheme.spacing.m,
    marginBottom: appTheme.spacing.m,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: appTheme.spacing.s,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: appTheme.spacing.s,
  },
  addressText: {
    fontSize: 14,
    color: appTheme.colors.text,
    marginBottom: appTheme.spacing.s,
  },
  changeAddressButton: {
    alignSelf: 'flex-start',
  },
  changeAddressText: {
    color: appTheme.colors.primary,
    fontSize: 14,
  },
  divider: {
    marginVertical: appTheme.spacing.m,
  },
  specialistContainer: {
    marginBottom: appTheme.spacing.m,
  },
  specialistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appTheme.colors.surface,
    borderRadius: 8,
    padding: appTheme.spacing.m,
    marginTop: appTheme.spacing.s,
  },
  specialistInfo: {
    marginLeft: appTheme.spacing.m,
    flex: 1,
  },
  specialistName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    color: appTheme.colors.textSecondary,
  },
  scheduleContainer: {
    marginBottom: appTheme.spacing.m,
  },
  scheduleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: appTheme.colors.surface,
    borderRadius: 8,
    padding: appTheme.spacing.m,
    marginTop: appTheme.spacing.s,
  },
  scheduleSelectorContent: {
    flex: 1,
  },
  scheduleSelectorLabel: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    marginBottom: 4,
  },
  scheduleSelectorValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentContainer: {
    marginBottom: appTheme.spacing.m,
  },
  commentInput: {
    marginTop: appTheme.spacing.s,
    backgroundColor: appTheme.colors.surface,
  },
  priceContainer: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 8,
    padding: appTheme.spacing.m,
    marginTop: appTheme.spacing.s,
    marginBottom: appTheme.spacing.m,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: appTheme.spacing.s,
  },
  priceText: {
    fontWeight: 'bold',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appTheme.colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    paddingVertical: appTheme.spacing.xs,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: appTheme.spacing.m,
    margin: appTheme.spacing.m,
    borderRadius: 8,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: appTheme.spacing.m,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalButton: {
    marginTop: appTheme.spacing.m,
  },
  calendarContainer: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 8,
    padding: appTheme.spacing.s,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: appTheme.spacing.s,
  },
  calendarMonthYear: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendarWeekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: appTheme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
  },
  calendarWeekday: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    color: appTheme.colors.textSecondary,
  },
  calendarWeek: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: appTheme.spacing.xs,
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  calendarDayEmpty: {
    // Пустая ячейка
  },
  calendarDayToday: {
    borderWidth: 1,
    borderColor: appTheme.colors.primary,
  },
  calendarDaySelected: {
    backgroundColor: appTheme.colors.primary,
  },
  calendarDayUnavailable: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
  },
  calendarDayTextToday: {
    color: appTheme.colors.primary,
    fontWeight: 'bold',
  },
  calendarDayTextSelected: {
    color: 'white',
  },
  calendarDayTextUnavailable: {
    color: appTheme.colors.textSecondary,
  },
  timeIntervalsContainer: {
    maxHeight: 400,
  },
  timeIntervalItem: {
    padding: appTheme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
  },
  timeIntervalItemUnavailable: {
    opacity: 0.5,
  },
  timeIntervalItemSelected: {
    backgroundColor: appTheme.colors.primary,
  },
  timeIntervalText: {
    fontSize: 16,
    textAlign: 'center',
  },
  timeIntervalTextUnavailable: {
    color: appTheme.colors.textSecondary,
  },
  timeIntervalTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContainer: {
    paddingHorizontal: appTheme.spacing.m,
    paddingBottom: Platform.OS === 'ios' ? 10 : 20,
    paddingTop: appTheme.spacing.m,
  },
});

export default OrderDetailsScreen; 