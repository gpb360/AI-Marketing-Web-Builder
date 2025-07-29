'use client';

import React from 'react';
import { ComponentData } from '@/types/builder';
import { cn } from '@/lib/utils';

interface ComponentRendererProps {
  component: ComponentData;
  isSelected: boolean;
  isBuilderMode: boolean;
}

export function ComponentRenderer({ component, isSelected, isBuilderMode }: ComponentRendererProps) {
  const baseClasses = cn(
    "w-full h-full",
    isBuilderMode && "pointer-events-none select-none"
  );

  switch (component.type) {
    case 'container':
      return (
        <div
          className={cn(baseClasses, "border-2 border-dashed border-gray-300 flex items-center justify-center")}
          style={{
            padding: component.props.padding,
            backgroundColor: component.props.backgroundColor,
            borderRadius: component.props.borderRadius,
          }}
        >
          <div className="text-gray-500 text-sm">Container</div>
        </div>
      );

    case 'section':
      return (
        <div
          className={cn(baseClasses, "border border-gray-200")}
          style={{
            padding: component.props.padding,
            backgroundColor: component.props.backgroundColor,
          }}
        >
          <div className="text-gray-500 text-sm">Section</div>
        </div>
      );

    case 'heading':
      return React.createElement(
        `h${component.props.level}`,
        {
          className: cn(baseClasses, "font-bold"),
          style: {
            fontSize: component.props.fontSize,
            color: component.props.color,
            fontWeight: component.props.fontWeight,
          },
        },
        component.props.text
      );

    case 'paragraph':
      return (
        <p
          className={baseClasses}
          style={{
            fontSize: component.props.fontSize,
            lineHeight: component.props.lineHeight,
            color: component.props.color,
          }}
        >
          {component.props.text}
        </p>
      );

    case 'button':
      return (
        <button
          className={cn(
            baseClasses,
            "px-4 py-2 rounded-lg font-medium transition-colors duration-200",
            component.props.variant === 'primary' && "bg-blue-500 text-white hover:bg-blue-600",
            component.props.variant === 'secondary' && "bg-gray-200 text-gray-900 hover:bg-gray-300",
            component.props.size === 'small' && "px-3 py-1.5 text-sm",
            component.props.size === 'large' && "px-6 py-3 text-lg"
          )}
          style={{
            backgroundColor: component.props.backgroundColor,
            color: component.props.color,
          }}
        >
          {component.props.text}
        </button>
      );

    case 'input':
      return (
        <div className={baseClasses}>
          {component.props.label && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {component.props.label}
              {component.props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          <input
            type={component.props.type}
            placeholder={component.props.placeholder}
            required={component.props.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      );

    case 'image':
      return (
        <div className={cn(baseClasses, "overflow-hidden rounded-lg")}>
          <img
            src={component.props.src}
            alt={component.props.alt}
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
          className={cn(baseClasses, "grid border-2 border-dashed border-gray-300")}
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
          className={cn(baseClasses, "flex border-2 border-dashed border-gray-300")}
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
        <ListTag className={cn(baseClasses, "space-y-1 pl-6")}>
          {component.props.items.map((item: string, index: number) => (
            <li key={index} className="text-gray-700">
              {item}
            </li>
          ))}
        </ListTag>
      );

    case 'navbar':
      return (
        <nav className={cn(baseClasses, "flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200")}>
          <div className="font-bold text-lg">{component.props.logo}</div>
          <div className="flex space-x-6">
            {component.props.links.map((link: any, index: number) => (
              <a
                key={index}
                href={link.href}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                {link.text}
              </a>
            ))}
          </div>
        </nav>
      );

    case 'ai-chatbot':
      return (
        <div className={cn(baseClasses, "bg-blue-500 text-white rounded-lg p-4 flex items-center justify-center")}>
          <div className="text-center">
            <div className="text-sm font-medium mb-1">AI Chatbot</div>
            <div className="text-xs opacity-80">{component.props.greeting}</div>
          </div>
        </div>
      );

    case 'ai-form':
      return (
        <div className={cn(baseClasses, "bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4")}>
          <div className="text-center">
            <div className="text-sm font-medium text-purple-800 mb-1">
              {component.props.title}
            </div>
            <div className="text-xs text-purple-600">
              {component.props.description}
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