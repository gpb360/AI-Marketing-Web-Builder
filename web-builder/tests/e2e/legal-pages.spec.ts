import { test, expect } from '@playwright/test';

/**
 * Tests for Legal Pages (/privacy, /terms)
 * Validates privacy policy and terms of service pages
 */
test.describe('Legal Pages Tests', () => {
  test('should load privacy policy page', async ({ page }) => {
    await page.goto('/privacy');
    
    // Verify page loaded successfully
    await expect(page).toHaveTitle(/Privacy/);
    
    console.log('✅ Privacy policy page loaded successfully');
  });

  test('should load terms of service page', async ({ page }) => {
    await page.goto('/terms');
    
    // Verify page loaded successfully
    await expect(page).toHaveTitle(/Terms/);
    
    console.log('✅ Terms of service page loaded successfully');
  });
});