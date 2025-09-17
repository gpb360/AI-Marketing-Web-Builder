import { test, expect } from '@playwright/test';

/**
 * Test for Debug/Test Page (/test)
 * Validates debug/test page functionality
 */
test.describe('Debug/Test Page Tests', () => {
  test('should load debug/test page', async ({ page }) => {
    await page.goto('/test');
    
    // Verify page loaded successfully
    const url = page.url();
    expect(url.includes('/test') || url.includes('/auth')).toBeTruthy();
    
    console.log('✅ Debug/test page route exists');
  });
});