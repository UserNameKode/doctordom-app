import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Button, Card, TextInput, RadioButton, Chip } from 'react-native-paper';
import { massNotificationService } from '../services/massNotificationService';
import { NOTIFICATION_TYPES, getEnabledNotificationTypes } from '../config/notificationConfig';
import { useAuth } from '../context/AuthContext';
import appTheme from '../constants/theme';

const MassNotificationManager: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'ios' | 'android'>('all');
  const [stats, setStats] = useState<any[]>([]);
  const { user } = useAuth();

  // Загружаем статистику при монтировании
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const notificationStats = await massNotificationService.getNotificationStats(5);
      setStats(notificationStats);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  const sendMassNotification = async () => {
    if (!user) {
      Alert.alert('Ошибка', 'Необходимо войти в аккаунт');
      return;
    }

    if (!title.trim() || !body.trim()) {
      Alert.alert('Ошибка', 'Заполните заголовок и текст уведомления');
      return;
    }

    Alert.alert(
      'Подтверждение',
      `Отправить уведомление всем пользователям ${targetAudience === 'all' ? '' : targetAudience}?\n\nЗаголовок: ${title}\nТекст: ${body}`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Отправить', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              let result;
              
              if (targetAudience === 'all') {
                result = await massNotificationService.sendToAll(title, body);
              } else {
                result = await massNotificationService.sendByPlatform(targetAudience, title, body);
              }

              Alert.alert(
                'Успех!',
                `Рассылка завершена:\n• Всего пользователей: ${result.totalUsers}\n• Отправлено: ${result.sentCount}\n• Ошибок: ${result.failedCount}`
              );

              // Очищаем форму и обновляем статистику
              setTitle('');
              setBody('');
              await loadStats();

            } catch (error) {
              console.error('Ошибка массовой рассылки:', error);
              Alert.alert('Ошибка', 'Не удалось отправить рассылку');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const sendQuickTemplate = async (templateType: string) => {
    setIsLoading(true);
    try {
      const templates = massNotificationService.getQuickTemplates();
      let notification;

      switch (templateType) {
        case 'promotion':
          notification = templates.promotion('20%', 'Скидка 20% на все услуги сантехника до конца месяца!');
          break;
        case 'newService':
          notification = templates.newService('Установка кондиционеров');
          break;
        case 'holiday':
          notification = templates.holiday('Новым годом');
          break;
        default:
          return;
      }

      const result = await massNotificationService.sendToAll(
        notification.title,
        notification.body,
        notification.data
      );

      Alert.alert(
        'Шаблон отправлен!',
        `• Всего пользователей: ${result.totalUsers}\n• Отправлено: ${result.sentCount}\n• Ошибок: ${result.failedCount}`
      );

      await loadStats();

    } catch (error) {
      console.error('Ошибка отправки шаблона:', error);
      Alert.alert('Ошибка', 'Не удалось отправить шаблон');
    } finally {
      setIsLoading(false);
    }
  };

  const enabledTypes = getEnabledNotificationTypes();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            📢 Массовые рассылки
          </Text>
          
          <Text variant="bodyMedium" style={styles.subtitle}>
            Управление push уведомлениями для всех пользователей DoctorDom
          </Text>

          {/* Форма создания рассылки */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Создать рассылку:
            </Text>

            <TextInput
              label="Заголовок уведомления"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
              maxLength={50}
              right={<TextInput.Affix text={`${title.length}/50`} />}
            />

            <TextInput
              label="Текст уведомления"
              value={body}
              onChangeText={setBody}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              maxLength={200}
              right={<TextInput.Affix text={`${body.length}/200`} />}
            />

            <Text variant="titleSmall" style={styles.radioTitle}>
              Целевая аудитория:
            </Text>
            
            <RadioButton.Group 
              onValueChange={value => setTargetAudience(value as 'all' | 'ios' | 'android')} 
              value={targetAudience}
            >
              <View style={styles.radioItem}>
                <RadioButton value="all" />
                <Text>Все пользователи</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="ios" />
                <Text>Только iOS</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="android" />
                <Text>Только Android</Text>
              </View>
            </RadioButton.Group>

            <Button
              mode="contained"
              onPress={sendMassNotification}
              loading={isLoading}
              disabled={isLoading || !title.trim() || !body.trim()}
              style={styles.sendButton}
              icon="send"
            >
              Отправить рассылку
            </Button>
          </View>

          {/* Быстрые шаблоны */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Быстрые шаблоны:
            </Text>

            <View style={styles.templateButtons}>
              <Button
                mode="contained-tonal"
                onPress={() => sendQuickTemplate('promotion')}
                loading={isLoading}
                disabled={isLoading}
                style={styles.templateButton}
                icon="gift"
              >
                🎁 Акция 20%
              </Button>

              <Button
                mode="contained-tonal"
                onPress={() => sendQuickTemplate('newService')}
                loading={isLoading}
                disabled={isLoading}
                style={styles.templateButton}
                icon="plus"
              >
                🆕 Новая услуга
              </Button>

              <Button
                mode="contained-tonal"
                onPress={() => sendQuickTemplate('holiday')}
                loading={isLoading}
                disabled={isLoading}
                style={styles.templateButton}
                icon="party-popper"
              >
                🎉 Поздравление
              </Button>
            </View>
          </View>

          {/* Активные типы уведомлений */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Активные типы уведомлений:
            </Text>
            
            <View style={styles.chipContainer}>
              {Object.entries(enabledTypes).map(([key, config]) => (
                <Chip
                  key={key}
                  icon="check"
                  style={styles.chip}
                  textStyle={styles.chipText}
                >
                  {config.icon} {config.title}
                </Chip>
              ))}
            </View>
          </View>

          {/* Статистика */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Последние рассылки:
            </Text>

            {stats.length > 0 ? (
              stats.map((stat, index) => (
                <Card key={index} style={styles.statCard}>
                  <Card.Content>
                    <Text variant="titleSmall" style={styles.statTitle}>
                      {stat.title}
                    </Text>
                    <Text variant="bodySmall" style={styles.statBody}>
                      {stat.body}
                    </Text>
                    <View style={styles.statNumbers}>
                      <Text variant="bodySmall">
                        👥 {stat.total_users} • ✅ {stat.sent_count} • ❌ {stat.failed_count}
                      </Text>
                      <Text variant="bodySmall" style={styles.statDate}>
                        {new Date(stat.created_at).toLocaleDateString('ru-RU')}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              ))
            ) : (
              <Text variant="bodyMedium" style={styles.noStats}>
                Рассылки еще не отправлялись
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: appTheme.spacing.m,
    backgroundColor: appTheme.colors.background,
  },
  card: {
    backgroundColor: appTheme.colors.white,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: appTheme.spacing.s,
    color: appTheme.colors.primary,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: appTheme.spacing.l,
    color: appTheme.colors.textSecondary,
  },
  section: {
    marginBottom: appTheme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: appTheme.spacing.m,
    color: appTheme.colors.text,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: appTheme.spacing.m,
  },
  radioTitle: {
    marginBottom: appTheme.spacing.s,
    color: appTheme.colors.text,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: appTheme.spacing.xs,
  },
  sendButton: {
    marginTop: appTheme.spacing.m,
  },
  templateButtons: {
    gap: appTheme.spacing.s,
  },
  templateButton: {
    marginBottom: appTheme.spacing.xs,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appTheme.spacing.s,
  },
  chip: {
    marginBottom: appTheme.spacing.xs,
  },
  chipText: {
    fontSize: 12,
  },
  statCard: {
    marginBottom: appTheme.spacing.s,
    backgroundColor: appTheme.colors.surface,
  },
  statTitle: {
    fontWeight: 'bold',
    marginBottom: appTheme.spacing.xs,
  },
  statBody: {
    color: appTheme.colors.textSecondary,
    marginBottom: appTheme.spacing.s,
  },
  statNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statDate: {
    color: appTheme.colors.textSecondary,
    fontSize: 11,
  },
  noStats: {
    textAlign: 'center',
    color: appTheme.colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default MassNotificationManager; 