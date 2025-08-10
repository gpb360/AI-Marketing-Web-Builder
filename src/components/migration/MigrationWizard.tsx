"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader2, ExternalLink, Download, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMigrationService } from '@/hooks/useMigrationService'

interface MigrationWizardProps {
  onComplete?: (migrationId: string) => void
  onCancel?: () => void
}

interface MigrationStep {
  id: string
  title: string
  description: string
  completed: boolean
  active: boolean
  progress: number
}

export function MigrationWizard({ onComplete, onCancel }: MigrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [scrapingDepth, setScrapingDepth] = useState(3)
  const [migrationId, setMigrationId] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [migrationStatus, setMigrationStatus] = useState<any>(null)
  
  const { 
    startMigration, 
    getMigrationStatus, 
    analyzeWebsite, 
    getMigrationResult,
    getMigrationTemplates 
  } = useMigrationService()

  const steps: MigrationStep[] = [
    {
      id: 'input',
      title: 'Enter Website URL',
      description: 'Provide the website URL you want to migrate',
      completed: currentStep > 0,
      active: currentStep === 0,
      progress: 0
    },
    {
      id: 'analyze',
      title: 'Analyze Website',
      description: 'We analyze your website structure and content',
      completed: currentStep > 1,
      active: currentStep === 1,
      progress: 0
    },
    {
      id: 'configure',
      title: 'Configure Migration',
      description: 'Set migration preferences and options',
      completed: currentStep > 2,
      active: currentStep === 2,
      progress: 0
    },
    {
      id: 'migrate',
      title: 'Migration in Progress',
      description: 'Extracting and processing your website content',
      completed: currentStep > 3,
      active: currentStep === 3,
      progress: 0
    },
    {
      id: 'review',
      title: 'Review Results',
      description: 'Review the migrated templates and components',
      completed: currentStep > 4,
      active: currentStep === 4,
      progress: 0
    }
  ]

  useEffect(() => {
    if (migrationId) {
      const interval = setInterval(async () => {
        try {
          const status = await getMigrationStatus(migrationId)
          setMigrationStatus(status)
          
          if (status.status === 'completed') {
            clearInterval(interval)
            setCurrentStep(4)
          } else if (status.status === 'failed') {
            clearInterval(interval)
          }
        } catch (error) {
          console.error('Error checking migration status:', error)
          clearInterval(interval)
        }
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [migrationId, getMigrationStatus])

  const handleAnalyze = async () => {
    if (!websiteUrl) return
    
    setIsAnalyzing(true)
    setCurrentStep(1)
    
    try {
      const result = await analyzeWebsite(websiteUrl, scrapingDepth)
      setAnalysis(result)
      setCurrentStep(2)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleStartMigration = async () => {
    try {
      const result = await startMigration(websiteUrl, scrapingDepth)
      setMigrationId(result.id)
      setCurrentStep(3)
    } catch (error) {
      console.error('Migration start failed:', error)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="website-url">Website URL</Label>
              <Input
                id="website-url"
                type="url"
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scraping-depth">Scraping Depth</Label>
              <input
                id="scraping-depth"
                type="range"
                min="1"
                max="5"
                value={scrapingDepth}
                onChange={(e) => setScrapingDepth(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground">
                Depth: {scrapingDepth} ({scrapingDepth === 1 ? 'Homepage only' : 
                  scrapingDepth === 2 ? 'Homepage + 1 level' : 
                  scrapingDepth === 3 ? 'Homepage + 2 levels' : 
                  scrapingDepth === 4 ? 'Homepage + 3 levels' : 
                  'Deep crawl'})
              </div>
            </div>
            
            <Button 
              onClick={handleAnalyze}
              disabled={!websiteUrl || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Website'
              )}
            </Button>
          </div>
        )

      case 1:
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Analyzing website structure...</p>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            {analysis && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                    <CardDescription>
                      Found {analysis.preview.pages_found} pages, {analysis.preview.assets_found} assets, and {analysis.preview.styles_found} styles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Complexity:</span>
                        <span className={`px-2 py-1 rounded text-sm ${
                          analysis.analysis.complexity === 'low' ? 'bg-green-100 text-green-800' :
                          analysis.analysis.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {analysis.analysis.complexity}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Estimated Time:</span>
                        <span>{analysis.analysis.estimated_time}</span>
                      </div>
                      
                      {analysis.analysis.warnings.length > 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {analysis.analysis.warnings.join(', ')}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => setCurrentStep(0)}>
                    Back
                  </Button>
                  <Button onClick={handleStartMigration} className="flex-1">
                    Start Migration
                  </Button>
                </div>
              </>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Migration in Progress</h3>
              <p className="text-muted-foreground mb-4">
                {migrationStatus?.status === 'scraping' ? 'Extracting website content...' :
                 migrationStatus?.status === 'processing' ? 'Processing content...' :
                 migrationStatus?.status === 'optimizing' ? 'Optimizing templates...' :
                 'Finalizing migration...'}
              </p>
            </div>
            
            {migrationStatus && (
              <>
                <Progress value={migrationStatus.progress} className="w-full" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Pages Processed:</span>
                    <span className="font-medium ml-2">
                      {migrationStatus.processed_pages} / {migrationStatus.total_pages}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium ml-2 capitalize">{migrationStatus.status}</span>
                  </div>
                </div>
                
                {migrationStatus.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {migrationStatus.errors.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Migration Complete!</h3>
              <p className="text-muted-foreground">
                Your website has been successfully migrated to templates.
              </p>
            </div>
            
            {migrationStatus && (
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Pages:</span>
                      <span className="font-medium">{migrationStatus.total_pages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Time:</span>
                      <span className="font-medium">Completed</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Warnings:</span>
                      <span className="font-medium">{migrationStatus.warnings.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="flex space-x-4">
              <Button onClick={() => onComplete?.(migrationId!)} className="flex-1">
                Review Templates
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep(0)}>
                Start New Migration
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : step.active
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground max-w-32">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-full h-1 mx-2 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Cancel Button */}
      {currentStep < 4 && (
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => onCancel?.()}
            className="text-muted-foreground"
          >
            Cancel Migration
          </Button>
        </div>
      )}
    </div>
  )
}