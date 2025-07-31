import React from 'react';
import { cn } from '@/lib/utils';

interface FooterProps {
  id?: string;
  styles?: React.CSSProperties;
  className?: string;
  props?: {
    companyName?: string;
    links?: {
      product?: string[];
      company?: string[];
      resources?: string[];
      legal?: string[];
    };
    socialLinks?: string[];
    newsletter?: boolean;
    copyright?: string;
  };
}

export const Footer: React.FC<FooterProps> = ({ 
  styles, 
  className,
  props = {}
}) => {
  const {
    companyName = 'Company',
    links = {
      product: ['Features', 'Pricing', 'API', 'Integrations'],
      company: ['About', 'Blog', 'Careers', 'Contact'],
      resources: ['Documentation', 'Help Center', 'Community', 'Status'],
      legal: ['Privacy', 'Terms', 'Security', 'GDPR']
    },
    socialLinks = ['Twitter', 'LinkedIn', 'GitHub', 'YouTube'],
    newsletter = false,
    copyright = `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`
  } = props;

  const footerStyles: React.CSSProperties = {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    padding: '80px 0 40px',
    ...styles,
  };

  return (
    <footer style={footerStyles} className={cn('w-full', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4">{companyName}</h3>
            <p className="text-gray-400 mb-4">
              Building the future of digital experiences with cutting-edge technology and innovative solutions.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">{social}</span>
                  {/* Placeholder for social icons */}
                  <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2">
              {links.product?.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2">
              {links.company?.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2">
              {links.resources?.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter (optional) */}
        {newsletter && (
          <div className="border-t border-gray-700 pt-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h4 className="text-lg font-semibold mb-2">Stay Updated</h4>
                <p className="text-gray-400">Get the latest news and updates delivered to your inbox.</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">{copyright}</p>
            <div className="flex space-x-6">
              {links.legal?.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};