'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Square, StopCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EndNodeData {
  label: string;
  description?: string;
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
}

const EndNode = memo(({ data, selected }: NodeProps<EndNodeData>) => {
  const { label, status = 'idle' } = data;

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'border-green-500 bg-green-50';
      case 'error': return 'border-red-500 bg-red-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getStatusDot = () => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px] ${getStatusColor()} ${selected ? 'ring-2 ring-indigo-500' : ''}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-500 border-2 border-white"
      />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
          <Badge variant="secondary" className="text-xs">END</Badge>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <Square className="h-5 w-5 text-gray-600" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900">{label}</div>
          <div className="text-xs text-gray-500">
            Workflow completion
          </div>
        </div>
      </div>

      {status === 'success' && (
        <div className="mt-2 text-xs text-green-600 flex items-center space-x-1">
          <StopCircle className="h-3 w-3" />
          <span>Workflow completed</span>
        </div>
      )}
    </div>
  );
});

EndNode.displayName = 'EndNode';

export default EndNode;