'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, ArrowRight } from 'lucide-react';

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section className="hero min-h-screen flex flex-col justify-center items-center text-center px-6 pt-16">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto"
      >
        {/* Hero Title */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
        >
          Beautiful Websites That{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500">
            Actually Work
          </span>{' '}
          for Your Business
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8"
        >
          The first drag-and-drop builder where every component connects directly to CRM, 
          workflows, and automation. No integrations. No complexity. Just results.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/builder"
            className="group bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold px-8 py-4 rounded-lg hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-400/30 flex items-center gap-2"
          >
            Build My Marketing System
            <ArrowRight 
              size={20} 
              className="group-hover:translate-x-1 transition-transform duration-200" 
            />
          </Link>

          <button className="group border border-gray-600 text-gray-300 font-semibold px-8 py-4 rounded-lg hover:border-yellow-400 hover:text-yellow-400 transition-all duration-200 flex items-center gap-2">
            <Play size={20} className="group-hover:scale-110 transition-transform duration-200" />
            See Platform Demo
          </button>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          variants={itemVariants}
          className="mt-16 text-center"
        >
          <p className="text-sm text-gray-400 mb-4">
            Trusted by 10,000+ businesses worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {/* Placeholder for company logos */}
            <div className="text-gray-500 text-sm font-medium">Company 1</div>
            <div className="text-gray-500 text-sm font-medium">Company 2</div>
            <div className="text-gray-500 text-sm font-medium">Company 3</div>
            <div className="text-gray-500 text-sm font-medium">Company 4</div>
            <div className="text-gray-500 text-sm font-medium">Company 5</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-yellow-400 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
