'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Progress 
} from '@/components/ui/progress';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Globe,
  Upload,
  Zap,
  Shield,
  GlobeIcon
} from 'lucide-react';
import { useBuilderStore } from '@/store/builderStore';
import { publishingService, type PublishingOptions } from '@/lib/services/PublishingService';
import { deploymentService, type DeploymentProvider } from '@/lib/services/DeploymentService';
import { toast } from 'sonner';

interface PublishingWorkflowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublishingWorkflow({ open, onOpenChange }: PublishingWorkflowProps) {
  const { components, currentTemplate, publishingStatus, setPublishingStatus, resetPublishingStatus } = useBuilderStore();
  
  // Configuration state
  const [siteName, setSiteName] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [deploymentProvider, setDeploymentProvider] = useState('vercel');
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [performanceOptimization, setPerformanceOptimization] = useState(true);
  
  // Available providers
  const [providers, setProviders] = useState<DeploymentProvider[]>([]);

  // Initialize providers
  useEffect(() => {
    const availableProviders = deploymentService.getProviders();
    setProviders(availableProviders);
    
    // Set default site name
    if (currentTemplate?.name && !siteName) {
      setSiteName(currentTemplate.name.toLowerCase().replace(/\s+/g, '-'));
    } else if (!siteName) {
      setSiteName('my-marketing-site');
    }
  }, [currentTemplate, siteName]);

  // Set up progress callback when component mounts
  useEffect(() => {
    publishingService.setProgressCallback((progress) => {
      setPublishingStatus({
        stage: progress.stage,
        progress: progress.progress,
        message: progress.message,
        url: progress.deploymentUrl,
        error: progress.error
      });
    });
  }, [setPublishingStatus]);

  const handlePublish = async () => {
    if (components.length === 0) {
      toast.error('Cannot publish empty site');
      return;
    }

    if (!siteName.trim()) {
      toast.error('Site name is required');
      return;
    }

    try {
      const options: PublishingOptions = {
        siteName: siteName.trim(),
        customDomain: customDomain.trim() || undefined,
        deploymentProvider,
        performanceOptimization,
        includeAnalytics
      };

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
        toast.success('Site published successfully!');
      } else {
        setPublishingStatus({
          stage: 'error',
          progress: 0,
          message: result.error || 'Publishing failed'
        });
        toast.error('Publishing failed', {
          description: result.error
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

  const getProgressStageLabel = (stage: string) => {
    switch (stage) {
      case 'generating': return 'Generating site files';
      case 'optimizing': return 'Optimizing assets';
      case 'uploading': return 'Uploading files';
      case 'deploying': return 'Deploying to CDN';
      case 'configuring': return 'Configuring domain';
      case 'complete': return 'Publishing complete';
      case 'error': return 'Publishing failed';
      default: return 'Processing';
    }
  };

  const resetWorkflow = () => {
    resetPublishingStatus();
  };

  const handleClose = () => {
    if (publishingStatus.stage === 'generating' || 
        publishingStatus.stage === 'optimizing' || 
        publishingStatus.stage === 'uploading' || 
        publishingStatus.stage === 'deploying' || 
        publishingStatus.stage === 'configuring') {
      return; // Prevent closing during publishing
    }
    resetWorkflow();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {publishingStatus.stage === 'idle' && 'Publish Your Site'}
            {(publishingStatus.stage === 'generating' || 
              publishingStatus.stage === 'optimizing' || 
              publishingStatus.stage === 'uploading' || 
              publishingStatus.stage === 'deploying' || 
              publishingStatus.stage === 'configuring') && 'Publishing Site'}
            {publishingStatus.stage === 'complete' && 'Site Published Successfully!'}
            {publishingStatus.stage === 'error' && 'Publishing Failed'}
          </DialogTitle>
          <DialogDescription>
            {publishingStatus.stage === 'idle' && 'Configure your site publishing options'}
            {(publishingStatus.stage === 'generating' || 
              publishingStatus.stage === 'optimizing' || 
              publishingStatus.stage === 'uploading' || 
              publishingStatus.stage === 'deploying' || 
              publishingStatus.stage === 'configuring') && 'Your site is being published to the web'}
            {publishingStatus.stage === 'complete' && 'Your site is now live on the web'}
            {publishingStatus.stage === 'error' && 'Something went wrong during publishing'}
          </DialogDescription>
        </DialogHeader>

        {publishingStatus.stage === 'idle' && (
          <div className="space-y-6 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>
                  Basic information about your site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="my-awesome-site"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="custom-domain">Custom Domain (Optional)</Label>
                  <Input
                    id="custom-domain"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="example.com"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deployment Options</CardTitle>
                <CardDescription>
                  Choose where to deploy your site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Deployment Provider</Label>
                  <Select value={deploymentProvider} onValueChange={setDeploymentProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          <div className="flex items-center gap-2">
                            <span>{provider.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {provider.limits.customDomain ? 'Custom Domains' : 'Free'}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span>Performance Optimization</span>
                    </div>
                    <Button
                      variant={performanceOptimization ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPerformanceOptimization(!performanceOptimization)}
                    >
                      {performanceOptimization ? 'On' : 'Off'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Analytics</span>
                    </div>
                    <Button
                      variant={includeAnalytics ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIncludeAnalytics(!includeAnalytics)}
                    >
                      {includeAnalytics ? 'On' : 'Off'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-muted-foreground">
                {components.length} components ready to publish
              </div>
              <Button 
                onClick={handlePublish}
                disabled={components.length === 0 || !siteName.trim()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Publish Site
              </Button>
            </div>
          </div>
        )}

        {(publishingStatus.stage === 'generating' || 
          publishingStatus.stage === 'optimizing' || 
          publishingStatus.stage === 'uploading' || 
          publishingStatus.stage === 'deploying' || 
          publishingStatus.stage === 'configuring') && (
          <div className="space-y-6 py-8 text-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {publishingStatus.message 
                  ? publishingStatus.message
                  : getProgressStageLabel(publishingStatus.stage)}
              </h3>
              
              <p className="text-muted-foreground">
                {publishingStatus.message || 'Getting your site ready for the web'}
              </p>
              
              <div className="space-y-2">
                <Progress 
                  value={publishingStatus.progress || 0} 
                  className="w-full" 
                />
                <div className="text-sm text-muted-foreground">
                  {publishingStatus.progress || 0}% complete
                </div>
              </div>
            </div>
          </div>
        )}

        {publishingStatus.stage === 'complete' && publishingStatus.url && (
          <div className="space-y-6 py-8 text-center">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your site is live!</h3>
              <p className="text-muted-foreground">
                Your site has been successfully published and is now accessible on the web.
              </p>
              
              {publishingStatus.url && (
                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 bg-muted rounded-lg px-4 py-3">
                    <GlobeIcon className="h-4 w-4" />
                    <a 
                      href={publishingStatus.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-mono text-sm hover:underline"
                    >
                      {publishingStatus.url.replace('https://', '')}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {publishingStatus.stage === 'error' && (
          <div className="space-y-6 py-8 text-center">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Publishing failed</h3>
              <p className="text-muted-foreground">
                {publishingStatus.error || 'An unknown error occurred during publishing.'}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {publishingStatus.stage === 'idle' && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          
          {(publishingStatus.stage === 'complete' || publishingStatus.stage === 'error') && (
            <>
              <Button variant="outline" onClick={resetWorkflow}>
                Publish Another
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </>
          )}
          
          {publishingStatus.stage === 'complete' && publishingStatus.url && (
            <Button 
              onClick={() => window.open(publishingStatus.url, '_blank')}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              View Site
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}