// Скрипт для добавления тестового специалиста в базу данных Supabase

// Импортируем необходимые модули
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Создаем клиент Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://kgwfqllhnmjmhrmlhjsm.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd2ZxbGxobm1qbWhybWxoanNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzQ4MzQsImV4cCI6MjA1OTk1MDgzNH0.edYUFD1fV4IYdASvIV2Bww4faS7bNuB9KgX_79H3ij4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    // 1. Получаем список услуг
    console.log('Получаем список услуг...');
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, name, category_id')
      .limit(10);
    
    if (servicesError) {
      throw servicesError;
    }
    
    console.log('Доступные услуги:');
    services.forEach(service => {
      console.log(`- ${service.name} (ID: ${service.id}, Category ID: ${service.category_id})`);
    });
    
    if (services.length === 0) {
      console.log('Услуг не найдено. Сначала добавьте услуги в базу данных.');
      return;
    }
    
    // 2. Добавляем специалиста
    console.log('\nДобавляем специалиста...');
    const { data: specialist, error: specialistError } = await supabase
      .from('specialists')
      .insert([
        {
          name: 'Иванов Иван Иванович',
          specialty: 'Мастер по ремонту',
          rating: 4.8,
          experience_years: 5,
          photo_url: 'https://randomuser.me/api/portraits/men/32.jpg'
        }
      ])
      .select();
    
    if (specialistError) {
      throw specialistError;
    }
    
    console.log('Специалист успешно добавлен:');
    console.log(specialist[0]);
    
    console.log('\nГотово! Тестовый специалист успешно добавлен.');
    console.log('ID специалиста:', specialist[0].id);
    console.log('Теперь вы можете просматривать услуги и выбирать этого специалиста.');
    
  } catch (error) {
    console.error('Произошла ошибка:', error.message);
  }
}

run(); 