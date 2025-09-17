'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Zap, Mail, Database, Webhook, MessageSquare, FileText, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ActionNodeData {
  label: string;
  description?: string;
  actionType?: 'send_email' | 'add_to_crm' | 'webhook_post' | 'slack_notification' | 'update_contact' | 'create_record';
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
  executionTime?: number;
}

const actionIcons = {
  send_email: Mail,
  add_to_crm: Users,
  webhook_post: Webhook,
  slack_notification: MessageSquare,
  update_contact: FileText,
  create_record: Database
};

const ActionNode = memo(({ data, selected }: NodeProps<ActionNodeData>) => {
  const { label, actionType = 'send_email', status = 'idle', executionTime } = data;
  const ActionIcon = actionIcons[actionType] || Zap;

  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'border-blue-500 bg-blue-50';
      case 'success': return 'border-green-500 bg-green-50';
      case 'error': return 'border-red-500 bg-red-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getStatusDot = () => {
    switch (status) {
      case 'running': return 'bg-blue-500 animate-pulse';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px] ${getStatusColor()} ${selected ? 'ring-2 ring-indigo-500' : ''}`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />

      {/* Status indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
          <Badge variant="secondary" className="text-xs">
            ACTION
          </Badge>
        </div>
        {executionTime && (
          <div className="text-xs text-gray-500">
            {executionTime}ms
          </div>
        )}
      </div>

      {/* Node content */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <ActionIcon className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900">{label}</div>
          <div className="text-xs text-gray-500 capitalize">
            {actionType.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Execution info */}
      {status === 'running' && (
        <div className="mt-2 text-xs text-blue-600">
          Executing action...
        </div>
      )}

      {status === 'error' && (
        <div className="mt-2 text-xs text-red-600">
          Action failed
        </div>
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  );
});

ActionNode.displayName = 'ActionNode';

export default ActionNode;