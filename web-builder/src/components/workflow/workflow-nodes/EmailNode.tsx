'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Mail, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EmailNodeData {
  label: string;
  description?: string;
  recipient?: string;
  subject?: string;
  template?: string;
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
}

const EmailNode = memo(({ data, selected }: NodeProps<EmailNodeData>) => {
  const { label, recipient, subject, status = 'idle' } = data;

  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'border-red-500 bg-red-50';
      case 'success': return 'border-green-500 bg-green-50';
      case 'error': return 'border-red-500 bg-red-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getStatusDot = () => {
    switch (status) {
      case 'running': return 'bg-red-500 animate-pulse';
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
        className="w-3 h-3 bg-red-500 border-2 border-white"
      />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
          <Badge variant="secondary" className="text-xs">EMAIL</Badge>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <Mail className="h-5 w-5 text-red-600" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900">{label}</div>
          <div className="text-xs text-gray-500">
            To: {recipient || 'Dynamic recipient'}
          </div>
          {subject && (
            <div className="text-xs text-gray-400 truncate">
              "{subject}"
            </div>
          )}
        </div>
      </div>

      {status === 'running' && (
        <div className="mt-2 text-xs text-red-600 flex items-center space-x-1">
          <Send className="h-3 w-3" />
          <span>Sending email...</span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-red-500 border-2 border-white"
      />
    </div>
  );
});

EmailNode.displayName = 'EmailNode';

export default EmailNode;