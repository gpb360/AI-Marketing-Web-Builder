'use client';

export default function CanvasPage() {
  return (
    <div className="flex h-full">
      {/* Component Library Sidebar */}
      <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Components</h2>
        </div>
        <div className="flex-1 p-4">
          <p className="text-sm text-gray-300">Component library will be here</p>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Toolbar */}
        <div className="h-14 bg-gray-900 border-b border-gray-700 flex items-center px-4">
          <div className="flex items-center space-x-4">
            <button className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              Preview
            </button>
            <button className="px-6 py-2.5 text-sm font-semibold border-2 border-gray-600 text-gray-300 rounded-xl hover:border-yellow-400 hover:text-yellow-400 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md">
              Undo
            </button>
            <button className="px-6 py-2.5 text-sm font-semibold border-2 border-gray-600 text-gray-300 rounded-xl hover:border-yellow-400 hover:text-yellow-400 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md">
              Redo
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-gray-800 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto bg-gray-700 shadow-lg rounded-lg min-h-96 p-8 border border-gray-600">
            <div className="text-center text-gray-300">
              <p className="text-lg">Drop components here to start building</p>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Properties</h2>
        </div>
        <div className="flex-1 p-4">
          <p className="text-sm text-gray-300">Component properties will appear here</p>
        </div>
      </div>
    </div>
  );
}