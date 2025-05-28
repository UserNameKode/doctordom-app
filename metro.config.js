// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');
const nodeLibs = require('node-libs-expo');
const path = require('path');

/** @type {import('metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Добавляем поддержку SVG
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts.push('svg');
config.resolver.sourceExts.push('cjs');                 // ws содержит .cjs-файлы
config.resolver.unstable_enablePackageExports = false;  // временно откатываем новое поведение Metro
config.resolver.extraNodeModules = {
  ...nodeLibs,                     // stream, events, buffer, crypto и т.д.
  ws: require.resolve('isomorphic-ws'),  // лёгкий кросс-рантаймовый клиент
};

// Добавляем трансформер для SVG
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

module.exports = config; 