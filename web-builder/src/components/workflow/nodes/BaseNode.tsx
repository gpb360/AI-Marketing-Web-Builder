/**
 * Base Workflow Node Component
 * Reusable foundation for all workflow nodes
 */

'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { WorkflowNodeData, WorkflowNodeType } from '@/types/workflow';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Play,
  Square
} from 'lucide-react';

interface BaseNodeProps {
  data: WorkflowNodeData;
  type: WorkflowNodeType;
  selected?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  children?: React.ReactNode;
  hasInput?: boolean;
  hasOutput?: boolean;
  className?: string;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  data,
  type,
  selected = false,
  icon: Icon,
  color,
  children,
  hasInput = true,
  hasOutput = true,
  className = ''
}) => {
  const getStatusIcon = () => {
    switch (data.status) {
      case 'success':
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'running':
        return <Play className="w-3 h-3 text-blue-500 animate-pulse" />;
      default:
        return <Square className="w-3 h-3 text-gray-400" />;
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: {
        bg: 'bg-green-50 border-green-200',
        selectedBg: 'bg-green-100 border-green-400',
        icon: 'bg-green-500 text-white',
        text: 'text-green-700'
      },
      blue: {
        bg: 'bg-blue-50 border-blue-200',
        selectedBg: 'bg-blue-100 border-blue-400',
        icon: 'bg-blue-500 text-white',
        text: 'text-blue-700'
      },
      yellow: {
        bg: 'bg-yellow-50 border-yellow-200',
        selectedBg: 'bg-yellow-100 border-yellow-400',
        icon: 'bg-yellow-500 text-white',
        text: 'text-yellow-700'
      },
      purple: {
        bg: 'bg-purple-50 border-purple-200',
        selectedBg: 'bg-purple-100 border-purple-400',
        icon: 'bg-purple-500 text-white',
        text: 'text-purple-700'
      },
      indigo: {
        bg: 'bg-indigo-50 border-indigo-200',
        selectedBg: 'bg-indigo-100 border-indigo-400',
        icon: 'bg-indigo-500 text-white',
        text: 'text-indigo-700'
      },
      red: {
        bg: 'bg-red-50 border-red-200',
        selectedBg: 'bg-red-100 border-red-400',
        icon: 'bg-red-500 text-white',
        text: 'text-red-700'
      },
      teal: {
        bg: 'bg-teal-50 border-teal-200',
        selectedBg: 'bg-teal-100 border-teal-400',
        icon: 'bg-teal-500 text-white',
        text: 'text-teal-700'
      },
      gray: {
        bg: 'bg-gray-50 border-gray-200',
        selectedBg: 'bg-gray-100 border-gray-400',
        icon: 'bg-gray-500 text-white',
        text: 'text-gray-700'
      }
    };

    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  const colors = getColorClasses(color);

  return (
    <div className={cn(
      "relative bg-white border-2 rounded-lg shadow-sm transition-all duration-200 min-w-[200px]",
      selected ? colors.selectedBg : colors.bg,
      selected && "ring-2 ring-blue-500 ring-offset-1",
      data.status === 'running' && "animate-pulse",
      className
    )}>
      {/* Input Handle */}
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 border-2 border-gray-300 bg-white"
        />
      )}

      {/* Node Header */}
      <div className="flex items-center gap-3 p-3 pb-2">
        <div className={cn("p-2 rounded-lg", colors.icon)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={cn("font-medium text-sm truncate", colors.text)}>
              {data.label}
            </h3>
            {getStatusIcon()}
          </div>
          {data.description && (
            <p className="text-xs text-gray-500 truncate mt-1">
              {data.description}
            </p>
          )}
        </div>
      </div>

      {/* Node Content */}
      {children && (
        <div className="px-3 pb-3">
          {children}
        </div>
      )}

      {/* Execution Info */}
      {(data.executionTime || data.lastExecuted) && (
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {data.executionTime && (
              <span>{data.executionTime}ms</span>
            )}
            {data.lastExecuted && (
              <span>Last: {data.lastExecuted.toLocaleTimeString()}</span>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {data.status === 'error' && data.errorMessage && (
        <div className="px-3 pb-3">
          <div className="bg-red-50 border border-red-200 rounded-md p-2">
            <p className="text-xs text-red-600">{data.errorMessage}</p>
          </div>
        </div>
      )}

      {/* Output Handle */}
      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 border-2 border-gray-300 bg-white"
        />
      )}

      {/* Running Indicator */}
      {data.status === 'running' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
      )}
    </div>
  );
};