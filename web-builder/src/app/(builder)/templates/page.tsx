'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Zap,
  Target,
  CheckCircle,
  Search,
  Star,
  Eye,
  Download,
  ExternalLink,
  Heart,
  Users,
  TrendingUp
} from 'lucide-react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { TemplatePreviewModal } from '@/components/TemplatePreviewModal';
import { useBuilderStore } from '@/store/builderStore';
import { AuthGuard } from '@/components/auth/AuthGuard';
import debounce from 'lodash.debounce';

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

// Extended template data with ratings and reviews
const extendedTemplates: Template[] = [
  {
    id: 1,
    name: "SaaS Pro Template",
    description: "Complete SaaS landing page with pricing, features, and conversion optimization. Built for high-converting SaaS businesses with modern design patterns.",
    category: "SaaS",
    thumbnail_url: "/templates/saas-pro-hero.jpg",
    preview_image_url: "/templates/saas-pro-full.jpg",
    is_premium: true,
    is_featured: true,
    usage_count: 2847,
    rating: 4.8,
    review_count: 156,
    tags: ["SaaS", "Conversion", "Modern", "Premium"],
    created_at: "2024-01-15",
    components: [
      {
        id: "saas-hero-1",
        type: "hero",
        name: "Hero Section",
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 600 },
        order: 1,
        props: {
          heading: "Scale Your SaaS Business",
          subheading: "Powerful tools and analytics to grow your subscription business faster",
          buttonText: "Start Free Trial",
          backgroundImage: "/templates/saas-hero-bg.jpg",
          theme: "dark"
        }
      },
      {
        id: "saas-features-1",
        type: "features",
        name: "Features Section",
        position: { x: 0, y: 620 },
        size: { width: 1200, height: 400 },
        order: 2,
        props: {
          title: "Everything you need to succeed",
          features: [
            { title: "Advanced Analytics", description: "Deep insights into your business metrics" },
            { title: "Team Collaboration", description: "Work together seamlessly" },
            { title: "API Integration", description: "Connect with your favorite tools" }
          ]
        }
      }
    ]
  },
  {
    id: 2,
    name: "E-commerce Empire",
    description: "Full e-commerce solution with product catalogs, shopping cart, and seamless checkout flows. Perfect for online stores of any size.",
    category: "E-commerce",
    thumbnail_url: "/templates/ecommerce-hero.jpg",
    preview_image_url: "/templates/ecommerce-full.jpg",
    is_premium: true,
    is_featured: true,
    usage_count: 1923,
    rating: 4.9,
    review_count: 203,
    tags: ["E-commerce", "Shopping", "Products", "Checkout"],
    created_at: "2024-01-20",
    components: [
      {
        id: "ecom-hero-1",
        type: "hero",
        name: "Hero Section",
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 500 },
        order: 1,
        props: {
          heading: "Premium Fashion Store",
          subheading: "Discover the latest trends and timeless classics",
          buttonText: "Shop Now",
          theme: "light"
        }
      },
      {
        id: "ecom-products-1",
        type: "products",
        name: "Product Grid",
        position: { x: 0, y: 520 },
        size: { width: 1200, height: 600 },
        order: 2,
        props: {
          title: "Featured Products",
          columns: 4,
          showPricing: true,
          showRatings: true
        }
      }
    ]
  },
  {
    id: 3,
    name: "Agency Showcase",
    description: "Professional agency website with stunning portfolio gallery, client testimonials, and lead generation forms.",
    category: "Agency",
    thumbnail_url: "/templates/agency-hero.jpg",
    preview_image_url: "/templates/agency-full.jpg",
    is_premium: false,
    is_featured: true,
    usage_count: 3456,
    rating: 4.7,
    review_count: 189,
    tags: ["Agency", "Portfolio", "Professional", "Services"],
    created_at: "2024-01-10",
    components: [
      {
        id: "agency-hero-1",
        type: "hero",
        name: "Hero Section",
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 650 },
        order: 1,
        props: {
          heading: "Creative Digital Agency",
          subheading: "We create exceptional digital experiences that drive results",
          buttonText: "View Our Work",
          theme: "gradient"
        }
      },
      {
        id: "agency-services-1",
        type: "services",
        name: "Services Section",
        position: { x: 0, y: 670 },
        size: { width: 1200, height: 400 },
        order: 2,
        props: {
          title: "Our Services",
          services: [
            { title: "Web Design", description: "Custom website design and development" },
            { title: "Branding", description: "Complete brand identity solutions" },
            { title: "Digital Marketing", description: "Data-driven marketing strategies" }
          ]
        }
      }
    ]
  },
  {
    id: 4,
    name: "Startup Launchpad",
    description: "Modern startup landing page with investor-ready design, team showcase, and compelling roadmap presentation.",
    category: "Startup",
    thumbnail_url: "/templates/startup-hero.jpg",
    preview_image_url: "/templates/startup-full.jpg",
    is_premium: false,
    is_featured: false,
    usage_count: 892,
    rating: 4.6,
    review_count: 67,
    tags: ["Startup", "Investor", "Pitch", "Growth"],
    created_at: "2024-01-25",
    components: [
      {
        id: "startup-hero-1",
        type: "hero",
        name: "Hero Section",
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 600 },
        order: 1,
        props: {
          heading: "The Future is Here",
          subheading: "Revolutionary technology that changes everything",
          buttonText: "Join Waitlist",
          theme: "tech"
        }
      }
    ]
  },
  {
    id: 5,
    name: "Enterprise Solution",
    description: "Corporate-grade website with advanced features, security compliance, and scalable architecture for large organizations.",
    category: "Enterprise",
    thumbnail_url: "/templates/enterprise-hero.jpg",
    preview_image_url: "/templates/enterprise-full.jpg",
    is_premium: true,
    is_featured: true,
    usage_count: 567,
    rating: 4.9,
    review_count: 89,
    tags: ["Enterprise", "Corporate", "Security", "Scale"],
    created_at: "2024-01-08",
    components: [
      {
        id: "enterprise-hero-1",
        type: "hero",
        name: "Hero Section",
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 550 },
        order: 1,
        props: {
          heading: "Enterprise Solutions",
          subheading: "Secure, scalable, and compliant solutions for large organizations",
          buttonText: "Contact Sales",
          theme: "corporate"
        }
      }
    ]
  },
  {
    id: 6,
    name: "Portfolio Master",
    description: "Creative portfolio layout with stunning project gallery, smooth animations, and client showcase capabilities.",
    category: "Portfolio",
    thumbnail_url: "/templates/portfolio-hero.jpg",
    preview_image_url: "/templates/portfolio-full.jpg",
    is_premium: false,
    is_featured: false,
    usage_count: 1234,
    rating: 4.5,
    review_count: 78,
    tags: ["Portfolio", "Creative", "Gallery", "Designer"],
    created_at: "2024-01-22",
    components: [
      {
        id: "portfolio-hero-1",
        type: "hero",
        name: "Hero Section",
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 700 },
        order: 1,
        props: {
          heading: "Creative Portfolio",
          subheading: "Showcasing innovative design and development work",
          buttonText: "View Projects",
          theme: "creative"
        }
      }
    ]
  },
  {
    id: 7,
    name: "Blog Authority",
    description: "Content-focused blog layout with SEO optimization, newsletter integration, and social media features.",
    category: "Blog",
    thumbnail_url: "/templates/blog-hero.jpg",
    preview_image_url: "/templates/blog-full.jpg",
    is_premium: false,
    is_featured: false,
    usage_count: 2103,
    rating: 4.4,
    review_count: 134,
    tags: ["Blog", "Content", "SEO", "Newsletter"],
    created_at: "2024-01-18",
    components: [
      {
        id: "blog-hero-1",
        type: "hero",
        name: "Hero Section",
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 400 },
        order: 1,
        props: {
          heading: "The Authority Blog",
          subheading: "Insights, tips, and strategies from industry experts",
          buttonText: "Subscribe",
          theme: "minimal"
        }
      }
    ]
  },
  {
    id: 8,
    name: "Restaurant Pro",
    description: "Elegant restaurant website with online ordering, reservation system, and mouth-watering menu displays.",
    category: "Restaurant",
    thumbnail_url: "/templates/restaurant-hero.jpg",
    preview_image_url: "/templates/restaurant-full.jpg",
    is_premium: true,
    is_featured: false,
    usage_count: 445,
    rating: 4.7,
    review_count: 56,
    tags: ["Restaurant", "Food", "Reservations", "Menu"],
    created_at: "2024-01-12",
    components: [
      {
        id: "restaurant-hero-1",
        type: "hero",
        name: "Hero Section",
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 600 },
        order: 1,
        props: {
          heading: "Fine Dining Experience",
          subheading: "Exquisite cuisine crafted with passion and precision",
          buttonText: "Make Reservation",
          theme: "elegant"
        }
      }
    ]
  }
];

