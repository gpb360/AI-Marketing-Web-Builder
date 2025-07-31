import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api/client'

export interface MigrationRequest {
  url: string
  depth: number
  include_assets: boolean
  optimize_content: boolean
  generate_redirects: boolean
}

export interface MigrationStatus {
  id: string
  status: 'starting' | 'scraping' | 'processing' | 'optimizing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  total_pages: number
  processed_pages: number
  errors: string[]
  warnings: string[]
  estimated_time_remaining: string
}

export interface MigrationResult {
  id: string
  original_url: string
  scraped_data: any
  processed_data: any
  migration_plan: any
  recommendations: string[]
  warnings: string[]
  created_at: string
}

export interface MigrationTemplate {
  name: string
  type: string
  content: string
  structure: any
  components: any[]
  metadata: any
  priority: string
}

export interface MigrationAnalysis {
  analysis: {
    feasible: boolean
    complexity: string
    warnings: string[]
    recommendations: string[]
    estimated_time: string
  }
  report: {
    summary: any
    content_analysis: any
    technical_details: any
    migration_plan: any
  }
  preview: {
    pages_found: number
    assets_found: number
    styles_found: number
    scripts_found: number
  }
}

export function useMigrationService() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startMigration = useCallback(async (
    url: string,
    depth: number = 3,
    includeAssets: boolean = true,
    optimizeContent: boolean = true,
    generateRedirects: boolean = true
  ): Promise<{ id: string }> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.post('/migration/start', {
        url,
        depth,
        include_assets: includeAssets,
        optimize_content: optimizeContent,
        generate_redirects: generateRedirects
      })

      return response.data
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start migration')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getMigrationStatus = useCallback(async (migrationId: string): Promise<MigrationStatus> => {
    try {
      setError(null)
      const response = await apiClient.get(`/migration/status/${migrationId}`)
      return response.data
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get migration status')
      throw err
    }
  }, [])

  const analyzeWebsite = useCallback(async (
    url: string,
    depth: number = 1
  ): Promise<MigrationAnalysis> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.post('/migration/analyze', {
        url,
        depth,
        include_assets: true,
        optimize_content: true,
        generate_redirects: true
      })

      return response.data
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze website')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getMigrationResult = useCallback(async (migrationId: string): Promise<MigrationResult> => {
    try {
      setError(null)
      const response = await apiClient.get(`/migration/result/${migrationId}`)
      return response.data
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get migration result')
      throw err
    }
  }, [])

  const getMigrationTemplates = useCallback(async (migrationId: string): Promise<{
    templates: MigrationTemplate[]
    theme_data: any
    migration_id: string
  }> => {
    try {
      setError(null)
      const response = await apiClient.get(`/migration/templates/${migrationId}`)
      return response.data
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get migration templates')
      throw err
    }
  }, [])

  const getActiveMigrations = useCallback(async (): Promise<MigrationStatus[]> => {
    try {
      setError(null)
      const response = await apiClient.get('/migration/active')
      return response.data
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get active migrations')
      throw err
    }
  }, [])

  const cancelMigration = useCallback(async (migrationId: string): Promise<void> => {
    try {
      setError(null)
      await apiClient.delete(`/migration/cancel/${migrationId}`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to cancel migration')
      throw err
    }
  }, [])

  return {
    startMigration,
    getMigrationStatus,
    analyzeWebsite,
    getMigrationResult,
    getMigrationTemplates,
    getActiveMigrations,
    cancelMigration,
    isLoading,
    error
  }
}