/**
 * Action Node Component  
 * Performs automated actions within workflows
 */

'use client';

import React from 'react';
import { BaseNode } from './BaseNode';
import { WorkflowNodeData, ActionNodeType } from '@/types/workflow';
import { 
  Zap,
  Mail,
  UserPlus,
  Users,
  MessageSquare,
  Database,
  Webhook,
  Tag,
  Calendar,
  Bell,
  Gift,
  BarChart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ActionNodeProps {
  data: WorkflowNodeData & {
    actionType: ActionNodeType;
    actionConfig: {
      email?: {
        to: string;
        subject: string;
        template?: string;
        variables?: Record<string, any>;
      };
      contact?: {
        fields: Record<string, any>;
        lists?: string[];
        tags?: string[];
      };
      webhook?: {
        url: string;
        method: string;
        headers?: Record<string, string>;
        body?: any;
      };
      notification?: {
        message: string;
        channels: string[];
        priority: 'low' | 'normal' | 'high';
      };
      task?: {
        title: string;
        assignee?: string;
        dueDate?: Date;
        priority: 'low' | 'normal' | 'high';
      };
    };
  };
  selected?: boolean;
}

export const ActionNode: React.FC<ActionNodeProps> = ({ data, selected }) => {
  const getActionIcon = (actionType: ActionNodeType) => {
    const iconMap = {
      send_email: Mail,
      create_contact: UserPlus,
      update_contact: Users,
      add_to_list: Users,
      remove_from_list: Users,
      send_sms: MessageSquare,
      create_task: Calendar,
      send_notification: Bell,
      update_database: Database,
      call_api: Webhook,
      generate_coupon: Gift,
      schedule_meeting: Calendar,
      track_event: BarChart
    };
    
    return iconMap[actionType] || Zap;
  };

  const getActionLabel = (actionType: ActionNodeType) => {
    const labelMap = {
      send_email: 'Send Email',
      create_contact: 'Create Contact',
      update_contact: 'Update Contact', 
      add_to_list: 'Add to List',
      remove_from_list: 'Remove from List',
      send_sms: 'Send SMS',
      create_task: 'Create Task',
      send_notification: 'Send Notification',
      update_database: 'Update Database',
      call_api: 'API Call',
      generate_coupon: 'Generate Coupon',
      schedule_meeting: 'Schedule Meeting',
      track_event: 'Track Event'
    };
    
    return labelMap[actionType] || 'Action';
  };

  const getActionCategory = (actionType: ActionNodeType) => {
    if (['send_email', 'send_sms', 'send_notification'].includes(actionType)) {
      return 'Communication';
    }
    if (['create_contact', 'update_contact', 'add_to_list', 'remove_from_list'].includes(actionType)) {
      return 'CRM';
    }
    if (['update_database', 'call_api'].includes(actionType)) {
      return 'Integration';
    }
    if (['create_task', 'schedule_meeting'].includes(actionType)) {
      return 'Productivity';
    }
    if (['generate_coupon', 'track_event'].includes(actionType)) {
      return 'Marketing';
    }
    return 'Action';
  };

  const ActionIcon = getActionIcon(data.actionType);

  const renderActionDetails = () => {
    const { actionType, actionConfig } = data;

    switch (actionType) {
      case 'send_email':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              Email
            </Badge>
            {actionConfig.email?.subject && (
              <div className="text-xs text-gray-600 truncate">
                Subject: {actionConfig.email.subject}
              </div>
            )}
            {actionConfig.email?.template && (
              <div className="text-xs text-gray-500">
                Template: {actionConfig.email.template}
              </div>
            )}
          </div>
        );

      case 'create_contact':
      case 'update_contact':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              Contact
            </Badge>
            {actionConfig.contact?.fields && (
              <div className="text-xs text-gray-600">
                {Object.keys(actionConfig.contact.fields).length} field(s)
              </div>
            )}
            {actionConfig.contact?.lists && actionConfig.contact.lists.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {actionConfig.contact.lists.slice(0, 2).map((list, idx) => (
                  <span key={idx} className="text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded">
                    {list}
                  </span>
                ))}
                {actionConfig.contact.lists.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{actionConfig.contact.lists.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
        );

      case 'call_api':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              {actionConfig.webhook?.method || 'POST'}
            </Badge>
            {actionConfig.webhook?.url && (
              <div className="text-xs text-gray-600 truncate">
                {actionConfig.webhook.url}
              </div>
            )}
          </div>
        );

      case 'send_notification':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              {actionConfig.notification?.priority || 'normal'} priority
            </Badge>
            {actionConfig.notification?.message && (
              <div className="text-xs text-gray-600 truncate">
                {actionConfig.notification.message}
              </div>
            )}
            {actionConfig.notification?.channels && (
              <div className="text-xs text-gray-500">
                {actionConfig.notification.channels.join(', ')}
              </div>
            )}
          </div>
        );

      case 'create_task':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              Task
            </Badge>
            {actionConfig.task?.title && (
              <div className="text-xs text-gray-600 truncate">
                {actionConfig.task.title}
              </div>
            )}
            {actionConfig.task?.assignee && (
              <div className="text-xs text-gray-500">
                → {actionConfig.task.assignee}
              </div>
            )}
            {actionConfig.task?.dueDate && (
              <div className="text-xs text-gray-500">
                Due: {actionConfig.task.dueDate.toLocaleDateString()}
              </div>
            )}
          </div>
        );

      case 'generate_coupon':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              Coupon
            </Badge>
            <div className="text-xs text-gray-600">
              Generate discount code
            </div>
          </div>
        );

      case 'track_event':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              Analytics
            </Badge>
            <div className="text-xs text-gray-600">
              Track custom event
            </div>
          </div>
        );

      default:
        return (
          <Badge variant="outline" className="text-xs">
            {getActionCategory(actionType)}
          </Badge>
        );
    }
  };

  return (
    <BaseNode
      data={{
        ...data,
        label: data.label || getActionLabel(data.actionType)
      }}
      type="action"
      selected={selected}
      icon={ActionIcon}
      color="blue"
      hasInput={true}
      hasOutput={true}
    >
      {renderActionDetails()}
    </BaseNode>
  );
};