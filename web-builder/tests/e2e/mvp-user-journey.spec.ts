import { test, expect, type Page } from '@playwright/test';

/**
 * MVP User Journey E2E Tests
 * 
 * Tests the complete user flow from registration to deployed website:
 * 1. User Registration & Authentication
 * 2. Template Selection & Customization 
 * 3. Content Creation & Magic Connector
 * 4. Site Generation & Publishing
 * 5. Performance & SEO Validation
 */

test.describe('MVP Complete User Journey', () => {
  let page: Page;
  const testUser = {
    email: `test.user.${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User'
  };

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/');
  });

  test('Complete MVP User Journey: Registration → Template → Customization → Publishing', async () => {
    // ===== STEP 1: User Registration & Authentication =====
    await test.step('User Registration and Login', async () => {
      // Navigate to registration
      await page.click('[data-testid="get-started-btn"], .get-started, a[href*="register"]');
      await page.waitForURL(/\/(register|signup|auth)/);

      // Fill registration form
      await page.fill('input[name="email"], input[type="email"]', testUser.email);
      await page.fill('input[name="password"], input[type="password"]', testUser.password);
      await page.fill('input[name="name"], input[name="firstName"]', testUser.name);
      
      // Submit registration
      await page.click('button[type="submit"], .register-btn, .signup-btn');
      
      // Verify successful registration (either redirect to dashboard or login)
      await page.waitForURL(/\/(dashboard|login|builder)/);
      
      // If redirected to login, sign in
      if (page.url().includes('login')) {
        await page.fill('input[name="email"], input[type="email"]', testUser.email);
        await page.fill('input[name="password"], input[type="password"]', testUser.password);
        await page.click('button[type="submit"], .login-btn');
        await page.waitForURL(/\/dashboard/);
      }

      // Verify user is authenticated
      await expect(page.locator('text="Welcome"')).toBeVisible({ timeout: 10000 });
      console.log('✅ User registration and authentication successful');
    });

    // ===== STEP 2: Template Selection =====
    await test.step('Template Selection', async () => {
      // Navigate to template gallery
      await page.click('[data-testid="create-website-btn"], .create-site, a[href*="templates"]');
      await page.waitForURL(/\/(templates|gallery|builder)/);

      // Wait for templates to load
      await page.waitForSelector('.template-card, .template-item', { timeout: 15000 });
      
      // Select a template (business or marketing template)
      const templates = page.locator('.template-card, .template-item');
      await expect(templates.first()).toBeVisible();
      
      // Click "Use Template" button
      await page.click('.template-card:first-child .use-template, .template-item:first-child button');
      
      // Verify navigation to builder
      await page.waitForURL(/\/builder/, { timeout: 15000 });
      await page.waitForSelector('.visual-builder, .builder-canvas', { timeout: 15000 });
      
      console.log('✅ Template selection successful');
    });

    // ===== STEP 3: Visual Builder Customization =====
    await test.step('Visual Builder Customization', async () => {
      // Wait for builder to load
      await page.waitForSelector('.builder-canvas', { timeout: 15000 });
      
      // Test component library access
      await expect(page.locator('.component-library, .components-panel')).toBeVisible();
      
      // Test drag and drop functionality (if available)
      const heroComponent = page.locator('.hero-component, [data-component="hero"]').first();
      if (await heroComponent.isVisible()) {
        await heroComponent.click();
        console.log('✅ Hero component interaction successful');
      }

      // Test text editing
      const editableText = page.locator('text="Welcome", .hero-heading, .editable-text').first();
      if (await editableText.isVisible()) {
        await editableText.click();
        await page.keyboard.selectAll();
        await page.keyboard.type('My Amazing Business Website');
        console.log('✅ Text editing successful');
      }

      // Test Magic Connector (if available)
      const magicConnectorBtn = page.locator('[data-testid="magic-connector"], .magic-connector-btn');
      if (await magicConnectorBtn.isVisible()) {
        await magicConnectorBtn.click();
        await page.waitForSelector('.workflow-builder, .magic-connector-modal', { timeout: 5000 });
        
        // Test workflow creation
        const workflowNode = page.locator('.workflow-node, .node').first();
        if (await workflowNode.isVisible()) {
          await workflowNode.click();
          console.log('✅ Magic Connector workflow interaction successful');
        }
        
        // Close modal
        await page.click('.close-modal, [data-testid="close-modal"]');
      }

      console.log('✅ Visual builder customization completed');
    });

    // ===== STEP 4: Site Generation & Publishing =====
    await test.step('Site Generation and Publishing', async () => {
      // Navigate to publish section
      await page.click('[data-testid="publish-btn"], .publish-btn, .deploy-btn');
      
      // Wait for publish interface
      await page.waitForSelector('.publish-modal, .deploy-section', { timeout: 10000 });
      
      // Configure site settings
      const siteNameInput = page.locator('input[name="siteName"], input[placeholder*="site name"]');
      if (await siteNameInput.isVisible()) {
        await siteNameInput.fill('My Test Website');
      }

      // Test SEO settings
      const seoSection = page.locator('.seo-settings, [data-section="seo"]');
      if (await seoSection.isVisible()) {
        await seoSection.click();
        
        const descriptionField = page.locator('textarea[name="description"], .seo-description');
        if (await descriptionField.isVisible()) {
          await descriptionField.fill('A professional business website created with AI Marketing Web Builder');
        }
        console.log('✅ SEO settings configured');
      }

      // Generate static site
      await page.click('.generate-site, .build-site, [data-testid="generate-site"]');
      
      // Wait for generation to complete (up to 30 seconds)
      await page.waitForSelector('.generation-complete, .site-ready', { timeout: 30000 });
      
      // Verify generation success
      await expect(page.locator('text="Site generated successfully", .success-message')).toBeVisible();
      console.log('✅ Static site generation successful');
    });

    // ===== STEP 5: Performance & SEO Validation =====
    await test.step('Performance and SEO Validation', async () => {
      // Check SEO score
      const seoScore = page.locator('.seo-score, [data-metric="seo"]');
      if (await seoScore.isVisible()) {
        const scoreText = await seoScore.textContent();
        const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
        expect(score).toBeGreaterThan(80); // Expect SEO score > 80
        console.log(`✅ SEO Score: ${score}/100`);
      }

      // Check responsive score
      const responsiveScore = page.locator('.responsive-score, [data-metric="responsive"]');
      if (await responsiveScore.isVisible()) {
        const scoreText = await responsiveScore.textContent();
        const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
        expect(score).toBeGreaterThan(75); // Expect responsive score > 75
        console.log(`✅ Responsive Score: ${score}/100`);
      }

      // Check generation time
      const generationTime = page.locator('.generation-time, [data-metric="time"]');
      if (await generationTime.isVisible()) {
        const timeText = await generationTime.textContent();
        const timeMs = parseFloat(timeText?.match(/[\d.]+/)?.[0] || '0');
        expect(timeMs).toBeLessThan(30000); // Should generate in under 30 seconds
        console.log(`✅ Generation Time: ${timeMs}ms`);
      }

      console.log('✅ Performance and SEO validation completed');
    });

    // ===== STEP 6: Final Site Preview =====
    await test.step('Site Preview and Validation', async () => {
      // Open site preview
      const previewBtn = page.locator('.preview-site, .view-site, [data-testid="preview"]');
      if (await previewBtn.isVisible()) {
        await previewBtn.click();
        
        // Switch to preview tab/window
        const pages = await page.context().pages();
        const previewPage = pages[pages.length - 1];
        await previewPage.waitForLoadState('networkidle');
        
        // Validate generated site structure
        await expect(previewPage.locator('html')).toBeVisible();
        await expect(previewPage.locator('head title')).toBeVisible();
        await expect(previewPage.locator('meta[name="description"]')).toBeVisible();
        
        // Test responsive design
        await previewPage.setViewportSize({ width: 375, height: 667 }); // Mobile
        await previewPage.waitForTimeout(1000);
        await expect(previewPage.locator('body')).toBeVisible();
        
        await previewPage.setViewportSize({ width: 1024, height: 768 }); // Desktop
        await previewPage.waitForTimeout(1000);
        
        console.log('✅ Site preview validation successful');
        await previewPage.close();
      }
    });

    console.log('🎉 Complete MVP User Journey Test Passed!');
  });

  test('Mobile User Journey', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await test.step('Mobile Template Selection', async () => {
      // Test mobile navigation
      await page.click('[data-testid="mobile-menu"], .hamburger-menu');
      await page.click('[data-testid="templates-link"], a[href*="templates"]');
      
      // Verify mobile template gallery
      await page.waitForSelector('.template-card', { timeout: 10000 });
      await expect(page.locator('.template-card').first()).toBeVisible();
      
      console.log('✅ Mobile template selection working');
    });

    await test.step('Mobile Builder Experience', async () => {
      // Select template on mobile
      await page.click('.template-card:first-child .use-template');
      await page.waitForURL(/\/builder/);
      
      // Test mobile builder interface
      await page.waitForSelector('.builder-canvas', { timeout: 15000 });
      
      // Test touch interactions
      const heroElement = page.locator('.hero-component').first();
      if (await heroElement.isVisible()) {
        await heroElement.tap();
        console.log('✅ Mobile touch interaction successful');
      }
      
      console.log('✅ Mobile builder experience validated');
    });
  });

  test('Error Handling and Edge Cases', async () => {
    await test.step('Test Error Recovery', async () => {
      // Test network interruption simulation
      await page.route('**/api/**', route => {
        if (Math.random() < 0.1) { // 10% chance of failure
          route.abort();
        } else {
          route.continue();
        }
      });

      // Attempt normal flow and verify error handling
      await page.goto('/templates');
      await page.waitForTimeout(2000);
      
      // Check for error messages or retry mechanisms
      const errorMsg = page.locator('.error-message, .retry-btn');
      if (await errorMsg.isVisible()) {
        console.log('✅ Error handling mechanisms present');
      }
    });

    await test.step('Test Invalid Input Handling', async () => {
      await page.goto('/builder');
      
      // Test with invalid/empty inputs
      const textInput = page.locator('input[type="text"]').first();
      if (await textInput.isVisible()) {
        await textInput.fill(''); // Empty input
        await page.keyboard.press('Enter');
        
        // Verify validation messages
        const validation = page.locator('.error, .validation-message');
        if (await validation.isVisible()) {
          console.log('✅ Input validation working');
        }
      }
    });
  });
});

/**
 * Performance Benchmarking Tests
 */
test.describe('MVP Performance Benchmarks', () => {
  test('Page Load Performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
    
    console.log(`✅ Homepage load time: ${loadTime}ms`);
  });

  test('Builder Performance', async ({ page }) => {
    await page.goto('/builder');
    
    const startTime = Date.now();
    await page.waitForSelector('.builder-canvas', { timeout: 15000 });
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000); // Builder should load in under 5 seconds
    console.log(`✅ Builder load time: ${loadTime}ms`);
  });

  test('Template Gallery Performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/templates');
    await page.waitForSelector('.template-card', { timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(4000); // Templates should load in under 4 seconds
    
    // Count loaded templates
    const templateCount = await page.locator('.template-card').count();
    expect(templateCount).toBeGreaterThan(0);
    
    console.log(`✅ Templates loaded: ${templateCount} in ${loadTime}ms`);
  });
});