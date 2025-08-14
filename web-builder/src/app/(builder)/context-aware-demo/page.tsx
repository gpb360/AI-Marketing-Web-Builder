/**
 * Context-Aware Template Builder Demo Page
 * 
 * Demonstrates the complete integration of all Story 1.3 components
 * Part of Story 1.3: Frontend Context-Aware Template Integration
 */

'use client';

import React from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import ContextAwareBuilder from '@/components/builder/ContextAwareBuilder';
import { CustomizedTemplate } from '@/types/context-aware-templates';

export default function ContextAwareDemoPage() {
  const handleTemplateComplete = (customizedTemplate: CustomizedTemplate) => {
    console.log('Template completed:', customizedTemplate);
    
    // In a real app, this would:
    // 1. Save the template to the database
    // 2. Redirect to the project editor
    // 3. Show success notification
    
    alert(`Template "${customizedTemplate.name}" has been created successfully!`);
  };

  const handleStepChange = (step: number, data?: any) => {
    console.log(`Step changed to ${step}`, data);
    
    // Track analytics or save progress
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  AI Template Builder
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Context-aware template recommendations
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                AI Services Online
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary
          enableRetry={true}
          showErrorDetails={process.env.NODE_ENV === 'development'}
          fallbackMessage="We're having trouble loading the template builder. Please try refreshing the page."
        >
          <ContextAwareBuilder
            onTemplateComplete={handleTemplateComplete}
            onStepChange={handleStepChange}
            enablePreview={true}
            showProgress={true}
            className="w-full"
          />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Story 1.3: Frontend Context-Aware Template Integration Demo
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>✅ Business Analysis</span>
              <span>✅ Template Selection</span>
              <span>✅ AI Recommendations</span>
              <span>✅ Personalization</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}