/**
 * Story 3.2: Smart Workflow Templates - E2E Test Suite
 * 
 * End-to-end tests for complete smart template recommendation and customization journey
 * 
 * @author Test Writer Fixer Agent - Story 3.2 E2E Tests
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Story 3.2: Smart Workflow Templates E2E', () => {
  
  // ========================================================================
  // TEST SETUP
  // ========================================================================
  
  test.beforeEach(async ({ page }) => {
    // Navigate to template selection
    await page.goto('/builder/templates');
    
    // Mock business analysis API
    await page.route('**/api/v1/business/analyze', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          industry: 'E-commerce',
          brandVoice: 'Professional',
          targetAudience: 'B2B',
          marketingMaturity: 'Intermediate',
          automationReadiness: 85,
          businessSize: 'Medium',
          currentTools: ['Shopify', 'MailChimp'],
          marketingGoals: ['Lead Generation', 'Customer Retention'],
          confidence: 94
        })
      });
    });

    // Mock template recommendations API
    await page.route('**/api/v1/templates/recommendations', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            template_id: 'ecom-abandoned-cart',
            name: 'Abandoned Cart Recovery',
            category: 'E-commerce',
            description: 'Recover lost sales with automated follow-up emails',
            relevanceScore: 96,
            successProbability: 91,
            estimatedSetupTime: 12,
            difficulty: 'Easy',
            tags: ['email', 'cart', 'recovery', 'automation'],
            preview: {
              thumbnail: '/templates/abandoned-cart-thumb.jpg',
              steps: [
                'Detect cart abandonment',
                'Wait 1 hour',
                'Send reminder email', 
                'Wait 24 hours',
                'Send discount email'
              ]
            },
            performance: {
              averageConversion: 18.5,
              industryBenchmark: 12.3,
              userRating: 4.8,
              successRate: 89
            },
            customizations: {
              emailTemplates: [
                {
                  type: 'reminder',
                  subject: 'You left something in your cart at [Brand Name]',
                  preview: 'Complete your purchase and save 10%',
                  personalization: 87
                },
                {
                  type: 'discount',
                  subject: 'Last chance: 15% off your abandoned items',
                  preview: 'Don\'t miss out on these great products!',
                  personalization: 92
                }
              ],
              integrationRequirements: [
                {
                  service: 'Shopify',
                  status: 'available',
                  setupComplexity: 'Low',
                  estimatedTime: '5 minutes'
                }
              ]
            },
            reasoning: {
              primaryFactors: [
                'Perfect match for e-commerce industry',
                'High ROI potential for abandoned carts', 
                'Easy integration with existing Shopify setup'
              ],
              confidenceScore: 96,
              riskFactors: ['Email deliverability depends on sender reputation'],
              successIndicators: ['90% of similar businesses see 15%+ recovery rate']
            }
          },
          {
            template_id: 'lead-nurturing-b2b',
            name: 'B2B Lead Nurturing Sequence',
            category: 'Marketing',
            description: 'Nurture B2B leads through personalized email sequences',
            relevanceScore: 89,
            successProbability: 84,
            estimatedSetupTime: 18,
            difficulty: 'Intermediate',
            tags: ['b2b', 'lead nurturing', 'email', 'crm'],
            preview: {
              thumbnail: '/templates/b2b-nurturing-thumb.jpg',
              steps: [
                'Lead capture form submission',
                'Send welcome email',
                'Score lead based on engagement',
                'Conditional content based on score',
                'Sales team notification for hot leads'
              ]
            },
            performance: {
              averageConversion: 24.2,
              industryBenchmark: 18.7,
              userRating: 4.5,
              successRate: 82
            }
          }
        ])
      });
    });

    // Mock template instantiation API
    await page.route('**/api/v1/templates/*/instantiate', async route => {
      const templateId = route.request().url().split('/').slice(-2)[0];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          workflow_id: 456,
          template_id: templateId,
          name: 'Abandoned Cart Recovery - Customized',
          status: 'created',
          customizations_applied: true,
          setup_instructions: [
            'Connect your Shopify store webhook',
            'Configure cart abandonment trigger (1 hour delay)',
            'Customize email templates with your branding',
            'Set up discount codes for second email',
            'Test the workflow with a sample cart abandonment'
          ],
          next_steps: [
            'Review and test email templates',
            'Set up tracking and analytics',
            'Configure A/B testing variants'
          ]
        })
      });
    });
  });

  // ========================================================================
  // BUSINESS ANALYSIS TESTS (AC: 1)
  // ========================================================================
  
  test('analyzes business context and generates smart recommendations', async ({ page }) => {
    // Should show analyze business button initially
    await expect(page.getByRole('button', { name: 'Analyze My Business' })).toBeVisible();
    
    // Start business analysis
    await page.getByRole('button', { name: 'Analyze My Business' }).click();
    
    // Should show analysis in progress
    await expect(page.getByText('Analyzing your business...')).toBeVisible();
    await expect(page.getByRole('progressbar')).toBeVisible();
    
    // Should complete analysis and show results
    await expect(page.getByText('Business Analysis Complete')).toBeVisible();
    
    // Should display business context
    await expect(page.getByText('Industry: E-commerce')).toBeVisible();
    await expect(page.getByText('Brand Voice: Professional')).toBeVisible();
    await expect(page.getByText('Target Audience: B2B')).toBeVisible();
    await expect(page.getByText('Marketing Maturity: Intermediate')).toBeVisible();
    
    // Should show confidence score
    await expect(page.getByText('94% confidence')).toBeVisible();
    
    // Should automatically load relevant templates
    await expect(page.getByText('Templates recommended for your business')).toBeVisible();
    await expect(page.getByText('Abandoned Cart Recovery')).toBeVisible();
  });

  test('provides detailed business insights and recommendations', async ({ page }) => {
    await page.getByRole('button', { name: 'Analyze My Business' }).click();
    
    // Wait for analysis to complete
    await expect(page.getByText('Business Analysis Complete')).toBeVisible();
    
    // Click to see detailed insights
    await page.getByRole('button', { name: 'View Detailed Insights' }).click();
    
    // Should show comprehensive analysis modal
    await expect(page.getByRole('dialog', { name: 'Business Analysis Insights' })).toBeVisible();
    
    // Should show automation readiness score
    await expect(page.getByText('Automation Readiness: 85%')).toBeVisible();
    
    // Should show current tools analysis
    await expect(page.getByText('Current Tools')).toBeVisible();
    await expect(page.getByText('Shopify')).toBeVisible();
    await expect(page.getByText('MailChimp')).toBeVisible();
    
    // Should show marketing goals
    await expect(page.getByText('Marketing Goals')).toBeVisible();
    await expect(page.getByText('Lead Generation')).toBeVisible();
    await expect(page.getByText('Customer Retention')).toBeVisible();
  });

  // ========================================================================
  // TEMPLATE RECOMMENDATION TESTS (AC: 2, 6)
  // ========================================================================
  
  test('displays smart template recommendations with relevance scoring', async ({ page }) => {
    await page.getByRole('button', { name: 'Analyze My Business' }).click();
    await expect(page.getByText('Templates recommended for your business')).toBeVisible();
    
    // Should show template cards with relevance scores
    const abandonedCartCard = page.getByTestId('template-card-ecom-abandoned-cart');
    await expect(abandonedCartCard).toBeVisible();
    await expect(abandonedCartCard.getByText('96%')).toBeVisible(); // Relevance score
    await expect(abandonedCartCard.getByText('91%')).toBeVisible(); // Success probability
    
    const b2bNurturingCard = page.getByTestId('template-card-lead-nurturing-b2b'); 
    await expect(b2bNurturingCard).toBeVisible();
    await expect(b2bNurturingCard.getByText('89%')).toBeVisible(); // Relevance score
    
    // Should show performance indicators
    await expect(page.getByText('18.5% avg conversion')).toBeVisible();
    await expect(page.getByText('50% above industry benchmark')).toBeVisible();
    
    // Should show difficulty and setup time
    await expect(page.getByText('Easy')).toBeVisible();
    await expect(page.getByText('12 min setup')).toBeVisible();
  });

  test('shows AI reasoning and success prediction for recommendations', async ({ page }) => {
    await page.getByRole('button', { name: 'Analyze My Business' }).click();
    await expect(page.getByText('Abandoned Cart Recovery')).toBeVisible();
    
    // Click on template to see detailed reasoning
    await page.getByTestId('template-card-ecom-abandoned-cart').click();
    
    // Should open template preview modal
    await expect(page.getByRole('dialog', { name: 'Template Preview' })).toBeVisible();
    
    // Should show AI reasoning
    await expect(page.getByText('Why this template fits your business')).toBeVisible();
    await expect(page.getByText('Perfect match for e-commerce industry')).toBeVisible();
    await expect(page.getByText('High ROI potential for abandoned carts')).toBeVisible();
    await expect(page.getByText('Easy integration with existing Shopify setup')).toBeVisible();
    
    // Should show confidence score
    await expect(page.getByText('96% confidence')).toBeVisible();
    
    // Should show success prediction
    await expect(page.getByText('Success Prediction')).toBeVisible();
    await expect(page.getByText('90% of similar businesses see 15%+ recovery rate')).toBeVisible();
    
    // Should show risk factors
    await expect(page.getByText('Risk Factors')).toBeVisible();
    await expect(page.getByText('Email deliverability depends on sender reputation')).toBeVisible();
  });

  // ========================================================================
  // TEMPLATE CUSTOMIZATION TESTS (AC: 3)
  // ========================================================================
  
  test('previews AI-suggested template customizations', async ({ page }) => {
    await page.getByRole('button', { name: 'Analyze My Business' }).click();
    await page.getByTestId('template-card-ecom-abandoned-cart').click();
    
    // Switch to customizations tab
    await page.getByRole('tab', { name: 'Customizations' }).click();
    
    // Should show email template customizations
    await expect(page.getByText('Email Templates')).toBeVisible();
    
    // Should show first email customization
    const reminderEmail = page.getByTestId('email-customization-reminder');
    await expect(reminderEmail.getByText('You left something in your cart at [Brand Name]')).toBeVisible();
    await expect(reminderEmail.getByText('87% personalization')).toBeVisible();
    
    // Should show second email customization
    const discountEmail = page.getByTestId('email-customization-discount');
    await expect(discountEmail.getByText('Last chance: 15% off your abandoned items')).toBeVisible();
    await expect(discountEmail.getByText('92% personalization')).toBeVisible();
    
    // Should show before/after comparison
    await page.getByRole('button', { name: 'Show Before/After' }).click();
    await expect(page.getByText('Generic Template')).toBeVisible();
    await expect(page.getByText('Customized for Your Business')).toBeVisible();
    
    // Should show impact assessment
    await expect(page.getByText('Expected Impact')).toBeVisible();
    await expect(page.getByText('25% higher open rates')).toBeVisible();
    await expect(page.getByText('40% higher click-through rates')).toBeVisible();
  });

  test('shows integration requirements and setup complexity', async ({ page }) => {
    await page.getByRole('button', { name: 'Analyze My Business' }).click();
    await page.getByTestId('template-card-ecom-abandoned-cart').click();
    
    await page.getByRole('tab', { name: 'Integration' }).click();
    
    // Should show integration requirements
    await expect(page.getByText('Integration Requirements')).toBeVisible();
    
    const shopifyIntegration = page.getByTestId('integration-shopify');
    await expect(shopifyIntegration.getByText('Shopify')).toBeVisible();
    await expect(shopifyIntegration.getByText('Available')).toBeVisible();
    await expect(shopifyIntegration.getByText('Low complexity')).toBeVisible();
    await expect(shopifyIntegration.getByText('5 minutes')).toBeVisible();
    
    // Should show setup instructions preview
    await expect(page.getByText('Setup Instructions')).toBeVisible();
    await expect(page.getByText('1. Connect Shopify webhook')).toBeVisible();
    await expect(page.getByText('2. Configure abandonment trigger')).toBeVisible();
    await expect(page.getByText('3. Customize email templates')).toBeVisible();
  });

  // ========================================================================
  // ONE-CLICK INSTANTIATION TESTS (AC: 4)
  // ========================================================================
  
  test('instantiates workflow with business-specific customizations', async ({ page }) => {
    await page.getByRole('button', { name: 'Analyze My Business' }).click();
    await page.getByTestId('template-card-ecom-abandoned-cart').click();
    
    // Create workflow from template
    await page.getByRole('button', { name: 'Create Workflow' }).click();
    
    // Should show creation in progress
    await expect(page.getByText('Creating your customized workflow...')).toBeVisible();
    await expect(page.getByRole('progressbar')).toBeVisible();
    
    // Should complete and show success
    await expect(page.getByText('Workflow Created Successfully!')).toBeVisible();
    
    // Should show workflow details
    await expect(page.getByText('Abandoned Cart Recovery - Customized')).toBeVisible();
    await expect(page.getByText('Workflow ID: 456')).toBeVisible();
    
    // Should show setup instructions
    await expect(page.getByText('Next Steps')).toBeVisible();
    await expect(page.getByText('Connect your Shopify store webhook')).toBeVisible();
    await expect(page.getByText('Configure cart abandonment trigger')).toBeVisible();
    await expect(page.getByText('Customize email templates with your branding')).toBeVisible();
    
    // Should provide action buttons
    await expect(page.getByRole('button', { name: 'Open Workflow Editor' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Setup Guide' })).toBeVisible();
  });

  test('handles instantiation errors gracefully', async ({ page }) => {
    // Mock error response
    await page.route('**/api/v1/templates/*/instantiate', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Integration service unavailable',
          code: 'INTEGRATION_ERROR',
          details: 'Unable to connect to Shopify API'
        })
      });
    });

    await page.getByRole('button', { name: 'Analyze My Business' }).click();
    await page.getByTestId('template-card-ecom-abandoned-cart').click();
    await page.getByRole('button', { name: 'Create Workflow' }).click();
    
    // Should show error message
    await expect(page.getByText('Workflow Creation Failed')).toBeVisible();
    await expect(page.getByText('Integration service unavailable')).toBeVisible();
    await expect(page.getByText('Unable to connect to Shopify API')).toBeVisible();
    
    // Should provide retry option
    await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Contact Support' })).toBeVisible();
  });

  // ========================================================================
  // TEMPLATE SELECTION INTERFACE TESTS (AC: 5)
  // ========================================================================
  
  test('provides comprehensive filtering and search capabilities', async ({ page }) => {
    await page.getByRole('button', { name: 'Analyze My Business' }).click();
    await expect(page.getByText('Abandoned Cart Recovery')).toBeVisible();
    
    // Test category filtering
    await page.getByRole('combobox', { name: 'Category' }).click();
    await page.getByRole('option', { name: 'E-commerce' }).click();
    
    // Should filter to e-commerce templates only
    await expect(page.getByText('Abandoned Cart Recovery')).toBeVisible();
    await expect(page.getByText('B2B Lead Nurturing Sequence')).not.toBeVisible();
    
    // Test difficulty filtering
    await page.getByRole('combobox', { name: 'Difficulty' }).click();
    await page.getByRole('option', { name: 'Easy' }).click();
    
    // Should show only easy templates
    await expect(page.getByText('Abandoned Cart Recovery')).toBeVisible();
    
    // Test search functionality
    await page.getByPlaceholder('Search templates...').fill('cart');
    await expect(page.getByText('Abandoned Cart Recovery')).toBeVisible();
    
    // Test success rate filter
    const successRateSlider = page.getByRole('slider', { name: 'Minimum Success Rate' });
    await successRateSlider.fill('90');
    
    // Should show only high success rate templates
    await expect(page.getByText('Abandoned Cart Recovery')).toBeVisible(); // 91% success rate
  });

  test('supports different view modes and sorting options', async ({ page }) => {
    await page.getByRole('button', { name: 'Analyze My Business' }).click();
    
    // Should default to grid view
    await expect(page.getByTestId('template-grid')).toBeVisible();
    
    // Switch to list view
    await page.getByRole('button', { name: 'List View' }).click();
    await expect(page.getByTestId('template-list')).toBeVisible();
    await expect(page.getByTestId('template-grid')).not.toBeVisible();
    
    // Test sorting options
    await page.getByRole('combobox', { name: 'Sort by' }).click();
    
    // Sort by relevance (default)
    await page.getByRole('option', { name: 'Relevance' }).click();
    
    // Should maintain order with highest relevance first
    const firstTemplate = page.getByTestId('template-list').locator('[data-testid^="template-card-"]').first();
    await expect(firstTemplate.getByText('96%')).toBeVisible(); // Highest relevance score
    
    // Sort by success rate
    await page.getByRole('combobox', { name: 'Sort by' }).click();
    await page.getByRole('option', { name: 'Success Rate' }).click();
    
    // Sort by setup time
    await page.getByRole('combobox', { name: 'Sort by' }).click();
    await page.getByRole('option', { name: 'Setup Time' }).click();
  });

  // ========================================================================
  // BUSINESS CONTEXT INTEGRATION TESTS (AC: 7)
  // ========================================================================
  
  test('maintains business context throughout workflow creation process', async ({ page }) => {
    await page.getByRole('button', { name: 'Analyze My Business' }).click();
    
    // Business context should be visible in sidebar
    const contextPanel = page.getByTestId('business-context-panel');
    await expect(contextPanel.getByText('E-commerce')).toBeVisible();
    await expect(contextPanel.getByText('Professional')).toBeVisible();
    
    // Select template
    await page.getByTestId('template-card-ecom-abandoned-cart').click();
    
    // Context should remain visible in template preview
    await expect(page.getByText('Customized for E-commerce businesses')).toBeVisible();
    
    // Create workflow
    await page.getByRole('button', { name: 'Create Workflow' }).click();
    
    // Context should be applied to workflow creation
    await expect(page.getByText('Professional brand voice applied')).toBeVisible();
    await expect(page.getByText('B2B audience targeting configured')).toBeVisible();
  });

  test('updates recommendations when business context changes', async ({ page }) => {
    await page.getByRole('button', { name: 'Analyze My Business' }).click();
    await expect(page.getByText('Abandoned Cart Recovery')).toBeVisible();
    
    // Edit business context
    await page.getByRole('button', { name: 'Edit Business Context' }).click();
    
    // Change industry
    await page.getByRole('combobox', { name: 'Industry' }).click();
    await page.getByRole('option', { name: 'SaaS' }).click();
    
    // Change target audience
    await page.getByRole('combobox', { name: 'Target Audience' }).click();
    await page.getByRole('option', { name: 'B2C' }).click();
    
    await page.getByRole('button', { name: 'Update Analysis' }).click();
    
    // Should refresh recommendations
    await expect(page.getByText('Updating recommendations...')).toBeVisible();
    await expect(page.getByText('SaaS Onboarding Sequence')).toBeVisible();
    
    // Previous e-commerce templates should be less relevant
    const abandonedCartCard = page.getByTestId('template-card-ecom-abandoned-cart');
    await expect(abandonedCartCard.getByText('67%')).toBeVisible(); // Lower relevance score
  });

  // ========================================================================
  // ACCESSIBILITY TESTS
  // ========================================================================
  
  test('supports full keyboard navigation and screen readers', async ({ page }) => {
    // Navigate using keyboard only
    await page.keyboard.press('Tab'); // Analyze Business button
    await page.keyboard.press('Enter');
    
    // Wait for analysis
    await expect(page.getByText('Business Analysis Complete')).toBeVisible();
    
    // Tab to first template
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const firstTemplate = page.locator(':focus');
    await expect(firstTemplate).toHaveAttribute('data-testid', 'template-card-ecom-abandoned-cart');
    
    // Activate template with keyboard
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Navigate within modal
    await page.keyboard.press('Tab');
    await expect(page.getByRole('tab', { name: 'Customizations' })).toBeFocused();
    
    // Should have proper ARIA labels
    await expect(page.getByLabelText('Template relevance score: 96%')).toBeVisible();
    await expect(page.getByLabelText('Success probability: 91%')).toBeVisible();
  });

  test('provides comprehensive screen reader support', async ({ page }) => {
    await page.getByRole('button', { name: 'Analyze My Business' }).click();
    await expect(page.getByText('Abandoned Cart Recovery')).toBeVisible();
    
    // Check for proper semantic markup
    await expect(page.getByRole('main')).toHaveAttribute('aria-label', 'Smart Template Recommendations');
    await expect(page.getByRole('region', { name: 'Business Context' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Template Recommendations' })).toBeVisible();
    
    // Check for live regions for dynamic content
    await expect(page.locator('[aria-live="polite"]')).toBeVisible();
    
    // Check for proper headings hierarchy
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Smart Template Recommendations');
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Recommended for Your Business');
  });

  // ========================================================================
  // PERFORMANCE TESTS
  // ========================================================================
  
  test('handles large template catalogs efficiently', async ({ page }) => {
    // Mock large template set
    await page.route('**/api/v1/templates/recommendations', async route => {
      const largeTemplateSet = Array.from({ length: 100 }, (_, i) => ({
        template_id: `template-${i}`,
        name: `Template ${i}`,
        category: ['Marketing', 'Sales', 'Support', 'E-commerce'][i % 4],
        relevanceScore: 100 - i,
        successProbability: 90 - (i % 20),
        estimatedSetupTime: 10 + (i % 30)
      }));
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(largeTemplateSet)
      });
    });

    const startTime = Date.now();
    
    await page.getByRole('button', { name: 'Analyze My Business' }).click();
    
    // Should load templates within reasonable time
    await expect(page.getByText('Template 99')).toBeVisible({ timeout: 5000 });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
    
    // Should implement virtual scrolling
    await expect(page.getByTestId('virtual-scroll-container')).toBeVisible();
    
    // Should only render visible templates
    const visibleTemplates = await page.locator('[data-testid^="template-card-"]').count();
    expect(visibleTemplates).toBeLessThanOrEqual(20);
  });

  test('optimizes search and filtering performance', async ({ page }) => {
    await page.getByRole('button', { name: 'Analyze My Business' }).click();
    
    const searchInput = page.getByPlaceholder('Search templates...');
    
    // Type search query character by character
    await searchInput.type('abandon', { delay: 50 });
    
    // Should debounce search requests
    await expect(page.getByText('Searching...')).toBeVisible();
    await expect(page.getByText('Abandoned Cart Recovery')).toBeVisible();
    
    // Filter performance test
    const startTime = Date.now();
    
    await page.getByRole('combobox', { name: 'Category' }).click();
    await page.getByRole('option', { name: 'E-commerce' }).click();
    
    const filterTime = Date.now() - startTime;
    expect(filterTime).toBeLessThan(500); // Should filter instantly
  });

  // ========================================================================
  // INTEGRATION WITH WORKFLOW BUILDER
  // ========================================================================
  
  test('seamlessly integrates with workflow builder', async ({ page }) => {
    await page.getByRole('button', { name: 'Analyze My Business' }).click();
    await page.getByTestId('template-card-ecom-abandoned-cart').click();
    await page.getByRole('button', { name: 'Create Workflow' }).click();
    
    // Should navigate to workflow builder
    await page.getByRole('button', { name: 'Open Workflow Editor' }).click();
    await expect(page).toHaveURL(/.*\/builder\/workflow\/456/);
    
    // Should load template workflow in builder
    await expect(page.getByText('Detect cart abandonment')).toBeVisible();
    await expect(page.getByText('Send reminder email')).toBeVisible();
    
    // Should show template customization panel
    await expect(page.getByText('Template Customizations')).toBeVisible();
    await expect(page.getByText('AI-Applied Changes')).toBeVisible();
    
    // Should allow further customization
    await page.getByTestId('node-email-reminder').dblclick();
    await expect(page.getByRole('dialog', { name: 'Edit Email Node' })).toBeVisible();
  });
});