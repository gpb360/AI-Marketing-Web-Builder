'use client';

import React from 'react';
import { ComponentData } from '@/types/builder';
import { WorkflowConnector } from './WorkflowConnector';
import { cn } from '@/lib/utils';

interface ComponentTypeHandlerProps {
  component: ComponentData;
  isSelected: boolean;
  children: React.ReactNode;
  onWorkflowConnect: (workflowId: string) => void;
  onWorkflowDisconnect: () => void;
}

// Define which component types can connect to workflows
const WORKFLOW_COMPATIBLE_TYPES = [
  'form',
  'contact-form', 
  'button',
  'cta-button',
  'newsletter-signup',
  'booking-form',
  'survey',
  'quiz',
  'calculator',
  'chat-widget'
] as const;

type WorkflowCompatibleType = typeof WORKFLOW_COMPATIBLE_TYPES[number];

function isWorkflowCompatible(type: string): type is WorkflowCompatibleType {
  return WORKFLOW_COMPATIBLE_TYPES.includes(type as WorkflowCompatibleType);
}

export function ComponentTypeHandler({
  component,
  isSelected,
  children,
  onWorkflowConnect,
  onWorkflowDisconnect,
}: ComponentTypeHandlerProps) {
  const canConnectToWorkflow = isWorkflowCompatible(component.type);
  const isConnected = component.isConnectedToWorkflow || false;

  return (
    <div className="relative">
      {children}
      
      {/* Only show workflow features for compatible component types */}
      {canConnectToWorkflow && isSelected && (
        <>
          {/* Connection Status Indicator */}
          {isConnected && (
            <div 
              className={cn(
                "absolute -bottom-2 -right-2 w-5 h-5 rounded-full",
                "bg-emerald-500 text-white flex items-center justify-center",
                "shadow-sm animate-pulse"
              )}
              title="Connected to workflow"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          {/* Workflow Connector */}
          <WorkflowConnector
            componentId={component.id}
            isConnected={isConnected}
            workflowId={component.workflowId}
            onConnect={onWorkflowConnect}
            onDisconnect={onWorkflowDisconnect}
          />
        </>
      )}

      {/* Component Type Badge for Development/Debug */}
      {process.env.NODE_ENV === 'development' && isSelected && (
        <div className="absolute -top-4 right-0 bg-gray-700 text-white text-xs px-2 py-1 rounded-full">
          {component.type}
          {canConnectToWorkflow && (
            <span className="ml-1 text-emerald-300">🔗</span>
          )}
        </div>
      )}
    </div>
  );
}

// Helper component for showing workflow suggestions
export function WorkflowSuggestions({ componentType }: { componentType: string }) {
  const suggestions = getWorkflowSuggestions(componentType);

  if (!suggestions.length) return null;

  return (
    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="text-sm font-medium text-blue-800 mb-2">
        💡 Suggested Workflows
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <div 
            key={index}
            className="flex items-start space-x-2 text-xs text-blue-700"
          >
            <span className="flex-shrink-0 w-1 h-1 bg-blue-400 rounded-full mt-1.5" />
            <span>{suggestion}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Get workflow suggestions based on component type
function getWorkflowSuggestions(componentType: string): string[] {
  const suggestions: Record<string, string[]> = {
    'form': [
      'Capture leads and add to CRM',
      'Send confirmation email',
      'Notify team via Slack/email'
    ],
    'contact-form': [
      'Route inquiries to appropriate team',
      'Create support ticket',
      'Schedule follow-up reminder'
    ],
    'button': [
      'Track button clicks',
      'Trigger popup or modal', 
      'Redirect to landing page'
    ],
    'cta-button': [
      'Start email sequence',
      'Add to marketing campaign',
      'Schedule demo/consultation'
    ],
    'newsletter-signup': [
      'Add to email list',
      'Send welcome series',
      'Tag based on interests'
    ],
    'booking-form': [
      'Create calendar event',
      'Send confirmation email',
      'Set up reminder notifications'
    ],
    'survey': [
      'Collect responses in database',
      'Generate analytics report',
      'Trigger actions based on answers'
    ],
    'quiz': [
      'Calculate and display results',
      'Segment users by score',
      'Offer personalized recommendations'
    ],
    'calculator': [
      'Save calculation results',
      'Generate PDF quote/report',
      'Follow up with sales team'
    ],
    'chat-widget': [
      'Route to live agent',
      'Create support ticket',
      'Qualify lead automatically'
    ]
  };

  return suggestions[componentType] || [];
}

// Export the workflow compatibility checker for use elsewhere
export { isWorkflowCompatible, WORKFLOW_COMPATIBLE_TYPES };