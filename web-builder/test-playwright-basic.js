#!/usr/bin/env node

/**
 * Simple Playwright Test Validation Script
 * Validates that Playwright is properly installed and can run basic tests
 */

const { chromium } = require('@playwright/test');

async function runBasicTest() {
  console.log('🚀 Starting Basic Playwright Validation...\n');
  
  let browser;
  let passed = 0;
  let failed = 0;
  
  try {
    console.log('1. Testing browser launch...');
    browser = await chromium.launch({ headless: true });
    console.log('✅ Browser launched successfully');
    passed++;
    
    console.log('2. Testing page creation...');
    const page = await browser.newPage();
    console.log('✅ Page created successfully');
    passed++;
    
    console.log('3. Testing navigation to Google (external site)...');
    await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 10000 });
    const title = await page.title();
    console.log(`✅ Successfully navigated to: ${title}`);
    passed++;
    
    console.log('4. Testing localhost connection...');
    try {
      await page.goto('http://localhost:3003', { waitUntil: 'domcontentloaded', timeout: 5000 });
      const localTitle = await page.title();
      console.log(`✅ Successfully connected to local server: ${localTitle}`);
      passed++;
    } catch (error) {
      console.log('❌ Local server connection failed:', error.message);
      console.log('   This is expected if the dev server is not running properly');
      failed++;
    }
    
    await page.close();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    failed++;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (passed >= 3) {
    console.log('✅ Playwright is working correctly!');
    console.log('💡 To run the full test suite, first ensure the development server is running properly.');
    return true;
  } else {
    console.log('❌ Playwright validation failed');
    return false;
  }
}

runBasicTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});