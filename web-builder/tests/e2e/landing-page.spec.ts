import { test, expect } from '@playwright/test';

/**
 * Test for Landing Page (/)
 * Validates the main marketing page functionality
 */
test.describe('Landing Page Tests', () => {
  test('should load landing page and verify key elements', async ({ page }) => {
    await page.goto('/');
    
    // Verify page loaded successfully
    await expect(page).toHaveTitle(/AI Marketing Web Builder/);
    
    // Check for key elements
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="get-started-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="features-section"]')).toBeVisible();
    
    console.log('✅ Landing page loaded successfully');
  });

  test('should navigate to registration from get started button', async ({ page }) => {
    await page.goto('/');
    
    // Click get started button
    await page.click('[data-testid="get-started-btn"]');
    
    // Verify navigation to registration page
    await page.waitForURL(/\/(register|signup|auth)/);
    
    console.log('✅ Navigation from landing to registration works');
  });
});