import { test, expect, type Page } from '@playwright/test';

/**
 * MCP Authentication End-to-End Tests
 * 
 * Tests the complete user authentication flow:
 * 1. User Registration
 * 2. User Login
 * 3. Token Validation
 * 4. Protected Route Access
 */

test.describe('MCP Authentication Flow', () => {
  let page: Page;
  const testUser = {
    email: `mcp.test.${Date.now()}@example.com`,
    password: 'McpTestPassword123!',
    name: 'MCP Test User'
  };

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/');
  });

  test('User Registration and Login Flow', async () => {
    // ===== STEP 1: User Registration =====
    await test.step('User Registration', async () => {
      // Navigate to registration page
      await page.click('[data-testid="get-started-btn"], .get-started, a[href*="register"]');
      await page.waitForURL(/\/(register|signup|auth)/);

      // Fill registration form
      await page.fill('input[name="email"], input[type="email"]', testUser.email);
      await page.fill('input[name="password"], input[type="password"]', testUser.password);
      await page.fill('input[name="name"], input[name="firstName"]', testUser.name);
      
      // Submit registration
      await page.click('button[type="submit"], .register-btn, .signup-btn');
      
      // Verify successful registration
      await page.waitForURL(/\/(dashboard|login|builder)/, { timeout: 15000 });
      
      // Check for success message
      await expect(page.locator('text="Welcome", text="Account created", .success-message')).toBeVisible({ timeout: 10000 });
      
      console.log('✅ User registration successful');
    });

    // ===== STEP 2: User Login =====
    await test.step('User Login', async () => {
      // If not already on login page, navigate to it
      if (!page.url().includes('login')) {
        await page.click('a[href*="login"], .login-link');
        await page.waitForURL(/\/login/);
      }

      // Fill login form
      await page.fill('input[name="email"], input[type="email"]', testUser.email);
      await page.fill('input[name="password"], input[type="password"]', testUser.password);
      
      // Submit login
      await page.click('button[type="submit"], .login-btn');
      
      // Verify successful login
      await page.waitForURL(/\/(dashboard|builder|home)/, { timeout: 15000 });
      await expect(page.locator('text="Welcome", .user-menu, .dashboard')).toBeVisible({ timeout: 10000 });
      
      console.log('✅ User login successful');
    });

    // ===== STEP 3: Token Validation =====
    await test.step('Authentication Token Validation', async () => {
      // Check if auth token is stored (in localStorage or cookies)
      const localStorageItems = await page.evaluate(() => Object.keys(localStorage));
      const hasAuthToken = localStorageItems.some(key => key.includes('token') || key.includes('auth'));
      
      // Alternative: check for auth-related cookies
      const cookies = await page.context().cookies();
      const hasAuthCookies = cookies.some(cookie => 
        cookie.name.includes('token') || 
        cookie.name.includes('auth') || 
        cookie.name.includes('session')
      );
      
      // Expect either auth token in localStorage or auth cookies
      expect(hasAuthToken || hasAuthCookies).toBeTruthy();
      
      console.log('✅ Authentication token validation successful');
    });

    // ===== STEP 4: Protected Route Access =====
    await test.step('Protected Route Access', async () => {
      // Try to access a protected route (profile/dashboard)
      await page.goto('/dashboard');
      
      // Should stay on dashboard (not redirected to login)
      await expect(page).toHaveURL(/\/dashboard/);
      
      // Check for user-specific content
      await expect(page.locator(`text="${testUser.name}", .user-profile, .account-info`)).toBeVisible({ timeout: 10000 });
      
      console.log('✅ Protected route access successful');
    });

    console.log('✅ Complete MCP Authentication Flow Test Passed');
  });

  test('Login with Invalid Credentials', async () => {
    // ===== STEP 1: Attempt Login with Invalid Credentials =====
    await test.step('Invalid Login Attempt', async () => {
      // Navigate to login page
      await page.goto('/login');
      
      // Fill login form with invalid credentials
      await page.fill('input[name="email"], input[type="email"]', 'invalid@example.com');
      await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');
      
      // Submit login
      await page.click('button[type="submit"], .login-btn');
      
      // Verify error message is displayed
      await expect(page.locator('text="Invalid credentials", text="Incorrect email or password", .error-message')).toBeVisible({ timeout: 10000 });
      
      // Should remain on login page
      await expect(page).toHaveURL(/\/login/);
      
      console.log('✅ Invalid login attempt handled correctly');
    });

    console.log('✅ Invalid Credentials Test Passed');
  });

  test('Registration with Existing Email', async () => {
    // ===== STEP 1: Attempt Registration with Existing Email =====
    await test.step('Duplicate Registration Attempt', async () => {
      // Navigate to registration page
      await page.goto('/register');
      
      // Fill registration form with existing email
      await page.fill('input[name="email"], input[type="email"]', testUser.email);
      await page.fill('input[name="password"], input[type="password"]', 'anotherpassword123');
      await page.fill('input[name="name"], input[name="firstName"]', 'Another User');
      
      // Submit registration
      await page.click('button[type="submit"], .register-btn, .signup-btn');
      
      // Verify error message is displayed
      await expect(page.locator('text="Email already registered", text="already exists", .error-message')).toBeVisible({ timeout: 10000 });
      
      console.log('✅ Duplicate registration attempt handled correctly');
    });

    console.log('✅ Duplicate Registration Test Passed');
  });
});