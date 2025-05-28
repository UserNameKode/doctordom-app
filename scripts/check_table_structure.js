// Импортируем Supabase клиент
const { createClient } = require('@supabase/supabase-js');

// Конфигурация Supabase с обновленным ключом
const supabaseUrl = 'https://kgwfqllhnmjmhrmlhjsm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd2ZxbGxobm1qbWhybWxoanNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyMTM3NjEsImV4cCI6MjAzMTc4OTc2MX0.Jg0pPrxQQr6Mj8_vKuFaT_ZFwFcbGcGRNnYULZUlKxk';

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
          console.log(`- ${field}: ${typeof data[0][field]}`);
        });
      } else {
        console.log('Таблица orders пуста или не существует');
        
        // Попробуем выполнить запрос напрямую к информационной схеме
        console.log('Пробуем получить информацию о структуре из метаданных...');
        
        const { data: metaData, error: metaError } = await supabase
          .from('orders')
          .select('*')
          .limit(0);
          
        if (metaError) {
          console.error('Ошибка при получении метаданных:', metaError);
        } else {
          console.log('Метаданные таблицы orders:', metaData);
        }
      }
    }
    
    // Дополнительно проверим другие таблицы для подтверждения подключения
    console.log('\nПроверка других таблиц...');
    const tables = ['profiles', 'services', 'specialists'];
    
    for (const table of tables) {
      console.log(`\nПроверка таблицы ${table}...`);
      const { data, error } = await supabase
        .from(table)
        .select()
        .limit(1);
      
      if (error) {
        console.error(`Ошибка при получении данных из таблицы ${table}:`, error);
      } else {
        console.log(`Данные из таблицы ${table}:`, data);
      }
    }
    
  } catch (error) {
    console.error('Произошла ошибка:', error);
  }
}

// Запускаем функцию
checkOrdersTable(); 