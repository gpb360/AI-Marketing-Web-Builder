'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

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
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/80 backdrop-blur-md border-b border-gray-800' 
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-white text-lg font-semibold hover:text-yellow-400 transition-colors">
          AI Marketing Pro
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              {link.href.startsWith('/') && !link.href.startsWith('/#') ? (
                <Link
                  href={link.href}
                  className={`text-sm transition-colors duration-200 ${
                    pathname === link.href
                      ? 'text-yellow-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  className="text-gray-300 text-sm hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Link
            href="/builder"
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold px-6 py-2 rounded-lg hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-400/30"
          >
            Start Building
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-white p-2"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-black/95 backdrop-blur-md border-b border-gray-800"
        >
          <div className="px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <div key={link.href}>
                {link.href.startsWith('/') && !link.href.startsWith('/#') ? (
                  <Link
                    href={link.href}
                    className={`block transition-colors ${
                      pathname === link.href
                        ? 'text-yellow-400'
                        : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="block text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                )}
              </div>
            ))}
            <Link
              href="/builder"
              className="block w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold px-6 py-3 rounded-lg text-center hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Start Building
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
