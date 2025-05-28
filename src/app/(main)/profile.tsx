import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, Platform, StatusBar, Dimensions } from 'react-native';
import { Text, Avatar, Button, Card, Divider, List, useTheme, TextInput, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import appTheme from '../../constants/theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AnimatedButton from '../../components/ui/AnimatedButton';
import ScreenTransition from '../../components/ui/ScreenTransition';
import { getUserProfile, updateUserProfile, getUserStats, getUserLastAddress } from '../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';

/**
 * Экран профиля пользователя
 */
const ProfileScreen = () => {
  const { user, logout, isLoading } = useAuth();
  const theme = useTheme();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Состояния для редактирования профиля
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  // Статистика пользователя
  const [userStats, setUserStats] = useState({
    completedOrders: 0,
    activeOrders: 0,
    favoriteServices: 0,
    memberSince: 'Недавно'
  });

  // Загрузка данных пользователя
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      setProfileLoading(true);
      
      try {
        // Загружаем профиль пользователя
        const { data: profile, error: profileError } = await getUserProfile(user.id);
        
        if (profileError) {
          console.error('Ошибка при загрузке профиля:', profileError);
        } else if (profile) {
          setName(profile.name || user.name || 'Пользователь');
          setPhone(profile.phone || '');
          setCity(profile.city || '');
        }

        // Загружаем статистику пользователя
        const { data: stats, error: statsError } = await getUserStats(user.id);
        
        if (statsError) {
          console.error('Ошибка при загрузке статистики:', statsError);
        } else if (stats) {
          setUserStats(stats);
        }

        // Загружаем последний адрес пользователя
        const { data: addressData, error: addressError } = await getUserLastAddress(user.id);
        
        if (addressError) {
          console.error('Ошибка при загрузке адреса:', addressError);
        } else if (addressData) {
          setAddress(addressData.address || '');
          // Если город не установлен в профиле, используем город из адреса
          if (!profile?.city && addressData.city) {
            setCity(addressData.city);
          }
        }

      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
      } finally {
        setProfileLoading(false);
      }
    };
    
    loadUserData();
  }, [user?.id, user?.name]);

  // Обработчик выхода из аккаунта
  const handleLogout = async () => {
    Alert.alert(
      'Выход из аккаунта',
      'Вы действительно хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            setLogoutLoading(true);
            try {
              await logout();
              // Выход успешен, навигация произойдет автоматически через RootNavigator
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
            } finally {
              setLogoutLoading(false);
            }
          },
        },
      ]
    );
  };

  // Обработчик открытия модального окна редактирования
  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  // Обработчик сохранения профиля
  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setSavingProfile(true);
    
    try {
      // Обновляем профиль в базе данных
      const { error } = await updateUserProfile(user.id, {
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        updated_at: new Date().toISOString(),
      });
      
      if (error) throw error;
      
      Alert.alert('Успех', 'Данные профиля успешно обновлены');
      setEditModalVisible(false);
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      Alert.alert('Ошибка', 'Не удалось обновить данные профиля');
    } finally {
      setSavingProfile(false);
    }
  };

  // Заглушки для обработчиков нажатий
  const handlePaymentMethods = () => {
    Alert.alert('Информация', 'Управление способами оплаты будет доступно в следующих версиях');
  };

  const handleAddresses = () => {
    Alert.alert('Информация', 'Управление адресами будет доступно в следующих версиях');
  };

  const handleNotifications = () => {
    Alert.alert('Информация', 'Настройки уведомлений будут доступны в следующих версиях');
  };

  const handleHelp = () => {
    Alert.alert('Информация', 'Служба поддержки будет доступна в следующих версиях');
  };

  const handleAbout = () => {
    Alert.alert('О приложении', 'ДокторДом - сервис бытовых услуг\nВерсия 1.0.0');
  };

  // Показываем индикатор загрузки, если данные загружаются
  if (profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appTheme.colors.primary} />
          <Text style={styles.loadingText}>Загрузка профиля...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Современная шапка с градиентом */}
      <LinearGradient
        colors={['#95C11F', '#7BA428', '#6B9532']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <Animated.View entering={FadeInUp.duration(800)} style={styles.headerContent}>
            {/* Декоративные элементы */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            
            <View style={styles.profileHeader}>
              <Animated.View entering={FadeInUp.delay(200).duration(600)}>
                <View style={styles.avatarContainer}>
                  <Avatar.Text
                    size={80}
                    label={name.substring(0, 2).toUpperCase()}
                    style={styles.modernAvatar}
                    color="#FFFFFF"
                    labelStyle={styles.avatarLabel}
                  />
                  <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditProfile}>
                    <Ionicons name="camera" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
              
              <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.profileHeaderInfo}>
                <Text style={styles.modernProfileName}>{name}</Text>
                <Text style={styles.modernProfileEmail}>{user?.email || 'user@example.com'}</Text>
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.modernProfileLocation}>{city || 'Город не указан'}</Text>
                </View>
                
                <TouchableOpacity style={styles.modernEditButton} onPress={handleEditProfile}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.editButtonGradient}
                  >
                    <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.editButtonText}>Редактировать</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* Современная статистика */}
          <Animated.View entering={FadeInDown.delay(600).duration(800)} style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Моя активность</Text>
            <View style={styles.modernStatsContainer}>
              <View style={styles.statsRow}>
                <Animated.View entering={SlideInRight.delay(700).duration(600)} style={[styles.modernStatCard, { backgroundColor: '#4CAF50' }]}>
                  <LinearGradient colors={['#4CAF50', '#45A049']} style={styles.statCardGradient}>
                    <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
                    <Text style={styles.modernStatNumber}>{userStats.completedOrders}</Text>
                    <Text style={styles.modernStatLabel}>Выполнено</Text>
                  </LinearGradient>
                </Animated.View>
                
                <Animated.View entering={SlideInRight.delay(800).duration(600)} style={[styles.modernStatCard, { backgroundColor: '#FF9800' }]}>
                  <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.statCardGradient}>
                    <Ionicons name="time" size={32} color="#FFFFFF" />
                    <Text style={styles.modernStatNumber}>{userStats.activeOrders}</Text>
                    <Text style={styles.modernStatLabel}>В работе</Text>
                  </LinearGradient>
                </Animated.View>
              </View>
              
              <View style={styles.statsRow}>
                <Animated.View entering={SlideInRight.delay(900).duration(600)} style={[styles.modernStatCard, { backgroundColor: '#E91E63' }]}>
                  <LinearGradient colors={['#E91E63', '#C2185B']} style={styles.statCardGradient}>
                    <Ionicons name="heart" size={32} color="#FFFFFF" />
                    <Text style={styles.modernStatNumber}>{userStats.favoriteServices}</Text>
                    <Text style={styles.modernStatLabel}>Избранное</Text>
                  </LinearGradient>
                </Animated.View>
                
                <Animated.View entering={SlideInRight.delay(1000).duration(600)} style={[styles.modernStatCard, { backgroundColor: '#2196F3' }]}>
                  <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.statCardGradient}>
                    <Ionicons name="calendar" size={32} color="#FFFFFF" />
                    <Text style={styles.modernStatNumber}>{userStats.completedOrders + userStats.activeOrders}</Text>
                    <Text style={styles.modernStatLabel}>Всего заказов</Text>
                  </LinearGradient>
                </Animated.View>
              </View>
            </View>
          </Animated.View>

          {/* Настройки профиля */}
          <ScreenTransition type="slide" duration={600}>
            <Card style={styles.settingsCard}>
              <Card.Title title="Настройки" titleStyle={styles.cardTitle} />
              <Card.Content>
                <List.Item
                  title="Способы оплаты"
                  description="Управление картами и способами оплаты"
                  left={props => <List.Icon {...props} icon="credit-card" color={theme.colors.primary} />}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                  onPress={handlePaymentMethods}
                />
                <Divider />
                <List.Item
                  title="Адреса"
                  description="Сохраненные адреса доставки"
                  left={props => <List.Icon {...props} icon="map-marker" color={theme.colors.primary} />}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                  onPress={handleAddresses}
                />
                <Divider />
                <List.Item
                  title="Уведомления"
                  description="Настройки push-уведомлений"
                  left={props => <List.Icon {...props} icon="bell" color={theme.colors.primary} />}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                  onPress={handleNotifications}
                />
              </Card.Content>
            </Card>
          </ScreenTransition>

          {/* Дополнительная информация */}
          <ScreenTransition type="slide" duration={700}>
            <Card style={styles.settingsCard}>
              <Card.Title title="Информация" titleStyle={styles.cardTitle} />
              <Card.Content>
                <List.Item
                  title="Служба поддержки"
                  description="Связаться с нами"
                  left={props => <List.Icon {...props} icon="headset" color={theme.colors.primary} />}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                  onPress={handleHelp}
                />
                <Divider />
                <List.Item
                  title="О приложении"
                  description="Версия и информация"
                  left={props => <List.Icon {...props} icon="information" color={theme.colors.primary} />}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                  onPress={handleAbout}
                />
              </Card.Content>
            </Card>
          </ScreenTransition>

          {/* Кнопка выхода */}
          <ScreenTransition type="scale" duration={800}>
            <List.Item
              title="Выйти из аккаунта"
              titleStyle={[styles.menuItemTitle, { color: theme.colors.error }]}
              onPress={handleLogout}
              left={() => <MaterialCommunityIcons name="logout" size={20} color={theme.colors.error} />}
            />
          </ScreenTransition>
        </View>
      </ScrollView>

      {/* Модальное окно редактирования профиля */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScreenTransition type="scale">
            <View style={styles.modalContent}>
              <Text variant="titleLarge" style={styles.modalTitle}>Редактирование профиля</Text>
              
              <TextInput
                label="Имя"
                value={name}
                onChangeText={setName}
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="Телефон"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                mode="outlined"
                keyboardType="phone-pad"
              />
              
              <TextInput
                label="Город"
                value={city}
                onChangeText={setCity}
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="Адрес"
                value={address}
                onChangeText={setAddress}
                style={styles.input}
                mode="outlined"
                multiline
              />
              
              <View style={styles.modalButtons}>
                <AnimatedButton
                  title="Отмена"
                  onPress={() => setEditModalVisible(false)}
                  mode="outline"
                  style={styles.modalButton}
                />
                <AnimatedButton
                  title="Сохранить"
                  onPress={handleSaveProfile}
                  loading={savingProfile}
                  disabled={savingProfile}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </ScreenTransition>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Новые стили для современного дизайна
  headerGradient: {
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  modernAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarLabel: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileHeaderInfo: {
    alignItems: 'center',
  },
  modernProfileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modernProfileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modernProfileLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  modernEditButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  
  // Контейнер для скролла
  scrollContainer: {
    flex: 1,
    marginTop: -10,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 100,
  },
  
  // Современная статистика
  statsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  modernStatsContainer: {
    gap: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  modernStatCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  statCardGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  modernStatNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  modernStatLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Обновленные стили для карточек
  settingsCard: {
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    color: '#2C3E50',
    fontWeight: 'bold',
    fontSize: 18,
  },
  logoutButton: {
    marginVertical: 20,
    borderColor: '#E74C3C',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  input: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    color: '#7F8C8D',
    fontSize: 16,
  },
  menuItemTitle: {
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 