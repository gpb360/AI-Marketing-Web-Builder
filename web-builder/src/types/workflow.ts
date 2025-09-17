/**
 * Workflow Automation Engine Types
 * Comprehensive type definitions for visual workflow building and execution
 */

// Core Workflow Types
export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  position: { x: number; y: number };
  data: WorkflowNodeData;
  selected?: boolean;
  dragging?: boolean;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  data?: {
    condition?: string;
    label?: string;
  };
  animated?: boolean;
  style?: React.CSSProperties;
}

export interface WorkflowNodeData {
  label: string;
  description?: string;
  config: Record<string, any>;
  inputs?: WorkflowInput[];
  outputs?: WorkflowOutput[];
  status?: 'idle' | 'running' | 'success' | 'error';
  executionTime?: number;
  lastExecuted?: Date;
  errorMessage?: string;
}

export interface WorkflowInput {
  id: string;
  name: string;
  type: InputType;
  required?: boolean;
  defaultValue?: any;
  validation?: ValidationRule[];
}

export interface WorkflowOutput {
  id: string;
  name: string;
  type: OutputType;
  description?: string;
}

export type WorkflowNodeType = 
  | 'trigger'
  | 'action'
  | 'condition' 
  | 'delay'
  | 'webhook'
  | 'email'
  | 'sms'
  | 'crm'
  | 'database'
  | 'api'
  | 'transform'
  | 'split'
  | 'merge'
  | 'end';

export type TriggerNodeType = 
  | 'form_submission'
  | 'page_view'
  | 'button_click'
  | 'time_based'
  | 'webhook'
  | 'api_call'
  | 'email_open'
  | 'email_click'
  | 'cart_abandonment'
  | 'user_signup'
  | 'purchase_complete';

export type ActionNodeType =
  | 'send_email'
  | 'create_contact'
  | 'update_contact'
  | 'add_to_list'
  | 'remove_from_list'
  | 'send_sms'
  | 'create_task'
  | 'send_notification'
  | 'update_database'
  | 'call_api'
  | 'generate_coupon'
  | 'schedule_meeting'
  | 'track_event';

export type ConditionNodeType =
  | 'if_then_else'
  | 'filter'
  | 'switch'
  | 'loop'
  | 'exists_check'
  | 'comparison'
  | 'text_contains'
  | 'number_range'
  | 'date_range'
  | 'list_contains';

export type InputType = 
  | 'text' 
  | 'email' 
  | 'number' 
  | 'boolean' 
  | 'date' 
  | 'select' 
  | 'multiselect'
  | 'json'
  | 'file'
  | 'url';

export type OutputType = 
  | 'text' 
  | 'email' 
  | 'number' 
  | 'boolean' 
  | 'date' 
  | 'object'
  | 'array'
  | 'file'
  | 'url';

export interface ValidationRule {
  type: 'required' | 'email' | 'url' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// Visual Workflow Builder Types
export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
  settings: WorkflowSettings;
  metadata: WorkflowMetadata;
  status: 'draft' | 'active' | 'paused' | 'error';
  created_at: Date;
  updated_at: Date;
}

export interface WorkflowVariable {
  id: string;
  name: string;
  type: InputType;
  value?: any;
  scope: 'global' | 'local';
  description?: string;
}

export interface WorkflowSettings {
  maxExecutionTime: number; // seconds
  retryAttempts: number;
  retryDelay: number; // seconds
  enableLogging: boolean;
  enableAnalytics: boolean;
  errorHandling: 'stop' | 'continue' | 'retry';
  rateLimiting?: {
    maxExecutionsPerHour: number;
    maxExecutionsPerDay: number;
  };
}

export interface WorkflowMetadata {
  category: string;
  tags: string[];
  author: string;
  lastModifiedBy: string;
  usageCount: number;
  averageExecutionTime: number;
  successRate: number;
  integrations: string[];
}

// Execution Engine Types
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  triggerData: any;
  executionContext: ExecutionContext;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  steps: ExecutionStep[];
  error?: ExecutionError;
  result?: any;
}

export type ExecutionStatus = 
  | 'pending'
  | 'running' 
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timeout';

export interface ExecutionContext {
  variables: Record<string, any>;
  environment: 'development' | 'staging' | 'production';
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

export interface ExecutionStep {
  nodeId: string;
  nodeType: WorkflowNodeType;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  input?: any;
  output?: any;
  error?: ExecutionError;
  retryAttempt?: number;
}

export interface ExecutionError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  nodeId?: string;
  recoverable: boolean;
}

// Template System Types
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  industry?: string[];
  useCase: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: number; // minutes
  template: Omit<WorkflowDefinition, 'id' | 'created_at' | 'updated_at'>;
  preview: {
    thumbnail: string;
    screenshots: string[];
    demoVideo?: string;
  };
  requirements: {
    integrations: string[];
    customFields?: WorkflowInput[];
    permissions?: string[];
  };
  benefits: string[];
  metrics: {
    downloads: number;
    rating: number;
    reviews: number;
  };
}

