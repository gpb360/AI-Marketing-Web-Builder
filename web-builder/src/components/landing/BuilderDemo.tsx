'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layout, 
  Type, 
  Image, 
  Button, 
  Mail, 
  Zap, 
  BarChart3, 
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export function BuilderDemo() {
  const [activeTab, setActiveTab] = useState('visual');

  const tabs = [
    { id: 'visual', label: 'Visual Builder', icon: Layout },
    { id: 'workflows', label: 'AI Workflows', icon: Zap },
    { id: 'analytics', label: 'Live Analytics', icon: BarChart3 },
  ];

  const components = [
    { id: 'header', name: 'Header', icon: Layout, color: 'bg-blue-500' },
    { id: 'text', name: 'Text Block', icon: Type, color: 'bg-green-500' },
    { id: 'image', name: 'Image', icon: Image, color: 'bg-purple-500' },
    { id: 'button', name: 'CTA Button', icon: Button, color: 'bg-yellow-500' },
    { id: 'form', name: 'Contact Form', icon: Mail, color: 'bg-red-500' },
  ];

  const aiSuggestions = [
    { text: 'Add urgency with countdown timer', confidence: 95 },
    { text: 'Optimize form for mobile conversion', confidence: 88 },
    { text: 'A/B test button color variations', confidence: 92 },
    { text: 'Add social proof testimonials', confidence: 85 },
  ];

  return (
    <section id="platform" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            See It In Action
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Watch how our platform transforms your ideas into high-converting marketing systems
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8"
        >
          {/* Demo Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-yellow-400 text-black'
                      : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Demo Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Components Panel */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-4">
                  COMPONENTS
                </h3>
                <div className="space-y-3">
                  {components.map((component) => {
                    const Icon = component.icon;
                    return (
                      <motion.div
                        key={component.id}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-yellow-400/50 transition-all duration-200 cursor-pointer"
                      >
                        <div className={`w-8 h-8 ${component.color} rounded-lg flex items-center justify-center`}>
                          <Icon size={16} className="text-white" />
                        </div>
                        <span className="text-gray-300 text-sm font-medium">
                          {component.name}
                        </span>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full ml-auto" />
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Visual Canvas */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-yellow-400/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                    CANVAS
                  </h3>
                  <span className="text-xs text-yellow-400 font-medium">
                    Contact Form Component
                  </span>
                </div>
                <div className="bg-gray-900 rounded-lg p-6 border-2 border-dashed border-yellow-400/30">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-700 rounded w-3/4" />
                    <div className="h-10 bg-gray-700 rounded" />
                    <div className="h-10 bg-gray-700 rounded" />
                    <div className="h-12 bg-yellow-400/20 border border-yellow-400 rounded flex items-center justify-center">
                      <span className="text-yellow-400 text-sm font-medium">Submit</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-4 flex items-center gap-2">
                  <Sparkles size={14} className="text-yellow-400" />
                  AI SUGGESTIONS
                </h3>
                <div className="space-y-3">
                  {aiSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-gray-700/30 rounded-lg border border-gray-600 hover:border-yellow-400/50 transition-all duration-200"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {suggestion.text}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-600 rounded-full h-1">
                          <div 
                            className="bg-yellow-400 h-1 rounded-full transition-all duration-500"
                            style={{ width: `${suggestion.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {suggestion.confidence}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
