'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Play, Clock, MousePointer, Globe, Mail, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TriggerNodeData {
  label: string;
  description?: string;
  triggerType?: 'form_submit' | 'button_click' | 'page_view' | 'email_open' | 'schedule' | 'manual';
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
}

const triggerIcons = {
  form_submit: MousePointer,
  button_click: MousePointer,
  page_view: Globe,
  email_open: Mail,
  schedule: Calendar,
  manual: Play
};

const TriggerNode = memo(({ data, selected }: NodeProps<TriggerNodeData>) => {
  const { label, triggerType = 'manual', status = 'idle' } = data;
  const TriggerIcon = triggerIcons[triggerType] || Play;

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
      {/* Status indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
          <Badge variant="secondary" className="text-xs">
            TRIGGER
          </Badge>
        </div>
        <Clock className="h-4 w-4 text-gray-400" />
      </div>

      {/* Node content */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <TriggerIcon className="h-5 w-5 text-green-600" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900">{label}</div>
          <div className="text-xs text-gray-500 capitalize">
            {triggerType.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Execution info */}
      {status === 'running' && (
        <div className="mt-2 text-xs text-blue-600">
          Waiting for trigger...
        </div>
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';

export default TriggerNode;