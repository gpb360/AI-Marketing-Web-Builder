/**
 * Email Node Component
 * Sends automated emails within workflows
 */

'use client';

import React from 'react';
import { BaseNode } from './BaseNode';
import { WorkflowNodeData } from '@/types/workflow';
import { Mail, FileText, Users, Personalizations, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EmailNodeProps {
  data: WorkflowNodeData & {
    emailConfig: {
      to: string | string[]; // recipient(s)
      cc?: string | string[];
      bcc?: string | string[];
      subject: string;
      body?: string;
      template?: {
        id: string;
        name: string;
        variables?: Record<string, any>;
      };
      attachments?: Array<{
        name: string;
        url: string;
        type?: string;
      }>;
      scheduling?: {
        sendAt?: Date;
        timezone?: string;
        businessHoursOnly?: boolean;
      };
      tracking?: {
        trackOpens: boolean;
        trackClicks: boolean;
        trackUnsubscribes: boolean;
      };
      personalization?: {
        enabled: boolean;
        fields: Record<string, string>; // field mappings
      };
    };
  };
  selected?: boolean;
}

export const EmailNode: React.FC<EmailNodeProps> = ({ data, selected }) => {
  const getRecipientCount = () => {
    const { to } = data.emailConfig;
    if (Array.isArray(to)) {
      return to.length;
    }
    return to.includes(',') ? to.split(',').length : 1;
  };

  const isTemplate = () => {
    return !!data.emailConfig.template;
  };

  const hasPersonalization = () => {
    return data.emailConfig.personalization?.enabled;
  };

  const hasTracking = () => {
    const tracking = data.emailConfig.tracking;
    return tracking && (tracking.trackOpens || tracking.trackClicks || tracking.trackUnsubscribes);
  };

  const renderEmailDetails = () => {
    const { emailConfig } = data;
    const recipientCount = getRecipientCount();

    return (
      <div className="space-y-2">
        {/* Email Type */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {isTemplate() ? 'Template' : 'Custom'}
          </Badge>
          {hasPersonalization() && (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600">
              Personalized
            </Badge>
          )}
        </div>

        {/* Recipients */}
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Users className="w-3 h-3" />
          <span>
            {recipientCount === 1 ? '1 recipient' : `${recipientCount} recipients`}
          </span>
        </div>

        {/* Subject */}
        <div className="text-xs text-gray-600 truncate">
          Subject: {emailConfig.subject}
        </div>

        {/* Template Info */}
        {emailConfig.template && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <FileText className="w-3 h-3" />
            <span>{emailConfig.template.name}</span>
          </div>
        )}

        {/* Personalization */}
        {hasPersonalization() && emailConfig.personalization && (
          <div className="flex items-center gap-1 text-xs text-purple-600">
            <Personalizations className="w-3 h-3" />
            <span>{Object.keys(emailConfig.personalization.fields).length} field(s)</span>
          </div>
        )}

        {/* Attachments */}
        {emailConfig.attachments && emailConfig.attachments.length > 0 && (
          <div className="text-xs text-gray-500">
            {emailConfig.attachments.length} attachment(s)
          </div>
        )}

        {/* Scheduling */}
        {emailConfig.scheduling?.sendAt && (
          <div className="text-xs text-gray-500">
            Scheduled: {emailConfig.scheduling.sendAt.toLocaleString()}
          </div>
        )}

        {/* Tracking */}
        {hasTracking() && (
          <div className="flex flex-wrap gap-1">
            {emailConfig.tracking?.trackOpens && (
              <span className="text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded">
                Track opens
              </span>
            )}
            {emailConfig.tracking?.trackClicks && (
              <span className="text-xs bg-green-100 text-green-600 px-1 py-0.5 rounded">
                Track clicks
              </span>
            )}
          </div>
        )}

        {/* Status Info */}
        {data.status === 'success' && data.lastExecuted && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Send className="w-3 h-3" />
            <span>Sent successfully</span>
          </div>
        )}

        {data.status === 'error' && data.errorMessage && (
          <div className="text-xs text-red-600 truncate">
            Error: {data.errorMessage}
          </div>
        )}
      </div>
    );
  };

  return (
    <BaseNode
      data={{
        ...data,
        label: data.label || 'Send Email'
      }}
      type="email"
      selected={selected}
      icon={Mail}
      color="red"
      hasInput={true}
      hasOutput={true}
    >
      {renderEmailDetails()}
    </BaseNode>
  );
};