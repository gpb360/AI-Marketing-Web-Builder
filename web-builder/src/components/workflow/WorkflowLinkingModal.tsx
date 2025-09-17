'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, 
  Wand2, 
  Search, 
  Plus, 
  Settings, 
  Play, 
  Link,
  Unlink,
  ChevronRight,
  Sparkles,
  Activity,
  Users,
  Mail,
  Webhook,
  GitBranch,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { ComponentData } from '@/types/builder';
import { workflowService } from '@/lib/api/services';
import MagicConnectorBuilder from './MagicConnectorBuilder';

interface WorkflowLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  component: ComponentData;
  onWorkflowLinked?: (workflowId: string) => void;
  onWorkflowUnlinked?: () => void;
}

interface WorkflowSuggestion {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger_type: string;
  confidence: number;
  reason: string;
  template?: any;
}

interface ExistingWorkflow {
  id: string;
  name: string;
  description?: string;
  category: string;
  trigger_type: string;
  is_active: boolean;
  success_rate?: number;
  trigger_count?: number;
}

export default function WorkflowLinkingModal({
  isOpen,
  onClose,
  component,
  onWorkflowLinked,
  onWorkflowUnlinked
}: WorkflowLinkingModalProps) {
  // State management
  const [activeTab, setActiveTab] = useState<'suggestions' | 'existing' | 'create'>('suggestions');
  const [aiSuggestions, setAiSuggestions] = useState<WorkflowSuggestion[]>([]);
  const [existingWorkflows, setExistingWorkflows] = useState<ExistingWorkflow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);

  // Load AI suggestions based on component
  const loadAISuggestions = useCallback(async () => {
    if (!component) return;

    setIsLoadingSuggestions(true);
    try {
      // Generate AI suggestions based on component type and properties
      const suggestions = generateComponentBasedSuggestions(component);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to load AI suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [component]);

  // Load existing workflows
  const loadExistingWorkflows = useCallback(async () => {
    try {
      const response = await workflowService.getWorkflows({
        limit: 50,
        search: searchTerm
      });
      setExistingWorkflows(response.workflows || []);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  }, [searchTerm]);

  // Generate AI suggestions based on component type
  const generateComponentBasedSuggestions = (comp: ComponentData): WorkflowSuggestion[] => {
    const suggestions: WorkflowSuggestion[] = [];

    switch (comp.type) {
      case 'contact-form':
      case 'form':
        suggestions.push(
          {
            id: 'lead-capture',
            name: 'Lead Capture & Follow-up',
            description: 'Automatically capture form submissions, add contacts to CRM, and send welcome emails',
            category: 'marketing',
            trigger_type: 'form-submit',
            confidence: 95,
            reason: 'Forms are perfect for lead capture workflows'
          },
          {
            id: 'support-ticket',
            name: 'Support Ticket Creation',
            description: 'Create support tickets from form submissions and notify the support team',
            category: 'support',
            trigger_type: 'form-submit',
            confidence: 85,
            reason: 'Contact forms often need support workflow integration'
          }
        );
        break;

      case 'button':
        if (comp.props?.text?.toLowerCase().includes('download')) {
          suggestions.push({
            id: 'download-tracking',
            name: 'Download Tracking',
            description: 'Track downloads, update analytics, and trigger follow-up sequences',
            category: 'analytics',
            trigger_type: 'button-click',
            confidence: 90,
            reason: 'Download buttons need tracking and follow-up'
          });
        } else if (comp.props?.text?.toLowerCase().includes('subscribe')) {
          suggestions.push({
            id: 'newsletter-signup',
            name: 'Newsletter Subscription',
            description: 'Add subscribers to email list and send welcome sequence',
            category: 'marketing',
            trigger_type: 'button-click',
            confidence: 95,
            reason: 'Subscribe buttons need email automation'
          });
        } else {
          suggestions.push({
            id: 'user-engagement',
            name: 'User Engagement Tracking',
            description: 'Track button clicks and trigger personalized follow-up actions',
            category: 'analytics',
            trigger_type: 'button-click',
            confidence: 75,
            reason: 'Button interactions provide valuable user insights'
          });
        }
        break;

      case 'chat':
      case 'chat-widget':
        suggestions.push({
          id: 'chat-support',
          name: 'Chat to Support Workflow',
          description: 'Route chat messages to support team and create tickets for unresolved issues',
          category: 'support',
          trigger_type: 'chat-message',
          confidence: 90,
          reason: 'Chat widgets need support workflow integration'
        });
        break;

      default:
        suggestions.push({
          id: 'page-analytics',
          name: 'Page Analytics Tracking',
          description: 'Track component interactions and user behavior for optimization',
          category: 'analytics',
          trigger_type: 'page-view',
          confidence: 60,
          reason: 'All components can benefit from analytics tracking'
        });
    }

    return suggestions;
  };

  // Handle workflow connection
  const handleConnectWorkflow = async (workflowId: string) => {
    setIsConnecting(true);
    try {
      // Update component to link with workflow
      // This would typically call a service to update the component-workflow relationship
      console.log('Connecting component', component.id, 'to workflow', workflowId);
      
      onWorkflowLinked?.(workflowId);
      onClose();
    } catch (error) {
      console.error('Failed to connect workflow:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle workflow disconnection
  const handleDisconnectWorkflow = async () => {
    try {
      console.log('Disconnecting workflow from component', component.id);
      onWorkflowUnlinked?.();
      onClose();
    } catch (error) {
      console.error('Failed to disconnect workflow:', error);
    }
  };

  // Handle creating new workflow
  const handleCreateWorkflow = (suggestion?: WorkflowSuggestion) => {
    setShowWorkflowBuilder(true);
  };

  // Load data on mount
  useEffect(() => {
    if (isOpen) {
      loadAISuggestions();
      loadExistingWorkflows();
    }
  }, [isOpen, loadAISuggestions, loadExistingWorkflows]);

  if (showWorkflowBuilder) {
    return (
      <Dialog open={isOpen} onOpenChange={() => setShowWorkflowBuilder(false)}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          <MagicConnectorBuilder
            connectedComponentId={component.id}
            onWorkflowSave={(workflow) => {
              setShowWorkflowBuilder(false);
              handleConnectWorkflow(workflow.id);
            }}
            onClose={() => setShowWorkflowBuilder(false)}
            isModal={true}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            <span>Link Component to Workflow</span>
            <Badge variant="outline" className="ml-2">
              {component.type}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          {/* Component Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{component.name}</h3>
                <p className="text-sm text-gray-600">
                  Connect this component to automated workflows for enhanced functionality
                </p>
              </div>
              {component.isConnectedToWorkflow && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnectWorkflow}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Unlink className="h-4 w-4 mr-1" />
                  Disconnect
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="suggestions" className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>AI Suggestions</span>
              </TabsTrigger>
              <TabsTrigger value="existing" className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Existing Workflows</span>
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create New</span>
              </TabsTrigger>
            </TabsList>

            {/* AI Suggestions Tab */}
            <TabsContent value="suggestions" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                  <Wand2 className="h-4 w-4 text-purple-600" />
                  <span>Smart Workflow Recommendations</span>
                </h3>
                <p className="text-sm text-gray-600">
                  AI-powered suggestions based on your component type and common usage patterns
                </p>
              </div>

              {isLoadingSuggestions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {aiSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors cursor-pointer"
                        onClick={() => setSelectedWorkflow(suggestion.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900">{suggestion.name}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {suggestion.category}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-green-600">{suggestion.confidence}% match</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                            <p className="text-xs text-gray-500 italic">
                              💡 {suggestion.reason}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateWorkflow(suggestion);
                            }}
                            className="ml-4"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Create
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            {/* Existing Workflows Tab */}
            <TabsContent value="existing" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Workflows</Label>
                <Input
                  id="search"
                  placeholder="Search by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {existingWorkflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                        selectedWorkflow === workflow.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedWorkflow(workflow.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{workflow.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {workflow.category}
                            </Badge>
                            {workflow.is_active ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          {workflow.description && (
                            <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Trigger: {workflow.trigger_type}</span>
                            {workflow.success_rate !== undefined && (
                              <span>Success: {workflow.success_rate.toFixed(1)}%</span>
                            )}
                            {workflow.trigger_count !== undefined && (
                              <span>Executions: {workflow.trigger_count}</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {selectedWorkflow && (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleConnectWorkflow(selectedWorkflow)}
                    disabled={isConnecting}
                    className="flex-1"
                  >
                    {isConnecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Link className="h-4 w-4 mr-2" />
                        Connect Workflow
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedWorkflow(null)}>
                    Cancel
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Create New Tab */}
            <TabsContent value="create" className="space-y-4">
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Create Custom Workflow
                </h3>
                <p className="text-gray-600 mb-6">
                  Build a custom automation workflow tailored to your specific needs
                </p>
                <Button onClick={() => handleCreateWorkflow()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Open Workflow Builder
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}