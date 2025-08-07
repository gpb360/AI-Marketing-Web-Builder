import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  ArrowRight, 
  Star, 
  CheckCircle, 
  Sparkles, 
  TrendingUp,
  Users,
  Clock,
  Award
} from 'lucide-react';

interface CardProps {
  id?: string;
  content?: string;
  styles?: React.CSSProperties;
  className?: string;
  props?: {
    title?: string;
    subtitle?: string;
    description?: string;
    image?: string;
    imageAlt?: string;
    icon?: string | React.ReactNode;
    variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'ghost' | 'gradient' | 'glass' | 'feature' | 'testimonial' | 'pricing' | 'stat';
    size?: 'small' | 'medium' | 'large';
    orientation?: 'vertical' | 'horizontal';
    interactive?: boolean;
    link?: string;
    badge?: string;
    animation?: boolean;
    hover?: boolean;
    actions?: Array<{
      text: string;
      href?: string;
      onClick?: () => void;
      variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
      icon?: React.ReactNode;
    }>;
    // Feature card specific
    features?: string[];
    price?: string;
    period?: string;
    popular?: boolean;
    // Testimonial specific
    quote?: string;
    author?: string;
    role?: string;
    avatar?: string;
    rating?: number;
    // Stat specific
    number?: string;
    label?: string;
    trend?: 'up' | 'down' | 'neutral';
    percentage?: string;
  };
}

export const Card: React.FC<CardProps> = ({ 
  content, 
  styles, 
  className,
  props = {}
}) => {
  const {
    title,
    subtitle,
    description,
    image,
    imageAlt,
    icon,
    variant = 'default',
    size = 'medium',
    orientation = 'vertical',
    interactive = false,
    link,
    badge,
    animation = true,
    hover = true,
    actions = [],
    features = [],
    price,
    period,
    popular = false,
    quote,
    author,
    role,
    avatar,
    rating,
    number,
    label,
    trend = 'neutral',
    percentage
  } = props;

  const sizeClasses = {
    small: 'p-4 text-sm',
    medium: 'p-6',
    large: 'p-8 text-lg'
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white shadow-lg hover:shadow-xl border border-gray-100';
      case 'outlined':
        return 'border-2 border-gray-300 bg-white hover:border-blue-500';
      case 'filled':
        return 'bg-gray-50 hover:bg-gray-100';
      case 'ghost':
        return 'bg-transparent hover:bg-gray-50';
      case 'gradient':
        return 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg';
      case 'glass':
        return 'bg-white bg-opacity-20 backdrop-blur-lg border border-white border-opacity-30 shadow-xl';
      case 'feature':
        return 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300';
      case 'testimonial':
        return 'bg-white border border-gray-200 shadow-sm relative';
      case 'pricing':
        return popular 
          ? 'bg-white border-2 border-blue-500 shadow-lg relative transform scale-105' 
          : 'bg-white border border-gray-200 shadow-sm';
      case 'stat':
        return 'bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm';
      default:
        return 'bg-white border border-gray-200 shadow-sm';
    }
  };

  const cardStyles: React.CSSProperties = {
    borderRadius: variant === 'glass' ? '1rem' : '0.75rem',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    position: 'relative',
    ...styles,
  };

  const cardClasses = cn(
    'card group',
    sizeClasses[size],
    getVariantClasses(),
    interactive && hover && 'hover:scale-102 cursor-pointer transform transition-transform',
    orientation === 'horizontal' && 'md:flex md:items-center',
    className
  );

  const MotionWrapper = animation ? motion.div : 'div';
  const motionProps = animation ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    whileHover: hover ? { y: -2 } : {},
    transition: { duration: 0.3 }
  } : {};

  // Render different card types
  const renderCardContent = () => {
    switch (variant) {
      case 'testimonial':
        return renderTestimonialCard();
      case 'pricing':
        return renderPricingCard();
      case 'stat':
        return renderStatCard();
      case 'feature':
        return renderFeatureCard();
      default:
        return renderDefaultCard();
    }
  };

  const renderTestimonialCard = () => (
    <>
      {/* Quote Mark */}
      <div className="absolute top-4 right-4 text-blue-500 opacity-20">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-10zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
        </svg>
      </div>
      
      {/* Rating */}
      {rating && (
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
      )}
      
      {/* Quote */}
      {quote && (
        <blockquote className="text-gray-700 italic mb-6 text-lg leading-relaxed">
          "{quote}"
        </blockquote>
      )}
      
      {/* Author */}
      <div className="flex items-center gap-3">
        {avatar && (
          <img
            src={avatar}
            alt={author}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <div>
          <div className="font-semibold text-gray-900">{author}</div>
          <div className="text-sm text-gray-600">{role}</div>
        </div>
      </div>
    </>
  );

  const renderPricingCard = () => (
    <>
      {/* Popular Badge */}
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Award className="w-3 h-3" />
            Most Popular
          </div>
        </div>
      )}
      
      <div className="text-center space-y-6">
        {/* Plan Name */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
        
        {/* Price */}
        {price && (
          <div className="py-4">
            <span className="text-4xl font-bold text-gray-900">{price}</span>
            {period && <span className="text-gray-600">/{period}</span>}
          </div>
        )}
        
        {/* Features */}
        {features.length > 0 && (
          <ul className="space-y-3 text-left">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        )}
        
        {/* Description */}
        {description && (
          <p className="text-gray-600 text-center">{description}</p>
        )}
      </div>
    </>
  );

  const renderStatCard = () => (
    <div className="text-center space-y-2">
      {/* Number */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-3xl font-bold text-gray-900">{number}</span>
        {percentage && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            <TrendingUp className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
            {percentage}
          </div>
        )}
      </div>
      
      {/* Label */}
      <div className="text-gray-600 font-medium">{label}</div>
      
      {/* Description */}
      {description && (
        <div className="text-sm text-gray-500">{description}</div>
      )}
    </div>
  );

  const renderFeatureCard = () => (
    <>
      {/* Icon */}
      {icon && (
        <div className="mb-4">
          {typeof icon === 'string' ? (
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">{icon}</span>
            </div>
          ) : (
            <div className="w-12 h-12 text-blue-500">{icon}</div>
          )}
        </div>
      )}
      
      {/* Title */}
      {title && (
        <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
      )}
      
      {/* Description */}
      {description && (
        <p className="text-gray-600 mb-4 leading-relaxed">
          {description}
        </p>
      )}
      
      {/* Features */}
      {features.length > 0 && (
        <ul className="space-y-2 mb-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      )}
      
      {/* Learn More Link */}
      {link && (
        <div className="flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
          <span>Learn more</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      )}
    </>
  );

  const renderDefaultCard = () => (
    <>
      {/* Badge */}
      {badge && (
        <div className="absolute top-4 right-4">
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {badge}
          </span>
        </div>
      )}

      {/* Image */}
      {image && (
        <div className={cn(
          'card-image mb-4',
          orientation === 'horizontal' && 'md:w-1/3 md:pr-6 md:mb-0'
        )}>
          <img 
            src={image} 
            alt={imageAlt || title || 'Card image'}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Icon */}
      {icon && !image && (
        <div className="mb-4">
          {typeof icon === 'string' ? (
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">{icon}</span>
            </div>
          ) : (
            <div className="w-12 h-12">{icon}</div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn(
        'card-content flex-1',
        orientation === 'horizontal' && 'md:w-2/3'
      )}>
        {title && (
          <h3 className="text-xl font-semibold mb-2 text-gray-900">
            {title}
          </h3>
        )}
        
        {subtitle && (
          <p className="text-sm text-gray-600 mb-2">
            {subtitle}
          </p>
        )}
        
        {description && (
          <p className="text-gray-700 mb-4 leading-relaxed">
            {description}
          </p>
        )}
        
        {content && !title && !description && (
          <div className="text-gray-700">
            {content}
          </div>
        )}
      </div>
    </>
  );

  const cardContent = (
    <MotionWrapper {...motionProps} className={cardClasses} style={cardStyles}>
      {renderCardContent()}
      
      {/* Actions */}
      {actions.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {actions.map((action, index) => {
            const buttonClasses = cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2',
              {
                'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg': action.variant === 'primary',
                'bg-gray-200 text-gray-900 hover:bg-gray-300': action.variant === 'secondary',
                'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400': action.variant === 'outline',
                'text-blue-600 hover:text-blue-800 hover:bg-blue-50': action.variant === 'ghost',
              }
            );

            const content = (
              <>
                {action.icon}
                {action.text}
              </>
            );

            return action.href ? (
              <motion.a 
                key={index} 
                href={action.href} 
                className={buttonClasses}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {content}
              </motion.a>
            ) : (
              <motion.button 
                key={index} 
                onClick={action.onClick} 
                className={buttonClasses}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {content}
              </motion.button>
            );
          })}
        </div>
      )}
    </MotionWrapper>
  );

  if (link && variant !== 'pricing') {
    return (
      <motion.a 
        href={link} 
        className="block"
        whileHover={{ scale: hover ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {cardContent}
      </motion.a>
    );
  }

  return cardContent;
};

// Convenience exports for specific card types
export const TestimonialCard: React.FC<Omit<CardProps, 'props'> & { 
  quote: string;
  author: string;
  role: string;
  avatar?: string;
  rating?: number;
}> = ({ quote, author, role, avatar, rating, ...props }) => {
  return (
    <Card
      {...props}
      props={{
        variant: 'testimonial',
        quote,
        author,
        role,
        avatar,
        rating,
        ...props.props,
      }}
    />
  );
};

export const PricingCard: React.FC<Omit<CardProps, 'props'> & {
  plan: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  ctaText?: string;
  ctaAction?: () => void;
}> = ({ plan, price, period, features, popular, ctaText = 'Get Started', ctaAction, ...props }) => {
  return (
    <Card
      {...props}
      props={{
        variant: 'pricing',
        title: plan,
        price,
        period,
        features,
        popular,
        actions: ctaText ? [{
          text: ctaText,
          onClick: ctaAction,
          variant: popular ? 'primary' : 'outline'
        }] : [],
        ...props.props,
      }}
    />
  );
};

export const FeatureCard: React.FC<Omit<CardProps, 'props'> & {
  title: string;
  description: string;
  icon?: React.ReactNode;
  features?: string[];
}> = ({ title, description, icon, features, ...props }) => {
  return (
    <Card
      {...props}
      props={{
        variant: 'feature',
        title,
        description,
        icon,
        features,
        ...props.props,
      }}
    />
  );
};

export const StatCard: React.FC<Omit<CardProps, 'props'> & {
  number: string;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  percentage?: string;
}> = ({ number, label, trend, percentage, ...props }) => {
  return (
    <Card
      {...props}
      props={{
        variant: 'stat',
        number,
        label,
        trend,
        percentage,
        ...props.props,
      }}
    />
  );
};