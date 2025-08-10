'use client';

import { useState, useEffect } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function DebugPage() {
  const [diagnostics, setDiagnostics] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: Record<string, any> = {};
      
      try {
        // Test basic imports
        results.reactVersion = require('react').version;
        results.timestamp = new Date().toISOString();
        results.userAgent = navigator.userAgent;
        results.location = window.location.href;
        
        // Test store import
        try {
          const { useBuilderStore } = await import('@/store/builderStore');
          results.storeImport = 'SUCCESS';
        } catch (error) {
          results.storeImport = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
        
        // Test component imports
        try {
          await import('@/components/builder/CanvasComponent');
          results.canvasComponentImport = 'SUCCESS';
        } catch (error) {
          results.canvasComponentImport = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
        
        try {
          await import('@/components/builder/SimpleResizeHandles');
          results.resizeHandlesImport = 'SUCCESS';
        } catch (error) {
          results.resizeHandlesImport = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
        
        try {
          await import('@/components/builder/EnhancedComponentRenderer');
          results.rendererImport = 'SUCCESS';
        } catch (error) {
          results.rendererImport = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
        
        // Test DnD imports
        try {
          await import('react-dnd');
          results.reactDndImport = 'SUCCESS';
        } catch (error) {
          results.reactDndImport = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
        
        try {
          await import('react-dnd-html5-backend');
          results.dndBackendImport = 'SUCCESS';
        } catch (error) {
          results.dndBackendImport = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
        
        // Test types import
        try {
          await import('@/types/builder');
          results.typesImport = 'SUCCESS';
        } catch (error) {
          results.typesImport = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
        
        // Test utils
        try {
          const { cn } = await import('@/lib/utils');
          results.utilsImport = typeof cn === 'function' ? 'SUCCESS' : 'ERROR: cn not a function';
        } catch (error) {
          results.utilsImport = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
        
      } catch (error) {
        results.generalError = error instanceof Error ? error.message : 'Unknown error';
      }
      
      setDiagnostics(results);
      setIsLoading(false);
    };
    
    runDiagnostics();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Running diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">App Diagnostics</h1>
          
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-semibold mb-4">System Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>React Version:</strong> {diagnostics.reactVersion}
              </div>
              <div>
                <strong>Timestamp:</strong> {diagnostics.timestamp}
              </div>
              <div className="col-span-2">
                <strong>Location:</strong> {diagnostics.location}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-semibold mb-4">Import Tests</h2>
            <div className="space-y-3">
              {Object.entries(diagnostics)
                .filter(([key]) => key.includes('Import'))
                .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      value === 'SUCCESS' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {value}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-semibold mb-4">Route Testing</h2>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Current Route</span>
                  <span className="text-blue-600">/debug</span>
                </div>
                <p className="text-sm text-gray-600">This route is working correctly since you can see this page.</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Builder Route</span>
                  <a href="/builder" className="text-blue-600 hover:underline">/builder</a>
                </div>
                <p className="text-sm text-gray-600">Builder interface with drag-and-drop functionality.</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Test Route</span>
                  <a href="/test" className="text-blue-600 hover:underline">/test</a>
                </div>
                <p className="text-sm text-gray-600">Simple test page that might have routing issues.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Full Diagnostic Data</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(diagnostics, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}