const categories = [
  { id: 'all', name: 'All Templates', count: 8, icon: '🎯' },
  { id: 'SaaS', name: 'SaaS', count: 1, icon: '💼' },
  { id: 'E-commerce', name: 'E-commerce', count: 1, icon: '🛒' },
  { id: 'Agency', name: 'Agency', count: 1, icon: '🏢' },
  { id: 'Startup', name: 'Startup', count: 1, icon: '🚀' },
  { id: 'Enterprise', name: 'Enterprise', count: 1, icon: '🏭' },
  { id: 'Portfolio', name: 'Portfolio', count: 1, icon: '🎨' },
  { id: 'Blog', name: 'Blog', count: 1, icon: '📝' },
  { id: 'Restaurant', name: 'Restaurant', count: 1, icon: '🍽️' }
];

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  
  const router = useRouter();
  const { loadTemplate } = useBuilderStore();

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  const filteredTemplates = useMemo(() => {
    let filtered = [...extendedTemplates];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Premium filter
    if (showPremiumOnly) {
      filtered = filtered.filter(template => template.is_premium);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        case 'popular':
          return b.usage_count - a.usage_count;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [selectedCategory, searchQuery, showPremiumOnly, sortBy]);

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const toggleFavorite = (templateId: number) => {
    setFavorites(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleUseTemplate = (template: Template) => {
    try {
      // Load template into builder store
      loadTemplate(template);
      
      // Navigate to canvas with template loaded
      router.push('/canvas?template=' + template.id);
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
      />
    ));
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-black overflow-x-hidden">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-purple-500/5" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Template Marketplace
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Discover high-converting templates designed for every business type. 
                From startups to enterprises, find the perfect design to accelerate your growth.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search templates by name, category, or features..."
                    className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                    onChange={(e) => debouncedSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-400">{extendedTemplates.length}+</div>
                  <div className="text-sm text-gray-400">Templates</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-400">50K+</div>
                  <div className="text-sm text-gray-400">Downloads</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-400">4.8</div>
                  <div className="text-sm text-gray-400">Avg Rating</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-400">24/7</div>
                  <div className="text-sm text-gray-400">Support</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 border-t border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === category.id
                        ? 'bg-yellow-400 text-black'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                    <span className="ml-2 text-xs opacity-75">({category.count})</span>
                  </motion.button>
                ))}
              </div>

              {/* Sort and Filter Controls */}
              <div className="flex gap-4 items-center">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-yellow-400"
                >
                  <option value="featured">Featured</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPremiumOnly}
                    onChange={(e) => setShowPremiumOnly(e.target.checked)}
                    className="rounded border-gray-600 text-yellow-400 focus:ring-yellow-400"
                  />
                  <span className="text-sm text-gray-300">Premium Only</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Results Count */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">
                {filteredTemplates.length} Templates Found
              </h2>
              <div className="text-sm text-gray-400">
                Showing {Math.min(12, filteredTemplates.length)} of {filteredTemplates.length}
              </div>
            </div>

            {/* Templates Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-400/50 transition-all duration-300 group"
                  >
                    {/* Template Image */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-purple-500/10" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl opacity-20">{categories.find(c => c.id === template.category)?.icon || '🎨'}</div>
                      </div>
                      
                      {/* Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handlePreview(template)}
                            className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Preview
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleFavorite(template.id)}
                            className="bg-gray-700 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            <Heart className={`w-4 h-4 ${favorites.includes(template.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          </motion.button>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {template.is_featured && (
                          <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                            FEATURED
                          </span>
                        )}
                        {template.is_premium && (
                          <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            PREMIUM
                          </span>
                        )}
                      </div>

                      {/* Usage Stats */}
                      <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                        <div className="text-xs text-gray-300 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {template.usage_count.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-white line-clamp-1">{template.name}</h3>
                        <div className="flex items-center gap-1">
                          {renderStars(template.rating)}
                          <span className="text-sm text-gray-400 ml-1">({template.review_count})</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-300 mb-3 line-clamp-2">{template.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleUseTemplate(template)}
                          className="flex-1 bg-yellow-400 text-black py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center justify-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          Use Template
                        </button>
                        <button 
                          onClick={() => handlePreview(template)}
                          className="px-3 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Load More */}
            {filteredTemplates.length > 12 && (
              <div className="text-center mt-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Load More Templates
                </motion.button>
              </div>
            )}

            {/* Empty State */}
            {filteredTemplates.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-white mb-2">No templates found</h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search criteria or browse all templates.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setShowPremiumOnly(false);
                  }}
                  className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Why Choose Our Templates?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-300 max-w-3xl mx-auto"
              >
                Every template is crafted with conversion optimization, mobile responsiveness, 
                and cutting-edge design principles.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: TrendingUp,
                  title: "High Converting",
                  description: "Optimized for maximum conversion rates with proven design patterns"
                },
                {
                  icon: Zap,
                  title: "Lightning Fast",
                  description: "Optimized performance with lazy loading and efficient code structure"
                },
                {
                  icon: Target,
                  title: "Mobile First",
                  description: "Fully responsive designs that look perfect on all devices"
                },
                {
                  icon: CheckCircle,
                  title: "SEO Ready",
                  description: "Built with semantic HTML and structured data for search engines"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-yellow-400/20 border border-yellow-400/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  </AuthGuard>
);
}