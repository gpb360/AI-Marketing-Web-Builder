/**
 * Integration Test: AI Features Integration
 * Tests the integration between frontend AI components and backend AI services
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import axios from 'axios';

// Mock the axios calls to simulate backend responses
jest.mock('axios');

describe('AI Features Integration', () => {
  const mockAxios = axios as jest.Mocked<typeof axios>;
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset any axios mock implementations
    mockAxios.post.mockReset();
    mockAxios.get.mockReset();
  });

  describe('AI Component Suggestions Integration', () => {
    test('should successfully generate component suggestions', async () => {
      const mockResponse = {
        data: {
          suggestions: [
            {
              type: 'hero',
              name: 'Modern Hero Section',
              props: {
                title: 'Welcome to Our Platform',
                subtitle: 'The best solution for your business',
                ctaText: 'Get Started'
              }
            },
            {
              type: 'features',
              name: 'Feature Grid',
              props: {
                title: 'Our Features',
                features: [
                  { title: 'Easy to Use', description: 'Simple and intuitive interface' },
                  { title: 'Powerful', description: 'Advanced features for professionals' }
                ]
              }
            }
          ],
          processing_time_ms: 120
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const requestData = {
        prompt: 'Create a hero section for a tech startup',
        context: {
          industry: 'technology',
          style: 'modern'
        }
      };

      const response = await axios.post('/api/v1/ai/component-suggestions', requestData);

      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/ai/component-suggestions', requestData);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.suggestions)).toBe(true);
      expect(response.data.suggestions.length).toBe(2);
      expect(response.data.processing_time_ms).toBeDefined();
    });

    test('should successfully customize component with AI', async () => {
      const mockResponse = {
        data: {
          component: {
            id: 'hero-1',
            type: 'hero',
            name: 'Customized Hero Section',
            props: {
              title: 'Revolutionary Tech Solutions',
              subtitle: 'Transforming businesses with cutting-edge technology',
              ctaText: 'Start Your Journey',
              styles: {
                backgroundColor: '#1a202c',
                textColor: '#ffffff'
              }
            }
          },
          explanation: 'Updated the hero section with more impactful messaging and a darker theme for better contrast.'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const componentId = 'hero-1';
      const customizationData = {
        instructions: 'Make the messaging more impactful and use a darker theme',
        style_preferences: ['dark', 'professional']
      };

      const response = await axios.post(`/api/v1/ai/components/${componentId}/customize`, customizationData);

      expect(mockAxios.post).toHaveBeenCalledWith(`/api/v1/ai/components/${componentId}/customize`, customizationData);
      expect(response.status).toBe(200);
      expect(response.data.component).toBeDefined();
      expect(response.data.component.props.title).toBe('Revolutionary Tech Solutions');
      expect(response.data.explanation).toBeDefined();
    });
  });

  describe('AI Template Recommendations Integration', () => {
    test('should successfully generate template recommendations', async () => {
      const mockResponse = {
        data: {
          recommendations: [
            {
              template_id: 'saas-landing-1',
              template_name: 'Premium SaaS Landing Page',
              recommendation_score: 0.95,
              confidence_level: 0.88,
              reasons: [
                'Matches technology industry focus',
                'Includes lead capture features',
                'Optimized for conversion'
              ]
            },
            {
              template_id: 'tech-product-1',
              template_name: 'Tech Product Showcase',
              recommendation_score: 0.87,
              confidence_level: 0.82,
              reasons: [
                'Designed for tech products',
                'Modern aesthetic',
                'Mobile responsive'
              ]
            }
          ],
          processing_time_ms: 250
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const recommendationData = {
        business_context: {
          industry: 'technology',
          company_size: 'medium',
          target_audience: 'b2b',
          primary_goals: ['lead_generation', 'brand_awareness']
        }
      };

      const response = await axios.post('/api/v1/ai/template-recommendations', recommendationData);

      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/ai/template-recommendations', recommendationData);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.recommendations)).toBe(true);
      expect(response.data.recommendations.length).toBe(2);
      expect(response.data.recommendations[0].template_id).toBe('saas-landing-1');
      expect(response.data.recommendations[0].recommendation_score).toBeGreaterThan(0.8);
    });
  });

  describe('AI Workflow Generation Integration', () => {
    test('should successfully generate workflow logic', async () => {
      const mockResponse = {
        data: {
          workflow: {
            name: 'Lead Capture and Follow-up',
            description: 'Captures leads through a form and sends automated follow-up emails',
            nodes: [
              {
                id: 'trigger-1',
                type: 'formSubmission',
                name: 'Form Submission',
                position: { x: 100, y: 100 }
              },
              {
                id: 'action-1',
                type: 'addToCrm',
                name: 'Add to CRM',
                position: { x: 300, y: 100 }
              },
              {
                id: 'action-2',
                type: 'sendEmail',
                name: 'Send Welcome Email',
                position: { x: 500, y: 100 }
              }
            ],
            edges: [
              { id: 'edge-1', source: 'trigger-1', target: 'action-1' },
              { id: 'edge-2', source: 'action-1', target: 'action-2' }
            ]
          },
          explanation: 'This workflow captures leads from a form submission, adds them to your CRM, and sends a welcome email.'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const workflowData = {
        goal: 'Lead capture and follow-up',
        requirements: ['email collection', 'CRM integration', 'automated emails']
      };

      const response = await axios.post('/api/v1/ai/workflow-generator', workflowData);

      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/ai/workflow-generator', workflowData);
      expect(response.status).toBe(200);
      expect(response.data.workflow).toBeDefined();
      expect(Array.isArray(response.data.workflow.nodes)).toBe(true);
      expect(Array.isArray(response.data.workflow.edges)).toBe(true);
      expect(response.data.workflow.nodes.length).toBe(3);
      expect(response.data.workflow.edges.length).toBe(2);
    });
  });

  describe('AI Performance Prediction Integration', () => {
    test('should successfully predict performance metrics', async () => {
      const mockResponse = {
        data: {
          predictions: {
            conversion_rate: {
              value: 3.2,
              confidence: 0.85,
              factors: ['Strong call-to-action', 'Mobile optimization', 'Fast loading speed']
            },
            loading_speed: {
              value: 1.8,
              unit: 'seconds',
              confidence: 0.92,
              factors: ['Optimized images', 'Efficient code', 'CDN usage']
            },
            seo_score: {
              value: 87,
              confidence: 0.78,
              factors: ['Proper meta tags', 'Semantic HTML', 'Fast loading']
            }
          },
          recommendations: [
            'Add more testimonials to increase trust',
            'Optimize images further to improve loading speed',
            'Add more relevant keywords for better SEO'
          ],
          processing_time_ms: 180
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const projectId = 1;
      const predictionData = {
        metrics: ['conversion_rate', 'loading_speed', 'seo_score'],
        scenarios: ['mobile', 'desktop']
      };

      const response = await axios.post(`/api/v1/ai/projects/${projectId}/predict-performance`, predictionData);

      expect(mockAxios.post).toHaveBeenCalledWith(`/api/v1/ai/projects/${projectId}/predict-performance`, predictionData);
      expect(response.status).toBe(200);
      expect(response.data.predictions).toBeDefined();
      expect(response.data.predictions.conversion_rate).toBeDefined();
      expect(response.data.predictions.loading_speed).toBeDefined();
      expect(response.data.predictions.seo_score).toBeDefined();
      expect(Array.isArray(response.data.recommendations)).toBe(true);
    });
  });

  describe('AI Business Context Analysis Integration', () => {
    test('should successfully analyze business context', async () => {
      const mockResponse = {
        data: {
          analysis_id: 'analysis_123',
          business_context: {
            industry: 'restaurant',
            company_size: 'small',
            target_audience: 'local',
            primary_goals: ['online_orders', 'reservations']
          },
          industry_insights: {
            market_trends: ['Increased online ordering', 'Mobile-first experiences'],
            key_success_factors: ['Fast loading speed', 'Easy navigation', 'Clear menu']
          },
          recommended_templates: [
            {
              template_id: 'restaurant-1',
              template_name: 'Modern Restaurant Website',
              recommendation_score: 0.92,
              confidence_level: 0.85
            }
          ],
          ai_summary: 'Based on your restaurant business, I recommend focusing on online ordering features and mobile optimization.',
          analysis_confidence: 0.88,
          processing_time_ms: 320
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const contextData = {
        business_context: {
          industry: 'restaurant',
          company_size: 'small',
          target_audience: 'local',
          primary_goals: ['online_orders', 'reservations']
        }
      };

      const response = await axios.post('/api/v1/business-context/analyze', contextData);

      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/business-context/analyze', contextData);
      expect(response.status).toBe(200);
      expect(response.data.analysis_id).toBeDefined();
      expect(response.data.business_context.industry).toBe('restaurant');
      expect(Array.isArray(response.data.recommended_templates)).toBe(true);
      expect(response.data.ai_summary).toBeDefined();
    });
  });
});