// Импортируем Supabase клиент
const { createClient } = require('@supabase/supabase-js');

// Конфигурация Supabase с ключом из .env
const supabaseUrl = 'https://kgwfqllhnmjmhrmlhjsm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd2ZxbGxobm1qbWhybWxoanNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzQ4MzQsImV4cCI6MjA1OTk1MDgzNH0.edYUFD1fV4IYdASvIV2Bww4faS7bNuB9KgX_79H3ij4';

// Создаем клиент Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkOrdersTable() {
  try {
    console.log('Проверка структуры таблицы orders...');
    
    // Выполняем запрос для получения структуры таблицы
    const { data, error } = await supabase
      .from('orders')
      .select()
      .limit(1);
    
    if (error) {
      console.error('Ошибка при получении данных из таблицы orders:', error);
    } else {
      console.log('Данные из таблицы orders:', data);
      
      // Если есть данные, выводим структуру первой записи
      if (data && data.length > 0) {
        console.log('Структура таблицы orders (поля из первой записи):');
        const fields = Object.keys(data[0]);
        fields.forEach(field => {
          console.log(`- ${field}: ${typeof data[0][field]} = ${data[0][field]}`);
        });
      } else {
        console.log('Таблица orders пуста или не существует');
        
        // Попробуем выполнить запрос напрямую к информационной схеме
        console.log('Пробуем получить информацию о структуре из метаданных...');
        
        // Попробуем создать тестовый заказ для проверки структуры
        console.log('Создаем тестовый заказ для проверки структуры...');
        const testOrder = {
          user_id: '00000000-0000-0000-0000-000000000000',
          service_id: '00000000-0000-0000-0000-000000000000',
          specialist_id: null,
          description: 'Тестовый заказ',
          address: 'Тестовый адрес',
          lat: 55.7558,
          lng: 37.6173,
          scheduled_date: '2023-05-15',
          scheduled_time_from: '10:00:00',
          scheduled_time_to: '12:00:00',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data: insertData, error: insertError } = await supabase
          .from('orders')
          .insert(testOrder)
          .select();
        
        if (insertError) {
          console.error('Ошибка при создании тестового заказа:', insertError);
          
          // Пробуем получить информацию о структуре таблицы из ошибки
          if (insertError.message && insertError.message.includes('column')) {
            console.log('Информация о структуре из ошибки:', insertError.message);
          }
        } else {
          console.log('Тестовый заказ успешно создан:', insertData);
        }
      }
    }
  } catch (error) {
    console.error('Произошла ошибка:', error);
  }
}

// Запускаем функцию
checkOrdersTable(); 