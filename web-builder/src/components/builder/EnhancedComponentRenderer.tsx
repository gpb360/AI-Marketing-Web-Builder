'use client';

import React from 'react';
import { ComponentData } from '@/types/builder';
import { cn } from '@/lib/utils';
import { ColorPicker } from './ColorPicker';
import { TextEditor } from './TextEditor';
import { InlineTextEditor } from './TextEditor';
import DOMPurify from 'isomorphic-dompurify';

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

    // CONSOLIDATED: Added text element type from CanvasElement
    case 'text':
      return (
        <div
          className={cn(baseClasses, "relative group")}
          style={component.style}
        >
          {isSelected && (
            <div className="absolute -top-8 right-0 flex items-center gap-2 z-10">
              <ColorPicker
                color={component.props.color || '#374151'}
                onChange={(color) => handleColorChange('color', color)}
                label="Text Color"
              />
            </div>
          )}
          
          <div 
            className="w-full h-full"
            style={{
              fontSize: component.props.fontSize || '16px',
              color: component.props.color || '#374151',
              lineHeight: component.props.lineHeight || '1.5',
            }}
            contentEditable={isBuilderMode && isSelected}
            suppressContentEditableWarning={true}
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(component.content || component.props.text || 'Your text here') 
            }}
            onBlur={(e) => {
              if (isBuilderMode && isSelected) {
                handleTextChange('text', e.currentTarget.innerHTML);
              }
            }}
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
              "w-full h-full px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80",
              component.props.variant === 'primary' && "bg-blue-500 text-white hover:bg-blue-600",
              component.props.variant === 'secondary' && "bg-gray-200 text-gray-900 hover:bg-gray-300",
              component.props.size === 'small' && "px-3 py-1.5 text-sm",
              component.props.size === 'large' && "px-6 py-3 text-lg",
              !isBuilderMode && "pointer-events-auto"
            )}
            style={{
              backgroundColor: component.props.backgroundColor || '#3b82f6',
              color: component.props.color || '#ffffff',
              padding: component.props.padding || '14px 28px',
              borderRadius: component.props.borderRadius || '10px',
              fontSize: component.props.fontSize || '16px',
              fontWeight: component.props.fontWeight || '600',
              boxShadow: component.props.boxShadow || '0 4px 14px 0 rgba(59, 130, 246, 0.25)',
              ...component.style,
            }}
            disabled={isBuilderMode}
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(component.content || component.props.text || 'Click me') 
            }}
          />
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
            type={component.props.type || 'text'}
            placeholder={component.props.placeholder || 'Enter your input'}
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
          
          {component.props.src ? (
            <img
              src={String(component.props.src)}
              alt={String(component.props.alt || '')}
              className="w-full h-full"
              style={{
                objectFit: (component.props.objectFit as any) || 'cover',
                ...component.style,
              }}
            />
          ) : (
            <div 
              className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500"
              style={component.style}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">🖼️</div>
                <div className="text-sm">Image placeholder</div>
              </div>
            </div>
          )}
        </div>
      );

    // CONSOLIDATED: Added hero section from CanvasElement
    case 'hero':
      return (
        <section
          className={cn(baseClasses, "relative group")}
          style={{
            padding: '80px 20px',
            backgroundColor: '#1f2937',
            color: '#ffffff',
            textAlign: 'center' as const,
            minHeight: '400px',
            ...component.style,
          }}
        >
          {isSelected && (
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <ColorPicker
                color={component.props.backgroundColor || '#1f2937'}
                onChange={(color) => handleColorChange('backgroundColor', color)}
                label="Background"
              />
              <ColorPicker
                color={component.props.color || '#ffffff'}
                onChange={(color) => handleColorChange('color', color)}
                label="Text Color"
              />
            </div>
          )}
          
          <div className="max-w-4xl mx-auto">
            <h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              contentEditable={isBuilderMode && isSelected}
              suppressContentEditableWarning={true}
              onBlur={(e) => {
                if (isBuilderMode && isSelected) {
                  handleTextChange('title', e.currentTarget.textContent || '');
                }
              }}
            >
              {component.content || component.props.title || 'Hero Title'}
            </h1>
            <p 
              className="text-xl md:text-2xl mb-8 opacity-90"
              contentEditable={isBuilderMode && isSelected}
              suppressContentEditableWarning={true}
              onBlur={(e) => {
                if (isBuilderMode && isSelected) {
                  handleTextChange('subtitle', e.currentTarget.textContent || '');
                }
              }}
            >
              {component.props.subtitle || 'Your compelling hero subtitle goes here'}
            </p>
            <div className="space-x-4">
              <button className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                {component.props.primaryButtonText || 'Get Started'}
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-gray-900 hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-sm">
                {component.props.secondaryButtonText || 'Learn More'}
              </button>
            </div>
          </div>
        </section>
      );

    // CONSOLIDATED: Added card component from CanvasElement
    case 'card':
      return (
        <div
          className={cn(baseClasses, "relative group bg-white border border-gray-200 rounded-lg shadow-sm p-6")}
          style={component.style}
        >
          {isSelected && (
            <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
              <ColorPicker
                color={component.props.backgroundColor || '#ffffff'}
                onChange={(color) => handleColorChange('backgroundColor', color)}
                label="Background"
              />
            </div>
          )}
          
          <h3 
            className="text-lg font-semibold mb-2"
            contentEditable={isBuilderMode && isSelected}
            suppressContentEditableWarning={true}
            onBlur={(e) => {
              if (isBuilderMode && isSelected) {
                handleTextChange('title', e.currentTarget.textContent || '');
              }
            }}
          >
            {component.props.title || 'Card Title'}
          </h3>
          <p 
            className="text-gray-600 mb-4"
            contentEditable={isBuilderMode && isSelected}
            suppressContentEditableWarning={true}
            onBlur={(e) => {
              if (isBuilderMode && isSelected) {
                handleTextChange('description', e.currentTarget.textContent || '');
              }
            }}
          >
            {component.content || component.props.description || 'Card description goes here. Add your content to make this card meaningful.'}
          </p>
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
            {component.props.buttonText || 'Action'}
          </button>
        </div>
      );

    // CONSOLIDATED: Added form component from CanvasElement
    case 'form':
      return (
        <form
          className={cn(baseClasses, "relative group space-y-4")}
          style={component.style}
          onSubmit={(e) => isBuilderMode && e.preventDefault()}
        >
          {isSelected && (
            <div className="absolute top-2 right-2 z-10">
              <ColorPicker
                color={component.props.backgroundColor || '#ffffff'}
                onChange={(color) => handleColorChange('backgroundColor', color)}
                label="Background"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {component.props.nameLabel || 'Name'}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={component.props.namePlaceholder || 'Enter your name'}
              disabled={isBuilderMode}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {component.props.emailLabel || 'Email'}
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={component.props.emailPlaceholder || 'Enter your email'}
              disabled={isBuilderMode}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={isBuilderMode}
          >
            {component.props.submitText || 'Submit'}
          </button>
        </form>
      );

    // CONSOLIDATED: Added navigation component from CanvasElement
    case 'navigation':
    case 'navbar':
      return (
        <nav
          className={cn(baseClasses, "relative group bg-white border-b border-gray-200")}
          style={component.style}
        >
          {isSelected && (
            <div className="absolute top-2 right-2 z-10">
              <ColorPicker
                color={component.props.backgroundColor || '#ffffff'}
                onChange={(color) => handleColorChange('backgroundColor', color)}
                label="Background"
              />
            </div>
          )}
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div 
                className="font-bold text-xl text-gray-900"
                contentEditable={isBuilderMode && isSelected}
                suppressContentEditableWarning={true}
                onBlur={(e) => {
                  if (isBuilderMode && isSelected) {
                    handleTextChange('logo', e.currentTarget.textContent || '');
                  }
                }}
              >
                {component.props.logo || 'Logo'}
              </div>
              <div className="hidden md:flex space-x-8">
                {(component.props.links || [
                  { text: 'Home', href: '#' },
                  { text: 'About', href: '#' },
                  { text: 'Services', href: '#' },
                  { text: 'Contact', href: '#' }
                ]).map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.href || '#'}
                    className="text-gray-700 hover:text-gray-900 transition-colors"
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
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
                {component.props.ctaText || 'Get Started'}
              </button>
            </div>
          </div>
        </nav>
      );

    case 'grid':
      return (
        <div
          className={cn(baseClasses, "grid border-2 border-dashed border-gray-300 relative")}
          style={{
            gridTemplateColumns: `repeat(${component.props.columns || 3}, 1fr)`,
            gap: component.props.gap || '1rem',
          }}
        >
          {Array.from({ length: component.props.columns || 3 }).map((_, index) => (
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
            flexDirection: component.props.direction || 'row',
            justifyContent: component.props.justify || 'flex-start',
            alignItems: component.props.align || 'stretch',
            gap: component.props.gap || '1rem',
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
          {(component.props.items || ['Item 1', 'Item 2', 'Item 3']).map((item: string, index: number) => (
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