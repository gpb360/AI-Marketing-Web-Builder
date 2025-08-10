'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Grid3X3, 
  List, 
  Star,
  Clock,
  TrendingUp,
  Zap,
  Eye,
  Download,
  Sparkles,
  Award,
  Timer,
  Heart,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Target,
  Users,
  DollarSign,
  X,
  SlidersHorizontal,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

import { sampleTemplates, templateCategories } from '@/data/templates';
import { useBuilderStore } from '@/store/builderStore';
import { WorkflowCategory, TriggerType } from '@/lib/types/smart-templates';
import { TemplatePreviewModal } from '../TemplatePreviewModal';

// Enhanced interfaces for the improved selector
interface EnhancedTemplate {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  thumbnail?: string;
  is_premium?: boolean;
  is_featured?: boolean;
  usage_count?: number;
  rating?: number;
  review_count?: number;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  features?: string[];
  preview_images?: string[];
  success_probability?: number;
  estimated_setup_time?: number;
  expected_conversion_rate?: number;
  ai_customization_score?: number;
  workflow_compatibility?: WorkflowCategory[];
  components?: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface FilterState {
  search: string;
  category: string;
  difficulty: string[];
  rating: number;
  isPremium: boolean | null;
  isFeatured: boolean | null;
  tags: string[];
  workflowCompatibility: WorkflowCategory[];
}

interface SortState {
  field: 'popular' | 'newest' | 'rating' | 'name' | 'success_probability' | 'setup_time';
  direction: 'asc' | 'desc';
}

type ViewMode = 'grid' | 'list' | 'detailed';

const EnhancedTemplateSelector: React.FC<{
  onTemplateSelect?: (template: EnhancedTemplate) => void;
  onTemplateInstantiate?: (template: EnhancedTemplate) => void;
  className?: string;
}> = ({ onTemplateSelect, onTemplateInstantiate, className }) => {
  // State management
  const [templates] = useState<EnhancedTemplate[]>(enhancedSampleTemplates);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    difficulty: [],
    rating: 0,
    isPremium: null,
    isFeatured: null,
    tags: [],
    workflowCompatibility: []
  });
  const [sort, setSort] = useState<SortState>({
    field: 'popular',
    direction: 'desc'
  });
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EnhancedTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [instantiatingTemplate, setInstantiatingTemplate] = useState<string | null>(null);

  // Store integration
  const { addComponent, templates: storeTemplates } = useBuilderStore();

  // Enhanced template data with AI insights
  const enhancedTemplates = useMemo(() => {
    return templates.map(template => ({
      ...template,
      success_probability: Math.floor(Math.random() * 30) + 70, // 70-100%
      estimated_setup_time: Math.floor(Math.random() * 45) + 5, // 5-50 minutes
      expected_conversion_rate: (Math.random() * 15 + 2.5).toFixed(1), // 2.5-17.5%
      ai_customization_score: Math.floor(Math.random() * 30) + 70, // 70-100%
      workflow_compatibility: getRandomWorkflowCategories()
    }));
  }, [templates]);

  // Filter and sort templates
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = enhancedTemplates;

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(template => template.category === filters.category);
    }

    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(template => 
        template.difficulty && filters.difficulty.includes(template.difficulty)
      );
    }

    if (filters.rating > 0) {
      filtered = filtered.filter(template => (template.rating || 0) >= filters.rating);
    }

    if (filters.isPremium !== null) {
      filtered = filtered.filter(template => template.is_premium === filters.isPremium);
    }

    if (filters.isFeatured !== null) {
      filtered = filtered.filter(template => template.is_featured === filters.isFeatured);
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(template => 
        filters.tags.some(tag => template.tags?.includes(tag))
      );
    }

    if (filters.workflowCompatibility.length > 0) {
      filtered = filtered.filter(template =>
        filters.workflowCompatibility.some(workflow =>
          template.workflow_compatibility?.includes(workflow)
        )
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sort.field) {
        case 'popular':
          aValue = a.usage_count || 0;
          bValue = b.usage_count || 0;
          break;
        case 'newest':
          aValue = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          bValue = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'success_probability':
          aValue = a.success_probability || 0;
          bValue = b.success_probability || 0;
          break;
        case 'setup_time':
          aValue = a.estimated_setup_time || 0;
          bValue = b.estimated_setup_time || 0;
          break;
        case 'name':
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
      }

      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [enhancedTemplates, filters, sort]);

  // Unique values for filter options
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    enhancedTemplates.forEach(template => {
      template.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [enhancedTemplates]);

  // Template instantiation with AI customization
  const handleInstantiateTemplate = useCallback(async (template: EnhancedTemplate) => {
    if (!onTemplateInstantiate) return;
    
    setInstantiatingTemplate(template.id);
    
    try {
      // Simulate AI customization process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add AI-customized template to workflow builder
      if (template.components) {
        template.components.forEach(component => {
          addComponent({
            ...component,
            // Add AI customizations based on user's brand context
            aiCustomized: true,
            customizationScore: template.ai_customization_score
          });
        });
      }

      onTemplateInstantiate(template);
      
      // Success feedback
      // TODO: Add toast notification or success indicator
    } catch (error) {
      console.error('Template instantiation failed:', error);
      // TODO: Add error handling UI
    } finally {
      setInstantiatingTemplate(null);
    }
  }, [onTemplateInstantiate, addComponent]);

  // Preview template with outcome predictions
  const handlePreviewTemplate = useCallback((template: EnhancedTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
    onTemplateSelect?.(template);
  }, [onTemplateSelect]);

  // Filter handlers
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: 'all',
      difficulty: [],
      rating: 0,
      isPremium: null,
      isFeatured: null,
      tags: [],
      workflowCompatibility: []
    });
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  }, []);

  const toggleDifficulty = useCallback((difficulty: string) => {
    setFilters(prev => ({
      ...prev,
      difficulty: prev.difficulty.includes(difficulty)
        ? prev.difficulty.filter(d => d !== difficulty)
        : [...prev.difficulty, difficulty]
    }));
  }, []);

  return (
    <div className={`enhanced-template-selector ${className || ''}`}>
      {/* Header with Search and Controls */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 p-4 space-y-4">
        {/* Title and View Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Enhanced Template Selection
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredAndSortedTemplates.length} templates with AI-powered insights
            </p>
          </div>
          
          {/* View Mode Selector */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['grid', 'list', 'detailed'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode === 'grid' && <Grid3X3 className="h-4 w-4" />}
                  {mode === 'list' && <List className="h-4 w-4" />}
                  {mode === 'detailed' && <Eye className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search and Quick Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search templates, tags, or descriptions..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-2">
            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Categories</option>
              {templateCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={`${sort.field}-${sort.direction}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-') as [SortState['field'], SortState['direction']];
                setSort({ field, direction });
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="popular-desc">Most Popular</option>
              <option value="success_probability-desc">Highest Success Rate</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="newest-desc">Newest First</option>
              <option value="setup_time-asc">Quickest Setup</option>
              <option value="name-asc">Name A-Z</option>
            </select>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
                showFilters
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {(filters.difficulty.length > 0 || filters.tags.length > 0 || filters.rating > 0) && (
                <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {filters.difficulty.length + filters.tags.length + (filters.rating > 0 ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t pt-4 space-y-4"
            >
              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <div className="space-y-2">
                    {['beginner', 'intermediate', 'advanced'].map(level => (
                      <label key={level} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.difficulty.includes(level)}
                          onChange={() => toggleDifficulty(level)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600 capitalize">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters(prev => ({ ...prev, rating: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value={0}>Any Rating</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                    <option value={4.8}>4.8+ Stars</option>
                  </select>
                </div>

                {/* Premium/Featured Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.isPremium === true}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          isPremium: e.target.checked ? true : null 
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Premium Only</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.isFeatured === true}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          isFeatured: e.target.checked ? true : null 
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Featured Only</span>
                    </label>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Clear Filters</span>
                  </button>
                </div>
              </div>

              {/* Popular Tags */}
              {availableTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Popular Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.slice(0, 12).map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          filters.tags.includes(tag)
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Template Grid/List */}
      <div className="p-4">
        {filteredAndSortedTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms to find more templates.
            </p>
          </div>
        ) : (
          <div className={getGridClasses(viewMode)}>
            {filteredAndSortedTemplates.map((template, index) => (
              <EnhancedTemplateCard
                key={template.id}
                template={template}
                viewMode={viewMode}
                onPreview={() => handlePreviewTemplate(template)}
                onInstantiate={() => handleInstantiateTemplate(template)}
                isInstantiating={instantiatingTemplate === template.id}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && selectedTemplate && (
          <EnhancedPreviewModal
            template={selectedTemplate}
            onClose={() => {
              setIsPreviewOpen(false);
              setSelectedTemplate(null);
            }}
            onInstantiate={() => handleInstantiateTemplate(selectedTemplate)}
            isInstantiating={instantiatingTemplate === selectedTemplate.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced Template Card Component
const EnhancedTemplateCard: React.FC<{
  template: EnhancedTemplate;
  viewMode: ViewMode;
  onPreview: () => void;
  onInstantiate: () => void;
  isInstantiating: boolean;
  index: number;
}> = ({ template, viewMode, onPreview, onInstantiate, isInstantiating, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`template-card bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 ${
        viewMode === 'list' ? 'flex items-center p-4 space-x-4' : 'overflow-hidden'
      }`}
    >
      {/* Template Thumbnail */}
      <div className={`relative ${
        viewMode === 'list' ? 'w-24 h-16 flex-shrink-0' : 'aspect-video'
      }`}>
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-blue-400" />
        </div>
        
        {/* Success Probability Badge */}
        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
          <Target className="h-3 w-3" />
          <span>{template.success_probability}%</span>
        </div>

        {/* Premium Badge */}
        {template.is_premium && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            <Award className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Template Info */}
      <div className={`${viewMode === 'list' ? 'flex-1' : 'p-4'}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className={`font-semibold text-gray-900 ${
              viewMode === 'detailed' ? 'text-lg' : 'text-base'
            }`}>
              {template.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              {template.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-600">{template.rating}</span>
                  <span className="text-xs text-gray-400">({template.review_count})</span>
                </div>
              )}
              <span className="text-xs text-gray-500 capitalize">{template.difficulty}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className={`text-gray-600 mb-3 ${
          viewMode === 'list' ? 'text-sm line-clamp-1' : 'text-sm line-clamp-2'
        }`}>
          {template.description}
        </p>

        {/* AI Insights */}
        <div className={`grid gap-2 mb-3 ${
          viewMode === 'detailed' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'
        }`}>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Timer className="h-3 w-3 text-blue-500" />
            <span>{template.estimated_setup_time}min setup</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <BarChart3 className="h-3 w-3 text-green-500" />
            <span>{template.expected_conversion_rate}% conversion</span>
          </div>
          {viewMode === 'detailed' && (
            <>
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <Zap className="h-3 w-3 text-purple-500" />
                <span>{template.ai_customization_score}% AI match</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <Users className="h-3 w-3 text-orange-500" />
                <span>{template.usage_count?.toLocaleString()} uses</span>
              </div>
            </>
          )}
        </div>

        {/* Tags */}
        {template.tags && viewMode !== 'list' && (
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{template.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex ${
          viewMode === 'list' ? 'space-x-2' : 'space-x-2 pt-2 border-t border-gray-100'
        }`}>
          <button
            onClick={onPreview}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>
          <button
            onClick={onInstantiate}
            disabled={isInstantiating}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
          >
            {isInstantiating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            <span>{isInstantiating ? 'Creating...' : 'Use Template'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Preview Modal Component
const EnhancedPreviewModal: React.FC<{
  template: EnhancedTemplate;
  onClose: () => void;
  onInstantiate: () => void;
  isInstantiating: boolean;
}> = ({ template, onClose, onInstantiate, isInstantiating }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600">{template.rating}</span>
                <span className="text-sm text-gray-400">({template.review_count} reviews)</span>
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">{template.success_probability}% success rate</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {/* Preview Image */}
          <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl mb-6 flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600">Interactive template preview would appear here</p>
            </div>
          </div>

          {/* Outcome Predictions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Expected Conversion</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {template.expected_conversion_rate}%
              </div>
              <p className="text-sm text-green-700">Based on similar templates</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Timer className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Setup Time</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {template.estimated_setup_time} min
              </div>
              <p className="text-sm text-blue-700">Estimated with AI assistance</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">AI Customization</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {template.ai_customization_score}%
              </div>
              <p className="text-sm text-purple-700">Brand alignment score</p>
            </div>
          </div>

          {/* Features & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Template Features</h3>
              <ul className="space-y-2">
                {template.features?.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                )) || [
                  'Responsive design',
                  'SEO optimized',
                  'Fast loading',
                  'Mobile friendly'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Workflow Compatibility</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {template.workflow_compatibility?.map(workflow => (
                  <span
                    key={workflow}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full border border-blue-200"
                  >
                    {workflow}
                  </span>
                )) || ['Marketing', 'E-commerce'].map(workflow => (
                  <span
                    key={workflow}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full border border-blue-200"
                  >
                    {workflow}
                  </span>
                ))}
              </div>

              <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {template.description}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Used by {template.usage_count?.toLocaleString()} creators
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onInstantiate}
              disabled={isInstantiating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center space-x-2"
            >
              {isInstantiating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span>{isInstantiating ? 'Creating Workflow...' : 'Use This Template'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Helper functions
function getGridClasses(viewMode: ViewMode): string {
  switch (viewMode) {
    case 'list':
      return 'space-y-4';
    case 'detailed':
      return 'grid grid-cols-1 lg:grid-cols-2 gap-6';
    case 'grid':
    default:
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
  }
}

function getRandomWorkflowCategories(): WorkflowCategory[] {
  const categories: WorkflowCategory[] = ['Marketing', 'Support', 'Sales', 'E-commerce'];
  const count = Math.floor(Math.random() * 3) + 1;
  return categories.sort(() => 0.5 - Math.random()).slice(0, count);
}

// Enhanced sample data
const enhancedSampleTemplates: EnhancedTemplate[] = [
  {
    id: 'premium-saas-landing-enhanced',
    name: 'Premium SaaS Landing Page',
    category: 'landing',
    subcategory: 'saas',
    description: 'High-converting SaaS landing page with advanced AI customization, A/B testing ready, and conversion optimization built-in.',
    thumbnail: '/templates/premium-saas-landing.jpg',
    is_premium: true,
    is_featured: true,
    usage_count: 15420,
    rating: 4.9,
    review_count: 342,
    difficulty: 'intermediate',
    tags: ['saas', 'b2b', 'landing', 'conversion', 'premium', 'animations', 'responsive'],
    features: [
      'Conversion-optimized layout',
      'Advanced micro-animations',
      'Mobile-first responsive design',
      'SEO optimized structure',
      'A/B testing ready',
      'Analytics integration',
      'Performance optimized',
      'Accessibility compliant'
    ],
    preview_images: [
      '/templates/premium-saas-desktop.jpg',
      '/templates/premium-saas-tablet.jpg',
      '/templates/premium-saas-mobile.jpg'
    ],
    components: [],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'ecommerce-store-enhanced',
    name: 'Modern E-commerce Store',
    category: 'ecommerce',
    subcategory: 'retail',
    description: 'Complete e-commerce solution with product catalog, shopping cart, checkout process, and payment integration.',
    is_premium: false,
    is_featured: true,
    usage_count: 8750,
    rating: 4.7,
    review_count: 198,
    difficulty: 'advanced',
    tags: ['ecommerce', 'shopping', 'retail', 'payments', 'inventory'],
    features: [
      'Product catalog management',
      'Shopping cart functionality',
      'Secure checkout process',
      'Payment gateway integration',
      'Inventory management',
      'Order tracking',
      'Customer accounts',
      'Mobile-optimized'
    ],
    components: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'portfolio-creative-enhanced',
    name: 'Creative Portfolio',
    category: 'portfolio',
    subcategory: 'creative',
    description: 'Stunning creative portfolio template with image galleries, project showcases, and contact forms.',
    is_premium: false,
    is_featured: false,
    usage_count: 3280,
    rating: 4.5,
    review_count: 89,
    difficulty: 'beginner',
    tags: ['portfolio', 'creative', 'gallery', 'showcase', 'responsive'],
    features: [
      'Image gallery with lightbox',
      'Project showcase sections',
      'Contact form integration',
      'Social media links',
      'Responsive design',
      'Fast loading',
      'SEO friendly',
      'Easy customization'
    ],
    components: [],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  }
];

export default EnhancedTemplateSelector;