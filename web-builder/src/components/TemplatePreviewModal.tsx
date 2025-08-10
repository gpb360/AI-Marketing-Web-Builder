'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Eye, 
  Download, 
  ExternalLink, 
  Star, 
  Users, 
  Clock, 
  Monitor, 
  Tablet, 
  Smartphone,
  Sparkles,
  TrendingUp,
  Award,
  Bookmark,
  BookmarkCheck,
  Zap,
  Shield,
  Palette,
  Layout
} from 'lucide-react';
import { useBuilderStore } from '@/store/builderStore';

interface Template {
  id: number | string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  thumbnail_url?: string;
  preview_image_url?: string;
  is_premium: boolean;
  is_featured: boolean;
  usage_count: number;
  rating: number;
  review_count: number;
  tags: string[];
  created_at: string;
  components: any[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  features?: string[];
}

interface TemplatePreviewModalProps {
  template: Template;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate?: (template: Template) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  onUseTemplate,
}) => {
  const [currentDevice, setCurrentDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const { loadTemplate } = useBuilderStore();

  // Generate preview features based on template data
  const templateFeatures = template.features || [
    'Responsive Design',
    'SEO Optimized',
    'Mobile First',
    'Performance Optimized',
    'Conversion Focused',
    'Easy to Customize'
  ];

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-500 bg-green-100';
      case 'intermediate': return 'text-yellow-500 bg-yellow-100';
      case 'advanced': return 'text-red-500 bg-red-100';
      default: return 'text-blue-500 bg-blue-100';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const deviceFrameStyles = {
    desktop: {
      width: '100%',
      height: '500px',
      borderRadius: '8px',
    },
    tablet: {
      width: '600px',
      height: '450px',
      borderRadius: '12px',
      border: '8px solid #1f2937',
    },
    mobile: {
      width: '300px',
      height: '550px',
      borderRadius: '20px',
      border: '8px solid #1f2937',
    }
  };

  const handleUseTemplate = () => {
    if (onUseTemplate) {
      onUseTemplate(template);
    } else if (typeof template.id === 'string') {
      // Load template using the store
      loadTemplate(template.id);
    }
    onClose();
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement actual bookmark functionality
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center space-x-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
                    {template.is_premium && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                        <Sparkles className="w-3 h-3" />
                        Premium
                      </div>
                    )}
                    {template.is_featured && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-full">
                        <Award className="w-3 h-3" />
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="capitalize font-medium text-blue-600">{template.category}</span>
                    {template.subcategory && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{template.subcategory}</span>
                      </>
                    )}
                    {template.difficulty && (
                      <>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(template.difficulty)}`}>
                          {template.difficulty}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleBookmark}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Bookmark className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row h-full max-h-[calc(95vh-200px)]">
              {/* Enhanced Preview Area */}
              <div className="lg:w-2/3 bg-gray-50 p-6 overflow-hidden">
                {/* Device Selection Tabs */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border">
                    {[
                      { key: 'desktop', icon: Monitor, label: 'Desktop' },
                      { key: 'tablet', icon: Tablet, label: 'Tablet' },
                      { key: 'mobile', icon: Smartphone, label: 'Mobile' }
                    ].map(({ key, icon: Icon, label }) => (
                      <button
                        key={key}
                        onClick={() => setCurrentDevice(key as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          currentDevice === key
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFeatures(!showFeatures)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Layout className="w-4 h-4" />
                      {showFeatures ? 'Hide' : 'Show'} Features
                    </button>
                  </div>
                </div>

                {/* Preview Frame */}
                <div className="flex justify-center items-center h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-8">
                  <motion.div
                    key={currentDevice}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={deviceFrameStyles[currentDevice]}
                    className="bg-white shadow-2xl overflow-hidden relative"
                  >
                    {/* Mock preview content based on template category */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="text-6xl mb-4 opacity-30">
                          {template.category === 'landing' && '🚀'}
                          {template.category === 'ecommerce' && '🛒'}
                          {template.category === 'blog' && '📝'}
                          {template.category === 'portfolio' && '🎨'}
                          {template.category === 'corporate' && '🏢'}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          {template.name}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          Interactive preview coming soon
                        </p>
                        
                        {/* Live Preview Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Live Demo
                        </motion.button>
                      </div>
                    </div>

                    {/* Device-specific decorations */}
                    {currentDevice === 'mobile' && (
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-400 rounded-full"></div>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Enhanced Details Panel */}
              <div className="lg:w-1/3 p-6 overflow-y-auto bg-white">
                <div className="space-y-6">
                  {/* Rating and Stats */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(template.rating)}</div>
                        <span className="font-semibold text-gray-900">{template.rating}</span>
                        <span className="text-gray-500 text-sm">({template.review_count})</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <TrendingUp className="w-4 h-4" />
                        Trending
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Downloads</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {template.usage_count.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Updated</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(template.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About this template</h3>
                    <p className="text-gray-700 leading-relaxed">{template.description}</p>
                  </div>

                  {/* Features Toggle */}
                  <AnimatePresence>
                    {showFeatures && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-blue-50 rounded-lg p-4"
                      >
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-500" />
                          Key Features
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {templateFeatures.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tags */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag) => (
                        <motion.span
                          key={tag}
                          whileHover={{ scale: 1.05 }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer"
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Premium Features */}
                  {template.is_premium && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="text-purple-700 font-semibold">Premium Template</span>
                      </div>
                      <p className="text-sm text-purple-600 mb-3">
                        This premium template includes advanced features, priority support, and lifetime updates.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-purple-600">
                        <Shield className="w-3 h-3" />
                        <span>30-day money-back guarantee</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4 border-t">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleUseTemplate}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      Use This Template
                    </motion.button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        <Palette className="w-4 h-4" />
                        Customize
                      </button>
                    </div>
                  </div>

                  {/* Component count */}
                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      This template includes <span className="font-semibold text-gray-700">{template.components.length} components</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};