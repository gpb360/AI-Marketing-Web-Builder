/**
 * WorkflowStatusOverlay Component - Mock for Testing
 * 
 * This is a mock component for testing purposes
 */

import React from 'react';

export interface WorkflowNodeData {
  id: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  progress?: number;
  executionTime?: number;
  lastUpdated?: Date;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

interface WorkflowStatusOverlayProps {
  node: WorkflowNodeData;
  showProgress?: boolean;
  showExecutionTime?: boolean;
  animate?: boolean;
  onErrorClick?: (node: WorkflowNodeData, error: string) => void;
  onClick?: () => void;
}

const WorkflowStatusOverlay: React.FC<WorkflowStatusOverlayProps> = ({
  node,
  showProgress = false,
  showExecutionTime = false,
  animate = false,
  onErrorClick,
  onClick
}) => {
  const handleClick = () => {
    if (node.status === 'failed' && onErrorClick && node.errorMessage) {
      onErrorClick(node, node.errorMessage);
    } else if (onClick) {
      onClick();
    }
  };

  const getStatusClass = () => {
    switch (node.status) {
      case 'running': return 'status-running';
      case 'success': return 'status-success';
      case 'failed': return 'status-failed';
      default: return 'status-pending';
    }
  };

  const getTitle = () => {
    let title = `Status: ${node.status}`;
    if (showProgress && node.progress) {
      title += `, Progress: ${node.progress}%`;
    }
    if (showExecutionTime && node.executionTime) {
      title += `, Execution Time: ${(node.executionTime / 1000).toFixed(1)}s`;
    }
    return title;
  };

  return (
    <button
      data-testid={`node-status-${node.id}`}
      className={`workflow-status-overlay ${getStatusClass()} ${animate ? 'shadow-lg' : ''}`}
      onClick={handleClick}
      aria-label={`Node ${node.id} ${node.status}`}
      title={getTitle()}
      tabIndex={0}
    >
      <div className="status-indicator" />
      {showProgress && node.progress && (
        <div data-testid={`progress-${node.id}`} className="progress">
          {node.progress}%
        </div>
      )}
    </button>
  );
};

export default WorkflowStatusOverlay;