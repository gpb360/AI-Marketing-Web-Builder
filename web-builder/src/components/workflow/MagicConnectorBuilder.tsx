'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { ReactFlowProvider, ReactFlow, Background, Controls, MiniMap, Panel, Node, Edge, Connection, NodeChange, EdgeChange, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Square, 
  GitBranch, 
  Clock, 
  Webhook, 
  Mail, 
  Users, 
  Zap, 
  Settings,
  Save,
  Plus,
  Trash2,
  Copy,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  ChevronDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Timer
} from 'lucide-react';
import { WorkflowNode as WorkflowNodeType, WorkflowEdge, WorkflowDefinition, WorkflowNodeType as NodeType, WorkflowCategory, TriggerType } from '@/types/workflow';
import { workflowService } from '@/lib/api/services';

// Custom Node Components
import TriggerNode from './workflow-nodes/TriggerNode';
import ActionNode from './workflow-nodes/ActionNode';
import ConditionNode from './workflow-nodes/ConditionNode';
import DelayNode from './workflow-nodes/DelayNode';
import WebhookNode from './workflow-nodes/WebhookNode';
import EmailNode from './workflow-nodes/EmailNode';
import CRMNode from './workflow-nodes/CRMNode';
import EndNode from './workflow-nodes/EndNode';

// Node type registry
const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
  webhook: WebhookNode,
  email: EmailNode,
  crm: CRMNode,
  end: EndNode,
};

// Node configurations for the palette
const NODE_CONFIGS = {
  trigger: {
    color: 'green',
    icon: Play,
    category: 'Triggers',
    description: 'Start workflow when conditions are met',
    label: 'Trigger'
  },
  action: {
    color: 'blue',
    icon: Zap,
    category: 'Actions',
    description: 'Perform automated actions',
    label: 'Action'
  },
  condition: {
    color: 'yellow',
    icon: GitBranch,
    category: 'Logic',
    description: 'Branch workflow based on conditions',
    label: 'Condition'
  },
  delay: {
    color: 'purple',
    icon: Clock,
    category: 'Timing',
    description: 'Wait before continuing workflow',
    label: 'Delay'
  },
  webhook: {
    color: 'indigo',
    icon: Webhook,
    category: 'Integration',
    description: 'Send HTTP requests to external services',
    label: 'Webhook'
  },
  email: {
    color: 'red',
    icon: Mail,
    category: 'Communication',
    description: 'Send automated emails',
    label: 'Email'
  },
  crm: {
    color: 'teal',
    icon: Users,
    category: 'CRM',
    description: 'Manage contacts and leads',
    label: 'CRM'
  },
  end: {
    color: 'gray',
    icon: Square,
    category: 'Control',
    description: 'End workflow execution',
    label: 'End'
  }
} as const;

interface MagicConnectorBuilderProps {
  onWorkflowSave?: (workflow: WorkflowDefinition) => void;
  onWorkflowExecute?: (workflowId: string) => void;
  initialWorkflow?: WorkflowDefinition;
  connectedComponentId?: string;
  isModal?: boolean;
  onClose?: () => void;
}

interface NodePaletteItem {
  type: NodeType;
  config: typeof NODE_CONFIGS[NodeType];
}

