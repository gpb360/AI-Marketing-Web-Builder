/**
 * API Connection Test Utility
 * Use this to test the connection to the FastAPI backend
 */

import { apiClient } from './client';
import { templateService, authService, workflowService, crmService } from './services';

export class APIConnectionTester {
  /**
   * Test basic API connectivity
   */
  static async testConnection(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      const healthCheck = await apiClient.healthCheck();
      return {
        success: true,
        message: 'API connection successful',
        details: healthCheck
      };
    } catch (error: any) {
      return {
        success: false,
        message: `API connection failed: ${error.message}`,
        details: error
      };
    }
  }

  /**
   * Test templates endpoint
   */
  static async testTemplatesEndpoint(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      const templates = await templateService.getTemplates({ limit: 5 });
      return {
        success: true,
        message: `Templates endpoint working. Found ${templates.total} templates.`,
        details: {
          total: templates.total,
          page: templates.page,
          size: templates.size,
          pages: templates.pages,
          templatesCount: templates.items.length
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Templates endpoint failed: ${error.message}`,
        details: error
      };
    }
  }

  /**
   * Test authentication endpoints (without credentials)
   */
  static async testAuthEndpoints(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      // Test if we can reach the auth endpoints
      // This should fail with 401/422 but not with network errors
      await authService.getCurrentUser();
      
      return {
        success: false,
        message: 'Unexpected success - should have failed without auth',
        details: null
      };
    } catch (error: any) {
      // We expect this to fail with 401 (unauthorized) or 422 (validation error)
      if (error.status === 401 || error.status === 422) {
        return {
          success: true,
          message: 'Auth endpoints reachable (expected auth failure)',
          details: { status: error.status, message: error.message }
        };
      } else {
        return {
          success: false,
          message: `Auth endpoint failed unexpectedly: ${error.message}`,
          details: error
        };
      }
    }
  }

  /**
   * Test workflows endpoint
   */
  static async testWorkflowsEndpoint(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      const workflows = await workflowService.getWorkflows({ limit: 5 });
      return {
        success: true,
        message: `Workflows endpoint working. Found ${workflows.total} workflows.`,
        details: {
          total: workflows.total,
          page: workflows.page,
          size: workflows.size,
          pages: workflows.pages,
          workflowsCount: workflows.items.length
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Workflows endpoint failed: ${error.message}`,
        details: error
      };
    }
  }

  /**
   * Test CRM endpoints
   */
  static async testCRMEndpoint(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      const contacts = await crmService.getContacts({ limit: 5 });
      return {
        success: true,
        message: `CRM endpoint working. Found ${contacts.total} contacts.`,
        details: {
          total: contacts.total,
          page: contacts.page,
          size: contacts.size,
          pages: contacts.pages,
          contactsCount: contacts.items.length
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `CRM endpoint failed: ${error.message}`,
        details: error
      };
    }
  }

  /**
   * Run all tests
   */
  static async runAllTests(): Promise<{
    overall: boolean;
    results: Array<{
      test: string;
      success: boolean;
      message: string;
      details?: any;
    }>;
  }> {
    console.log('🚀 Starting API connection tests...');

    const tests = [
      { name: 'Health Check', test: this.testConnection },
      { name: 'Templates Endpoint', test: this.testTemplatesEndpoint },
      { name: 'Auth Endpoints', test: this.testAuthEndpoints },
      { name: 'Workflows Endpoint', test: this.testWorkflowsEndpoint },
      { name: 'CRM Endpoint', test: this.testCRMEndpoint },
    ];

    const results = [];
    let allPassed = true;

    for (const testCase of tests) {
      console.log(`🔄 Running ${testCase.name}...`);
      
      try {
        const result = await testCase.test();
        results.push({
          test: testCase.name,
          success: result.success,
          message: result.message,
          details: result.details
        });

        if (result.success) {
          console.log(`✅ ${testCase.name}: ${result.message}`);
        } else {
          console.log(`❌ ${testCase.name}: ${result.message}`);
          allPassed = false;
        }
      } catch (error: any) {
        const errorMessage = `Unexpected error: ${error.message}`;
        results.push({
          test: testCase.name,
          success: false,
          message: errorMessage,
          details: error
        });
        console.log(`❌ ${testCase.name}: ${errorMessage}`);
        allPassed = false;
      }
    }

    console.log('\n📊 Test Results Summary:');
    console.log(`Overall: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
    
    results.forEach(result => {
      console.log(`${result.success ? '✅' : '❌'} ${result.test}: ${result.message}`);
    });

    return {
      overall: allPassed,
      results
    };
  }
}

// Export a simple function to run tests
export const testAPIConnection = APIConnectionTester.runAllTests.bind(APIConnectionTester);

// Export individual test functions
export const testHealthCheck = APIConnectionTester.testConnection.bind(APIConnectionTester);
export const testTemplates = APIConnectionTester.testTemplatesEndpoint.bind(APIConnectionTester);
export const testAuth = APIConnectionTester.testAuthEndpoints.bind(APIConnectionTester);
export const testWorkflows = APIConnectionTester.testWorkflowsEndpoint.bind(APIConnectionTester);
export const testCRM = APIConnectionTester.testCRMEndpoint.bind(APIConnectionTester);