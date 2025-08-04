import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Template } from '@/store/builderStore';
import { Container } from './core/Container';
import { Header } from './core/Header';
import { Footer } from './core/Footer';
import { Hero } from './core/Hero';
import { TextSection } from './core/TextSection';
import { Form } from './core/Form';
import { Grid } from './core/Grid';
import { Card } from './core/Card';
import { Navigation } from './core/Navigation';
import { Button } from './core/Button';
import { Loader2, AlertCircle, CheckCircle, Palette, Settings } from 'lucide-react';

interface TemplateSystemProps {
  template: Template;
  className?: string;
  variant?: 'preview' | 'edit' | 'production';
  customization?: {
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
    spacing?: Record<string, string>;
    animations?: boolean;
  };
  onComponentClick?: (componentId: string) => void;
  onComponentHover?: (componentId: string | null) => void;
  loading?: boolean;
  error?: string | null;
}

interface ComponentRenderCache {
  [key: string]: React.ReactElement | null;
}

export const TemplateSystem: React.FC<TemplateSystemProps> = ({ 
  template,
  className = '',
  variant = 'production',
  customization = {},
  onComponentClick,
  onComponentHover,
  loading = false,
  error = null
}) => {
  const [renderCache, setRenderCache] = useState<ComponentRenderCache>({});
  const [loadingComponents, setLoadingComponents] = useState(new Set<string>());
  const [errorComponents, setErrorComponents] = useState(new Set<string>());
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  // Apply customization theme
  const themeStyles = useMemo(() => {
    const { colors = {}, fonts = {}, spacing = {} } = customization;
    return {
      '--template-primary': colors.primary || '#3b82f6',
      '--template-secondary': colors.secondary || '#6b7280',
      '--template-accent': colors.accent || '#f59e0b',
      '--template-background': colors.background || '#ffffff',
      '--template-text': colors.text || '#1f2937',
      '--template-font-primary': fonts.primary || 'Inter, sans-serif',
      '--template-font-secondary': fonts.secondary || 'Inter, sans-serif',
      '--template-spacing-sm': spacing.sm || '0.5rem',
      '--template-spacing-md': spacing.md || '1rem',
      '--template-spacing-lg': spacing.lg || '2rem',
    } as React.CSSProperties;
  }, [customization]);

  const renderComponent = (component: any): React.ReactElement | null => {
    // Check cache first
    if (renderCache[component.id]) {
      return renderCache[component.id];
    }

    const commonProps = {
      key: component.id,
      id: component.id,
      styles: {
        ...component.styles,
        ...(customization.colors && {
          color: component.styles?.color?.replace(/rgb\([^)]+\)/, `var(--template-text)`),
          backgroundColor: component.styles?.backgroundColor?.replace(/rgb\([^)]+\)/, `var(--template-background)`),
        }),
      },
      props: component.props || {},
      className: `${component.className || ''} ${variant === 'edit' ? 'template-editable' : ''}`,
      onClick: variant === 'edit' ? () => onComponentClick?.(component.id) : undefined,
      onMouseEnter: variant === 'edit' ? () => {
        setHoveredComponent(component.id);
        onComponentHover?.(component.id);
      } : undefined,
      onMouseLeave: variant === 'edit' ? () => {
        setHoveredComponent(null);
        onComponentHover?.(null);
      } : undefined,
    };

    // Add hover effects for edit mode
    if (variant === 'edit' && hoveredComponent === component.id) {
      commonProps.className += ' template-component-hovered';
    }

    try {
      let renderedComponent: React.ReactElement | null = null;

      switch (component.type) {
        case 'container':
          renderedComponent = (
            <Container {...commonProps}>
              {component.children?.map((childId: string) => {
                const child = template.components.find((c: any) => c.id === childId);
                return child ? renderComponent(child) : null;
              })}
            </Container>
          );
          break;
        
        case 'navigation':
          renderedComponent = <Navigation {...commonProps} />;
          break;
        
        case 'header':
          renderedComponent = <Header {...commonProps} />;
          break;
        
        case 'footer':
          renderedComponent = <Footer {...commonProps} />;
          break;
        
        case 'hero':
          renderedComponent = <Hero {...commonProps} />;
          break;
        
        case 'text':
          renderedComponent = <TextSection {...commonProps} content={component.content} />;
          break;
        
        case 'form':
          renderedComponent = <Form {...commonProps} />;
          break;
        
        case 'grid':
          renderedComponent = (
            <Grid {...commonProps}>
              {component.children?.map((childId: string) => {
                const child = template.components.find((c: any) => c.id === childId);
                return child ? renderComponent(child) : null;
              })}
            </Grid>
          );
          break;
        
        case 'card':
          renderedComponent = <Card {...commonProps} content={component.content} />;
          break;
        
        case 'button':
          renderedComponent = <Button {...commonProps} content={component.content} />;
          break;
        
        default:
          // Custom component fallback
          renderedComponent = (
            <div 
              key={component.id} 
              style={commonProps.styles || {}}
              className={`template-custom-component ${commonProps.className}`}
              onClick={commonProps.onClick}
              onMouseEnter={commonProps.onMouseEnter}
              onMouseLeave={commonProps.onMouseLeave}
            >
              {component.content || (
                <div className="p-4 bg-gray-100 rounded-lg text-center">
                  <div className="text-gray-500 text-sm">
                    Unknown component: {component.type}
                  </div>
                </div>
              )}
            </div>
          );
      }

      // Cache the rendered component
      setRenderCache(prev => ({
        ...prev,
        [component.id]: renderedComponent
      }));

      return renderedComponent;

    } catch (error) {
      console.error(`Error rendering component ${component.id}:`, error);
      
      // Add to error set
      setErrorComponents(prev => new Set([...prev, component.id]));

      // Return error component
      const errorComponent = (
        <div 
          key={component.id}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              Failed to render component: {component.type}
            </span>
          </div>
          {variant === 'edit' && (
            <div className="mt-2 text-xs text-red-600">
              Component ID: {component.id}
            </div>
          )}
        </div>
      );

      setRenderCache(prev => ({
        ...prev,
        [component.id]: errorComponent
      }));

      return errorComponent;
    }
  };

  // Clear cache when template changes
  useEffect(() => {
    setRenderCache({});
    setLoadingComponents(new Set());
    setErrorComponents(new Set());
  }, [template.id]);

  // Loading state
  if (loading) {
    return (
      <div className={`template-system template-loading ${className}`}>
        <div className="flex items-center justify-center min-h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <div className="text-lg font-semibold text-gray-700 mb-2">
              Loading Template
            </div>
            <div className="text-sm text-gray-500">
              Preparing {template.name}...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`template-system template-error ${className}`}>
        <div className="flex items-center justify-center min-h-64 bg-red-50 rounded-lg border border-red-200">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <div className="text-lg font-semibold text-red-700 mb-2">
              Template Load Error
            </div>
            <div className="text-sm text-red-600 mb-4">
              {error}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const rootComponents = template.components.filter((c: any) => !c.parentId);

  return (
    <div 
      className={`template-system template-variant-${variant} ${className}`}
      style={themeStyles}
    >
      {/* Template Status Bar (Edit Mode) */}
      {variant === 'edit' && (
        <div className="template-status-bar bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-medium">{template.name}</span>
            </div>
            
            <div className="text-gray-500">
              {template.components.length} components
            </div>
            
            {errorComponents.size > 0 && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{errorComponents.size} errors</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {customization && Object.keys(customization).length > 0 && (
              <div className="flex items-center gap-1 text-blue-600">
                <Palette className="w-4 h-4" />
                <span>Customized</span>
              </div>
            )}
            
            <button className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* Template Content */}
      <div className="template-content">
        <AnimatePresence mode="wait">
          {customization.animations !== false ? (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.3,
                staggerChildren: 0.1
              }}
            >
              {rootComponents.map((component: any) => (
                <motion.div
                  key={component.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderComponent(component)}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div key={template.id}>
              {rootComponents.map((component: any) => renderComponent(component))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Template Styles */}
      <style jsx>{`
        .template-system {
          position: relative;
          width: 100%;
          min-height: 100%;
        }

        .template-variant-edit .template-editable {
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .template-variant-edit .template-editable:hover {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        .template-component-hovered {
          background-color: rgba(59, 130, 246, 0.05) !important;
        }

        .template-variant-preview {
          pointer-events: none;
        }

        .template-variant-production {
          /* Production-specific styles */
        }

        .template-custom-component {
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .template-loading,
        .template-error {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .template-status-bar {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};