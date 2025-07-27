import { test, expect } from '@playwright/test';

/**
 * Magic Moment End-to-End Test
 * Tests the core user journey: Template → AI Customization → Workflow Connection → Live Site
 */
test.describe('Magic Moment User Journey', () => {
  test('complete template to live site with workflow automation', async ({ page }) => {
    // Step 1: Navigate to template selection
    await page.goto('/templates');
    await expect(page.locator('[data-testid=template-grid]')).toBeVisible();
    
    // Step 2: Select a SaaS template
    await page.click('[data-testid=saas-template-1]');
    await expect(page.locator('[data-testid=canvas]')).toBeVisible();
    await expect(page.locator('[data-testid=hero-component]')).toBeVisible();
    
    // Step 3: AI Component Customization
    await page.click('[data-testid=hero-component]');
    await expect(page.locator('[data-testid=property-editor]')).toBeVisible();
    
    // Test AI customization
    await page.fill('[data-testid=ai-prompt]', 'Make this more modern and blue');
    await page.click('[data-testid=generate-variations]');
    
    // Wait for AI to generate variations
    await expect(page.locator('[data-testid=ai-variations]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid=variation-1]')).toBeVisible();
    await expect(page.locator('[data-testid=variation-2]')).toBeVisible();
    await expect(page.locator('[data-testid=variation-3]')).toBeVisible();
    
    // Select a variation
    await page.click('[data-testid=variation-2]');
    await expect(page.locator('[data-testid=hero-component]')).toHaveAttribute('data-variation', '2');
    
    // Step 4: Add Contact Form Component
    await page.click('[data-testid=component-library]');
    await page.dragAndDrop('[data-testid=contact-form-component]', '[data-testid=canvas]');
    
    // Verify form component was added
    await expect(page.locator('[data-testid=contact-form]')).toBeVisible();
    
    // Step 5: Magic Connector - Connect to Workflow
    await page.click('[data-testid=contact-form]');
    await expect(page.locator('[data-testid=connect-workflow-button]')).toBeVisible();
    await page.click('[data-testid=connect-workflow-button]');
    
    // Step 6: AI Workflow Suggestions
    await expect(page.locator('[data-testid=workflow-suggestions]')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('[data-testid=suggestion-1]')).toContainText('Email follow-up');
    await expect(page.locator('[data-testid=suggestion-2]')).toContainText('CRM tracking');
    await expect(page.locator('[data-testid=suggestion-3]')).toContainText('Slack notification');
    
    // Select first workflow suggestion
    await page.click('[data-testid=suggestion-1]');
    await page.click('[data-testid=activate-workflow]');
    
    // Verify workflow was connected
    await expect(page.locator('[data-testid=workflow-connected]')).toBeVisible();
    await expect(page.locator('[data-testid=contact-form]')).toHaveAttribute('data-workflow', 'connected');
    
    // Step 7: Site Publishing
    await page.click('[data-testid=publish-button]');
    await expect(page.locator('[data-testid=publishing-modal]')).toBeVisible();
    
    await page.fill('[data-testid=site-name]', 'test-magic-moment-site');
    await page.click('[data-testid=publish-confirm]');
    
    // Wait for publishing to complete
    await expect(page.locator('[data-testid=published-url]')).toBeVisible({ timeout: 30000 });
    const publishedUrl = await page.locator('[data-testid=published-url]').textContent();
    
    // Step 8: Test Live Site and Workflow
    await page.goto(publishedUrl!);
    
    // Verify site loads correctly
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('form')).toBeVisible();
    
    // Test form submission triggers workflow
    await page.fill('[name=name]', 'Test User');
    await page.fill('[name=email]', 'test@example.com');
    await page.fill('[name=message]', 'Testing the Magic Moment workflow');
    await page.click('[type=submit]');
    
    // Verify form submission success
    await expect(page.locator('[data-testid=form-success]')).toBeVisible();
    
    // Step 9: Verify Workflow Execution
    await page.goto('/dashboard/workflows');
    
    // Check that workflow was executed
    await expect(page.locator('[data-testid=workflow-execution]')).toBeVisible();
    await expect(page.locator('[data-testid=execution-status]')).toContainText('completed');
    
    // Verify CRM contact was created
    await page.goto('/dashboard/crm/contacts');
    await expect(page.locator('[data-email="test@example.com"]')).toBeVisible();
  });

  test('AI customization performance benchmark', async ({ page }) => {
    await page.goto('/templates');
    await page.click('[data-testid=saas-template-1]');
    
    // Measure AI customization response time
    const startTime = Date.now();
    
    await page.click('[data-testid=hero-component]');
    await page.fill('[data-testid=ai-prompt]', 'Make this look premium and professional');
    await page.click('[data-testid=generate-variations]');
    await page.waitForSelector('[data-testid=ai-variations]');
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // AI should respond within 5 seconds
    expect(responseTime).toBeLessThan(5000);
    
    // Verify quality of variations
    const variations = await page.locator('[data-testid^=variation-]').count();
    expect(variations).toBe(3);
  });

  test('workflow connection success rate', async ({ page }) => {
    await page.goto('/templates');
    await page.click('[data-testid=business-template-1]');
    
    // Test multiple component types for workflow connectivity
    const components = ['contact-form', 'newsletter-signup', 'booking-form'];
    
    for (const component of components) {
      await page.dragAndDrop(`[data-testid=${component}-component]`, '[data-testid=canvas]');
      await page.click(`[data-testid=${component}]`);
      
      // Verify connect to workflow button appears
      await expect(page.locator('[data-testid=connect-workflow-button]')).toBeVisible();
      
      await page.click('[data-testid=connect-workflow-button]');
      
      // Verify AI suggests relevant workflows
      await expect(page.locator('[data-testid=workflow-suggestions]')).toBeVisible();
      const suggestions = await page.locator('[data-testid^=suggestion-]').count();
      expect(suggestions).toBeGreaterThan(0);
      
      // Connect first suggestion
      await page.click('[data-testid=suggestion-1]');
      await page.click('[data-testid=activate-workflow]');
      
      // Verify successful connection
      await expect(page.locator('[data-testid=workflow-connected]')).toBeVisible();
    }
  });
});