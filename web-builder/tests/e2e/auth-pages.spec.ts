import { test, expect } from '@playwright/test';

/**
 * Tests for Authentication Pages (/auth/login and /auth/register)
 * Validates user registration and login functionality
 */
test.describe('Authentication Pages Tests', () => {
  const testUser = {
    email: `test.user.${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User'
  };

  test('should load login page and verify elements', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Verify page loaded successfully
    await expect(page).toHaveTitle(/Login/);
    
    // Check for key elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('a[href*="register"]')).toBeVisible();
    
    console.log('✅ Login page loaded successfully');
  });

  test('should load registration page and verify elements', async ({ page }) => {
    await page.goto('/auth/register');
    
    // Verify page loaded successfully
    await expect(page).toHaveTitle(/Register/);
    
    // Check for key elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('a[href*="login"]')).toBeVisible();
    
    console.log('✅ Registration page loaded successfully');
  });

  test('should allow user to register and redirect to dashboard', async ({ page }) => {
    await page.goto('/auth/register');
    
    // Fill registration form
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="name"]', testUser.name);
    
    // Submit registration
    await page.click('button[type="submit"]');
    
    // Verify successful registration and redirect to dashboard
    await page.waitForURL(/\/dashboard/);
    
    console.log('✅ User registration successful');
  });

  test('should allow registered user to login', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Fill login form
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Verify successful login and redirect to dashboard
    await page.waitForURL(/\/dashboard/);
    
    console.log('✅ User login successful');
  });
});