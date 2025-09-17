/**
 * Trigger Node Component
 * Start point for workflows - defines when workflow should execute
 */

'use client';

import React from 'react';
import { BaseNode } from './BaseNode';
import { WorkflowNodeData, TriggerNodeType } from '@/types/workflow';
import { 
  Play,
  MousePointer,
  Clock,
  Webhook,
  Mail,
  ShoppingCart,
  UserPlus,
  Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TriggerNodeProps {
  data: WorkflowNodeData & {
    triggerType: TriggerNodeType;
    triggerConfig: {
      conditions?: Array<{
        field: string;
        operator: string;
        value: any;
      }>;
      schedule?: {
        type: 'once' | 'recurring';
        datetime?: Date;
        cron?: string;
      };
      webhook?: {
        url: string;
        method: string;
        headers?: Record<string, string>;
      };
    };
  };
  selected?: boolean;
}

export const TriggerNode: React.FC<TriggerNodeProps> = ({ data, selected }) => {
  const getTriggerIcon = (triggerType: TriggerNodeType) => {
    const iconMap = {
      form_submission: MousePointer,
      page_view: Eye,
      button_click: MousePointer,
      time_based: Clock,
      webhook: Webhook,
      api_call: Webhook,
      email_open: Mail,
      email_click: Mail,
      cart_abandonment: ShoppingCart,
      user_signup: UserPlus,
      purchase_complete: ShoppingCart
    };
    
    return iconMap[triggerType] || Play;
  };

  const getTriggerLabel = (triggerType: TriggerNodeType) => {
    const labelMap = {
      form_submission: 'Form Submission',
      page_view: 'Page View',
      button_click: 'Button Click',
      time_based: 'Schedule',
      webhook: 'Webhook',
      api_call: 'API Call',
      email_open: 'Email Open',
      email_click: 'Email Click',
      cart_abandonment: 'Cart Abandonment',
      user_signup: 'User Signup',
      purchase_complete: 'Purchase Complete'
    };
    
    return labelMap[triggerType] || 'Trigger';
  };

  const TriggerIcon = getTriggerIcon(data.triggerType);

  const renderTriggerDetails = () => {
    const { triggerType, triggerConfig } = data;

    switch (triggerType) {
      case 'form_submission':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              Form Trigger
            </Badge>
            {triggerConfig.conditions && (
              <div className="text-xs text-gray-600">
                {triggerConfig.conditions.length} condition(s)
              </div>
            )}
          </div>
        );

      case 'time_based':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              {triggerConfig.schedule?.type === 'recurring' ? 'Recurring' : 'One-time'}
            </Badge>
            {triggerConfig.schedule?.cron && (
              <div className="text-xs text-gray-600 font-mono">
                {triggerConfig.schedule.cron}
              </div>
            )}
            {triggerConfig.schedule?.datetime && (
              <div className="text-xs text-gray-600">
                {triggerConfig.schedule.datetime.toLocaleDateString()}
              </div>
            )}
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              {triggerConfig.webhook?.method || 'POST'}
            </Badge>
            {triggerConfig.webhook?.url && (
              <div className="text-xs text-gray-600 truncate">
                {triggerConfig.webhook.url}
              </div>
            )}
          </div>
        );

      case 'page_view':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              Page View
            </Badge>
            {triggerConfig.conditions && (
              <div className="text-xs text-gray-600">
                URL: {triggerConfig.conditions.find(c => c.field === 'url')?.value || 'Any page'}
              </div>
            )}
          </div>
        );

      case 'cart_abandonment':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              E-commerce
            </Badge>
            <div className="text-xs text-gray-600">
              Trigger after cart inactivity
            </div>
          </div>
        );

      default:
        return (
          <Badge variant="outline" className="text-xs">
            {getTriggerLabel(triggerType)}
          </Badge>
        );
    }
  };

  return (
    <BaseNode
      data={{
        ...data,
        label: data.label || getTriggerLabel(data.triggerType)
      }}
      type="trigger"
      selected={selected}
      icon={TriggerIcon}
      color="green"
      hasInput={false}
      hasOutput={true}
    >
      {renderTriggerDetails()}
    </BaseNode>
  );
};