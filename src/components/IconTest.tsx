import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomSvgIcon from './CustomSvgIcon';
import BetterIcon from './BetterIcon';

const IconTest: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Тест иконки panels-top-left</Text>
      
      <View style={styles.testRow}>
        <Text style={styles.label}>Прямое использование CustomSvgIcon:</Text>
        <CustomSvgIcon name="panels-top-left" size={32} color="#95C11F" />
      </View>
      
      <View style={styles.testRow}>
        <Text style={styles.label}>Через BetterIcon (window-repair):</Text>
        <BetterIcon name="window-repair" type="category" size={32} color="#95C11F" />
      </View>
      
      <View style={styles.testRow}>
        <Text style={styles.label}>Для сравнения - drill иконка:</Text>
        <CustomSvgIcon name="drill" size={32} color="#95C11F" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
  },
  label: {
    flex: 1,
    fontSize: 16,
    marginRight: 15,
  },
});

export default IconTest; 