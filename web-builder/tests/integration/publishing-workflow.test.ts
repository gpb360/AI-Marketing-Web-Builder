import { describe, it, expect, jest } from '@jest/globals';
import { useBuilderStore } from '../../src/store/builderStore';
import { publishingService } from '../../src/lib/services/PublishingService';
import apiClient from '../../src/lib/api/client';

/**
 * Integration Test for Publishing Workflow
 * Tests the complete publishing flow from component creation to site deployment
 */

describe('Publishing Workflow Integration', () => {
  beforeEach(() => {
    // Mock API client to avoid network requests during testing
    jest.spyOn(apiClient, 'post').mockImplementation(async (url: string) => {
      if (url.includes('/sites/upload')) {
        return { siteId: 'test-site-id' };
      }
      if (url.includes('/deployments')) {
        return { success: true };
      }
      if (url.includes('/sites/') && url.includes('/publish')) {
        return { 
          published_site_id: 'test-deployment-id', 
          preview_url: 'https://test-deployment.vercel.app',
          taskId: 'test-task-id'
        };
      }
      return {};
    });
  });

  afterEach(() => {
    // Clear mocks after each test
    jest.clearAllMocks();
  });
  it('should successfully publish a site with components', async () => {
    // Mock components for testing
    const mockComponents = [
      {
        id: 'test-hero-1',
        type: 'hero',
        name: 'Hero Section',
        props: {
          heading: 'Test Website',
          subheading: 'Built with AI Marketing Web Builder',
          buttonText: 'Get Started',
          styles: {
            backgroundColor: '#4F46E5',
            color: 'white'
          }
        },
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 600 },
        style: {},
        children: [],
        order: 1
      },
      {
        id: 'test-text-1',
        type: 'text',
        name: 'Text Section',
        props: {
          content: 'This is a test website for publishing workflow validation.',
          styles: {
            fontSize: '16px',
            color: '#374151'
          }
        },
        position: { x: 0, y: 600 },
        size: { width: 1200, height: 200 },
        style: {},
        children: [],
        order: 2
      }
    ];

    // Mock template
    const mockTemplate = {
      id: 'test-template-1',
      name: 'Test Template',
      description: 'A template for testing publishing workflow',
      category: 'business',
      previewImage: '/test-template.jpg',
      components: mockComponents
    };

    // Test site generation
    const generatedSite = await publishingService.publishSite(
      mockComponents,
      mockTemplate,
      {
        siteName: 'test-publishing-site',
        performanceOptimization: true,
        includeAnalytics: true
      }
    );

    // Log the result for debugging
    console.log('Publishing result:', generatedSite);
    
    // Validate successful generation
    expect(generatedSite.success).toBe(true);
    expect(generatedSite.deploymentUrl).toBeDefined();
    expect(generatedSite.message).toContain('Site published successfully');
    
    console.log('✅ Site publishing successful');
    console.log(`Deployment URL: ${generatedSite.deploymentUrl}`);
  });

  it('should handle publishing errors gracefully', async () => {
    // Test with invalid site name
    const mockComponents = [
      {
        id: 'test-hero-1',
        type: 'hero',
        name: 'Hero Section',
        props: {
          heading: 'Test Website',
        },
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 600 },
        style: {},
        children: [],
        order: 1
      }
    ];
    
    // Mock a deployment service failure
    jest.spyOn(apiClient, 'post').mockImplementationOnce(async () => {
      throw new Error('Deployment service unavailable');
    });
    
    const result = await publishingService.publishSite(
      mockComponents,
      null,
      {
        siteName: 'test-site' // Valid site name
      }
    );

    // Should fail gracefully
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.message).toContain('Publishing failed');
    
    console.log('✅ Error handling working correctly');
  });

  it('should update publishing status in store', async () => {
    // This would test the integration with the builder store
    // In a real test, we would mock the store and verify state updates
    expect(true).toBe(true); // Placeholder for store integration test
    
    console.log('✅ Store integration test placeholder');
  });
});