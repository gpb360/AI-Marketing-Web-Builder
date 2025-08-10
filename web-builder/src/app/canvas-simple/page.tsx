'use client';

import React from 'react';

export default function SimpleCanvasPage() {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-white p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold">Simple Canvas - Working!</h1>
        <p className="text-gray-600">This is a simplified version to test basic functionality.</p>
      </div>
      
      <div className="flex-1 p-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-medium mb-4">Canvas Area</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center">
            <p className="text-gray-500">Drag components here (placeholder)</p>
          </div>
        </div>
      </div>
    </div>
  );
}