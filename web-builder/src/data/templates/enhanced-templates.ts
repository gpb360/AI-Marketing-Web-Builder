import { Template } from '@/store/builderStore';
import {
  EnhancedTemplate,
  TemplateCategory,
  TemplateIntelligenceScore,
  TemplatePersonalizationData,
  TemplateUsageAnalytics,
  TemplateAIInsights,
  BusinessIndustry,
  BusinessType,
  DesignStyle
} from '@/types/context-aware-templates';

// Convert legacy Template to EnhancedTemplate compatible format
type LegacyEnhancedTemplate = Template & {
  subcategory?: string;
  is_premium?: boolean;
  is_featured?: boolean;
  usage_count?: number;
  rating?: number;
  review_count?: number;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  features?: string[];
  preview_images?: string[];
  // Add EnhancedTemplate fields
  target_industries?: BusinessIndustry[];
  target_business_types?: BusinessType[];
  design_style?: DesignStyle[];
  complexity_level?: 'beginner' | 'intermediate' | 'advanced';
  setup_time_minutes?: number;
  responsive?: boolean;
  mobile_optimized?: boolean;
  seo_optimized?: boolean;
  analytics_ready?: boolean;
  conversion_optimized?: boolean;
  a11y_compliant?: boolean;
  performance_score?: number;
  last_updated?: string;
  version?: string;
  intelligence_score?: TemplateIntelligenceScore;
  personalization_data?: TemplatePersonalizationData;
  usage_analytics?: TemplateUsageAnalytics;
  ai_insights?: TemplateAIInsights;
};

// Generate AI Intelligence Score for templates
const generateIntelligenceScore = (template: Partial<LegacyEnhancedTemplate>): TemplateIntelligenceScore => {
  const baseScore = (template.rating || 4.0) / 5.0 * 0.8;
  const usageScore = Math.min((template.usage_count || 1000) / 20000, 1.0) * 0.2;
  
  return {
    overall_score: Math.min(baseScore + usageScore, 1.0),
    category_scores: {
      industry_alignment: template.target_industries?.length ? 0.9 : 0.7,
      audience_fit: 0.85,
      design_quality: (template.rating || 4.0) / 5.0,
      performance: template.performance_score || 0.8,
      conversion_potential: template.conversion_optimized ? 0.9 : 0.7,
      customization_ease: template.difficulty === 'beginner' ? 0.9 : template.difficulty === 'intermediate' ? 0.7 : 0.5
    },
    confidence_level: 0.85,
    reasoning: [
      `High user satisfaction with ${(template.rating || 4.0).toFixed(1)}/5.0 rating`,
      `Proven performance with ${template.usage_count || 1000}+ implementations`,
      `Optimized for ${template.target_industries?.join(', ') || 'multiple industries'}`
    ],
    improvement_suggestions: [
      'Add more industry-specific customization options',
      'Enhance mobile responsiveness',
      'Improve loading performance'
    ]
  };
};

