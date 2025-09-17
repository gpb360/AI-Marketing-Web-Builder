import { test, expect } from '@playwright/test';

test.describe('Authentication Form Validation Fix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3003/auth/register');
  });

  test('should load registration form successfully', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Create your account');
    await expect(page.locator('form')).toBeVisible();
  });

  test('should allow checkbox to be checked and unchecked', async ({ page }) => {
    const checkbox = page.locator('input#acceptTerms');
    const checkboxLabel = page.locator('label[for="acceptTerms"]');
    
    // Initially unchecked
    await expect(checkbox).not.toBeChecked();
    
    // Click label to check (more reliable than clicking the hidden input)
    await checkboxLabel.click();
    await expect(checkbox).toBeChecked();
    
    // Click label to uncheck
    await checkboxLabel.click();
    await expect(checkbox).not.toBeChecked();
    
    // Check again to verify it works
    await checkboxLabel.click();
    await expect(checkbox).toBeChecked();
  });

  test('should navigate to Terms and Conditions page successfully', async ({ page }) => {
    const termsLink = page.locator('a[href="/terms"]');
    await expect(termsLink).toBeVisible();
    await expect(termsLink).toContainText('Terms and Conditions');
    
    await termsLink.click();
    await expect(page).toHaveURL('http://localhost:3003/terms');
    await expect(page.locator('h1')).toContainText('Terms and Conditions');
    
    // Test back navigation
    const backButton = page.locator('a[href="/auth/register"]').first();
    await backButton.click();
    await expect(page).toHaveURL('http://localhost:3003/auth/register');
  });

  test('should navigate to Privacy Policy page successfully', async ({ page }) => {
    const privacyLink = page.locator('a[href="/privacy"]');
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toContainText('Privacy Policy');
    
    await privacyLink.click();
    await expect(page).toHaveURL('http://localhost:3003/privacy');
    await expect(page.locator('h1')).toContainText('Privacy Policy');
    
    // Test back navigation
    const backButton = page.locator('a[href="/auth/register"]').first();
    await backButton.click();
    await expect(page).toHaveURL('http://localhost:3003/auth/register');
  });

  test('should display field-level validation errors', async ({ page }) => {
    // Test individual field validation
    const emailInput = page.locator('#email');
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    
    // Fix email and test password validation
    await emailInput.fill('test@example.com');
    await emailInput.blur();
    
    const passwordInput = page.locator('#password');
    await passwordInput.fill('123');
    await passwordInput.blur();
    await expect(page.locator('text=Password must be at least 8 characters long')).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    const passwordInput = page.locator('#password');
    
    // Test weak password
    await passwordInput.fill('password');
    await passwordInput.blur();
    await expect(page.locator('text=Password must contain at least one uppercase letter, one lowercase letter, and one number')).toBeVisible();
    
    // Test strong password
    await passwordInput.fill('Password123');
    await passwordInput.blur();
    
    // Should not show error for valid password
    await expect(page.locator('text=Password must contain')).not.toBeVisible();
  });

  test('should validate password confirmation matching', async ({ page }) => {
    const passwordInput = page.locator('#password');
    const confirmPasswordInput = page.locator('#confirmPassword');
    
    await passwordInput.fill('Password123');
    await confirmPasswordInput.fill('DifferentPassword');
    await confirmPasswordInput.blur();
    
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
    
    // Fix password confirmation
    await confirmPasswordInput.fill('Password123');
    await confirmPasswordInput.blur();
    
    // Error should disappear
    await expect(page.locator('text=Passwords do not match')).not.toBeVisible();
  });

  test('should require terms acceptance for form submission', async ({ page }) => {
    // Fill all required fields
    await page.locator('#firstName').fill('John');
    await page.locator('#lastName').fill('Doe');
    await page.locator('#email').fill('john@example.com');
    await page.locator('#password').fill('Password123');
    await page.locator('#confirmPassword').fill('Password123');
    
    // Try to submit without accepting terms
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Should show terms acceptance error
    await expect(page.locator('text=You must accept the terms and conditions')).toBeVisible();
    
    // Accept terms and try again
    const checkboxLabel = page.locator('label[for="acceptTerms"]');
    await checkboxLabel.click();
    
    // Error should disappear
    await expect(page.locator('text=You must accept the terms and conditions')).not.toBeVisible();
  });

  test('should clear field errors when user starts typing', async ({ page }) => {
    const emailInput = page.locator('#email');
    
    // Trigger validation error
    await emailInput.fill('invalid');
    await emailInput.blur();
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    
    // Start typing - error should clear
    await emailInput.fill('test@');
    await expect(page.locator('text=Please enter a valid email address')).not.toBeVisible();
  });

  test('should show proper loading state during form submission', async ({ page }) => {
    // Fill form completely
    await page.locator('#firstName').fill('John');
    await page.locator('#lastName').fill('Doe');
    await page.locator('#email').fill('john@example.com');
    await page.locator('#password').fill('Password123');
    await page.locator('#confirmPassword').fill('Password123');
    await page.locator('#acceptTerms').check();
    
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toContainText('Create account');
    
    // Note: In a real scenario, we would mock the API to test loading states
    // For now, we just verify the form is ready for submission
    await expect(submitButton).not.toBeDisabled();
  });
});

