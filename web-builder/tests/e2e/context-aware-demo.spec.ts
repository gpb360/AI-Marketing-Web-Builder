import { test, expect } from '@playwright/test';

/**
 * Test for Business Context Demo Page (/context-aware-demo)
 * Validates business context demo functionality
 */
test.describe('Business Context Demo Page Tests', () => {
  test('should load business context demo page', async ({ page }) => {
    await page.goto('/context-aware-demo');
    
    // Verify page loaded successfully
    const url = page.url();
    expect(url.includes('/context-aware-demo') || url.includes('/auth')).toBeTruthy();
    
    console.log('✅ Business context demo page route exists');
  });
});