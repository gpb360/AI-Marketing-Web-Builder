'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuilderStore } from '@/store/builderStore';
import { sampleTemplates, templateCategories, getTemplatesByCategory } from '@/data/templates';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { 
  Eye, 
  Download, 
  Star, 
  Clock,
  Grid3X3,
  Search,
  Filter,
  Sparkles,
  Award,
  TrendingUp,
  BookmarkPlus,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  Heart,
  Timer,
  Zap
} from 'lucide-react';

interface TemplateLibraryProps {
  className?: string;
}

type SortOption = 'popular' | 'newest' | 'rating' | 'name';
type ViewMode = 'grid' | 'list';

// Enhanced LazyImage component with better loading states
const LazyImage: React.FC<{
  src?: string;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
}> = ({ src, alt, className, placeholder }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (!src) {
      setImageLoaded(false);
      return;
    }

    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (!src || imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200`}>
        {placeholder || (
          <div className="text-center">
            <Grid3X3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <span className="text-sm text-gray-500 font-medium">
              {alt}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (!imageLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200`}>
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 animate-spin">
            <div className="w-full h-full border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
          </div>
          <span className="text-sm text-gray-500 font-medium">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};

export function TemplateLibrary({ className = '' }: TemplateLibraryProps) {
  const { loadTemplate, currentTemplate } = useBuilderStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);

  // Enhanced filtering and sorting
  const filteredAndSortedTemplates = useMemo(() => {
    let templates = getTemplatesByCategory(selectedCategory);
    
    // Apply search filter
    if (searchTerm) {
      templates = templates.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (template as any).tags?.some((tag: string) => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply sorting
    templates.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b as any).usage_count - (a as any).usage_count || 0;
        case 'newest':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'rating':
          return ((b as any).rating || 0) - ((a as any).rating || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    return templates;
  }, [selectedCategory, searchTerm, sortBy]);

  const handleTemplateSelect = (templateId: string) => {
    const template = sampleTemplates.find(t => t.id === templateId);
    if (template) {
      loadTemplate(template);
      
      // Add to recently used
      setRecentlyUsed(prev => {
        const filtered = prev.filter(id => id !== templateId);
        return [templateId, ...filtered].slice(0, 5);
      });
    }
  };

  const handleTemplatePreview = (template: any) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(templateId)) {
        newFavorites.delete(templateId);
      } else {
        newFavorites.add(templateId);
      }
      return newFavorites;
    });
  };

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'popular': return 'Most Popular';
      case 'newest': return 'Newest';
      case 'rating': return 'Highest Rated';
      case 'name': return 'Name';
      default: return 'Sort';
    }
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setSortBy('popular');
  };

  return (
    <div className={`bg-white h-full flex flex-col ${className}`}>
      {/* Enhanced Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Template Library
            </h2>
            <p className="text-gray-600">
              Choose from {sampleTemplates.length}+ professionally designed templates
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                showFilters 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </motion.button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{sampleTemplates.length}</div>
            <div className="text-gray-600">Templates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{recentlyUsed.length}</div>
            <div className="text-gray-600">Recently Used</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{favorites.size}</div>
            <div className="text-gray-600">Favorites</div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="p-4 space-y-4 border-b border-gray-200">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates, categories, or features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Enhanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Filters & Sorting</h3>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>

                {/* View Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
                  <div className="flex bg-white rounded-lg p-1 border border-gray-300">
                    {[
                      { value: 'grid', icon: Grid3X3, label: 'Grid' },
                      { value: 'list', icon: Filter, label: 'List' }
                    ].map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => setViewMode(value as ViewMode)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-all flex-1 justify-center ${
                          viewMode === value
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Tabs */}
        <div className="border-b border-gray-200 -mb-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {templateCategories.map((category) => {
              const isActive = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                    ${isActive
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  {category.name}
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recently Used Section */}
      {recentlyUsed.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Timer className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Recently Used</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto">
            {recentlyUsed.slice(0, 5).map((templateId) => {
              const template = sampleTemplates.find(t => t.id === templateId);
              if (!template) return null;
              
              return (
                <motion.div
                  key={templateId}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleTemplateSelect(templateId)}
                  className="flex-shrink-0 w-24 h-16 bg-gray-100 rounded-lg cursor-pointer overflow-hidden"
                >
                  <LazyImage
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Templates Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredAndSortedTemplates.length > 0 ? (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }
          `}>
            {filteredAndSortedTemplates.map((template) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className={`
                  bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer transition-all shadow-sm hover:shadow-lg
                  ${currentTemplate?.id === template.id ? 'border-blue-500 ring-2 ring-blue-100' : ''}
                  ${viewMode === 'list' ? 'flex' : ''}
                `}
                onClick={() => handleTemplateSelect(template.id)}
              >
                {/* Template Thumbnail */}
                <div className={`
                  ${viewMode === 'list' ? 'w-48 h-32' : 'aspect-video'} 
                  bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden
                `}>
                  <LazyImage
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover"
                    placeholder={
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2 opacity-30">
                            {template.category === 'landing' && '🚀'}
                            {template.category === 'ecommerce' && '🛒'}
                            {template.category === 'blog' && '📝'}
                            {template.category === 'portfolio' && '🎨'}
                            {template.category === 'corporate' && '🏢'}
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {template.name}
                          </span>
                        </div>
                      </div>
                    }
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {(template as any).is_premium && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                        <Sparkles className="w-3 h-3" />
                        Premium
                      </div>
                    )}
                    {(template as any).is_featured && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-full">
                        <Award className="w-3 h-3" />
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplatePreview(template);
                        }}
                      >
                        <Eye className="w-5 h-5 text-gray-700" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateSelect(template.id);
                        }}
                      >
                        <Download className="w-5 h-5 text-white" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 truncate flex-1">
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(template.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Heart 
                          className={`w-4 h-4 ${
                            favorites.has(template.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                          }`} 
                        />
                      </button>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600">
                          {(template as any).rating || '4.8'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`
                        text-xs px-2 py-1 rounded-full font-medium
                        ${template.category === 'landing' ? 'bg-blue-100 text-blue-700' :
                          template.category === 'ecommerce' ? 'bg-green-100 text-green-700' :
                          template.category === 'blog' ? 'bg-purple-100 text-purple-700' :
                          template.category === 'portfolio' ? 'bg-pink-100 text-pink-700' :
                          template.category === 'corporate' ? 'bg-gray-100 text-gray-700' :
                          'bg-orange-100 text-orange-700'
                        }
                      `}>
                        {template.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {template.components.length} components
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {template.updatedAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No templates found
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-4">
              {searchTerm 
                ? `No templates match "${searchTerm}". Try adjusting your search terms.`
                : 'No templates available in this category.'
              }
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Footer */}
      {filteredAndSortedTemplates.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredAndSortedTemplates.length} of {sampleTemplates.length} templates
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">Sorted by {getSortLabel(sortBy)}</span>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1 text-blue-600 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                <span>View Analytics</span>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedTemplate(null);
          }}
          onUseTemplate={(template) => {
            if (typeof template.id === 'string') {
              handleTemplateSelect(template.id);
            }
          }}
        />
      )}
    </div>
  );
}