// Конфигурация типов уведомлений для DoctorDom
// Здесь вы можете включать/выключать нужные типы уведомлений

export interface NotificationConfig {
  enabled: boolean;
  title: string;
  description: string;
  icon: string;
  sound: boolean;
  vibration: boolean;
}

// Основные типы уведомлений для бытовых услуг
export const NOTIFICATION_TYPES = {
  // ✅ ВКЛЮЧЕННЫЕ УВЕДОМЛЕНИЯ (измените enabled: false чтобы отключить)
  
  ORDER_CONFIRMED: {
    enabled: true, // ← Измените на false чтобы отключить
    title: 'Заказ подтвержден',
    description: 'Уведомление о принятии заказа в работу',
    icon: '✅',
    sound: true,
    vibration: true,
  } as NotificationConfig,

  WORKER_ASSIGNED: {
    enabled: true,
    title: 'Мастер назначен',
    description: 'Информация о назначенном специалисте',
    icon: '👨‍🔧',
    sound: true,
    vibration: true,
  } as NotificationConfig,

  WORKER_ARRIVED: {
    enabled: true,
    title: 'Мастер прибыл',
    description: 'Уведомление о прибытии мастера',
    icon: '🚗',
    sound: true,
    vibration: true,
  } as NotificationConfig,

  ORDER_COMPLETED: {
    enabled: true,
    title: 'Заказ выполнен',
    description: 'Завершение работ и запрос оценки',
    icon: '🎉',
    sound: true,
    vibration: false,
  } as NotificationConfig,

  PAYMENT_RECEIVED: {
    enabled: true,
    title: 'Оплата получена',
    description: 'Подтверждение успешной оплаты',
    icon: '💳',
    sound: false,
    vibration: false,
  } as NotificationConfig,

  // ❌ ОТКЛЮЧЕННЫЕ УВЕДОМЛЕНИЯ (можете включить при необходимости)
  
  ORDER_CANCELLED: {
    enabled: false, // ← Отключено
    title: 'Заказ отменен',
    description: 'Уведомление об отмене заказа',
    icon: '❌',
    sound: true,
    vibration: true,
  } as NotificationConfig,

  RATING_REQUEST: {
    enabled: false, // ← Отключено (дублирует ORDER_COMPLETED)
    title: 'Оцените работу',
    description: 'Просьба оценить качество услуг',
    icon: '⭐',
    sound: false,
    vibration: false,
  } as NotificationConfig,

  PROMOTION: {
    enabled: true, // ← Включено для маркетинга
    title: 'Акции и скидки',
    description: 'Специальные предложения',
    icon: '🎁',
    sound: false,
    vibration: false,
  } as NotificationConfig,

  SYSTEM_UPDATE: {
    enabled: false, // ← Отключено (редко нужно)
    title: 'Обновление системы',
    description: 'Важные системные уведомления',
    icon: '📢',
    sound: false,
    vibration: false,
  } as NotificationConfig,

  // 🆕 ДОПОЛНИТЕЛЬНЫЕ ТИПЫ (добавьте свои)
  
  WORKER_ON_WAY: {
    enabled: true,
    title: 'Мастер в пути',
    description: 'Мастер выехал к вам',
    icon: '🚙',
    sound: true,
    vibration: true,
  } as NotificationConfig,

  REMINDER_24H: {
    enabled: true,
    title: 'Напоминание о заказе',
    description: 'Заказ завтра в указанное время',
    icon: '⏰',
    sound: false,
    vibration: false,
  } as NotificationConfig,
};

// Функция для получения активных типов уведомлений
export const getEnabledNotificationTypes = () => {
  return Object.entries(NOTIFICATION_TYPES)
    .filter(([_, config]) => config.enabled)
    .reduce((acc, [key, config]) => {
      acc[key] = config;
      return acc;
    }, {} as Record<string, NotificationConfig>);
};

// Функция для проверки, включен ли тип уведомления
export const isNotificationEnabled = (type: string): boolean => {
  return NOTIFICATION_TYPES[type as keyof typeof NOTIFICATION_TYPES]?.enabled || false;
};

