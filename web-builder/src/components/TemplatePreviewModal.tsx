'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Download, ExternalLink, Star, Users, Clock } from 'lucide-react';

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
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
}

interface TemplatePreviewModalProps {
  template: Template;
  isOpen: boolean;
  onClose: () => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
      />
    ));
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h2 className="text-2xl font-bold text-white">{template.name}</h2>
                <p className="text-gray-400 mt-1">{template.category} Template</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row h-full">
              {/* Preview */}
              <div className="lg:w-2/3 bg-gray-800/50 p-6">
                <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg overflow-hidden">
                  {/* Placeholder for actual template preview */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-8xl mb-4 opacity-20">
                        {template.category === 'SaaS' && '💼'}
                        {template.category === 'E-commerce' && '🛒'}
                        {template.category === 'Agency' && '🏢'}
                        {template.category === 'Startup' && '🚀'}
                        {template.category === 'Enterprise' && '🏭'}
                        {template.category === 'Portfolio' && '🎨'}
                        {template.category === 'Blog' && '📝'}
                        {template.category === 'Restaurant' && '🍽️'}
                      </div>
                      <p className="text-gray-400">Template Preview</p>
                    </div>
                  </div>

                  {/* Live Preview Button */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center gap-2">
                      <ExternalLink className="w-5 h-5" />
                      View Live Demo
                    </button>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="lg:w-1/3 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Rating */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Rating</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(template.rating)}</div>
                      <span className="text-white font-semibold">{template.rating}</span>
                      <span className="text-gray-400">({template.review_count} reviews)</span>
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Usage Stats</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Total Downloads</span>
                        <span className="text-white font-semibold flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {template.usage_count.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Created</span>
                        <span className="text-white font-semibold flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(template.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                    <p className="text-gray-300">{template.description}</p>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Premium Badge */}
                  {template.is_premium && (
                    <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-purple-400 font-semibold">Premium Template</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        This premium template includes advanced features, priority support, and lifetime updates.
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-3">
                    <button className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" />
                      Use This Template
                    </button>
                    <button className="w-full border border-gray-700 text-gray-300 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                      Preview in Builder
                    </button>
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