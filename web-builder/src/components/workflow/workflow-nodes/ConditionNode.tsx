'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GitBranch, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ConditionNodeData {
  label: string;
  description?: string;
  condition?: string;
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
  lastResult?: boolean;
}

const ConditionNode = memo(({ data, selected }: NodeProps<ConditionNodeData>) => {
  const { label, condition, status = 'idle', lastResult } = data;

  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'border-yellow-500 bg-yellow-50';
      case 'success': return 'border-green-500 bg-green-50';
      case 'error': return 'border-red-500 bg-red-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getStatusDot = () => {
    switch (status) {
      case 'running': return 'bg-yellow-500 animate-pulse';
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
        className="w-3 h-3 bg-yellow-500 border-2 border-white"
      />

      {/* Status indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
          <Badge variant="secondary" className="text-xs">
            CONDITION
          </Badge>
        </div>
        {lastResult !== undefined && (
          <div className="flex items-center space-x-1">
            {lastResult ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Node content */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
          <GitBranch className="h-5 w-5 text-yellow-600" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900">{label}</div>
          {condition && (
            <div className="text-xs text-gray-500 mt-1 font-mono">
              {condition}
            </div>
          )}
        </div>
      </div>

      {/* Execution info */}
      {status === 'running' && (
        <div className="mt-2 text-xs text-yellow-600">
          Evaluating condition...
        </div>
      )}

      {/* Output handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ top: '40%' }}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ top: '70%' }}
        className="w-3 h-3 bg-red-500 border-2 border-white"
      />

      {/* Branch labels */}
      <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 space-y-2 text-xs">
        <div className="text-green-600 font-medium">TRUE</div>
        <div className="text-red-600 font-medium">FALSE</div>
      </div>
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';

export default ConditionNode;