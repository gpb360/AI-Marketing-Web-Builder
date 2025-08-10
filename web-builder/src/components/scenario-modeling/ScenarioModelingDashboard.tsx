/**
 * Scenario Modeling Dashboard - Advanced Template Configuration Optimization
 * 
 * This component provides a comprehensive interface for:
 * - Creating and managing scenario modeling configurations
 * - Generating diverse scenarios for analysis
 * - Running predictive analytics with ML models
 * - Comparing scenario performance
 * - Getting AI-powered optimization recommendations
 * - Real-time simulation with Monte Carlo methods
 * 
 * Story #102: Create scenario modeling for different template configurations
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Brain,
  BarChart3,
  Target,
  TrendingUp,
  Settings,
  Play,
  Zap,
  Eye,
  Lightbulb,
  Activity,
  Layers,
  GitBranch,
  Calculator,
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  MoreVertical,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  MousePointer
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import types
import {
  type ScenarioModelingConfiguration,
  type ScenarioModel,
  type ScenarioPrediction,
  type OptimizationRecommendation,
  type ScenarioSimulationResult,
  type ScenarioComparison,
  ScenarioType,
  OptimizationObjective,
  type ScenarioModelingDashboardProps
} from '@/lib/types/scenario-modeling';

// Import sub-components
import { ScenarioConfigurationBuilder } from './ScenarioConfigurationBuilder';
import { ScenarioGenerator } from './ScenarioGenerator';
import { PredictionEngine } from './PredictionEngine';
import { ScenarioComparison as ScenarioComparisonComponent } from './ScenarioComparison';
import { OptimizationRecommendations } from './OptimizationRecommendations';
import { SimulationRunner } from './SimulationRunner';
import { PerformanceAnalytics } from './PerformanceAnalytics';

// Import custom hook
import { useScenarioModeling } from '@/hooks/useScenarioModeling';

/**
 * Main Scenario Modeling Dashboard Component
 */
