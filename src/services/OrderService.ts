// Интерфейс для создания заказа
export interface CreateOrderDto {
  serviceId: string;
  specialistId?: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  date: Date;
  time: string;
  description: string;
}

// Интерфейс для заказа
export interface Order {
  id: string;
  serviceName: string;
  serviceDescription?: string;
  specialistName: string | null;
  specialistAvatar?: string | null;
  specialistRating?: number;
  date: string;
  time: string;
  address: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  price: string;
  description?: string;
  createdAt: string;
}

/**
 * Сервис для работы с заказами
 */
export class OrderService {
  /**
   * Создание заказа
   * @param orderData Данные заказа
   * @returns Созданный заказ
   */
  static async createOrder(orderData: CreateOrderDto): Promise<Order> {
    try {
      console.log('Creating order with data:', JSON.stringify(orderData));
      console.log('Service ID type:', typeof orderData.serviceId, 'Value:', orderData.serviceId);
      console.log('Specialist ID type:', typeof orderData.specialistId, 'Value:', orderData.specialistId);
      
      // Импортируем функцию createOrder из supabase.ts
      const { createOrder, getServices, supabase, saveUserLastAddress } = await import('../lib/supabase');
      
      // Получаем информацию об услуге
      const { data: serviceData } = await getServices();
      const service = serviceData?.find(s => s.id === orderData.serviceId);
      
      if (!service) {
        console.error('Service not found for ID:', orderData.serviceId);
        throw new Error('Service not found');
      }
      
      console.log('Found service:', service);
      
      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Подготавливаем данные для сохранения в базу
      const orderToSave = {
        user_id: user.id,
        service_id: orderData.serviceId,
        specialist_id: orderData.specialistId || null,
        description: orderData.description || '',
        address: orderData.address,
        lat: orderData.coordinates.latitude,
        lng: orderData.coordinates.longitude,
        scheduled_date: orderData.date.toISOString().split('T')[0],
        scheduled_time_from: orderData.time.split(' - ')[0] + ':00',
        scheduled_time_to: orderData.time.split(' - ')[1] + ':00',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Логирование данных для отладки
      console.log('Данные для сохранения в базу:', JSON.stringify(orderToSave));
      console.log('specialist_id тип:', typeof orderToSave.specialist_id);
      console.log('specialist_id значение:', orderToSave.specialist_id);
      
      // Проверяем формат UUID для service_id
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (orderToSave.service_id && !uuidRegex.test(orderToSave.service_id)) {
        console.error('Некорректный формат UUID для service_id:', orderToSave.service_id);
        // Используем ID услуги из найденного сервиса
        orderToSave.service_id = service.id;
        console.log('Исправленный service_id:', orderToSave.service_id);
      }
      
      // Проверяем формат UUID для specialist_id
      if (orderToSave.specialist_id && !uuidRegex.test(orderToSave.specialist_id)) {
        console.error('Некорректный формат UUID для specialist_id:', orderToSave.specialist_id);
        // Если формат неверный, устанавливаем фиксированное значение
        orderToSave.specialist_id = 'cb7ce945-5728-4af8-a5fb-4d64420fef0a';
        console.log('Исправленный specialist_id:', orderToSave.specialist_id);
      }
      
      // Сохраняем заказ в базу данных
      const { data, error } = await createOrder(orderToSave);
      
      if (error) {
        console.error('Ошибка при сохранении заказа в базу:', error);
        throw error;
      }
      
      // Проверяем, что данные вернулись
      if (!data || data.length === 0) {
        throw new Error('Failed to create order: no data returned');
      }
      
      // Получаем ID созданного заказа
      const orderId = data[0]?.id;
      
      if (!orderId) {
        throw new Error('Failed to create order: no order ID returned');
      }
      
      // Сохраняем адрес в профиле пользователя
      try {
        await saveUserLastAddress(user.id, orderData.address, orderData.coordinates.latitude, orderData.coordinates.longitude);
      } catch (addressError) {
        console.error('Ошибка при сохранении адреса в профиль:', addressError);
        // Не прерываем выполнение, так как заказ уже создан
      }
      
      // Получаем имя специалиста если он назначен
      let specialistName = 'Мастер';
      if (orderToSave.specialist_id) {
        try {
          const { data: specialistData } = await supabase
            .from('specialists')
            .select('name')
            .eq('id', orderToSave.specialist_id)
            .single();
          
          if (specialistData?.name) {
            specialistName = specialistData.name;
          }
        } catch (specialistError) {
          console.error('Ошибка при получении имени специалиста:', specialistError);
        }
      }

      // Формируем объект Order для возврата
      const createdOrder: Order = {
        id: orderId,
        serviceName: service.name,
        specialistName: specialistName,
        date: this.formatDate(orderData.date),
        time: orderData.time,
        address: orderData.address,
        status: 'pending',
        price: service.price_from?.toString() || '0',
        description: orderData.description,
        createdAt: this.formatDate(new Date()),
      };

      // Отправляем уведомление о назначении мастера с реальными данными
      try {
        const { pushNotificationService } = await import('./pushNotificationService');
        
        // Форматируем дату для уведомления
        const formattedDate = orderData.date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long'
        });
        
        // Отправляем уведомление с реальными данными заказа
        await pushNotificationService.sendNotification('WORKER_ASSIGNED', {
          workerName: specialistName,
          scheduledDate: formattedDate,
          scheduledTime: orderData.time,
          orderId: orderId,
          serviceName: service.name
        });
        
        console.log('✅ Уведомление о назначении мастера отправлено');

        // Планируем напоминание за час до визита
        const scheduledDateTime = new Date(orderData.date);
        const [timeFrom] = orderData.time.split(' - ');
        const [hours, minutes] = timeFrom.split(':');
        scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        await pushNotificationService.scheduleReminderNotification(
          orderId,
          specialistName,
          scheduledDateTime
        );
        
        console.log('✅ Напоминание запланировано');
      } catch (notificationError) {
        console.error('❌ Ошибка отправки уведомления:', notificationError);
        // Не прерываем выполнение, так как заказ уже создан
      }
      
      return createdOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }
  
