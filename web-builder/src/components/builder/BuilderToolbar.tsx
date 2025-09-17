'use client';

import React, { useState } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { PublishingModal } from './PublishingModal';
import { cn } from '@/lib/utils';
import {
  Save,
  Undo,
  Redo,
  Eye,
  Grid,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Trash2,
  Settings,
  Play,
  Download,
  Share,
  Smartphone,
  Tablet,
  Monitor,
  Globe,
} from 'lucide-react';

type ViewportSize = 'mobile' | 'tablet' | 'desktop';

export function BuilderToolbar() {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isPublishingModalOpen, setIsPublishingModalOpen] = useState(false);

  const {
    components,
    selectedComponentId,
    zoom,
    gridEnabled,
    snapToGrid,
    setZoom,
    toggleGrid,
    toggleSnapToGrid,
    clearCanvas,
    removeComponent,
    duplicateComponent,
    getSelectedComponent,
  } = useBuilderStore();

  const selectedComponent = getSelectedComponent();
  const hasComponents = components.length > 0;
  const hasSelection = selectedComponentId !== null;

  const handleZoomIn = () => setZoom(Math.min(3, zoom + 0.25));
  const handleZoomOut = () => setZoom(Math.max(0.25, zoom - 0.25));
  const handleResetZoom = () => setZoom(1);

  const handleSave = () => {
    // TODO: Implement actual save functionality
    const siteData = {
      components,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
    
    // Save to localStorage for now
    localStorage.setItem('builder-project', JSON.stringify(siteData));
    
    // Show success feedback
    console.log('Project saved successfully!', siteData);
  };

  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handleExport = () => {
    // Generate HTML export
    const htmlContent = generateHTMLExport();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-site.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateHTMLExport = () => {
    const componentHTML = components.map(component => 
      `<div class="component" data-type="${component.type}" style="position: absolute; left: ${component.position.x}px; top: ${component.position.y}px; width: ${component.size.width}px; height: ${component.size.height}px;">
        ${component.props?.content || `${component.type} component`}
      </div>`
    ).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Site</title>
    <style>
        body { margin: 0; font-family: Arial, sans-serif; }
        .component { border: 1px solid #ccc; padding: 10px; }
    </style>
</head>
<body>
    <div class="site-container">
        ${componentHTML}
    </div>
</body>
</html>`;
  };

  const handleShare = () => {
    // Generate shareable link
    const shareData = {
      components,
      metadata: {
        title: 'My Awesome Site',
        created: new Date().toISOString(),
      }
    };
    
    // Generate a shareable URL (in real implementation, this would be saved to backend)
    const shareId = btoa(JSON.stringify(shareData)).substring(0, 12);
    const shareUrl = `${window.location.origin}/preview/${shareId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      console.log('Share URL copied to clipboard:', shareUrl);
    });
  };

  const handleDeleteSelected = () => {
    if (selectedComponentId) {
      removeComponent(selectedComponentId);
    }
  };

  const handleDuplicateSelected = () => {
    if (selectedComponentId) {
      duplicateComponent(selectedComponentId);
    }
  };

  const handlePublish = () => {
    setIsPublishingModalOpen(true);
  };

  const viewportConfigs = {
    mobile: { width: '375px', icon: Smartphone, label: 'Mobile' },
    tablet: { width: '768px', icon: Tablet, label: 'Tablet' },
    desktop: { width: '100%', icon: Monitor, label: 'Desktop' },
  };

  return (
    <>
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        {/* Left Section - File Operations */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            title="Save project to local storage"
          >
            <Save className="w-4 h-4" />
            <span className="text-sm font-medium">Save</span>
          </button>

          <div className="w-px h-6 bg-gray-300" />

          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Undo (Not implemented)"
            disabled
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Redo (Not implemented)"
            disabled
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Center Section - Viewport Controls */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          {Object.entries(viewportConfigs).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setViewport(key as ViewportSize)}
                className={cn(
                  "flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200",
                  viewport === key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
                title={config.label}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Section - Tools */}
        <div className="flex items-center space-x-2">
          {/* Canvas Tools */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={toggleGrid}
              className={cn(
                "p-2 rounded-md transition-colors duration-200",
                gridEnabled
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              )}
              title="Toggle Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors duration-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleResetZoom}
              className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors duration-200 min-w-[3rem]"
              title="Reset Zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors duration-200"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Selection Tools */}
          {hasSelection && (
            <>
              <button
                onClick={handleDuplicateSelected}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="Duplicate Selected"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteSelected}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Delete Selected"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300" />
            </>
          )}

          {/* Canvas Actions */}
          {hasComponents && (
            <button
              onClick={clearCanvas}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Clear Canvas"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <div className="w-px h-6 bg-gray-300" />

          {/* Preview & Export */}
          <button
            onClick={handlePreview}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200",
              isPreviewMode
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            title="Toggle Preview Mode"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isPreviewMode ? 'Edit' : 'Preview'}
            </span>
          </button>

          <button
            onClick={handleExport}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Export as HTML"
            disabled={!hasComponents}
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Generate Shareable Link"
            disabled={!hasComponents}
          >
            <Share className="w-4 h-4" />
          </button>

          {/* Publish Button - Primary Action */}
          <button
            onClick={handlePublish}
            disabled={!hasComponents}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
              hasComponents
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
            title={hasComponents ? "Publish your site live" : "Add components before publishing"}
          >
            <Globe className="w-4 h-4" />
            <span>Publish</span>
          </button>

          <button
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Publishing Modal */}
      <PublishingModal
        isOpen={isPublishingModalOpen}
        onClose={() => setIsPublishingModalOpen(false)}
      />
    </>
  );
}