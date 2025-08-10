/**
 * Scenario Generator Component
 * 
 * This component provides an interface for generating diverse scenarios
 * for template configuration optimization.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GitBranch,
  Zap,
  Settings,
  Brain,
  Play,
  CheckCircle,
  AlertCircle,
  Layers,
  TrendingUp,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

import {
  type ScenarioGeneratorProps,
  type ScenarioGenerationRequest,
  type ScenarioModel
} from '@/lib/types/scenario-modeling';
import { useScenarioModeling } from '@/hooks/useScenarioModeling';

export const ScenarioGenerator: React.FC<ScenarioGeneratorProps> = ({
  configurationId,
  onScenariosGenerated,
  onError
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationParams, setGenerationParams] = useState({
    numberOfScenarios: 5,
    scenarioDiversity: 0.7,
    includeBaseline: true,
    optimizationFocus: [] as string[]
  });
  const [generatedScenarios, setGeneratedScenarios] = useState<ScenarioModel[]>([]);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  
  const { actions, state } = useScenarioModeling();
  
  const handleGenerateScenarios = useCallback(async () => {
    setIsGenerating(true);
    setGenerationStatus('generating');
    
    try {
      const request: ScenarioGenerationRequest = {
        configuration_id: configurationId,
        number_of_scenarios: generationParams.numberOfScenarios,
        scenario_diversity: generationParams.scenarioDiversity,
        include_baseline: generationParams.includeBaseline,
        optimization_focus: generationParams.optimizationFocus
      };
      
      const scenarios = await actions.generateScenarios(request);
      
      setGeneratedScenarios(scenarios);
      setGenerationStatus('success');
      onScenariosGenerated(scenarios);
      
    } catch (error) {
      console.error('Scenario generation failed:', error);
      setGenerationStatus('error');
      onError?.(error instanceof Error ? error.message : 'Failed to generate scenarios');
    } finally {
      setIsGenerating(false);
    }
  }, [configurationId, generationParams, actions, onScenariosGenerated, onError]);
  
  const existingScenarios = state.scenarios[configurationId] || [];
  
  const toggleOptimizationFocus = (focus: string) => {
    setGenerationParams(prev => ({
      ...prev,
      optimizationFocus: prev.optimizationFocus.includes(focus)
        ? prev.optimizationFocus.filter(f => f !== focus)
        : [...prev.optimizationFocus, focus]
    }));
  };
  
  const focusOptions = [
    { id: 'conversion', label: 'Conversion Rate', icon: Target },
    { id: 'engagement', label: 'User Engagement', icon: TrendingUp },
    { id: 'performance', label: 'Page Performance', icon: Zap },
    { id: 'mobile', label: 'Mobile Optimization', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-500" />
            Scenario Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Number of Scenarios</Label>
                <div className="mt-2">
                  <Slider
                    value={[generationParams.numberOfScenarios]}
                    onValueChange={([value]) => setGenerationParams(prev => ({ ...prev, numberOfScenarios: value }))}
                    min={3}
                    max={15}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>3</span>
                    <span className="font-medium">{generationParams.numberOfScenarios}</span>
                    <span>15</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Scenario Diversity</Label>
                <div className="mt-2">
                  <Slider
                    value={[generationParams.scenarioDiversity]}
                    onValueChange={([value]) => setGenerationParams(prev => ({ ...prev, scenarioDiversity: value }))}
                    min={0.3}
                    max={1.0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Conservative</span>
                    <span className="font-medium">{Math.round(generationParams.scenarioDiversity * 100)}%</span>
                    <span>Diverse</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeBaseline"
                  checked={generationParams.includeBaseline}
                  onChange={(e) => setGenerationParams(prev => ({ ...prev, includeBaseline: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="includeBaseline">Include baseline scenario</Label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Optimization Focus</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {focusOptions.map(option => {
                    const Icon = option.icon;
                    const isSelected = generationParams.optimizationFocus.includes(option.id);
                    
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleOptimizationFocus(option.id)}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border text-left transition-colors",
                          isSelected
                            ? "border-blue-300 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Generate Button */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              {existingScenarios.length > 0 && (
                <span>{existingScenarios.length} existing scenarios found</span>
              )}
            </div>
            
            <Button
              onClick={handleGenerateScenarios}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Generate Scenarios
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Generation Status */}
      {generationStatus !== 'idle' && (
        <Card className={cn(
          "border",
          generationStatus === 'success' && "border-green-200 bg-green-50",
          generationStatus === 'error' && "border-red-200 bg-red-50",
          generationStatus === 'generating' && "border-blue-200 bg-blue-50"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {generationStatus === 'generating' && (
                <>
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-blue-700">Generating scenarios using AI analysis...</span>
                </>
              )}
              {generationStatus === 'success' && (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700">
                    Successfully generated {generatedScenarios.length} scenarios
                  </span>
                </>
              )}
              {generationStatus === 'error' && (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700">Failed to generate scenarios</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Generated Scenarios */}
      {(generatedScenarios.length > 0 || existingScenarios.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-500" />
              Scenarios ({existingScenarios.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {existingScenarios.map((scenario, index) => (
                <div 
                  key={scenario.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      scenario.is_baseline 
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    )}>
                      {scenario.is_baseline ? 'B' : index + 1}
                    </div>
                    
                    <div>
                      <h4 className="font-medium">{scenario.name}</h4>
                      <p className="text-sm text-gray-600 truncate max-w-md">
                        {scenario.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {scenario.is_baseline && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Baseline
                      </Badge>
                    )}
                    
                    {scenario.confidence_score && (
                      <Badge variant="secondary">
                        {Math.round(scenario.confidence_score * 100)}% confidence
                      </Badge>
                    )}
                    
                    <Badge 
                      variant={scenario.is_active ? "default" : "secondary"}
                      className={scenario.is_active ? "bg-blue-600" : ""}
                    >
                      {scenario.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {existingScenarios.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <GitBranch className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No scenarios generated yet</p>
                  <p className="text-xs text-gray-400 mt-1">Use the controls above to generate scenarios</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* AI Insights */}
      {existingScenarios.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Brain className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h4 className="font-semibold text-purple-900 mb-2">AI Insights</h4>
                <div className="space-y-2 text-sm text-purple-800">
                  <p>
                    • Generated <strong>{existingScenarios.length}</strong> scenarios with 
                    <strong>{Math.round(generationParams.scenarioDiversity * 100)}%</strong> diversity
                  </p>
                  <p>
                    • <strong>{existingScenarios.filter(s => s.is_active).length}</strong> scenarios are currently active for analysis
                  </p>
                  {generationParams.includeBaseline && (
                    <p>
                      • Baseline scenario included for performance comparison
                    </p>
                  )}
                  {generationParams.optimizationFocus.length > 0 && (
                    <p>
                      • Focused on: <strong>{generationParams.optimizationFocus.join(', ')}</strong> optimization
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};