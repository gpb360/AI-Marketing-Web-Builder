'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Server, AlertCircle, CheckCircle } from 'lucide-react';

interface BackendStatus {
  isConnected: boolean;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  lastChecked: Date;
  error?: string;
}

/**
 * Development component to show backend connection status
 * Helps diagnose "Failed to fetch" errors
 */
export function BackendStatusIndicator() {
  const [status, setStatus] = useState<BackendStatus>({
    isConnected: false,
    status: 'unknown',
    lastChecked: new Date(),
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkBackendStatus = async () => {
    setIsChecking(true);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/backend/health', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        setStatus({
          isConnected: true,
          status: 'healthy',
          responseTime,
          lastChecked: new Date(),
        });
      } else {
        setStatus({
          isConnected: false,
          status: 'unhealthy',
          responseTime,
          lastChecked: new Date(),
          error: `HTTP ${response.status}`,
        });
      }
    } catch (error) {
      setStatus({
        isConnected: false,
        status: 'unhealthy',
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check status on mount
    checkBackendStatus();

    // Set up periodic checks every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getStatusColor = () => {
    switch (status.status) {
      case 'healthy':
        return 'bg-green-500';
      case 'unhealthy':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'healthy':
        return <CheckCircle className="h-3 w-3" />;
      case 'unhealthy':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Server className="h-3 w-3" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <span className="text-sm font-medium">Backend Status</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={checkBackendStatus}
          disabled={isChecking}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="space-y-1 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span>Connection:</span>
          <Badge variant={status.isConnected ? 'default' : 'destructive'} className="text-xs">
            {getStatusIcon()}
            <span className="ml-1">
              {status.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </Badge>
        </div>

        {status.responseTime && (
          <div className="flex items-center justify-between">
            <span>Response Time:</span>
            <span className="font-mono">{status.responseTime}ms</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span>Last Checked:</span>
          <span className="font-mono">
            {status.lastChecked.toLocaleTimeString()}
          </span>
        </div>

        {status.error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
            <div className="font-medium">Error:</div>
            <div className="text-xs">{status.error}</div>
          </div>
        )}
      </div>

      {!status.isConnected && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-xs">
          <div className="font-medium">Troubleshooting:</div>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Check if backend server is running</li>
            <li>Verify backend is on port 8000</li>
            <li>Check network connectivity</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default BackendStatusIndicator;
