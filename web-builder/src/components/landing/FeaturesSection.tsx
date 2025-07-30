'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Zap, 
  BarChart3, 
  Smartphone, 
  Shield, 
  Rocket,
  ArrowRight
} from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Palette,
      title: 'Visual Drag & Drop',
      description: 'Intuitive visual editor with professional components. Build stunning pages without touching code.',
      color: 'from-blue-500 to-cyan-500',
      delay: 0.1,
    },
    {
      icon: Zap,
      title: 'AI-Powered Automation',
      description: 'Smart workflows that connect your website to CRM, email marketing, and lead nurturing automatically.',
      color: 'from-yellow-500 to-orange-500',
      delay: 0.2,
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Track conversions, user behavior, and ROI with built-in analytics that actually matter for your business.',
      color: 'from-green-500 to-emerald-500',
      delay: 0.3,
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Every component is optimized for mobile. Your sites look perfect on any device, automatically.',
      color: 'from-purple-500 to-pink-500',
      delay: 0.4,
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with SSL, GDPR compliance, and data protection built into every feature.',
      color: 'from-red-500 to-rose-500',
      delay: 0.5,
    },
    {
      icon: Rocket,
      title: 'Lightning Fast',
      description: 'Optimized for speed with CDN delivery, image compression, and performance monitoring included.',
      color: 'from-indigo-500 to-blue-500',
      delay: 0.6,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section id="features" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need. Nothing You Don't.
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            The complete marketing platform that bridges the gap between beautiful design and powerful automation
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                className="group relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-black/20"
              >
                {/* Gradient Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Icon */}
                <div className={`relative w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} className="text-white" />
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-yellow-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  
                  {/* Learn More Link */}
                  <div className="flex items-center text-yellow-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    Learn more
                    <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 w-1 h-1 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-6">
            Ready to see these features in action?
          </p>
          <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold px-8 py-4 rounded-lg hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-400/30 inline-flex items-center gap-2">
            Try All Features Free
            <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
