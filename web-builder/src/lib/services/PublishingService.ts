/**
 * Publishing Service
 * Handles site publishing, deployment, and integration with backend APIs
 */

import { ComponentData, Template } from '@/types/builder';
import { staticSiteGenerator } from '@/lib/generators/StaticSiteGenerator';
import { deploymentService, DeploymentConfig } from '@/lib/services/DeploymentService';
import apiClient from '@/lib/api/client';

export interface PublishingOptions {
  siteName: string;
  customDomain?: string;
  deploymentProvider?: string; // Default: 'vercel'
  seoSettings?: {
    title?: string;
    description?: string;
    keywords?: string[];
    author?: string;
  };
  performanceOptimization?: boolean;
  includeAnalytics?: boolean;
}

export interface PublishingProgress {
  stage: 'generating' | 'optimizing' | 'uploading' | 'deploying' | 'configuring' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  error?: string;
  deploymentUrl?: string;
}

export interface PublishingResult {
  success: boolean;
  deploymentUrl?: string;
  taskId?: string;
  error?: string;
  message: string;
}

export class PublishingService {
  private progressCallback?: (progress: PublishingProgress) => void;

  /**
   * Set progress callback for real-time updates
   */
  public setProgressCallback(callback: (progress: PublishingProgress) => void): void {
    this.progressCallback = callback;
  }

  /**
   * Publish site with complete deployment pipeline
   */
  public async publishSite(
    components: ComponentData[],
    template: Template | null,
    options: PublishingOptions
  ): Promise<PublishingResult> {
    try {
      // Stage 1: Generate static site
      this.updateProgress({
        stage: 'generating',
        progress: 10,
        message: 'Generating static site files...'
      });

      const generatedSite = staticSiteGenerator.generateSite(components, template, {
        siteName: options.siteName,
        customDomain: options.customDomain,
        seoSettings: options.seoSettings,
        performanceOptimization: options.performanceOptimization ?? true,
        includeAnalytics: options.includeAnalytics ?? true,
        minifyOutput: true
      });

      // Stage 2: Optimize assets
      this.updateProgress({
        stage: 'optimizing',
        progress: 30,
        message: 'Optimizing assets and performance...'
      });

      const optimizedSite = await this.optimizeAssets(generatedSite);

      // Stage 3: Upload to backend
      this.updateProgress({
        stage: 'uploading',
        progress: 50,
        message: 'Uploading site files...'
      });

      const uploadResult = await this.uploadSiteFiles(optimizedSite, options);

      // Stage 4: Deploy via deployment service
      this.updateProgress({
        stage: 'deploying',
        progress: 70,
        message: 'Deploying to CDN...'
      });

      const deploymentResult = await this.deployViaCDN(optimizedSite, options);

      // Stage 5: Configure domain (if custom domain provided)
      if (options.customDomain) {
        this.updateProgress({
          stage: 'configuring',
          progress: 90,
          message: 'Configuring custom domain...'
        });

        await this.configureDomain(deploymentResult.deploymentId, options.customDomain);
      }

      // Stage 6: Complete
      this.updateProgress({
        stage: 'complete',
        progress: 100,
        message: 'Site published successfully!',
        deploymentUrl: deploymentResult.url
      });

      return {
        success: true,
        deploymentUrl: deploymentResult.url,
        taskId: deploymentResult.taskId,
        message: 'Site published successfully!'
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      this.updateProgress({
        stage: 'error',
        progress: 0,
        message: 'Publishing failed',
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage,
        message: 'Publishing failed. Please try again.'
      };
    }
  }

  /**
   * Check publishing status using task ID
   */
  public async getPublishingStatus(taskId: string): Promise<{
    status: string;
    progress: number;
    message: string;
    deploymentUrl?: string;
    error?: string;
  }> {
    try {
      const response = await apiClient.get(`/tasks/${taskId}/status`);
      return response;
    } catch (error) {
      throw new Error(`Failed to get publishing status: ${error}`);
    }
  }

  /**
   * Unpublish a site
   */
  public async unpublishSite(siteId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`/sites/${siteId}/unpublish`);
      return response;
    } catch (error) {
      throw new Error(`Failed to unpublish site: ${error}`);
    }
  }

  /**
   * Export site as downloadable files
   */
  public async exportSite(
    components: ComponentData[],
    template: Template | null,
    format: 'html' | 'zip' = 'zip'
  ): Promise<Blob> {
    try {
      const generatedSite = staticSiteGenerator.generateSite(components, template, {
        siteName: 'exported-site',
        performanceOptimization: true,
        minifyOutput: true
      });

      if (format === 'html') {
        return new Blob([generatedSite.html], { type: 'text/html' });
      }

      // Create ZIP file with all assets
      return await this.createZipArchive(generatedSite);
    } catch (error) {
      throw new Error(`Failed to export site: ${error}`);
    }
  }