// Шаблоны уведомлений (только для включенных типов)
export const createNotificationTemplates = () => {
  const templates: Record<string, (...params: any[]) => any> = {};

  if (NOTIFICATION_TYPES.ORDER_CONFIRMED.enabled) {
    templates.orderConfirmed = (orderNumber: string) => ({
      title: `${NOTIFICATION_TYPES.ORDER_CONFIRMED.icon} ${NOTIFICATION_TYPES.ORDER_CONFIRMED.title}`,
      body: `Ваш заказ №${orderNumber} принят в работу. Мастер свяжется с вами в ближайшее время.`,
      data: { type: 'ORDER_CONFIRMED', orderNumber },
      sound: NOTIFICATION_TYPES.ORDER_CONFIRMED.sound,
    });
  }

  if (NOTIFICATION_TYPES.WORKER_ASSIGNED.enabled) {
    templates.workerAssigned = (orderNumber: string, workerName: string) => ({
      title: `${NOTIFICATION_TYPES.WORKER_ASSIGNED.icon} ${NOTIFICATION_TYPES.WORKER_ASSIGNED.title}`,
      body: `К вашему заказу №${orderNumber} назначен мастер ${workerName}`,
      data: { type: 'WORKER_ASSIGNED', orderNumber, workerName },
      sound: NOTIFICATION_TYPES.WORKER_ASSIGNED.sound,
    });
  }

  if (NOTIFICATION_TYPES.WORKER_ARRIVED.enabled) {
    templates.workerArrived = (orderNumber: string) => ({
      title: `${NOTIFICATION_TYPES.WORKER_ARRIVED.icon} ${NOTIFICATION_TYPES.WORKER_ARRIVED.title}`,
      body: `Мастер прибыл для выполнения заказа №${orderNumber}`,
      data: { type: 'WORKER_ARRIVED', orderNumber },
      sound: NOTIFICATION_TYPES.WORKER_ARRIVED.sound,
    });
  }

  if (NOTIFICATION_TYPES.ORDER_COMPLETED.enabled) {
    templates.orderCompleted = (orderNumber: string) => ({
      title: `${NOTIFICATION_TYPES.ORDER_COMPLETED.icon} ${NOTIFICATION_TYPES.ORDER_COMPLETED.title}`,
      body: `Заказ №${orderNumber} успешно выполнен. Пожалуйста, оцените работу мастера.`,
      data: { type: 'ORDER_COMPLETED', orderNumber },
      sound: NOTIFICATION_TYPES.ORDER_COMPLETED.sound,
    });
  }

  if (NOTIFICATION_TYPES.PAYMENT_RECEIVED.enabled) {
    templates.paymentReceived = (amount: number) => ({
      title: `${NOTIFICATION_TYPES.PAYMENT_RECEIVED.icon} ${NOTIFICATION_TYPES.PAYMENT_RECEIVED.title}`,
      body: `Оплата в размере ${amount} ₽ успешно обработана`,
      data: { type: 'PAYMENT_RECEIVED', amount },
      sound: NOTIFICATION_TYPES.PAYMENT_RECEIVED.sound,
    });
  }

  if (NOTIFICATION_TYPES.PROMOTION.enabled) {
    templates.promotion = (title: string, description: string) => ({
      title: `${NOTIFICATION_TYPES.PROMOTION.icon} ${title}`,
      body: description,
      data: { type: 'PROMOTION' },
      sound: NOTIFICATION_TYPES.PROMOTION.sound,
    });
  }

  if (NOTIFICATION_TYPES.WORKER_ON_WAY.enabled) {
    templates.workerOnWay = (orderNumber: string, estimatedTime: string) => ({
      title: `${NOTIFICATION_TYPES.WORKER_ON_WAY.icon} ${NOTIFICATION_TYPES.WORKER_ON_WAY.title}`,
      body: `Мастер выехал к вам по заказу №${orderNumber}. Ожидаемое время прибытия: ${estimatedTime}`,
      data: { type: 'WORKER_ON_WAY', orderNumber, estimatedTime },
      sound: NOTIFICATION_TYPES.WORKER_ON_WAY.sound,
    });
  }

  if (NOTIFICATION_TYPES.REMINDER_24H.enabled) {
    templates.reminder24h = (orderNumber: string, serviceTime: string) => ({
      title: `${NOTIFICATION_TYPES.REMINDER_24H.icon} ${NOTIFICATION_TYPES.REMINDER_24H.title}`,
      body: `Напоминаем: завтра ${serviceTime} запланирован заказ №${orderNumber}`,
      data: { type: 'REMINDER_24H', orderNumber, serviceTime },
      sound: NOTIFICATION_TYPES.REMINDER_24H.sound,
    });
  }

  return templates;
}; 