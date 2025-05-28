import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { NotificationSettings } from '../components/NotificationSettings';

export const SettingsScreen: React.FC = () => {
  const handleSettingsChange = (settings: Record<string, boolean>) => {
    console.log('Настройки уведомлений изменены:', settings);
    // Здесь можно сохранить настройки локально
  };

  return (
    <ScrollView style={styles.container}>
      <NotificationSettings onSettingsChange={handleSettingsChange} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
}); 