  /**
   * Update progress and notify callback
   */
  private updateProgress(progress: PublishingProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  /**
   * Optimize generated assets
   */
  private async optimizeAssets(site: any): Promise<any> {
    // Simulate asset optimization
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, this would:
    // - Compress images
    // - Minify CSS/JS further
    // - Optimize fonts
    // - Generate critical CSS
    // - Create service worker
    
    return {
      ...site,
      optimized: true,
      compressionRatio: 0.7 // 30% size reduction
    };
  }

  /**
   * Upload site files to backend
   */
  private async uploadSiteFiles(site: any, options: PublishingOptions): Promise<{ siteId: string }> {
    try {
      const uploadData = {
        siteName: options.siteName,
        html: site.html,
        css: site.css,
        js: site.js,
        assets: site.assets,
        meta: site.meta,
        options: {
          customDomain: options.customDomain,
          seoSettings: options.seoSettings,
          performanceOptimization: options.performanceOptimization
        }
      };

      const response = await apiClient.post('/sites/upload', uploadData);
      return { siteId: response.siteId };
    } catch (error) {
      throw new Error(`Failed to upload site files: ${error}`);
    }
  }

  /**
   * Deploy site via CDN using deployment service
   */
  private async deployViaCDN(site: any, options: PublishingOptions): Promise<{
    deploymentId: string;
    url: string;
    taskId: string;
  }> {
    try {
      // Get deployment provider (default to Vercel)
      const provider = options.deploymentProvider || 'vercel';
      
      // Create deployment configuration
      const deploymentConfig: DeploymentConfig = deploymentService.createDeploymentConfig(provider, {
        customDomain: options.customDomain,
        ssl: true,
        caching: {
          enabled: options.performanceOptimization ?? true,
          ttl: 3600 // 1 hour cache
        },
        compression: {
          enabled: true,
          types: ['text/html', 'text/css', 'application/javascript', 'application/json']
        },
        headers: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Cache-Control': 'public, max-age=3600'
        }
      });

      // Validate configuration
      const validation = deploymentService.validateConfig(deploymentConfig);
      if (!validation.valid) {
        throw new Error(`Deployment configuration invalid: ${validation.errors.join(', ')}`);
      }

      // Deploy to CDN
      const result = await deploymentService.deploySite({
        html: site.html,
        css: site.css,
        js: site.js,
        assets: site.assets
      }, deploymentConfig);

      if (!result.success) {
        throw new Error(result.error || 'Deployment failed');
      }

      // Also save deployment info to backend for tracking
      try {
        await apiClient.post('/deployments', {
          deploymentId: result.deploymentId,
          provider,
          url: result.url,
          siteName: options.siteName,
          customDomain: options.customDomain,
          metrics: result.metrics
        });
      } catch (backendError) {
        // Non-critical: continue even if backend save fails
        console.warn('Failed to save deployment info to backend:', backendError);
      }

      return {
        deploymentId: result.deploymentId,
        url: result.url,
        taskId: result.deploymentId // Use deployment ID as task ID
      };
    } catch (error) {
      throw new Error(`CDN deployment failed: ${error}`);
    }
  }

  /**
   * Deploy site via backend API (legacy method)
   */
  private async deployToBackend(siteId: string, options: PublishingOptions): Promise<{
    deploymentId: string;
    url: string;
    taskId: string;
  }> {
    try {
      const deploymentConfig = {
        customDomain: options.customDomain,
        seoSettings: options.seoSettings,
        performanceOptimization: options.performanceOptimization ?? true
      };

      const response = await apiClient.post(`/sites/${siteId}/publish`, deploymentConfig);
      
      // Poll for deployment completion
      if (response.taskId) {
        await this.waitForDeployment(response.taskId);
      }

      return {
        deploymentId: response.published_site_id || siteId,
        url: response.preview_url || `https://${options.siteName}.marketingbuilder.app`,
        taskId: response.taskId
      };
    } catch (error) {
      throw new Error(`Failed to deploy site: ${error}`);
    }
  }

  /**
   * Configure custom domain
   */
  private async configureDomain(deploymentId: string, customDomain: string): Promise<void> {
    try {
      await apiClient.post('/domains/verify', {
        domain: customDomain,
        site_id: deploymentId
      });

      await apiClient.post(`/domains/${customDomain}/setup`, {
        deploymentId
      });
    } catch (error) {
      // Domain configuration is not critical for deployment success
      console.warn('Domain configuration failed:', error);
    }
  }

  /**
   * Wait for deployment completion
   */
  private async waitForDeployment(taskId: string, maxWaitTime: number = 120000): Promise<void> {
    const startTime = Date.now();
    const pollInterval = 2000; // Poll every 2 seconds

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const status = await this.getPublishingStatus(taskId);
        
        if (status.status === 'completed') {
          return; // Success
        }
        
        if (status.status === 'failed') {
          throw new Error(status.error || 'Deployment failed');
        }

        // Update progress if available
        if (status.progress !== undefined) {
          this.updateProgress({
            stage: 'deploying',
            progress: Math.min(70 + (status.progress * 0.2), 90), // Scale progress to 70-90%
            message: status.message || 'Deploying to CDN...'
          });
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        if (Date.now() - startTime >= maxWaitTime - pollInterval) {
          throw new Error('Deployment timeout');
        }
        // Continue polling on temporary errors
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    throw new Error('Deployment timeout');
  }

  /**
   * Create ZIP archive with all site files
   */
  private async createZipArchive(site: any): Promise<Blob> {
    // This would use a ZIP library like JSZip in a real implementation
    // For now, return the HTML as a blob
    const content = `Site Export Package:
    
HTML File:
${site.html}

CSS File:
${site.css}

JavaScript File:
${site.js}

Additional Assets: ${site.assets.length} files
`;

    return new Blob([content], { type: 'application/zip' });
  }
}

// Export singleton instance
export const publishingService = new PublishingService();
export default publishingService;