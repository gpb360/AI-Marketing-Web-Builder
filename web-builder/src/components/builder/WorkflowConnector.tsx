'use client';

import React, { useState } from 'react';
import { Zap, Link, Unlink, Settings, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowConnectorProps {
  componentId: string;
  isConnected: boolean;
  workflowId?: string;
  onConnect: (workflowId: string) => void;
  onDisconnect: () => void;
}

// Mock workflow data - replace with actual API call
const availableWorkflows = [
  {
    id: 'lead-capture',
    name: 'Lead Capture',
    description: 'Capture and qualify leads automatically',
    category: 'Marketing',
    triggers: ['form-submit', 'button-click'],
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'Route customer inquiries to the right team',
    category: 'Support',
    triggers: ['chat-message', 'contact-form'],
  },
  {
    id: 'email-sequence',
    name: 'Email Sequence',
    description: 'Automated email marketing campaigns',
    category: 'Marketing',
    triggers: ['form-submit', 'button-click'],
  },
  {
    id: 'appointment-booking',
    name: 'Appointment Booking',
    description: 'Schedule appointments automatically',
    category: 'Sales',
    triggers: ['button-click', 'calendar-widget'],
  },
  {
    id: 'order-processing',
    name: 'Order Processing',
    description: 'Process orders and send confirmations',
    category: 'E-commerce',
    triggers: ['form-submit', 'payment-complete'],
  },
];

export function WorkflowConnector({
  isConnected,
  workflowId,
  onConnect,
  onDisconnect,
}: WorkflowConnectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');

  const connectedWorkflow = workflowId 
    ? availableWorkflows.find(w => w.id === workflowId)
    : null;

  const handleConnect = () => {
    if (selectedWorkflow) {
      onConnect(selectedWorkflow);
      setIsOpen(false);
      setSelectedWorkflow('');
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "absolute -bottom-7 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex items-center space-x-1 shadow-sm border",
          isConnected
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-blue-300"
        )}
        title={isConnected ? 'Workflow connected' : 'Connect to workflow'}
      >
        <Zap className="w-3 h-3" />
        <span className="hidden group-hover:inline">
          {isConnected ? 'Connected' : 'Connect'}
        </span>
      </button>
    );
  }

  return (
    <div className="absolute -bottom-40 left-1/2 transform -translate-x-1/2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-900">
              Workflow Connection
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        {connectedWorkflow && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-green-800">
                  {connectedWorkflow.name}
                </div>
                <div className="text-xs text-green-600">
                  {connectedWorkflow.description}
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="p-1 text-green-600 hover:text-green-800"
                title="Disconnect workflow"
              >
                <Unlink className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Workflow Selection */}
      {!isConnected && (
        <div className="p-4">
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Choose Workflow
            </label>
            <div className="relative">
              <select
                value={selectedWorkflow}
                onChange={(e) => setSelectedWorkflow(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Select a workflow...</option>
                {availableWorkflows.map((workflow) => (
                  <option key={workflow.id} value={workflow.id}>
                    {workflow.name} - {workflow.category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {selectedWorkflow && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              {(() => {
                const workflow = availableWorkflows.find(w => w.id === selectedWorkflow);
                return workflow ? (
                  <div>
                    <div className="text-sm font-medium text-blue-800 mb-1">
                      {workflow.name}
                    </div>
                    <div className="text-xs text-blue-600 mb-2">
                      {workflow.description}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {workflow.triggers.map((trigger) => (
                        <span
                          key={trigger}
                          className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={handleConnect}
              disabled={!selectedWorkflow}
              className={cn(
                "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                selectedWorkflow
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              <Link className="w-4 h-4 inline mr-1" />
              Connect
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Connected Workflow Actions */}
      {isConnected && connectedWorkflow && (
        <div className="p-4">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                // Open workflow settings
                console.log('Open workflow settings for:', workflowId);
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <Settings className="w-4 h-4 inline mr-1" />
              Settings
            </button>
            <button
              onClick={handleDisconnect}
              className="px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors duration-200"
            >
              <Unlink className="w-4 h-4 inline mr-1" />
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="px-4 pb-4">
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          💡 <strong>Magic Connector:</strong> Connect your components to smart workflows 
          for automated lead capture, customer support, and more.
        </div>
      </div>
    </div>
  );
}