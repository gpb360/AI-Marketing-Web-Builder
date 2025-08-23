'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Settings, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Zap,
  Shield,
  BarChart3,
  Code,
  Image,
  Monitor,
  Smartphone,
  Tablet,
  X,
  ArrowRight,
  Rocket,
  Link,
  Eye,
  Download,
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react';
import { usePublishing, PublishingOptions } from '@/hooks/usePublishing';
import { useBuilderStore } from '@/store/builderStore';

interface PublishingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

type TabType = 'publish' | 'domain' | 'seo' | 'analytics' | 'history';

export const PublishingPanel: React.FC<PublishingPanelProps> = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const { canvasElements, siteName, setSiteName } = useBuilderStore();
  const { 
    publishingStatus, 
    publishSite, 
    checkDomainStatus,
    getPublishingHistory,
    resetPublishing 
  } = usePublishing();

  const [activeTab, setActiveTab] = useState<TabType>('publish');
  const [customDomain, setCustomDomain] = useState('');
  const [domainVerified, setDomainVerified] = useState(false);
  const [seoSettings, setSeoSettings] = useState({
    title: '',
    description: '',
    keywords: [] as string[],
    socialImage: ''
  });
  const [publishHistory, setPublishHistory] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      loadPublishingHistory();
    }
  }, [isOpen, activeTab]);

  const loadPublishingHistory = async () => {
    const history = await getPublishingHistory();
    setPublishHistory(history.deployments || []);
  };

  const handlePublish = async () => {
    const options: PublishingOptions = {
      customDomain: customDomain || undefined,
      seoSettings,
      performanceOptimization: true
    };

    const result = await publishSite(options);
    
    if (result.success && activeTab !== 'publish') {
      setActiveTab('publish'); // Switch to publish tab to show progress
    }
  };

  const handleDomainVerification = async () => {
    if (!customDomain) return;
    
    const result = await checkDomainStatus(customDomain);
    setDomainVerified(result.verified);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'publish' as TabType, label: 'Publish', icon: Rocket },
    { id: 'domain' as TabType, label: 'Domain', icon: Globe },
    { id: 'seo' as TabType, label: 'SEO', icon: BarChart3 },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
    { id: 'history' as TabType, label: 'History', icon: Clock }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Publish Your Site</h2>
              <p className="text-sm text-gray-500">Make your website live on the internet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'publish' && (
              <motion.div
                key="publish"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
                <div className="space-y-6">
                  {/* Site Preview */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Site Overview</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Site Name:</span>
                        <p className="font-medium">{siteName || 'Untitled Site'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Components:</span>
                        <p className="font-medium">{canvasElements.length} components</p>
                      </div>
                    </div>
                  </div>

                  {/* Publishing Status */}
                  {publishingStatus.status !== 'idle' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          {publishingStatus.status === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : publishingStatus.status === 'error' ? (
                            <AlertCircle className="w-5 h-5 text-white" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900">
                            {publishingStatus.status === 'success' ? 'Site Published!' : 
                             publishingStatus.status === 'error' ? 'Publishing Failed' : 
                             'Publishing in Progress'}
                          </h4>
                          <p className="text-sm text-blue-700">{publishingStatus.message}</p>
                          {publishingStatus.status !== 'error' && publishingStatus.status !== 'success' && (
                            <div className="mt-2">
                              <div className="w-full bg-blue-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${publishingStatus.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-blue-600">{publishingStatus.progress}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {publishingStatus.status === 'success' && publishingStatus.publishedUrl && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Globe className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">
                                {publishingStatus.publishedUrl}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => copyToClipboard(publishingStatus.publishedUrl!)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => window.open(publishingStatus.publishedUrl, '_blank')}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Publish Actions */}
                  <div className="space-y-4">
                    <button
                      onClick={handlePublish}
                      disabled={publishingStatus.status === 'publishing' || canvasElements.length === 0}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Rocket className="w-5 h-5" />
                      <span>
                        {publishingStatus.status === 'publishing' ? 'Publishing...' : 'Publish Site'}
                      </span>
                    </button>
                    
                    {publishingStatus.status !== 'idle' && (
                      <button
                        onClick={resetPublishing}
                        className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Quick Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab('domain')}
                      className="p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
                    >
                      <Globe className="w-6 h-6 text-gray-600 mb-2" />
                      <h4 className="font-medium text-gray-900">Custom Domain</h4>
                      <p className="text-sm text-gray-500">Use your own domain</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('seo')}
                      className="p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
                    >
                      <BarChart3 className="w-6 h-6 text-gray-600 mb-2" />
                      <h4 className="font-medium text-gray-900">SEO Settings</h4>
                      <p className="text-sm text-gray-500">Optimize for search</p>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'domain' && (
              <motion.div
                key="domain"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Domain</h3>
                    <p className="text-sm text-gray-600">Connect your own domain to this site.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Domain Name
                      </label>
                      <input
                        type="text"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        placeholder="example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <button
                      onClick={handleDomainVerification}
                      disabled={!customDomain}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify Domain
                    </button>
                    
                    {domainVerified && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Domain verified!</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'seo' && (
              <motion.div
                key="seo"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">SEO Settings</h3>
                    <p className="text-sm text-gray-600">Optimize your site for search engines.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Page Title
                      </label>
                      <input
                        type="text"
                        value={seoSettings.title}
                        onChange={(e) => setSeoSettings({...seoSettings, title: e.target.value})}
                        placeholder="Your site title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Description
                      </label>
                      <textarea
                        value={seoSettings.description}
                        onChange={(e) => setSeoSettings({...seoSettings, description: e.target.value})}
                        placeholder="Brief description of your site"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Publishing History</h3>
                      <p className="text-sm text-gray-600">Recent deployments and updates</p>
                    </div>
                    <button
                      onClick={loadPublishingHistory}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {publishHistory.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p>No publishing history yet</p>
                        <p className="text-sm">Publish your site to see deployment history</p>
                      </div>
                    ) : (
                      publishHistory.map((deployment, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                deployment.status === 'success' ? 'bg-green-500' :
                                deployment.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                              }`} />
                              <div>
                                <p className="font-medium text-gray-900">{deployment.message}</p>
                                <p className="text-sm text-gray-500">{deployment.timestamp}</p>
                              </div>
                            </div>
                            {deployment.url && (
                              <button
                                onClick={() => window.open(deployment.url, '_blank')}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>SSL enabled • CDN accelerated • SEO optimized</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              {activeTab !== 'publish' && (
                <button
                  onClick={() => setActiveTab('publish')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span>Go to Publish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};