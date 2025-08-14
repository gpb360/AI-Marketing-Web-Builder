/**
 * Story 3.1: Visual Workflow Debugging - E2E Test Suite
 * 
 * End-to-end tests for complete workflow debugging user journey
 * 
 * @author Test Writer Fixer Agent - Story 3.1 E2E Tests
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Story 3.1: Visual Workflow Debugging E2E', () => {
  
  // ========================================================================
  // TEST SETUP
  // ========================================================================
  
  test.beforeEach(async ({ page }) => {
    // Navigate to workflow builder
    await page.goto('/builder');
    
    // Mock API responses for consistent testing
    await page.route('**/api/v1/workflows/*', async route => {
      const url = route.request().url();
      
      if (url.includes('/execute')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            execution_id: 123,
            status: 'running',
            message: 'Workflow execution started'
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            name: 'Test E2E Workflow',
            nodes: [
              {
                id: 'trigger-1',
                type: 'trigger',
                name: 'Form Submission',
                position: { x: 100, y: 100 }
              },
              {
                id: 'action-1',
                type: 'action', 
                name: 'Send Email',
                position: { x: 300, y: 100 }
              },
              {
                id: 'condition-1',
                type: 'condition',
                name: 'Check Response',
                position: { x: 500, y: 100 }
              }
            ],
            edges: [
              { id: 'e1', source: 'trigger-1', target: 'action-1' },
              { id: 'e2', source: 'action-1', target: 'condition-1' }
            ]
          })
        });
      }
    });

    // Mock WebSocket for real-time updates
    await page.addInitScript(() => {
      class MockWebSocket {
        constructor(url: string) {
          this.url = url;
          this.readyState = WebSocket.CONNECTING;
          setTimeout(() => {
            this.readyState = WebSocket.OPEN;
            if (this.onopen) this.onopen({} as Event);
          }, 100);
        }
        
        send(data: string) {
          // Simulate receiving status updates
          setTimeout(() => {
            if (this.onmessage) {
              this.onmessage({
                data: JSON.stringify({
                  type: 'node_status_update',
                  node_id: 'action-1',
                  status: 'running',
                  progress: 75
                })
              } as MessageEvent);
            }
          }, 500);
        }
        
        close() {
          this.readyState = WebSocket.CLOSED;
        }
        
        addEventListener(event: string, callback: Function) {
          if (event === 'open') this.onopen = callback;
          if (event === 'message') this.onmessage = callback;
          if (event === 'error') this.onerror = callback;
          if (event === 'close') this.onclose = callback;
        }
        
        removeEventListener() {}
        
        url: string;
        readyState: number;
        onopen?: Function;
        onmessage?: Function;
        onerror?: Function;
        onclose?: Function;
      }
      
      (window as any).WebSocket = MockWebSocket;
    });
  });

  // ========================================================================
  // WORKFLOW CANVAS DEBUGGING TESTS (AC: 1)
  // ========================================================================
  
  test('displays workflow with visual debugging indicators', async ({ page }) => {
    // Load workflow in builder
    await page.getByTestId('workflow-canvas').waitFor();
    
    // Should show workflow nodes
    await expect(page.getByText('Form Submission')).toBeVisible();
    await expect(page.getByText('Send Email')).toBeVisible();
    await expect(page.getByText('Check Response')).toBeVisible();

    // Should not show debugging indicators initially
    await expect(page.getByTestId('node-status-trigger-1')).not.toBeVisible();

    // Enable debugging mode
    await page.getByRole('button', { name: 'Enable Debugging' }).click();
    
    // Should show debugging panel
    await expect(page.getByText('Workflow Debugging')).toBeVisible();
    
    // Should show status indicators on nodes
    await expect(page.getByTestId('node-status-trigger-1')).toBeVisible();
    await expect(page.getByTestId('node-status-action-1')).toBeVisible();
    await expect(page.getByTestId('node-status-condition-1')).toBeVisible();
  });

  test('executes workflow and shows real-time status updates', async ({ page }) => {
    // Enable debugging mode
    await page.getByRole('button', { name: 'Enable Debugging' }).click();
    
    // Execute workflow
    await page.getByRole('button', { name: 'Execute Workflow' }).click();
    
    // Should show execution started message
    await expect(page.getByText('Workflow execution started')).toBeVisible();
    
    // Should show running status on trigger node
    await expect(page.getByTestId('node-trigger-1')).toHaveClass(/status-running/);
    
    // Wait for WebSocket status update
    await page.waitForFunction(() => {
      const actionNode = document.querySelector('[data-testid="node-action-1"]');
      return actionNode?.classList.contains('status-running');
    }, { timeout: 10000 });
    
    // Should show progress indicator
    await expect(page.getByTestId('progress-action-1')).toBeVisible();
    await expect(page.getByText('75%')).toBeVisible();
  });

  test('displays execution timeline with step details', async ({ page }) => {
    await page.getByRole('button', { name: 'Enable Debugging' }).click();
    await page.getByRole('button', { name: 'Execute Workflow' }).click();
    
    // Switch to timeline view
    await page.getByRole('tab', { name: 'Execution Timeline' }).click();
    
    // Should show timeline container
    await expect(page.getByTestId('execution-timeline')).toBeVisible();
    
    // Should show step entries
    await expect(page.getByText('Step 1: Form Submission')).toBeVisible();
    await expect(page.getByText('Step 2: Send Email')).toBeVisible();
    
    // Should show execution metrics
    await expect(page.getByText('Execution Time:')).toBeVisible();
    await expect(page.getByText('Status:')).toBeVisible();
    
    // Click on a step to see details
    await page.getByText('Step 2: Send Email').click();
    
    // Should show step details panel
    await expect(page.getByTestId('step-details-panel')).toBeVisible();
    await expect(page.getByText('Input Data')).toBeVisible();
    await expect(page.getByText('Output Data')).toBeVisible();
  });

  // ========================================================================
  // ERROR HANDLING TESTS (AC: 3)
  // ========================================================================
  
  test('handles node errors and shows error details', async ({ page }) => {
    // Mock error response
    await page.route('**/api/v1/workflows/*/execute', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          execution_id: 123,
          status: 'failed',
          error: {
            node_id: 'action-1',
            message: 'Email service timeout',
            code: 'TIMEOUT',
            timestamp: '2024-01-15T10:35:00Z'
          }
        })
      });
    });

    await page.getByRole('button', { name: 'Enable Debugging' }).click();
    await page.getByRole('button', { name: 'Execute Workflow' }).click();
    
    // Should show error status on failed node
    await expect(page.getByTestId('node-action-1')).toHaveClass(/status-failed/);
    await expect(page.getByTestId('error-indicator-action-1')).toBeVisible();
    
    // Click on failed node to see error details
    await page.getByTestId('node-action-1').click();
    
    // Should open error details modal
    await expect(page.getByRole('dialog', { name: 'Node Execution Error' })).toBeVisible();
    await expect(page.getByText('Email service timeout')).toBeVisible();
    await expect(page.getByText('Error Code: TIMEOUT')).toBeVisible();
    
    // Should show restart option
    await expect(page.getByRole('button', { name: 'Restart Node' })).toBeVisible();
    
    // Should show error logs tab
    await page.getByRole('tab', { name: 'Logs' }).click();
    await expect(page.getByText('Error Details')).toBeVisible();
  });

  test('restarts failed nodes and continues execution', async ({ page }) => {
    // Mock initial failure then success on retry
    let callCount = 0;
    await page.route('**/api/v1/workflows/*/nodes/*/restart', async route => {
      callCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          node_id: 'action-1',
          status: callCount === 1 ? 'failed' : 'success',
          message: callCount === 1 ? 'Still failing' : 'Restart successful'
        })
      });
    });

    await page.getByRole('button', { name: 'Enable Debugging' }).click();
    
    // Simulate failed node
    await page.addInitScript(() => {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('nodeError', {
          detail: { nodeId: 'action-1', error: 'Timeout error' }
        }));
      }, 1000);
    });
    
    await page.getByRole('button', { name: 'Execute Workflow' }).click();
    
    // Wait for error state
    await expect(page.getByTestId('node-action-1')).toHaveClass(/status-failed/);
    
    // Click failed node and restart
    await page.getByTestId('node-action-1').click();
    await page.getByRole('button', { name: 'Restart Node' }).click();
    
    // Should show restart in progress
    await expect(page.getByText('Restarting node...')).toBeVisible();
    
    // Should eventually show success
    await expect(page.getByTestId('node-action-1')).toHaveClass(/status-running/);
  });

  // ========================================================================
  // PERFORMANCE MONITORING TESTS (AC: 4, 6)
  // ========================================================================
  
  test('displays performance metrics and system resources', async ({ page }) => {
    await page.getByRole('button', { name: 'Enable Debugging' }).click();
    await page.getByRole('button', { name: 'Execute Workflow' }).click();
    
    // Switch to performance metrics view
    await page.getByRole('tab', { name: 'Performance' }).click();
    
    // Should show system resource usage
    await expect(page.getByText('CPU Usage')).toBeVisible();
    await expect(page.getByText('Memory Usage')).toBeVisible();
    await expect(page.getByText('Network I/O')).toBeVisible();
    
    // Should show execution timing
    await expect(page.getByText('Total Execution Time')).toBeVisible();
    await expect(page.getByText('Average Step Time')).toBeVisible();
    
    // Should show performance charts
    await expect(page.getByTestId('cpu-usage-chart')).toBeVisible();
    await expect(page.getByTestId('memory-usage-chart')).toBeVisible();
    
    // Click on a metric for detailed view
    await page.getByText('CPU Usage').click();
    await expect(page.getByTestId('cpu-detail-modal')).toBeVisible();
  });

  test('exports execution data and logs', async ({ page }) => {
    await page.getByRole('button', { name: 'Enable Debugging' }).click();
    await page.getByRole('button', { name: 'Execute Workflow' }).click();
    
    // Wait for execution to complete
    await page.waitForSelector('[data-testid="node-condition-1"].status-success');
    
    // Switch to timeline view for export
    await page.getByRole('tab', { name: 'Execution Timeline' }).click();
    
    // Start download and verify file
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export' }).click();
    await page.getByRole('menuitem', { name: 'Export as JSON' }).click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('workflow-execution');
    expect(download.suggestedFilename()).toContain('.json');
    
    // Test CSV export
    const csvDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export' }).click();
    await page.getByRole('menuitem', { name: 'Export as CSV' }).click();
    
    const csvDownload = await csvDownloadPromise;
    expect(csvDownload.suggestedFilename()).toContain('.csv');
  });

  // ========================================================================
  // FILTERING AND NAVIGATION TESTS (AC: 5)
  // ========================================================================
  
  test('filters execution steps by status and type', async ({ page }) => {
    await page.getByRole('button', { name: 'Enable Debugging' }).click();
    await page.getByRole('button', { name: 'Execute Workflow' }).click();
    
    await page.getByRole('tab', { name: 'Execution Timeline' }).click();
    
    // Should show all steps initially
    await expect(page.getByText('Step 1: Form Submission')).toBeVisible();
    await expect(page.getByText('Step 2: Send Email')).toBeVisible();
    await expect(page.getByText('Step 3: Check Response')).toBeVisible();
    
    // Filter by status
    await page.getByRole('combobox', { name: 'Filter by status' }).click();
    await page.getByRole('option', { name: 'Failed only' }).click();
    
    // Should hide successful steps
    await expect(page.getByText('No failed steps found')).toBeVisible();
    
    // Filter by node type
    await page.getByRole('combobox', { name: 'Filter by type' }).click();
    await page.getByRole('option', { name: 'Actions only' }).click();
    
    // Should show only action nodes
    await expect(page.getByText('Step 2: Send Email')).toBeVisible();
    await expect(page.getByText('Step 1: Form Submission')).not.toBeVisible();
    
    // Clear filters
    await page.getByRole('button', { name: 'Clear Filters' }).click();
    await expect(page.getByText('Step 1: Form Submission')).toBeVisible();
  });

  test('navigates between canvas and timeline views seamlessly', async ({ page }) => {
    await page.getByRole('button', { name: 'Enable Debugging' }).click();
    
    // Start on canvas view
    await expect(page.getByTestId('workflow-canvas')).toBeVisible();
    await expect(page.getByTestId('execution-timeline')).not.toBeVisible();
    
    // Switch to timeline
    await page.getByRole('tab', { name: 'Execution Timeline' }).click();
    await expect(page.getByTestId('execution-timeline')).toBeVisible();
    await expect(page.getByTestId('workflow-canvas')).not.toBeVisible();
    
    // Switch to performance
    await page.getByRole('tab', { name: 'Performance' }).click();
    await expect(page.getByTestId('performance-dashboard')).toBeVisible();
    
    // Switch back to canvas
    await page.getByRole('tab', { name: 'Workflow Canvas' }).click();
    await expect(page.getByTestId('workflow-canvas')).toBeVisible();
    
    // Should maintain debugging state across views
    await expect(page.getByTestId('node-status-trigger-1')).toBeVisible();
  });

  // ========================================================================
  // ACCESSIBILITY TESTS
  // ========================================================================
  
  test('supports keyboard navigation and screen readers', async ({ page }) => {
    await page.getByRole('button', { name: 'Enable Debugging' }).click();
    
    // Tab through debugging controls
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Execute Workflow' })).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('tab', { name: 'Execution Timeline' })).toBeFocused();
    
    // Use keyboard to execute workflow
    await page.keyboard.press('Shift+Tab'); // Back to Execute button
    await page.keyboard.press('Enter');
    
    // Should start execution
    await expect(page.getByText('Workflow execution started')).toBeVisible();
    
    // Tab to failed node and activate with keyboard
    await page.keyboard.press('Tab');
    // Navigate to failed node (assuming one exists)
    await page.keyboard.press('Enter');
    
    // Should open error details with proper focus
    await expect(page.getByRole('dialog')).toHaveFocus();
  });

  // ========================================================================
  // INTEGRATION TESTS
  // ========================================================================
  
  test('integrates debugging with workflow editing', async ({ page }) => {
    await page.getByRole('button', { name: 'Enable Debugging' }).click();
    await page.getByRole('button', { name: 'Execute Workflow' }).click();
    
    // Wait for execution to start
    await expect(page.getByTestId('node-action-1')).toHaveClass(/status-running/);
    
    // Edit workflow while debugging
    await page.getByRole('button', { name: 'Edit Workflow' }).click();
    
    // Should be able to modify nodes
    await page.getByTestId('node-action-1').dblclick();
    await page.getByRole('textbox', { name: 'Node Name' }).fill('Send Welcome Email');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Should maintain debugging state after edit
    await expect(page.getByText('Send Welcome Email')).toBeVisible();
    await expect(page.getByTestId('node-action-1')).toHaveClass(/status-running/);
  });

  test('persists debugging session across page reloads', async ({ page }) => {
    await page.getByRole('button', { name: 'Enable Debugging' }).click();
    await page.getByRole('button', { name: 'Execute Workflow' }).click();
    
    // Wait for execution state
    await expect(page.getByTestId('node-action-1')).toHaveClass(/status-running/);
    
    // Reload page
    await page.reload();
    
    // Should restore debugging state
    await expect(page.getByText('Workflow Debugging')).toBeVisible();
    await expect(page.getByText('Execution in Progress')).toBeVisible();
    
    // Should reconnect to execution
    await expect(page.getByTestId('node-action-1')).toHaveClass(/status-running/);
  });

  // ========================================================================
  // PERFORMANCE TESTS
  // ========================================================================
  
  test('handles large workflows with many nodes efficiently', async ({ page }) => {
    // Mock large workflow
    await page.route('**/api/v1/workflows/*', async route => {
      const largeWorkflow = {
        id: 1,
        name: 'Large Test Workflow',
        nodes: Array.from({ length: 50 }, (_, i) => ({
          id: `node-${i}`,
          type: i % 3 === 0 ? 'trigger' : i % 3 === 1 ? 'action' : 'condition',
          name: `Node ${i}`,
          position: { x: (i % 10) * 150, y: Math.floor(i / 10) * 100 }
        })),
        edges: Array.from({ length: 49 }, (_, i) => ({
          id: `edge-${i}`,
          source: `node-${i}`,
          target: `node-${i + 1}`
        }))
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(largeWorkflow)
      });
    });

    const startTime = Date.now();
    
    await page.getByRole('button', { name: 'Enable Debugging' }).click();
    
    // Should load large workflow within reasonable time
    await expect(page.getByText('Node 49')).toBeVisible({ timeout: 5000 });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    
    // Should handle execution efficiently
    await page.getByRole('button', { name: 'Execute Workflow' }).click();
    await expect(page.getByText('Workflow execution started')).toBeVisible();
    
    // Timeline should use virtual scrolling
    await page.getByRole('tab', { name: 'Execution Timeline' }).click();
    await expect(page.getByTestId('virtual-scroll-container')).toBeVisible();
  });
});