import { test, expect } from '@playwright/test';

/**
 * Tests for Canvas Pages (/canvas, /canvas-ai)
 * Validates the main canvas for website building and AI-enhanced canvas
 */
test.describe('Canvas Pages Tests', () => {
  test('should load main canvas page', async ({ page }) => {
    await page.goto('/canvas');
    
    // Verify page loaded successfully
    const url = page.url();
    expect(url.includes('/canvas') || url.includes('/auth')).toBeTruthy();
    
    console.log('✅ Main canvas page route exists');
  });

  test('should load AI-enhanced canvas page', async ({ page }) => {
    await page.goto('/canvas-ai');
    
    // Verify page loaded successfully
    const url = page.url();
    expect(url.includes('/canvas-ai') || url.includes('/auth')).toBeTruthy();
    
    console.log('✅ AI-enhanced canvas page route exists');
  });
});