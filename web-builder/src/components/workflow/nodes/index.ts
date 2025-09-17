/**
 * Workflow Node Components Index
 * All workflow node types for the visual builder
 */

export { TriggerNode } from './TriggerNode';
export { ActionNode } from './ActionNode';
export { ConditionNode } from './ConditionNode';
export { DelayNode } from './DelayNode';
export { WebhookNode } from './WebhookNode';
export { EmailNode } from './EmailNode';
export { CRMNode } from './CRMNode';
export { EndNode } from './EndNode';

// Node type registry for dynamic rendering
export const NODE_TYPES = {
  trigger: 'TriggerNode',
  action: 'ActionNode', 
  condition: 'ConditionNode',
  delay: 'DelayNode',
  webhook: 'WebhookNode',
  email: 'EmailNode',
  crm: 'CRMNode',
  end: 'EndNode'
} as const;

// Node configurations
export const NODE_CONFIGS = {
  trigger: {
    color: 'green',
    icon: 'Play',
    category: 'Triggers',
    description: 'Start workflow when conditions are met'
  },
  action: {
    color: 'blue', 
    icon: 'Zap',
    category: 'Actions',
    description: 'Perform automated actions'
  },
  condition: {
    color: 'yellow',
    icon: 'GitBranch',
    category: 'Logic',
    description: 'Branch workflow based on conditions'
  },
  delay: {
    color: 'purple',
    icon: 'Clock',
    category: 'Timing',
    description: 'Wait before continuing workflow'
  },
  webhook: {
    color: 'indigo',
    icon: 'Webhook',
    category: 'Integration', 
    description: 'Send HTTP requests to external services'
  },
  email: {
    color: 'red',
    icon: 'Mail',
    category: 'Communication',
    description: 'Send automated emails'
  },
  crm: {
    color: 'teal',
    icon: 'Users',
    category: 'CRM',
    description: 'Manage contacts and leads'
  },
  end: {
    color: 'gray',
    icon: 'Square',
    category: 'Control',
    description: 'End workflow execution'
  }
} as const;