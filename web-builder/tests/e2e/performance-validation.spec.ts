import { test, expect, type Page } from '@playwright/test';
import { PerformanceMonitor } from '../../src/lib/performance/monitor';

/**
 * Performance Validation Tests for MVP
 * 
 * Validates critical performance targets:
 * - Template-to-site generation: <30 minutes
 * - Page load times: <3 seconds
 * - Core Web Vitals compliance
 * - Resource optimization
 */

test.describe('MVP Performance Validation', () => {

  test.beforeEach(async ({ page }) => {
    // Clear any existing performance data
    await page.evaluate(() => {
      if (window.performance && window.performance.clearMarks) {
        window.performance.clearMarks();
        window.performance.clearMeasures();
      }
    });
  });

  test('Homepage Load Performance - Target: <3 seconds', async ({ page }) => {
    console.log('🚀 Testing homepage load performance...');
    
    const startTime = Date.now();
    
    // Navigate to homepage and wait for load
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    
    // Validate load time target
    expect(loadTime).toBeLessThan(3000);
    
    // Measure Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {};
        
        // Check if PerformanceObserver is available
        if ('PerformanceObserver' in window) {
          // LCP (Largest Contentful Paint)
          try {
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              if (entries.length > 0) {
                vitals.LCP = entries[entries.length - 1].startTime;
              }
            }).observe({ entryTypes: ['largest-contentful-paint'] });
          } catch (e) {
            console.warn('LCP measurement not available');
          }
          
          // FCP (First Contentful Paint)
          try {
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
              if (fcpEntry) {
                vitals.FCP = fcpEntry.startTime;
              }
            }).observe({ entryTypes: ['paint'] });
          } catch (e) {
            console.warn('FCP measurement not available');
          }
        }
        
        // Get navigation timing
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          vitals.TTFB = navigation.responseStart - navigation.requestStart;
          vitals.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
          vitals.loadComplete = navigation.loadEventEnd - navigation.fetchStart;
        }
        
        // Return metrics after a brief delay
        setTimeout(() => resolve(vitals), 1000);
      });
    });
    
    console.log(`✅ Homepage loaded in ${loadTime}ms`);
    console.log('📊 Web Vitals:', webVitals);
    
    // Validate Core Web Vitals if available
    if (webVitals.LCP) {
      expect(webVitals.LCP).toBeLessThan(2500); // Good LCP: <2.5s
    }
    if (webVitals.FCP) {
      expect(webVitals.FCP).toBeLessThan(1800); // Good FCP: <1.8s
    }
    if (webVitals.TTFB) {
      expect(webVitals.TTFB).toBeLessThan(600); // Good TTFB: <600ms
    }
  });

  test('Template Gallery Load Performance - Target: <4 seconds', async ({ page }) => {
    console.log('🎨 Testing template gallery load performance...');
    
    const startTime = Date.now();
    
    await page.goto('/templates', { waitUntil: 'networkidle' });
    
    // Wait for template cards to load
    await page.waitForSelector('.template-card, .template-item', { timeout: 15000 });
    
    const loadTime = Date.now() - startTime;
    
    // Validate load time target
    expect(loadTime).toBeLessThan(4000);
    
    // Count loaded templates
    const templateCount = await page.locator('.template-card, .template-item').count();
    expect(templateCount).toBeGreaterThan(0);
    
    console.log(`✅ Template gallery loaded ${templateCount} templates in ${loadTime}ms`);
  });

  test('Visual Builder Load Performance - Target: <5 seconds', async ({ page }) => {
    console.log('🛠️ Testing visual builder load performance...');
    
    const startTime = Date.now();
    
    await page.goto('/builder', { waitUntil: 'networkidle' });
    
    // Wait for builder interface to load
    await page.waitForSelector('.builder-canvas, .visual-builder', { timeout: 15000 });
    
    const loadTime = Date.now() - startTime;
    
    // Validate load time target
    expect(loadTime).toBeLessThan(5000);
    
    // Check if component library is loaded
    const componentLibrary = page.locator('.component-library, .components-panel');
    await expect(componentLibrary).toBeVisible({ timeout: 5000 });
    
    console.log(`✅ Visual builder loaded in ${loadTime}ms`);
  });

  test('Site Generation Performance - Target: <30 minutes', async ({ page }) => {
    console.log('⚡ Testing site generation performance...');
    
    // Navigate to builder
    await page.goto('/builder', { waitUntil: 'networkidle' });
    await page.waitForSelector('.builder-canvas', { timeout: 15000 });
    
    // Add some components to test with
    const heroComponent = page.locator('.hero-component, [data-component="hero"]').first();
    if (await heroComponent.isVisible()) {
      await heroComponent.click();
    }
    
    // Navigate to publish/generate
    await page.click('[data-testid="publish-btn"], .publish-btn, .generate-btn');
    await page.waitForSelector('.publish-modal, .deploy-section', { timeout: 10000 });
    
    // Start site generation timing
    const startTime = Date.now();
    
    // Trigger site generation
    await page.click('.generate-site, .build-site, [data-testid="generate-site"]');
    
    // Wait for generation to complete (with reasonable timeout)
    try {
      await page.waitForSelector('.generation-complete, .site-ready, .success-message', { 
        timeout: 300000 // 5 minutes max for test
      });
      
      const generationTime = Date.now() - startTime;
      
      // Validate generation time (should be much less than 30 minutes for test)
      expect(generationTime).toBeLessThan(30000); // 30 seconds for test environment
      
      console.log(`✅ Site generation completed in ${(generationTime / 1000).toFixed(2)}s`);
      
      // Check if performance metrics are displayed
      const performanceMetrics = await page.evaluate(() => {
        const seoElement = document.querySelector('[data-metric="seo"], .seo-score');
        const responsiveElement = document.querySelector('[data-metric="responsive"], .responsive-score');
        const timeElement = document.querySelector('[data-metric="time"], .generation-time');
        
        return {
          seoScore: seoElement ? parseInt(seoElement.textContent?.match(/\\d+/)?.[0] || '0') : null,
          responsiveScore: responsiveElement ? parseInt(responsiveElement.textContent?.match(/\\d+/)?.[0] || '0') : null,
          generationTime: timeElement ? parseFloat(timeElement.textContent?.match(/[\\d.]+/)?.[0] || '0') : null
        };
      });
      
      console.log('📊 Generation Metrics:', performanceMetrics);
      
      // Validate quality scores if available
      if (performanceMetrics.seoScore) {
        expect(performanceMetrics.seoScore).toBeGreaterThan(80);
        console.log(`✅ SEO Score: ${performanceMetrics.seoScore}/100`);
      }
      
      if (performanceMetrics.responsiveScore) {
        expect(performanceMetrics.responsiveScore).toBeGreaterThan(75);
        console.log(`✅ Responsive Score: ${performanceMetrics.responsiveScore}/100`);
      }
      
    } catch (error) {
      const timeoutTime = Date.now() - startTime;
      console.error(`❌ Site generation timed out after ${(timeoutTime / 1000).toFixed(2)}s`);
      throw error;
    }
  });

  test('Resource Loading Performance', async ({ page }) => {
    console.log('📦 Testing resource loading performance...');
    
    // Monitor network requests
    const resourceTimings: any[] = [];
    
    page.on('response', async (response) => {
      const timing = {
        url: response.url(),
        status: response.status(),
        size: parseInt(response.headers()['content-length'] || '0'),
        type: response.headers()['content-type'] || 'unknown'
      };
      resourceTimings.push(timing);
    });
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Analyze resource loading
    const totalResources = resourceTimings.length;
    const totalSize = resourceTimings.reduce((sum, resource) => sum + resource.size, 0);
    const failedRequests = resourceTimings.filter(r => r.status >= 400).length;
    
    console.log(`📊 Loaded ${totalResources} resources, total size: ${(totalSize / 1024).toFixed(2)}KB`);
    
    // Validate resource loading
    expect(failedRequests).toBe(0); // No failed requests
    expect(totalSize).toBeLessThan(5000000); // Less than 5MB total
    
    // Check for large individual resources
    const largeResources = resourceTimings.filter(r => r.size > 500000); // >500KB
    expect(largeResources.length).toBeLessThan(3); // Max 2 large resources
    
    if (largeResources.length > 0) {
      console.log('⚠️ Large resources detected:', largeResources.map(r => `${r.url} (${(r.size / 1024).toFixed(0)}KB)`));
    }
  });

  test('Mobile Performance', async ({ page }) => {
    console.log('📱 Testing mobile performance...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Throttle network to simulate mobile conditions
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 1500000, // 1.5 Mbps
      uploadThroughput: 750000,    // 750 Kbps
      latency: 40                  // 40ms
    });
    
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    
    // Mobile performance should be reasonable even with throttling
    expect(loadTime).toBeLessThan(8000); // 8 seconds for throttled mobile
    
    console.log(`✅ Mobile page loaded in ${loadTime}ms with network throttling`);
    
    // Test mobile builder performance
    await page.goto('/builder');
    await page.waitForSelector('.builder-canvas', { timeout: 20000 });
    
    console.log('✅ Mobile builder interface loaded successfully');
  });

  test('Memory Usage Performance', async ({ page }) => {
    console.log('🧠 Testing memory usage performance...');
    
    // Monitor JavaScript heap usage
    const getMemoryUsage = async () => {
      return await page.evaluate(() => {
        if ('memory' in performance) {
          return {
            used: (performance as any).memory.usedJSHeapSize,
            total: (performance as any).memory.totalJSHeapSize,
            limit: (performance as any).memory.jsHeapSizeLimit
          };
        }
        return null;
      });
    };
    
    // Initial measurement
    await page.goto('/');
    const initialMemory = await getMemoryUsage();
    
    // Navigate through different pages
    await page.goto('/templates');
    await page.waitForSelector('.template-card', { timeout: 10000 });
    
    await page.goto('/builder');
    await page.waitForSelector('.builder-canvas', { timeout: 15000 });
    
    // Final measurement
    const finalMemory = await getMemoryUsage();
    
    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory.used - initialMemory.used;
      const memoryUsageMB = finalMemory.used / (1024 * 1024);
      
      console.log(`📊 Memory usage: ${memoryUsageMB.toFixed(2)}MB`);
      console.log(`📈 Memory increase: ${(memoryIncrease / (1024 * 1024)).toFixed(2)}MB`);
      
      // Validate memory usage is reasonable
      expect(memoryUsageMB).toBeLessThan(150); // Less than 150MB
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    } else {
      console.log('ℹ️ Memory measurement not available in this browser');
    }
  });

  test('Bundle Size Analysis', async ({ page }) => {
    console.log('📦 Analyzing bundle size performance...');
    
    // Check for webpack/next.js bundle info
    await page.goto('/');
    
    const bundleInfo = await page.evaluate(() => {
      // Look for Next.js build info or bundle analyzer data
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const bundles = scripts.map(script => ({
        src: script.getAttribute('src'),
        async: script.hasAttribute('async'),
        defer: script.hasAttribute('defer')
      }));
      
      return {
        bundleCount: bundles.length,
        bundles: bundles.slice(0, 10) // First 10 bundles
      };
    });
    
    console.log(`📊 Found ${bundleInfo.bundleCount} JavaScript bundles`);
    
    // Validate reasonable number of bundles (not too many, indicating good code splitting)
    expect(bundleInfo.bundleCount).toBeLessThan(20);
    expect(bundleInfo.bundleCount).toBeGreaterThan(0);
    
    // Check that bundles are properly deferred/async where appropriate
    const asyncBundles = bundleInfo.bundles.filter(b => b.async || b.defer).length;
    console.log(`✅ ${asyncBundles} bundles are loaded asynchronously`);
  });
});

