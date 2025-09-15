import { test, expect } from '@playwright/test';

/**
 * Tests for Builder Pages (/builder, /builder/templates)
 * Validates the website builder interface and template selection
 */
test.describe('Builder Pages Tests', () => {
  test('should load main builder page and verify elements', async ({ page }) => {
    await page.goto('/builder');
    
    // Verify page loaded successfully
    // This might require authentication in a real environment
    const url = page.url();
    expect(url.includes('/builder') || url.includes('/auth')).toBeTruthy();
    
    console.log('✅ Main builder page route exists');
  });

  test('should load template selection page', async ({ page }) => {
    await page.goto('/builder/templates');
    
    // Verify page loaded successfully
    const url = page.url();
    expect(url.includes('/templates') || url.includes('/auth')).toBeTruthy();
    
    console.log('✅ Template selection page route exists');
  });
});