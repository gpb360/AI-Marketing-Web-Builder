'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useBuilderStore, Template } from '@/store/builderStore';
import { cn } from '@/lib/utils';
import {
  Search,
  Eye,
  Sparkles,
  Clock,
  Star,
  Check,
  ExternalLink,
  Zap,
  ArrowRight,
  Grid3x3,
  List,
  Filter,
} from 'lucide-react';

interface TemplateSelectorProps {
  onTemplateSelect?: (template: Template) => void;
  preselectedTemplate?: Template | null;
  showIntelligenceScores?: boolean;
  businessContext?: any;
  className?: string;
}

// Sample template data for MVP
const sampleTemplates: Template[] = [
  {
    id: 'saas-landing-01',
    name: 'Modern SaaS Landing',
    description: 'Professional landing page for SaaS products with lead capture',
    category: 'SaaS',
    thumbnail: '/templates/saas-landing-01.jpg',
    preview: '/templates/preview/saas-landing-01.html',
    components: [
      {
        id: 'nav-1',
        type: 'navigation',
        name: 'Main Navigation',
        props: { logo: 'Your Logo', links: [{ text: 'Features', href: '#features' }, { text: 'Pricing', href: '#pricing' }, { text: 'Contact', href: '#contact' }] },
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 80 },
        styles: { backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' },
        order: 1,
      },
      {
        id: 'hero-1',
        type: 'hero',
        name: 'Hero Section',
        props: {
          title: 'Build Amazing SaaS Products',
          subtitle: 'The fastest way to launch your next big idea',
          ctaText: 'Start Free Trial',
          ctaLink: '#signup',
        },
        position: { x: 0, y: 80 },
        size: { width: 1200, height: 600 },
        styles: { backgroundColor: '#f9fafb', padding: '80px 20px' },
        order: 2,
      },
      {
        id: 'form-1',
        type: 'form',
        name: 'Lead Capture Form',
        props: {
          title: 'Get Early Access',
          fields: ['name', 'email', 'company'],
          submitText: 'Join Waitlist',
        },
        position: { x: 800, y: 300 },
        size: { width: 350, height: 400 },
        styles: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px' },
        order: 3,
      },
    ],
    features: ['Responsive Design', 'Lead Capture', 'SEO Optimized'],
    pricing: 'free',
    setupTimeMinutes: 15,
    rating: 4.8,
    usageCount: 1247,
    isNew: false,
    isFeatured: true,
    isPremium: false,
  },
  {
    id: 'ecommerce-store-01',
    name: 'E-commerce Store',
    description: 'Complete online store template with product showcase',
    category: 'E-commerce',
    thumbnail: '/templates/ecommerce-store-01.jpg',
    preview: '/templates/preview/ecommerce-store-01.html',
    components: [
      {
        id: 'nav-2',
        type: 'navigation',
        name: 'Store Navigation',
        props: { logo: 'Store Logo', links: [{ text: 'Shop', href: '#shop' }, { text: 'About', href: '#about' }, { text: 'Cart', href: '#cart' }] },
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 80 },
        styles: { backgroundColor: '#1f2937', color: '#ffffff' },
        order: 1,
      },
      {
        id: 'hero-2',
        type: 'hero',
        name: 'Store Hero',
        props: {
          title: 'Premium Products',
          subtitle: 'Discover our curated collection',
          ctaText: 'Shop Now',
          ctaLink: '#products',
        },
        position: { x: 0, y: 80 },
        size: { width: 1200, height: 500 },
        styles: { backgroundColor: '#111827', color: '#ffffff', padding: '60px 20px' },
        order: 2,
      },
      {
        id: 'grid-1',
        type: 'grid',
        name: 'Product Grid',
        props: { columns: 4, gap: '20px' },
        position: { x: 40, y: 620 },
        size: { width: 1120, height: 400 },
        styles: { padding: '40px 0' },
        order: 3,
      },
    ],
    features: ['Product Showcase', 'Shopping Cart', 'Payment Integration'],
    pricing: 'premium',
    setupTimeMinutes: 25,
    rating: 4.6,
    usageCount: 892,
    isNew: false,
    isFeatured: false,
    isPremium: true,
  },
  {
    id: 'portfolio-creative-01',
    name: 'Creative Portfolio',
    description: 'Stunning portfolio template for designers and creatives',
    category: 'Portfolio',
    thumbnail: '/templates/portfolio-creative-01.jpg',
    preview: '/templates/preview/portfolio-creative-01.html',
    components: [
      {
        id: 'header-1',
        type: 'header',
        name: 'Portfolio Header',
        props: { title: 'John Doe', subtitle: 'Creative Designer' },
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 400 },
        styles: { backgroundColor: '#0f172a', color: '#ffffff', textAlign: 'center', padding: '120px 20px' },
        order: 1,
      },
      {
        id: 'grid-2',
        type: 'grid',
        name: 'Project Grid',
        props: { columns: 3, gap: '30px' },
        position: { x: 60, y: 450 },
        size: { width: 1080, height: 600 },
        styles: { padding: '60px 0' },
        order: 2,
      },
    ],
    features: ['Project Showcase', 'Contact Form', 'Social Links'],
    pricing: 'free',
    setupTimeMinutes: 20,
    rating: 4.9,
    usageCount: 567,
    isNew: true,
    isFeatured: true,
    isPremium: false,
  },
];

