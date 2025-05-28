# ⚡ Быстрые команды для управления уведомлениями

## 🚀 **Как открыть:**
1. Перейдите на https://supabase.com/dashboard
2. Выберите проект "NewApp" 
3. Откройте **SQL Editor**
4. Вставьте нужную команду и нажмите **Run**

## 📋 **Самые важные команды:**

### 👀 **Посмотреть все настройки:**
```sql
SELECT 
  type,
  title,
  enabled,
  CASE WHEN enabled THEN '✅' ELSE '❌' END as status
FROM remote_notification_config 
ORDER BY enabled DESC, type;
```

### 🚨 **ЭКСТРЕННО отключить ВСЕ уведомления:**
```sql
UPDATE remote_notification_config SET enabled = false;
```

### 🔄 **Включить обратно ВСЕ уведомления:**
```sql
UPDATE remote_notification_config SET enabled = true;
```

### 🎁 **Отключить только промо-уведомления:**
```sql
UPDATE remote_notification_config 
SET enabled = false 
WHERE type = 'PROMOTION';
```

### ✅ **Включить только важные уведомления:**
```sql
-- Сначала отключаем все
UPDATE remote_notification_config SET enabled = false;

-- Включаем только критичные
UPDATE remote_notification_config 
SET enabled = true 
WHERE type IN (
  'ORDER_CONFIRMED',
  'WORKER_ASSIGNED', 
  'WORKER_ARRIVED',
  'ORDER_COMPLETED'
);
```

### 🔇 **Отключить звук для определенного типа:**
```sql
UPDATE remote_notification_config 
SET sound = false 
WHERE type = 'PAYMENT_RECEIVED';
```

### 🛠️ **Режим обслуживания (включить):**
```sql
UPDATE remote_app_settings 
SET maintenance_mode = true,
    maintenance_message = 'Приложение временно недоступно'
WHERE active = true;
```

### 🛠️ **Режим обслуживания (выключить):**
```sql
UPDATE remote_app_settings 
SET maintenance_mode = false
WHERE active = true;
```

## 🎯 **Типы уведомлений:**
- `ORDER_CONFIRMED` - Заказ подтвержден ✅
- `WORKER_ASSIGNED` - Мастер назначен 👨‍🔧  
- `WORKER_ARRIVED` - Мастер прибыл 🚗
- `ORDER_COMPLETED` - Заказ выполнен 🎉
- `PAYMENT_RECEIVED` - Оплата получена 💳
- `PROMOTION` - Акции и скидки 🎁
- `WORKER_ON_WAY` - Мастер в пути 🚙
- `REMINDER_24H` - Напоминание о заказе ⏰
- `ORDER_CANCELLED` - Заказ отменен ❌
- `RATING_REQUEST` - Оцените работу ⭐
- `SYSTEM_UPDATE` - Системные обновления 📢

## ⚡ **Результат:**
- ✅ Изменения применяются **мгновенно**
- 📱 Приложение подхватит изменения в течение 5 минут
- 🔄 Пользователи могут принудительно обновить через "потянуть вниз"

## 🛡️ **Безопасность:**
- ✅ Только у вас есть доступ к Supabase Dashboard
- ✅ Никто другой не может изменить настройки
- ✅ Все изменения логируются с временными метками 