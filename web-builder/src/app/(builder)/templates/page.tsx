'use client';

export default function TemplatesPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Templates</h1>
          <p className="text-gray-600">Choose from 30+ professional templates to get started quickly</p>
        </div>

        {/* Template Categories */}
        <div className="flex space-x-4 mb-8">
          {['All', 'SaaS Landing', 'Local Business', 'E-commerce', 'Professional', 'Lead Generation'].map((category) => (
            <button
              key={category}
              className="px-6 py-3 text-sm font-semibold border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder templates */}
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <span className="text-primary-600 font-medium">Template Preview</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">SaaS Landing Page {index + 1}</h3>
                <p className="text-sm text-gray-500 mb-3">Perfect for software products and apps</p>
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl">
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}