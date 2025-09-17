'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  Loader2, 
  Globe, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useBuilderStore } from '@/store/builderStore';
import { publishingService, type PublishingOptions } from '@/lib/services/PublishingService';
import { toast } from 'sonner';

interface PublishButtonProps {
  className?: string;
}

export function PublishButton({ className = '' }: PublishButtonProps) {
  const { components, currentTemplate, publishingStatus, setPublishingStatus } = useBuilderStore();

  const handlePublish = async () => {
    if (components.length === 0) {
      toast.error('Cannot publish empty site', {
        description: 'Add some components to your page before publishing'
      });
      return;
    }

    setPublishingStatus({ 
      stage: 'generating',
      progress: 0,
      message: 'Starting publishing process...'
    });

    try {
      // Set up progress callback
      publishingService.setProgressCallback((progress) => {
        setPublishingStatus({
          stage: progress.stage,
          progress: progress.progress,
          message: progress.message,
          url: progress.deploymentUrl,
          error: progress.error
        });
        
        toast.info(`Publishing: ${progress.message}`, {
          duration: 3000
        });
      });

      // Prepare publishing options
      const options: PublishingOptions = {
        siteName: currentTemplate?.name || 'my-website',
        performanceOptimization: true,
        includeAnalytics: true
      };

      // Publish the site
      const result = await publishingService.publishSite(
        components,
        currentTemplate,
        options
      );

      if (result.success) {
        setPublishingStatus({
          stage: 'complete',
          progress: 100,
          message: 'Site published successfully!',
          url: result.deploymentUrl
        });
        
        toast.success('Site published successfully!', {
          description: result.message,
          action: result.deploymentUrl ? {
            label: 'View',
            onClick: () => window.open(result.deploymentUrl, '_blank')
          } : undefined
        });
      } else {
        setPublishingStatus({
          stage: 'error',
          progress: 0,
          message: result.error || 'Publishing failed'
        });
        
        toast.error('Publishing failed', {
          description: result.error || 'An unknown error occurred'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      setPublishingStatus({
        stage: 'error',
        progress: 0,
        message: errorMessage
      });
      
      toast.error('Publishing failed', {
        description: errorMessage
      });
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={handlePublish}
        disabled={publishingStatus.stage !== 'idle' && publishingStatus.stage !== 'complete' && publishingStatus.stage !== 'error'}
        className="flex items-center gap-2"
      >
        {publishingStatus.stage !== 'idle' && publishingStatus.stage !== 'complete' && publishingStatus.stage !== 'error' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Publishing...
          </>
        ) : publishingStatus.stage === 'complete' ? (
          <>
            <CheckCircle className="h-4 w-4" />
            Published
          </>
        ) : publishingStatus.stage === 'error' ? (
          <>
            <AlertCircle className="h-4 w-4" />
            Failed
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Publish Site
          </>
        )}
      </Button>
      
      {publishingStatus.url && (
        <Button
          variant="link"
          onClick={() => window.open(publishingStatus.url, '_blank')}
          className="mt-2 text-sm"
        >
          <Globe className="h-3 w-3 mr-1" />
          View Published Site
        </Button>
      )}
    </div>
  );
}