  /**
   * Получение списка заказов пользователя
   * @returns Список заказов
   */
  static async getUserOrders(): Promise<Order[]> {
    try {
      // Импортируем функцию getUserOrders из supabase.ts
      const { getUserOrders, supabase } = await import('../lib/supabase');
      
      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log('Загружаем заказы для пользователя:', user.id);
      
      // Получаем заказы пользователя из базы данных
      const { data: ordersData, error } = await getUserOrders(user.id);
      
      if (error) {
        console.error('Ошибка при получении заказов из базы:', error);
        throw error;
      }
      
      console.log('Получены заказы из базы:', ordersData);
      
      // Если заказов нет, возвращаем пустой массив
      if (!ordersData || ordersData.length === 0) {
        console.log('Заказы не найдены');
        return [];
      }
      
      // Преобразуем данные из базы в формат Order
      const orders: Order[] = ordersData.map(orderData => {
        const service = orderData.services;
        const specialist = orderData.specialists;
        
        const order = {
          id: orderData.id,
          serviceName: service?.name || 'Неизвестная услуга',
          serviceDescription: service?.description,
          specialistName: specialist?.name || null,
          specialistAvatar: specialist?.photo_url || null,
          specialistRating: specialist?.rating || undefined,
          date: this.formatDate(new Date(orderData.scheduled_date)),
          time: `${orderData.scheduled_time_from.slice(0, 5)} - ${orderData.scheduled_time_to.slice(0, 5)}`,
          address: orderData.address,
          status: orderData.status,
          price: service?.price_from?.toString() || '0',
          description: orderData.description,
          createdAt: this.formatDate(new Date(orderData.created_at)),
        };
        
        console.log('Преобразованный заказ:', order);
        return order;
      });
      
      console.log('Итоговый список заказов:', orders);
      return orders;
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw new Error('Failed to get user orders');
    }
  }
  
