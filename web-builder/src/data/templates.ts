import { Template } from '@/store/builderStore';

// Enhanced Template interface extensions
interface EnhancedTemplate extends Template {
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
}

// Premium SaaS Landing Page Template
const premiumSaasTemplate: EnhancedTemplate = {
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

    // Social Proof Section
    {
      id: 'social-proof',
      type: 'container',
      name: 'Social Proof Section',
      content: '',
      styles: {
        position: 'relative',
        width: '100%',
        backgroundColor: '#f8fafc',
        padding: '80px 20px',
        textAlign: 'center',
      },
      props: {
        animation: true,
      },
      children: ['social-proof-title', 'social-proof-logos', 'social-proof-stats'],
      parentId: null,
      order: 2,
    },

    // Features Section
    {
      id: 'features-section',
      type: 'container',
      name: 'Features Section',
      content: '',
      styles: {
        position: 'relative',
        width: '100%',
        backgroundColor: '#ffffff',
        padding: '120px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
      },
      props: {
        animation: true,
      },
      children: ['features-header', 'features-grid'],
      parentId: null,
      order: 3,
    },

    // Features Grid with Enhanced Cards
    {
      id: 'features-grid',
      type: 'container',
      name: 'Features Grid',
      content: '',
      styles: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '40px',
      },
      props: {
        animation: true,
      },
      children: ['feature-1', 'feature-2', 'feature-3', 'feature-4', 'feature-5', 'feature-6'],
      parentId: 'features-section',
      order: 1,
    },

    // Enhanced Feature Cards
    {
      id: 'feature-1',
      type: 'card',
      name: 'AI-Powered Analytics',
      content: 'Get real-time insights with machine learning algorithms that predict trends and optimize your business performance automatically.',
      styles: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '40px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      },
      props: {
        variant: 'feature',
        icon: '🤖',
        title: 'AI-Powered Analytics',
        description: 'Get real-time insights with machine learning algorithms that predict trends and optimize your business performance automatically.',
        features: ['Real-time dashboards', 'Predictive analytics', 'Custom reports'],
        animation: true,
        hover: true,
        interactive: true,
      },
      children: [],
      parentId: 'features-grid',
      order: 0,
    },

    {
      id: 'feature-2',
      type: 'card',
      name: 'Workflow Automation',
      content: 'Automate repetitive tasks and streamline your processes with our intuitive drag-and-drop workflow builder.',
      styles: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '40px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      },
      props: {
        variant: 'feature',
        icon: '⚡',
        title: 'Workflow Automation',
        description: 'Automate repetitive tasks and streamline your processes with our intuitive drag-and-drop workflow builder.',
        features: ['Visual workflow builder', 'API integrations', 'Smart triggers'],
        animation: true,
        hover: true,
        interactive: true,
      },
      children: [],
      parentId: 'features-grid',
      order: 1,
    },

    // Additional enhanced components...
    // (Similar pattern for remaining components)

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
import { voSaaSTemplate } from './templates/voSaaSTemplate';
// Enhanced sample template data
export const sampleTemplates: EnhancedTemplate[] = [
  voSaaSTemplate as EnhancedTemplate,
  premiumSaasTemplate,

  {
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
      // Additional components...
    ],
  },
  
  // E-commerce Template
  {
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
  },

  // Blog Template
  {
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
  },

  // Portfolio Template
  {
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
  },

  // Corporate Template
  {
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
  }
];

// Enhanced template categories with more details
export const templateCategories = [
  { 
    id: 'all', 
    name: 'All Templates', 
    count: sampleTemplates.length,
    description: 'Browse all available templates',
    icon: '🎨'
  },
  { 
    id: 'landing', 
    name: 'SaaS & Landing', 
    count: sampleTemplates.filter(t => t.category === 'landing').length,
    description: 'High-converting landing pages',
    icon: '🚀'
  },
  { 
    id: 'ecommerce', 
    name: 'E-commerce', 
    count: sampleTemplates.filter(t => t.category === 'ecommerce').length,
    description: 'Online store templates',
    icon: '🛒'
  },
  { 
    id: 'blog', 
    name: 'Blog & Content', 
    count: sampleTemplates.filter(t => t.category === 'blog').length,
    description: 'Content-focused templates',
    icon: '📝'
  },
  { 
    id: 'portfolio', 
    name: 'Portfolio', 
    count: sampleTemplates.filter(t => t.category === 'portfolio').length,
    description: 'Showcase your work',
    icon: '🎨'
  },
  { 
    id: 'corporate', 
    name: 'Business', 
    count: sampleTemplates.filter(t => t.category === 'corporate').length,
    description: 'Professional business sites',
    icon: '🏢'
  },
];

// Helper functions
export function getTemplatesByCategory(category: string): EnhancedTemplate[] {
  if (category === 'all') {
    return sampleTemplates;
  }
  return sampleTemplates.filter(template => template.category === category);
}

export function getTemplateById(id: string): EnhancedTemplate | undefined {
  return sampleTemplates.find(template => template.id === id);
}

export function getFeaturedTemplates(): EnhancedTemplate[] {
  return sampleTemplates.filter(template => template.is_featured);
}

export function getPremiumTemplates(): EnhancedTemplate[] {
  return sampleTemplates.filter(template => template.is_premium);
}

export function getPopularTemplates(): EnhancedTemplate[] {
  return sampleTemplates
    .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
    .slice(0, 6);
}

export function searchTemplates(query: string): EnhancedTemplate[] {
  const lowerQuery = query.toLowerCase();
  return sampleTemplates.filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    template.category.toLowerCase().includes(lowerQuery) ||
    template.subcategory?.toLowerCase().includes(lowerQuery)
  );
}