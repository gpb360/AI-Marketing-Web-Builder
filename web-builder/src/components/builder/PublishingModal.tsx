'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { publishingService, PublishingProgress } from '@/lib/services/PublishingService';
import { deploymentService, type DeploymentProvider } from '@/lib/services/DeploymentService';
import DomainManager from '@/components/publishing/DomainManager';
import { cn } from '@/lib/utils';
import {
  Globe,
  Settings,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  RefreshCw,
  Zap,
  Shield,
  Server,
  BadgeInfo,
} from 'lucide-react';

interface PublishingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PublishingModal({ isOpen, onClose }: PublishingModalProps) {
  const {
    components,
    currentTemplate,
    publishingStatus,
    setPublishingStatus,
    resetPublishingStatus
  } = useBuilderStore();
  
  const [siteName, setSiteName] = useState('my-awesome-site');
  const [customDomain, setCustomDomain] = useState('');
  const [isCustomDomainEnabled, setIsCustomDomainEnabled] = useState(false);
  const [currentTab, setCurrentTab] = useState<'basic' | 'domain' | 'advanced'>('basic');
  const [deploymentId, setDeploymentId] = useState<string>('');
  
  // Deployment configuration state
  const [deploymentProvider, setDeploymentProvider] = useState('vercel');
  const [performanceOptimization, setPerformanceOptimization] = useState(true);
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [providers, setProviders] = useState<DeploymentProvider[]>([]);
  
  // Advanced settings
  const [region, setRegion] = useState('us-east-1');
  const [cachingEnabled, setCachingEnabled] = useState(true);
  const [cachingTTL, setCachingTTL] = useState(3600);
  const [compressionEnabled, setCompressionEnabled] = useState(true);

  // Initialize providers
  useEffect(() => {
    const availableProviders = deploymentService.getProviders();
    setProviders(availableProviders);
    
    // Set default site name based on template
    if (currentTemplate?.name && siteName === 'my-awesome-site') {
      setSiteName(currentTemplate.name.toLowerCase().replace(/\s+/g, '-'));
    }
  }, [currentTemplate, siteName]);