export default function MagicConnectorBuilder({
  onWorkflowSave,
  onWorkflowExecute,
  initialWorkflow,
  connectedComponentId,
  isModal = false,
  onClose
}: MagicConnectorBuilderProps) {
  // State management
  const [nodes, setNodes] = useState<Node[]>(initialWorkflow?.nodes || []);
  const [edges, setEdges] = useState<Edge[]>(initialWorkflow?.edges || []);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState(initialWorkflow?.name || 'Untitled Workflow');
  const [workflowDescription, setWorkflowDescription] = useState(initialWorkflow?.description || '');
  const [workflowCategory, setWorkflowCategory] = useState<WorkflowCategory>(WorkflowCategory.AUTOMATION);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'design' | 'properties' | 'execution'>('design');

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<any>(null);

  // Node palette filtered by search and category
  const nodePalette: NodePaletteItem[] = useMemo(() => {
    const items = Object.entries(NODE_CONFIGS).map(([type, config]) => ({
      type: type as NodeType,
      config
    }));

    if (!searchTerm) return items;

    return items.filter(item => 
      item.config.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.config.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.config.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // React Flow event handlers
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      const updatedNodes = nds.map(node => {
        const change = changes.find(c => c.id === node.id);
        if (change?.type === 'select') {
          setSelectedNode(change.selected ? node.id : null);
        }
        return node;
      });
      return updatedNodes;
    });
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => {
      const updatedEdges = eds.map(edge => {
        const change = changes.find(c => c.id === edge.id);
        if (change?.type === 'select') {
          setSelectedEdge(change.selected ? edge.id : null);
        }
        return edge;
      });
      return updatedEdges;
    });
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({
      ...connection,
      id: `edge-${Date.now()}`,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 }
    }, eds));
  }, []);

  // Node operations
  const addNode = useCallback((nodeType: NodeType, position?: { x: number; y: number }) => {
    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: position || { x: Math.random() * 300, y: Math.random() * 300 },
      data: {
        label: NODE_CONFIGS[nodeType].label,
        description: NODE_CONFIGS[nodeType].description,
        config: {},
        status: 'idle'
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode.id);
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter(n => n.id !== nodeId));
    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  }, []);

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter(e => e.id !== edgeId));
    setSelectedEdge(null);
  }, []);

  // Workflow operations
  const saveWorkflow = useCallback(async () => {
    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      category: workflowCategory,
      trigger_type: 'manual' as const,
      component_id: connectedComponentId,
      nodes: nodes.map(node => ({
        node_id: node.id,
        name: node.data.label,
        node_type: node.type as any,
        parameters: node.data.config || {},
        position: { x: node.position.x, y: node.position.y },
        inputs: [],
        outputs: []
      })),
      connections: edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      })),
      settings: {
        maxExecutionTime: 3600,
        retryAttempts: 3,
        retryDelay: 5,
        enableLogging: true,
        enableAnalytics: true,
        errorHandling: 'stop'
      }
    };

    try {
      let result;
      if (initialWorkflow?.id) {
        // Update existing workflow
        result = await workflowService.updateWorkflow(parseInt(initialWorkflow.id), workflowData);
      } else {
        // Create new workflow
        result = await workflowService.createWorkflow(workflowData);
      }

      // Convert result back to WorkflowDefinition format for callback
      const workflowDefinition: WorkflowDefinition = {
        id: result.id.toString(),
        name: result.name,
        description: result.description || '',
        version: 1,
        nodes: result.nodes || [],
        edges: result.connections || [],
        variables: [],
        settings: result.settings || {
          maxExecutionTime: 3600,
          retryAttempts: 3,
          retryDelay: 5,
          enableLogging: true,
          enableAnalytics: true,
          errorHandling: 'stop'
        },
        metadata: {
          category: result.category,
          tags: [],
          author: 'Current User',
          lastModifiedBy: 'Current User',
          usageCount: result.trigger_count || 0,
          averageExecutionTime: 0,
          successRate: result.success_count && result.trigger_count 
            ? (result.success_count / result.trigger_count) * 100 
            : 100,
          integrations: []
        },
        status: result.status,
        created_at: new Date(result.created_at),
        updated_at: new Date(result.updated_at || result.created_at)
      };

      onWorkflowSave?.(workflowDefinition);
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  }, [workflowName, workflowDescription, workflowCategory, nodes, edges, initialWorkflow, connectedComponentId, onWorkflowSave]);

  const executeWorkflow = useCallback(async () => {
    if (!nodes.length) return;

    setIsExecuting(true);
    setExecutionProgress(0);

    try {
      // If we have an existing workflow ID, execute it
      if (initialWorkflow?.id) {
        // Execute the workflow via backend API
        const execution = await workflowService.executeWorkflow(
          parseInt(initialWorkflow.id), 
          { manual_trigger: true }
        );
        
        // Monitor execution progress
        const progressInterval = setInterval(async () => {
          setExecutionProgress(prev => {
            const newProgress = Math.min(prev + 20, 100);
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              setIsExecuting(false);
              onWorkflowExecute?.(initialWorkflow.id!);
            }
            return newProgress;
          });
        }, 500);
      } else {
        // For unsaved workflows, simulate execution
        for (let i = 0; i <= 100; i += 10) {
          setExecutionProgress(i);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        setIsExecuting(false);
        onWorkflowExecute?.('new-workflow');
      }
    } catch (error) {
      console.error('Workflow execution failed:', error);
      setIsExecuting(false);
      setExecutionProgress(0);
    }
  }, [nodes, initialWorkflow, onWorkflowExecute]);

  // Drag and drop from palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const nodeType = event.dataTransfer.getData('application/reactflow');
    if (!nodeType || !reactFlowInstance.current) return;

    const position = reactFlowInstance.current.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    addNode(nodeType as NodeType, position);
  }, [addNode]);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const selectedNodeData = useMemo(() => {
    return selectedNode ? nodes.find(n => n.id === selectedNode) : null;
  }, [selectedNode, nodes]);

  const selectedEdgeData = useMemo(() => {
    return selectedEdge ? edges.find(e => e.id === selectedEdge) : null;
  }, [selectedEdge, edges]);

  return (
    <div className={`h-full flex flex-col ${isModal ? 'max-h-[90vh]' : 'h-screen'} bg-gray-50`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-indigo-600" />
              <h1 className="text-xl font-semibold text-gray-900">Magic Connector</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Workflow name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="w-64"
              />
              <Badge variant={workflowCategory === WorkflowCategory.AUTOMATION ? 'default' : 'secondary'}>
                {workflowCategory}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {connectedComponentId && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>Connected to Component</span>
              </Badge>
            )}
            
            <Button variant="outline" size="sm" onClick={saveWorkflow}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            
            <Button 
              size="sm" 
              onClick={executeWorkflow}
              disabled={isExecuting || !nodes.length}
            >
              {isExecuting ? (
                <>
                  <Timer className="h-4 w-4 mr-1 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Execute
                </>
              )}
            </Button>
            
            {isModal && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar when executing */}
        {isExecuting && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Executing workflow...</span>
              <span>{executionProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${executionProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Node Palette Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <h2 className="text-sm font-medium text-gray-900">Node Library</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {nodePalette.map(({ type, config }) => {
                const IconComponent = config.icon;
                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={(e) => onDragStart(e, type)}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-move hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${config.color}-100`}>
                      <IconComponent className={`h-5 w-5 text-${config.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">{config.label}</div>
                      <div className="text-xs text-gray-500 truncate">{config.description}</div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {config.category}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Workflow Canvas */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
            <div className="border-b border-gray-200 px-4">
              <TabsList className="h-10">
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="execution">Execution</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="design" className="flex-1 m-0">
              <div ref={reactFlowWrapper} className="h-full">
                <ReactFlowProvider>
                  <ReactFlow
                    ref={reactFlowInstance}
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    className="bg-gray-50"
                    fitView
                  >
                    <Background color="#e5e7eb" gap={20} />
                    <Controls />
                    <MiniMap 
                      style={{
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                    
                    {/* Canvas Instructions */}
                    {nodes.length === 0 && (
                      <Panel position="center">
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg max-w-md text-center">
                          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Build Your Workflow
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Drag nodes from the sidebar to start building your automation workflow.
                          </p>
                          <Button onClick={() => addNode('trigger')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Trigger
                          </Button>
                        </div>
                      </Panel>
                    )}
                  </ReactFlow>
                </ReactFlowProvider>
              </div>
            </TabsContent>

            <TabsContent value="properties" className="flex-1 m-0 p-4 overflow-auto">
              {selectedNodeData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Node Properties</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteNode(selectedNodeData.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="node-label">Label</Label>
                      <Input
                        id="node-label"
                        value={selectedNodeData.data.label}
                        onChange={(e) => {
                          setNodes(nds => nds.map(n => 
                            n.id === selectedNodeData.id 
                              ? { ...n, data: { ...n.data, label: e.target.value } }
                              : n
                          ));
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="node-description">Description</Label>
                      <Input
                        id="node-description"
                        value={selectedNodeData.data.description || ''}
                        onChange={(e) => {
                          setNodes(nds => nds.map(n => 
                            n.id === selectedNodeData.id 
                              ? { ...n, data: { ...n.data, description: e.target.value } }
                              : n
                          ));
                        }}
                      />
                    </div>
                    {/* Additional node-specific configuration would go here */}
                  </CardContent>
                </Card>
              ) : selectedEdgeData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Connection Properties</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteEdge(selectedEdgeData.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Configure connection conditions and data flow.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a node or connection to view properties</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="execution" className="flex-1 m-0 p-4 overflow-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Execution History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No execution history available</p>
                    <p className="text-sm mt-2">Execute your workflow to see results here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}