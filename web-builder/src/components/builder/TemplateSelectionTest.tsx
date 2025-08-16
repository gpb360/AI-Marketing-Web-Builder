'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TemplateSelectionInterface from './TemplateSelectionInterface';
import TemplateSelectionPanel from './TemplateSelectionPanel';
import { useTemplateSelection } from '@/hooks/useTemplateSelection';
import { useBuilderStore } from '@/store/builderStore';
import { 
  Sparkles, 
  Grid3X3, 
  Eye, 
  Play, 
  Settings,
  BookOpen,
  Heart,
  TrendingUp,
  Zap,
  Monitor,
  AlertCircle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

const TemplateSelectionTest: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [testMode, setTestMode] = useState<'interface' | 'panel' | 'hook'>('interface');
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }>>([]);

  const { currentTemplate, canvasComponents } = useBuilderStore();
  const { state, actions, analytics } = useTemplateSelection();

  // Add notification helper
  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev].slice(0, 5));
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const handleTemplateApply = async (templateId: string) => {
    try {
      addNotification('info', `Applying template: ${templateId}`);
      await actions.applyTemplate(templateId);
      addNotification('success', 'Template applied successfully!');
    } catch (error) {
      addNotification('error', `Failed to apply template: ${error}`);
    }
  };

  const testActions = [
    {
      name: 'Apply Premium SaaS Template',
      action: () => handleTemplateApply('premium-saas-landing-1'),
      icon: Zap,
      color: 'blue'
    },
    {
      name: 'Apply Hero Landing Template',
      action: () => handleTemplateApply('landing-hero-1'),
      icon: Sparkles,
      color: 'purple'
    },
    {
      name: 'Toggle Favorite (Premium SaaS)',
      action: () => {
        actions.toggleFavorite('premium-saas-landing-1');
        addNotification('info', 'Favorite toggled');
      },
      icon: Heart,
      color: 'pink'
    },
    {
      name: 'Search "Modern"',
      action: () => {
        actions.setSearchTerm('modern');
        addNotification('info', 'Search term set to "modern"');
      },
      icon: Eye,
      color: 'green'
    },
    {
      name: 'Filter by SaaS Category',
      action: () => {
        actions.setCategory('landing');
        addNotification('info', 'Category set to "landing"');
      },
      icon: Grid3X3,
      color: 'orange'
    },
    {
      name: 'Clear All Filters',
      action: () => {
        actions.clearFilters();
        addNotification('info', 'All filters cleared');
      },
      icon: Settings,
      color: 'gray'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-500" />
              Template Selection Test Suite
            </h1>
            <p className="text-gray-600 mt-1">
              Test and demonstrate the enhanced template selection interface
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Test Mode Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { value: 'interface', label: 'Interface', icon: Monitor },
                { value: 'panel', label: 'Panel', icon: BookOpen },
                { value: 'hook', label: 'Hook', icon: Settings }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTestMode(value as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    testMode === value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowPanel(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Open Panel
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Controls & Analytics */}
        <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
          {/* Current Status */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Current Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active Template:</span>
                <span className="font-medium">
                  {currentTemplate ? currentTemplate.name : 'None'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Canvas Components:</span>
                <span className="font-medium">{canvasComponents.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Loading:</span>
                <span className={`font-medium ${state.isLoading ? 'text-blue-600' : 'text-gray-900'}`}>
                  {state.isLoading ? 'Yes' : 'No'}
                </span>
              </div>
              {state.error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {state.error}
                </div>
              )}
            </div>
          </div>

          {/* Analytics */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Analytics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{analytics.totalTemplates}</div>
                <div className="text-xs text-blue-800">Total Templates</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">{analytics.filteredCount}</div>
                <div className="text-xs text-green-800">Filtered</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-600">{analytics.favoriteCount}</div>
                <div className="text-xs text-purple-800">Favorites</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-600">{analytics.recentCount}</div>
                <div className="text-xs text-orange-800">Recent</div>
              </div>
            </div>
          </div>

          {/* Filter State */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Current Filters</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Search Term:</span>
                <span className="font-medium">
                  {state.searchTerm || 'None'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium capitalize">{state.selectedCategory}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sort By:</span>
                <span className="font-medium capitalize">{state.sortBy}</span>
              </div>
            </div>
          </div>

          {/* Test Actions */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Test Actions</h3>
            <div className="space-y-2">
              {testActions.map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.action}
                  className={`w-full p-3 text-left rounded-lg border transition-all hover:shadow-sm flex items-center gap-3 ${
                    action.color === 'blue' ? 'border-blue-200 hover:border-blue-300 hover:bg-blue-50' :
                    action.color === 'purple' ? 'border-purple-200 hover:border-purple-300 hover:bg-purple-50' :
                    action.color === 'pink' ? 'border-pink-200 hover:border-pink-300 hover:bg-pink-50' :
                    action.color === 'green' ? 'border-green-200 hover:border-green-300 hover:bg-green-50' :
                    action.color === 'orange' ? 'border-orange-200 hover:border-orange-300 hover:bg-orange-50' :
                    'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <action.icon className={`w-4 h-4 ${
                    action.color === 'blue' ? 'text-blue-500' :
                    action.color === 'purple' ? 'text-purple-500' :
                    action.color === 'pink' ? 'text-pink-500' :
                    action.color === 'green' ? 'text-green-500' :
                    action.color === 'orange' ? 'text-orange-500' :
                    'text-gray-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-900">
                    {action.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {testMode === 'interface' && (
            <TemplateSelectionInterface
              onTemplateApply={handleTemplateApply}
              showCategories={true}
              showPreview={true}
              className="h-screen"
            />
          )}

          {testMode === 'panel' && (
            <div className="p-6">
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Panel Test Mode
                </h3>
                <p className="text-gray-600 mb-6">
                  The template selection panel is designed to be used as an overlay.
                  Click the "Open Panel" button in the header to test the panel functionality.
                </p>
                <button
                  onClick={() => setShowPanel(true)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Play className="w-5 h-5" />
                  Open Template Panel
                </button>
              </div>
            </div>
          )}

          {testMode === 'hook' && (
            <div className="p-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Hook Test Mode
                </h3>
                <div className="space-y-6">
                  {/* Hook State Display */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Hook State</h4>
                    <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                      {JSON.stringify({
                        isLoading: state.isLoading,
                        error: state.error,
                        selectedTemplateId: state.selectedTemplateId,
                        searchTerm: state.searchTerm,
                        selectedCategory: state.selectedCategory,
                        sortBy: state.sortBy,
                        recentlyUsedCount: state.recentlyUsed.length,
                        favoritesCount: state.favorites.size
                      }, null, 2)}
                    </pre>
                  </div>

                  {/* Available Actions */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Available Actions</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.keys(actions).map((actionName) => (
                        <div
                          key={actionName}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {actionName}
                          </div>
                          <div className="text-xs text-gray-600">
                            Function available in hook
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`p-4 rounded-lg shadow-lg max-w-sm ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {notification.type === 'error' && <AlertCircle className="w-4 h-4" />}
              {notification.type === 'info' && <Clock className="w-4 h-4" />}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Template Selection Panel */}
      <TemplateSelectionPanel
        isOpen={showPanel}
        onClose={() => setShowPanel(false)}
      />
    </div>
  );
};

export default TemplateSelectionTest;