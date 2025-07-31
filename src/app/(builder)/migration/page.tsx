import { MigrationDashboard } from '@/components/migration/MigrationDashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Template Migration - Import Existing Websites',
  description: 'Migrate existing websites into reusable templates with our AI-powered migration system',
}

export default function MigrationPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <MigrationDashboard />
    </div>
  )
}