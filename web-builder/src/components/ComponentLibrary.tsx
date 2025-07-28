'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import {
  Square,
  Type,
  MousePointer,
  Image,
  CreditCard,
  FileText,
  Navigation,
  Layout,
  Layers,
  Grid3X3,
  Box,
  Monitor
} from 'lucide-react';

interface ComponentItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'basic' | 'layout' | 'content' | 'media' | 'forms' | 'advanced';
  color: string;
}

const componentLibrary: ComponentItem[] = [
  // Basic Components
  {
    id: 'container',
    name: 'Container',
    description: 'A flexible container for other components',
    icon: Square,
    category: 'basic',
    color: 'bg-blue-500',
  },
  {
    id: 'text',
    name: 'Text',
    description: 'Add text content',
    icon: Type,
    category: 'basic',
    color: 'bg-green-500',
  },
  {
    id: 'button',
    name: 'Button',
    description: 'Interactive button component',
    icon: MousePointer,
    category: 'basic',
    color: 'bg-purple-500',
  },
  
  // Layout Components
  {
    id: 'hero',
    name: 'Hero Section',
    description: 'Large banner section with title and CTA',
    icon: Monitor,
    category: 'layout',
    color: 'bg-indigo-500',
  },
  {
    id: 'navigation',
    name: 'Navigation',
    description: 'Website navigation menu',
    icon: Navigation,
    category: 'layout',
    color: 'bg-cyan-500',
  },
  {
    id: 'card',
    name: 'Card',
    description: 'Content card with title and description',
    icon: CreditCard,
    category: 'layout',
    color: 'bg-orange-500',
  },
  
  // Media Components
  {
    id: 'image',
    name: 'Image',
    description: 'Display images with alt text',
    icon: Image,
    category: 'media',
    color: 'bg-pink-500',
  },
  
  // Form Components
  {
    id: 'form',
    name: 'Form',
    description: 'Contact or signup form',
    icon: FileText,
    category: 'forms',
    color: 'bg-red-500',
  },
];

interface DraggableComponentProps {
  component: ComponentItem;
}

function DraggableComponent({ component }: DraggableComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `new-${component.id}`,
    data: {
      type: component.id,
      name: component.name,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`
        p-4 bg-white border border-gray-200 rounded-xl cursor-grab shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200
        ${isDragging ? 'opacity-50 shadow-xl rotate-3 scale-105' : ''}
      `}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 ${component.color} rounded-xl flex items-center justify-center shadow-sm`}>
          <component.icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate text-base">
            {component.name}
          </h4>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">
        {component.description}
      </p>
      <div className="mt-3 pt-2 border-t border-gray-100">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          {component.category}
        </span>
      </div>
    </motion.div>
  );
}

interface ComponentLibraryProps {
  className?: string;
}

export function ComponentLibrary({ className = '' }: ComponentLibraryProps) {
  const [activeCategory, setActiveCategory] = React.useState<ComponentItem['category'] | 'all'>('all');

  const categories = [
    { id: 'all', name: 'All', icon: Grid3X3 },
    { id: 'basic', name: 'Basic', icon: Box },
    { id: 'layout', name: 'Layout', icon: Layout },
    { id: 'content', name: 'Content', icon: Type },
    { id: 'media', name: 'Media', icon: Image },
    { id: 'forms', name: 'Forms', icon: FileText },
    { id: 'advanced', name: 'Advanced', icon: Layers },
  ] as const;

  const filteredComponents = componentLibrary.filter(
    component => activeCategory === 'all' || component.category === activeCategory
  );

  return (
    <div className={`bg-white border-r border-gray-200 h-full flex flex-col shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Components
        </h2>
        <p className="text-sm text-gray-600 font-medium">
          Drag components to build your page
        </p>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex overflow-x-auto scrollbar-hide px-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 mx-1 my-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap
                  ${isActive
                    ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Components Grid */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="grid grid-cols-1 gap-4">
          {filteredComponents.map((component) => (
            <DraggableComponent
              key={component.id}
              component={component}
            />
          ))}
        </div>
        
        {filteredComponents.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Box className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500">
              No components in this category
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-3">
            {filteredComponents.length} component{filteredComponents.length !== 1 ? 's' : ''} available
          </p>
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium bg-white rounded-lg shadow-sm hover:shadow-md border border-blue-200 hover:border-blue-300 transition-all"
          >
            Request Component
          </motion.button>
        </div>
      </div>
    </div>
  );
}