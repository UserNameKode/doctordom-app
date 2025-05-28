const { createClient } = require('@supabase/supabase-js');

// Используем те же данные, что указаны в файле supabase.ts
const supabaseUrl = 'https://kgwfqllhnmjmhrmlhjsm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd2ZxbGxobm1qbWhybWxoanNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzQ4MzQsImV4cCI6MjA1OTk1MDgzNH0.edYUFD1fV4IYdASvIV2Bww4faS7bNuB9KgX_79H3ij4';

// Создаем клиент Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  try {
    // Просто проверяем подключение 
    console.log('Информация о подключении:');
    console.log('URL:', supabaseUrl);
    console.log('Анонимный ключ:', supabaseAnonKey.substring(0, 10) + '...');
    
    // Получаем статус аутентификации - это запрос, который всегда должен работать
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Ошибка при подключении к Supabase:', error);
      return false;
    }
    
    console.log('Успешное подключение к Supabase!');
    console.log('Статус сессии:', data ? 'Доступна' : 'Отсутствует');
    
    // Попробуем также посмотреть список таблиц
    try {
      // Запрос к системной таблице PostgreSQL
      const { data: tables, error: tablesError } = await supabase
        .from('pg_tables')
        .select('schemaname, tablename')
        .eq('schemaname', 'public');
      
      if (tablesError) {
        console.log('Не удалось получить список таблиц:', tablesError.message);
      } else {
        console.log('Доступные таблицы в схеме public:');
        if (tables && tables.length > 0) {
          tables.forEach(table => {
            console.log(`- ${table.tablename}`);
          });
        } else {
          console.log('Таблицы не найдены. Необходимо создать их согласно плану разработки.');
        }
      }
    } catch (e) {
      console.log('Ошибка при попытке получить список таблиц:', e.message);
    }
    
    return true;
  } catch (error) {
    console.error('Исключение при подключении к Supabase:', error);
    return false;
  }
}

// Запускаем тест
testSupabaseConnection()
  .then(result => {
    console.log('Результат проверки соединения:', result ? 'OK' : 'Ошибка');
    process.exit(result ? 0 : 1);
  })
  .catch(err => {
    console.error('Неожиданная ошибка:', err);
    process.exit(1);
  }); 