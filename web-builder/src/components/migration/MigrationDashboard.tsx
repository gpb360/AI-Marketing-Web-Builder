"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Download, 
  Eye, 
  Settings, 
  FileText, 
  Image, 
  Code,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react'
import { MigrationWizard } from './MigrationWizard'
import { useMigrationService } from '@/hooks/useMigrationService'
import { formatDistanceToNow } from 'date-fns'

interface MigrationDashboardProps {
  onTemplateSelect?: (template: any) => void
}

export function MigrationDashboard({ onTemplateSelect }: MigrationDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showWizard, setShowWizard] = useState(false)
  const [selectedMigration, setSelectedMigration] = useState<string | null>(null)
  const [migrationResults, setMigrationResults] = useState<any>({})
  const [templates, setTemplates] = useState<any[]>([])

  const {
    getActiveMigrations,
    getMigrationResult,
    getMigrationTemplates,
    isLoading,
    error
  } = useMigrationService()

  const [activeMigrations, setActiveMigrations] = useState<any[]>([])

  useEffect(() => {
    loadActiveMigrations()
    const interval = setInterval(loadActiveMigrations, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadActiveMigrations = async () => {
    try {
      const migrations = await getActiveMigrations()
      setActiveMigrations(migrations)
    } catch (error) {
      console.error('Failed to load active migrations:', error)
    }
  }

  const loadMigrationDetails = async (migrationId: string) => {
    try {
      const [result, templateData] = await Promise.all([
        getMigrationResult(migrationId),
        getMigrationTemplates(migrationId)
      ])
      
      setMigrationResults(prev => ({ ...prev, [migrationId]: result }))
      setTemplates(templateData.templates)
      setSelectedMigration(migrationId)
    } catch (error) {
      console.error('Failed to load migration details:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'failed': return 'destructive'
      case 'cancelled': return 'secondary'
      case 'scraping':
      case 'processing':
      case 'optimizing': return 'primary'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <AlertCircle className="h-4 w-4" />
      case 'scraping':
      case 'processing':
      case 'optimizing': return <Clock className="h-4 w-4 animate-spin" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (showWizard) {
    return (
      <MigrationWizard
        onComplete={(migrationId) => {
          setShowWizard(false)
          loadMigrationDetails(migrationId)
          setActiveTab('results')
        }}
        onCancel={() => setShowWizard(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Template Migration Dashboard</h2>
          <p className="text-muted-foreground">
            Migrate existing websites into reusable templates
          </p>
        </div>
        <Button onClick={() => setShowWizard(true)} className="gap-2">
          <Play className="h-4 w-4" />
          Start New Migration
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Migrations</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Migrations</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeMigrations.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active migrations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95%</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.5h</div>
                <p className="text-xs text-muted-foreground">
                  Per migration
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
              <CardDescription>
                Follow these steps to migrate your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Enter your website URL and configure scraping options</li>
                <li>Let our AI analyze your website structure</li>
                <li>Review the migration plan and recommendations</li>
                <li>Start the migration and monitor progress</li>
                <li>Review and customize the generated templates</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeMigrations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active migrations</p>
                <Button onClick={() => setShowWizard(true)} className="mt-4">
                  Start Migration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeMigrations.map((migration) => (
                <Card key={migration.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">Migration #{migration.id.slice(-8)}</span>
                      <Badge variant={getStatusColor(migration.status)} className="gap-1">
                        {getStatusIcon(migration.status)}
                        {migration.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${migration.progress}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{migration.processed_pages} / {migration.total_pages} pages</span>
                        <span>{migration.progress}%</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadMigrationDetails(migration.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        
                        {migration.status !== 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {selectedMigration && migrationResults[selectedMigration] ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Migration Results</CardTitle>
                  <CardDescription>
                    Results for migration {selectedMigration.slice(-8)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Summary</h4>
                      <dl className="space-y-2 text-sm">
                        <dt className="text-muted-foreground">Original URL:</dt>
                        <dd className="font-medium">
                          <a 
                            href={migrationResults[selectedMigration].original_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {migrationResults[selectedMigration].original_url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </dd>
                        <dt className="text-muted-foreground">Total Pages:</dt>
                        <dd className="font-medium">{migrationResults[selectedMigration].scraped_data?.metadata?.total_pages || 0}</dd>
                        <dt className="text-muted-foreground">Total Assets:</dt>
                        <dd className="font-medium">{migrationResults[selectedMigration].scraped_data?.metadata?.total_assets || 0}</dd>
                      </dl>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <ul className="space-y-1 text-sm">
                        {migrationResults[selectedMigration].recommendations?.map((rec: string, index: number) => (
                          <li key={index} className="text-muted-foreground">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {migrationResults[selectedMigration].migration_plan && (
                <Card>
                  <CardHeader>
                    <CardTitle>Migration Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {migrationResults[selectedMigration].migration_plan.phases?.map((phase: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">{phase.name} ({phase.duration})</h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {phase.tasks.map((task: string, taskIndex: number) => (
                              <li key={taskIndex}>• {task}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Download className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No migration results to display</p>
                <Button onClick={() => setActiveTab('active')}>
                  View Active Migrations
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {templates.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription>
                      <Badge variant={
                        template.priority === 'high' ? 'destructive' :
                        template.priority === 'medium' ? 'default' : 'secondary'
                      }
                      >
                        {template.priority} priority
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Components:</span>
                        <span>{template.components?.length || 0}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Images:</span>
                        <span>{template.metadata?.image_count || 0}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Word Count:</span>
                        <span>{template.metadata?.word_count || 0}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2"
                      dangerouslySetInnerHTML={{
                        __html: template.content.substring(0, 200) + '...'
                      }}
                      className="text-xs text-muted-foreground line-clamp-3"
                    />
                  </CardContent>
                  
                  <CardContent className="pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => onTemplateSelect?.(template)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12"
                >Code className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No templates available</p>
                <Button onClick={() => setShowWizard(true)} className="mt-4">
                  Create Templates
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}