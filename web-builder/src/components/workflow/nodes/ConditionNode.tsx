/**
 * Condition Node Component
 * Implements branching logic in workflows
 */

'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { WorkflowNodeData, ConditionNodeType } from '@/types/workflow';
import { 
  GitBranch,
  Filter,
  ToggleLeft,
  Repeat,
  Search,
  Calculator,
  Type,
  Hash,
  Calendar,
  List
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConditionNodeProps {
  data: WorkflowNodeData & {
    conditionType: ConditionNodeType;
    conditionConfig: {
      rules?: Array<{
        field: string;
        operator: string;
        value: any;
        logicalOperator?: 'AND' | 'OR';
      }>;
      branches?: Array<{
        id: string;
        label: string;
        condition: string;
        isDefault?: boolean;
      }>;
      loopConfig?: {
        type: 'for' | 'while' | 'forEach';
        iterations?: number;
        condition?: string;
        array?: string;
      };
    };
  };
  selected?: boolean;
}

export const ConditionNode: React.FC<ConditionNodeProps> = ({ data, selected }) => {
  const getConditionIcon = (conditionType: ConditionNodeType) => {
    const iconMap = {
      if_then_else: GitBranch,
      filter: Filter,
      switch: ToggleLeft,
      loop: Repeat,
      exists_check: Search,
      comparison: Calculator,
      text_contains: Type,
      number_range: Hash,
      date_range: Calendar,
      list_contains: List
    };
    
    return iconMap[conditionType] || GitBranch;
  };

  const getConditionLabel = (conditionType: ConditionNodeType) => {
    const labelMap = {
      if_then_else: 'If/Then/Else',
      filter: 'Filter',
      switch: 'Switch',
      loop: 'Loop',
      exists_check: 'Exists Check',
      comparison: 'Comparison',
      text_contains: 'Text Contains',
      number_range: 'Number Range',
      date_range: 'Date Range',
      list_contains: 'List Contains'
    };
    
    return labelMap[conditionType] || 'Condition';
  };

  const ConditionIcon = getConditionIcon(data.conditionType);

  const renderConditionDetails = () => {
    const { conditionType, conditionConfig } = data;

    switch (conditionType) {
      case 'if_then_else':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              If/Then/Else
            </Badge>
            {conditionConfig.rules && conditionConfig.rules.length > 0 && (
              <div className="space-y-1">
                {conditionConfig.rules.slice(0, 2).map((rule, idx) => (
                  <div key={idx} className="text-xs text-gray-600 truncate">
                    {rule.field} {rule.operator} {String(rule.value)}
                  </div>
                ))}
                {conditionConfig.rules.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{conditionConfig.rules.length - 2} more condition(s)
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'switch':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              Switch
            </Badge>
            {conditionConfig.branches && (
              <div className="text-xs text-gray-600">
                {conditionConfig.branches.length} branch(es)
              </div>
            )}
          </div>
        );

      case 'loop':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              {conditionConfig.loopConfig?.type || 'Loop'}
            </Badge>
            {conditionConfig.loopConfig?.iterations && (
              <div className="text-xs text-gray-600">
                {conditionConfig.loopConfig.iterations} iteration(s)
              </div>
            )}
            {conditionConfig.loopConfig?.condition && (
              <div className="text-xs text-gray-600 truncate">
                While: {conditionConfig.loopConfig.condition}
              </div>
            )}
          </div>
        );

      case 'filter':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              Filter
            </Badge>
            {conditionConfig.rules && (
              <div className="text-xs text-gray-600">
                {conditionConfig.rules.length} filter rule(s)
              </div>
            )}
          </div>
        );

      case 'comparison':
      case 'text_contains':
      case 'number_range':
      case 'date_range':
      case 'list_contains':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              {getConditionLabel(conditionType)}
            </Badge>
            {conditionConfig.rules && conditionConfig.rules[0] && (
              <div className="text-xs text-gray-600 truncate">
                {conditionConfig.rules[0].field} {conditionConfig.rules[0].operator} {String(conditionConfig.rules[0].value)}
              </div>
            )}
          </div>
        );

      default:
        return (
          <Badge variant="outline" className="text-xs">
            {getConditionLabel(conditionType)}
          </Badge>
        );
    }
  };

  // Custom node with multiple output handles for branching
  const renderMultiOutputNode = () => {
    const { conditionType, conditionConfig } = data;
    
    // Determine number of outputs
    let outputs: Array<{ id: string; label: string; position: number }> = [];
    
    if (conditionType === 'if_then_else') {
      outputs = [
        { id: 'true', label: 'True', position: 0.3 },
        { id: 'false', label: 'False', position: 0.7 }
      ];
    } else if (conditionType === 'switch' && conditionConfig.branches) {
      outputs = conditionConfig.branches.map((branch, idx) => ({
        id: branch.id,
        label: branch.label,
        position: (idx + 1) / (conditionConfig.branches!.length + 1)
      }));
    } else {
      // Default single output
      outputs = [{ id: 'output', label: '', position: 0.5 }];
    }

    return (
      <div className={cn(
        "relative bg-white border-2 rounded-lg shadow-sm transition-all duration-200 min-w-[200px]",
        selected ? "bg-yellow-100 border-yellow-400 ring-2 ring-blue-500 ring-offset-1" : "bg-yellow-50 border-yellow-200",
        data.status === 'running' && "animate-pulse"
      )}>
        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 border-2 border-gray-300 bg-white"
        />

        {/* Node Header */}
        <div className="flex items-center gap-3 p-3">
          <div className="p-2 rounded-lg bg-yellow-500 text-white">
            <ConditionIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-yellow-700 truncate">
              {data.label || getConditionLabel(data.conditionType)}
            </h3>
            {data.description && (
              <p className="text-xs text-gray-500 truncate mt-1">
                {data.description}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-3 pb-3">
          {renderConditionDetails()}
        </div>

        {/* Multiple Output Handles */}
        {outputs.map((output, idx) => (
          <React.Fragment key={output.id}>
            <Handle
              type="source"
              position={Position.Right}
              id={output.id}
              style={{ top: `${output.position * 100}%` }}
              className="w-3 h-3 border-2 border-gray-300 bg-white"
            />
            {output.label && (
              <div 
                className="absolute text-xs font-medium text-gray-600 bg-white px-1 py-0.5 rounded border"
                style={{ 
                  right: '-45px', 
                  top: `${output.position * 100 - 10}%`,
                  transform: 'translateY(-50%)'
                }}
              >
                {output.label}
              </div>
            )}
          </React.Fragment>
        ))}

        {/* Running Indicator */}
        {data.status === 'running' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
        )}
      </div>
    );
  };

  // Use custom multi-output node for branching conditions
  if (data.conditionType === 'if_then_else' || data.conditionType === 'switch') {
    return renderMultiOutputNode();
  }

  // Use base node for simple conditions
  return (
    <BaseNode
      data={{
        ...data,
        label: data.label || getConditionLabel(data.conditionType)
      }}
      type="condition"
      selected={selected}
      icon={ConditionIcon}
      color="yellow"
      hasInput={true}
      hasOutput={true}
    >
      {renderConditionDetails()}
    </BaseNode>
  );
};