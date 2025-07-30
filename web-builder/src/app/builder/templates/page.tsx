'use client';

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Templates</h1>
          <p className="text-gray-300">Choose from 30+ professional templates to get started quickly</p>
        </div>

        {/* Template Categories */}
        <div className="flex space-x-4 mb-8">
          {['All', 'SaaS Landing', 'E-commerce', 'Portfolio', 'Blog', 'Corporate'].map((category) => (
            <button
              key={category}
              className="px-6 py-3 rounded-xl bg-gray-800/50 border-2 border-gray-700 text-gray-300 hover:border-yellow-400 hover:text-yellow-400 hover:scale-105 transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                <span className="text-gray-300">Template Preview {i}</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2">Template {i}</h3>
                <p className="text-sm text-gray-300 mb-4">Professional template for modern businesses</p>
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl font-semibold hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl">
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
