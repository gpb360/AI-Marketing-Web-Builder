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
            <button className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              Preview
            </button>
            <button className="px-6 py-2.5 text-sm font-semibold border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md">
              Undo
            </button>
            <button className="px-6 py-2.5 text-sm font-semibold border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md">
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