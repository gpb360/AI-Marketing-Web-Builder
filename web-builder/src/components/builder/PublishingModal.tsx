'use client';

import React, { useState, useCallback } from 'react';
import { useBuilderStore } from '@/store/builderStore';
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
} from 'lucide-react';

interface PublishingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DeploymentStatus {
  status: 'idle' | 'building' | 'deploying' | 'success' | 'error';
  progress: number;
  message: string;
  url?: string;
  error?: string;
}

export function PublishingModal({ isOpen, onClose }: PublishingModalProps) {
  const { components, currentTemplate } = useBuilderStore();
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    status: 'idle',
    progress: 0,
    message: 'Ready to publish',
  });
  const [siteName, setSiteName] = useState('my-awesome-site');
  const [customDomain, setCustomDomain] = useState('');
  const [isCustomDomainEnabled, setIsCustomDomainEnabled] = useState(false);

  const handlePublish = useCallback(async () => {
    if (!currentTemplate || components.length === 0) {
      setDeploymentStatus({
        status: 'error',
        progress: 0,
        message: 'No content to publish',
        error: 'Please add some components to your site before publishing.',
      });
      return;
    }

    try {
      // Step 1: Build site
      setDeploymentStatus({
        status: 'building',
        progress: 10,
        message: 'Generating static site...',
      });

      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate build

      // Step 2: Optimize assets
      setDeploymentStatus({
        status: 'building',
        progress: 40,
        message: 'Optimizing assets...',
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Deploy
      setDeploymentStatus({
        status: 'deploying',
        progress: 70,
        message: 'Deploying to CDN...',
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Configure domain
      if (isCustomDomainEnabled && customDomain) {
        setDeploymentStatus({
          status: 'deploying',
          progress: 90,
          message: 'Configuring custom domain...',
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Success
      const finalUrl = isCustomDomainEnabled && customDomain 
        ? `https://${customDomain}`
        : `https://${siteName}.marketingbuilder.app`;

      setDeploymentStatus({
        status: 'success',
        progress: 100,
        message: 'Site published successfully!',
        url: finalUrl,
      });

    } catch (error) {
      setDeploymentStatus({
        status: 'error',
        progress: 0,
        message: 'Publishing failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }, [components, currentTemplate, siteName, customDomain, isCustomDomainEnabled]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const resetPublishing = () => {
    setDeploymentStatus({
      status: 'idle',
      progress: 0,
      message: 'Ready to publish',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
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
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Site Configuration */}
          {deploymentStatus.status === 'idle' && (
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
                    <span>Global CDN</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Deployment Progress */}
          {(deploymentStatus.status === 'building' || deploymentStatus.status === 'deploying') && (
            <div className="space-y-4">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
                <h3 className="text-lg font-medium text-gray-900">{deploymentStatus.message}</h3>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{deploymentStatus.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${deploymentStatus.progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className={cn(
                  "flex items-center space-x-2",
                  deploymentStatus.progress > 10 ? "text-green-600" : "text-gray-400"
                )}>
                  {deploymentStatus.progress > 10 ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Generate static site</span>
                </div>
                <div className={cn(
                  "flex items-center space-x-2",
                  deploymentStatus.progress > 40 ? "text-green-600" : "text-gray-400"
                )}>
                  {deploymentStatus.progress > 40 ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : deploymentStatus.progress > 10 ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                  <span>Optimize assets</span>
                </div>
                <div className={cn(
                  "flex items-center space-x-2",
                  deploymentStatus.progress > 70 ? "text-green-600" : "text-gray-400"
                )}>
                  {deploymentStatus.progress > 70 ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : deploymentStatus.progress > 40 ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                  <span>Deploy to CDN</span>
                </div>
                {isCustomDomainEnabled && customDomain && (
                  <div className={cn(
                    "flex items-center space-x-2",
                    deploymentStatus.progress > 90 ? "text-green-600" : "text-gray-400"
                  )}>
                    {deploymentStatus.progress > 90 ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : deploymentStatus.progress > 70 ? (
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
          {deploymentStatus.status === 'success' && deploymentStatus.url && (
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
                    onClick={() => copyToClipboard(deploymentStatus.url!)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <a
                  href={deploymentStatus.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:text-green-800 underline break-all"
                >
                  {deploymentStatus.url}
                </a>
              </div>
            </div>
          )}

          {/* Error State */}
          {deploymentStatus.status === 'error' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Publishing Failed</h3>
                <p className="text-gray-600">{deploymentStatus.error}</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <h4 className="text-red-800 font-medium mb-1">Error Details:</h4>
                <p className="text-red-700 text-sm">{deploymentStatus.error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          {deploymentStatus.status === 'idle' ? (
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
          ) : deploymentStatus.status === 'success' ? (
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
                  href={deploymentStatus.url}
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
          ) : deploymentStatus.status === 'error' ? (
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
                disabled={deploymentStatus.status === 'deploying'}
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