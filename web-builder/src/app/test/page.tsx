'use client';

import { useState } from 'react';

export default function TestPage() {
  const [count, setCount] = useState(0);
  const [importTest, setImportTest] = useState<string>('Not tested');

  const testImports = async () => {
    try {
      // Test basic imports
      const { useBuilderStore } = await import('@/store/builderStore');
      const canvasModule = await import('@/components/builder/CanvasComponent');
      
      setImportTest('All imports successful');
    } catch (error) {
      setImportTest(`Import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Test Page - Debugging</h1>
        
        {/* Basic React Test */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-semibold mb-4">React State Test</h2>
          <p className="mb-4">Count: {count}</p>
          <button 
            onClick={() => setCount(c => c + 1)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Increment
          </button>
        </div>

        {/* Import Test */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-semibold mb-4">Import Test</h2>
          <p className="mb-4">Status: {importTest}</p>
          <button 
            onClick={testImports}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Imports
          </button>
        </div>

        {/* Environment Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Environment Info</h2>
          <div className="space-y-2">
            <p><strong>Node Env:</strong> {process.env.NODE_ENV}</p>
            <p><strong>Next.js Version:</strong> 15.3.5</p>
            <p><strong>React Version:</strong> {require('react').version}</p>
            <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}