/**
 * Scenario Configuration Builder Component
 * 
 * This component provides an intuitive interface for creating scenario modeling configurations
 * with comprehensive parameter setup and validation.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Settings,
  Target,
  Users,
  Building,
  TrendingUp,
  DollarSign,
  Calendar,
  Globe,
  Zap,
  Brain,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  type ScenarioModelingConfiguration,
  type ScenarioModelingRequest,
  type ScenarioConfigurationBuilderProps,
  ScenarioType,
  OptimizationObjective
} from '@/lib/types/scenario-modeling';
import { useScenarioModeling } from '@/hooks/useScenarioModeling';
import { cn } from '@/lib/utils';

// Form validation schema
const configurationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  description: z.string().optional(),
  template_id: z.string().min(1, 'Template ID is required'),
  scenario_type: z.nativeEnum(ScenarioType),
  optimization_objective: z.nativeEnum(OptimizationObjective),
  base_configuration: z.record(z.any()).default({}),
  variable_parameters: z.record(z.any()).default({}),
  constraint_parameters: z.record(z.any()).default({}),
  business_context: z.object({
    industry: z.string().optional(),
    business_model: z.string().optional(),
    company_size: z.string().optional(),
    target_market: z.string().optional(),
    marketing_budget: z.number().optional(),
    marketing_maturity: z.string().optional()
  }).default({}),
  target_audience: z.object({
    primary_audience: z.string().optional(),
    age_range: z.string().optional(),
    location: z.string().optional(),
    interests: z.array(z.string()).default([]),
    behavior_patterns: z.array(z.string()).default([])
  }).default({}),
  industry_data: z.object({
    market_size: z.number().optional(),
    growth_rate: z.number().optional(),
    competition_level: z.string().optional(),
    seasonal_factors: z.array(z.number()).default([])
  }).default({})
});

type ConfigurationFormData = z.infer<typeof configurationSchema>;

// Predefined options for dropdowns
const INDUSTRY_OPTIONS = [
  'SaaS', 'E-commerce', 'Healthcare', 'Finance', 'Education', 
  'Real Estate', 'Manufacturing', 'Consulting', 'Nonprofit', 'Other'
];

const BUSINESS_MODEL_OPTIONS = [
  'B2B', 'B2C', 'Marketplace', 'SaaS', 'Subscription', 'E-commerce', 'Service'
];

const COMPANY_SIZE_OPTIONS = [
  'Startup (1-10)', 'Small (11-50)', 'Medium (51-200)', 'Large (201-1000)', 'Enterprise (1000+)'
];

const MARKETING_MATURITY_OPTIONS = [
  'Basic', 'Intermediate', 'Advanced', 'Expert'
];

const COMPETITION_LEVEL_OPTIONS = [
  'Low', 'Medium', 'High', 'Very High'
];

export const ScenarioConfigurationBuilder: React.FC<ScenarioConfigurationBuilderProps> = ({
  templateId,
  onConfigurationCreate,
  onCancel,
  initialValues
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  
  const { actions } = useScenarioModeling();
  
  const form = useForm<ConfigurationFormData>({
    resolver: zodResolver(configurationSchema),
    defaultValues: {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
      template_id: templateId,
      scenario_type: initialValues?.scenario_type || ScenarioType.TEMPLATE_VARIATION,
      optimization_objective: initialValues?.optimization_objective || OptimizationObjective.CONVERSION_RATE,
      base_configuration: initialValues?.base_configuration || {},
      variable_parameters: initialValues?.variable_parameters || {},
      constraint_parameters: initialValues?.constraint_parameters || {},
      business_context: {
        industry: '',
        business_model: '',
        company_size: '',
        target_market: '',
        marketing_budget: undefined,
        marketing_maturity: '',
        ...initialValues?.business_context
      },
      target_audience: {
        primary_audience: '',
        age_range: '',
        location: '',
        interests: [],
        behavior_patterns: [],
        ...initialValues?.target_audience
      },
      industry_data: {
        market_size: undefined,
        growth_rate: undefined,
        competition_level: '',
        seasonal_factors: [],
        ...initialValues?.industry_data
      }
    }
  });

  const watchedValues = form.watch();

  const onSubmit = async (data: ConfigurationFormData) => {
    setIsSubmitting(true);
    setValidationErrors([]);
    
    try {
      // Validate configuration
      const validation = validateConfiguration(data);
      if (!validation.valid) {
        setValidationErrors(validation.errors);
        return;
      }
      
      // Create configuration
      const configuration = await actions.createConfiguration(data as ScenarioModelingRequest);
      onConfigurationCreate(configuration);
      
    } catch (error) {
      console.error('Error creating configuration:', error);
      setValidationErrors(['Failed to create configuration. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const validateConfiguration = (config: ConfigurationFormData) => {
    const errors: string[] = [];
    
    if (!config.name) errors.push('Configuration name is required');
    if (!config.template_id) errors.push('Template ID is required');
    if (!config.scenario_type) errors.push('Scenario type is required');
    if (!config.optimization_objective) errors.push('Optimization objective is required');
    
    // Business context validation
    if (!config.business_context.industry) {
      errors.push('Industry is required for better scenario generation');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  };

  // Dynamic parameter configuration based on scenario type
  const getRecommendedParameters = (scenarioType: ScenarioType) => {
    switch (scenarioType) {
      case ScenarioType.TRAFFIC_VOLUME:
        return {
          variable_parameters: {
            traffic_multiplier: { min: 0.5, max: 3.0, step: 0.1 },
            bounce_rate_adjustment: { min: -0.2, max: 0.2, step: 0.01 }
          },
          description: 'Analyze performance under different traffic volume scenarios'
        };
      case ScenarioType.AUDIENCE_SEGMENT:
        return {
          variable_parameters: {
            segment_conversion_rates: { b2b: 0.15, b2c: 0.08, enterprise: 0.25 },
            segment_engagement: { b2b: 0.3, b2c: 0.2, enterprise: 0.4 }
          },
          description: 'Compare performance across different audience segments'
        };
      case ScenarioType.SEASONAL_VARIATION:
        return {
          variable_parameters: {
            seasonal_multipliers: { q1: 0.9, q2: 1.1, q3: 0.8, q4: 1.3 },
            holiday_effects: { thanksgiving: 1.5, christmas: 2.0, valentine: 1.2 }
          },
          description: 'Model seasonal impact on template performance'
        };
      default:
        return {
          variable_parameters: {},
          description: 'Configure parameters for scenario analysis'
        };
    }
  };

  const recommendedParams = getRecommendedParameters(watchedValues.scenario_type);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Settings className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Scenario Configuration</h2>
          <p className="text-sm text-gray-600">Set up parameters for scenario modeling and optimization</p>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Configuration Errors</h4>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="business">Business Context</TabsTrigger>
              <TabsTrigger value="audience">Target Audience</TabsTrigger>
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-500" />
                    Basic Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Configuration Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 'Holiday Season Optimization'" {...field} />
                        </FormControl>
                        <FormDescription>
                          Choose a descriptive name for this scenario modeling configuration
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the purpose and goals of this scenario modeling configuration..."
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Provide additional context about what you're trying to optimize
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="scenario_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scenario Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select scenario type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(ScenarioType).map(type => (
                                <SelectItem key={type} value={type}>
                                  {type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the primary focus for scenario generation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="optimization_objective"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Optimization Objective *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select objective" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(OptimizationObjective).map(obj => (
                                <SelectItem key={obj} value={obj}>
                                  {obj.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Primary metric to optimize for
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Scenario Type Info */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-2">
                        <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800">Scenario Type: {watchedValues.scenario_type?.replace('_', ' ')}</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            {recommendedParams.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-green-500" />
                    Business Context
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="business_context.industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INDUSTRY_OPTIONS.map(industry => (
                                <SelectItem key={industry} value={industry.toLowerCase()}>
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="business_context.business_model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Model</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select business model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {BUSINESS_MODEL_OPTIONS.map(model => (
                                <SelectItem key={model} value={model.toLowerCase()}>
                                  {model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="business_context.company_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Size</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select company size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {COMPANY_SIZE_OPTIONS.map(size => (
                                <SelectItem key={size} value={size.toLowerCase()}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="business_context.marketing_maturity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marketing Maturity</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select maturity level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MARKETING_MATURITY_OPTIONS.map(level => (
                                <SelectItem key={level} value={level.toLowerCase()}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="business_context.target_market"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Market</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 'North America', 'Global', 'SMBs'" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="business_context.marketing_budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Marketing Budget ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 10000"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audience" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    Target Audience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="target_audience.primary_audience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Audience</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 'Marketing Professionals', 'Small Business Owners'" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="target_audience.age_range"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age Range</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., '25-45', '18-65'" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="target_audience.location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Geographic Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 'United States', 'Europe', 'Global'" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-orange-500" />
                    Market Context
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="industry_data.market_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Market Size ($M)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 1000"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="industry_data.growth_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Growth Rate (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="e.g., 15.5"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="industry_data.competition_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Competition Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {COMPETITION_LEVEL_OPTIONS.map(level => (
                                <SelectItem key={level} value={level.toLowerCase()}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parameters" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Variable Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">
                        Recommended Parameters for {watchedValues.scenario_type?.replace('_', ' ')}
                      </h4>
                      <pre className="text-sm text-yellow-700 whitespace-pre-wrap">
                        {JSON.stringify(recommendedParams.variable_parameters, null, 2)}
                      </pre>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Custom Parameters (JSON)</Label>
                      <Textarea
                        placeholder='Example: {"cta_color": ["blue", "red", "green"], "font_size": {"min": 14, "max": 20}}'
                        className="font-mono text-sm mt-2"
                        rows={6}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value || '{}');
                            form.setValue('variable_parameters', parsed);
                          } catch {
                            // Invalid JSON, don't update
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Define parameters that will vary across scenarios. Use JSON format.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Configuration will be validated before creation</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    Create Configuration
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};