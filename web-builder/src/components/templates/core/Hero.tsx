import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Play, ArrowRight, Sparkles, Star } from 'lucide-react';

interface HeroProps {
  id?: string;
  content?: string;
  styles?: React.CSSProperties;
  className?: string;
  props?: {
    headline?: string;
    subheadline?: string;
    primaryCta?: string;
    secondaryCta?: string;
    primaryCtaLink?: string;
    secondaryCtaLink?: string;
    backgroundImage?: string;
    overlay?: boolean;
    height?: string;
    align?: 'left' | 'center' | 'right';
    pattern?: boolean;
    variant?: 'default' | 'gradient' | 'video' | 'minimal' | 'split';
    animation?: boolean;
    showRating?: boolean;
    rating?: number;
    reviews?: number;
    socialProof?: string[];
    badge?: string;
    videoUrl?: string;
    features?: string[];
  };
}

export const Hero: React.FC<HeroProps> = ({ 
  content, 
  styles, 
  className,
  props = {}
}) => {
  const {
    headline = 'Transform Your Business',
    subheadline = 'Get started with our powerful platform and unlock your potential.',
    primaryCta = 'Get Started',
    secondaryCta = 'Learn More',
    primaryCtaLink = '#',
    secondaryCtaLink = '#',
    backgroundImage,
    overlay = true,
    height = '600px',
    align = 'center',
    pattern = false,
    variant = 'default',
    animation = true,
    showRating = false,
    rating = 4.9,
    reviews = 1234,
    socialProof = [],
    badge,
    videoUrl,
    features = []
  } = props;

  const getVariantStyles = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600';
      case 'minimal':
        return 'bg-white text-gray-900';
      case 'video':
        return 'bg-black text-white';
      case 'split':
        return 'bg-gradient-to-r from-blue-600 to-transparent';
      default:
        return 'bg-gradient-to-br from-gray-900 to-blue-900';
    }
  };

  const heroStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: height,
    display: 'flex',
    alignItems: 'center',
    justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
    backgroundImage: backgroundImage 
      ? `linear-gradient(rgba(0, 0, 0, ${overlay ? 0.5 : 0}), rgba(0, 0, 0, ${overlay ? 0.5 : 0})), url(${backgroundImage})`
      : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: variant === 'minimal' ? '#1f2937' : '#ffffff',
    overflow: 'hidden',
    ...styles,
  };

  const contentStyles = {
    textAlign: align as React.CSSProperties['textAlign'],
    maxWidth: variant === 'split' ? '50%' : '800px',
    padding: '0 20px',
    zIndex: 10,
  };

  const MotionWrapper = animation ? motion.div : 'div';
  const motionProps = animation ? {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, staggerChildren: 0.1 }
  } : {};

  return (
    <section 
      style={heroStyles} 
      className={cn(
        'hero-section relative',
        getVariantStyles(),
        className
      )}
    >
      {/* Background Pattern */}
      {pattern && (
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      )}

      {/* Video Background */}
      {variant === 'video' && videoUrl && (
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
      )}

      {/* Floating Elements */}
      {animation && (
        <>
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ 
              y: [0, 30, 0],
              x: [0, 10, 0],
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-20 right-20 w-32 h-32 bg-blue-500 bg-opacity-20 rounded-full blur-2xl"
          />
        </>
      )}

      <MotionWrapper {...motionProps} style={contentStyles} className="relative z-10">
        {/* Badge */}
        {badge && (
          <motion.div
            initial={animation ? { opacity: 0, y: 20 } : {}}
            animate={animation ? { opacity: 1, y: 0 } : {}}
            transition={animation ? { delay: 0.2 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            {badge}
          </motion.div>
        )}

        {/* Headline */}
        <motion.h1 
          initial={animation ? { opacity: 0, y: 30 } : {}}
          animate={animation ? { opacity: 1, y: 0 } : {}}
          transition={animation ? { delay: 0.3 } : {}}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
        >
          {headline.split(' ').map((word, index) => (
            <motion.span
              key={index}
              initial={animation ? { opacity: 0, y: 20 } : {}}
              animate={animation ? { opacity: 1, y: 0 } : {}}
              transition={animation ? { delay: 0.3 + index * 0.1 } : {}}
              className="inline-block mr-2"
              style={{
                background: word.toLowerCase().includes('transform') || word.toLowerCase().includes('ai') || word.toLowerCase().includes('powerful') 
                  ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                  : 'inherit',
                backgroundClip: word.toLowerCase().includes('transform') || word.toLowerCase().includes('ai') || word.toLowerCase().includes('powerful') 
                  ? 'text' 
                  : 'inherit',
                WebkitBackgroundClip: word.toLowerCase().includes('transform') || word.toLowerCase().includes('ai') || word.toLowerCase().includes('powerful') 
                  ? 'text' 
                  : 'inherit',
                WebkitTextFillColor: word.toLowerCase().includes('transform') || word.toLowerCase().includes('ai') || word.toLowerCase().includes('powerful') 
                  ? 'transparent' 
                  : 'inherit',
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={animation ? { opacity: 0, y: 20 } : {}}
          animate={animation ? { opacity: 1, y: 0 } : {}}
          transition={animation ? { delay: 0.5 } : {}}
          className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed"
        >
          {subheadline}
        </motion.p>

        {/* Features List */}
        {features.length > 0 && (
          <motion.div
            initial={animation ? { opacity: 0, y: 20 } : {}}
            animate={animation ? { opacity: 1, y: 0 } : {}}
            transition={animation ? { delay: 0.6 } : {}}
            className="flex flex-wrap gap-4 mb-8"
          >
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                {feature}
              </div>
            ))}
          </motion.div>
        )}

        {/* Rating */}
        {showRating && (
          <motion.div
            initial={animation ? { opacity: 0, y: 20 } : {}}
            animate={animation ? { opacity: 1, y: 0 } : {}}
            transition={animation ? { delay: 0.7 } : {}}
            className="flex items-center gap-4 mb-8"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm opacity-90">
              {rating} out of 5 ({reviews.toLocaleString()} reviews)
            </span>
          </motion.div>
        )}

        {/* CTA Buttons */}
        <motion.div 
          initial={animation ? { opacity: 0, y: 20 } : {}}
          animate={animation ? { opacity: 1, y: 0 } : {}}
          transition={animation ? { delay: 0.8 } : {}}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <motion.a
            href={primaryCtaLink}
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
            whileTap={{ scale: 0.95 }}
            className="group bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
          >
            {primaryCta}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.a>
          
          <motion.a
            href={secondaryCtaLink}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            {secondaryCta}
          </motion.a>
        </motion.div>

        {/* Social Proof */}
        {socialProof.length > 0 && (
          <motion.div
            initial={animation ? { opacity: 0, y: 20 } : {}}
            animate={animation ? { opacity: 1, y: 0 } : {}}
            transition={animation ? { delay: 0.9 } : {}}
            className="text-center"
          >
            <p className="text-sm opacity-70 mb-4">Trusted by teams at</p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              {socialProof.map((company, index) => (
                <div key={index} className="text-lg font-semibold">
                  {company}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </MotionWrapper>

      {/* Split Layout Image */}
      {variant === 'split' && (
        <motion.div
          initial={animation ? { opacity: 0, x: 100 } : {}}
          animate={animation ? { opacity: 1, x: 0 } : {}}
          transition={animation ? { delay: 0.5, duration: 0.8 } : {}}
          className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-500 to-transparent opacity-20"
        >
          {/* Placeholder for split image */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-80 h-80 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm"></div>
          </div>
        </motion.div>
      )}

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent opacity-20"></div>
    </section>
  );
};