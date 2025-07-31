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
  Monitor,
  Search,
  Star,
  Zap,
  Heart,
  TrendingUp
} from 'lucide-react';

interface ComponentItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'basic' | 'layout' | 'content' | 'media' | 'forms' | 'advanced';
  color: string;
  isPopular?: boolean;
  isNew?: boolean;
}

const componentLibrary: ComponentItem[] = [
  // Basic Components
  {
    id: 'container',
    name: 'Container',
    description: 'A flexible container for organizing and grouping other components',
    icon: Square,
    category: 'basic',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
  },
  {
    id: 'text',
    name: 'Text Block',
    description: 'Rich text content with formatting options',
    icon: Type,
    category: 'basic',
    color: 'bg-gradient-to-br from-green-500 to-emerald-600',
  },
  {
    id: 'button',
    name: 'Button',
    description: 'Interactive call-to-action button with hover effects',
    icon: MousePointer,
    category: 'basic',
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    isPopular: true,
  },
  
  // Layout Components
  {
    id: 'hero',
    name: 'Hero Section',
    description: 'Eye-catching banner with headline, subtitle, and CTA',
    icon: Monitor,
    category: 'layout',
    color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    isPopular: true,
  },
  {
    id: 'navigation',
    name: 'Navigation Bar',
    description: 'Responsive navigation menu with dropdown support',
    icon: Navigation,
    category: 'layout',
    color: 'bg-gradient-to-br from-cyan-500 to-teal-600',
  },
  {
    id: 'card',
    name: 'Content Card',
    description: 'Versatile card layout for showcasing content and features',
    icon: CreditCard,
    category: 'layout',
    color: 'bg-gradient-to-br from-orange-500 to-red-500',
  },
  {
    id: 'grid',
    name: 'Grid Layout',
    description: 'Responsive grid system for organizing multiple items',
    icon: Grid3X3,
    category: 'layout',
    color: 'bg-gradient-to-br from-slate-500 to-gray-600',
  },
  
  // Content Components
  {
    id: 'testimonial',
    name: 'Testimonial',
    description: 'Customer testimonial with quote and author details',
    icon: FileText,
    category: 'content',
    color: 'bg-gradient-to-br from-amber-500 to-yellow-600',
  },
  {
    id: 'pricing',
    name: 'Pricing Table',
    description: 'Comparison table for different pricing plans',
    icon: CreditCard,
    category: 'content',
    color: 'bg-gradient-to-br from-emerald-500 to-green-600',
  },
  
  // Media Components
  {
    id: 'image',
    name: 'Image Gallery',
    description: 'Responsive image display with lightbox support',
    icon: Image,
    category: 'media',
    color: 'bg-gradient-to-br from-pink-500 to-rose-600',
  },
  
  // Form Components
  {
    id: 'form',
    name: 'Contact Form',
    description: 'Professional contact form with validation',
    icon: FileText,
    category: 'forms',
    color: 'bg-gradient-to-br from-red-500 to-pink-600',
  },
  
  // Advanced Components
  {
    id: 'carousel',
    name: 'Carousel',
    description: 'Interactive sliding carousel for showcasing content',
    icon: Layers,
    category: 'advanced',
    color: 'bg-gradient-to-br from-violet-500 to-purple-600',
    isNew: true,
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
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      className={`
        group relative p-5 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl cursor-grab shadow-md hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden
        ${isDragging ? 'opacity-60 shadow-2xl rotate-6 scale-110 ring-2 ring-blue-400 ring-opacity-50' : ''}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <div className="flex items-center gap-4 mb-4">
          <div className={`relative w-12 h-12 ${component.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <component.icon className="relative w-6 h-6 text-white drop-shadow-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 truncate text-lg group-hover:text-blue-700 transition-colors duration-200">
              {component.name}
            </h4>
          </div>
        </div>
        
        <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-2">
          {component.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-sm">
              {component.category}
            </span>
            {component.isPopular && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200">
                <Star className="w-3 h-3 text-orange-500 fill-current" />
                <span className="text-xs font-semibold text-orange-700">Popular</span>
              </div>
            )}
            {component.isNew && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200">
                <Zap className="w-3 h-3 text-green-500" />
                <span className="text-xs font-semibold text-green-700">New</span>
              </div>
            )}
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400 shadow-sm animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
      
      {isDragging && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}
    </motion.div>
  );
}

interface ComponentLibraryProps {
  className?: string;
}

export function ComponentLibrary({ className = '' }: ComponentLibraryProps) {
  const [activeCategory, setActiveCategory] = React.useState<ComponentItem['category'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  const categories = [
    { id: 'all', name: 'All', icon: Grid3X3 },
    { id: 'basic', name: 'Basic', icon: Box },
    { id: 'layout', name: 'Layout', icon: Layout },
    { id: 'content', name: 'Content', icon: Type },
    { id: 'media', name: 'Media', icon: Image },
    { id: 'forms', name: 'Forms', icon: FileText },
    { id: 'advanced', name: 'Advanced', icon: Layers },
  ] as const;

  const filteredComponents = componentLibrary.filter(component => {
    const matchesCategory = activeCategory === 'all' || component.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`bg-white border-r border-gray-200 h-full flex flex-col shadow-sm ${className}`}>
      {/* Header */}
      <div className="relative p-8 border-b border-gray-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Box className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Component Library
            </h2>
          </div>
          <p className="text-sm text-gray-700 font-medium leading-relaxed">
            Drag and drop components to build your perfect page layout
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-600 font-medium">Ready to use</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-white to-blue-50/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search components, categories, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:shadow-md transition-all duration-200 placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 hover:text-gray-700 flex items-center justify-center text-xs font-bold transition-all duration-200"
            >
              ×
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-2 text-xs text-gray-600">
            Showing results for "{searchQuery}"
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/30">
        <div className="flex overflow-x-auto scrollbar-hide px-3 py-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  relative flex items-center gap-3 px-5 py-3 mx-1 my-2 text-sm font-semibold rounded-2xl transition-all duration-200 whitespace-nowrap shadow-sm
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg ring-2 ring-blue-200'
                    : 'text-gray-600 hover:text-gray-900 bg-white hover:bg-gradient-to-r hover:from-white hover:to-blue-50 hover:shadow-md border border-gray-200 hover:border-blue-200'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'drop-shadow-sm' : ''}`} />
                {category.name}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full shadow-sm animate-pulse" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Components Grid */}
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50/20">
        <div className="grid grid-cols-1 gap-6">
          {filteredComponents.map((component, index) => (
            <motion.div
              key={component.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <DraggableComponent component={component} />
            </motion.div>
          ))}
        </div>
        
        {filteredComponents.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-lg">
              <Box className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Components Found
            </h3>
            <p className="text-gray-500 text-sm">
              Try selecting a different category or add new components
            </p>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="relative p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 via-blue-50/50 to-indigo-50/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5" />
        
        <div className="relative text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-sm font-semibold text-gray-700">
                {filteredComponents.length} component{filteredComponents.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-1 h-4 bg-gray-300 rounded-full" />
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <p className="text-sm font-semibold text-gray-700">
                {filteredComponents.filter(c => c.isPopular).length} popular
              </p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.92 }}
            className="group relative px-6 py-3 text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              <Box className="w-4 h-4" />
              Request Component
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}