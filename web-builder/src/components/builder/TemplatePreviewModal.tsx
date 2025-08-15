/**
 * Template Preview Modal Component
 * 
 * Modal component for previewing templates with different device views
 * Part of Story 1.3: Frontend Context-Aware Template Integration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  X,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Zap,
  Star,
  TrendingUp,
  Clock,
  Users,
  Eye,
  Maximize2,
  RefreshCw
} from 'lucide-react';

import { Template, BusinessAnalysisResult } from '@/types/context-aware-templates';

interface TemplatePreviewModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: () => void;
  businessContext?: BusinessAnalysisResult;
  className?: string;
}

type DeviceView = 'desktop' | 'tablet' | 'mobile';

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  onSelect,
  businessContext,
  className = ''
}) => {
  const [currentDevice, setCurrentDevice] = useState<DeviceView>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentDevice('desktop');
      setImageError(false);
      setIsLoading(true);
      // Simulate loading time
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, [isOpen]);

  if (!template) return null;

  const deviceConfigs = [
    {
      id: 'desktop' as DeviceView,
      name: 'Desktop',
      icon: Monitor,
      dimensions: 'w-full h-96',
      description: '1200px+',
      active: currentDevice === 'desktop'
    },
    {
      id: 'tablet' as DeviceView,
      name: 'Tablet',
      icon: Tablet,
      dimensions: 'w-3/4 h-96 mx-auto',
      description: '768px',
      active: currentDevice === 'tablet'
    },
    {
      id: 'mobile' as DeviceView,
      name: 'Mobile',
      icon: Smartphone,
      dimensions: 'w-1/2 h-96 mx-auto',
      description: '375px',
      active: currentDevice === 'mobile'
    }
  ];

  const getPreviewUrl = (device: DeviceView) => {
    // In a real app, this would return device-specific preview URLs
    return template.preview_url;
  };

  const handleDeviceChange = (device: DeviceView) => {
    setCurrentDevice(device);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleExternalPreview = () => {
    window.open(template.preview_url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {template.name}
                  </DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                    {businessContext && (
                      <Badge variant="secondary" className="text-xs">
                        {businessContext.industry_classification.primary}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleExternalPreview}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Full
                </Button>
                <Button
                  onClick={onSelect}
                  size="sm"
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Zap className="h-4 w-4" />
                  Select Template
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Device Selector */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
                Preview:
              </span>
              {deviceConfigs.map((device) => {
                const IconComponent = device.icon;
                return (
                  <Button
                    key={device.id}
                    onClick={() => handleDeviceChange(device.id)}
                    variant={device.active ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline">{device.name}</span>
                    <span className="text-xs text-gray-500 hidden md:inline">
                      ({device.description})
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 overflow-auto">
            <div className="h-full flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Loading {currentDevice} preview...
                  </p>
                </div>
              ) : (
                <div className="w-full h-full max-w-7xl">
                  <Card className={`${deviceConfigs.find(d => d.id === currentDevice)?.dimensions} bg-white dark:bg-gray-800 shadow-xl overflow-hidden relative`}>
                    {/* Mock Browser Bar for Desktop */}
                    {currentDevice === 'desktop' && (
                      <div className="h-8 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex items-center px-3 gap-2">
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="flex-1 flex justify-center">
                          <div className="bg-white dark:bg-gray-800 rounded px-3 py-1 text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate">
                            {template.preview_url}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Preview Frame */}
                    <div className="h-full bg-white dark:bg-gray-800 relative">
                      {!imageError && template.thumbnail ? (
                        <img
                          src={template.thumbnail}
                          alt={`${template.name} preview`}
                          className="w-full h-full object-cover object-top"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        /* Fallback Mock Preview */
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-6 flex flex-col">
                          {/* Mock Header */}
                          <div className="flex items-center justify-between mb-8">
                            <div className="h-8 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            <div className="flex gap-2">
                              <div className="h-6 w-16 bg-blue-500 rounded"></div>
                              <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            </div>
                          </div>

                          {/* Mock Hero Section */}
                          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                            <div className="space-y-4">
                              <div className="h-12 w-3/4 bg-gray-800 dark:bg-gray-200 rounded mx-auto"></div>
                              <div className="h-6 w-full bg-gray-600 dark:bg-gray-400 rounded"></div>
                              <div className="h-6 w-2/3 bg-gray-600 dark:bg-gray-400 rounded mx-auto"></div>
                            </div>
                            <div className="flex gap-3">
                              <div className="h-10 w-32 bg-blue-500 rounded"></div>
                              <div className="h-10 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            </div>
                          </div>

                          {/* Mock Feature Cards */}
                          <div className="grid grid-cols-3 gap-4 mt-8">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="bg-white dark:bg-gray-700 rounded-lg p-4 space-y-3">
                                <div className="h-6 w-6 bg-blue-500 rounded"></div>
                                <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
                                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-500 rounded"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Device Frame Overlay */}
                      {currentDevice === 'mobile' && (
                        <div className="absolute inset-0 border-8 border-gray-800 rounded-3xl pointer-events-none"></div>
                      )}
                      {currentDevice === 'tablet' && (
                        <div className="absolute inset-0 border-4 border-gray-700 rounded-2xl pointer-events-none"></div>
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* Footer with Template Info */}
          {template.description && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {template.description}
                  </p>
                  
                  {template.features && template.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.features.slice(0, 5).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {template.features.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.features.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 ml-6">
                  {businessContext && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Match Score</div>
                      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                        92%
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={onSelect}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Zap className="h-4 w-4" />
                    Select Template
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreviewModal;