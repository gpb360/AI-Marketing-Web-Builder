import { Template } from '@/types/builder';

// VoTemplateExample CSS Variables
const voThemeVariables = {
  '--background': 'hsl(0 0% 100%)',
  '--foreground': 'hsl(222.2 84% 4.9%)',
  '--muted': 'hsl(210 40% 96.1%)',
  '--muted-foreground': 'hsl(215.4 16.3% 46.9%)',
  '--card': 'hsl(0 0% 100%)',
  '--card-foreground': 'hsl(222.2 84% 4.9%)',
  '--popover': 'hsl(0 0% 100%)',
  '--popover-foreground': 'hsl(222.2 84% 4.9%)',
  '--primary': 'hsl(222.2 47.4% 11.2%)',
  '--primary-foreground': 'hsl(210 40% 98%)',
  '--secondary': 'hsl(210 40% 96.1%)',
  '--secondary-foreground': 'hsl(222.2 47.4% 11.2%)',
  '--accent': 'hsl(210 40% 96.1%)',
  '--accent-foreground': 'hsl(222.2 47.4% 11.2%)',
  '--destructive': 'hsl(0 84.2% 60.2%)',
  '--destructive-foreground': 'hsl(210 40% 98%)',
  '--border': 'hsl(214.3 31.8% 91.4%)',
  '--input': 'hsl(214.3 31.8% 91.4%)',
  '--ring': 'hsl(222.2 84% 4.9%)',
  '--radius': '0.5rem',
};

// Complete Vo SaaS Template
export const voSaaSTemplate: Template = {
  id: 'vo-ai-saas-landing-2024',
  name: 'AI SaaS Landing - VoTemplate',
  category: 'landing',
  subcategory: 'ai-saas',
  description: 'Modern AI-powered SaaS landing page with animated sections, bento grid, and conversion-focused design',
  thumbnail: '/templates/vo-ai-saas-landing.jpg',
  createdAt: new Date('2024-08-03'),
  updatedAt: new Date('2024-08-03'),
  tags: ['saas', 'ai', 'landing', 'bento', 'gradient', 'modern', 'conversion'],
  components: [
    // 1. Hero Section
    {
      id: 'vo-hero-001',
      type: 'hero',
      name: 'AI SaaS Hero',
      content: 'Unleash the Power of AI Agents',
      description: 'Accelerate your development workflow with intelligent AI agents that write, review, and optimize your code.',
      styles: {
        height: '810px',
        background: 'linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--muted-foreground)) 100%)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
        margin: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'hsl(var(--background))',
      },
      props: {
        primaryCTA: {
          text: 'Signup for free',
          href: 'https://vercel.com/home',
          variant: 'secondary',
          size: 'lg',
        },
        showNavigation: true,
        navigationStyle: 'transparent',
      },
      order: 0,
    },

    // 2. Dashboard Preview
    {
      id: 'vo-showcase-001',
      type: 'dashboard-preview',
      name: 'Product Dashboard',
      content: 'Real-time AI Agent Dashboard',
      styles: {
        position: 'absolute',
        bottom: '-400px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        width: '100%',
        maxWidth: '1200px',
      },
      props: {
        animation: 'fadeInUp',
        delay: 0.1,
        imageSrc: '/images/dashboard-preview.png',
        alt: 'AI Agent Dashboard',
      },
      order: 1,
    },

    // 3. Social Proof
    {
      id: 'vo-logos-001',
      type: 'social-proof',
      name: 'Trusted by Industry Leaders',
      styles: {
        marginTop: '400px',
        padding: '48px 24px',
        maxWidth: '1320px',
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      },
      props: {
        logos: [
          { src: '/logos/logo01.svg', alt: 'Company 1' },
          { src: '/logos/logo02.svg', alt: 'Company 2' },
          { src: '/logos/logo03.svg', alt: 'Company 3' },
          { src: '/logos/logo04.svg', alt: 'Company 4' },
          { src: '/logos/logo05.svg', alt: 'Company 5' },
          { src: '/logos/logo06.svg', alt: 'Company 6' },
          { src: '/logos/logo07.svg', alt: 'Company 7' },
          { src: '/logos/logo08.svg', alt: 'Company 8' },
        ],
        animation: 'fadeIn',
        delay: 0.1,
      },
      order: 2,
    },

    // 4. Features Bento Grid
    {
      id: 'vo-features-001',
      type: 'feature-grid',
      name: 'AI-Powered Features',
      styles: {
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '0 24px',
      },
      props: {
        layout: 'bento-grid',
        columns: { mobile: 1, tablet: 2, desktop: 3 },
        gap: '24px',
        title: 'Empower Your Workflow with AI',
        subtitle: 'Ask your AI Agent for real-time collaboration, seamless integrations, and actionable insights to streamline your operations.',
        features: [
          {
            title: 'AI-powered code reviews',
            description: 'Get real-time, smart suggestions for cleaner code.',
            icon: 'code-review',
            animation: 'bounceIn',
          },
          {
            title: 'Real-time coding previews',
            description: 'Chat, collaborate, and instantly preview changes together.',
            icon: 'preview',
            animation: 'fadeInUp',
          },
          {
            title: 'One-click integrations',
            description: 'Easily connect your workflow with popular dev tools.',
            icon: 'integration',
            animation: 'slideInRight',
          },
          {
            title: 'Flexible MCP connectivity',
            description: 'Effortlessly manage and configure MCP server access.',
            icon: 'server',
            animation: 'zoomIn',
          },
          {
            title: 'Launch parallel coding agents',
            description: 'Solve complex problems faster with multiple AI agents.',
            icon: 'agents',
            animation: 'rotateIn',
          },
          {
            title: 'Deployment made easy',
            description: 'Go from code to live deployment on Vercel instantly.',
            icon: 'rocket',
            animation: 'fadeIn',
          },
        ],
      },
      order: 3,
    },

    // 5. Large Testimonial
    {
      id: 'vo-testimonial-large',
      type: 'testimonial',
      name: 'Featured Customer',
      styles: {
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '0 24px',
      },
      props: {
        quote: "This AI platform has revolutionized our development workflow. The real-time collaboration features and intelligent code suggestions have cut our development time in half.",
        author: 'Guillermo Rauch',
        role: 'CEO, Vercel',
        avatar: '/images/guillermo-rauch.png',
        layout: 'large',
      },
      order: 4,
    },

    // 6. Pricing Section
    {
      id: 'vo-pricing-001',
      type: 'pricing',
      name: 'Simple Pricing',
      styles: {
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '0 24px',
      },
      props: {
        title: 'Simple, Transparent Pricing',
        subtitle: 'Choose the perfect plan for your team. All plans include a 14-day free trial.',
        tiers: [
          {
            name: 'Starter',
            price: 19,
            priceAnnual: 15,
            period: '/month',
            description: 'Perfect for individuals and small teams',
            features: [
              '5 AI agents',
              'Basic integrations',
              'Community support',
              'Code reviews',
              'Basic analytics',
              'GitHub integration',
            ],
            cta: 'Get Started',
            popular: false,
          },
          {
            name: 'Pro',
            price: 49,
            priceAnnual: 39,
            period: '/month',
            description: 'Best for growing teams and businesses',
            features: [
              'Unlimited agents',
              'Advanced integrations',
              'Priority support',
              'Advanced analytics',
              'Team collaboration',
              'Custom integrations',
              'API access',
              'Advanced security',
            ],
            cta: 'Start Free Trial',
            popular: true,
          },
          {
            name: 'Enterprise',
            price: 199,
            priceAnnual: 159,
            period: '/month',
            description: 'For large teams and enterprises',
            features: [
              'Custom deployment',
              'Dedicated support',
              'SLA guarantee',
              'Custom integrations',
              'On-premise option',
              'Advanced security',
              'Custom training',
              'White-label option',
            ],
            cta: 'Contact Sales',
            popular: false,
          },
        ],
        showAnnualToggle: true,
      },
      order: 5,
    },

    // 7. Testimonial Grid
    {
      id: 'vo-testimonials-grid',
      type: 'testimonial-grid',
      name: 'Customer Success Stories',
      styles: {
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '0 24px',
      },
      props: {
        testimonials: [
          {
            quote: 'The AI agents have completely transformed how we write code. Our team is more productive than ever.',
            author: 'Sarah Johnson',
            role: 'Engineering Manager',
            avatar: '/avatars/sarah-johnson.jpg',
            rating: 5,
          },
          {
            quote: 'Real-time collaboration features are incredible. Our distributed team feels like they\'re in the same room.',
            author: 'Mike Chen',
            role: 'CTO',
            avatar: '/avatars/mike-chen.jpg',
            rating: 5,
          },
          {
            quote: 'The integration capabilities saved us weeks of development time. Highly recommended!',
            author: 'Emily Rodriguez',
            role: 'Lead Developer',
            avatar: '/avatars/emily-rodriguez.jpg',
            rating: 5,
          },
        ],
        layout: 'grid',
        columns: 3,
      },
      order: 6,
    },

    // 8. FAQ Section
    {
      id: 'vo-faq-001',
      type: 'faq',
      name: 'Frequently Asked Questions',
      styles: {
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '0 24px',
      },
      props: {
        title: 'Frequently Asked Questions',
        questions: [
          {
            question: 'How do AI agents work?',
            answer: 'AI agents use advanced machine learning models to analyze your code, provide suggestions, and automate repetitive tasks. They learn from your codebase and improve over time.',
          },
          {
            question: 'Is my code secure?',
            answer: 'Yes! We use enterprise-grade encryption and never store your code on our servers. All processing happens in real-time with secure connections.',
          },
          {
            question: 'Can I use this with my existing tools?',
            answer: 'Absolutely! We integrate with popular development tools like VS Code, GitHub, GitLab, and more. See our integrations page for the full list.',
          },
          {
            question: 'What programming languages are supported?',
            answer: 'We support all major programming languages including JavaScript, TypeScript, Python, Java, C++, Go, and many more.',
          },
          {
            question: 'How does the pricing work?',
            answer: 'We offer simple monthly or annual pricing with a 14-day free trial. You can upgrade, downgrade, or cancel at any time.',
          },
        ],
        accordionStyle: 'modern',
      },
      order: 7,
    },

    // 9. CTA Section
    {
      id: 'vo-cta-001',
      type: 'cta',
      name: 'Final Call to Action',
      styles: {
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '96px 24px',
        background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
        borderRadius: '16px',
        textAlign: 'center',
        color: 'hsl(var(--primary-foreground))',
      },
      props: {
        title: 'Ready to Transform Your Development?',
        description: 'Join thousands of developers using AI agents to build better software faster. Start your free trial today.',
        primaryCTA: {
          text: 'Start Free Trial',
          href: '/signup',
          variant: 'secondary',
          size: 'lg',
        },
        secondaryCTA: {
          text: 'Schedule Demo',
          href: '/demo',
          variant: 'outline',
          size: 'md',
        },
        showTrustBadges: true,
        trustBadges: ['No credit card required', '14-day free trial', 'Cancel anytime'],
      },
      order: 8,
    },

    // 10. Footer
    {
      id: 'vo-footer-001',
      type: 'footer',
      name: 'Landing Footer',
      styles: {
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '48px 24px 24px',
        borderTop: '1px solid hsl(var(--border))',
      },
      props: {
        logo: {
          text: 'AISaaS',
          href: '/',
        },
        links: {
          product: [
            { text: 'Features', href: '/features' },
            { text: 'Pricing', href: '/pricing' },
            { text: 'Documentation', href: '/docs' },
          ],
          company: [
            { text: 'About', href: '/about' },
            { text: 'Careers', href: '/careers' },
            { text: 'Contact', href: '/contact' },
          ],
          legal: [
            { text: 'Privacy', href: '/privacy' },
            { text: 'Terms', href: '/terms' },
            { text: 'Support', href: '/support' },
          ],
        },
        social: [
          { name: 'Twitter', href: 'https://twitter.com', icon: 'twitter' },
          { name: 'LinkedIn', href: 'https://linkedin.com', icon: 'linkedin' },
          { name: 'GitHub', href: 'https://github.com', icon: 'github' },
        ],
        copyright: '© 2024 AISaaS. All rights reserved.',
      },
      order: 9,
    },
  ],
  globalStyles: voThemeVariables,
  meta: {
    viewport: 'width=device-width, initial-scale=1',
    title: 'AI SaaS Landing Page - VoTemplate',
    description: 'Modern AI-powered SaaS landing page template with bento grid, testimonials, and conversion-focused design',
    keywords: 'saas, ai, landing page, bento grid, modern design, conversion optimization',
    ogImage: '/templates/vo-ai-saas-og.jpg',
  },
  workflowHooks: {
    'vo-hero-001': {
      events: ['cta-click', 'scroll-depth'],
      workflows: ['lead-capture', 'user-onboarding'],
    },
    'vo-pricing-001': {
      events: ['plan-select', 'toggle-change'],
      workflows: ['conversion-tracking', 'trial-nurture'],
    },
    'vo-cta-001': {
      events: ['cta-click'],
      workflows: ['final-conversion', 'demo-booking'],
    },
  },
};

// Export for use in other files
export default voSaaSTemplate;