/**
 * Loading Skeleton Components for Story 1.3
 * 
 * Progressive loading states with smooth transitions
 * Part of Story 1.3: Frontend Context-Aware Template Integration
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  animate?: boolean;
}

// Base skeleton component with enhanced animations
export const AnimatedSkeleton: React.FC<{
  className?: string;
  pulse?: boolean;
  shimmer?: boolean;
}> = ({ className, pulse = true, shimmer = false }) => {
  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700 rounded',
        pulse && 'animate-pulse',
        shimmer && 'relative overflow-hidden',
        className
      )}
    >
      {shimmer && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-gray-600/60" />
      )}
    </div>
  );
};

// Business Context Analysis Loading
export const BusinessAnalysisLoading: React.FC<LoadingSkeletonProps> = ({ 
  className = '', 
  animate = true 
}) => (
  <div className={`space-y-6 ${className}`}>
    {/* Header */}
    <div className="flex items-center gap-3">
      <AnimatedSkeleton className="h-6 w-6 rounded-full" pulse={animate} />
      <div className="space-y-2">
        <AnimatedSkeleton className="h-6 w-64" pulse={animate} />
        <AnimatedSkeleton className="h-4 w-96" pulse={animate} />
      </div>
    </div>

    {/* Form Sections */}
    <Card className="p-6 space-y-8">
      {/* Company Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <AnimatedSkeleton className="h-5 w-5 rounded-full" pulse={animate} />
          <AnimatedSkeleton className="h-5 w-48" pulse={animate} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <AnimatedSkeleton className="h-4 w-24" pulse={animate} />
            <AnimatedSkeleton className="h-10 w-full" pulse={animate} />
          </div>
          <div className="space-y-2">
            <AnimatedSkeleton className="h-4 w-20" pulse={animate} />
            <AnimatedSkeleton className="h-10 w-full" pulse={animate} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <AnimatedSkeleton className="h-4 w-28" pulse={animate} />
            <AnimatedSkeleton className="h-10 w-full" pulse={animate} />
          </div>
          <div className="space-y-2">
            <AnimatedSkeleton className="h-4 w-32" pulse={animate} />
            <AnimatedSkeleton className="h-10 w-full" pulse={animate} />
          </div>
        </div>
      </div>

      {/* Business Goals Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <AnimatedSkeleton className="h-5 w-5 rounded-full" pulse={animate} />
          <AnimatedSkeleton className="h-5 w-32" pulse={animate} />
        </div>
        <div className="space-y-4">
          <div className="space-y-3">
            <AnimatedSkeleton className="h-4 w-40" pulse={animate} />
            <AnimatedSkeleton className="h-3 w-72" pulse={animate} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <AnimatedSkeleton className="h-4 w-4 rounded" pulse={animate} />
                  <AnimatedSkeleton className="h-4 w-32" pulse={animate} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-6 border-t border-gray-200 dark:border-gray-700">
        <AnimatedSkeleton className="h-12 w-48 rounded-md" pulse={animate} />
      </div>
    </Card>
  </div>
);

// Template Recommendations Loading
export const TemplateRecommendationsLoading: React.FC<LoadingSkeletonProps & {
  count?: number;
  viewMode?: 'grid' | 'list';
}> = ({ 
  className = '', 
  animate = true, 
  count = 6, 
  viewMode = 'grid' 
}) => (
  <div className={`space-y-6 ${className}`}>
    {/* Header */}
    <div className="flex items-center gap-3">
      <AnimatedSkeleton className="h-6 w-6 rounded-full" pulse={animate} shimmer />
      <div className="space-y-2">
        <AnimatedSkeleton className="h-6 w-56" pulse={animate} />
        <AnimatedSkeleton className="h-4 w-80" pulse={animate} />
      </div>
    </div>

    {/* Filters */}
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <AnimatedSkeleton className="h-10 w-full rounded-md" pulse={animate} />
          </div>
          <div className="flex items-center gap-2">
            <AnimatedSkeleton className="h-8 w-8 rounded" pulse={animate} />
            <AnimatedSkeleton className="h-8 w-8 rounded" pulse={animate} />
          </div>
          <AnimatedSkeleton className="h-8 w-20 rounded-md" pulse={animate} />
        </div>
      </div>
    </Card>

    {/* Templates Grid/List */}
    <div className={
      viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
        : 'space-y-4'
    }>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className={`${viewMode === 'grid' ? 'flex flex-col h-full' : 'flex flex-row space-x-4'} p-4`}>
          {/* Template Image */}
          <div className={`${viewMode === 'grid' ? 'w-full h-48' : 'w-32 h-32'} bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative`}>
            <AnimatedSkeleton 
              className="w-full h-full" 
              pulse={animate} 
              shimmer 
            />
            {/* Confidence Badge */}
            <div className="absolute top-2 right-2">
              <AnimatedSkeleton className="h-6 w-16 rounded-full" pulse={animate} />
            </div>
          </div>

          {/* Content */}
          <div className={`${viewMode === 'grid' ? 'mt-4' : 'flex-1'} space-y-3`}>
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <AnimatedSkeleton className="h-5 w-3/4" pulse={animate} />
                <AnimatedSkeleton className="h-5 w-16 rounded-full" pulse={animate} />
              </div>
              <AnimatedSkeleton className="h-4 w-full" pulse={animate} />
              <AnimatedSkeleton className="h-4 w-2/3" pulse={animate} />
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <AnimatedSkeleton className="h-3 w-3 rounded" pulse={animate} />
                <AnimatedSkeleton className="h-3 w-12" pulse={animate} />
              </div>
              <div className="flex items-center gap-1">
                <AnimatedSkeleton className="h-3 w-3 rounded" pulse={animate} />
                <AnimatedSkeleton className="h-3 w-16" pulse={animate} />
              </div>
              <AnimatedSkeleton className="h-4 w-20 rounded-full" pulse={animate} />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: 3 }).map((_, j) => (
                <AnimatedSkeleton key={j} className="h-4 w-12 rounded-full" pulse={animate} />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <AnimatedSkeleton className="flex-1 h-8 rounded-md" pulse={animate} />
              <AnimatedSkeleton className="w-8 h-8 rounded-md" pulse={animate} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// Template Personalization Loading
export const TemplatePersonalizationLoading: React.FC<LoadingSkeletonProps> = ({ 
  className = '', 
  animate = true 
}) => (
  <div className={`space-y-6 ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AnimatedSkeleton className="h-6 w-6 rounded-full" pulse={animate} />
        <div className="space-y-2">
          <AnimatedSkeleton className="h-6 w-48" pulse={animate} />
          <AnimatedSkeleton className="h-4 w-80" pulse={animate} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <AnimatedSkeleton className="h-8 w-20 rounded-md" pulse={animate} />
        <AnimatedSkeleton className="h-8 w-32 rounded-md" pulse={animate} />
      </div>
    </div>

    {/* Main Layout */}
    <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
      {/* Customization Panels */}
      <div className="space-y-6">
        <Card className="p-6">
          {/* Tabs */}
          <div className="space-y-6">
            <div className="grid w-full grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <AnimatedSkeleton key={i} className="h-10 rounded-md" pulse={animate} />
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              <div className="space-y-2">
                <AnimatedSkeleton className="h-5 w-32" pulse={animate} />
                <AnimatedSkeleton className="h-4 w-56" pulse={animate} />
              </div>

              {/* Color Palettes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <AnimatedSkeleton key={j} className="w-6 h-6 rounded-full" pulse={animate} />
                        ))}
                      </div>
                      <AnimatedSkeleton className="h-4 w-24" pulse={animate} />
                    </div>
                  </Card>
                ))}
              </div>

              {/* Custom Colors */}
              <div className="space-y-3">
                <AnimatedSkeleton className="h-4 w-28" pulse={animate} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <AnimatedSkeleton className="h-4 w-16" pulse={animate} />
                      <div className="flex items-center gap-2 flex-1">
                        <AnimatedSkeleton className="w-8 h-8 rounded" pulse={animate} />
                        <AnimatedSkeleton className="flex-1 h-8" pulse={animate} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Preview Panel */}
      <div className="space-y-4">
        <Card className="p-4">
          <div className="space-y-4">
            {/* Preview Header */}
            <div className="flex items-center justify-between">
              <AnimatedSkeleton className="h-5 w-24" pulse={animate} />
              <div className="flex items-center gap-2">
                <AnimatedSkeleton className="h-6 w-6 rounded" pulse={animate} />
                <AnimatedSkeleton className="h-6 w-6 rounded" pulse={animate} />
                <AnimatedSkeleton className="h-6 w-6 rounded" pulse={animate} />
              </div>
            </div>

            {/* Preview Content */}
            <div className="space-y-4">
              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                <AnimatedSkeleton 
                  className="w-full h-full" 
                  pulse={animate} 
                  shimmer 
                />
                <div className="absolute inset-4 space-y-3">
                  <AnimatedSkeleton className="h-8 w-3/4" pulse={animate} />
                  <AnimatedSkeleton className="h-4 w-full" pulse={animate} />
                  <AnimatedSkeleton className="h-4 w-2/3" pulse={animate} />
                  <div className="mt-6">
                    <AnimatedSkeleton className="h-10 w-32 rounded-md" pulse={animate} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>

    {/* Bottom Action Bar */}
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <AnimatedSkeleton className="h-4 w-4 rounded-full" pulse={animate} />
            <div className="space-y-1">
              <AnimatedSkeleton className="h-4 w-32" pulse={animate} />
              <AnimatedSkeleton className="h-3 w-48" pulse={animate} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AnimatedSkeleton className="h-8 w-24 rounded-md" pulse={animate} />
          <AnimatedSkeleton className="h-8 w-20 rounded-md" pulse={animate} />
          <AnimatedSkeleton className="h-8 w-32 rounded-md" pulse={animate} />
          <AnimatedSkeleton className="h-8 w-28 rounded-md" pulse={animate} />
        </div>
      </div>
    </Card>
  </div>
);

// Contextual Recommendations Loading
export const ContextualRecommendationsLoading: React.FC<LoadingSkeletonProps & {
  count?: number;
}> = ({ 
  className = '', 
  animate = true, 
  count = 4 
}) => (
  <div className={`space-y-6 ${className}`}>
    {/* Header */}
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
          <AnimatedSkeleton className="h-7 w-7 rounded" pulse={animate} />
        </div>
        <div className="space-y-2">
          <AnimatedSkeleton className="h-7 w-72" pulse={animate} />
          <AnimatedSkeleton className="h-4 w-96" pulse={animate} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <AnimatedSkeleton className="h-8 w-16 rounded-md" pulse={animate} />
          <AnimatedSkeleton className="h-8 w-16 rounded-md" pulse={animate} />
        </div>
        <AnimatedSkeleton className="h-8 w-40 rounded-md" pulse={animate} />
        <AnimatedSkeleton className="h-8 w-20 rounded-md" pulse={animate} />
      </div>
    </div>

    {/* Business Context Summary */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-xl">
            <AnimatedSkeleton className="h-6 w-6" pulse={animate} />
          </div>
          <div className="flex-1 space-y-4">
            <AnimatedSkeleton className="h-6 w-64" pulse={animate} />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <AnimatedSkeleton className="h-4 w-4 rounded" pulse={animate} />
                  <AnimatedSkeleton className="h-4 w-48" pulse={animate} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-center space-y-4">
          <AnimatedSkeleton className="h-8 w-8 mx-auto" pulse={animate} />
          <AnimatedSkeleton className="h-4 w-32 mx-auto" pulse={animate} />
          <div className="space-y-2">
            <div className="flex justify-between">
              <AnimatedSkeleton className="h-3 w-20" pulse={animate} />
              <AnimatedSkeleton className="h-3 w-12" pulse={animate} />
            </div>
            <div className="flex justify-between">
              <AnimatedSkeleton className="h-3 w-24" pulse={animate} />
              <AnimatedSkeleton className="h-3 w-16" pulse={animate} />
            </div>
          </div>
        </div>
      </Card>
    </div>

    {/* Recommendations Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <AnimatedSkeleton className="h-5 w-3/4" pulse={animate} />
              <AnimatedSkeleton className="h-4 w-full" pulse={animate} />
              <AnimatedSkeleton className="h-4 w-2/3" pulse={animate} />
            </div>
            <AnimatedSkeleton className="h-6 w-16 rounded-full" pulse={animate} />
          </div>

          <div className="space-y-2">
            <AnimatedSkeleton className="h-4 w-full" pulse={animate} />
            <AnimatedSkeleton className="h-4 w-5/6" pulse={animate} />
          </div>

          <div className="flex items-center gap-2">
            <AnimatedSkeleton className="h-4 w-12 rounded-full" pulse={animate} />
            <AnimatedSkeleton className="h-4 w-16 rounded-full" pulse={animate} />
          </div>

          <AnimatedSkeleton className="h-8 w-full rounded-md" pulse={animate} />
        </Card>
      ))}
    </div>
  </div>
);

// Combined loading state selector
export const ContextAwareTemplateLoading: React.FC<{
  type: 'analysis' | 'recommendations' | 'personalization' | 'contextual';
  className?: string;
  animate?: boolean;
  [key: string]: any;
}> = ({ type, className, animate = true, ...props }) => {
  switch (type) {
    case 'analysis':
      return <BusinessAnalysisLoading className={className} animate={animate} {...props} />;
    case 'recommendations':
      return <TemplateRecommendationsLoading className={className} animate={animate} {...props} />;
    case 'personalization':
      return <TemplatePersonalizationLoading className={className} animate={animate} {...props} />;
    case 'contextual':
      return <ContextualRecommendationsLoading className={className} animate={animate} {...props} />;
    default:
      return <BusinessAnalysisLoading className={className} animate={animate} {...props} />;
  }
};

export default ContextAwareTemplateLoading;