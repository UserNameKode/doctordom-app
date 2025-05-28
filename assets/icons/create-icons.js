const fs = require('fs');
const path = require('path');

// Функция для создания SVG иконки
function createSvgIcon(filename, content) {
  const filepath = path.join(__dirname, filename);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`Created ${filepath}`);
}

// Иконка дизайна
const designIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#182237" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M2 17L12 22L22 17" stroke="#182237" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M2 12L12 17L22 12" stroke="#182237" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Иконка кода
const codeIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 18L22 12L16 6" stroke="#182237" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8 6L2 12L8 18" stroke="#182237" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Создаем иконки
createSvgIcon('design.svg', designIcon);
createSvgIcon('code.svg', codeIcon);

console.log('All icons created successfully!'); 