'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Sparkles,
  ArrowRight,
  Zap,
  Layers,
  Target,
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  Shield,
  Database,
  Workflow,
  GitBranch,
  CheckCircle
} from 'lucide-react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

export default function TemplatesPage() {
  const templates = [
    {
      id: 1,
      title: "SaaS Pro Template",
      description: "Complete SaaS landing page with pricing, features, and conversion optimization",
      category: "SaaS",
      features: ["Pricing Tables", "Feature Showcase", "CTA Optimization"],
      image: "/api/placeholder/400/300"
    },
    {
      id: 2,
      title: "E-commerce Template",
      description: "Full e-commerce solution with product catalogs and checkout flows",
      category: "E-commerce",
      features: ["Product Catalog", "Shopping Cart", "Payment Integration"],
      image: "/api/placeholder/400/300"
    },
    {
      id: 3,
      title: "Agency Template",
      description: "Professional agency website with portfolio and client testimonials",
      category: "Agency",
      features: ["Portfolio Gallery", "Client Testimonials", "Contact Forms"],
      image: "/api/placeholder/400/300"
    },
    {
      id: 4,
      title: "Startup Template",
      description: "Modern startup landing page with investor-ready design",
      category: "Startup",
      features: ["Investor Pitch", "Team Showcase", "Roadmap"],
      image: "/api/placeholder/400/300"
    }
  ];

  const workflowFeatures = [
    {
      icon: Zap,
      title: "Drag & Drop",
      description: "Intuitive visual editor"
    },
    {
      icon: Layers,
      title: "Smart Components",
      description: "Pre-built conversion elements"
    },
    {
      icon: Target,
      title: "A/B Testing",
      description: "Built-in optimization tools"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Real-time performance data"
    }
  ];

  const migrationSteps = [
    {
      step: "01",
      title: "Connect & Analyze",
      description: "Our AI analyzes your current website structure, content, and performance metrics to create a migration blueprint.",
      features: ["Content Analysis", "SEO Audit", "Performance Review"]
    },
    {
      step: "02",
      title: "Smart Migration",
      description: "Automated migration preserves your SEO rankings while upgrading your site to our conversion-optimized platform.",
      features: ["SEO Preservation", "Content Transfer", "URL Mapping"]
    },
    {
      step: "03",
      title: "Optimize & Launch",
      description: "Launch your enhanced website with improved conversion rates and built-in marketing automation.",
      features: ["Conversion Optimization", "Marketing Automation", "Performance Monitoring"]
    },
    {
      step: "04",
      title: "Monitor & Scale",
      description: "Continuous optimization with AI-powered insights and automated A/B testing for maximum ROI.",
      features: ["AI Insights", "Auto A/B Testing", "ROI Tracking"]
    }
  ];

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="pt-20">
        {/* Enterprise-Grade Templates Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Enterprise-Grade Templates
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-300 max-w-3xl mx-auto mb-8"
              >
                Choose from our collection of high-converting templates designed for enterprise-level performance and scalability.
              </motion.p>

              {/* Category Filters */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {['All Templates', 'SaaS', 'E-commerce', 'Agency', 'Startup', 'Enterprise'].map((category) => (
                  <button
                    key={category}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      category === 'All Templates'
                        ? 'bg-yellow-400 text-black'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-400/50 transition-all group"
                >
                  <div className="aspect-[4/3] bg-gray-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <div className="text-gray-500 text-6xl">🎨</div>
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors">
                        Preview Template
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">{template.title}</h3>
                      <span className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4">{template.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.features.map((feature) => (
                        <span key={feature} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>

                    <button className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2">
                      Use Template
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Visual Workflow Builder Section */}
        <section className="py-20 bg-gray-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Visual Workflow Builder
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-300 max-w-3xl mx-auto"
              >
                Build complex marketing workflows with our intuitive drag-and-drop interface. No coding required.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {workflowFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-yellow-400/20 border border-yellow-400/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Seamless Platform Migration Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Seamless Platform Migration
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-300 max-w-3xl mx-auto"
              >
                Migrate from any platform without losing SEO rankings or breaking existing workflows.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {migrationSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm mr-3">
                        {step.step}
                      </div>
                      <h3 className="text-xl font-bold text-white">{step.title}</h3>
                    </div>
                    <p className="text-gray-300 mb-4">{step.description}</p>
                    <div className="space-y-2">
                      {step.features.map((feature) => (
                        <div key={feature} className="flex items-center text-sm text-gray-400">
                          <CheckCircle className="w-4 h-4 text-yellow-400 mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  {index < migrationSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-yellow-400" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Real-Time Business Intelligence Section */}
        <section className="py-20 bg-gray-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Real-Time Business Intelligence
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-300 max-w-3xl mx-auto"
              >
                Comprehensive analytics and insights to optimize your marketing performance and drive growth.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-8"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Marketing Performance Dashboard</h3>
                <p className="text-gray-300">Real-time insights into your marketing campaigns and website performance</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">2.5M</div>
                  <div className="text-sm text-gray-400">Monthly Visitors</div>
                  <div className="text-green-400 text-sm">↗ +12.5%</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">18.3%</div>
                  <div className="text-sm text-gray-400">Conversion Rate</div>
                  <div className="text-green-400 text-sm">↗ +3.2%</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">$47,239</div>
                  <div className="text-sm text-gray-400">Monthly Revenue</div>
                  <div className="text-green-400 text-sm">↗ +8.7%</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">127</div>
                  <div className="text-sm text-gray-400">Active Campaigns</div>
                  <div className="text-green-400 text-sm">↗ +15</div>
                </div>
              </div>

              <div className="text-center">
                <button className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors">
                  View Full Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}