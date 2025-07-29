'use client';

import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { DragItem, ComponentCategory } from '@/types/builder';
import { cn } from '@/lib/utils';
import {
  Search,
  Layout,
  Type,
  Image,
  Square,
  Navigation,
  MousePointer,
  Zap,
  ChevronDown,
  ChevronRight,
  Grip,
} from 'lucide-react';

// Component definitions
const componentLibrary: Record<ComponentCategory, DragItem[]> = {
  layout: [
    {
      type: 'component',
      id: 'container',
      componentType: 'container',
      name: 'Container',
      category: 'layout',
      defaultProps: {
        padding: '16px',
        backgroundColor: 'transparent',
        borderRadius: '8px',
      },
      preview: {
        thumbnail: '/components/container.svg',
        description: 'Flexible container for organizing content',
      },
    },
    {
      type: 'component',
      id: 'section',
      componentType: 'section',
      name: 'Section',
      category: 'layout',
      defaultProps: {
        padding: '32px 16px',
        backgroundColor: '#ffffff',
      },
      preview: {
        thumbnail: '/components/section.svg',
        description: 'Full-width section for page layout',
      },
    },
    {
      type: 'component',
      id: 'grid',
      componentType: 'grid',
      name: 'Grid',
      category: 'layout',
      defaultProps: {
        columns: 3,
        gap: '16px',
        responsive: true,
      },
      preview: {
        thumbnail: '/components/grid.svg',
        description: 'Responsive grid layout system',
      },
    },
    {
      type: 'component',
      id: 'flexbox',
      componentType: 'flexbox',
      name: 'Flexbox',
      category: 'layout',
      defaultProps: {
        direction: 'row',
        justify: 'center',
        align: 'center',
        gap: '16px',
      },
      preview: {
        thumbnail: '/components/flexbox.svg',
        description: 'Flexible box layout container',
      },
    },
  ],
  content: [
    {
      type: 'component',
      id: 'heading',
      componentType: 'heading',
      name: 'Heading',
      category: 'content',
      defaultProps: {
        text: 'Your Heading Here',
        level: 2,
        color: '#000000',
        fontSize: '32px',
        fontWeight: 'bold',
      },
      preview: {
        thumbnail: '/components/heading.svg',
        description: 'Customizable text heading',
      },
    },
    {
      type: 'component',
      id: 'paragraph',
      componentType: 'paragraph',
      name: 'Paragraph',
      category: 'content',
      defaultProps: {
        text: 'Your paragraph text goes here. This is a sample paragraph that you can customize.',
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#333333',
      },
      preview: {
        thumbnail: '/components/paragraph.svg',
        description: 'Text paragraph with rich formatting',
      },
    },
    {
      type: 'component',
      id: 'list',
      componentType: 'list',
      name: 'List',
      category: 'content',
      defaultProps: {
        items: ['Item 1', 'Item 2', 'Item 3'],
        type: 'unordered',
        style: 'bullet',
      },
      preview: {
        thumbnail: '/components/list.svg',
        description: 'Bullet or numbered list',
      },
    },
  ],
  forms: [
    {
      type: 'component',
      id: 'button',
      componentType: 'button',
      name: 'Button',
      category: 'forms',
      defaultProps: {
        text: 'Click Me',
        variant: 'primary',
        size: 'medium',
        onClick: 'workflow://lead-capture',
      },
      preview: {
        thumbnail: '/components/button.svg',
        description: 'Interactive button with workflow connection',
      },
    },
    {
      type: 'component',
      id: 'input',
      componentType: 'input',
      name: 'Input Field',
      category: 'forms',
      defaultProps: {
        placeholder: 'Enter your text...',
        type: 'text',
        required: false,
        label: 'Input Label',
      },
      preview: {
        thumbnail: '/components/input.svg',
        description: 'Text input field for forms',
      },
    },
    {
      type: 'component',
      id: 'form',
      componentType: 'form',
      name: 'Form',
      category: 'forms',
      defaultProps: {
        action: 'workflow://contact-form',
        method: 'POST',
        fields: [],
      },
      preview: {
        thumbnail: '/components/form.svg',
        description: 'Complete form with validation',
      },
    },
  ],
  navigation: [
    {
      type: 'component',
      id: 'navbar',
      componentType: 'navbar',
      name: 'Navigation Bar',
      category: 'navigation',
      defaultProps: {
        logo: 'Your Logo',
        links: [
          { text: 'Home', href: '#home' },
          { text: 'About', href: '#about' },
          { text: 'Contact', href: '#contact' },
        ],
        style: 'horizontal',
      },
      preview: {
        thumbnail: '/components/navbar.svg',
        description: 'Responsive navigation bar',
      },
    },
    {
      type: 'component',
      id: 'breadcrumb',
      componentType: 'breadcrumb',
      name: 'Breadcrumb',
      category: 'navigation',
      defaultProps: {
        items: [
          { text: 'Home', href: '/' },
          { text: 'Products', href: '/products' },
          { text: 'Current Page' },
        ],
      },
      preview: {
        thumbnail: '/components/breadcrumb.svg',
        description: 'Navigation breadcrumb trail',
      },
    },
  ],
  media: [
    {
      type: 'component',
      id: 'image',
      componentType: 'image',
      name: 'Image',
      category: 'media',
      defaultProps: {
        src: '/placeholder-image.jpg',
        alt: 'Placeholder image',
        width: 300,
        height: 200,
        objectFit: 'cover',
      },
      preview: {
        thumbnail: '/components/image.svg',
        description: 'Responsive image with lazy loading',
      },
    },
    {
      type: 'component',
      id: 'video',
      componentType: 'video',
      name: 'Video',
      category: 'media',
      defaultProps: {
        src: '',
        poster: '/placeholder-video.jpg',
        controls: true,
        autoplay: false,
      },
      preview: {
        thumbnail: '/components/video.svg',
        description: 'Video player with controls',
      },
    },
  ],
  interactive: [
    {
      type: 'component',
      id: 'carousel',
      componentType: 'carousel',
      name: 'Carousel',
      category: 'interactive',
      defaultProps: {
        items: [],
        autoplay: true,
        interval: 5000,
        showDots: true,
      },
      preview: {
        thumbnail: '/components/carousel.svg',
        description: 'Interactive image carousel',
      },
    },
    {
      type: 'component',
      id: 'modal',
      componentType: 'modal',
      name: 'Modal',
      category: 'interactive',
      defaultProps: {
        title: 'Modal Title',
        content: 'Modal content goes here',
        trigger: 'button',
      },
      preview: {
        thumbnail: '/components/modal.svg',
        description: 'Overlay modal dialog',
      },
    },
  ],
  'ai-powered': [
    {
      type: 'component',
      id: 'ai-chatbot',
      componentType: 'ai-chatbot',
      name: 'AI Chatbot',
      category: 'ai-powered',
      defaultProps: {
        greeting: 'Hello! How can I help you today?',
        position: 'bottom-right',
        workflowId: 'customer-support',
      },
      preview: {
        thumbnail: '/components/chatbot.svg',
        description: 'AI-powered customer support chat',
      },
    },
    {
      type: 'component',
      id: 'ai-form',
      componentType: 'ai-form',
      name: 'Smart Form',
      category: 'ai-powered',
      defaultProps: {
        title: 'Get Started',
        description: 'Fill out this form and we\'ll personalize your experience',
        workflowId: 'lead-qualification',
      },
      preview: {
        thumbnail: '/components/smart-form.svg',
        description: 'AI-enhanced form with smart validation',
      },
    },
  ],
};

