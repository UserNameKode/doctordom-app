import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon, { IconName } from '../components/Icon';

// Все доступные иконки
const categoryIcons: IconName[] = [
  'repair', 'construction', 'tools', 'electrical', 'electrical-alt',
  'plumbing', 'water', 'bath', 'cleaning', 'vacuum',
  'furniture', 'assembly', 'bed', 'armchair', 'appliances',
  'repair-tech', 'garden', 'landscaping', 'moving', 'delivery',
  'handyman', 'ladder', 'ventilation', 'air-conditioning',
  'paint', 'house', 'house-simple'
];

const navigationIcons: IconName[] = ['services', 'orders', 'profile'];

const uiIcons: IconName[] = [
  'chevron-right', 'chevron-left', 'chevron-up', 'chevron-down',
  'check', 'filter', 'search', 'calendar', 'map-pin',
  'user', 'heart', 'clock', 'logout', 'star',
  'phone', 'message', 'location', 'plus', 'minus', 'x'
];

interface IconItemProps {
  name: IconName;
  color?: string;
}

const IconItem: React.FC<IconItemProps> = ({ name, color = '#2563eb' }) => (
  <View style={styles.iconItem}>
    <Icon name={name} size={32} color={color} />
    <Text style={styles.iconName}>{name}</Text>
  </View>
);

interface IconSectionProps {
  title: string;
  icons: IconName[];
  color?: string;
}

const IconSection: React.FC<IconSectionProps> = ({ title, icons, color }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.iconGrid}>
      {icons.map((iconName) => (
        <IconItem key={iconName} name={iconName} color={color} />
      ))}
    </View>
  </View>
);

export const IconShowcaseScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>🎨 Новые иконки DoctorDom</Text>
          <Text style={styles.subtitle}>
            Современные иконки Phosphor для лучшего пользовательского опыта
          </Text>
        </View>

        <IconSection
          title="📁 Категории услуг"
          icons={categoryIcons}
          color="#059669"
        />

        <IconSection
          title="🧭 Навигация"
          icons={navigationIcons}
          color="#dc2626"
        />

        <IconSection
          title="🎨 UI элементы"
          icons={uiIcons}
          color="#7c3aed"
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Всего иконок: {categoryIcons.length + navigationIcons.length + uiIcons.length}
          </Text>
          <Text style={styles.footerSubtext}>
            Источник: Phosphor Icons
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconName: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default IconShowcaseScreen; 