  const handlePublish = useCallback(async () => {
    if (!currentTemplate || components.length === 0) {
      setPublishingStatus({
        stage: 'error',
        progress: 0,
        message: 'No content to publish',
        error: 'Please add some components to your site before publishing.',
      });
      return;
    }

    try {
      // Set up progress callback
      publishingService.setProgressCallback((progress: PublishingProgress) => {
        setPublishingStatus({
          stage: progress.stage,
          progress: progress.progress,
          message: progress.message,
          url: progress.deploymentUrl,
          error: progress.error
        });
      });

      // Start publishing process
      const result = await publishingService.publishSite(
        components,
        currentTemplate,
        {
          siteName,
          customDomain: isCustomDomainEnabled ? customDomain : undefined,
          deploymentProvider,
          seoSettings: {
            title: `${siteName} | AI Marketing Website`,
            description: `Professional website built with AI Marketing Web Builder`,
            keywords: ['website', 'marketing', 'business', siteName],
            author: 'AI Marketing Web Builder'
          },
          performanceOptimization,
          includeAnalytics
        }
      );

      if (result.success) {
        const newDeploymentId = result.taskId || `deployment-${Date.now()}`;
        setDeploymentId(newDeploymentId);
        setPublishingStatus({
          stage: 'complete',
          progress: 100,
          message: 'Site published successfully!',
          url: result.deploymentUrl,
          taskId: newDeploymentId
        });
      } else {
        setPublishingStatus({
          stage: 'error',
          progress: 0,
          message: 'Publishing failed',
          error: result.error || 'Unknown error occurred'
        });
      }

    } catch (error) {
      setPublishingStatus({
        stage: 'error',
        progress: 0,
        message: 'Publishing failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }, [components, currentTemplate, siteName, customDomain, isCustomDomainEnabled, deploymentProvider, performanceOptimization, includeAnalytics, setPublishingStatus]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const resetPublishing = () => {
    resetPublishingStatus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Publish Your Site</h2>
                <p className="text-sm text-gray-600">Make your site live on the web</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Tab Navigation */}
          {publishingStatus.stage === 'idle' && (
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentTab('basic')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                  currentTab === 'basic'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Basic Settings
              </button>
              <button
                onClick={() => setCurrentTab('domain')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                  currentTab === 'domain'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Domain & SSL
              </button>
              <button
                onClick={() => setCurrentTab('advanced')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                  currentTab === 'advanced'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Advanced
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Site Configuration - Basic Tab */}
          {publishingStatus.stage === 'idle' && currentTab === 'basic' && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="my-awesome-site"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your site will be available at: <code>https://{siteName}.marketingbuilder.app</code>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deployment Provider
                  </label>
                  <select
                    value={deploymentProvider}
                    onChange={(e) => setDeploymentProvider(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <BadgeInfo className="w-3 h-3 mr-1" />
                    {providers.find(p => p.id === deploymentProvider)?.description}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="custom-domain"
                    checked={isCustomDomainEnabled}
                    onChange={(e) => setIsCustomDomainEnabled(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="custom-domain" className="text-sm font-medium text-gray-700">
                    Use custom domain
                  </label>
                </div>

                {isCustomDomainEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Domain
                    </label>
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="www.yourdomain.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Make sure your domain's DNS is configured to point to our servers
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span>Performance Optimization</span>
                    </div>
                    <button
                      onClick={() => setPerformanceOptimization(!performanceOptimization)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        performanceOptimization 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {performanceOptimization ? 'On' : 'Off'}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Analytics</span>
                    </div>
                    <button
                      onClick={() => setIncludeAnalytics(!includeAnalytics)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        includeAnalytics 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {includeAnalytics ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Publishing Summary</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Components:</span>
                    <span>{components.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Template:</span>
                    <span>{currentTemplate?.name || 'Custom'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deployment target:</span>
                    <span>{providers.find(p => p.id === deploymentProvider)?.name || 'Global CDN'}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Domain & SSL Configuration Tab */}
          {publishingStatus.stage === 'idle' && currentTab === 'domain' && (
            <DomainManager
              deploymentId={deploymentId || 'preview'}
              currentDomain={isCustomDomainEnabled ? customDomain : undefined}
              onDomainConfigured={(domain, verified) => {
                setCustomDomain(domain);
                setIsCustomDomainEnabled(true);
                // Could show success message or update UI based on verification status
              }}
            />
          )}

          {/* Advanced Settings Tab */}
          {publishingStatus.stage === 'idle' && currentTab === 'advanced' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-start">
                  <BadgeInfo className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Advanced Deployment Settings</h3>
                    <p className="text-xs text-blue-700 mt-1">
                      These settings control advanced deployment behavior. Only modify if you understand the implications.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Server className="w-4 h-4 inline mr-1" />
                    Deployment Region
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-west-1">US West (N. California)</option>
                    <option value="eu-west-1">EU (Ireland)</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                    <option value="global">Global (CDN)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span>Asset Compression</span>
                    </div>
                    <button
                      onClick={() => setCompressionEnabled(!compressionEnabled)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        compressionEnabled 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {compressionEnabled ? 'On' : 'Off'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>CDN Caching</span>
                    </div>
                    <button
                      onClick={() => setCachingEnabled(!cachingEnabled)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        cachingEnabled 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {cachingEnabled ? 'On' : 'Off'}
                    </button>
                  </div>

                  {cachingEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cache TTL (seconds)
                      </label>
                      <input
                        type="number"
                        value={cachingTTL}
                        onChange={(e) => setCachingTTL(Number(e.target.value))}
                        min="0"
                        max="86400"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Time-to-live for cached content (0 = no cache, max 86400 = 24 hours)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Deployment Progress */}
          {(publishingStatus.stage === 'generating' || 
            publishingStatus.stage === 'optimizing' || 
            publishingStatus.stage === 'uploading' || 
            publishingStatus.stage === 'deploying' || 
            publishingStatus.stage === 'configuring') && (
            <div className="space-y-4">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
                <h3 className="text-lg font-medium text-gray-900">{publishingStatus.message}</h3>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{publishingStatus.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${publishingStatus.progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className={cn(
                  "flex items-center space-x-2",
                  publishingStatus.progress > 10 ? "text-green-600" : "text-gray-400"
                )}>
                  {publishingStatus.progress > 10 ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Generate static site</span>
                </div>
                <div className={cn(
                  "flex items-center space-x-2",
                  publishingStatus.progress > 30 ? "text-green-600" : "text-gray-400"
                )}>
                  {publishingStatus.progress > 30 ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : publishingStatus.progress > 10 ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                  <span>Optimize assets</span>
                </div>
                <div className={cn(
                  "flex items-center space-x-2",
                  publishingStatus.progress > 50 ? "text-green-600" : "text-gray-400"
                )}>
                  {publishingStatus.progress > 50 ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : publishingStatus.progress > 30 ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                  <span>Upload files</span>
                </div>
                <div className={cn(
                  "flex items-center space-x-2",
                  publishingStatus.progress > 70 ? "text-green-600" : "text-gray-400"
                )}>
                  {publishingStatus.progress > 70 ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : publishingStatus.progress > 50 ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                  <span>Deploy to CDN</span>
                </div>
                {isCustomDomainEnabled && customDomain && (
                  <div className={cn(
                    "flex items-center space-x-2",
                    publishingStatus.progress > 90 ? "text-green-600" : "text-gray-400"
                  )}>
                    {publishingStatus.progress > 90 ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : publishingStatus.progress > 70 ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                    )}
                    <span>Configure custom domain</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success State */}
          {publishingStatus.stage === 'complete' && publishingStatus.url && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  🎉 Site Published Successfully!
                </h3>
                <p className="text-gray-600">Your site is now live and accessible to the world.</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 font-medium">Live URL:</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(publishingStatus.url!)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <a
                  href={publishingStatus.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:text-green-800 underline break-all"
                >
                  {publishingStatus.url}
                </a>
              </div>
            </div>
          )}

          {/* Error State */}
          {publishingStatus.stage === 'error' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Publishing Failed</h3>
                <p className="text-gray-600">{publishingStatus.error}</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <h4 className="text-red-800 font-medium mb-1">Error Details:</h4>
                <p className="text-red-700 text-sm">{publishingStatus.error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          {publishingStatus.stage === 'idle' ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={!siteName.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Publish Site</span>
              </button>
            </>
          ) : publishingStatus.stage === 'complete' ? (
            <>
              <button
                onClick={resetPublishing}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Publish Again</span>
              </button>
              <div className="space-x-2">
                <a
                  href={publishingStatus.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visit Site</span>
                </a>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Done
                </button>
              </div>
            </>
          ) : publishingStatus.stage === 'error' ? (
            <>
              <button
                onClick={resetPublishing}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <button
                onClick={() => {/* Allow cancellation */}}
                className="px-4 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={publishingStatus.stage === 'deploying'}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}