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
          {['All', 'SaaS Landing', 'E-commerce', 'Portfolio', 'Blog', 'Corporate'].map((category) => (
            <button
              key={category}
              className="px-6 py-3 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 hover:scale-105 transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <span className="text-gray-500">Template Preview {i}</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Template {i}</h3>
                <p className="text-sm text-gray-600 mb-4">Professional template for modern businesses</p>
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl">
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
