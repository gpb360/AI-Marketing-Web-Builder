'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Grid3X3, 
  Eye, 
  Download,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useTemplates, useFeaturedTemplates } from '@/hooks';
import { TemplateCategory } from '@/lib/api/types';

const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates', value: undefined },
  { id: 'landing_page', label: 'SaaS Landing', value: TemplateCategory.LANDING_PAGE },
  { id: 'ecommerce', label: 'E-commerce', value: TemplateCategory.ECOMMERCE },
  { id: 'portfolio', label: 'Portfolio', value: TemplateCategory.PORTFOLIO },
  { id: 'blog', label: 'Blog', value: TemplateCategory.BLOG },
  { id: 'corporate', label: 'Professional', value: TemplateCategory.CORPORATE },
  { id: 'restaurant', label: 'Restaurant', value: TemplateCategory.RESTAURANT },
  { id: 'health', label: 'Health & Wellness', value: TemplateCategory.HEALTH },
  { id: 'education', label: 'Education', value: TemplateCategory.EDUCATION },
  { id: 'real_estate', label: 'Real Estate', value: TemplateCategory.REAL_ESTATE },
  { id: 'technology', label: 'Technology', value: TemplateCategory.TECHNOLOGY },
  { id: 'creative', label: 'Creative', value: TemplateCategory.CREATIVE },
];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);
  const [showOnlyPremium, setShowOnlyPremium] = useState(false);

  // Get the current category filter
  const currentCategory = TEMPLATE_CATEGORIES.find(cat => cat.id === selectedCategory);

  // Configure filters for the templates hook
  const filters = useMemo(() => ({
    category: currentCategory?.value,
    search: searchTerm || undefined,
    featured: showOnlyFeatured || undefined,
    premium: showOnlyPremium || undefined,
    limit: 20
  }), [currentCategory?.value, searchTerm, showOnlyFeatured, showOnlyPremium]);

  // Use the templates API hook
  const {
    templates,
    totalTemplates,
    isLoading,
    error,
    refreshTemplates,
    loadMore,
    currentPage,
    totalPages
  } = useTemplates({ filters, autoLoad: true, pageSize: 20 });

  // Featured templates for hero section
  const {
    templates: featuredTemplates,
    isLoading: featuredLoading,
    error: featuredError
  } = useFeaturedTemplates(6);

  const handleTemplateSelect = async (templateId: number) => {
    try {
      // Here you would typically:
      // 1. Load the template data
      // 2. Navigate to the builder with the template
      // 3. Or show a preview modal
      console.log('Selected template:', templateId);
      
      // For now, just log the selection
      // In a real app, you might do:
      // router.push(`/builder?template=${templateId}`);
    } catch (err) {
      console.error('Failed to select template:', err);
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoading) {
      loadMore();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Template
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started with professionally designed templates. All templates are fully customizable 
              and optimized for conversions.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Templates Section */}
      {!searchTerm && selectedCategory === 'all' && (
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Featured Templates</h2>
              {featuredError && (
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
              )}
            </div>
            
            {featuredLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-gray-200 rounded-lg aspect-[4/3] animate-pulse" />
                ))}
              </div>
            ) : featuredError ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Failed to load featured templates</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden">
                      {template.preview_image_url ? (
                        <img
                          src={template.preview_image_url}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Grid3X3 className="w-12 h-12 text-blue-400" />
                        </div>
                      )}
                      
                      {template.is_featured && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-yellow-400 text-yellow-900 text-xs font-medium px-2 py-1 rounded-full">
                            Featured
                          </span>
                        </div>
                      )}
                      
                      {template.is_premium && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                            Premium
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="capitalize">{template.category.replace('_', ' ')}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span>4.8</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {TEMPLATE_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Additional Filters */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showOnlyFeatured}
                onChange={(e) => setShowOnlyFeatured(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Featured only
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showOnlyPremium}
                onChange={(e) => setShowOnlyPremium(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Premium only
            </label>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {searchTerm ? `Search results for "${searchTerm}"` : 'All Templates'}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({totalTemplates} templates)
            </span>
          </h2>
          
          {error && (
            <button
              onClick={refreshTemplates}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && templates.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load templates</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={refreshTemplates}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `No templates match "${searchTerm}". Try adjusting your search.`
                : 'No templates available with the current filters.'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {template.preview_image_url ? (
                      <img
                        src={template.preview_image_url}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Grid3X3 className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    {template.is_featured && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-yellow-400 text-yellow-900 text-xs font-medium px-2 py-1 rounded-full">
                          Featured
                        </span>
                      </div>
                    )}
                    
                    {template.is_premium && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                          Premium
                        </span>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Preview functionality
                          }}
                        >
                          <Eye className="w-4 h-4 text-gray-700" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTemplateSelect(template.id);
                          }}
                        >
                          <Download className="w-4 h-4 text-white" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 truncate">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="capitalize">{template.category.replace('_', ' ')}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>4.8</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <span>{template.usage_count} uses</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(template.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More Button */}
            {currentPage < totalPages && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    `Load More Templates (${totalTemplates - templates.length} remaining)`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}