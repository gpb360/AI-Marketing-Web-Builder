import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps {
  id?: string;
  content?: string;
  styles?: React.CSSProperties;
  className?: string;
  props?: {
    text?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    disabled?: boolean;
    loading?: boolean;
    icon?: string | React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    rounded?: boolean;
    href?: string;
    target?: string;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
  };
}

export const Button: React.FC<ButtonProps> = ({ 
  content, 
  styles, 
  className,
  props = {}
}) => {
  const {
    text = 'Click me',
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    rounded = false,
    href,
    target,
    onClick,
    type = 'button'
  } = props;

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500'
  };

  const disabledClasses = disabled || loading 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer';

  const buttonClasses = cn(
    'inline-flex items-center justify-center font-medium rounded-md',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'transition-colors duration-200',
    sizeClasses[size],
    variantClasses[variant],
    disabledClasses,
    fullWidth && 'w-full',
    rounded && 'rounded-full',
    className
  );

  const renderIcon = () => {
    if (!icon) return null;
    
    const iconElement = typeof icon === 'string' ? (
      <span className="text-lg">{icon}</span>
    ) : (
      icon
    );

    return (
      <span className={cn(
        "flex-shrink-0",
        iconPosition === 'left' ? "mr-2" : "ml-2"
      )}>
        {iconElement}
      </span>
    );
  };

  const buttonContent = (
    <>
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {!loading && iconPosition === 'left' && renderIcon()}
      
      <span>{content || text}</span>
      
      {!loading && iconPosition === 'right' && renderIcon()}
    </>
  );

  if (href) {
    return (
      <a 
        href={href} 
        target={target}
        className={buttonClasses}
        style={styles}
        onClick={onClick}
        aria-disabled={disabled || loading}
      >
        {buttonContent}
      </a>
    );
  }

  return (
    <button 
      type={type}
      className={buttonClasses}
      style={styles}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {buttonContent}
    </button>
  );
};

// Button Group Component
interface ButtonGroupProps {
  children?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ 
  children, 
  size = 'md', 
  orientation = 'horizontal', 
  spacing = 'normal',
  className 
}) => {
  const spacingClasses = {
    tight: 'space-x-1',
    normal: 'space-x-2',
    loose: 'space-x-4'
  };

  const orientationClasses = {
    horizontal: 'flex flex-row',
    vertical: 'flex flex-col space-y-2'
  };

  return (
    <div className={cn(
      orientationClasses[orientation],
      orientation === 'horizontal' && spacingClasses[spacing],
      className
    )}>
      {React.Children.map(children, (child) => 
        React.cloneElement(child as React.ReactElement, { size })
      )}
    </div>
  );
};

// Action Buttons Component
interface ActionButtonsProps {
  actions: Array<{
    text: string;
    href?: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    icon?: string | React.ReactNode;
  }>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  actions, 
  size = 'md', 
  orientation = 'horizontal',
  className 
}) => {
  return (
    <ButtonGroup size={size} orientation={orientation} className={className}>
      {actions.map((action, index) => (
        <Button
          key={index}
          props={{
            text: action.text,
            href: action.href,
            onClick: action.onClick,
            variant: action.variant || 'primary',
            icon: action.icon
          }}
        />
      ))}
    </ButtonGroup>
  );
};