// Add intelligence scoring to all templates
const addIntelligenceScoring = (template: LegacyEnhancedTemplate): LegacyEnhancedTemplate => ({
  ...template,
  intelligence_score: generateIntelligenceScore(template),
  personalization_data: {
    customizable_elements: [
      {
        id: 'hero-headline',
        type: 'text',
        name: 'Main Headline',
        description: 'Primary value proposition',
        current_value: template.name,
        suggestions: ['Transform Your Business', 'Revolutionize Your Workflow', 'Boost Your Productivity'],
        ai_generated_options: ['AI-Powered Solutions for Modern Business', 'Next-Generation Platform for Growth']
      },
      {
        id: 'color-scheme',
        type: 'color',
        name: 'Brand Colors',
        description: 'Primary color palette',
        current_value: '#4f46e5',
        suggestions: ['#0066CC', '#7C3AED', '#059669'],
        ai_generated_options: ['#4338CA', '#7C2D12']
      }
    ],
    ai_content_suggestions: [
      {
        element_id: 'hero-headline',
        content_type: 'headline',
        suggestions: ['Transform Your Business with AI', 'Revolutionize Your Workflow Today'],
        confidence: 0.9,
        reasoning: 'Based on industry best practices for SaaS landing pages'
      }
    ],
    color_palette_options: [
      {
        id: 'modern-blue',
        name: 'Modern Blue',
        colors: ['#3B82F6', '#1E40AF', '#1E3A8A'],
        harmony_type: 'monochromatic',
        brand_alignment_score: 0.9
      }
    ],
    layout_variations: [
      {
        id: 'centered-hero',
        name: 'Centered Hero Layout',
        description: 'Center-aligned hero with side imagery',
        conversion_impact: 'positive',
        complexity_change: -1
      }
    ]
  },
  usage_analytics: {
    total_uses: template.usage_count || 1000,
    success_rate: 0.87,
    avg_setup_time: template.setup_time_minutes || 30,
    user_satisfaction: (template.rating || 4.0) / 5.0,
    common_customizations: ['Color scheme', 'Hero text', 'Call-to-action buttons'],
    performance_metrics: {
      avg_load_time: 1.2,
      mobile_score: 0.95,
      seo_score: 0.88,
      accessibility_score: 0.92
    }
  },
  ai_insights: {
    optimization_opportunities: [
      'Add social proof section for higher conversion',
      'Implement A/B testing for CTA buttons',
      'Optimize images for faster loading'
    ],
    trend_alignment: 0.85,
    competitive_analysis: [
      {
        competitor: 'Webflow Templates',
        similarity_score: 0.7,
        differentiators: ['AI-powered customization', 'Workflow integration'],
        improvement_areas: ['Animation sophistication', 'Design complexity']
      }
    ],
    future_proof_score: 0.8,
    maintenance_recommendations: [
      'Update design trends quarterly',
      'Monitor conversion performance',
      'Refresh content suggestions monthly'
    ]
  }
});

