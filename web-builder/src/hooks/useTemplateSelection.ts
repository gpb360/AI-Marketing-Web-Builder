'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { sampleTemplates, getTemplateById } from '@/data/templates';

interface TemplateSelectionState {
  isLoading: boolean;
  error: string | null;
  selectedTemplateId: string | null;
  recentlyUsed: string[];
  favorites: Set<string>;
  searchTerm: string;
  selectedCategory: string;
  sortBy: 'popular' | 'newest' | 'rating' | 'name';
}

interface UseTemplateSelectionReturn {
  state: TemplateSelectionState;
  actions: {
    // Template operations
    applyTemplate: (templateId: string) => Promise<void>;
    previewTemplate: (templateId: string) => void;
    selectTemplate: (templateId: string) => void;
    clearSelection: () => void;
    
    // Favorites management
    addToFavorites: (templateId: string) => void;
    removeFromFavorites: (templateId: string) => void;
    toggleFavorite: (templateId: string) => void;
    
    // Search and filtering
    setSearchTerm: (term: string) => void;
    setCategory: (category: string) => void;
    setSortBy: (sort: 'popular' | 'newest' | 'rating' | 'name') => void;
    clearFilters: () => void;
    
    // Utility functions
    getFilteredTemplates: () => any[];
    getTemplateById: (templateId: string) => any | null;
    isTemplateFavorited: (templateId: string) => boolean;
    isTemplateRecentlyUsed: (templateId: string) => boolean;
  };
  analytics: {
    totalTemplates: number;
    filteredCount: number;
    favoriteCount: number;
    recentCount: number;
    categoryStats: Record<string, number>;
  };
}

export const useTemplateSelection = (): UseTemplateSelectionReturn => {
  const { loadTemplate, currentTemplate, canvasComponents } = useBuilderStore();
  
  // Local state management
  const [state, setState] = useState<TemplateSelectionState>({
    isLoading: false,
    error: null,
    selectedTemplateId: null,
    recentlyUsed: [],
    favorites: new Set(),
    searchTerm: '',
    selectedCategory: 'all',
    sortBy: 'popular'
  });

  // Load persisted data from localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('template-favorites');
      const savedRecentlyUsed = localStorage.getItem('template-recently-used');
      
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites);
        setState(prev => ({ ...prev, favorites: new Set(favorites) }));
      }
      
      if (savedRecentlyUsed) {
        const recentlyUsed = JSON.parse(savedRecentlyUsed);
        setState(prev => ({ ...prev, recentlyUsed }));
      }
    } catch (error) {
      console.warn('Failed to load template selection data from localStorage:', error);
    }
  }, []);

  // Persist favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('template-favorites', JSON.stringify(Array.from(state.favorites)));
    } catch (error) {
      console.warn('Failed to save favorites to localStorage:', error);
    }
  }, [state.favorites]);

  // Persist recently used to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('template-recently-used', JSON.stringify(state.recentlyUsed));
    } catch (error) {
      console.warn('Failed to save recently used to localStorage:', error);
    }
  }, [state.recentlyUsed]);

  // Template operations
  const applyTemplate = useCallback(async (templateId: string) => {
    const template = getTemplateById(templateId);
    if (!template) {
      setState(prev => ({ ...prev, error: 'Template not found' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Apply template to builder store
      loadTemplate(template);
      
      // Add to recently used (limit to 10 items)
      setState(prev => ({
        ...prev,
        recentlyUsed: [
          templateId,
          ...prev.recentlyUsed.filter(id => id !== templateId)
        ].slice(0, 10),
        selectedTemplateId: templateId,
        isLoading: false
      }));

    } catch (error) {
      console.error('Failed to apply template:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to apply template',
        isLoading: false 
      }));
    }
  }, [loadTemplate]);

  const previewTemplate = useCallback((templateId: string) => {
    setState(prev => ({ ...prev, selectedTemplateId: templateId }));
  }, []);

  const selectTemplate = useCallback((templateId: string) => {
    setState(prev => ({ ...prev, selectedTemplateId: templateId }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedTemplateId: null }));
  }, []);

  // Favorites management
  const addToFavorites = useCallback((templateId: string) => {
    setState(prev => ({
      ...prev,
      favorites: new Set([...prev.favorites, templateId])
    }));
  }, []);

  const removeFromFavorites = useCallback((templateId: string) => {
    setState(prev => {
      const newFavorites = new Set(prev.favorites);
      newFavorites.delete(templateId);
      return { ...prev, favorites: newFavorites };
    });
  }, []);

  const toggleFavorite = useCallback((templateId: string) => {
    setState(prev => {
      const newFavorites = new Set(prev.favorites);
      if (newFavorites.has(templateId)) {
        newFavorites.delete(templateId);
      } else {
        newFavorites.add(templateId);
      }
      return { ...prev, favorites: newFavorites };
    });
  }, []);

  // Search and filtering
  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setState(prev => ({ ...prev, selectedCategory: category }));
  }, []);

  const setSortBy = useCallback((sort: 'popular' | 'newest' | 'rating' | 'name') => {
    setState(prev => ({ ...prev, sortBy: sort }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchTerm: '',
      selectedCategory: 'all',
      sortBy: 'popular'
    }));
  }, []);

  // Utility functions
  const getFilteredTemplates = useCallback(() => {
    let templates = state.selectedCategory === 'all' 
      ? sampleTemplates 
      : sampleTemplates.filter(t => t.category === state.selectedCategory);

    // Apply search filter
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase();
      templates = templates.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        (template as any).tags?.some((tag: string) => 
          tag.toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply sorting
    templates.sort((a, b) => {
      switch (state.sortBy) {
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
  }, [state.searchTerm, state.selectedCategory, state.sortBy]);

  const getTemplateByIdWrapper = useCallback((templateId: string) => {
    return getTemplateById(templateId) || null;
  }, []);

  const isTemplateFavorited = useCallback((templateId: string) => {
    return state.favorites.has(templateId);
  }, [state.favorites]);

  const isTemplateRecentlyUsed = useCallback((templateId: string) => {
    return state.recentlyUsed.includes(templateId);
  }, [state.recentlyUsed]);

  // Analytics
  const analytics = useMemo(() => {
    const filteredTemplates = getFilteredTemplates();
    
    // Calculate category stats
    const categoryStats: Record<string, number> = {};
    sampleTemplates.forEach(template => {
      categoryStats[template.category] = (categoryStats[template.category] || 0) + 1;
    });

    return {
      totalTemplates: sampleTemplates.length,
      filteredCount: filteredTemplates.length,
      favoriteCount: state.favorites.size,
      recentCount: state.recentlyUsed.length,
      categoryStats
    };
  }, [getFilteredTemplates, state.favorites.size, state.recentlyUsed.length]);

  return {
    state,
    actions: {
      applyTemplate,
      previewTemplate,
      selectTemplate,
      clearSelection,
      addToFavorites,
      removeFromFavorites,
      toggleFavorite,
      setSearchTerm,
      setCategory,
      setSortBy,
      clearFilters,
      getFilteredTemplates,
      getTemplateById: getTemplateByIdWrapper,
      isTemplateFavorited,
      isTemplateRecentlyUsed
    },
    analytics
  };
};

export default useTemplateSelection;