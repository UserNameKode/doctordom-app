/**
 * Скрипт для запуска тестирования приложения ДокторДом
 */

const { TEST_PLAN, runTests } = require('./app-test');
const fs = require('fs');
const path = require('path');

// Функция для создания отчета о тестировании
function generateTestReport() {
  const reportDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const reportPath = path.join(__dirname, `test-report-${Date.now()}.md`);
  
  let reportContent = `# Отчет о тестировании приложения ДокторДом\n\n`;
  reportContent += `Дата: ${reportDate}\n\n`;
  
  // Добавляем разделы тестирования в отчет
  for (const [sectionKey, sectionTests] of Object.entries(TEST_PLAN)) {
    reportContent += `## ${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}\n\n`;
    
    for (const [testGroupKey, testCases] of Object.entries(sectionTests)) {
      reportContent += `### ${testGroupKey.charAt(0).toUpperCase() + testGroupKey.slice(1)}\n\n`;
      
      testCases.forEach((testCase, index) => {
        reportContent += `- [ ] ${testCase}\n`;
      });
      
      reportContent += '\n';
    }
  }
  
  // Добавляем раздел для заметок
  reportContent += `## Заметки\n\n`;
  reportContent += `_Добавьте сюда любые заметки о проблемах или улучшениях, обнаруженных во время тестирования._\n\n`;
  
  // Добавляем раздел для итогов
  reportContent += `## Итоги\n\n`;
  reportContent += `- [ ] Все тесты пройдены успешно\n`;
  reportContent += `- [ ] Требуются исправления (см. заметки)\n`;
  reportContent += `- [ ] Приложение готово к релизу\n\n`;
  
  // Записываем отчет в файл
  fs.writeFileSync(reportPath, reportContent);
  
  console.log(`Отчет о тестировании создан: ${reportPath}`);
  return reportPath;
}

// Главная функция
async function main() {
  console.log('Запуск тестирования приложения ДокторДом');
  console.log('===========================================');
  
  try {
    // Запускаем тесты (в будущем здесь будет автоматизированное тестирование)
    await runTests();
    
    // Генерируем отчет для ручного тестирования
    const reportPath = generateTestReport();
    
    console.log('===========================================');
    console.log(`Для ручного тестирования используйте отчет: ${reportPath}`);
    console.log('Отметьте в отчете результаты тестирования и добавьте заметки о найденных проблемах.');
  } catch (error) {
    console.error('Ошибка при запуске тестирования:', error);
  }
}

// Запускаем скрипт
main(); 