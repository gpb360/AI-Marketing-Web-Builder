'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Clock, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DelayNodeData {
  label: string;
  description?: string;
  delay?: number;
  delayUnit?: 'seconds' | 'minutes' | 'hours' | 'days';
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
  remainingTime?: number;
}

const DelayNode = memo(({ data, selected }: NodeProps<DelayNodeData>) => {
  const { label, delay = 0, delayUnit = 'minutes', status = 'idle', remainingTime } = data;

  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'border-purple-500 bg-purple-50';
      case 'success': return 'border-green-500 bg-green-50';
      case 'error': return 'border-red-500 bg-red-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getStatusDot = () => {
    switch (status) {
      case 'running': return 'bg-purple-500 animate-pulse';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const formatDelay = () => {
    if (delay === 0) return 'No delay';
    return `${delay} ${delayUnit}`;
  };

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px] ${getStatusColor()} ${selected ? 'ring-2 ring-indigo-500' : ''}`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />

      {/* Status indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
          <Badge variant="secondary" className="text-xs">
            DELAY
          </Badge>
        </div>
        {remainingTime !== undefined && status === 'running' && (
          <div className="text-xs text-purple-600">
            {remainingTime}s left
          </div>
        )}
      </div>

      {/* Node content */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Clock className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900">{label}</div>
          <div className="text-xs text-gray-500">
            {formatDelay()}
          </div>
        </div>
      </div>

      {/* Execution info */}
      {status === 'running' && (
        <div className="mt-2 text-xs text-purple-600 flex items-center space-x-1">
          <Timer className="h-3 w-3" />
          <span>Waiting...</span>
        </div>
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
    </div>
  );
});

DelayNode.displayName = 'DelayNode';

export default DelayNode;