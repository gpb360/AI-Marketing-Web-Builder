/**
 * Builder Components Index
 * 
 * Centralized exports for all builder components
 */

// Core builder components
export { BuilderToolbar } from './BuilderToolbar';
export { Canvas } from './Canvas';
export { CanvasComponent } from './CanvasComponent';
export { ComponentPalette } from './ComponentPalette';
export { ComponentRenderer } from './ComponentRenderer';
export { EnhancedCanvas } from './EnhancedCanvas';
export { EnhancedComponentRenderer } from './EnhancedComponentRenderer';
export { VisualBuilder } from './VisualBuilder';

// Drag and drop functionality
export { DragHandles } from './DragHandles';
export { DropZone } from './DropZone';
export { ResizeHandles } from './ResizeHandles';
export { SimpleResizeHandles } from './SimpleResizeHandles';
export { SelectionBox } from './SelectionBox';
export { GridOverlay } from './GridOverlay';

// Workflow and debugging components
export { WorkflowDebuggingPanel } from './WorkflowDebuggingPanel';
export { WorkflowConnector } from './WorkflowConnector';
export { WorkflowStatusOverlay } from './WorkflowStatusOverlay';
export { ExecutionTimeline } from './ExecutionTimeline';
export { ErrorDetailsModal } from './ErrorDetailsModal';
export { RemediationControlPanel } from './RemediationControlPanel';

// Analytics and monitoring
export { SLADashboard } from './SLADashboard';
export { ThresholdOptimizationPanel } from './ThresholdOptimizationPanel';
export { PredictionCard } from './PredictionCard';

// AI and customization
export { AICustomizationPanel } from './AICustomizationPanel';

// Epic 1: Context-aware template components (Story 1.3)
export { BusinessContextAnalyzer } from './BusinessContextAnalyzer';
export { ContextAwareTemplateSelector } from './ContextAwareTemplateSelector';
export { ContextualRecommendations } from './ContextualRecommendations';
export { TemplatePersonalization } from './TemplatePersonalization';
export { RecommendationCard } from './RecommendationCard';
export { TemplatePreviewModal } from './TemplatePreviewModal';

// Story 1.3: Template Personalization Sub-components
export { ColorSchemePanel } from './ColorSchemePanel';
export { ContentCustomizationPanel } from './ContentCustomizationPanel';
export { TypographyPanel } from './TypographyPanel';
export { TemplatePreview } from './TemplatePreview';

// Enhanced exports for Story 1.3
export { default as ContextAwareTemplateSelectorDefault } from './ContextAwareTemplateSelector';
export { default as ContextualRecommendationsDefault } from './ContextualRecommendations';
export { default as TemplatePersonalizationDefault } from './TemplatePersonalization';

// Type definitions for Epic 1
export type {
  BusinessContextAnalyzerProps,
  ContextAwareTemplateSelectorProps,
  ContextualRecommendationsProps,
  TemplatePersonalizationProps,
  ColorSchemePanelProps,
  ContentCustomizationPanelProps,
  TypographyPanelProps,
  TemplatePreviewProps,
  BusinessAnalysisResult,
  TemplateRecommendation,
  ContextualRecommendation,
  PersonalizedTemplate,
  PersonalizationSettings,
  TemplateCustomization,
  TemplatePreview,
  CustomizedTemplate,
  Template,
  RecommendationReasoning,
  PersonalizationSuggestion,
  BusinessGoalAlignment,
  BrandColors,
  Typography,
  ContentPreferences,
  LayoutPreferences,
  InteractiveElements
} from '@/types/context-aware-templates';

// Collaboration
export { CollaborativeBuilder } from './CollaborativeBuilder';

// Utilities and editors
export { TextEditor } from './TextEditor';
export { ColorPicker } from './ColorPicker';
export { QuickSettings } from './QuickSettings';

// Demos and examples
export { Demo } from './Demo';
export { ContainerDemo } from './ContainerDemo';
export { SimpleContainer } from './SimpleContainer';