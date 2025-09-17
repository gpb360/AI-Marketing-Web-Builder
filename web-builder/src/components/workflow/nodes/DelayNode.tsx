/**
 * Delay Node Component
 * Introduces time delays in workflow execution
 */

'use client';

import React from 'react';
import { BaseNode } from './BaseNode';
import { WorkflowNodeData } from '@/types/workflow';
import { Clock, Timer, Calendar, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DelayNodeProps {
  data: WorkflowNodeData & {
    delayConfig: {
      type: 'fixed' | 'dynamic' | 'schedule';
      duration?: number; // minutes
      unit?: 'minutes' | 'hours' | 'days' | 'weeks';
      dynamicField?: string; // field to read delay from
      schedule?: {
        datetime: Date;
        timezone?: string;
      };
      businessHoursOnly?: boolean;
      skipWeekends?: boolean;
    };
  };
  selected?: boolean;
}

export const DelayNode: React.FC<DelayNodeProps> = ({ data, selected }) => {
  const getDelayIcon = () => {
    switch (data.delayConfig.type) {
      case 'schedule':
        return Calendar;
      case 'dynamic':
        return Timer;
      default:
        return Clock;
    }
  };

  const formatDelayDuration = () => {
    const { duration, unit } = data.delayConfig;
    if (!duration || !unit) return 'Custom delay';
    
    return `${duration} ${duration === 1 ? unit.slice(0, -1) : unit}`;
  };

  const DelayIcon = getDelayIcon();

  const renderDelayDetails = () => {
    const { delayConfig } = data;

    switch (delayConfig.type) {
      case 'fixed':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              Fixed Delay
            </Badge>
            <div className="text-xs text-gray-600">
              Wait: {formatDelayDuration()}
            </div>
            {delayConfig.businessHoursOnly && (
              <div className="text-xs text-gray-500">
                Business hours only
              </div>
            )}
            {delayConfig.skipWeekends && (
              <div className="text-xs text-gray-500">
                Skip weekends
              </div>
            )}
          </div>
        );

      case 'dynamic':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              Dynamic Delay
            </Badge>
            {delayConfig.dynamicField && (
              <div className="text-xs text-gray-600">
                From: {delayConfig.dynamicField}
              </div>
            )}
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              Scheduled
            </Badge>
            {delayConfig.schedule?.datetime && (
              <div className="text-xs text-gray-600">
                {delayConfig.schedule.datetime.toLocaleString()}
              </div>
            )}
            {delayConfig.schedule?.timezone && (
              <div className="text-xs text-gray-500">
                {delayConfig.schedule.timezone}
              </div>
            )}
          </div>
        );

      default:
        return (
          <Badge variant="outline" className="text-xs">
            Delay
          </Badge>
        );
    }
  };

  return (
    <BaseNode
      data={{
        ...data,
        label: data.label || `Delay (${formatDelayDuration()})`
      }}
      type="delay"
      selected={selected}
      icon={DelayIcon}
      color="purple"
      hasInput={true}
      hasOutput={true}
    >
      {renderDelayDetails()}
      
      {/* Show countdown if currently delaying */}
      {data.status === 'running' && (
        <div className="mt-2 flex items-center justify-center">
          <div className="flex items-center gap-1 text-xs text-purple-600">
            <Play className="w-3 h-3 animate-pulse" />
            <span>Waiting...</span>
          </div>
        </div>
      )}
    </BaseNode>
  );
};