export const ScenarioModelingDashboard: React.FC<ScenarioModelingDashboardProps> = ({
  templateId,
  onConfigurationCreate,
  onScenarioGenerate,
  onPredictionComplete,
  onRecommendationSelect,
  className
}) => {
  // State management
  const [selectedConfiguration, setSelectedConfiguration] = useState<ScenarioModelingConfiguration | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showConfigBuilder, setShowConfigBuilder] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<ScenarioType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'performance' | 'priority'>('created');
  
  // Custom hook for scenario modeling operations
  const {
    state,
    actions,
    loading,
    error,
    refresh
  } = useScenarioModeling({ 
    autoRefresh: true,
    refreshInterval: 30000 // 30 seconds
  });

  // Filtered configurations
  const filteredConfigurations = useMemo(() => {
    let filtered = state.configurations;
    
    if (templateId) {
      filtered = filtered.filter(config => config.template_id === templateId);
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(config => config.scenario_type === filterType);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return (b.active_scenarios_count || 0) - (a.active_scenarios_count || 0);
        case 'priority':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [state.configurations, templateId, filterType, sortBy]);

  // Get scenarios for selected configuration
  const currentScenarios = useMemo(() => {
    if (!selectedConfiguration) return [];
    return state.scenarios[selectedConfiguration.id] || [];
  }, [state.scenarios, selectedConfiguration]);

  // Get predictions for current scenarios
  const currentPredictions = useMemo(() => {
    if (!selectedConfiguration) return [];
    return currentScenarios.flatMap(scenario => 
      state.predictions[scenario.id] || []
    );
  }, [state.predictions, currentScenarios, selectedConfiguration]);

  // Get recommendations for selected configuration
  const currentRecommendations = useMemo(() => {
    if (!selectedConfiguration) return [];
    return state.recommendations[selectedConfiguration.id] || [];
  }, [state.recommendations, selectedConfiguration]);

  // Event handlers
  const handleConfigurationCreate = useCallback(async (config: ScenarioModelingConfiguration) => {
    setSelectedConfiguration(config);
    setShowConfigBuilder(false);
    onConfigurationCreate?.(config);
  }, [onConfigurationCreate]);

  const handleScenariosGenerated = useCallback((scenarios: ScenarioModel[]) => {
    onScenarioGenerate?.(scenarios.map(s => s.id));
  }, [onScenarioGenerate]);

  const handlePredictionsGenerated = useCallback((predictions: ScenarioPrediction[]) => {
    onPredictionComplete?.(predictions);
  }, [onPredictionComplete]);

  const handleRecommendationSelect = useCallback((recommendation: OptimizationRecommendation) => {
    onRecommendationSelect?.(recommendation);
  }, [onRecommendationSelect]);

  const handleRunSimulation = useCallback(async () => {
    if (!selectedConfiguration) return;
    
    try {
      const result = await actions.runSimulation({
        template_id: selectedConfiguration.template_id,
        modifications: selectedConfiguration.variable_parameters,
        business_context: selectedConfiguration.business_context,
        monte_carlo_runs: 1000
      });
      
      // Handle simulation result
      console.log('Simulation completed:', result);
    } catch (error) {
      console.error('Simulation failed:', error);
    }
  }, [selectedConfiguration, actions]);

  const handleDeleteConfiguration = useCallback(async (configId: string) => {
    try {
      await actions.deleteConfiguration(configId);
      if (selectedConfiguration?.id === configId) {
        setSelectedConfiguration(null);
      }
    } catch (error) {
      console.error('Failed to delete configuration:', error);
    }
  }, [actions, selectedConfiguration]);

  // Auto-select first configuration if none selected
  useEffect(() => {
    if (!selectedConfiguration && filteredConfigurations.length > 0) {
      setSelectedConfiguration(filteredConfigurations[0]);
    }
  }, [filteredConfigurations, selectedConfiguration]);

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const totalConfigurations = filteredConfigurations.length;
    const totalScenarios = Object.values(state.scenarios).flat().length;
    const totalPredictions = Object.values(state.predictions).flat().length;
    const totalRecommendations = Object.values(state.recommendations).flat().length;
    
    const activeConfigurations = filteredConfigurations.filter(c => c.active_scenarios_count && c.active_scenarios_count > 0).length;
    const avgScenariosPerConfig = totalConfigurations > 0 ? Math.round(totalScenarios / totalConfigurations) : 0;
    
    return {
      totalConfigurations,
      totalScenarios,
      totalPredictions,
      totalRecommendations,
      activeConfigurations,
      avgScenariosPerConfig
    };
  }, [filteredConfigurations, state]);

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Brain className="w-7 h-7 text-white" />
            </div>
            Scenario Modeling Dashboard
          </h1>
          <p className="text-gray-600">
            Advanced template configuration optimization with predictive analytics
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </Button>
          
          <Dialog open={showConfigBuilder} onOpenChange={setShowConfigBuilder}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Configuration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Scenario Configuration</DialogTitle>
                <DialogDescription>
                  Set up a new scenario modeling configuration for template optimization
                </DialogDescription>
              </DialogHeader>
              <ScenarioConfigurationBuilder
                templateId={templateId || ''}
                onConfigurationCreate={handleConfigurationCreate}
                onCancel={() => setShowConfigBuilder(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Configurations</p>
                <p className="text-2xl font-bold text-blue-600">{dashboardMetrics.totalConfigurations}</p>
              </div>
              <Settings className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{dashboardMetrics.activeConfigurations}</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scenarios</p>
                <p className="text-2xl font-bold text-purple-600">{dashboardMetrics.totalScenarios}</p>
              </div>
              <Layers className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Predictions</p>
                <p className="text-2xl font-bold text-orange-600">{dashboardMetrics.totalPredictions}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recommendations</p>
                <p className="text-2xl font-bold text-red-600">{dashboardMetrics.totalRecommendations}</p>
              </div>
              <Lightbulb className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg/Config</p>
                <p className="text-2xl font-bold text-indigo-600">{dashboardMetrics.avgScenariosPerConfig}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Configuration Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Configurations</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterType('all')}>All Types</DropdownMenuItem>
                  {Object.values(ScenarioType).map(type => (
                    <DropdownMenuItem key={type} onClick={() => setFilterType(type)}>
                      {type.replace('_', ' ').toUpperCase()}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 p-4">
                {filteredConfigurations.map((config) => (
                  <div
                    key={config.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedConfiguration?.id === config.id
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedConfiguration(config)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate">{config.name}</h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleDeleteConfiguration(config.id)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {config.scenario_type.replace('_', ' ')}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {config.optimization_objective.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{config.scenarios_count || 0} scenarios</span>
                        <span>{config.active_scenarios_count || 0} active</span>
                      </div>
                      
                      <div className="text-xs text-gray-400">
                        Created {new Date(config.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredConfigurations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No configurations found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setShowConfigBuilder(true)}
                    >
                      Create First Configuration
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {selectedConfiguration ? (
                  <>
                    <Target className="w-5 h-5 text-blue-500" />
                    {selectedConfiguration.name}
                  </>
                ) : (
                  'Select a Configuration'
                )}
              </CardTitle>
              
              {selectedConfiguration && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRunSimulation}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Run Simulation
                  </Button>
                </div>
              )}
            </div>
            
            {selectedConfiguration && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Type: {selectedConfiguration.scenario_type.replace('_', ' ')}</span>
                <span>•</span>
                <span>Objective: {selectedConfiguration.optimization_objective.replace('_', ' ')}</span>
                <span>•</span>
                <span>{currentScenarios.length} scenarios</span>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            {selectedConfiguration ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                  <TabsTrigger value="predictions">Predictions</TabsTrigger>
                  <TabsTrigger value="comparison">Comparison</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  <TabsTrigger value="simulation">Simulation</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Active Scenarios</p>
                            <p className="text-xl font-bold text-green-600">
                              {currentScenarios.filter(s => s.is_active).length}
                            </p>
                          </div>
                          <GitBranch className="w-6 h-6 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Predictions</p>
                            <p className="text-xl font-bold text-blue-600">{currentPredictions.length}</p>
                          </div>
                          <Calculator className="w-6 h-6 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Recommendations</p>
                            <p className="text-xl font-bold text-purple-600">{currentRecommendations.length}</p>
                          </div>
                          <Lightbulb className="w-6 h-6 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Configuration Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Business Context</h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                              {JSON.stringify(selectedConfiguration.business_context, null, 2)}
                            </pre>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Variable Parameters</h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                              {JSON.stringify(selectedConfiguration.variable_parameters, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="scenarios">
                  <ScenarioGenerator
                    configurationId={selectedConfiguration.id}
                    onScenariosGenerated={handleScenariosGenerated}
                    onError={(error) => console.error('Scenario generation error:', error)}
                  />
                </TabsContent>
                
                <TabsContent value="predictions">
                  <PredictionEngine
                    scenarios={currentScenarios}
                    onPredictionsGenerated={handlePredictionsGenerated}
                    predictionTypes={['conversion_rate', 'revenue', 'engagement']}
                    confidenceLevel={0.95}
                  />
                </TabsContent>
                
                <TabsContent value="comparison">
                  <ScenarioComparisonComponent
                    configurationId={selectedConfiguration.id}
                    scenarios={currentScenarios}
                    predictions={currentPredictions}
                    onScenarioSelect={(scenario) => console.log('Selected scenario:', scenario)}
                  />
                </TabsContent>
                
                <TabsContent value="recommendations">
                  <OptimizationRecommendations
                    configurationId={selectedConfiguration.id}
                    recommendations={currentRecommendations}
                    onRecommendationImplement={handleRecommendationSelect}
                    onRecommendationDismiss={(id) => console.log('Dismissed recommendation:', id)}
                  />
                </TabsContent>
                
                <TabsContent value="simulation">
                  <SimulationRunner
                    templateId={selectedConfiguration.template_id}
                    modifications={selectedConfiguration.variable_parameters}
                    onSimulationComplete={(result) => console.log('Simulation result:', result)}
                    onSimulationError={(error) => console.error('Simulation error:', error)}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Configuration Selected</h3>
                <p className="text-gray-600 mb-4">
                  Select a configuration from the sidebar to start scenario modeling and optimization.
                </p>
                <Button
                  onClick={() => setShowConfigBuilder(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create New Configuration
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScenarioModelingDashboard;