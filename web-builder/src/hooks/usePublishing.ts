'use client';

import { useState, useCallback } from 'react';
import { useBuilderStore } from '@/store/builderStore';

export interface PublishingOptions {
  customDomain?: string;
  seoSettings?: {
    title?: string;
    description?: string;
    keywords?: string[];
    socialImage?: string;
  };
  performanceOptimization?: boolean;
  analyticsId?: string;
}

export interface PublishingStatus {
  status: 'idle' | 'preparing' | 'building' | 'optimizing' | 'uploading' | 'configuring' | 'success' | 'error';
  progress: number;
  message: string;
  taskId?: string;
  publishedUrl?: string;
  error?: string;
}

export interface PublishingResult {
  success: boolean;
  url?: string;
  error?: string;
  taskId?: string;
}

export const usePublishing = () => {
  const { canvasElements, siteName, siteSettings } = useBuilderStore();
  const [publishingStatus, setPublishingStatus] = useState<PublishingStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  const updateStatus = useCallback((update: Partial<PublishingStatus>) => {
    setPublishingStatus(prev => ({ ...prev, ...update }));
  }, []);

  const publishSite = useCallback(async (options: PublishingOptions = {}): Promise<PublishingResult> => {
    try {
      // Validation
      if (!canvasElements || canvasElements.length === 0) {
        throw new Error('No content to publish. Please add components to your site.');
      }

      if (!siteName) {
        throw new Error('Site name is required for publishing.');
      }

      // Prepare publishing data
      updateStatus({
        status: 'preparing',
        progress: 10,
        message: 'Preparing site for publication...'
      });

      const publishData = {
        site_name: siteName,
        components: canvasElements,
        settings: {
          ...siteSettings,
          ...options.seoSettings
        },
        custom_domain: options.customDomain,
        performance_optimization: options.performanceOptimization ?? true,
        analytics_id: options.analyticsId
      };

      // Start building
      updateStatus({
        status: 'building',
        progress: 25,
        message: 'Converting components to HTML/CSS...'
      });

      // Call backend API
      const response = await fetch('/api/v1/sites/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(publishData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Publishing failed');
      }

      const result = await response.json();

      if (result.task_id) {
        // Poll for status updates
        await pollPublishingStatus(result.task_id);
      }

      return {
        success: true,
        url: result.published_url || publishingStatus.publishedUrl,
        taskId: result.task_id
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      updateStatus({
        status: 'error',
        progress: 0,
        message: errorMessage,
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }, [canvasElements, siteName, siteSettings, publishingStatus.publishedUrl, updateStatus]);

  const pollPublishingStatus = useCallback(async (taskId: string): Promise<void> => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    const poll = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/v1/sites/publish/status/${taskId}`);
        
        if (!response.ok) {
          throw new Error('Failed to get publishing status');
        }

        const status = await response.json();

        // Update progress based on status
        const progressMap: Record<string, { progress: number; message: string; status: PublishingStatus['status'] }> = {
          'PENDING': { progress: 15, message: 'Task queued for processing...', status: 'preparing' },
          'BUILDING': { progress: 35, message: 'Building static site...', status: 'building' },
          'OPTIMIZING': { progress: 55, message: 'Optimizing images and assets...', status: 'optimizing' },
          'UPLOADING': { progress: 75, message: 'Uploading to CDN...', status: 'uploading' },
          'CONFIGURING': { progress: 90, message: 'Configuring domain and SSL...', status: 'configuring' },
          'SUCCESS': { progress: 100, message: 'Site published successfully!', status: 'success' },
          'FAILURE': { progress: 0, message: 'Publishing failed', status: 'error' }
        };

        const statusInfo = progressMap[status.status] || progressMap['PENDING'];

        updateStatus({
          ...statusInfo,
          taskId,
          publishedUrl: status.published_url,
          error: status.error
        });

        if (status.status === 'SUCCESS' || status.status === 'FAILURE') {
          return; // Stop polling
        }

        // Continue polling
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          throw new Error('Publishing timeout - please check status manually');
        }

      } catch (error) {
        updateStatus({
          status: 'error',
          progress: 0,
          message: error instanceof Error ? error.message : 'Failed to check publishing status',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    await poll();
  }, [updateStatus]);

  const checkDomainStatus = useCallback(async (domain: string) => {
    try {
      const response = await fetch(`/api/v1/domains/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) {
        throw new Error('Failed to check domain status');
      }

      return await response.json();
    } catch (error) {
      console.error('Domain check failed:', error);
      return { verified: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, []);

  const getPublishingHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/sites/publish/history');
      
      if (!response.ok) {
        throw new Error('Failed to get publishing history');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get publishing history:', error);
      return { deployments: [] };
    }
  }, []);

  const cancelPublishing = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/v1/sites/publish/cancel/${taskId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel publishing');
      }

      updateStatus({
        status: 'idle',
        progress: 0,
        message: 'Publishing cancelled'
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to cancel publishing:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [updateStatus]);

  const resetPublishing = useCallback(() => {
    setPublishingStatus({
      status: 'idle',
      progress: 0,
      message: ''
    });
  }, []);

  return {
    publishingStatus,
    publishSite,
    checkDomainStatus,
    getPublishingHistory,
    cancelPublishing,
    resetPublishing,
    isPublishing: publishingStatus.status !== 'idle' && publishingStatus.status !== 'success' && publishingStatus.status !== 'error',
    isSuccess: publishingStatus.status === 'success',
    isError: publishingStatus.status === 'error',
  };
};