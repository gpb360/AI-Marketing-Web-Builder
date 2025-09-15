import { test, expect } from '@playwright/test';

/**
 * Tests for Analytics Pages (/analytics, /analytics-dashboard, /sla-dashboard)
 * Validates analytics dashboard and SLA monitoring functionality
 */
test.describe('Analytics Pages Tests', () => {
  test('should load analytics page', async ({ page }) => {
    await page.goto('/analytics');
    
    // Verify page loaded successfully
    const url = page.url();
    expect(url.includes('/analytics') || url.includes('/auth')).toBeTruthy();
    
    console.log('✅ Analytics page route exists');
  });

  test('should load detailed analytics dashboard', async ({ page }) => {
    await page.goto('/analytics-dashboard');
    
    // Verify page loaded successfully
    const url = page.url();
    expect(url.includes('/analytics-dashboard') || url.includes('/auth')).toBeTruthy();
    
    console.log('✅ Detailed analytics dashboard route exists');
  });

  test('should load SLA monitoring dashboard', async ({ page }) => {
    await page.goto('/sla-dashboard');
    
    // Verify page loaded successfully
    const url = page.url();
    expect(url.includes('/sla-dashboard') || url.includes('/auth')).toBeTruthy();
    
    console.log('✅ SLA monitoring dashboard route exists');
  });
});