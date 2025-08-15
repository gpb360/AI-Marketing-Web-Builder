'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuilderStore } from '@/store/builderStore';
import { sampleTemplates, templateCategories, getTemplatesByCategory } from '@/data/templates';
import { TemplateSystem } from '@/components/templates/TemplateSystem';
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
  Zap,
  Play,
  Maximize2,
  X,
  Check,
  Wand2,
  Layers,
  Monitor,
  Tablet,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Settings,
  Crown
} from 'lucide-react';

interface TemplateSelectionInterfaceProps {
  className?: string;
  onTemplateApply?: (templateId: string) => void;
  showCategories?: boolean;
  showPreview?: boolean;
  maxTemplates?: number;
}

type SortOption = 'popular' | 'newest' | 'rating' | 'name';
type ViewMode = 'grid' | 'list';
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

const TemplateSelectionInterface: React.FC<TemplateSelectionInterfaceProps> = ({
  className = '',
  onTemplateApply,
  showCategories = true,
  showPreview = true,
  maxTemplates,
}) => {
  const { loadTemplate, currentTemplate } = useBuilderStore();
  
  // State management
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState<string | null>(null);

  // Enhanced filtering and sorting with performance optimization
  const filteredAndSortedTemplates = useMemo(() => {
    let templates = getTemplatesByCategory(selectedCategory);
    
    // Apply maxTemplates limit if specified
    if (maxTemplates) {
      templates = templates.slice(0, maxTemplates);
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      templates = templates.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        (template as any).tags?.some((tag: string) => 
          tag.toLowerCase().includes(searchLower)
        ) ||
        (template as any).features?.some((feature: string) => 
          feature.toLowerCase().includes(searchLower)
        )
      );
    }
    
    // Apply sorting
    templates.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return ((b as any).usage_count || 0) - ((a as any).usage_count || 0);
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
  }, [selectedCategory, searchTerm, sortBy, maxTemplates]);

  // Template application with animation feedback
  const handleTemplateApply = useCallback(async (templateId: string) => {
    const template = sampleTemplates.find(t => t.id === templateId);
    if (!template) return;

    setIsApplying(templateId);
    
    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Apply template to canvas
      loadTemplate(template);
      
      // Add to recently used
      setRecentlyUsed(prev => {
        const filtered = prev.filter(id => id !== templateId);
        return [templateId, ...filtered].slice(0, 5);
      });

      // Call callback if provided
      onTemplateApply?.(templateId);

      // Close preview modal if open
      setShowPreviewModal(false);
      
    } catch (error) {
      console.error('Failed to apply template:', error);
    } finally {
      setIsApplying(null);
    }
  }, [loadTemplate, onTemplateApply]);

  // Enhanced preview with template system integration
  const handleTemplatePreview = useCallback((template: any) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
    setPreviewDevice('desktop');
  }, []);

  const toggleFavorite = useCallback((templateId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(templateId)) {
        newFavorites.delete(templateId);
      } else {
        newFavorites.add(templateId);
      }
      return newFavorites;
    });
  }, []);

  // Enhanced LazyImage with error handling
  const LazyImage: React.FC<{
    src?: string;
    alt: string;
    className?: string;
    placeholder?: React.ReactNode;
  }> = ({ src, alt, className, placeholder }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    React.useEffect(() => {
      if (!src) return;

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
              <span className="text-sm text-gray-500 font-medium">{alt}</span>
            </div>
          )}
        </div>
      );
    }

    if (!imageLoaded) {
      return (
        <div className={`${className} flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200`}>
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-gray-300 rounded mx-auto mb-2"></div>
            <div className="w-16 h-2 bg-gray-300 rounded"></div>
          </div>
        </div>
      );
    }

    return <img src={src} alt={alt} className={className} loading="lazy" />;
  };

  return (
    <div className={`template-selection-interface bg-white h-full flex flex-col ${className}`}>
      {/* Enhanced Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-blue-600" />
              Template Selection
            </h2>
            <p className="text-gray-600">
              Choose from {sampleTemplates.length}+ professionally designed templates and apply instantly
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              {filteredAndSortedTemplates.length} templates
            </div>
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
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{filteredAndSortedTemplates.length}</div>
            <div className="text-gray-600">Available</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{recentlyUsed.length}</div>
            <div className="text-gray-600">Recent</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">{favorites.size}</div>
            <div className="text-gray-600">Favorites</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-600">
              {sampleTemplates.filter(t => (t as any).is_premium).length}
            </div>
            <div className="text-gray-600">Premium</div>
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
            placeholder="Search templates, features, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
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
                <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchTerm('');
                    setSortBy('popular');
                  }}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset All
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
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

                {/* Quick Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filters</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('landing')}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                    >
                      SaaS
                    </button>
                    <button
                      onClick={() => setSearchTerm('premium')}
                      className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200"
                    >
                      Premium
                    </button>
                    <button
                      onClick={() => setSearchTerm('modern')}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                    >
                      Modern
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Tabs */}
        {showCategories && (
          <div className="border-b border-gray-200 -mb-4">
            <div className="flex overflow-x-auto scrollbar-hide">
              {templateCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  {category.name}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedCategory === category.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recently Used Section */}
      {recentlyUsed.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Timer className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Recently Applied</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto">
            {recentlyUsed.slice(0, 5).map((templateId) => {
              const template = sampleTemplates.find(t => t.id === templateId);
              if (!template) return null;
              
              return (
                <motion.div
                  key={templateId}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleTemplateApply(templateId)}
                  className="flex-shrink-0 w-32 h-20 bg-gray-100 rounded-lg cursor-pointer overflow-hidden relative group"
                >
                  <LazyImage
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                    <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className="text-xs text-white bg-black bg-opacity-50 px-1 py-0.5 rounded text-center truncate">
                      {template.name}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Templates Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredAndSortedTemplates.length > 0 ? (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
          }`}>
            {filteredAndSortedTemplates.map((template) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                onHoverStart={() => setHoveredTemplate(template.id)}
                onHoverEnd={() => setHoveredTemplate(null)}
                className={`bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer transition-all shadow-sm hover:shadow-xl ${
                  currentTemplate?.id === template.id ? 'border-blue-500 ring-2 ring-blue-100' : ''
                } ${viewMode === 'list' ? 'flex' : ''}`}
              >
                {/* Template Thumbnail */}
                <div className={`${
                  viewMode === 'list' ? 'w-48 h-32' : 'aspect-video'
                } bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden`}>
                  <LazyImage
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  
                  {/* Enhanced Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {(template as any).is_premium && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full shadow-lg">
                        <Crown className="w-3 h-3" />
                        Premium
                      </div>
                    )}
                    {(template as any).is_featured && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-full shadow-lg">
                        <Award className="w-3 h-3" />
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Enhanced Hover Actions */}
                  <AnimatePresence>
                    {hoveredTemplate === template.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center"
                      >
                        <div className="flex gap-3">
                          {showPreview && (
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
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-3 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 relative"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTemplateApply(template.id);
                            }}
                            disabled={isApplying === template.id}
                          >
                            {isApplying === template.id ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Zap className="w-5 h-5 text-white" />
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Enhanced Template Info */}
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
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Heart 
                          className={`w-4 h-4 transition-colors ${
                            favorites.has(template.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'
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

                  {/* Enhanced Features */}
                  {(template as any).features && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {(template as any).features.slice(0, 3).map((feature: string, index: number) => (
                          <span 
                            key={index}
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                        {(template as any).features.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            +{(template as any).features.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        template.category === 'landing' ? 'bg-blue-100 text-blue-700' :
                        template.category === 'ecommerce' ? 'bg-green-100 text-green-700' :
                        template.category === 'blog' ? 'bg-purple-100 text-purple-700' :
                        template.category === 'portfolio' ? 'bg-pink-100 text-pink-700' :
                        template.category === 'corporate' ? 'bg-gray-100 text-gray-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {template.category}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {template.components.length}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {template.updatedAt.toLocaleDateString()}
                    </div>
                  </div>

                  {/* Quick Apply Button for Grid View */}
                  {viewMode === 'grid' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplateApply(template.id);
                      }}
                      disabled={isApplying === template.id}
                      className="w-full mt-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium text-sm transition-all hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isApplying === template.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Applying...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Apply Template
                        </>
                      )}
                    </motion.button>
                  )}
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
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                  setSortBy('popular');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Preview Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedTemplate.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">
                      {(selectedTemplate as any).rating || '4.8'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Device Selector */}
                  <div className="flex bg-white rounded-lg p-1 border border-gray-300">
                    {[
                      { value: 'desktop', icon: Monitor, label: 'Desktop' },
                      { value: 'tablet', icon: Tablet, label: 'Tablet' },
                      { value: 'mobile', icon: Smartphone, label: 'Mobile' }
                    ].map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => setPreviewDevice(value as PreviewDevice)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-all ${
                          previewDevice === value
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        title={label}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTemplateApply(selectedTemplate.id)}
                    disabled={isApplying === selectedTemplate.id}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isApplying === selectedTemplate.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Apply Template
                      </>
                    )}
                  </motion.button>

                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 overflow-hidden">
                <div className={`h-full bg-gray-100 flex items-center justify-center p-4 ${
                  previewDevice === 'mobile' ? 'p-8' : 
                  previewDevice === 'tablet' ? 'p-6' : 'p-4'
                }`}>
                  <div className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                    previewDevice === 'mobile' ? 'w-80 h-[600px]' :
                    previewDevice === 'tablet' ? 'w-[768px] h-[600px]' :
                    'w-full h-full max-w-[1200px]'
                  }`}>
                    <div className="w-full h-full overflow-auto">
                      <TemplateSystem
                        template={selectedTemplate}
                        variant="preview"
                        customization={{
                          animations: true,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplateSelectionInterface;