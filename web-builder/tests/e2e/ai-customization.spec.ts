import { test, expect } from '@playwright/test';

/**
 * AI Component Customization Tests
 * Tests v0-style AI editing and component modification
 */
test.describe('AI Component Customization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/builder');
    await page.click('[data-testid=component-library]');
    await page.dragAndDrop('[data-testid=hero-section-component]', '[data-testid=canvas]');
    await page.click('[data-testid=hero-section]');
  });

  test('natural language component modification', async ({ page }) => {
    const testPrompts = [
      'Make this more modern and blue',
      'Add a gradient background',
      'Make the text larger and bold',
      'Center align everything',
      'Add more padding around the content',
      'Make this look more professional',
      'Change the button to green',
      'Add a subtle shadow effect'
    ];

    for (const prompt of testPrompts) {
      // Enter AI prompt
      await page.fill('[data-testid=ai-prompt]', prompt);
      await page.click('[data-testid=generate-variations]');
      
      // Wait for AI to generate variations
      await expect(page.locator('[data-testid=ai-variations]')).toBeVisible({ timeout: 10000 });
      
      // Verify 3 variations are generated
      await expect(page.locator('[data-testid=variation-1]')).toBeVisible();
      await expect(page.locator('[data-testid=variation-2]')).toBeVisible();
      await expect(page.locator('[data-testid=variation-3]')).toBeVisible();
      
      // Test variation preview
      await page.hover('[data-testid=variation-1]');
      await expect(page.locator('[data-testid=preview-overlay]')).toBeVisible();
      
      // Apply variation
      await page.click('[data-testid=variation-1]');
      await expect(page.locator('[data-testid=component-modified]')).toBeVisible();
      
      // Verify undo functionality
      await page.click('[data-testid=undo-button]');
      
      // Clear prompt for next iteration
      await page.fill('[data-testid=ai-prompt]', '');
    }
  });

  test('AI customization performance benchmarks', async ({ page }) => {
    const performanceTests = [
      { prompt: 'Make this blue', expectedMaxTime: 3000 },
      { prompt: 'Add a gradient background from blue to purple', expectedMaxTime: 4000 },
      { prompt: 'Make this component look more modern with shadows and rounded corners', expectedMaxTime: 5000 },
      { prompt: 'Transform this into a dark theme with neon accents and futuristic styling', expectedMaxTime: 6000 }
    ];

    for (const test of performanceTests) {
      const startTime = Date.now();
      
      await page.fill('[data-testid=ai-prompt]', test.prompt);
      await page.click('[data-testid=generate-variations]');
      await page.waitForSelector('[data-testid=ai-variations]');
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(test.expectedMaxTime);
      
      // Clear for next test
      await page.fill('[data-testid=ai-prompt]', '');
      await page.click('[data-testid=clear-variations]');
    }
  });

  test('brand consistency enforcement', async ({ page }) => {
    // Set brand guidelines
    await page.click('[data-testid=brand-settings]');
    await page.fill('[data-testid=primary-color]', '#FF6B6B');
    await page.fill('[data-testid=secondary-color]', '#4ECDC4');
    await page.fill('[data-testid=brand-font]', 'Inter');
    await page.click('[data-testid=save-brand]');
    
    // Test AI respects brand guidelines
    await page.fill('[data-testid=ai-prompt]', 'Make this more colorful');
    await page.click('[data-testid=generate-variations]');
    
    await page.waitForSelector('[data-testid=ai-variations]');
    
    // Check that variations use brand colors
    const variation1 = page.locator('[data-testid=variation-1]');
    await expect(variation1).toBeVisible();
    
    // Apply variation and verify brand consistency
    await page.click('[data-testid=variation-1]');
    
    const heroSection = page.locator('[data-testid=hero-section]');
    const computedStyle = await heroSection.evaluate((el) => {
      return window.getComputedStyle(el);
    });
    
    // Should use brand colors or complementary colors
    expect(computedStyle.color || computedStyle.backgroundColor).toMatch(/(255, 107, 107)|(78, 205, 196)/);
  });

  test('multi-component batch editing', async ({ page }) => {
    // Add multiple components
    await page.click('[data-testid=component-library]');
    await page.dragAndDrop('[data-testid=feature-grid-component]', '[data-testid=canvas]');
    await page.dragAndDrop('[data-testid=call-to-action-component]', '[data-testid=canvas]');
    
    // Select multiple components
    await page.keyboard.down('Shift');
    await page.click('[data-testid=hero-section]');
    await page.click('[data-testid=feature-grid]');
    await page.click('[data-testid=call-to-action]');
    await page.keyboard.up('Shift');
    
    // Apply AI modification to all selected
    await page.fill('[data-testid=ai-prompt]', 'Make all of these use a consistent blue theme');
    await page.click('[data-testid=generate-variations]');
    
    await page.waitForSelector('[data-testid=ai-variations]');
    await page.click('[data-testid=variation-1]');
    
    // Verify all components were modified consistently
    await expect(page.locator('[data-testid=hero-section][data-modified="true"]')).toBeVisible();
    await expect(page.locator('[data-testid=feature-grid][data-modified="true"]')).toBeVisible();
    await expect(page.locator('[data-testid=call-to-action][data-modified="true"]')).toBeVisible();
  });

  test('AI accessibility compliance', async ({ page }) => {
    // Test AI maintains accessibility standards
    await page.fill('[data-testid=ai-prompt]', 'Make this text very light gray on white background');
    await page.click('[data-testid=generate-variations]');
    
    await page.waitForSelector('[data-testid=ai-variations]');
    
    // Check for accessibility warnings
    await expect(page.locator('[data-testid=accessibility-warning]')).toBeVisible();
    await expect(page.locator('[data-testid=contrast-ratio-warning]')).toContainText('contrast ratio');
    
    // Test AI provides accessible alternative
    await page.click('[data-testid=suggest-accessible-alternative]');
    await expect(page.locator('[data-testid=accessible-variation]')).toBeVisible();
    
    // Apply accessible version
    await page.click('[data-testid=accessible-variation]');
    
    // Verify accessibility compliance
    const textElement = page.locator('[data-testid=hero-title]');
    const styles = await textElement.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor
      };
    });
    
    // Should have sufficient contrast ratio (simplified check)
    expect(styles.color).not.toBe('rgb(211, 211, 211)'); // Very light gray
  });

  test('AI learning and improvement', async ({ page }) => {
    // Test user feedback improves AI suggestions
    await page.fill('[data-testid=ai-prompt]', 'Make this more professional');
    await page.click('[data-testid=generate-variations]');
    
    await page.waitForSelector('[data-testid=ai-variations]');
    
    // Rate variations
    await page.click('[data-testid=variation-1]');
    await page.click('[data-testid=thumbs-up]'); // Positive feedback
    
    await page.fill('[data-testid=ai-prompt]', 'Make this more professional');
    await page.click('[data-testid=generate-variations]');
    
    await page.waitForSelector('[data-testid=ai-variations]');
    
    // Second generation should be influenced by feedback
    // This would need actual AI integration to test properly
    await expect(page.locator('[data-testid=ai-variations]')).toBeVisible();
  });
});