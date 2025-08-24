'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Globe, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Copy,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { 
  deploymentService, 
  type DomainConfig, 
  type SSLConfig, 
  type DomainVerificationResult 
} from '@/lib/services/DeploymentService';

interface DomainManagerProps {
  deploymentId: string;
  currentDomain?: string;
  onDomainConfigured?: (domain: string, verified: boolean) => void;
}

interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'TXT';
  name: string;
  value: string;
  ttl: number;
  required: boolean;
}

export default function DomainManager({ 
  deploymentId, 
  currentDomain, 
  onDomainConfigured 
}: DomainManagerProps) {
  const [domain, setDomain] = useState(currentDomain || '');
  const [domainConfig, setDomainConfig] = useState<DomainConfig>({
    domain: '',
    redirectWww: true,
    forceHttps: true,
    dnsTtl: 300
  });
  const [sslConfig, setSSLConfig] = useState<SSLConfig>({
    enabled: true,
    provider: 'letsencrypt',
    autoRenew: true
  });
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
  const [verificationToken, setVerificationToken] = useState('');
  const [domainStatus, setDomainStatus] = useState<{
    configured: boolean;
    verified: boolean;
    sslEnabled: boolean;
    loading: boolean;
    error?: string;
  }>({
    configured: false,
    verified: false,
    sslEnabled: false,
    loading: false
  });

  useEffect(() => {
    if (currentDomain) {
      loadDomainStatus();
    }
  }, [currentDomain]);

  const loadDomainStatus = async () => {
    if (!currentDomain) return;

    setDomainStatus(prev => ({ ...prev, loading: true }));
    
    try {
      const status = await deploymentService.getDomainStatus(deploymentId, currentDomain);
      setDomainStatus({
        configured: true,
        verified: status.verified,
        sslEnabled: status.sslEnabled,
        loading: false
      });
    } catch (error) {
      setDomainStatus({
        configured: false,
        verified: false,
        sslEnabled: false,
        loading: false,
        error: 'Failed to load domain status'
      });
    }
  };

  const handleDomainConfiguration = async () => {
    if (!domain.trim()) return;

    const config: DomainConfig = {
      ...domainConfig,
      domain: domain.trim()
    };

    setDomainStatus(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const result: DomainVerificationResult = await deploymentService.configureDomain(
        deploymentId, 
        config, 
        sslConfig
      );

      if (result.verified || result.records.length > 0) {
        setDnsRecords(result.records);
        setVerificationToken(result.verificationToken || '');
        setDomainStatus({
          configured: true,
          verified: result.verified,
          sslEnabled: sslConfig.enabled,
          loading: false
        });

        onDomainConfigured?.(config.domain, result.verified);
      } else {
        setDomainStatus(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Domain configuration failed'
        }));
      }
    } catch (error) {
      setDomainStatus(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Configuration failed'
      }));
    }
  };

  const handleDomainVerification = async () => {
    if (!domain || !verificationToken) return;

    setDomainStatus(prev => ({ ...prev, loading: true }));

    try {
      const result = await deploymentService.verifyDomain(domain, verificationToken);
      
      setDomainStatus(prev => ({
        ...prev,
        verified: result.verified,
        loading: false,
        error: result.error
      }));

      if (result.verified) {
        onDomainConfigured?.(domain, true);
      }
    } catch (error) {
      setDomainStatus(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getDomainStatusIcon = () => {
    if (domainStatus.loading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (domainStatus.verified) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (domainStatus.configured) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <AlertCircle className="h-4 w-4 text-gray-400" />;
  };

  const getSSLStatusIcon = () => {
    if (domainStatus.sslEnabled) return <Shield className="h-4 w-4 text-green-500" />;
    return <Shield className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Domain Configuration Header */}
      <div className="flex items-center space-x-2">
        <Globe className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Custom Domain & SSL</h2>
      </div>

      {/* Current Status */}
      {currentDomain && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Current Domain Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getDomainStatusIcon()}
                <span className="font-medium">{currentDomain}</span>
              </div>
              <div className="flex space-x-2">
                <Badge variant={domainStatus.verified ? "default" : "secondary"}>
                  {domainStatus.verified ? "Verified" : "Pending"}
                </Badge>
                <Badge variant={domainStatus.sslEnabled ? "default" : "secondary"}>
                  {domainStatus.sslEnabled ? "SSL Active" : "No SSL"}
                </Badge>
              </div>
            </div>
            
            {domainStatus.error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{domainStatus.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="configure" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configure">Configure</TabsTrigger>
          <TabsTrigger value="dns">DNS Records</TabsTrigger>
          <TabsTrigger value="ssl">SSL Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Domain Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Custom Domain</Label>
                <Input
                  id="domain"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="redirect-www">Redirect www to apex domain</Label>
                  <Switch
                    id="redirect-www"
                    checked={domainConfig.redirectWww}
                    onCheckedChange={(checked) => 
                      setDomainConfig(prev => ({ ...prev, redirectWww: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="force-https">Force HTTPS redirects</Label>
                  <Switch
                    id="force-https"
                    checked={domainConfig.forceHttps}
                    onCheckedChange={(checked) => 
                      setDomainConfig(prev => ({ ...prev, forceHttps: checked }))
                    }
                  />
                </div>
              </div>

              <Button 
                onClick={handleDomainConfiguration}
                disabled={!domain.trim() || domainStatus.loading}
                className="w-full"
              >
                {domainStatus.loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Configuring...
                  </>
                ) : (
                  'Configure Domain'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>DNS Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              {dnsRecords.length > 0 ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Add these DNS records to your domain provider to complete the setup.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    {dnsRecords.map((record, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={record.required ? "default" : "secondary"}>
                            {record.type}
                          </Badge>
                          {record.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <strong>Name:</strong>
                            <div className="font-mono bg-gray-50 p-1 rounded text-xs mt-1">
                              {record.name}
                            </div>
                          </div>
                          <div>
                            <strong>Value:</strong>
                            <div className="font-mono bg-gray-50 p-1 rounded text-xs mt-1 flex items-center">
                              <span className="truncate flex-1">{record.value}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(record.value)}
                                className="h-6 w-6 p-0 ml-1"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <strong>TTL:</strong>
                            <div className="text-xs mt-1">{record.ttl}s</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!domainStatus.verified && (
                    <Button 
                      onClick={handleDomainVerification}
                      disabled={domainStatus.loading}
                      className="w-full"
                    >
                      {domainStatus.loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Domain'
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Configure a domain first to see DNS records
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ssl" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getSSLStatusIcon()}
                <span>SSL Certificate</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="ssl-enabled">Enable SSL Certificate</Label>
                <Switch
                  id="ssl-enabled"
                  checked={sslConfig.enabled}
                  onCheckedChange={(checked) => 
                    setSSLConfig(prev => ({ ...prev, enabled: checked }))
                  }
                />
              </div>

              {sslConfig.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Certificate Provider</Label>
                    <select 
                      className="w-full border rounded-md px-3 py-2"
                      value={sslConfig.provider}
                      onChange={(e) => 
                        setSSLConfig(prev => ({ 
                          ...prev, 
                          provider: e.target.value as 'letsencrypt' | 'custom' | 'cloudflare'
                        }))
                      }
                    >
                      <option value="letsencrypt">Let's Encrypt (Recommended)</option>
                      <option value="cloudflare">Cloudflare</option>
                      <option value="custom">Custom Certificate</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-renew">Auto-renew certificates</Label>
                    <Switch
                      id="auto-renew"
                      checked={sslConfig.autoRenew}
                      onCheckedChange={(checked) => 
                        setSSLConfig(prev => ({ ...prev, autoRenew: checked }))
                      }
                    />
                  </div>

                  {domainStatus.sslEnabled && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        SSL certificate is active and automatically renewed.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}