import React from 'react';
import { cn } from '@/lib/utils';

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
    variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    orientation?: 'vertical' | 'horizontal';
    interactive?: boolean;
    link?: string;
    badge?: string;
    actions?: Array<{
      text: string;
      href?: string;
      onClick?: () => void;
      variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    }>;
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
    actions = []
  } = props;

  const sizeClasses = {
    small: 'p-4 text-sm',
    medium: 'p-6',
    large: 'p-8 text-lg'
  };

  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white shadow-lg hover:shadow-xl',
    outlined: 'border-2 border-gray-300',
    filled: 'bg-gray-50',
    ghost: 'bg-transparent'
  };

  const cardStyles: React.CSSProperties = {
    borderRadius: '0.5rem',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    ...styles,
  };

  const cardClasses = cn(
    'card',
    sizeClasses[size],
    variantClasses[variant],
    interactive && 'hover:scale-105 cursor-pointer',
    orientation === 'horizontal' && 'md:flex',
    className
  );

  const cardContent = (
    <div className={cardClasses} style={cardStyles}>
      {/* Badge */}
      {badge && (
        <div className="absolute top-4 right-4">
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {badge}
          </span>
        </div>
      )}

      {/* Image */}
      {image && (
        <div className={cn(
          'card-image',
          orientation === 'horizontal' && 'md:w-1/3 md:pr-6'
        )}>
          <img 
            src={image} 
            alt={imageAlt || title || 'Card image'}
            className="w-full h-48 object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
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
        'card-content',
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
          <p className="text-gray-700 mb-4">
            {description}
          </p>
        )}
        
        {content && !title && !description && (
          <div className="text-gray-700">
            {content}
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {actions.map((action, index) => {
              const buttonClasses = cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                {
                  'bg-blue-600 text-white hover:bg-blue-700': action.variant === 'primary',
                  'bg-gray-200 text-gray-900 hover:bg-gray-300': action.variant === 'secondary',
                  'border border-gray-300 text-gray-700 hover:bg-gray-50': action.variant === 'outline',
                  'text-blue-600 hover:text-blue-800': action.variant === 'ghost',
                }
              );

              return action.href ? (
                <a key={index} href={action.href} className={buttonClasses}>
                  {action.text}
                </a>
              ) : (
                <button key={index} onClick={action.onClick} className={buttonClasses}>
                  {action.text}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} className="block">
        {cardContent}
      </a>
    );
  }

  return cardContent;
};

// Specialized card variants
export const TestimonialCard: React.FC<Omit<CardProps, 'props'> & { 
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}> = ({ quote, author, role, avatar, ...props }) => {
  return (
    <Card
      {...props}
      props={{
        variant: 'elevated',
        ...props.props,
      }}
    >
      <div className="space-y-4">
        <div className="text-yellow-400">
          ★★★★★
        </div>
        <blockquote className="text-gray-700 italic">
          "{quote}"
        </blockquote>
        <div className="flex items-center space-x-3">
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
      </div>
    </Card>
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
        variant: popular ? 'elevated' : 'default',
        badge: popular ? 'Popular' : undefined,
        ...props.props,
      }}
    >
      <div className="text-center space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{plan}</h3>
          <div className="mt-4">
            <span className="text-4xl font-bold text-gray-900">{price}</span>
            <span className="text-gray-600">/{period}</span>
          </div>
        </div>
        
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
        
        <button
          onClick={ctaAction}
          className={cn(
            "w-full py-3 px-6 rounded-md font-medium transition-colors",
            popular 
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-900 hover:bg-gray-200"
          )}
        >
          {ctaText}
        </button>
      </div>
    </Card>
  );
};