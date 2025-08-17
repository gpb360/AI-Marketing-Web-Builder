'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  Globe, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ExternalLink,
  Eye,
  Settings,
  AlertCircle
} from 'lucide-react';
import { useBuilderStore } from '@/store/builderStore';

interface PublishButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'toolbar';
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  onPublishComplete?: (url: string) => void;
}

type PublishStatus = 'idle' | 'publishing' | 'success' | 'error';

interface PublishingProgress {
  stage: string;
  progress: number;
  message: string;
}

export const PublishButton: React.FC<PublishButtonProps> = ({
  className = '',
  variant = 'primary',
  size = 'md',
  showProgress = true,
  onPublishComplete
}) => {
  const { canvasElements, siteName, siteSettings } = useBuilderStore();
  const [status, setStatus] = useState<PublishStatus>('idle');
  const [publishedUrl, setPublishedUrl] = useState<string>('');
  const [progress, setProgress] = useState<PublishingProgress>({
    stage: '',
    progress: 0,
    message: ''
  });

  const handlePublish = async () => {
    if (canvasElements.length === 0) {
      alert('Please add some components to your site before publishing');
      return;
    }

    setStatus('publishing');
    setProgress({ stage: 'Preparing', progress: 10, message: 'Preparing site for deployment...' });

    try {
      // Simulate publishing process - replace with actual API call
      await simulatePublishing();
      
      const url = `https://${siteName?.toLowerCase().replace(/\s+/g, '-') || 'my-site'}.example.com`;
      setPublishedUrl(url);
      setStatus('success');
      onPublishComplete?.(url);
      
    } catch (error) {
      console.error('Publishing failed:', error);
      setStatus('error');
    }
  };

  const simulatePublishing = async () => {
    const stages = [
      { stage: 'Building', progress: 25, message: 'Generating static HTML/CSS...' },
      { stage: 'Optimizing', progress: 50, message: 'Optimizing images and assets...' },
      { stage: 'Uploading', progress: 75, message: 'Uploading to CDN...' },
      { stage: 'Configuring', progress: 90, message: 'Setting up SSL and domain...' },
      { stage: 'Complete', progress: 100, message: 'Site published successfully!' }
    ];

    for (const stage of stages) {
      setProgress(stage);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };

  const resetPublish = () => {
    setStatus('idle');
    setPublishedUrl('');
    setProgress({ stage: '', progress: 0, message: '' });
  };

  const getButtonStyles = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 relative overflow-hidden';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    const variantClasses = {
      primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      toolbar: 'bg-green-600 text-white hover:bg-green-700 shadow-md'
    };

    const statusClasses = {
      idle: '',
      publishing: 'opacity-90 cursor-not-allowed',
      success: 'bg-green-600 hover:bg-green-700',
      error: 'bg-red-600 hover:bg-red-700'
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${statusClasses[status]} ${className}`;
  };

  const getButtonContent = () => {
    switch (status) {
      case 'publishing':
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Publishing...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Published
          </>
        );
      case 'error':
        return (
          <>
            <XCircle className="w-4 h-4 mr-2" />
            Failed
          </>
        );
      default:
        return (
          <>
            <Rocket className="w-4 h-4 mr-2" />
            Publish Site
          </>
        );
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={status === 'idle' ? handlePublish : status === 'error' ? resetPublish : undefined}
        disabled={status === 'publishing'}
        className={getButtonStyles()}
        whileHover={{ scale: status === 'idle' ? 1.02 : 1 }}
        whileTap={{ scale: 0.98 }}
      >
        {getButtonContent()}
      </motion.button>

      {/* Progress Modal */}
      <AnimatePresence>
        {showProgress && status === 'publishing' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border p-4 z-50"
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="font-medium text-gray-900">Publishing Your Site</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{progress.stage}</span>
                  <span className="text-gray-900">{progress.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-gray-500">{progress.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border p-4 z-50"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-gray-900">Site Published Successfully!</h3>
              </div>
              
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">Your site is now live at:</p>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <a 
                      href={publishedUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      {publishedUrl}
                    </a>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open(publishedUrl, '_blank')}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Site</span>
                  </button>
                  <button
                    onClick={resetPublish}
                    className="flex-1 bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm hover:bg-gray-300 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border p-4 z-50"
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="font-bold text-gray-900">Publishing Failed</h3>
              </div>
              
              <p className="text-sm text-gray-600">
                There was an error publishing your site. Please try again or contact support if the problem persists.
              </p>
              
              <button
                onClick={resetPublish}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};