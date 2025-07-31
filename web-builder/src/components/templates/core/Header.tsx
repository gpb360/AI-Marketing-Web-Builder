import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  id?: string;
  styles?: React.CSSProperties;
  className?: string;
  props?: {
    sticky?: boolean;
    transparent?: boolean;
    logo?: string;
    menuItems?: string[];
    ctaText?: string;
    ctaLink?: string;
    mobileMenu?: boolean;
  };
}

export const Header: React.FC<HeaderProps> = ({ 
  styles, 
  className,
  props = {}
}) => {
  const {
    sticky = true,
    transparent = false,
    logo = 'Brand',
    menuItems = ['Features', 'Pricing', 'About', 'Contact'],
    ctaText = 'Get Started',
    ctaLink = '#',
    mobileMenu = true
  } = props;

  const headerStyles: React.CSSProperties = {
    position: sticky ? 'sticky' : 'relative',
    top: 0,
    zIndex: 50,
    width: '100%',
    backgroundColor: transparent ? 'rgba(255, 255, 255, 0.95)' : '#ffffff',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #e5e7eb',
    ...styles,
  };

  return (
    <header style={headerStyles} className={cn('w-full', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="#" className="text-2xl font-bold text-gray-900">{logo}</a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center">
            <a
              href={ctaLink}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {ctaText}
            </a>
          </div>

          {/* Mobile Menu Button */}
          {mobileMenu && (
            <div className="md:hidden">
              <button className="text-gray-700 hover:text-gray-900 p-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};