import React from 'react';
import { View, StyleSheet, Modal, Dimensions } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import appTheme from '../../constants/theme';
import AnimatedButton from './AnimatedButton';

const { width: screenWidth } = Dimensions.get('window');

interface CustomAlertProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message: string;
  primaryButtonText: string;
  secondaryButtonText?: string;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  icon?: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  onDismiss,
  title,
  message,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryPress,
  onSecondaryPress,
  icon = 'information',
  type = 'info'
}) => {
  console.log('CustomAlert рендерится, visible:', visible, 'title:', title);
  
  const getTypeConfig = () => {
    switch (type) {
      case 'warning':
        return {
          iconColor: appTheme.colors.warning,
          iconBg: appTheme.colors.warning + '20',
          borderColor: appTheme.colors.warning,
        };
      case 'success':
        return {
          iconColor: appTheme.colors.success,
          iconBg: appTheme.colors.success + '20',
          borderColor: appTheme.colors.success,
        };
      case 'error':
        return {
          iconColor: appTheme.colors.error,
          iconBg: appTheme.colors.error + '20',
          borderColor: appTheme.colors.error,
        };
      default:
        return {
          iconColor: appTheme.colors.primary,
          iconBg: appTheme.colors.primary + '20',
          borderColor: appTheme.colors.primary,
        };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.modal, { borderTopColor: typeConfig.borderColor }]}>
            {/* Иконка */}
            <View style={[styles.iconContainer, { backgroundColor: typeConfig.iconBg }]}>
              <MaterialCommunityIcons 
                name={icon} 
                size={32} 
                color={typeConfig.iconColor} 
              />
            </View>
            
            {/* Кнопка закрытия */}
            <IconButton
              icon="close"
              size={20}
              onPress={onDismiss}
              style={styles.closeButton}
              iconColor={appTheme.colors.textSecondary}
            />
            
            {/* Контент */}
            <View style={styles.content}>
              <Text variant="headlineSmall" style={styles.title}>
                {title}
              </Text>
              
              <Text variant="bodyMedium" style={styles.message}>
                {message}
              </Text>
            </View>
            
            {/* Кнопки */}
            <View style={styles.buttonContainer}>
              {secondaryButtonText && (
                <AnimatedButton
                  title={secondaryButtonText}
                  onPress={onSecondaryPress || onDismiss}
                  mode="outline"
                  style={StyleSheet.flatten([styles.button, styles.secondaryButton])}
                  textStyle={{ color: appTheme.colors.textSecondary }}
                />
              )}
              
              <AnimatedButton
                title={primaryButtonText}
                onPress={onPrimaryPress}
                mode="primary"
                style={StyleSheet.flatten([styles.button, styles.primaryButton])}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    width: screenWidth * 0.85,
    maxWidth: 400,
  },
  modal: {
    backgroundColor: appTheme.colors.white,
    borderRadius: 20,
    paddingVertical: appTheme.spacing.xl,
    paddingHorizontal: appTheme.spacing.l,
    borderTopWidth: 4,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    position: 'relative',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: appTheme.spacing.l,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    margin: 0,
  },
  content: {
    alignItems: 'center',
    marginBottom: appTheme.spacing.xl,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: appTheme.colors.text,
    marginBottom: appTheme.spacing.m,
  },
  message: {
    textAlign: 'center',
    color: appTheme.colors.textSecondary,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: appTheme.spacing.m,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
  primaryButton: {
    elevation: 2,
  },
  secondaryButton: {
    borderColor: appTheme.colors.border,
  },
});

export default CustomAlert; 