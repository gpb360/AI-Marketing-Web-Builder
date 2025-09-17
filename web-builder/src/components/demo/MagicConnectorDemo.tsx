'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Workflow, 
  Target, 
  TrendingUp, 
  Clock, 
  Zap,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Users,
  DollarSign,
  Mail,
  ShoppingCart,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/store/builderStore';
import { useMagicConnector } from '@/hooks/useMagicConnector';
import { ComponentData } from '@/types/builder';

interface MagicConnectorDemoProps {
  className?: string;
}

export function MagicConnectorDemo({ className }: MagicConnectorDemoProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [demoComponents, setDemoComponents] = useState<ComponentData[]>([]);
  
  const { addComponent, clearCanvas, components } = useBuilderStore();
  const { 
    analyzeAllComponents, 
    canvasInsights, 
    analyses, 
    connections,
    connectAllHighPriority,
    generateCanvasReport 
  } = useMagicConnector({ autoAnalyze: true });

  // Demo steps
  const demoSteps = [
    {
      title: "Add Components to Canvas",
      description: "Let's start by adding some common components to see Magic Connector in action",
      action: addDemoComponents,
      icon: Target,
      color: "blue"
    },
    {
      title: "AI Analysis in Progress",
      description: "Magic Connector analyzes each component's purpose and context",
      action: () => analyzeAllComponents(),
      icon: Sparkles,
      color: "purple"
    },
    {
      title: "Workflow Suggestions Generated",
      description: "AI suggests relevant automation workflows for each component",
      action: () => new Promise(resolve => setTimeout(resolve, 2000)),
      icon: Workflow,
      color: "green"
    },
    {
      title: "One-Click Connections",
      description: "Connect high-priority workflow suggestions automatically",
      action: connectAllHighPriority,
      icon: Zap,
      color: "yellow"
    },
    {
      title: "Performance Insights",
      description: "View the impact and optimization recommendations",
      action: generateCanvasReport,
      icon: BarChart3,
      color: "indigo"
    }
  ];

  // Demo component templates
  const componentTemplates = [
    {
      type: 'form',
      name: 'Contact Form',
      props: {
        nameLabel: 'Full Name',
        emailLabel: 'Email Address',
        submitText: 'Get Free Quote'
      },
      position: { x: 100, y: 100 },
      size: { width: 350, height: 200 }
    },
    {
      type: 'button',
      name: 'CTA Button',
      props: {
        text: 'Start Free Trial',
        backgroundColor: '#3B82F6',
        color: '#FFFFFF'
      },
      position: { x: 500, y: 150 },
      size: { width: 200, height: 60 }
    },
    {
      type: 'hero',
      name: 'Hero Section',
      props: {
        title: 'Transform Your Business with AI',
        subtitle: 'Join thousands of companies using our platform to automate their workflows',
        primaryButtonText: 'Get Started',
        secondaryButtonText: 'Watch Demo'
      },
      position: { x: 50, y: 350 },
      size: { width: 600, height: 300 }
    },
    {
      type: 'card',
      name: 'Feature Card',
      props: {
        title: 'Smart Automation',
        description: 'AI-powered workflows that save you time and increase conversions',
        buttonText: 'Learn More'
      },
      position: { x: 750, y: 100 },
      size: { width: 300, height: 250 }
    }
  ];

  async function addDemoComponents() {
    clearCanvas();
    
    for (const template of componentTemplates) {
      const component: ComponentData = {
        id: `demo-${template.type}-${Date.now()}-${Math.random()}`,
        type: template.type,
        name: template.name,
        props: template.props,
        position: template.position,
        size: template.size,
        isConnectedToWorkflow: false
      };
      
      addComponent(component);
      setDemoComponents(prev => [...prev, component]);
      
      // Add small delay for visual effect
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  async function runDemo() {
    setIsRunning(true);
    setCurrentStep(0);

    for (let i = 0; i < demoSteps.length; i++) {
      setCurrentStep(i);
      
      try {
        await demoSteps[i].action();
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error(`Demo step ${i} failed:`, error);
      }
    }

    setIsRunning(false);
  }

  function resetDemo() {
    clearCanvas();
    setDemoComponents([]);
    setCurrentStep(0);
    setIsRunning(false);
  }

  return (
    <div className={cn("p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl", className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-purple-500 rounded-full mr-3">
            <Workflow className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Magic Connector Demo</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Experience the power of AI-driven workflow automation. Watch as Magic Connector 
          analyzes your components and suggests intelligent automation workflows.
        </p>
      </div>

      {/* Demo Controls */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={runDemo}
          disabled={isRunning}
          className={cn(
            "px-6 py-3 rounded-lg font-semibold transition-all flex items-center",
            isRunning 
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl"
          )}
        >
          {isRunning ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Running Demo...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Start Demo
            </>
          )}
        </button>
        
        <button
          onClick={resetDemo}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
        >
          Reset
        </button>
      </div>

      {/* Demo Steps Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {demoSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep && isRunning;
            const isCompleted = index < currentStep || !isRunning;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className={cn(
                  "w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 transition-all",
                  isActive ? `border-${step.color}-500 bg-${step.color}-500 text-white` :
                  isCompleted ? "border-green-500 bg-green-500 text-white" :
                  "border-gray-300 bg-white text-gray-400"
                )}>
                  {isCompleted && !isActive ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <StepIcon className={cn(
                      "w-6 h-6",
                      isActive && "animate-pulse"
                    )} />
                  )}
                </div>
                <div className="text-center">
                  <div className={cn(
                    "text-sm font-medium",
                    isActive ? "text-gray-800" : 
                    isCompleted ? "text-green-600" : "text-gray-500"
                  )}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 max-w-24">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-purple-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: isRunning ? `${(currentStep / (demoSteps.length - 1)) * 100}%` : '0%' 
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Current Step Details */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 mb-8 shadow-lg"
        >
          <div className="flex items-center mb-3">
            <div className={`p-2 bg-${demoSteps[currentStep].color}-100 rounded-lg mr-3`}>
              {React.createElement(demoSteps[currentStep].icon, {
                className: `w-5 h-5 text-${demoSteps[currentStep].color}-600`
              })}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {demoSteps[currentStep].title}
            </h3>
          </div>
          <p className="text-gray-600">{demoSteps[currentStep].description}</p>
        </motion.div>
      )}

      {/* Canvas Insights */}
      {components.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Real-Time Magic Connector Insights
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <InsightCard
              icon={Target}
              label="Total Suggestions"
              value={canvasInsights.totalSuggestions}
              color="blue"
            />
            <InsightCard
              icon={Zap}
              label="High Priority"
              value={canvasInsights.highPrioritySuggestions}
              color="red"
            />
            <InsightCard
              icon={Clock}
              label="Time Saved"
              value={canvasInsights.estimatedTimesSaved}
              color="green"
            />
            <InsightCard
              icon={TrendingUp}
              label="Conversion Boost"
              value={canvasInsights.estimatedConversionIncrease}
              color="purple"
            />
          </div>

          {/* Analysis Details */}
          {analyses.size > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Component Analysis</h4>
              <div className="space-y-3">
                {Array.from(analyses.values()).map(analysis => (
                  <ComponentAnalysisCard key={analysis.componentId} analysis={analysis} />
                ))}
              </div>
            </div>
          )}

          {/* Active Connections */}
          {connections.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Active Connections ({connections.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {connections.map(connection => (
                  <ConnectionCard key={connection.id} connection={connection} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Feature Highlights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon={Sparkles}
          title="AI-Powered Analysis"
          description="Advanced AI analyzes component purpose, context, and user intent"
          gradient="from-purple-500 to-pink-500"
        />
        <FeatureCard
          icon={Workflow}
          title="Smart Suggestions"
          description="Relevant workflow suggestions based on component type and business context"
          gradient="from-blue-500 to-indigo-500"
        />
        <FeatureCard
          icon={Zap}
          title="One-Click Setup"
          description="Connect complex automation workflows with a single click"
          gradient="from-green-500 to-teal-500"
        />
      </div>
    </div>
  );
}

// Helper Components

function InsightCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-center">
      <Icon className={`w-6 h-6 text-${color}-600 mx-auto mb-2`} />
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function ComponentAnalysisCard({ analysis }: { analysis: any }) {
  const priorityColors = {
    high: 'red',
    medium: 'yellow',
    low: 'blue'
  };

  const topSuggestion = analysis.suggestions[0];
  const priority = topSuggestion?.priority || 'low';

  return (
    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className={`w-3 h-3 bg-${priorityColors[priority]}-500 rounded-full mr-3`}></div>
        <div>
          <div className="font-medium text-gray-800">
            Component: {analysis.componentId.split('-')[1] || 'Unknown'}
          </div>
          <div className="text-sm text-gray-600">
            {analysis.suggestions.length} suggestions • {Math.round(analysis.performancePredictions.automationPotential * 100)}% automation potential
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        {analysis.analysis.confidence > 0.8 ? 'High' : 
         analysis.analysis.confidence > 0.6 ? 'Medium' : 'Low'} Confidence
      </div>
    </div>
  );
}

function ConnectionCard({ connection }: { connection: any }) {
  const statusColors = {
    active: 'green',
    connected: 'blue',
    suggested: 'yellow',
    paused: 'gray'
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-gray-800 text-sm">
          {connection.workflowName}
        </div>
        <div className={`px-2 py-1 bg-${statusColors[connection.status]}-100 text-${statusColors[connection.status]}-700 text-xs rounded-full`}>
          {connection.status}
        </div>
      </div>
      <div className="text-xs text-gray-600">
        Trigger: {connection.triggerType} • Confidence: {Math.round(connection.confidence * 100)}%
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  gradient 
}: {
  icon: any;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

export default MagicConnectorDemo;