/**
 * Webhook Node Component
 * Sends HTTP requests to external services
 */

'use client';

import React from 'react';
import { BaseNode } from './BaseNode';
import { WorkflowNodeData } from '@/types/workflow';
import { Webhook, Globe, Lock, Key, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WebhookNodeProps {
  data: WorkflowNodeData & {
    webhookConfig: {
      url: string;
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      headers?: Record<string, string>;
      body?: any;
      authentication?: {
        type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2';
        credentials?: Record<string, string>;
      };
      timeout?: number; // seconds
      retryPolicy?: {
        enabled: boolean;
        maxRetries: number;
        backoffStrategy: 'linear' | 'exponential';
        initialDelay: number;
      };
      responseHandling?: {
        expectedStatus?: number[];
        parseJson?: boolean;
        extractFields?: Record<string, string>;
      };
    };
  };
  selected?: boolean;
}

export const WebhookNode: React.FC<WebhookNodeProps> = ({ data, selected }) => {
  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'bg-green-100 text-green-600',
      POST: 'bg-blue-100 text-blue-600',
      PUT: 'bg-orange-100 text-orange-600',
      PATCH: 'bg-yellow-100 text-yellow-600',
      DELETE: 'bg-red-100 text-red-600'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const getAuthIcon = (authType?: string) => {
    switch (authType) {
      case 'basic':
      case 'bearer':
        return Lock;
      case 'api_key':
        return Key;
      case 'oauth2':
        return Database;
      default:
        return Globe;
    }
  };

  const AuthIcon = getAuthIcon(data.webhookConfig.authentication?.type);

  const renderWebhookDetails = () => {
    const { webhookConfig } = data;

    return (
      <div className="space-y-2">
        {/* HTTP Method */}
        <Badge className={`text-xs ${getMethodColor(webhookConfig.method)}`}>
          {webhookConfig.method}
        </Badge>

        {/* URL */}
        <div className="text-xs text-gray-600 truncate">
          {webhookConfig.url}
        </div>

        {/* Authentication */}
        {webhookConfig.authentication && webhookConfig.authentication.type !== 'none' && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <AuthIcon className="w-3 h-3" />
            <span>{webhookConfig.authentication.type.replace('_', ' ')}</span>
          </div>
        )}

        {/* Headers count */}
        {webhookConfig.headers && Object.keys(webhookConfig.headers).length > 0 && (
          <div className="text-xs text-gray-500">
            {Object.keys(webhookConfig.headers).length} header(s)
          </div>
        )}

        {/* Timeout */}
        {webhookConfig.timeout && (
          <div className="text-xs text-gray-500">
            Timeout: {webhookConfig.timeout}s
          </div>
        )}

        {/* Retry Policy */}
        {webhookConfig.retryPolicy?.enabled && (
          <div className="text-xs text-gray-500">
            Retries: {webhookConfig.retryPolicy.maxRetries}
          </div>
        )}

        {/* Response Status */}
        {data.status === 'success' && data.lastExecuted && (
          <div className="text-xs text-green-600">
            Last response: 200 OK
          </div>
        )}

        {data.status === 'error' && data.errorMessage && (
          <div className="text-xs text-red-600 truncate">
            {data.errorMessage}
          </div>
        )}
      </div>
    );
  };

  return (
    <BaseNode
      data={{
        ...data,
        label: data.label || 'Webhook Request'
      }}
      type="webhook"
      selected={selected}
      icon={Webhook}
      color="indigo"
      hasInput={true}
      hasOutput={true}
    >
      {renderWebhookDetails()}
    </BaseNode>
  );
};