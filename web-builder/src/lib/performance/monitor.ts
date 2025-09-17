/**
 * Performance Monitor for AI Marketing Web Builder
 * 
 * Tracks performance metrics for MVP validation:
 * - Template-to-site generation time (<30 minutes target)
 * - Page load times (<3 seconds target)
 * - Core Web Vitals monitoring
 * - Resource usage tracking
 */

export interface PerformanceMetrics {
  timestamp: string;
  metric: string;
  value: number;
  unit: string;
  target?: number;
  status: 'pass' | 'fail' | 'warning';
}

export interface SiteGenerationMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  componentCount: number;
  assetCount: number;
  totalSize: number;
  seoScore: number;
  responsiveScore: number;
  status: 'pass' | 'fail';
}

export interface CoreWebVitals {
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  FCP: number; // First Contentful Paint
  TTFB: number; // Time to First Byte
}

export interface PageLoadMetrics {
  url: string;
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  largestContentfulPaint: number;
  coreWebVitals: CoreWebVitals;
  resourceCount: number;
  totalSize: number;
  status: 'pass' | 'fail';
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = [];
  private static timings: Map<string, number> = new Map();

  /**
   * Start timing a performance metric
   */
  static startTiming(label: string): void {
    this.timings.set(label, performance.now());
    console.log(`⏱️ Performance timing started: ${label}`);
  }

