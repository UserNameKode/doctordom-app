// Импортируем базовые полифиллы
import 'web-streams-polyfill/ponyfill';
import 'react-native-url-polyfill/auto';

// Инициализируем глобальные полифиллы
global.Buffer = require('buffer').Buffer;
global.process = require('process');
global.process.env = {};

// Добавляем полифилл для interopRequireDefault
global._interopRequireDefault = function(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}; 