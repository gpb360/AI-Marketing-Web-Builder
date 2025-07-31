'use client';

import React from 'react';
import { ComponentData } from '@/types/builder';
import { cn } from '@/lib/utils';
import { ColorPicker } from './ColorPicker';
import { TextEditor } from './TextEditor';
import { InlineTextEditor } from './TextEditor';

interface EnhancedComponentRendererProps {
  component: ComponentData;
  isSelected: boolean;
  isBuilderMode: boolean;
  onUpdateProps: (props: Partial<ComponentData['props']>) => void;
}

export function EnhancedComponentRenderer({ 
  component, 
  isSelected, 
  isBuilderMode, 
  onUpdateProps 
}: EnhancedComponentRendererProps) {
  const baseClasses = cn(
    "w-full h-full",
    isBuilderMode && "pointer-events-none select-none"
  );

  const handleTextChange = (key: string, value: string) => {
    onUpdateProps({ [key]: value });
  };

  const handleColorChange = (key: string, color: string) => {
    onUpdateProps({ [key]: color });
  };

  switch (component.type) {
    case 'container':
      return (
        <div
          className={cn(baseClasses, "border-2 border-dashed border-gray-300 flex items-center justify-center relative")}
          style={{
            padding: component.props.padding,
            backgroundColor: component.props.backgroundColor,
            borderRadius: component.props.borderRadius,
          }}
        >
          {isSelected && (
            <ColorPicker
              color={component.props.backgroundColor || '#FFFFFF'}
              onChange={(color) => handleColorChange('backgroundColor', color)}
              label="Background"
              className="absolute top-2 right-2 z-10"
            />
          )}
          <div className="text-gray-500 text-sm">Container</div>
        </div>
      );

    case 'section':
      return (
        <div
          className={cn(baseClasses, "border border-gray-200 relative")}
          style={{
            padding: component.props.padding,
            backgroundColor: component.props.backgroundColor,
          }}
        >
          {isSelected && (
            <ColorPicker
              color={component.props.backgroundColor || '#FFFFFF'}
              onChange={(color) => handleColorChange('backgroundColor', color)}
              label="Background"
              className="absolute top-2 right-2 z-10"
            />
          )}
          <div className="text-gray-500 text-sm">Section</div>
        </div>
      );

    case 'heading':
      const HeadingTag = `h${component.props.level}` as keyof JSX.IntrinsicElements;
      return (
        <div className={cn(baseClasses, "relative")}>
          {isSelected && (
            <div className="absolute -top-8 right-0 flex items-center gap-2 z-10">
              <ColorPicker
                color={component.props.color || '#000000'}
                onChange={(color) => handleColorChange('color', color)}
                label="Text Color"
              />
            </div>
          )}
          
          <TextEditor
            tag={HeadingTag as any}
            text={component.props.text || ''}
            onChange={(text) => handleTextChange('text', text)}
            isSelected={isSelected}
            className={cn("font-bold", !isBuilderMode && "pointer-events-auto")}
            style={{
              fontSize: component.props.fontSize,
              color: component.props.color,
              fontWeight: component.props.fontWeight,
              margin: 0,
            }}
            placeholder="Click to edit heading..."
          />
        </div>
      );

    case 'paragraph':
      return (
        <div className={cn(baseClasses, "relative")}>
          {isSelected && (
            <div className="absolute -top-8 right-0 flex items-center gap-2 z-10">
              <ColorPicker
                color={component.props.color || '#000000'}
                onChange={(color) => handleColorChange('color', color)}
                label="Text Color"
              />
            </div>
          )}
          
          <TextEditor
            tag="p"
            text={component.props.text || ''}
            onChange={(text) => handleTextChange('text', text)}
            isSelected={isSelected}
            className={cn(!isBuilderMode && "pointer-events-auto")}
            style={{
              fontSize: component.props.fontSize,
              lineHeight: component.props.lineHeight,
              color: component.props.color,
              margin: 0,
            }}
            placeholder="Click to edit paragraph..."
          />
        </div>
      );

    case 'button':
      return (
        <div className={cn(baseClasses, "relative")}>
          {isSelected && (
            <div className="absolute -top-8 right-0 flex items-center gap-2 z-10">
              <ColorPicker
                color={component.props.backgroundColor || '#3B82F6'}
                onChange={(color) => handleColorChange('backgroundColor', color)}
                label="Background"
              />
              <ColorPicker
                color={component.props.color || '#FFFFFF'}
                onChange={(color) => handleColorChange('color', color)}
                label="Text Color"
              />
            </div>
          )}
          
          <button
            className={cn(
              "w-full h-full px-4 py-2 rounded-lg font-medium transition-colors duration-200",
              component.props.variant === 'primary' && "bg-blue-500 text-white hover:bg-blue-600",
              component.props.variant === 'secondary' && "bg-gray-200 text-gray-900 hover:bg-gray-300",
              component.props.size === 'small' && "px-3 py-1.5 text-sm",
              component.props.size === 'large' && "px-6 py-3 text-lg",
              !isBuilderMode && "pointer-events-auto"
            )}
            style={{
              backgroundColor: component.props.backgroundColor,
              color: component.props.color,
            }}
          >
            <InlineTextEditor
              text={component.props.text || ''}
              onChange={(text) => handleTextChange('text', text)}
              className="text-center"
              placeholder="Button text..."
            />
          </button>
        </div>
      );

    case 'input':
      return (
        <div className={cn(baseClasses, "relative")}>
          {component.props.label && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <InlineTextEditor
                text={component.props.label}
                onChange={(text) => handleTextChange('label', text)}
                placeholder="Label..."
              />
              {component.props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          
          <input
            type={component.props.type}
            placeholder={component.props.placeholder}
            required={component.props.required}
            className={cn(
              "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              !isBuilderMode && "pointer-events-auto"
            )}
            readOnly={isBuilderMode}
          />
        </div>
      );

    case 'image':
      return (
        <div className={cn(baseClasses, "relative overflow-hidden rounded-lg")}>
          {isSelected && (
            <div className="absolute top-2 right-2 z-10">
              <InlineTextEditor
                text={component.props.src || ''}
                onChange={(text) => handleTextChange('src', text)}
                placeholder="Enter image URL..."
                className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-lg text-xs"
              />
            </div>
          )}
          
          <img
            src={component.props.src || '/placeholder-image.svg'}
            alt={component.props.alt || ''}
            className="w-full h-full"
            style={{
              objectFit: component.props.objectFit,
            }}
          />
        </div>
      );

    case 'grid':
      return (
        <div
          className={cn(baseClasses, "grid border-2 border-dashed border-gray-300 relative")}
          style={{
            gridTemplateColumns: `repeat(${component.props.columns}, 1fr)`,
            gap: component.props.gap,
          }}
        >
          {Array.from({ length: component.props.columns }).map((_, index) => (
            <div
              key={index}
              className="min-h-[60px] border border-gray-200 bg-gray-50 flex items-center justify-center"
            >
              <span className="text-gray-400 text-xs">Grid Item {index + 1}</span>
            </div>
          ))}
        </div>
      );

    case 'flexbox':
      return (
        <div
          className={cn(baseClasses, "flex border-2 border-dashed border-gray-300 relative")}
          style={{
            flexDirection: component.props.direction,
            justifyContent: component.props.justify,
            alignItems: component.props.align,
            gap: component.props.gap,
          }}
        >
          <div className="min-w-[80px] min-h-[40px] bg-gray-100 border border-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">Flex 1</span>
          </div>
          <div className="min-w-[80px] min-h-[40px] bg-gray-100 border border-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">Flex 2</span>
          </div>
        </div>
      );

    case 'list':
      const ListTag = component.props.type === 'ordered' ? 'ol' : 'ul';
      return (
        <ListTag className={cn(baseClasses, "space-y-1 pl-6 relative")}>
          {(component.props.items || []).map((item: string, index: number) => (
            <li key={index} className="text-gray-700">
              <InlineTextEditor
                text={item}
                onChange={(text) => {
                  const newItems = [...(component.props.items || [])];
                  newItems[index] = text;
                  onUpdateProps({ items: newItems });
                }}
                placeholder="List item..."
              />
            </li>
          ))}
        </ListTag>
      );

    case 'navbar':
      return (
        <nav className={cn(baseClasses, "flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 relative")}>
          <div className="font-bold text-lg">
            <InlineTextEditor
              text={component.props.logo || ''}
              onChange={(text) => handleTextChange('logo', text)}
              placeholder="Logo..."
            />
          </div>
          <div className="flex space-x-6">
            {(component.props.links || []).map((link: any, index: number) => (
              <a
                key={index}
                href={link.href}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                <InlineTextEditor
                  text={link.text || ''}
                  onChange={(text) => {
                    const newLinks = [...(component.props.links || [])];
                    newLinks[index] = { ...newLinks[index], text };
                    onUpdateProps({ links: newLinks });
                  }}
                  placeholder="Link text..."
                />
              </a>
            ))}
          </div>
        </nav>
      );

    case 'ai-chatbot':
      return (
        <div className={cn(baseClasses, "bg-blue-500 text-white rounded-lg p-4 flex items-center justify-center relative")}>
          <div className="text-center">
            <div className="text-sm font-medium mb-1">
              <InlineTextEditor
                text={component.props.title || 'AI Chatbot'}
                onChange={(text) => handleTextChange('title', text)}
                placeholder="Chatbot title..."
              />
            </div>
            <div className="text-xs opacity-80">
              <InlineTextEditor
                text={component.props.greeting || 'Hello, how can I help you?'}
                onChange={(text) => handleTextChange('greeting', text)}
                placeholder="Greeting message..."
              />
            </div>
          </div>
        </div>
      );

    case 'ai-form':
      return (
        <div className={cn(baseClasses, "bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4 relative")}>
          <div className="text-center">
            <div className="text-sm font-medium text-purple-800 mb-1">
              <InlineTextEditor
                text={component.props.title || 'AI Form'}
                onChange={(text) => handleTextChange('title', text)}
                placeholder="Form title..."
              />
            </div>
            <div className="text-xs text-purple-600">
              <InlineTextEditor
                text={component.props.description || 'Fill out this form to get started'}
                onChange={(text) => handleTextChange('description', text)}
                placeholder="Form description..."
              />
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className={cn(baseClasses, "border-2 border-dashed border-red-300 bg-red-50 flex items-center justify-center")}>
          <div className="text-red-500 text-sm">
            Unknown component: {component.type}
          </div>
        </div>
      );
  }
}