import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { IconButton } from 'react-native-paper';
import appTheme from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useFonts, Montserrat_700Bold } from '@expo-google-fonts/montserrat';

// Настройка русской локализации для календаря
LocaleConfig.locales['ru'] = {
  monthNames: [
    'Январь',
    'Февраль', 
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь'
  ],
  monthNamesShort: [
    'Янв',
    'Фев',
    'Мар',
    'Апр',
    'Май',
    'Июн',
    'Июл',
    'Авг',
    'Сен',
    'Окт',
    'Ноя',
    'Дек'
  ],
  dayNames: [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота'
  ],
  dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  today: 'Сегодня'
};

LocaleConfig.defaultLocale = 'ru';

interface CustomCalendarProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
}

const { width, height } = Dimensions.get('window');

// Корпоративные цвета компании
const companyColors = {
  darkBlue: '#182237',    // RGB 24 34 55
  green: '#95C11F',       // RGB 149 193 31
  lightBlue: '#077BC0',   // RGB 7 123 192
};

/**
 * Кастомный календарь для выбора даты и времени
 * Стилизован в соответствии с корпоративными цветами компании
 */
const CustomCalendar: React.FC<CustomCalendarProps> = ({
  visible,
  onClose,
  onConfirm,
  selectedDate,
  selectedTime,
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || '');
  const [currentTime, setCurrentTime] = useState(selectedTime || '');

  // Загружаем только нужный шрифт Montserrat
  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
  });

  // Расширенные временные слоты в российском формате (без AM/PM)
  const timeSlots = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
  ];

  // Получаем текущую дату для ограничения выбора
  const today = new Date().toISOString().split('T')[0];
  
  // Получаем дату через 30 дней для ограничения
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];

  const handleDateSelect = (day: DateData) => {
    setCurrentDate(day.dateString);
  };

  const handleTimeSelect = (time: string) => {
    setCurrentTime(time);
  };

  const handleConfirm = () => {
    if (currentDate && currentTime) {
      onConfirm(currentDate, currentTime);
      onClose();
    }
  };

  const handleCancel = () => {
    setCurrentDate(selectedDate || '');
    setCurrentTime(selectedTime || '');
    onClose();
  };

  // Форматируем дату для отображения на русском языке
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'ВЫБЕРИТЕ ДАТУ';
    
    const date = new Date(dateString);
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[companyColors.darkBlue, companyColors.lightBlue]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <IconButton
              icon="arrow-left"
              iconColor="white"
              size={24}
              onPress={onClose}
              style={styles.backButton}
            />
            <Text style={styles.headerTitle}>Запись{'\n'}на услугу</Text>
            <Image 
              source={require('../../../assets/character-transparent.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </LinearGradient>

          <View style={styles.content}>
            {/* Секция выбора даты */}
            <View style={styles.dateSection}>
              <Text style={styles.sectionLabel}>ВЫБЕРИТЕ ДАТУ</Text>
              <Text style={styles.displayDate}>{formatDisplayDate(currentDate)}</Text>
              
              <Calendar
                style={styles.calendar}
                theme={{
                  backgroundColor: 'transparent',
                  calendarBackground: 'transparent',
                  textSectionTitleColor: '#8A8A8A',
                  selectedDayBackgroundColor: companyColors.green,
                  selectedDayTextColor: 'white',
                  todayTextColor: companyColors.lightBlue,
                  dayTextColor: companyColors.darkBlue,
                  textDisabledColor: '#d9e1e8',
                  dotColor: companyColors.green,
                  selectedDotColor: 'white',
                  arrowColor: companyColors.lightBlue,
                  disabledArrowColor: '#d9e1e8',
                  monthTextColor: companyColors.darkBlue,
                  indicatorColor: companyColors.lightBlue,
                  textDayFontFamily: 'System',
                  textMonthFontFamily: 'System',
                  textDayHeaderFontFamily: 'System',
                  textDayFontWeight: '500',
                  textMonthFontWeight: '600',
                  textDayHeaderFontWeight: '600',
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 14,
                }}
                onDayPress={handleDateSelect}
                markedDates={{
                  [currentDate]: {
                    selected: true,
                    selectedColor: companyColors.green,
                  },
                }}
                minDate={today}
                maxDate={maxDateString}
                enableSwipeMonths
                // Русская локализация дней недели
                firstDay={1} // Неделя начинается с понедельника
              />
            </View>

            {/* Секция выбора времени */}
            <View style={styles.timeSection}>
              <Text style={styles.sectionLabel}>ВЫБЕРИТЕ ВРЕМЯ</Text>
              
              <ScrollView 
                style={styles.timeScrollContainer}
                contentContainerStyle={styles.timeGrid}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {timeSlots.map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeSlot,
                      currentTime === time && styles.selectedTimeSlot,
                    ]}
                    onPress={() => handleTimeSelect(time)}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        currentTime === time && styles.selectedTimeText,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Кнопки действий */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>ОТМЕНА</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.scheduleButton,
                  (!currentDate || !currentTime) && styles.disabledButton,
                ]}
                onPress={handleConfirm}
                disabled={!currentDate || !currentTime}
              >
                <Text style={styles.scheduleButtonText}>ЗАПИСАТЬСЯ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 10,
    margin: 0,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 30,
    fontFamily: 'Montserrat_700Bold',
  },
  logoImage: {
    width: 55,
    height: 55,
    position: 'absolute',
    right: 10,
    top: 22,
  },
  content: {
    padding: 20,
  },
  dateSection: {
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A8A8A',
    marginBottom: 8,
    letterSpacing: 1,
  },
  displayDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: companyColors.darkBlue,
    marginBottom: 20,
  },
  calendar: {
    borderRadius: 10,
  },
  timeSection: {
    marginBottom: 30,
  },
  timeScrollContainer: {
    maxHeight: 150,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 5,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    minWidth: '22%',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedTimeSlot: {
    backgroundColor: companyColors.green,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: companyColors.darkBlue,
  },
  selectedTimeText: {
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: companyColors.darkBlue,
    letterSpacing: 1,
  },
  scheduleButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: companyColors.green,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#DDD',
  },
  scheduleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 1,
  },
});

export default CustomCalendar; 