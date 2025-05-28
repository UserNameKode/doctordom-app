const fs = require('fs');
const path = require('path');

// Путь к папке с иконками Phosphor
const phosphorPath = 'C:\\Users\\rahma\\OneDrive\\Рабочий стол\\Иконки\\SVGs\\regular';

// Маппинг иконок для категорий услуг
const categoryIconsMapping = {
  // Ремонт и отделка
  'repair': 'wrench.svg',
  'construction': 'building.svg',
  'tools': 'toolbox.svg',
  
  // Электрика
  'electrical': 'lightning.svg', // если есть
  'electrical-alt': 'plug.svg', // если есть
  
  // Сантехника
  'plumbing': 'pipe-wrench.svg',
  'water': 'drop.svg',
  'bath': 'bathtub.svg',
  
  // Уборка
  'cleaning': 'broom.svg',
  'vacuum': 'vacuum-cleaner.svg', // если есть
  
  // Мебель и сборка
  'furniture': 'chair.svg',
  'assembly': 'gear.svg',
  'bed': 'bed.svg',
  'armchair': 'armchair.svg',
  
  // Техника
  'appliances': 'gear-six.svg',
  'repair-tech': 'gear-fine.svg',
  
  // Сад и благоустройство
  'garden': 'plant.svg', // если есть
  'landscaping': 'house.svg',
  
  // Грузчики
  'moving': 'truck.svg',
  'delivery': 'package.svg', // если есть
  
  // Мастер на час
  'handyman': 'hammer.svg', // если есть
  'ladder': 'ladder.svg',
  
  // Вентиляция и кондиционеры
  'ventilation': 'fan.svg',
  'air-conditioning': 'snowflake.svg', // если есть
  
  // Дополнительные
  'paint': 'paint-brush-household.svg',
  'house': 'house.svg',
  'house-simple': 'house-simple.svg'
};

// Маппинг для навигации
const navigationIconsMapping = {
  'services': 'squares-four.svg', // если есть
  'orders': 'clipboard-text.svg', // если есть
  'profile': 'user-circle.svg' // если есть
};

// Маппинг для UI иконок
const uiIconsMapping = {
  'chevron-right': 'caret-right.svg',
  'chevron-left': 'caret-left.svg',
  'chevron-up': 'caret-up.svg',
  'chevron-down': 'caret-down.svg',
  'check': 'check.svg',
  'filter': 'funnel.svg',
  'search': 'magnifying-glass.svg',
  'calendar': 'calendar.svg',
  'map-pin': 'map-pin.svg',
  'user': 'user.svg',
  'heart': 'heart.svg',
  'clock': 'clock.svg',
  'logout': 'sign-out.svg',
  'star': 'star.svg',
  'phone': 'phone.svg',
  'message': 'chat-circle.svg',
  'location': 'map-pin.svg',
  'plus': 'plus.svg',
  'minus': 'minus.svg',
  'x': 'x.svg'
};

// Функция для копирования файла
function copyIcon(sourceName, targetPath, targetName) {
  const sourcePath = path.join(phosphorPath, sourceName);
  const fullTargetPath = path.join(targetPath, targetName);
  
  if (fs.existsSync(sourcePath)) {
    try {
      // Создаем папку если её нет
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      
      fs.copyFileSync(sourcePath, fullTargetPath);
      console.log(`✅ Скопирована иконка: ${sourceName} → ${targetName}`);
      return true;
    } catch (error) {
      console.error(`❌ Ошибка копирования ${sourceName}: ${error.message}`);
      return false;
    }
  } else {
    console.log(`⚠️  Иконка не найдена: ${sourceName}`);
    return false;
  }
}

