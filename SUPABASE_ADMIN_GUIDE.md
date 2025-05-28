# 🎛️ Управление Push Уведомлениями через Supabase Dashboard

## 🚀 **Быстрый старт**

### 1. **Откройте Supabase Dashboard**
- Перейдите на https://supabase.com/dashboard
- Выберите проект "NewApp"
- Перейдите в раздел **Table Editor**

### 2. **Управление типами уведомлений**

#### 📋 **Таблица: `remote_notification_config`**

**Быстрые действия:**

```sql
-- ❌ ОТКЛЮЧИТЬ уведомления о акциях
UPDATE remote_notification_config 
SET enabled = false 
WHERE type = 'PROMOTION';

-- ✅ ВКЛЮЧИТЬ уведомления о прибытии мастера
UPDATE remote_notification_config 
SET enabled = true 
WHERE type = 'WORKER_ARRIVED';

-- 🔇 ОТКЛЮЧИТЬ звук для оплаты
UPDATE remote_notification_config 
SET sound = false 
WHERE type = 'PAYMENT_RECEIVED';
```

#### 📊 **Просмотр всех настроек:**
```sql
SELECT type, enabled, title, sound, vibration 
FROM remote_notification_config 
ORDER BY type;
```

### 3. **Экстренные ситуации**

#### 🚨 **Отключить ВСЕ уведомления:**
```sql
UPDATE remote_notification_config 
SET enabled = false;
```

#### 🔄 **Включить только критичные:**
```sql
-- Сначала отключаем все
UPDATE remote_notification_config SET enabled = false;

-- Включаем только важные
UPDATE remote_notification_config 
SET enabled = true 
WHERE type IN (
  'ORDER_CONFIRMED',
  'WORKER_ASSIGNED', 
  'WORKER_ARRIVED',
  'ORDER_COMPLETED'
);
```

#### 🛠️ **Режим обслуживания:**
```sql
UPDATE remote_app_settings 
SET maintenance_mode = true,
    maintenance_message = 'Приложение временно недоступно. Ведутся технические работы.'
WHERE active = true;
```

## 📱 **Практические сценарии**

### **Сценарий 1: Слишком много жалоб на спам**
```sql
-- Отключаем промо-уведомления
UPDATE remote_notification_config 
SET enabled = false 
WHERE type = 'PROMOTION';
```

### **Сценарий 2: Проблемы с оплатой**
```sql
-- Временно отключаем уведомления об оплате
UPDATE remote_notification_config 
SET enabled = false 
WHERE type = 'PAYMENT_RECEIVED';
```

### **Сценарий 3: Новогодние акции**
```sql
-- Включаем промо на время акций
UPDATE remote_notification_config 
SET enabled = true,
    title = '🎄 Новогодние скидки',
    description = 'Специальные предложения к Новому году'
WHERE type = 'PROMOTION';
```

### **Сценарий 4: Тестирование новой функции**
```sql
-- Включаем только для тестирования
UPDATE remote_notification_config 
SET enabled = true 
WHERE type = 'RATING_REQUEST';
```

## 🔍 **Мониторинг и аналитика**

### **Проверка активных типов:**
```sql
SELECT 
  type,
  title,
  enabled,
  CASE WHEN enabled THEN '✅' ELSE '❌' END as status
FROM remote_notification_config 
ORDER BY enabled DESC, type;
```

### **Статистика изменений:**
```sql
SELECT 
  type,
  title,
  updated_at,
  enabled
FROM remote_notification_config 
ORDER BY updated_at DESC;
```

## ⚡ **Мгновенные изменения**

**Важно:** Все изменения применяются **мгновенно**!
- ✅ Изменили в Supabase → приложение подхватит через 5 минут (кэш)
- 🔄 Для немедленного применения пользователь может "потянуть вниз" в настройках

## 🛡️ **Безопасность**

### **Кто может изменять:**
- ✅ Только вы (владелец проекта Supabase)
- ✅ Пользователи с доступом к вашему Supabase проекту
- ❌ Обычные пользователи приложения НЕ могут изменять

### **Резервное копирование:**
```sql
-- Создать бэкап настроек
CREATE TABLE notification_config_backup AS 
SELECT * FROM remote_notification_config;
```

### **Восстановление:**
```sql
-- Восстановить из бэкапа
DELETE FROM remote_notification_config;
INSERT INTO remote_notification_config 
SELECT * FROM notification_config_backup;
```

## 📋 **Чек-лист для управления**

### **Ежедневно:**
- [ ] Проверить жалобы пользователей
- [ ] При необходимости отключить проблемные типы

### **Еженедельно:**
- [ ] Проанализировать статистику уведомлений
- [ ] Оптимизировать настройки звука/вибрации

### **При проблемах:**
- [ ] Отключить проблемный тип через SQL
- [ ] Уведомить команду разработки
- [ ] Включить обратно после исправления

### **Перед акциями:**
- [ ] Включить PROMOTION уведомления
- [ ] Настроить привлекательный текст
- [ ] После акции - отключить

## 🎯 **Преимущества варианта 2:**

✅ **Полная безопасность** - только у вас есть доступ  
✅ **Простота** - обычные SQL запросы  
✅ **Мгновенность** - изменения применяются сразу  
✅ **Надежность** - нет риска взлома веб-панели  
✅ **Гибкость** - можете делать любые изменения  
✅ **Бесплатно** - не нужен отдельный сервер  

## 📞 **Поддержка**

Если что-то пойдет не так:
1. Откройте Supabase Dashboard
2. Выполните: `UPDATE remote_notification_config SET enabled = true;`
3. Все уведомления снова заработают

**Вы точно справитесь!** 🚀 