const categoryIcons: Record<ComponentCategory, React.ComponentType<any>> = {
  layout: Layout,
  content: Type,
  forms: Square,
  navigation: Navigation,
  media: Image,
  interactive: MousePointer,
  'ai-powered': Zap,
};

interface DraggableComponentProps {
  component: DragItem;
}

function DraggableComponent({ component }: DraggableComponentProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: component,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={cn(
        "flex items-center p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-300 hover:shadow-sm transition-all duration-200",
        isDragging && "opacity-50 cursor-grabbing"
      )}
    >
      <div className="flex items-center space-x-3 flex-1">
        <div className="flex-shrink-0">
          <Grip className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {component.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {component.preview.description}
          </p>
        </div>
      </div>
      {component.category === 'ai-powered' && (
        <Zap className="w-4 h-4 text-blue-500 flex-shrink-0" />
      )}
    </div>
  );
}

interface ComponentPaletteProps {
  className?: string;
}

export function ComponentPalette({ className }: ComponentPaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<ComponentCategory>>(
    new Set(['layout', 'content', 'forms'])
  );

  const toggleCategory = (category: ComponentCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredComponents = Object.entries(componentLibrary).reduce(
    (acc, [category, components]) => {
      const filtered = components.filter(
        (component) =>
          component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          component.preview.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[category as ComponentCategory] = filtered;
      }
      return acc;
    },
    {} as Record<ComponentCategory, DragItem[]>
  );

  return (
    <div className={cn("w-80 bg-gray-50 border-r border-gray-200 flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Components
        </h3>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Component Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(filteredComponents).map(([category, components]) => {
          const categoryKey = category as ComponentCategory;
          const Icon = categoryIcons[categoryKey];
          const isExpanded = expandedCategories.has(categoryKey);

          return (
            <div key={category} className="space-y-2">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="w-full flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {category.replace('-', ' ')}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {components.length}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Category Components */}
              {isExpanded && (
                <div className="space-y-2 pl-2">
                  {components.map((component) => (
                    <DraggableComponent
                      key={component.id}
                      component={component}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {Object.keys(filteredComponents).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No components found</p>
            <p className="text-xs">Try adjusting your search terms</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="text-xs text-gray-500 text-center">
          Drag components to the canvas to start building
        </div>
      </div>
    </div>
  );
}