const categories = ['All', 'SaaS', 'E-commerce', 'Portfolio', 'Blog', 'Corporate', 'Restaurant'];

export function TemplateSelector({
  onTemplateSelect,
  preselectedTemplate,
  showIntelligenceScores = false,
  businessContext,
  className,
}: TemplateSelectorProps) {
  const router = useRouter();
  const { loadTemplate } = useBuilderStore();
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const filteredTemplates = sampleTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTemplateSelect = useCallback((template: Template) => {
    // Load template into builder store
    loadTemplate(template);
    
    // Call external handler if provided
    onTemplateSelect?.(template);
    
    // Navigate to builder
    router.push('/builder');
  }, [loadTemplate, onTemplateSelect, router]);

  const handlePreview = (templateId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setShowPreview(templateId);
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTemplates.map(template => (
        <div
          key={template.id}
          className={cn(
            "bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group",
            preselectedTemplate?.id === template.id && "ring-2 ring-blue-500 shadow-lg"
          )}
          onClick={() => handleTemplateSelect(template)}
        >
          {/* Template Thumbnail */}
          <div className="aspect-video bg-gray-100 relative overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400 mb-2">{template.name}</div>
                <div className="text-sm text-gray-500">{template.category}</div>
              </div>
            </div>
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="flex space-x-3">
                <button
                  onClick={(e) => handlePreview(template.id, e)}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>Use</span>
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex space-x-2">
              {template.isNew && (
                <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                  New
                </span>
              )}
              {template.isFeatured && (
                <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded-full">
                  <Star className="w-3 h-3 inline mr-1" />
                  Featured
                </span>
              )}
              {template.isPremium && (
                <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Premium
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs font-medium">{template.rating}</span>
            </div>
          </div>

          {/* Template Info */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {template.name}
              </h3>
              {template.pricing === 'premium' && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Premium
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {template.description}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{template.setupTimeMinutes}min setup</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{template.usageCount} uses</span>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-1">
              {template.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredTemplates.map(template => (
        <div
          key={template.id}
          className={cn(
            "bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-300 cursor-pointer",
            preselectedTemplate?.id === template.id && "ring-2 ring-blue-500 shadow-md"
          )}
          onClick={() => handleTemplateSelect(template)}
        >
          <div className="flex items-center space-x-4">
            {/* Thumbnail */}
            <div className="w-20 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex-shrink-0 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">{template.category}</span>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  
                  {/* Features */}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{template.setupTimeMinutes}min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{template.rating}</span>
                    </div>
                    <span>{template.usageCount} uses</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {template.isNew && (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                      New
                    </span>
                  )}
                  {template.isFeatured && (
                    <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded-full">
                      Featured
                    </span>
                  )}
                  <button
                    onClick={(e) => handlePreview(template.id, e)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Choose Your Template</h2>
          <p className="text-gray-600 mt-1">
            Select from {filteredTemplates.length} professional templates to get started quickly
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === 'grid' ? "bg-white shadow-sm" : "hover:bg-gray-200"
            )}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === 'list' ? "bg-white shadow-sm" : "hover:bg-gray-200"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors",
                selectedCategory === category
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      {businessContext && showIntelligenceScores && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">AI Recommendations</h3>
          </div>
          <p className="text-sm text-purple-700">
            Based on your business profile, we recommend templates optimized for {businessContext?.industry_classification?.primary || 'your industry'}.
          </p>
        </div>
      )}

      {/* Templates */}
      {filteredTemplates.length > 0 ? (
        viewMode === 'grid' ? renderGridView() : renderListView()
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold">Template Preview</h3>
              <button
                onClick={() => setShowPreview(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="flex-1 bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-4">🎨</div>
                <p className="text-gray-600">Template preview will load here</p>
                <p className="text-sm text-gray-500 mt-2">
                  Preview ID: {showPreview}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => setShowPreview(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const template = sampleTemplates.find(t => t.id === showPreview);
                  if (template) {
                    handleTemplateSelect(template);
                  }
                }}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}