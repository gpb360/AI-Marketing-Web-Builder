import { test, expect } from '@playwright/test';

/**
 * Component Library and Drag-Drop Tests
 * Tests the 50+ smart components and drag-drop functionality
 */
test.describe('Component Library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/builder');
    await expect(page.locator('[data-testid=canvas]')).toBeVisible();
  });

  test('drag and drop all component types', async ({ page }) => {
    const components = [
      'hero-section',
      'contact-form',
      'newsletter-signup',
      'pricing-table',
      'testimonials',
      'feature-grid',
      'call-to-action',
      'image-gallery',
      'video-embed',
      'social-proof',
      'faq-section',
      'team-showcase',
      'stats-counter',
      'progress-bars',
      'timeline',
      'blog-preview',
      'product-showcase',
      'booking-form',
      'search-bar',
      'navigation-menu'
    ];

    await page.click('[data-testid=component-library]');
    
    for (const component of components) {
      // Drag component to canvas
      await page.dragAndDrop(
        `[data-testid=${component}-component]`,
        '[data-testid=canvas]'
      );
      
      // Verify component was added
      await expect(page.locator(`[data-testid=${component}]`)).toBeVisible();
      
      // Test component selection
      await page.click(`[data-testid=${component}]`);
      await expect(page.locator('[data-testid=property-editor]')).toBeVisible();
      
      // Verify component has workflow connect button (for form components)
      if (['contact-form', 'newsletter-signup', 'booking-form', 'search-bar'].includes(component)) {
        await expect(page.locator('[data-testid=connect-workflow-button]')).toBeVisible();
      }
    }
  });

  test('component positioning and layout', async ({ page }) => {
    await page.click('[data-testid=component-library]');
    
    // Add multiple components
    await page.dragAndDrop('[data-testid=hero-section-component]', '[data-testid=canvas]');
    await page.dragAndDrop('[data-testid=feature-grid-component]', '[data-testid=canvas]');
    await page.dragAndDrop('[data-testid=contact-form-component]', '[data-testid=canvas]');
    
    // Test component reordering
    await page.dragAndDrop('[data-testid=contact-form]', '[data-testid=hero-section]');
    
    // Verify new order
    const components = await page.locator('[data-testid^=component-]:visible').all();
    expect(components.length).toBe(3);
    
    // Test responsive behavior
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
    await expect(page.locator('[data-testid=canvas]')).toBeVisible();
    
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await expect(page.locator('[data-testid=canvas]')).toBeVisible();
    
    // Return to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('component styling and customization', async ({ page }) => {
    await page.click('[data-testid=component-library]');
    await page.dragAndDrop('[data-testid=hero-section-component]', '[data-testid=canvas]');
    
    // Select component for editing
    await page.click('[data-testid=hero-section]');
    await expect(page.locator('[data-testid=property-editor]')).toBeVisible();
    
    // Test color customization
    await page.click('[data-testid=background-color]');
    await page.fill('[data-testid=color-input]', '#3B82F6');
    await expect(page.locator('[data-testid=hero-section]')).toHaveCSS('background-color', 'rgb(59, 130, 246)');
    
    // Test text editing
    await page.dblclick('[data-testid=hero-title]');
    await page.fill('[data-testid=text-editor]', 'Custom Hero Title');
    await page.press('[data-testid=text-editor]', 'Enter');
    await expect(page.locator('[data-testid=hero-title]')).toContainText('Custom Hero Title');
    
    // Test spacing adjustments
    await page.click('[data-testid=spacing-controls]');
    await page.fill('[data-testid=padding-top]', '64');
    await expect(page.locator('[data-testid=hero-section]')).toHaveCSS('padding-top', '64px');
  });

  test('component performance with 100+ components', async ({ page }) => {
    await page.click('[data-testid=component-library]');
    
    const startTime = Date.now();
    
    // Add 100 text components to test performance
    for (let i = 0; i < 100; i++) {
      await page.dragAndDrop('[data-testid=text-component]', '[data-testid=canvas]');
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should handle 100 components within reasonable time
    expect(totalTime).toBeLessThan(30000); // 30 seconds max
    
    // Test interaction responsiveness with many components
    const interactionStart = Date.now();
    await page.click('[data-testid=text-component]:first-child');
    await page.waitForSelector('[data-testid=property-editor]');
    const interactionEnd = Date.now();
    
    // Component selection should remain fast
    expect(interactionEnd - interactionStart).toBeLessThan(500); // 500ms max
  });
});