/**
 * Stories 3.1 & 3.2: Integration Test Suite
 * 
 * End-to-end integration testing for Visual Workflow Debugging and Smart Templates
 * 
 * @author Test Writer Fixer Agent - Stories 3.1 & 3.2 Integration Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Import components
import WorkflowDebuggingPanel from '../../src/components/builder/WorkflowDebuggingPanel';
import SmartTemplateRecommendations from '../../src/components/builder/SmartTemplateRecommendations';
import SmartTemplateSelector from '../../src/components/builder/SmartTemplateSelector';
import { Canvas } from '../../src/components/builder/Canvas';

// Mock API client
const mockApiClient = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

jest.mock('../../src/lib/api/client', () => ({
  api: mockApiClient
}));

// Mock WebSocket
const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: WebSocket.OPEN
};

(global as any).WebSocket = jest.fn(() => mockWebSocket);

describe('Stories 3.1 & 3.2: Integration Tests', () => {
  
  // ========================================================================
  // TEST DATA
  // ========================================================================
  
  const mockWorkflow = {
    id: 1,
    name: 'Test E-commerce Workflow',
    description: 'Complete e-commerce automation',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        name: 'Form Submission',
        position: { x: 100, y: 100 },
        data: { formId: 'contact-form' }
      },
      {
        id: 'action-1', 
        type: 'action',
        name: 'Send Welcome Email',
        position: { x: 300, y: 100 },
        data: { template: 'welcome-email' }
      },
      {
        id: 'condition-1',
        type: 'condition',
        name: 'Check Purchase History',
        position: { x: 500, y: 100 },
        data: { condition: 'purchase_count > 0' }
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'action-1' },
      { id: 'e2', source: 'action-1', target: 'condition-1' }
    ],
    status: 'draft',
    created_at: '2024-01-15T10:00:00Z'
  };

  const mockBusinessContext = {
    industry: 'E-commerce',
    brandVoice: 'Professional',
    targetAudience: 'B2B',
    marketingMaturity: 'Intermediate',
    automationReadiness: 85,
    businessSize: 'Medium',
    currentTools: ['Shopify', 'MailChimp'],
    marketingGoals: ['Lead Generation', 'Customer Retention']
  };

  const mockTemplateRecommendation = {
    template_id: 'ecom-abandoned-cart',
    name: 'Abandoned Cart Recovery',
    category: 'E-commerce',
    description: 'Recover lost sales with automated follow-up emails',
    relevanceScore: 96,
    successProbability: 91,
    estimatedSetupTime: 12,
    customizations: {
      emailTemplates: [
        {
          type: 'reminder',
          subject: 'You left something in your cart',
          preview: 'Complete your purchase and save 10%'
        }
      ],
      integrationRequirements: [
        {
          service: 'Shopify',
          status: 'available',
          setupComplexity: 'Low'
        }
      ]
    },
    workflow: {
      nodes: [
        {
          id: 'trigger-cart',
          type: 'trigger',
          name: 'Cart Abandonment',
          data: { event: 'cart_abandoned', delay: '1 hour' }
        },
        {
          id: 'email-reminder',
          type: 'action', 
          name: 'Send Reminder Email',
          data: { template: 'cart-reminder' }
        }
      ]
    }
  };

  const mockExecutionData = {
    execution_id: 123,
    workflow_id: 1,
    status: 'running',
    started_at: '2024-01-15T10:30:00Z',
    total_steps: 3,
    completed_steps: 2,
    failed_steps: 0,
    steps: [
      {
        id: 'step-1',
        node_id: 'trigger-1',
        status: 'success',
        started_at: '2024-01-15T10:30:00Z',
        finished_at: '2024-01-15T10:30:05Z',
        execution_time_ms: 5000,
        performance_metrics: {
          cpu_usage: 15.2,
          memory_usage: 64.8
        }
      },
      {
        id: 'step-2',
        node_id: 'action-1',
        status: 'running',
        started_at: '2024-01-15T10:30:05Z',
        performance_metrics: {
          cpu_usage: 22.1,
          memory_usage: 89.3
        }
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default API responses
    mockApiClient.get.mockResolvedValue({ data: mockWorkflow });
    mockApiClient.post.mockResolvedValue({ data: { success: true } });
  });

  // ========================================================================
  // STORY 3.1: VISUAL WORKFLOW DEBUGGING INTEGRATION TESTS
  // ========================================================================
  
  describe('Story 3.1: Visual Workflow Debugging Integration', () => {
    
    it('integrates debugging panel with Canvas for real-time visualization', async () => {
      // Mock WebSocket connection and status updates
      mockApiClient.get
        .mockResolvedValueOnce({ data: mockWorkflow })
        .mockResolvedValueOnce({ data: mockExecutionData });

      render(
        <div className="flex">
          <Canvas workflow={mockWorkflow} />
          <WorkflowDebuggingPanel 
            workflow={mockWorkflow}
            isDebugging={true}
          />
        </div>
      );

      // Should show debugging panel
      expect(screen.getByText('Workflow Debugging')).toBeInTheDocument();
      
      // Should show workflow canvas with nodes
      expect(screen.getByText('Form Submission')).toBeInTheDocument();
      expect(screen.getByText('Send Welcome Email')).toBeInTheDocument();

      // Execute workflow to test debugging integration
      const executeButton = screen.getByText('Execute Workflow');
      fireEvent.click(executeButton);

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/workflows/1/execute',
          expect.any(Object)
        );
      });
    });

    it('shows real-time status updates on workflow nodes', async () => {
      // Setup WebSocket to simulate real-time updates
      const mockEventListener = jest.fn();
      mockWebSocket.addEventListener = mockEventListener;

      render(
        <WorkflowDebuggingPanel 
          workflow={mockWorkflow}
          isDebugging={true}
        />
      );

      // Simulate WebSocket connection
      const wsOpenCallback = mockEventListener.mock.calls.find(
        call => call[0] === 'open'
      )?.[1];
      
      if (wsOpenCallback) {
        act(() => {
          wsOpenCallback();
        });
      }

      // Simulate status update message
      const wsMessageCallback = mockEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];

      if (wsMessageCallback) {
        act(() => {
          wsMessageCallback({
            data: JSON.stringify({
              type: 'node_status_update',
              node_id: 'action-1',
              status: 'running',
              progress: 75
            })
          });
        });
      }

      // Should show running status on node
      await waitFor(() => {
        const runningNode = screen.getByTestId('node-action-1');
        expect(runningNode).toHaveClass('status-running');
      });
    });

    it('handles error states and provides debugging information', async () => {
      const errorExecutionData = {
        ...mockExecutionData,
        status: 'failed',
        steps: [
          ...mockExecutionData.steps.slice(0, 1),
          {
            id: 'step-2',
            node_id: 'action-1',
            status: 'failed',
            started_at: '2024-01-15T10:30:05Z',
            finished_at: '2024-01-15T10:30:10Z',
            error_message: 'Email service timeout',
            error_code: 'TIMEOUT',
            stack_trace: 'Error at line 42...'
          }
        ]
      };

      mockApiClient.get.mockResolvedValueOnce({ data: errorExecutionData });

      render(
        <WorkflowDebuggingPanel 
          workflow={mockWorkflow}
          isDebugging={true}
        />
      );

      // Should show error indicator
      await waitFor(() => {
        expect(screen.getByTestId('node-action-1')).toHaveClass('status-failed');
      });

      // Click on failed node to see error details
      fireEvent.click(screen.getByTestId('node-action-1'));

      // Should open error details modal
      await waitFor(() => {
        expect(screen.getByText('Node Execution Error')).toBeInTheDocument();
        expect(screen.getByText('Email service timeout')).toBeInTheDocument();
        expect(screen.getByText('TIMEOUT')).toBeInTheDocument();
      });
    });

    it('provides execution timeline with performance metrics', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockExecutionData });

      render(
        <WorkflowDebuggingPanel 
          workflow={mockWorkflow}
          isDebugging={true}
        />
      );

      // Switch to timeline view
      fireEvent.click(screen.getByText('Execution Timeline'));

      await waitFor(() => {
        expect(screen.getByText('Step 1: trigger-1')).toBeInTheDocument();
        expect(screen.getByText('CPU: 15.2%')).toBeInTheDocument();
        expect(screen.getByText('Memory: 64.8MB')).toBeInTheDocument();
        expect(screen.getByText('5.0s')).toBeInTheDocument(); // Execution time
      });
    });
  });

  // ========================================================================
  // STORY 3.2: SMART TEMPLATE RECOMMENDATIONS INTEGRATION TESTS  
  // ========================================================================
  
  describe('Story 3.2: Smart Template Recommendations Integration', () => {
    
    it('analyzes business context and generates relevant recommendations', async () => {
      // Mock business analysis API call
      mockApiClient.post
        .mockResolvedValueOnce({ data: mockBusinessContext })
        .mockResolvedValueOnce({ data: [mockTemplateRecommendation] });

      render(<SmartTemplateRecommendations />);

      // Start business analysis
      const analyzeButton = screen.getByText('Analyze My Business');
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/business/analyze',
          expect.objectContaining({
            website_url: expect.any(String)
          })
        );
      });

      // Should show business context results
      await waitFor(() => {
        expect(screen.getByText('E-commerce')).toBeInTheDocument();
        expect(screen.getByText('Professional')).toBeInTheDocument();
        expect(screen.getByText('B2B')).toBeInTheDocument();
      });

      // Should show relevant template recommendations
      await waitFor(() => {
        expect(screen.getByText('Abandoned Cart Recovery')).toBeInTheDocument();
        expect(screen.getByText('96%')).toBeInTheDocument(); // Relevance score
      });
    });

    it('provides AI-powered template customization preview', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: [mockTemplateRecommendation] });

      render(<SmartTemplateRecommendations />);

      // Select template to see customizations
      await waitFor(() => {
        fireEvent.click(screen.getByText('Abandoned Cart Recovery'));
      });

      fireEvent.click(screen.getByText('Preview Customizations'));

      // Should show customized email template
      await waitFor(() => {
        expect(screen.getByText('You left something in your cart')).toBeInTheDocument();
        expect(screen.getByText('Complete your purchase and save 10%')).toBeInTheDocument();
      });

      // Should show integration requirements
      expect(screen.getByText('Integration Requirements')).toBeInTheDocument();
      expect(screen.getByText('Shopify')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument(); // Setup complexity
    });

    it('instantiates workflow from template with business-specific customizations', async () => {
      const instantiatedWorkflow = {
        id: 456,
        name: 'Abandoned Cart Recovery - Customized',
        template_id: 'ecom-abandoned-cart',
        nodes: mockTemplateRecommendation.workflow.nodes,
        customizations_applied: true,
        setup_instructions: [
          'Connect your Shopify store',
          'Configure cart abandonment webhook',
          'Customize email templates with your branding'
        ]
      };

      mockApiClient.post.mockResolvedValueOnce({ data: instantiatedWorkflow });

      render(<SmartTemplateRecommendations />);

      // Select and instantiate template
      await waitFor(() => {
        fireEvent.click(screen.getByText('Abandoned Cart Recovery'));
      });

      const createButton = screen.getByText('Create Workflow');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/templates/ecom-abandoned-cart/instantiate',
          expect.objectContaining({
            business_context: mockBusinessContext,
            customizations: true
          })
        );
      });

      // Should show setup instructions
      await waitFor(() => {
        expect(screen.getByText('Setup Instructions')).toBeInTheDocument();
        expect(screen.getByText('Connect your Shopify store')).toBeInTheDocument();
        expect(screen.getByText('Customize email templates with your branding')).toBeInTheDocument();
      });
    });

    it('integrates with workflow builder for template editing', async () => {
      const instantiatedWorkflow = {
        ...mockWorkflow,
        template_id: 'ecom-abandoned-cart',
        template_customizations: mockTemplateRecommendation.customizations
      };

      mockApiClient.post.mockResolvedValueOnce({ data: instantiatedWorkflow });

      render(
        <div className="flex">
          <SmartTemplateSelector />
          <Canvas workflow={null} />
        </div>
      );

      // Select template
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('template-card-ecom-abandoned-cart'));
      });

      // Instantiate and edit
      fireEvent.click(screen.getByText('Create & Edit'));

      await waitFor(() => {
        // Should load workflow in canvas
        expect(screen.getByText('Cart Abandonment')).toBeInTheDocument();
        expect(screen.getByText('Send Reminder Email')).toBeInTheDocument();
      });

      // Should show template customization panel
      expect(screen.getByText('Template Customizations')).toBeInTheDocument();
      expect(screen.getByText('AI Suggestions')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // CROSS-STORY INTEGRATION TESTS
  // ========================================================================
  
  describe('Cross-Story Integration: Debugging Templates', () => {
    
    it('debugs workflow created from smart template', async () => {
      const templateWorkflow = {
        ...mockWorkflow,
        template_id: 'ecom-abandoned-cart',
        name: 'Abandoned Cart Recovery',
        nodes: mockTemplateRecommendation.workflow.nodes
      };

      const templateExecution = {
        ...mockExecutionData,
        workflow_id: templateWorkflow.id,
        template_context: {
          template_id: 'ecom-abandoned-cart',
          customizations: mockTemplateRecommendation.customizations
        }
      };

      mockApiClient.get
        .mockResolvedValueOnce({ data: templateWorkflow })
        .mockResolvedValueOnce({ data: templateExecution });

      render(
        <WorkflowDebuggingPanel 
          workflow={templateWorkflow}
          isDebugging={true}
        />
      );

      // Should show template context in debugging panel
      expect(screen.getByText('Template: Abandoned Cart Recovery')).toBeInTheDocument();
      
      // Execute template workflow
      fireEvent.click(screen.getByText('Execute Workflow'));

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith(
          `/api/v1/workflows/${templateWorkflow.id}/execute`,
          expect.objectContaining({
            template_context: true
          })
        );
      });

      // Should show template-specific debugging information
      expect(screen.getByText('Template Customizations')).toBeInTheDocument();
      expect(screen.getByText('AI-Applied Changes')).toBeInTheDocument();
    });

    it('provides template performance insights during debugging', async () => {
      const templateExecutionWithInsights = {
        ...mockExecutionData,
        template_insights: {
          template_id: 'ecom-abandoned-cart',
          performance_vs_benchmark: {
            conversion_rate: { actual: 12.8, benchmark: 8.5, improvement: 50.6 },
            execution_time: { actual: 2.3, benchmark: 3.1, improvement: 25.8 }
          },
          ai_optimization_score: 94,
          customization_effectiveness: 89
        }
      };

      mockApiClient.get.mockResolvedValueOnce({ data: templateExecutionWithInsights });

      render(
        <WorkflowDebuggingPanel 
          workflow={mockWorkflow}
          isDebugging={true}
        />
      );

      // Switch to performance insights tab
      fireEvent.click(screen.getByText('Performance Insights'));

      await waitFor(() => {
        expect(screen.getByText('Template Performance')).toBeInTheDocument();
        expect(screen.getByText('50.6% above benchmark')).toBeInTheDocument();
        expect(screen.getByText('AI Optimization Score: 94%')).toBeInTheDocument();
      });
    });

    it('suggests template improvements based on debugging data', async () => {
      const executionWithSuggestions = {
        ...mockExecutionData,
        ai_suggestions: [
          {
            type: 'optimization',
            node_id: 'email-reminder',
            suggestion: 'Consider adding personalization based on customer purchase history',
            confidence: 87,
            potential_improvement: '15% increase in click-through rate'
          },
          {
            type: 'integration',
            suggestion: 'Add SMS follow-up for higher engagement',
            confidence: 92,
            potential_improvement: '23% increase in recovery rate'
          }
        ]
      };

      mockApiClient.get.mockResolvedValueOnce({ data: executionWithSuggestions });

      render(
        <WorkflowDebuggingPanel 
          workflow={mockWorkflow}
          isDebugging={true}
        />
      );

      // Should show AI suggestions panel
      expect(screen.getByText('AI Improvement Suggestions')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Consider adding personalization')).toBeInTheDocument();
        expect(screen.getByText('87% confidence')).toBeInTheDocument();
        expect(screen.getByText('15% increase in click-through rate')).toBeInTheDocument();
      });

      // Apply suggestion
      fireEvent.click(screen.getByText('Apply Suggestion'));

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/workflows/1/apply-suggestion',
          expect.objectContaining({
            suggestion_id: expect.any(String),
            node_id: 'email-reminder'
          })
        );
      });
    });
  });

  // ========================================================================
  // ERROR HANDLING AND EDGE CASES
  // ========================================================================
  
  describe('Error Handling and Edge Cases', () => {
    
    it('handles API failures gracefully', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));
      mockApiClient.post.mockRejectedValue(new Error('Server error'));

      render(<SmartTemplateRecommendations />);

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText('Failed to load recommendations')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      // Test retry functionality
      fireEvent.click(screen.getByText('Retry'));

      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
    });

    it('handles WebSocket connection failures in debugging', async () => {
      // Mock WebSocket connection failure
      (global as any).WebSocket = jest.fn(() => ({
        ...mockWebSocket,
        readyState: WebSocket.CLOSED,
        addEventListener: jest.fn((event, callback) => {
          if (event === 'error') {
            setTimeout(() => callback(new Error('Connection failed')), 100);
          }
        })
      }));

      render(
        <WorkflowDebuggingPanel 
          workflow={mockWorkflow}
          isDebugging={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Real-time connection failed')).toBeInTheDocument();
        expect(screen.getByText('Retry Connection')).toBeInTheDocument();
      });
    });

    it('handles incomplete template data', async () => {
      const incompleteTemplate = {
        template_id: 'incomplete',
        name: 'Incomplete Template',
        relevanceScore: 75
        // Missing other required fields
      };

      mockApiClient.get.mockResolvedValueOnce({ data: [incompleteTemplate] });

      render(<SmartTemplateSelector />);

      await waitFor(() => {
        expect(screen.getByText('Incomplete Template')).toBeInTheDocument();
        expect(screen.getByText('75%')).toBeInTheDocument();
        expect(screen.getByText('Data incomplete')).toBeInTheDocument();
      });
    });

    it('provides fallback when AI services are unavailable', async () => {
      mockApiClient.post.mockRejectedValueOnce({ 
        response: { status: 503, data: { error: 'AI service unavailable' } }
      });

      render(<SmartTemplateRecommendations />);

      fireEvent.click(screen.getByText('Analyze My Business'));

      await waitFor(() => {
        expect(screen.getByText('AI analysis unavailable')).toBeInTheDocument();
        expect(screen.getByText('Browse all templates')).toBeInTheDocument();
      });

      // Should fallback to manual template browsing
      fireEvent.click(screen.getByText('Browse all templates'));
      
      expect(screen.getByText('Template Categories')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // PERFORMANCE TESTS
  // ========================================================================
  
  describe('Performance Tests', () => {
    
    it('handles large workflow executions efficiently', async () => {
      const largeExecution = {
        ...mockExecutionData,
        total_steps: 50,
        steps: Array.from({ length: 50 }, (_, i) => ({
          id: `step-${i}`,
          node_id: `node-${i}`,
          status: i < 30 ? 'success' : i < 45 ? 'running' : 'pending',
          execution_time_ms: Math.random() * 5000
        }))
      };

      mockApiClient.get.mockResolvedValueOnce({ data: largeExecution });

      const startTime = performance.now();
      
      render(
        <WorkflowDebuggingPanel 
          workflow={mockWorkflow}
          isDebugging={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('50 steps')).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;
      
      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);
    });

    it('optimizes template list rendering with virtual scrolling', async () => {
      const manyTemplates = Array.from({ length: 100 }, (_, i) => ({
        ...mockTemplateRecommendation,
        template_id: `template-${i}`,
        name: `Template ${i}`,
        relevanceScore: 100 - i
      }));

      mockApiClient.get.mockResolvedValueOnce({ data: manyTemplates });

      render(<SmartTemplateSelector />);

      await waitFor(() => {
        // Should use virtual scrolling for performance
        expect(screen.getByTestId('virtual-scroll-container')).toBeInTheDocument();
        
        // Should only render visible items
        const renderedCards = screen.getAllByTestId(/template-card-/);
        expect(renderedCards.length).toBeLessThanOrEqual(20); // Only visible items
      });
    });
  });
});