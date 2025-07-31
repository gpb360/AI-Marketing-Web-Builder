'use client';

import React from 'react';
import { ComponentData } from '@/types/builder';
import { ColorPicker } from './ColorPicker';
import { InlineTextEditor } from './TextEditor';
import { cn } from '@/lib/utils';

interface QuickSettingsProps {
  component: ComponentData;
  onUpdateProps: (props: Partial<ComponentData['props']>) => void;
  className?: string;
}

export function QuickSettings({ component, onUpdateProps, className }: QuickSettingsProps) {
  const handlePropChange = (key: string, value: any) => {
    onUpdateProps({ [key]: value });
  };

  const renderComponentSettings = () => {
    switch (component.type) {
      case 'heading':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Text</label>
              <input
                type="text"
                value={component.props.text || ''}
                onChange={(e) => handlePropChange('text', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Level</label>
              <select
                value={component.props.level || 1}
                onChange={(e) => handlePropChange('level', parseInt(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6].map(level => (
                  <option key={level} value={level}>H{level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Font Size</label>
              <input
                type="text"
                value={component.props.fontSize || '2rem'}
                onChange={(e) => handlePropChange('fontSize', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Text Color</label>
              <ColorPicker
                color={component.props.color || '#000000'}
                onChange={(color) => handlePropChange('color', color)}
              />
            </div>
          </div>
        );

      case 'paragraph':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Text</label>
              <textarea
                value={component.props.text || ''}
                onChange={(e) => handlePropChange('text', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Font Size</label>
              <input
                type="text"
                value={component.props.fontSize || '1rem'}
                onChange={(e) => handlePropChange('fontSize', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Text Color</label>
              <ColorPicker
                color={component.props.color || '#000000'}
                onChange={(color) => handlePropChange('color', color)}
              />
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Text</label>
              <input
                type="text"
                value={component.props.text || ''}
                onChange={(e) => handlePropChange('text', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Variant</label>
              <select
                value={component.props.variant || 'primary'}
                onChange={(e) => handlePropChange('variant', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Background Color</label>
              <ColorPicker
                color={component.props.backgroundColor || '#3B82F6'}
                onChange={(color) => handlePropChange('backgroundColor', color)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Text Color</label>
              <ColorPicker
                color={component.props.color || '#FFFFFF'}
                onChange={(color) => handlePropChange('color', color)}
              />
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="url"
                value={component.props.src || ''}
                onChange={(e) => handlePropChange('src', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Alt Text</label>
              <input
                type="text"
                value={component.props.alt || ''}
                onChange={(e) => handlePropChange('alt', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Image description"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Object Fit</label>
              <select
                value={component.props.objectFit || 'cover'}
                onChange={(e) => handlePropChange('objectFit', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
        );

      case 'container':
      case 'section':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Background Color</label>
              <ColorPicker
                color={component.props.backgroundColor || '#FFFFFF'}
                onChange={(color) => handlePropChange('backgroundColor', color)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Padding</label>
              <input
                type="text"
                value={component.props.padding || '1rem'}
                onChange={(e) => handlePropChange('padding', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1rem"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Border Radius</label>
              <input
                type="text"
                value={component.props.borderRadius || '0'}
                onChange={(e) => handlePropChange('borderRadius', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.5rem"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            Settings not available for this component type.
          </div>
        );
    }
  };

  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg shadow-lg p-4", className)}>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        {component.name} Settings
      </h3>
      {renderComponentSettings()}
    </div>
  );
}