/**
 * Performance Regression Tests
 */
test.describe('Performance Regression Tests', () => {
  
  test('Component Library Performance', async ({ page }) => {
    console.log('🧩 Testing component library performance...');
    
    await page.goto('/builder');
    await page.waitForSelector('.component-library', { timeout: 15000 });
    
    const startTime = Date.now();
    
    // Test adding multiple components
    for (let i = 0; i < 5; i++) {
      const component = page.locator('.component-item').first();
      if (await component.isVisible()) {
        await component.click();
        await page.waitForTimeout(100); // Small delay between additions
      }
    }
    
    const componentAddTime = Date.now() - startTime;
    
    // Should be able to add components quickly
    expect(componentAddTime).toBeLessThan(5000);
    
    console.log(`✅ Added 5 components in ${componentAddTime}ms`);
  });

  test('Template Switching Performance', async ({ page }) => {
    console.log('🔄 Testing template switching performance...');
    
    await page.goto('/templates');
    await page.waitForSelector('.template-card', { timeout: 10000 });
    
    const templates = page.locator('.template-card');
    const templateCount = await templates.count();
    
    if (templateCount > 1) {
      const startTime = Date.now();
      
      // Click on first template
      await templates.first().click();
      await page.waitForURL(/\\/builder/);
      await page.waitForSelector('.builder-canvas', { timeout: 15000 });
      
      const switchTime = Date.now() - startTime;
      
      // Template switching should be fast
      expect(switchTime).toBeLessThan(8000);
      
      console.log(`✅ Template switched and loaded in ${switchTime}ms`);
    }
  });
});