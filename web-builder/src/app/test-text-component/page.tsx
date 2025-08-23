'use client';

import React, { useState } from 'react';
import { Text, RichText, SimpleText } from '@/components/templates/core';

export default function TestTextComponent() {
  const [basicText, setBasicText] = useState('This is a basic text component');
  const [richText, setRichText] = useState('This is a rich text component with advanced features');
  const [simpleText, setSimpleText] = useState('This is a simple text component');

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Text Component Test Page</h1>
      
      {/* Basic Text Component */}
      <section className="border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Text Component</h2>
        <div className="space-y-4">
          <Text
            content={basicText}
            isBuilder={true}
            isSelected={true}
            onUpdate={(newText, styles) => {
              console.log('Text updated:', newText, styles);
              setBasicText(newText);
            }}
            props={{
              tag: 'p',
              fontSize: 18,
              color: '#333333'
            }}
          />
        </div>
      </section>

      {/* Rich Text Component */}
      <section className="border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Rich Text Component</h2>
        <div className="space-y-4">
          <RichText
            content={richText}
            isBuilder={true}
            isSelected={true}
            allowRichText={true}
            toolbar={true}
            onUpdate={(newText, styles) => {
              console.log('Rich text updated:', newText, styles);
              setRichText(newText);
            }}
            props={{
              tag: 'h2',
              fontSize: 24,
              fontWeight: 'bold',
              color: '#1f2937'
            }}
          />
        </div>
      </section>

      {/* Simple Text Component */}
      <section className="border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Simple Text Component</h2>
        <div className="space-y-4">
          <SimpleText
            text={simpleText}
            onChange={setSimpleText}
            editable={true}
            placeholder="Enter your text here..."
          />
        </div>
      </section>

      {/* Non-editable Examples */}
      <section className="border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Non-editable Examples</h2>
        <div className="space-y-4">
          <Text
            content="This text is not editable (isBuilder=false)"
            isBuilder={false}
            props={{
              tag: 'p',
              fontSize: 16,
              color: '#6b7280'
            }}
          />
          
          <Text
            content="Gradient text example"
            isBuilder={false}
            props={{
              tag: 'h3',
              fontSize: 28,
              fontWeight: 'bold',
              gradient: true,
              gradientFrom: '#3b82f6',
              gradientTo: '#8b5cf6'
            }}
          />
          
          <Text
            content="Animated text with bounce effect"
            isBuilder={false}
            props={{
              tag: 'p',
              fontSize: 20,
              animation: 'bounce',
              color: '#dc2626'
            }}
          />
        </div>
      </section>

      {/* Testing Instructions */}
      <section className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
        <ul className="list-disc pl-6 space-y-2 text-sm">
          <li>Click on any editable text to enter edit mode</li>
          <li>Use the style controls that appear on hover when text is selected</li>
          <li>Try the font size controls (+/-)</li>
          <li>Test bold, italic, and underline formatting</li>
          <li>Change text alignment (left, center, right)</li>
          <li>Use the color picker to change text color</li>
          <li>Press Enter to save, Escape to cancel</li>
          <li>Test the Rich Text component's advanced controls</li>
        </ul>
      </section>
    </div>
  );
}