export type WorkflowCategory = 
  | 'lead-generation'
  | 'email-marketing'
  | 'customer-support'
  | 'ecommerce'
  | 'sales-automation'
  | 'onboarding'
  | 'retention'
  | 'analytics'
  | 'integration'
  | 'custom';

// Analytics & Monitoring Types
export interface WorkflowAnalytics {
  workflowId: string;
  timeframe: 'hour' | 'day' | 'week' | 'month' | 'year';
  metrics: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    successRate: number;
    errorRate: number;
    uniqueTriggers: number;
  };
  performance: {
    fastestExecution: number;
    slowestExecution: number;
    bottleneckNodes: string[];
    resourceUsage: {
      cpu: number;
      memory: number;
      network: number;
    };
  };
  trends: {
    timestamp: Date;
    executions: number;
    successRate: number;
    averageTime: number;
  }[];
  errors: {
    nodeId: string;
    errorCode: string;
    count: number;
    lastOccurrence: Date;
  }[];
}

export interface WorkflowMonitoring {
  workflowId: string;
  alerts: WorkflowAlert[];
  healthStatus: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastHealthCheck: Date;
  issues: WorkflowIssue[];
}

export interface WorkflowAlert {
  id: string;
  type: 'error_rate' | 'execution_time' | 'failure_count' | 'resource_usage';
  threshold: number;
  currentValue: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggered: Date;
  acknowledged: boolean;
}

export interface WorkflowIssue {
  id: string;
  type: 'performance' | 'reliability' | 'configuration' | 'integration';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  nodeId?: string;
  suggestion?: string;
  autoFixAvailable: boolean;
  created: Date;
  resolved?: Date;
}

// Integration Types
export interface WorkflowIntegration {
  id: string;
  name: string;
  type: IntegrationType;
  config: IntegrationConfig;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  syncCount: number;
  errorCount: number;
}

export type IntegrationType = 
  | 'email' 
  | 'crm'
  | 'database'
  | 'webhook'
  | 'api'
  | 'payment'
  | 'analytics'
  | 'social'
  | 'storage'
  | 'notification';

export interface IntegrationConfig {
  apiKey?: string;
  endpoint?: string;
  authentication: AuthenticationType;
  settings: Record<string, any>;
  rateLimits?: {
    requestsPerSecond: number;
    requestsPerHour: number;
  };
  retryPolicy?: {
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential';
    initialDelay: number;
  };
}

export type AuthenticationType = 
  | 'api_key'
  | 'oauth2'
  | 'basic_auth'
  | 'bearer_token'
  | 'custom';

// AI Integration Types
export interface AIWorkflowSuggestion {
  id: string;
  workflowId: string;
  type: 'optimization' | 'new_node' | 'connection' | 'template';
  confidence: number;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  category: 'performance' | 'conversion' | 'user_experience' | 'automation';
  implementation: {
    steps: string[];
    estimatedTime: number;
    requirements?: string[];
  };
  preview?: WorkflowDefinition;
}

export interface WorkflowOptimization {
  id: string;
  workflowId: string;
  type: 'performance' | 'conversion' | 'reliability' | 'cost';
  suggestions: AIWorkflowSuggestion[];
  currentMetrics: Record<string, number>;
  projectedMetrics: Record<string, number>;
  implementationPlan: {
    phase: number;
    description: string;
    actions: string[];
    estimatedImpact: number;
  }[];
}

// UI State Types
export interface WorkflowBuilderState {
  selectedNodeId?: string;
  selectedEdgeId?: string;
  isExecuting: boolean;
  executionProgress: number;
  showMiniMap: boolean;
  showControls: boolean;
  viewportFitView: boolean;
  zoom: number;
  draggedNodeType?: WorkflowNodeType;
  clipboard?: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  };
}

export interface WorkflowBuilderActions {
  addNode: (node: Omit<WorkflowNode, 'id'>) => void;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Omit<WorkflowEdge, 'id'>) => void;
  updateEdge: (id: string, updates: Partial<WorkflowEdge>) => void;
  deleteEdge: (id: string) => void;
  selectNode: (id: string) => void;
  selectEdge: (id: string) => void;
  clearSelection: () => void;
  executeWorkflow: (triggerData?: any) => Promise<WorkflowExecution>;
  stopExecution: () => void;
  saveWorkflow: () => Promise<void>;
  loadWorkflow: (id: string) => Promise<void>;
  duplicateWorkflow: () => Promise<WorkflowDefinition>;
  exportWorkflow: () => string;
  importWorkflow: (data: string) => void;
  undo: () => void;
  redo: () => void;
  copyNodes: (nodeIds: string[]) => void;
  pasteNodes: () => void;
  fitView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}