test.describe('Legal Pages Content Validation', () => {
  test('Terms and Conditions page should have complete content', async ({ page }) => {
    await page.goto('http://localhost:3003/terms');
    
    // Check main headings
    await expect(page.locator('h1')).toContainText('Terms and Conditions');
    await expect(page.locator('h2').first()).toContainText('Acceptance of Terms');
    
    // Check some key sections exist
    await expect(page.locator('text=Use License')).toBeVisible();
    await expect(page.locator('text=Account Registration and Security')).toBeVisible();
    await expect(page.locator('text=AI-Generated Content')).toBeVisible();
    
    // Check navigation buttons
    await expect(page.locator('text=Back to Registration')).toBeVisible();
    await expect(page.locator('text=View Privacy Policy')).toBeVisible();
  });

  test('Privacy Policy page should have complete content', async ({ page }) => {
    await page.goto('http://localhost:3003/privacy');
    
    // Check main headings
    await expect(page.locator('h1')).toContainText('Privacy Policy');
    await expect(page.locator('h2').first()).toContainText('Information We Collect');
    
    // Check some key sections exist
    await expect(page.locator('text=How We Use Your Information')).toBeVisible();
    await expect(page.locator('text=AI and Machine Learning')).toBeVisible();
    await expect(page.locator('text=Data Security')).toBeVisible();
    
    // Check navigation buttons
    await expect(page.locator('text=Back to Registration')).toBeVisible();
    await expect(page.locator('text=View Terms & Conditions')).toBeVisible();
  });

  test('Cross-navigation between legal pages should work', async ({ page }) => {
    await page.goto('http://localhost:3003/terms');
    
    // Go to privacy from terms
    await page.locator('text=View Privacy Policy').click();
    await expect(page).toHaveURL('http://localhost:3003/privacy');
    
    // Go back to terms from privacy
    await page.locator('text=View Terms & Conditions').click();
    await expect(page).toHaveURL('http://localhost:3003/terms');
  });
});

test.describe('Responsive Behavior', () => {
  test('should work properly on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3003/auth/register');
    
    // Form should be visible and functional on mobile
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('#acceptTerms')).toBeVisible();
    
    // Should be able to interact with checkbox
    const checkbox = page.locator('input#acceptTerms');
    await page.locator('label[for="acceptTerms"]').click();
    await expect(checkbox).toBeChecked();
  });

  test('should work properly on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:3003/auth/register');
    
    // Form should be visible and functional on tablet
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('#acceptTerms')).toBeVisible();
    
    // Legal page links should be accessible
    await expect(page.locator('a[href="/terms"]')).toBeVisible();
    await expect(page.locator('a[href="/privacy"]')).toBeVisible();
  });
});