// Premium SaaS Landing Page Template
const premiumSaasTemplate: LegacyEnhancedTemplate = {
  id: 'premium-saas-landing-1',
  name: 'Premium SaaS Landing Page',
  category: 'landing',
  subcategory: 'saas',
  description: 'Modern, conversion-focused SaaS landing page with hero, features, social proof, pricing, and CTA sections. Optimized for B2B conversions with advanced animations.',
  thumbnail: '/templates/premium-saas-landing.jpg',
  createdAt: new Date('2024-01-20'),
  updatedAt: new Date('2024-01-20'),
  is_premium: true,
  is_featured: true,
  usage_count: 15420,
  rating: 4.9,
  review_count: 342,
  difficulty: 'intermediate',
  tags: ['saas', 'b2b', 'landing', 'conversion', 'premium', 'animations', 'responsive'],
  // Enhanced Template fields
  target_industries: ['technology', 'finance', 'healthcare', 'professional-services'],
  target_business_types: ['b2b', 'b2b2c'],
  design_style: ['modern', 'minimal', 'corporate'],
  complexity_level: 'intermediate',
  setup_time_minutes: 45,
  responsive: true,
  mobile_optimized: true,
  seo_optimized: true,
  analytics_ready: true,
  conversion_optimized: true,
  a11y_compliant: true,
  performance_score: 0.92,
  last_updated: '2024-01-20',
  version: '2.1.0',
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
  components: [
    // Navigation Header
    {
      id: 'saas-nav',
      type: 'navigation',
      name: 'Navigation Header',
      content: '',
      styles: {
        position: 'sticky',
        top: '0',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
        zIndex: 50,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto',
      },
      props: {
        logo: 'SaaSPro',
        menuItems: ['Features', 'Pricing', 'About', 'Contact'],
        ctaText: 'Start Free Trial',
        variant: 'modern',
        animation: true,
      },
      children: [],
      parentId: null,
      order: 0,
    },

    // Hero Section
    {
      id: 'saas-hero',
      type: 'hero',
      name: 'Hero Section',
      content: 'Transform Your Business with AI-Powered Analytics',
      styles: {
        position: 'relative',
        width: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        textAlign: 'center',
        padding: '120px 20px 100px',
        minHeight: '700px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      },
      props: {
        headline: 'Transform Your Business with AI-Powered Analytics',
        subheadline: 'Get real-time insights, automate workflows, and boost productivity by 300% with our cutting-edge SaaS platform trusted by 10,000+ companies.',
        primaryCta: 'Start Free 14-Day Trial',
        secondaryCta: 'Watch Demo',
        primaryCtaLink: '/signup',
        secondaryCtaLink: '/demo',
        variant: 'gradient',
        animation: true,
        showRating: true,
        rating: 4.9,
        reviews: 1234,
        socialProof: ['Google', 'Microsoft', 'Shopify', 'Stripe'],
        badge: '🚀 New: AI Workflow Builder',
        features: ['No credit card required', 'Setup in 5 minutes', '24/7 support'],
      },
      children: ['hero-content', 'hero-cta-group'],
      parentId: null,
      order: 1,
    },

    // Final CTA Section
    {
      id: 'final-cta-section',
      type: 'hero',
      name: 'Final CTA Section',
      content: '',
      styles: {
        position: 'relative',
        width: '100%',
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        color: '#ffffff',
        padding: '100px 20px',
        textAlign: 'center',
      },
      props: {
        headline: 'Ready to transform your business?',
        subheadline: 'Join 10,000+ companies already using SaaSPro to boost productivity and drive growth.',
        primaryCta: 'Start Your Free Trial Today',
        primaryCtaLink: '/signup',
        variant: 'gradient',
        animation: true,
        height: '400px',
      },
      children: [],
      parentId: null,
      order: 6,
    },

    // Footer
    {
      id: 'saas-footer',
      type: 'container',
      name: 'Footer',
      content: '',
      styles: {
        position: 'relative',
        width: '100%',
        backgroundColor: '#1f2937',
        color: '#ffffff',
        padding: '80px 20px 40px',
      },
      props: {
        companyName: 'SaaSPro',
        links: {
          product: ['Features', 'Pricing', 'API', 'Integrations'],
          company: ['About', 'Blog', 'Careers', 'Contact'],
          resources: ['Documentation', 'Help Center', 'Community', 'Status'],
          legal: ['Privacy', 'Terms', 'Security', 'GDPR'],
        },
        socialLinks: ['Twitter', 'LinkedIn', 'GitHub', 'YouTube'],
        animation: true,
      },
      children: [],
      parentId: null,
      order: 7,
    },
  ],
};

// Import VoTemplate
import { voSaaSTemplate } from './voSaaSTemplate';

// Enhanced sample template data
export const sampleTemplates: LegacyEnhancedTemplate[] = [
  addIntelligenceScoring(voSaaSTemplate as LegacyEnhancedTemplate),
  addIntelligenceScoring(premiumSaasTemplate),
  addIntelligenceScoring({
    id: 'landing-hero-1',
    name: 'Modern Hero Landing',
    category: 'landing',
    subcategory: 'startup',
    description: 'A modern landing page with powerful hero section, features showcase, and strong call-to-action',
    thumbnail: '/templates/hero-landing.jpg',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    is_premium: false,
    is_featured: true,
    usage_count: 8750,
    rating: 4.7,
    review_count: 189,
    difficulty: 'beginner',
    tags: ['landing', 'hero', 'startup', 'simple', 'clean'],
    target_industries: ['technology', 'retail', 'education'],
    target_business_types: ['b2c', 'b2b'],
    design_style: ['modern', 'minimal'],
    complexity_level: 'beginner',
    setup_time_minutes: 20,
    responsive: true,
    mobile_optimized: true,
    seo_optimized: true,
    analytics_ready: false,
    conversion_optimized: false,
    a11y_compliant: true,
    performance_score: 0.85,
    last_updated: '2024-01-15',
    version: '1.0.0',
    features: [
      'Clean modern design',
      'Mobile responsive',
      'Fast loading',
      'SEO optimized',
      'Easy to customize'
    ],
    components: [
      {
        id: 'nav-1',
        type: 'navigation',
        name: 'Main Navigation',
        content: '',
        styles: {
          position: 'relative',
          width: '100%',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          zIndex: 10,
        },
        props: {
          variant: 'clean',
          animation: true,
        },
        children: [],
        parentId: null,
        order: 0,
      },
      {
        id: 'hero-1',
        type: 'hero',
        name: 'Hero Section',
        content: 'Transform Your Business with AI',
        styles: {
          position: 'relative',
          width: '100%',
          backgroundColor: '#1f2937',
          color: '#ffffff',
          textAlign: 'center',
          padding: '80px 20px',
          minHeight: '600px',
        },
        props: {
          variant: 'minimal',
          animation: true,
          features: ['24/7 Support', '99.9% Uptime', 'Enterprise Security'],
        },
        children: [],
        parentId: null,
        order: 1,
      },
    ],
  }),
  
  // E-commerce Template
  addIntelligenceScoring({
    id: 'ecommerce-modern-1',
    name: 'Modern E-commerce Store',
    category: 'ecommerce',
    subcategory: 'fashion',
    description: 'Sleek e-commerce template with product showcase, shopping cart, and checkout flow',
    thumbnail: '/templates/ecommerce-modern.jpg',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    is_premium: true,
    is_featured: false,
    usage_count: 12340,
    rating: 4.8,
    review_count: 267,
    difficulty: 'advanced',
    tags: ['ecommerce', 'shopping', 'fashion', 'modern', 'premium'],
    target_industries: ['retail', 'beauty', 'automotive'],
    target_business_types: ['b2c'],
    design_style: ['modern', 'bold'],
    complexity_level: 'advanced',
    setup_time_minutes: 90,
    responsive: true,
    mobile_optimized: true,
    seo_optimized: true,
    analytics_ready: true,
    conversion_optimized: true,
    a11y_compliant: true,
    performance_score: 0.88,
    last_updated: '2024-01-18',
    version: '1.5.0',
    features: [
      'Product catalog',
      'Shopping cart',
      'Checkout flow',
      'Payment integration',
      'Inventory management',
      'Customer reviews',
      'Mobile commerce',
      'Analytics dashboard'
    ],
    components: [
      // E-commerce specific components
    ],
  }),

  // Blog Template
  addIntelligenceScoring({
    id: 'blog-minimal-1',
    name: 'Minimal Blog',
    category: 'blog',
    subcategory: 'personal',
    description: 'Clean and minimal blog template perfect for writers and content creators',
    thumbnail: '/templates/blog-minimal.jpg',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    is_premium: false,
    is_featured: false,
    usage_count: 5420,
    rating: 4.6,
    review_count: 98,
    difficulty: 'beginner',
    tags: ['blog', 'minimal', 'writing', 'clean', 'typography'],
    target_industries: ['entertainment', 'education', 'nonprofit'],
    target_business_types: ['b2c'],
    design_style: ['minimal', 'classic'],
    complexity_level: 'beginner',
    setup_time_minutes: 15,
    responsive: true,
    mobile_optimized: true,
    seo_optimized: true,
    analytics_ready: false,
    conversion_optimized: false,
    a11y_compliant: true,
    performance_score: 0.90,
    last_updated: '2024-01-16',
    version: '1.0.0',
    features: [
      'Typography focused',
      'Reading time estimates',
      'Tag system',
      'Author profiles',
      'Comment system',
      'RSS feed',
      'Search functionality'
    ],
    components: [
      // Blog specific components
    ],
  }),

  // Portfolio Template
  addIntelligenceScoring({
    id: 'portfolio-creative-1',
    name: 'Creative Portfolio',
    category: 'portfolio',
    subcategory: 'designer',
    description: 'Stunning portfolio template for designers and creative professionals',
    thumbnail: '/templates/portfolio-creative.jpg',
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19'),
    is_premium: true,
    is_featured: true,
    usage_count: 6890,
    rating: 4.9,
    review_count: 156,
    difficulty: 'intermediate',
    tags: ['portfolio', 'creative', 'designer', 'gallery', 'showcase'],
    target_industries: ['entertainment', 'professional-services'],
    target_business_types: ['b2c', 'b2b'],
    design_style: ['creative', 'bold'],
    complexity_level: 'intermediate',
    setup_time_minutes: 60,
    responsive: true,
    mobile_optimized: true,
    seo_optimized: false,
    analytics_ready: true,
    conversion_optimized: false,
    a11y_compliant: false,
    performance_score: 0.75,
    last_updated: '2024-01-19',
    version: '1.2.0',
    features: [
      'Project galleries',
      'Image optimization',
      'Contact forms',
      'Social integration',
      'Client testimonials',
      'Skills showcase',
      'About section'
    ],
    components: [
      // Portfolio specific components
    ],
  }),

  // Corporate Template
  addIntelligenceScoring({
    id: 'corporate-professional-1',
    name: 'Professional Corporate',
    category: 'corporate',
    subcategory: 'business',
    description: 'Professional corporate website template for businesses and organizations',
    thumbnail: '/templates/corporate-professional.jpg',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
    is_premium: false,
    is_featured: false,
    usage_count: 9240,
    rating: 4.5,
    review_count: 203,
    difficulty: 'intermediate',
    tags: ['corporate', 'business', 'professional', 'services'],
    target_industries: ['professional-services', 'finance', 'manufacturing'],
    target_business_types: ['b2b'],
    design_style: ['corporate', 'classic'],
    complexity_level: 'intermediate',
    setup_time_minutes: 40,
    responsive: true,
    mobile_optimized: true,
    seo_optimized: true,
    analytics_ready: true,
    conversion_optimized: false,
    a11y_compliant: true,
    performance_score: 0.82,
    last_updated: '2024-01-17',
    version: '1.1.0',
    features: [
      'Service pages',
      'Team profiles',
      'Case studies',
      'Contact forms',
      'Location maps',
      'Testimonials',
      'News section'
    ],
    components: [
      // Corporate specific components
    ],
  })
];

// Enhanced template categories with more details
export const templateCategories: TemplateCategory[] = [
  { 
    id: 'all', 
    name: 'All Templates', 
    description: 'Browse all available templates',
    icon: '🎨',
    template_count: sampleTemplates.length,
    popularity_score: 1.0,
    target_industries: ['technology', 'healthcare', 'finance', 'education', 'retail'],
    subcategories: [
      {
        id: 'all-premium',
        name: 'Premium Templates',
        description: 'High-quality premium templates',
        template_count: sampleTemplates.filter(t => t.is_premium).length,
        recommended_for: ['Professional websites', 'Business applications']
      }
    ]
  },
  { 
    id: 'landing', 
    name: 'SaaS & Landing', 
    description: 'High-converting landing pages',
    icon: '🚀',
    template_count: sampleTemplates.filter(t => t.category === 'landing').length,
    popularity_score: 0.9,
    target_industries: ['technology', 'professional-services'],
    subcategories: [
      {
        id: 'saas',
        name: 'SaaS Landing Pages',
        description: 'Optimized for SaaS conversions',
        template_count: 2,
        recommended_for: ['Software companies', 'B2B services']
      }
    ]
  },
  { 
    id: 'ecommerce', 
    name: 'E-commerce', 
    description: 'Online store templates',
    icon: '🛒',
    template_count: sampleTemplates.filter(t => t.category === 'ecommerce').length,
    popularity_score: 0.8,
    target_industries: ['retail', 'beauty', 'automotive'],
    subcategories: [
      {
        id: 'fashion',
        name: 'Fashion & Apparel',
        description: 'Style-focused e-commerce',
        template_count: 1,
        recommended_for: ['Fashion brands', 'Clothing stores']
      }
    ]
  },
  { 
    id: 'blog', 
    name: 'Blog & Content', 
    description: 'Content-focused templates',
    icon: '📝',
    template_count: sampleTemplates.filter(t => t.category === 'blog').length,
    popularity_score: 0.6,
    target_industries: ['entertainment', 'education'],
    subcategories: [
      {
        id: 'personal',
        name: 'Personal Blogs',
        description: 'Individual content creators',
        template_count: 1,
        recommended_for: ['Writers', 'Content creators']
      }
    ]
  },
  { 
    id: 'portfolio', 
    name: 'Portfolio', 
    description: 'Showcase your work',
    icon: '🎨',
    template_count: sampleTemplates.filter(t => t.category === 'portfolio').length,
    popularity_score: 0.7,
    target_industries: ['entertainment', 'professional-services'],
    subcategories: [
      {
        id: 'designer',
        name: 'Designer Portfolios',
        description: 'Creative professional showcases',
        template_count: 1,
        recommended_for: ['Designers', 'Artists', 'Creatives']
      }
    ]
  },
  { 
    id: 'corporate', 
    name: 'Business', 
    description: 'Professional business sites',
    icon: '🏢',
    template_count: sampleTemplates.filter(t => t.category === 'corporate').length,
    popularity_score: 0.75,
    target_industries: ['professional-services', 'finance', 'manufacturing'],
    subcategories: [
      {
        id: 'business',
        name: 'Corporate Websites',
        description: 'Professional business presence',
        template_count: 1,
        recommended_for: ['Corporations', 'Professional services']
      }
    ]
  },
];

// Helper functions
export function getTemplatesByCategory(category: string): LegacyEnhancedTemplate[] {
  if (category === 'all') {
    return sampleTemplates;
  }
  return sampleTemplates.filter(template => template.category === category);
}

export function getTemplateById(id: string): LegacyEnhancedTemplate | undefined {
  return sampleTemplates.find(template => template.id === id);
}

export function getFeaturedTemplates(): LegacyEnhancedTemplate[] {
  return sampleTemplates.filter(template => template.is_featured);
}

export function getPremiumTemplates(): LegacyEnhancedTemplate[] {
  return sampleTemplates.filter(template => template.is_premium);
}

export function getPopularTemplates(): LegacyEnhancedTemplate[] {
  return sampleTemplates
    .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
    .slice(0, 6);
}

export function searchTemplates(query: string): LegacyEnhancedTemplate[] {
  const lowerQuery = query.toLowerCase();
  return sampleTemplates.filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    template.category.toLowerCase().includes(lowerQuery) ||
    template.subcategory?.toLowerCase().includes(lowerQuery)
  );
}

// Filter templates by business intelligence scoring
export function getTemplatesByIntelligenceScore(minScore: number = 0.8): LegacyEnhancedTemplate[] {
  return sampleTemplates.filter(template => 
    template.intelligence_score && template.intelligence_score.overall_score >= minScore
  );
}

// Get templates recommended for specific industries
export function getTemplatesForIndustry(industry: BusinessIndustry): LegacyEnhancedTemplate[] {
  return sampleTemplates.filter(template =>
    template.target_industries?.includes(industry)
  );
}

// Get templates by business type
export function getTemplatesForBusinessType(businessType: BusinessType): LegacyEnhancedTemplate[] {
  return sampleTemplates.filter(template =>
    template.target_business_types?.includes(businessType)
  );
}

// Get templates by design style preference
export function getTemplatesByDesignStyle(style: DesignStyle): LegacyEnhancedTemplate[] {
  return sampleTemplates.filter(template =>
    template.design_style?.includes(style)
  );
}