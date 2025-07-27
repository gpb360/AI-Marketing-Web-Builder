'use client';

export default function CanvasPage() {
  return (
    <div className="flex h-full">
      {/* Component Library Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Components</h2>
        </div>
        <div className="flex-1 p-4">
          <p className="text-sm text-gray-500">Component library will be here</p>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Toolbar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4">
          <div className="flex items-center space-x-4">
            <button className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700">
              Preview
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              Undo
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              Redo
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-canvas-bg p-8 overflow-auto">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg min-h-96 p-8">
            <div className="text-center text-gray-500">
              <p className="text-lg">Drop components here to start building</p>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
        </div>
        <div className="flex-1 p-4">
          <p className="text-sm text-gray-500">Component properties will appear here</p>
        </div>
      </div>
    </div>
  );
}