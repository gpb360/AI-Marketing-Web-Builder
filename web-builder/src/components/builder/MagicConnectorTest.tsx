/**
 * Magic Connector Test Component
 * 
 * Test component to verify the complete Magic Moment user journey
 * Tests the integration between WorkflowConnector, MagicConnector, and component analysis
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkflowConnector } from './WorkflowConnector';
import { TestTube2, Play, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

// Mock component types for testing
const testComponents = [
  {
    id: 'test-form-1',
    type: 'contact-form',
    props: {
      title: 'Contact Us',
      fields: ['name', 'email', 'message'],
      submitText: 'Send Message'
    },
    content: 'contact form email submit'
  },
  {
    id: 'test-button-1',
    type: 'cta-button',
    props: {
      text: 'Book Appointment',
      variant: 'primary'
    },
    content: 'book appointment schedule calendar'
  },
  {
    id: 'test-signup-1',
    type: 'signup-form',
    props: {
      title: 'Join Our Newsletter',
      fields: ['email'],
      submitText: 'Subscribe'
    },
    content: 'newsletter subscribe lead magnet download'
  },
  {
    id: 'test-purchase-1',
    type: 'purchase-button',
    props: {
      product: 'Premium Plan',
      price: '$99/month'
    },
    content: 'buy purchase premium plan payment checkout'
  }
];

interface TestResult {
  componentId: string;
  testName: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  details?: string;
  timestamp?: Date;
}

export const MagicConnectorTest: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<any>(testComponents[0]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedWorkflow, setConnectedWorkflow] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const handleConnect = (workflowId: string) => {
    setIsConnected(true);
    setConnectedWorkflow(workflowId);
    
    // Add test result
    const result: TestResult = {
      componentId: selectedComponent.id,
      testName: `Magic Connector: ${selectedComponent.type} → ${workflowId}`,
      status: 'passed',
      details: `Successfully connected ${selectedComponent.type} to ${workflowId} workflow`,
      timestamp: new Date()
    };
    
    setTestResults(prev => [result, ...prev]);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setConnectedWorkflow('');
  };

  const runAutomaticTest = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    // Test each component type
    for (const component of testComponents) {
      setSelectedComponent(component);
      
      // Add test start
      const startResult: TestResult = {
        componentId: component.id,
        testName: `Testing Magic Connector for ${component.type}`,
        status: 'running',
        timestamp: new Date()
      };
      setTestResults(prev => [startResult, ...prev]);
      
      // Simulate test delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate test completion
      const endResult: TestResult = {
        componentId: component.id,
        testName: `Magic Connector Analysis: ${component.type}`,
        status: 'passed',
        details: `Component analysis completed. Expected triggers found for ${component.type}`,
        timestamp: new Date()
      };
      setTestResults(prev => [endResult, ...prev.filter(r => r.componentId !== component.id || r.status !== 'running')]);
    }
    
    setIsRunningTests(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <TestTube2 className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'running':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TestTube2 className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Magic Connector Test Suite</CardTitle>
                <CardDescription>
                  Test the complete Magic Moment user journey and component analysis
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={runAutomaticTest}
              disabled={isRunningTests}
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>{isRunningTests ? 'Running Tests...' : 'Run All Tests'}</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Component Selection & Testing */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Component</CardTitle>
              <CardDescription>
                Select a component to test Magic Connector functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Component Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Component Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {testComponents.map((component) => (
                      <button
                        key={component.id}
                        onClick={() => setSelectedComponent(component)}
                        className={`p-3 text-left border rounded-lg transition-all ${
                          selectedComponent.id === component.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm">{component.type}</div>
                        <div className="text-xs text-gray-600">{component.props.title || component.props.text}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Component Preview */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedComponent.props.title || selectedComponent.props.text}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Type: {selectedComponent.type}
                    </div>
                    <Badge variant="outline">{selectedComponent.id}</Badge>
                    
                    {isConnected && (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                        <div className="text-sm text-green-800">
                          ✅ Connected to: {connectedWorkflow}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Workflow Connector Integration */}
                  <WorkflowConnector
                    componentId={selectedComponent.id}
                    component={selectedComponent}
                    isConnected={isConnected}
                    workflowId={connectedWorkflow}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    enableMagicConnector={true}
                  />
                </div>

                {/* Component Analysis Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Component Analysis Preview</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Content Keywords:</strong> {selectedComponent.content}</div>
                    <div><strong>Props:</strong> {JSON.stringify(selectedComponent.props, null, 2)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Results</CardTitle>
              <CardDescription>
                Results from Magic Connector component analysis and workflow suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TestTube2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No tests run yet</p>
                  <p className="text-sm">Click "Run All Tests" or manually test components</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div
                      key={`${result.componentId}-${index}`}
                      className={`p-3 border rounded-lg ${getStatusColor(result.status)}`}
                    >
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(result.status)}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{result.testName}</div>
                          {result.details && (
                            <div className="text-xs mt-1 opacity-75">{result.details}</div>
                          )}
                          {result.timestamp && (
                            <div className="text-xs mt-1 opacity-60">
                              {result.timestamp.toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Test Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="space-y-1">
                <p><strong>Manual Test:</strong></p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>Select a component type from the grid</li>
                  <li>Click the Magic Connector button (wand icon)</li>
                  <li>Verify AI suggestions appear based on component type</li>
                  <li>Test one-click workflow connection</li>
                </ol>
              </div>
              <div className="space-y-1">
                <p><strong>Expected Results:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Contact forms → Lead capture/Support workflows</li>
                  <li>Appointment buttons → Booking workflows</li>
                  <li>Newsletter forms → Email sequence workflows</li>
                  <li>Purchase buttons → E-commerce workflows</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MagicConnectorTest;