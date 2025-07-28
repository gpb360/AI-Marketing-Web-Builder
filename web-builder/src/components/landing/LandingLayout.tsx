'use client';

import React from 'react';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { BuilderDemo } from './BuilderDemo';
import { FeaturesSection } from './FeaturesSection';
import { Footer } from './Footer';

interface LandingLayoutProps {
  children?: React.ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Interactive Builder Demo */}
      <BuilderDemo />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Additional Content */}
      {children}
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