// Функция для поиска альтернативных названий
function findAlternativeIcon(baseName) {
  const alternatives = {
    'lightning': ['bolt.svg', 'lightning-slash.svg'],
    'plug': ['power.svg', 'plug-charging.svg'],
    'vacuum-cleaner': ['vacuum.svg'],
    'plant': ['flower.svg', 'tree.svg', 'leaf.svg'],
    'package': ['package.svg', 'archive.svg', 'box.svg'],
    'hammer': ['hammer.svg', 'wrench.svg'],
    'snowflake': ['snowflake.svg', 'thermometer-cold.svg'],
    'squares-four': ['grid-four.svg', 'squares-four.svg', 'apps.svg'],
    'clipboard-text': ['clipboard.svg', 'list.svg', 'note.svg'],
    'user-circle': ['user-circle.svg', 'user.svg'],
    'caret-right': ['caret-right.svg', 'arrow-right.svg'],
    'caret-left': ['caret-left.svg', 'arrow-left.svg'],
    'caret-up': ['caret-up.svg', 'arrow-up.svg'],
    'caret-down': ['caret-down.svg', 'arrow-down.svg'],
    'funnel': ['funnel.svg', 'filter.svg'],
    'magnifying-glass': ['magnifying-glass.svg', 'search.svg'],
    'sign-out': ['sign-out.svg', 'log-out.svg'],
    'chat-circle': ['chat-circle.svg', 'chat.svg', 'message.svg']
  };
  
  if (alternatives[baseName.replace('.svg', '')]) {
    for (const alt of alternatives[baseName.replace('.svg', '')]) {
      if (fs.existsSync(path.join(phosphorPath, alt))) {
        return alt;
      }
    }
  }
  
  return null;
}

// Основная функция
async function copyPhosphorIcons() {
  console.log('🚀 Начинаем копирование иконок Phosphor...\n');
  
  if (!fs.existsSync(phosphorPath)) {
    console.error('❌ Папка с иконками Phosphor не найдена:', phosphorPath);
    return;
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  // Копируем иконки категорий
  console.log('📁 Копируем иконки категорий...');
  for (const [targetName, sourceName] of Object.entries(categoryIconsMapping)) {
    let actualSourceName = sourceName;
    
    // Если файл не найден, ищем альтернативу
    if (!fs.existsSync(path.join(phosphorPath, sourceName))) {
      const alternative = findAlternativeIcon(sourceName);
      if (alternative) {
        actualSourceName = alternative;
        console.log(`🔄 Используем альтернативу для ${sourceName}: ${alternative}`);
      }
    }
    
    if (copyIcon(actualSourceName, 'assets/icons/categories', `${targetName}.svg`)) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  // Копируем иконки навигации
  console.log('\n🧭 Копируем иконки навигации...');
  for (const [targetName, sourceName] of Object.entries(navigationIconsMapping)) {
    let actualSourceName = sourceName;
    
    if (!fs.existsSync(path.join(phosphorPath, sourceName))) {
      const alternative = findAlternativeIcon(sourceName);
      if (alternative) {
        actualSourceName = alternative;
        console.log(`🔄 Используем альтернативу для ${sourceName}: ${alternative}`);
      }
    }
    
    if (copyIcon(actualSourceName, 'assets/icons/navigation', `${targetName}.svg`)) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  // Копируем UI иконки
  console.log('\n🎨 Копируем UI иконки...');
  for (const [targetName, sourceName] of Object.entries(uiIconsMapping)) {
    let actualSourceName = sourceName;
    
    if (!fs.existsSync(path.join(phosphorPath, sourceName))) {
      const alternative = findAlternativeIcon(sourceName);
      if (alternative) {
        actualSourceName = alternative;
        console.log(`🔄 Используем альтернативу для ${sourceName}: ${alternative}`);
      }
    }
    
    if (copyIcon(actualSourceName, 'assets/icons/ui', `${targetName}.svg`)) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  console.log('\n📊 Результаты копирования:');
  console.log(`✅ Успешно скопировано: ${successCount} иконок`);
  console.log(`❌ Ошибок: ${errorCount}`);
  
  if (successCount > 0) {
    console.log('\n🎉 Иконки Phosphor успешно добавлены в проект!');
    console.log('\n📝 Следующие шаги:');
    console.log('1. Проверьте скопированные иконки в папках assets/icons/');
    console.log('2. Обновите компоненты для использования новых иконок');
    console.log('3. Протестируйте приложение');
  }
}

// Запускаем копирование
copyPhosphorIcons(); 