'use client';

import React, { useState } from 'react';
import { SimpleContainer, ContainerVariants, ContainerVariant } from './SimpleContainer';
import { cn } from '@/lib/utils';

export function ContainerDemo() {
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [hoveredContainer, setHoveredContainer] = useState<string | null>(null);

  const demoContainers = [
    {
      id: 'empty-container',
      name: 'Empty Container',
      variant: 'section' as ContainerVariant,
      isEmpty: true,
      content: null
    },
    {
      id: 'hero-container',
      name: 'Hero Section',
      variant: 'hero' as ContainerVariant,
      isEmpty: false,
      content: (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Our Platform
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Build amazing websites with our drag-and-drop builder
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Get Started
          </button>
        </div>
      )
    },
    {
      id: 'feature-container',
      name: 'Feature Section',
      variant: 'feature' as ContainerVariant,
      isEmpty: false,
      content: (
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2">Easy to Use</h3>
            <p className="text-sm text-gray-600">Simple drag-and-drop interface</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <span className="text-green-600 font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2">Professional</h3>
            <p className="text-sm text-gray-600">High-quality templates</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <span className="text-purple-600 font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2">Smart Workflows</h3>
            <p className="text-sm text-gray-600">AI-powered automation</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Clean Container Components Demo
          </h1>
          <p className="text-gray-600">
            Professional, minimal container components with clean selection and resize UI
          </p>
        </div>

        <div className="space-y-8">
          {demoContainers.map((container) => (
            <div key={container.id} className="relative">
              {/* Container Label */}
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {container.name}
                </span>
              </div>

              {/* Container with Selection Wrapper */}
              <div
                className={cn(
                  "relative p-4 rounded-lg transition-all duration-200 cursor-pointer",
                  selectedContainer === container.id && "bg-blue-50 ring-2 ring-blue-500",
                  hoveredContainer === container.id && selectedContainer !== container.id && "bg-gray-100"
                )}
                onClick={() => setSelectedContainer(container.id)}
                onMouseEnter={() => setHoveredContainer(container.id)}
                onMouseLeave={() => setHoveredContainer(null)}
              >
                <SimpleContainer
                  className={ContainerVariants[container.variant]}
                  isSelected={selectedContainer === container.id}
                  isEmpty={container.isEmpty}
                >
                  {container.content}
                </SimpleContainer>

                {/* Selection UI - Only show for selected container */}
                {selectedContainer === container.id && (
                  <>
                    {/* Move Handle */}
                    <div className="absolute -top-3 -left-3 bg-blue-500 text-white rounded-full p-1.5 shadow-sm">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      </svg>
                    </div>

                    {/* Settings Button */}
                    <button className="absolute -top-3 -right-3 bg-gray-600 text-white rounded-full p-1.5 shadow-sm hover:bg-gray-700 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>

                    {/* Simple Resize Handles - Only corners */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 border border-white rounded-full shadow-sm cursor-nwse-resize transform translate-x-1/2 translate-y-1/2" />
                    <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 border border-white rounded-full shadow-sm cursor-nesw-resize transform translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 bg-blue-500 border border-white rounded-full shadow-sm cursor-nesw-resize transform -translate-x-1/2 translate-y-1/2" />
                    <div className="absolute top-0 left-0 w-3 h-3 bg-blue-500 border border-white rounded-full shadow-sm cursor-nwse-resize transform -translate-x-1/2 -translate-y-1/2" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Design Principles */}
        <div className="mt-12 bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Clean Container Design Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">✅ What We Fixed</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Removed excessive resize handles (8+ → 4 corners)</li>
                <li>• Eliminated confusing "Drag Section" labels</li>
                <li>• Separated workflow features from basic UI</li>
                <li>• Clean hover and selection states</li>
                <li>• Professional, minimal styling</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🎯 Key Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Simple container/section for layouts</li>
                <li>• Clear visual hierarchy</li>
                <li>• Intuitive resize handles (corners only)</li>
                <li>• Workflow connections only for interactive components</li>
                <li>• Responsive and accessible design</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}