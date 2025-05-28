import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import appTheme from '../../constants/theme';

interface FormButtonProps {
  title: string;
  onPress: () => void;
  mode?: 'text' | 'outlined' | 'contained';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: any;
  textColor?: string;
}

/**
 * Компонент кнопки для форм
 */
const FormButton: React.FC<FormButtonProps> = ({
  title,
  onPress,
  mode = 'contained',
  loading = false,
  disabled = false,
  icon,
  style,
  textColor,
}) => {
  return (
    <Button
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      icon={icon}
      style={[styles.button, style]}
      textColor={textColor}
      labelStyle={styles.buttonText}
    >
      {title}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: appTheme.borderRadius.medium,
    padding: appTheme.spacing.xs,
    marginVertical: appTheme.spacing.s,
  },
  buttonText: {
    fontSize: appTheme.fontSizes.medium,
    fontWeight: 'bold',
  },
});

export default FormButton; 