  /**
   * End timing and record metric
   */
  static endTiming(label: string, target?: number): number {
    const startTime = this.timings.get(label);
    if (!startTime) {
      console.warn(`Warning: No start time found for ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timings.delete(label);

    const metric: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      metric: label,
      value: duration,
      unit: 'ms',
      target,
      status: target ? (duration <= target ? 'pass' : 'fail') : 'pass'
    };

    this.metrics.push(metric);
    
    console.log(`✅ Performance timing completed: ${label} = ${duration.toFixed(2)}ms`, 
                target ? `(Target: ${target}ms)` : '');
    
    return duration;
  }

  /**
   * Track site generation performance
   */
  static async trackSiteGeneration<T>(
    operation: () => Promise<T>,
    componentCount: number = 0
  ): Promise<{ result: T; metrics: SiteGenerationMetrics }> {
    const startTime = performance.now();
    
    try {
      console.log('🚀 Starting site generation performance tracking...');
      
      const result = await operation();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Extract metrics from result if it's a generated site
      let assetCount = 0;
      let totalSize = 0;
      let seoScore = 0;
      let responsiveScore = 0;
      
      if (result && typeof result === 'object' && 'assets' in result) {
        const site = result as any;
        assetCount = site.assets?.length || 0;
        totalSize = site.optimization?.totalSize || 0;
        seoScore = site.optimization?.seoScore || 0;
        responsiveScore = site.optimization?.responsiveScore || 0;
      }

      const metrics: SiteGenerationMetrics = {
        startTime,
        endTime,
        duration,
        componentCount,
        assetCount,
        totalSize,
        seoScore,
        responsiveScore,
        status: duration < 1800000 ? 'pass' : 'fail' // 30 minutes = 1800000ms
      };

      // Record performance metric
      this.metrics.push({
        timestamp: new Date().toISOString(),
        metric: 'site_generation_time',
        value: duration,
        unit: 'ms',
        target: 1800000, // 30 minutes
        status: metrics.status
      });

      console.log(`🎯 Site generation completed in ${(duration / 1000).toFixed(2)}s`);
      console.log(`📊 Components: ${componentCount}, Assets: ${assetCount}, Size: ${(totalSize / 1024).toFixed(2)}KB`);
      console.log(`🎨 SEO Score: ${seoScore}/100, Responsive Score: ${responsiveScore}/100`);
      
      return { result, metrics };
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error('❌ Site generation failed:', error);
      
      const metrics: SiteGenerationMetrics = {
        startTime,
        endTime,
        duration,
        componentCount,
        assetCount: 0,
        totalSize: 0,
        seoScore: 0,
        responsiveScore: 0,
        status: 'fail'
      };
      
      throw error;
    }
  }

  /**
   * Measure Core Web Vitals (browser environment)
   */
  static async measureCoreWebVitals(): Promise<CoreWebVitals> {
    if (typeof window === 'undefined') {
      return {
        LCP: 0,
        FID: 0,
        CLS: 0,
        FCP: 0,
        TTFB: 0
      };
    }

    return new Promise((resolve) => {
      const vitals: Partial<CoreWebVitals> = {};
      
      // Use PerformanceObserver to get real metrics
      if ('PerformanceObserver' in window) {
        try {
          // Largest Contentful Paint
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.LCP = lastEntry.startTime;
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // First Input Delay
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              vitals.FID = entry.processingStart - entry.startTime;
            });
          }).observe({ entryTypes: ['first-input'] });

          // Cumulative Layout Shift
          new PerformanceObserver((list) => {
            let clsValue = 0;
            list.getEntries().forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            vitals.CLS = clsValue;
          }).observe({ entryTypes: ['layout-shift'] });

          // First Contentful Paint
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
              vitals.FCP = fcpEntry.startTime;
            }
          }).observe({ entryTypes: ['paint'] });

        } catch (error) {
          console.warn('Could not measure some Core Web Vitals:', error);
        }
      }

      // Get Navigation Timing API data
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        vitals.TTFB = navigation.responseStart - navigation.requestStart;
      }

      // Return after a short delay to collect metrics
      setTimeout(() => {
        const result: CoreWebVitals = {
          LCP: vitals.LCP || 0,
          FID: vitals.FID || 0,
          CLS: vitals.CLS || 0,
          FCP: vitals.FCP || 0,
          TTFB: vitals.TTFB || 0
        };
        
        console.log('📊 Core Web Vitals measured:', result);
        resolve(result);
      }, 2000);
    });
  }

  /**
   * Measure page load performance
   */
  static async measurePageLoad(url: string): Promise<PageLoadMetrics> {
    const startTime = performance.now();
    
    try {
      // In browser environment, use existing page metrics
      if (typeof window !== 'undefined') {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const coreWebVitals = await this.measureCoreWebVitals();
        
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
        const firstPaint = performance.getEntriesByName('first-paint')[0]?.startTime || 0;
        
        const resources = performance.getEntriesByType('resource');
        const totalSize = resources.reduce((sum, resource: any) => {
          return sum + (resource.transferSize || 0);
        }, 0);

        const metrics: PageLoadMetrics = {
          url,
          loadTime,
          domContentLoaded,
          firstPaint,
          largestContentfulPaint: coreWebVitals.LCP,
          coreWebVitals,
          resourceCount: resources.length,
          totalSize,
          status: loadTime < 3000 ? 'pass' : 'fail'
        };

        // Record metrics
        this.metrics.push({
          timestamp: new Date().toISOString(),
          metric: 'page_load_time',
          value: loadTime,
          unit: 'ms',
          target: 3000,
          status: metrics.status
        });

        return metrics;
      }
      
      // Fallback for server environment
      return {
        url,
        loadTime: 0,
        domContentLoaded: 0,
        firstPaint: 0,
        largestContentfulPaint: 0,
        coreWebVitals: {
          LCP: 0,
          FID: 0,
          CLS: 0,
          FCP: 0,
          TTFB: 0
        },
        resourceCount: 0,
        totalSize: 0,
        status: 'pass'
      };
      
    } catch (error) {
      console.error('Failed to measure page load performance:', error);
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  static getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by type
   */
  static getMetricsByType(metric: string): PerformanceMetrics[] {
    return this.metrics.filter(m => m.metric === metric);
  }

  /**
   * Clear all metrics
   */
  static clearMetrics(): void {
    this.metrics = [];
    this.timings.clear();
  }

  /**
   * Generate performance report
   */
  static generateReport(): {
    summary: {
      totalMetrics: number;
      passedTargets: number;
      failedTargets: number;
      successRate: number;
    };
    metrics: PerformanceMetrics[];
    recommendations: string[];
  } {
    const metricsWithTargets = this.metrics.filter(m => m.target !== undefined);
    const passedTargets = metricsWithTargets.filter(m => m.status === 'pass').length;
    const failedTargets = metricsWithTargets.filter(m => m.status === 'fail').length;
    
    const recommendations = [];
    
    // Check specific performance targets
    const siteGeneration = this.metrics.find(m => m.metric === 'site_generation_time');
    if (siteGeneration && siteGeneration.status === 'fail') {
      recommendations.push('Optimize site generation pipeline - currently exceeding 30-minute target');
    }
    
    const pageLoad = this.metrics.find(m => m.metric === 'page_load_time');
    if (pageLoad && pageLoad.status === 'fail') {
      recommendations.push('Optimize page load performance - currently exceeding 3-second target');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All performance targets are being met! 🎉');
    }

    return {
      summary: {
        totalMetrics: this.metrics.length,
        passedTargets,
        failedTargets,
        successRate: metricsWithTargets.length > 0 ? (passedTargets / metricsWithTargets.length) * 100 : 100
      },
      metrics: this.metrics,
      recommendations
    };
  }

  /**
   * Monitor bundle size and suggest optimizations
   */
  static analyzeBundleSize(bundleStats: any): {
    totalSize: number;
    recommendations: string[];
    status: 'pass' | 'warning' | 'fail';
  } {
    const recommendations = [];
    let status: 'pass' | 'warning' | 'fail' = 'pass';
    
    // Analyze bundle size (example thresholds)
    const totalSize = bundleStats?.totalSize || 0;
    
    if (totalSize > 2000000) { // 2MB
      status = 'fail';
      recommendations.push('Bundle size is too large (>2MB). Consider code splitting and lazy loading.');
    } else if (totalSize > 1000000) { // 1MB
      status = 'warning';
      recommendations.push('Bundle size is getting large (>1MB). Monitor and optimize if needed.');
    }
    
    // Check for large dependencies
    if (bundleStats?.largestDependencies) {
      bundleStats.largestDependencies.forEach((dep: any) => {
        if (dep.size > 500000) { // 500KB
          recommendations.push(`Large dependency detected: ${dep.name} (${(dep.size / 1024).toFixed(0)}KB)`);
        }
      });
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Bundle size is optimal');
    }
    
    return {
      totalSize,
      recommendations,
      status
    };
  }
}