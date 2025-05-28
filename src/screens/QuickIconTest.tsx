import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from '../components/Icon';

export const QuickIconTest: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🎨 Тест новых иконок</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Категории услуг</Text>
        <View style={styles.iconRow}>
          <View style={styles.iconItem}>
            <Icon name="repair" size={40} color="#059669" />
            <Text style={styles.iconLabel}>repair</Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="electrical" size={40} color="#dc2626" />
            <Text style={styles.iconLabel}>electrical</Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="plumbing" size={40} color="#2563eb" />
            <Text style={styles.iconLabel}>plumbing</Text>
          </View>
        </View>
        
        <View style={styles.iconRow}>
          <View style={styles.iconItem}>
            <Icon name="cleaning" size={40} color="#7c3aed" />
            <Text style={styles.iconLabel}>cleaning</Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="furniture" size={40} color="#ea580c" />
            <Text style={styles.iconLabel}>furniture</Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="garden" size={40} color="#16a34a" />
            <Text style={styles.iconLabel}>garden</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Навигация</Text>
        <View style={styles.iconRow}>
          <View style={styles.iconItem}>
            <Icon name="services" size={40} color="#059669" />
            <Text style={styles.iconLabel}>services</Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="orders" size={40} color="#dc2626" />
            <Text style={styles.iconLabel}>orders</Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="profile" size={40} color="#2563eb" />
            <Text style={styles.iconLabel}>profile</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>UI элементы</Text>
        <View style={styles.iconRow}>
          <View style={styles.iconItem}>
            <Icon name="search" size={40} color="#059669" />
            <Text style={styles.iconLabel}>search</Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="heart" size={40} color="#dc2626" />
            <Text style={styles.iconLabel}>heart</Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="star" size={40} color="#eab308" />
            <Text style={styles.iconLabel}>star</Text>
          </View>
        </View>
        
        <View style={styles.iconRow}>
          <View style={styles.iconItem}>
            <Icon name="phone" size={40} color="#16a34a" />
            <Text style={styles.iconLabel}>phone</Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="message" size={40} color="#2563eb" />
            <Text style={styles.iconLabel}>message</Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="calendar" size={40} color="#7c3aed" />
            <Text style={styles.iconLabel}>calendar</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#1e293b',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#374151',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  iconItem: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    minWidth: 80,
  },
  iconLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default QuickIconTest; 