  /**
   * Получение деталей заказа
   * @param orderId ID заказа
   * @returns Детали заказа
   */
  static async getOrderDetails(orderId: string): Promise<Order> {
    try {
      // Импортируем необходимые функции из supabase.ts
      const { supabase } = await import('../lib/supabase');
      
      // Получаем заказ из базы данных
      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*, specialists(*)')
        .eq('id', orderId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!orderData) {
        throw new Error(`Order with ID ${orderId} not found`);
      }
      
      // Получаем данные об услуге отдельным запросом
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', orderData.service_id)
        .single();
      
      if (serviceError) {
        console.error('Ошибка при получении данных услуги:', serviceError);
      }
      
      // Преобразуем данные из базы в формат Order
      const order: Order = {
        id: orderData.id,
        serviceName: serviceData?.name || 'Неизвестная услуга',
        serviceDescription: serviceData?.description,
        specialistName: orderData.specialists?.name || null,
        specialistAvatar: orderData.specialists?.photo_url || null,
        specialistRating: orderData.specialists?.rating,
        date: this.formatDate(new Date(orderData.scheduled_date)),
        time: `${orderData.scheduled_time_from.slice(0, 5)} - ${orderData.scheduled_time_to.slice(0, 5)}`,
        address: orderData.address,
        status: orderData.status,
        price: serviceData?.price_from?.toString() || '0',
        description: orderData.description,
        createdAt: this.formatDate(new Date(orderData.created_at)),
      };
      
      return order;
    } catch (error) {
      console.error('Error getting order details:', error);
      throw new Error('Failed to get order details');
    }
  }
  
  /**
   * Отмена заказа
   * @param orderId ID заказа
   * @returns Обновленный заказ
   */
  static async cancelOrder(orderId: string): Promise<Order> {
    try {
      // Импортируем необходимые функции из supabase.ts
      const { supabase } = await import('../lib/supabase');
      
      // Обновляем статус заказа в базе данных
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);
      
      if (updateError) {
        throw updateError;
      }
      
      // Получаем обновленные данные заказа
      return await this.getOrderDetails(orderId);
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw new Error('Failed to cancel order');
    }
  }

  /**
   * Обновление статуса заказа с отправкой уведомлений
   * @param orderId ID заказа
   * @param newStatus Новый статус
   * @returns Обновленный заказ
   */
  static async updateOrderStatus(orderId: string, newStatus: Order['status']): Promise<Order> {
    try {
      // Импортируем необходимые функции из supabase.ts
      const { supabase } = await import('../lib/supabase');
      
      // Получаем текущие данные заказа
      const currentOrder = await this.getOrderDetails(orderId);
      
      // Обновляем статус заказа в базе данных
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (updateError) {
        throw updateError;
      }

      // Отправляем соответствующие уведомления
      try {
        const { pushNotificationService } = await import('./pushNotificationService');
        
        switch (newStatus) {
          case 'completed':
            // Отправляем запрос на оценку работы
            await pushNotificationService.sendNotification('RATING_REQUEST', {
              orderId: orderId,
              serviceName: currentOrder.serviceName
            });
            console.log('✅ Уведомление с запросом оценки отправлено');
            break;
            
          case 'in_progress':
            // Можно добавить уведомление о начале работ
            break;
            
          case 'confirmed':
            // Можно добавить уведомление о подтверждении заказа
            break;
        }
      } catch (notificationError) {
        console.error('❌ Ошибка отправки уведомления при обновлении статуса:', notificationError);
        // Не прерываем выполнение, так как статус уже обновлен
      }
      
      // Получаем обновленные данные заказа
      return await this.getOrderDetails(orderId);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  /**
   * Отправка уведомления о готовности чека
   * @param orderId ID заказа
   * @returns Успешность отправки
   */
  static async notifyReceiptReady(orderId: string): Promise<boolean> {
    try {
      const { pushNotificationService } = await import('./pushNotificationService');
      
      await pushNotificationService.sendNotification('RECEIPT_READY', {
        orderId: orderId
      });
      
      console.log('✅ Уведомление о готовности чека отправлено');
      return true;
    } catch (error) {
      console.error('❌ Ошибка отправки уведомления о чеке:', error);
      return false;
    }
  }
  
  /**
   * Форматирование даты в строку
   * @param date Дата
   * @returns Отформатированная дата
   */
  private static formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  }
} 