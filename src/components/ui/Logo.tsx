import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import appTheme from '../../constants/theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  withText?: boolean;
}

/**
 * Компонент логотипа приложения с персонажем-мастером
 */
const Logo: React.FC<LogoProps> = ({ size = 'medium', withText = true }) => {
  // Определяем размер изображения на основе переданного параметра
  const getImageSize = () => {
    switch (size) {
      case 'small':
        return { width: 60, height: 80 };
      case 'large':
        return { width: 150, height: 200 };
      case 'medium':
      default:
        return { width: 90, height: 120 };
    }
  };

  // Определяем размер текста на основе размера логотипа
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return appTheme.fontSizes.large;
      case 'large':
        return appTheme.fontSizes.heading1;
      case 'medium':
      default:
        return appTheme.fontSizes.heading2;
    }
  };

  const imageSize = getImageSize();

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/character-transparent.png')}
        style={[styles.characterImage, imageSize]}
        resizeMode="contain"
      />
      {withText && (
        <Text style={[styles.text, { fontSize: getFontSize() }]}>
          <Text style={styles.letterD}>Д</Text>
          <Text style={styles.letterRegular}>октор</Text>
          <Text style={styles.letterD}>Д</Text>
          <Text style={styles.letterRegular}>ом</Text>
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterImage: {
    borderRadius: 10,
  },
  text: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  letterD: {
    color: '#95C11F',
  },
  letterRegular: {
    color: '#182237',
  },
});

export default Logo; 