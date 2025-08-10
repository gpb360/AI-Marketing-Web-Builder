/**
 * Simple theme system validation script
 * Tests the theme system without requiring full Jest/TypeScript setup
 */

// Simple Node.js validation for theme system
const fs = require('fs');
const path = require('path');

// Read the theme file
const themeFilePath = path.join(__dirname, 'theme.ts');
const themeContent = fs.readFileSync(themeFilePath, 'utf8');

// Basic validation checks
console.log('🎨 Theme System Validation\n');

// Check if required exports exist
const requiredExports = [
  'export const colors',
  'export const spacing',
  'export const presets',
  'export const masterTheme',
  'export function validateThemeStructure',
  'export function validateThemeUsage',
  'export function createThemeClass',
  'export const themeUtils',
];

let allExportsFound = true;
requiredExports.forEach(exportCheck => {
  if (themeContent.includes(exportCheck)) {
    console.log(`✅ Found: ${exportCheck}`);
  } else {
    console.log(`❌ Missing: ${exportCheck}`);
    allExportsFound = false;
  }
});

// Check TypeScript interfaces
const requiredInterfaces = [
  'interface ThemeColors',
  'interface ThemeSpacing', 
  'interface ThemePresets',
  'interface MasterTheme',
];

let allInterfacesFound = true;
requiredInterfaces.forEach(interfaceCheck => {
  if (themeContent.includes(interfaceCheck)) {
    console.log(`✅ Interface: ${interfaceCheck}`);
  } else {
    console.log(`❌ Missing Interface: ${interfaceCheck}`);
    allInterfacesFound = false;
  }
});

// Check specific color values (AC: 2, 3)
const requiredColors = [
  'bg-gray-900',  // primary background
  'bg-gray-800',  // secondary background  
  'bg-yellow-400', // accent background
  'text-white',   // primary text
  'text-gray-300', // secondary text
  'text-yellow-400', // accent text
];

let allColorsFound = true;
requiredColors.forEach(colorCheck => {
  if (themeContent.includes(`'${colorCheck}'`)) {
    console.log(`✅ Color: ${colorCheck}`);
  } else {
    console.log(`❌ Missing Color: ${colorCheck}`);
    allColorsFound = false;
  }
});

// Check 8px grid spacing (AC: 4)
const requiredSpacing = ['8px', '16px', '24px', '32px', '40px'];
let allSpacingFound = true;
requiredSpacing.forEach(spacingCheck => {
  if (themeContent.includes(`'${spacingCheck}'`)) {
    console.log(`✅ Spacing: ${spacingCheck}`);
  } else {
    console.log(`❌ Missing Spacing: ${spacingCheck}`);
    allSpacingFound = false;
  }
});

// Check presets (AC: 5)
const requiredPresets = ['landingPage', 'builderCanvas', 'navigation'];
let allPresetsFound = true;
requiredPresets.forEach(presetCheck => {
  if (themeContent.includes(presetCheck)) {
    console.log(`✅ Preset: ${presetCheck}`);
  } else {
    console.log(`❌ Missing Preset: ${presetCheck}`);
    allPresetsFound = false;
  }
});

// Final validation
console.log('\n📊 Validation Summary:');
console.log(`Exports: ${allExportsFound ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Interfaces: ${allInterfacesFound ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Colors: ${allColorsFound ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Spacing: ${allSpacingFound ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Presets: ${allPresetsFound ? '✅ PASS' : '❌ FAIL'}`);

const overallPass = allExportsFound && allInterfacesFound && allColorsFound && allSpacingFound && allPresetsFound;
console.log(`\n🎯 Overall: ${overallPass ? '✅ PASS - Theme system meets all story requirements!' : '❌ FAIL - Some requirements missing'}`);

// Check file sizes
const stats = fs.statSync(themeFilePath);
console.log(`\n📁 File size: ${stats.size} bytes`);

if (stats.size > 100000) {
  console.log('⚠️  Warning: Theme file is quite large. Consider optimization.');
} else {
  console.log('✅ Theme file size is reasonable.');
}

process.exit(overallPass ? 0 : 1);