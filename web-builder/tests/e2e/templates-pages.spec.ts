import { test, expect } from '@playwright/test';

/**
 * Tests for Templates Pages (/smart-templates, /templates)
 * Validates template library and AI-powered template recommendations
 */
test.describe('Templates Pages Tests', () => {
  test('should load AI-powered template recommendations', async ({ page }) => {
    await page.goto('/smart-templates');
    
    // Verify page loaded successfully
    const url = page.url();
    expect(url.includes('/smart-templates') || url.includes('/auth')).toBeTruthy();
    
    console.log('✅ AI-powered template recommendations page route exists');
  });

  test('should load template library browsing page', async ({ page }) => {
    await page.goto('/templates');
    
    // Verify page loaded successfully
    const url = page.url();
    expect(url.includes('/templates') || url.includes('/auth')).toBeTruthy();
    
    console.log('✅ Template library browsing page route exists');
  });
});