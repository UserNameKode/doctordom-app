import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import BetterIcon from './BetterIcon';
import appTheme from '../constants/theme';

const IconShowcase = () => {
  const iconCategories = [
    {
      title: 'Строительство и ремонт',
      icons: [
        { name: 'construction', label: 'Строительство' },
        { name: 'renovation', label: 'Ремонт' },
        { name: 'painting', label: 'Покраска' },
        { name: 'roofing', label: 'Кровля' },
        { name: 'flooring', label: 'Полы' },
      ]
    },
    {
      title: 'Коммунальные услуги',
      icons: [
        { name: 'plumbing', label: 'Сантехника' },
        { name: 'electrical', label: 'Электрика' },
        { name: 'cleaning', label: 'Уборка' },
        { name: 'lucide--snowflake', label: 'Кондиционеры' },
      ]
    },
    {
      title: 'Красота и здоровье',
      icons: [
        { name: 'beauty', label: 'Красота' },
        { name: 'massage', label: 'Массаж' },
        { name: 'fitness', label: 'Фитнес' },
        { name: 'yoga', label: 'Йога' },
        { name: 'medical', label: 'Медицина' },
        { name: 'dental', label: 'Стоматология' },
      ]
    },
    {
      title: 'Технологии',
      icons: [
        { name: 'computer', label: 'Компьютеры' },
        { name: 'mobile', label: 'Мобильные' },
        { name: 'internet', label: 'Интернет' },
        { name: 'design', label: 'Дизайн' },
        { name: 'ai', label: 'ИИ' },
        { name: 'gaming', label: 'Игры' },
      ]
    },
    {
      title: 'Транспорт и доставка',
      icons: [
        { name: 'car', label: 'Автомобили' },
        { name: 'delivery', label: 'Доставка' },
        { name: 'travel', label: 'Путешествия' },
      ]
    },
    {
      title: 'Развлечения',
      icons: [
        { name: 'photo', label: 'Фото' },
        { name: 'video', label: 'Видео' },
        { name: 'music', label: 'Музыка' },
        { name: 'party', label: 'Праздники' },
        { name: 'wedding', label: 'Свадьбы' },
        { name: 'gift', label: 'Подарки' },
      ]
    },
    {
      title: 'Еда и напитки',
      icons: [
        { name: 'food', label: 'Еда' },
        { name: 'cake', label: 'Торты' },
        { name: 'pizza', label: 'Пицца' },
        { name: 'coffee', label: 'Кофе' },
        { name: 'restaurant', label: 'Ресторан' },
      ]
    },
    {
      title: 'Спорт',
      icons: [
        { name: 'football', label: 'Футбол' },
        { name: 'basketball', label: 'Баскетбол' },
        { name: 'tennis', label: 'Теннис' },
        { name: 'swimming', label: 'Плавание' },
        { name: 'golf', label: 'Гольф' },
        { name: 'fishing', label: 'Рыбалка' },
      ]
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Демонстрация иконок</Text>
      
      {iconCategories.map((category, categoryIndex) => (
        <View key={categoryIndex} style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <View style={styles.iconsGrid}>
            {category.icons.map((icon, iconIndex) => (
              <View key={iconIndex} style={styles.iconItem}>
                <View style={styles.iconCircle}>
                  <BetterIcon 
                    name={icon.name} 
                    type="category" 
                    size={24} 
                    color={appTheme.colors.primary} 
                  />
                </View>
                <Text style={styles.iconLabel}>{icon.label}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: appTheme.colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  categoryContainer: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: appTheme.colors.text,
    marginBottom: 15,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(149, 193, 31, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconLabel: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default IconShowcase; 