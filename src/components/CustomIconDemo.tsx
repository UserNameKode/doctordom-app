import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import CustomSvgIcon from './CustomSvgIcon';
import BetterIcon from './BetterIcon';

const CustomIconDemo: React.FC = () => {
  const iconCategories = [
    {
      title: 'Строительство и ремонт',
      icons: [
        { name: 'drill', description: 'Дрель - сверление, ремонтные работы' },
        { name: 'brick-wall', description: 'Кирпичная стена - строительство, кладка' },
      ]
    },
    {
      title: 'Электрика',
      icons: [
        { name: 'plug-zap', description: 'Электрическая вилка - электромонтажные работы' },
        { name: 'cable', description: 'Кабель - прокладка проводки' },
      ]
    },
    {
      title: 'Сантехника',
      icons: [
        { name: 'bath', description: 'Ванна - сантехнические работы' },
      ]
    },
    {
      title: 'Уборка',
      icons: [
        { name: 'brush-cleaning', description: 'Щетка для уборки - клининговые услуги' },
      ]
    },
    {
      title: 'Мебель и интерьер',
      icons: [
        { name: 'armchair', description: 'Кресло - сборка мебели, меблировка' },
        { name: 'door-open', description: 'Открытая дверь - установка дверей' },
      ]
    },
    {
      title: 'Техника',
      icons: [
        { name: 'microwave', description: 'Микроволновка - ремонт бытовой техники' },
      ]
    },
    {
      title: 'Грузоперевозки',
      icons: [
        { name: 'truck', description: 'Грузовик - переезды, доставка' },
      ]
    },
    {
      title: 'Ремонт окон',
      icons: [
        { name: 'panels-top-left', description: 'Панели - ремонт окон, оконные рамы' },
      ]
    },
    {
      title: 'Бизнес услуги',
      icons: [
        { name: 'briefcase-business', description: 'Деловой портфель - консультации, бизнес-услуги' },
      ]
    },
    {
      title: 'Общие услуги',
      icons: [
        { name: 'clock', description: 'Часы - срочные услуги, почасовая работа' },
      ]
    },
  ];

  const betterIconExamples = [
    { name: 'construction', type: 'category', description: 'Строительство (использует drill)' },
    { name: 'plumbing', type: 'category', description: 'Сантехника (использует bath)' },
    { name: 'electrical', type: 'category', description: 'Электрика (использует plug-zap)' },
    { name: 'cleaning', type: 'category', description: 'Уборка (использует brush-cleaning)' },
    { name: 'furniture', type: 'category', description: 'Мебель (использует armchair)' },
    { name: 'delivery', type: 'category', description: 'Доставка (использует truck)' },
    { name: 'consulting', type: 'category', description: 'Консультации (использует briefcase-business)' },
    { name: 'window-repair', type: 'category', description: 'Ремонт окон (использует panels-top-left)' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>Демонстрация кастомных иконок</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Прямое использование CustomSvgIcon</Text>
        {iconCategories.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            {category.icons.map((icon, iconIndex) => (
              <View key={iconIndex} style={styles.iconRow}>
                <View style={styles.iconContainer}>
                  <CustomSvgIcon name={icon.name} size={32} color="#95C11F" />
                </View>
                <View style={styles.iconInfo}>
                  <Text style={styles.iconName}>{icon.name}</Text>
                  <Text style={styles.iconDescription}>{icon.description}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Использование через BetterIcon</Text>
        <Text style={styles.sectionSubtitle}>
          Эти иконки автоматически используют кастомные SVG через BetterIcon компонент
        </Text>
        {betterIconExamples.map((example, index) => (
          <View key={index} style={styles.iconRow}>
            <View style={styles.iconContainer}>
              <BetterIcon 
                name={example.name} 
                type={example.type} 
                size={32} 
                color="#95C11F" 
              />
            </View>
            <View style={styles.iconInfo}>
              <Text style={styles.iconName}>{example.name}</Text>
              <Text style={styles.iconDescription}>{example.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Сравнение размеров</Text>
        <View style={styles.sizeRow}>
          <View style={styles.sizeExample}>
            <CustomSvgIcon name="drill" size={16} color="#95C11F" />
            <Text style={styles.sizeLabel}>16px</Text>
          </View>
          <View style={styles.sizeExample}>
            <CustomSvgIcon name="drill" size={24} color="#95C11F" />
            <Text style={styles.sizeLabel}>24px</Text>
          </View>
          <View style={styles.sizeExample}>
            <CustomSvgIcon name="drill" size={32} color="#95C11F" />
            <Text style={styles.sizeLabel}>32px</Text>
          </View>
          <View style={styles.sizeExample}>
            <CustomSvgIcon name="drill" size={48} color="#95C11F" />
            <Text style={styles.sizeLabel}>48px</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Цветовые варианты</Text>
        <View style={styles.colorRow}>
          <View style={styles.colorExample}>
            <CustomSvgIcon name="truck" size={32} color="#95C11F" />
            <Text style={styles.colorLabel}>Зеленый</Text>
          </View>
          <View style={styles.colorExample}>
            <CustomSvgIcon name="truck" size={32} color="#FF6B6B" />
            <Text style={styles.colorLabel}>Красный</Text>
          </View>
          <View style={styles.colorExample}>
            <CustomSvgIcon name="truck" size={32} color="#4ECDC4" />
            <Text style={styles.colorLabel}>Бирюзовый</Text>
          </View>
          <View style={styles.colorExample}>
            <CustomSvgIcon name="truck" size={32} color="#45B7D1" />
            <Text style={styles.colorLabel}>Синий</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#95C11F',
    marginBottom: 10,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginBottom: 8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconInfo: {
    flex: 1,
  },
  iconName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  iconDescription: {
    fontSize: 14,
    color: '#666666',
  },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
  },
  sizeExample: {
    alignItems: 'center',
  },
  sizeLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
  },
  colorExample: {
    alignItems: 'center',
  },
  colorLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
  },
});

export default CustomIconDemo; 