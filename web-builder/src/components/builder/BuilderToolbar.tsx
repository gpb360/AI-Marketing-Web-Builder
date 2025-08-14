'use client';

import React, { useState } from 'react';
import { useBuilderStore } from '@/store/builderStore';
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
} from 'lucide-react';

type ViewportSize = 'mobile' | 'tablet' | 'desktop';

export function BuilderToolbar() {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

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
    // Implement save functionality
    console.log('Saving project...', { components });
  };

  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting project...');
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing project...');
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

  const viewportConfigs = {
    mobile: { width: '375px', icon: Smartphone, label: 'Mobile' },
    tablet: { width: '768px', icon: Tablet, label: 'Tablet' },
    desktop: { width: '100%', icon: Monitor, label: 'Desktop' },
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Left Section - File Operations */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          <Save className="w-4 h-4" />
          <span className="text-sm font-medium">Save</span>
        </button>

        <div className="w-px h-6 bg-gray-300" />

        <button
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="Redo"
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
        >
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isPreviewMode ? 'Edit' : 'Preview'}
          </span>
        </button>

        <button
          onClick={handleExport}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="Export"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={handleShare}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="Share"
        >
          <Share className="w-4 h-4" />
        </button>

        <button
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}