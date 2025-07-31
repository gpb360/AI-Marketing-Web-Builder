import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  id?: string;
  styles?: React.CSSProperties;
  className?: string;
  props?: {
    logo?: string | React.ReactNode;
    logoLink?: string;
    menuItems?: Array<{
      label: string;
      href: string;
      dropdown?: Array<{ label: string; href: string }>;
      isButton?: boolean;
    }>;
    cta?: {
      text: string;
      href: string;
      variant?: 'primary' | 'secondary' | 'outline';
    };
    sticky?: boolean;
    transparent?: boolean;
    dark?: boolean;
    mobileMenu?: boolean;
    search?: boolean;
    social?: boolean;
    rightSection?: React.ReactNode;
  };
}

export const Navigation: React.FC<NavigationProps> = ({ 
  styles, 
  className,
  props = {}
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const {
    logo = 'Brand',
    logoLink = '/',
    menuItems = [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' }
    ],
    cta = { text: 'Get Started', href: '#', variant: 'primary' },
    sticky = true,
    transparent = false,
    dark = false,
    mobileMenu = true,
    search = false,
    social = false,
    rightSection
  } = props;

  const navStyles: React.CSSProperties = {
    position: sticky ? 'sticky' : 'relative',
    top: 0,
    zIndex: 1000,
    width: '100%',
    backgroundColor: transparent ? 'rgba(255, 255, 255, 0.95)' : (dark ? '#1f2937' : '#ffffff'),
    backdropFilter: 'blur(10px)',
    borderBottom: `1px solid ${dark ? '#374151' : '#e5e7eb'}`,
    ...styles,
  };

  const textColor = dark ? 'text-white' : 'text-gray-900';
  const textColorSecondary = dark ? 'text-gray-300' : 'text-gray-700';
  const hoverColor = dark ? 'hover:text-white' : 'hover:text-gray-900';
  const borderColor = dark ? 'border-gray-700' : 'border-gray-200';

  const renderLogo = () => {
    if (typeof logo === 'string') {
      return <span className={cn("text-2xl font-bold", textColor)}>{logo}</span>;
    }
    return logo;
  };

  return (
    <nav style={navStyles} className={cn('navigation', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            {logoLink ? (
              <a href={logoLink} className="flex items-center">{renderLogo()}</a>
            ) : (
              <div className="flex items-center">{renderLogo()}</div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {menuItems.map((item) => (
              <div key={item.label} className="relative">
                {item.dropdown ? (
                  <div className="relative">
                    <button
                      className={cn(
                        "flex items-center space-x-1 px-3 py-2 text-sm font-medium",
                        textColorSecondary,
                        hoverColor,
                        "transition-colors"
                      )}
                      onMouseEnter={() => setOpenDropdown(item.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <span>{item.label}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {openDropdown === item.label && (
                      <div 
                        className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20"
                        onMouseEnter={() => setOpenDropdown(item.label)}
                        onMouseLeave={() => setOpenDropdown(null)}
                      >
                        {item.dropdown.map((subItem) => (
                          <a
                            key={subItem.label}
                            href={subItem.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {subItem.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={item.href}
                    className={cn(
                      "px-3 py-2 text-sm font-medium",
                      textColorSecondary,
                      hoverColor,
                      "transition-colors",
                      item.isButton && "bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    )}
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}

            {/* Search */}
            {search && (
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search..."
                  className={cn(
                    "w-64 px-4 py-2 text-sm rounded-md border",
                    dark 
                      ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                  )}
                />
              </div>
            )}

            {/* CTA Button */}
            {cta && (
              <a
                href={cta.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  cta.variant === 'primary' 
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : cta.variant === 'secondary'
                    ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
              >
                {cta.text}
              </a>
            )}

            {/* Right Section */}
            {rightSection}
          </div>

          {/* Mobile Menu Button */}
          {mobileMenu && (
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  "p-2 rounded-md",
                  textColorSecondary,
                  "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <span className="sr-only">Open menu</span>
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && isMobileMenuOpen && (
        <div className={cn("md:hidden", borderColor, "border-t")}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <div key={item.label}>
                {item.dropdown ? (
                  <div className="space-y-1">
                    <p className={cn("px-3 py-2 text-base font-medium", textColor)}>{item.label}</p>
                    {item.dropdown.map((subItem) => (
                      <a
                        key={subItem.label}
                        href={subItem.href}
                        className={cn(
                          "block px-6 py-2 text-base font-medium",
                          textColorSecondary,
                          hoverColor
                        )}
                      >
                        {subItem.label}
                      </a>
                    ))}
                  </div>
                ) : (
                  <a
                    href={item.href}
                    className={cn(
                      "block px-3 py-2 text-base font-medium",
                      textColorSecondary,
                      hoverColor
                    )}
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}
            
            {cta && (
              <a
                href={cta.href}
                className={cn(
                  "block w-full text-center mt-4 px-4 py-2 text-base font-medium rounded-md",
                  "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {cta.text}
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};