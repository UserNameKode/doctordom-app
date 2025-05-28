import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import appTheme from '../../constants/theme';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
  autoCompleteType?: string;
  style?: any;
}

/**
 * Компонент поля ввода для форм с поддержкой валидации
 */
const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  disabled = false,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Обработчики фокуса и потери фокуса
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Переключатель видимости пароля
  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  return (
    <>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[styles.input, style]}
        error={!!error}
        mode="outlined"
        outlineColor={isFocused ? appTheme.colors.primary : appTheme.colors.border}
        activeOutlineColor={appTheme.colors.primary}
        right={
          secureTextEntry ? (
            <TextInput.Icon
              icon={isPasswordVisible ? 'eye-off' : 'eye'}
              onPress={togglePasswordVisibility}
              color={appTheme.colors.textSecondary}
            />
          ) : null
        }
        {...props}
      />
      {error && <HelperText type="error" visible={!!error}>{error}</HelperText>}
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: appTheme.spacing.xs,
    backgroundColor: appTheme.colors.background,
  },
});

export default FormInput; 