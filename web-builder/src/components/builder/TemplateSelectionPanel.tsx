'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TemplateSelectionInterface from './TemplateSelectionInterface';
import { useBuilderStore } from '@/store/builderStore';
import { 
  X, 
  ChevronRight, 
  Sparkles, 
  Layers,
  Zap,
  ChevronLeft,
  Grid3X3,
  Eye,
  Settings,
  BookOpen
} from 'lucide-react';

interface TemplateSelectionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const TemplateSelectionPanel: React.FC<TemplateSelectionPanelProps> = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const { currentTemplate, canvasComponents } = useBuilderStore();
  const [selectedView, setSelectedView] = useState<'all' | 'categories' | 'favorites'>('all');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);

  const handleTemplateApply = (templateId: string) => {
    // If user has existing work, show confirmation dialog
    if (canvasComponents.length > 0 && !currentTemplate) {
      setPendingTemplateId(templateId);
      setShowConfirmDialog(true);
      return;
    }
    
    // Apply template directly if no existing work
    applyTemplate(templateId);
  };

  const applyTemplate = (templateId: string) => {
    // Template application is handled by the TemplateSelectionInterface
    // Close the panel after successful application
    setTimeout(() => {
      onClose();
    }, 1500); // Give time for the application animation
  };

  const handleConfirmApply = () => {
    if (pendingTemplateId) {
      applyTemplate(pendingTemplateId);
      setShowConfirmDialog(false);
      setPendingTemplateId(null);
    }
  };

  const handleCancelApply = () => {
    setShowConfirmDialog(false);
    setPendingTemplateId(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed right-0 top-0 h-full w-full max-w-6xl bg-white shadow-2xl z-50 flex flex-col ${className}`}
          >
            {/* Panel Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Template Library</h2>
                    <p className="text-indigo-100 text-sm">
                      Choose from premium templates and start building instantly
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Options */}
                  <div className="flex bg-white bg-opacity-20 rounded-lg p-1">
                    {[
                      { id: 'all', icon: Grid3X3, label: 'All Templates' },
                      { id: 'categories', icon: Layers, label: 'By Category' },
                      { id: 'favorites', icon: BookOpen, label: 'Favorites' }
                    ].map(({ id, icon: Icon, label }) => (
                      <button
                        key={id}
                        onClick={() => setSelectedView(id as any)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          selectedView === id
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-white hover:bg-white hover:bg-opacity-10'
                        }`}
                        title={label}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden lg:inline">{label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={onClose}
                    className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Current Status */}
              {currentTemplate && (
                <div className="mt-4 p-3 bg-white bg-opacity-10 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4" />
                    <span>Currently using: <strong>{currentTemplate.name}</strong></span>
                    <div className="ml-auto flex items-center gap-1 text-xs">
                      <Layers className="w-3 h-3" />
                      {canvasComponents.length} components
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Template Selection Interface */}
            <div className="flex-1 overflow-hidden">
              <TemplateSelectionInterface
                onTemplateApply={handleTemplateApply}
                showCategories={selectedView === 'categories'}
                showPreview={true}
                className="h-full"
              />
            </div>

            {/* Panel Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span>One-click application</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-purple-500" />
                    <span>Live preview</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Settings className="w-4 h-4 text-green-500" />
                    <span>Fully customizable</span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Builder</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Confirmation Dialog */}
          <AnimatePresence>
            {showConfirmDialog && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-75 z-60 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-xl max-w-md w-full p-6"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Layers className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Replace Current Work?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      You have {canvasComponents.length} components on your canvas. 
                      Applying this template will replace your current work. 
                      This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancelApply}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmApply}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Replace Work
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default TemplateSelectionPanel;