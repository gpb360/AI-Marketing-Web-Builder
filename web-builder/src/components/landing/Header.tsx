'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { UserNav } from '@/components/auth/UserNav';
import theme from '@/lib/theme';

const { luxuryTheme } = theme;

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if we're on the homepage
  const isHomePage = pathname === '/';

  const navLinks = [
    {
      href: isHomePage ? '#platform' : '/#platform',
      label: 'Platform'
    },
    {
      href: isHomePage ? '#features' : '/#features',
      label: 'Features'
    },
    {
      href: '/templates',
      label: 'Templates'
    },
    {
      href: isHomePage ? '#pricing' : '/#pricing',
      label: 'Pricing'
    },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/90 backdrop-blur-xl border-b border-yellow-400/20 shadow-2xl' 
          : 'bg-black/80 backdrop-blur-xl border-b border-white/10'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Luxury Logo */}
        <motion.div 
          className="flex items-center space-x-3" 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-2xl shadow-yellow-400/30 transition-all duration-300 group-hover:shadow-yellow-400/50">
                <span className="text-black font-black text-xl">AI</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className={`text-xl font-bold ${luxuryTheme.colors.text.primary} group-hover:${luxuryTheme.colors.text.accent} transition-colors duration-200`}>
              AI Marketing Pro
            </span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center space-x-8">
          {navLinks.map((link, index) => (
            <motion.li 
              key={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              {link.href.startsWith('/') && !link.href.startsWith('/#') ? (
                <Link
                  href={link.href}
                  className={`text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    pathname === link.href
                      ? `${luxuryTheme.colors.text.accent} font-semibold`
                      : `${luxuryTheme.colors.text.secondary} hover:${luxuryTheme.colors.text.primary}`
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  className={`${luxuryTheme.colors.text.secondary} text-sm font-medium hover:${luxuryTheme.colors.text.primary} transition-all duration-200 hover:scale-105`}
                >
                  {link.label}
                </a>
              )}
            </motion.li>
          ))}
        </ul>

        {/* Enhanced CTA Button / User Nav */}
        <motion.div 
          className="hidden md:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <UserNav />
        </motion.div>

        {/* Mobile Menu Button with Enhanced Styling */}
        <motion.button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`md:hidden ${luxuryTheme.colors.text.primary} p-3 rounded-xl bg-gray-800/50 backdrop-blur-md border border-gray-700 hover:border-yellow-400/50 hover:bg-yellow-400/10 transition-all duration-200`}
          aria-label="Toggle mobile menu"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
      </nav>

      {/* Enhanced Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-black/95 backdrop-blur-xl border-b border-yellow-400/20 shadow-2xl"
        >
          <div className="px-6 py-6 space-y-6">
            {/* Mobile Navigation Links */}
            <div className="space-y-4">
              {navLinks.map((link, index) => (
                <motion.div 
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {link.href.startsWith('/') && !link.href.startsWith('/#') ? (
                    <Link
                      href={link.href}
                      className={`block py-3 px-4 rounded-xl transition-all duration-200 ${
                        pathname === link.href
                          ? `${luxuryTheme.colors.text.accent} bg-yellow-400/10 border border-yellow-400/30 font-semibold`
                          : `${luxuryTheme.colors.text.secondary} hover:${luxuryTheme.colors.text.primary} hover:bg-gray-800/50`
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className={`block py-3 px-4 rounded-xl ${luxuryTheme.colors.text.secondary} hover:${luxuryTheme.colors.text.primary} hover:bg-gray-800/50 transition-all duration-200`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Mobile User Navigation */}
            <motion.div 
              className="pt-4 border-t border-gray-700"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <UserNav isMobile={true} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
