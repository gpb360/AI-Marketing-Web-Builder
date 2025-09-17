'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Globe,
  Settings,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  TrendingUp,
  Users,
  Eye,
  Copy,
  Download
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import theme from '@/lib/theme';

const { luxuryTheme, componentStyles } = theme;
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Project {
  id: string;
  name: string;
  description: string;
  template: string;
  status: 'draft' | 'published' | 'archived';
  url?: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  conversions: number;
}

// Mock project data - in a real app, this would come from the backend
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'SaaS Landing Page',
    description: 'High-converting landing page for our SaaS product',
    template: 'SaaS Pro Template',
    status: 'published',
    url: 'https://mysaas.mysite.com',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    views: 1250,
    conversions: 45
  },
  {
    id: '2',
    name: 'E-commerce Store',
    description: 'Online store for fashion products',
    template: 'E-commerce Empire',
    status: 'draft',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-23'),
    views: 0,
    conversions: 0
  },
  {
    id: '3',
    name: 'Agency Portfolio',
    description: 'Showcase website for digital agency',
    template: 'Agency Showcase',
    status: 'published',
    url: 'https://agency.mysite.com',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    views: 890,
    conversions: 28
  }
];

export function UserDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');

  const filteredProjects = projects.filter(project => 
    selectedFilter === 'all' || project.status === selectedFilter
  );

  const handleCreateNew = () => {
    router.push('/templates');
  };

  const handleEditProject = (projectId: string) => {
    router.push(`/canvas?project=${projectId}`);
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
    }
  };

  const handleDuplicateProject = (project: Project) => {
    const duplicatedProject: Project = {
      ...project,
      id: `${project.id}-copy-${Date.now()}`,
      name: `${project.name} (Copy)`,
      status: 'draft',
      url: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      conversions: 0
    };
    setProjects(prev => [duplicatedProject, ...prev]);
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'published': 
        return 'bg-green-400/20 text-green-400 border border-green-400/30';
      case 'draft': 
        return 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30';
      case 'archived': 
        return 'bg-gray-600/20 text-gray-400 border border-gray-600/30';
      default: 
        return 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30';
    }
  };

  const totalViews = projects.reduce((sum, p) => sum + p.views, 0);
  const totalConversions = projects.reduce((sum, p) => sum + p.conversions, 0);
  const conversionRate = totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className={luxuryTheme.components.dashboard.container}>
      {/* Professional Header */}
      <header className={luxuryTheme.components.dashboard.header}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-black font-black text-lg">AI</span>
                </div>
                <h1 className={`text-2xl font-bold ${luxuryTheme.colors.text.primary}`}>Dashboard</h1>
              </div>
              <span className={luxuryTheme.colors.text.tertiary}>|</span>
              <span className={`${luxuryTheme.colors.text.secondary} font-medium`}>
                Welcome back, {user?.first_name || 'User'}!
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleCreateNew}
                className={componentStyles.button.primary}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Site
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/settings')}
                className={componentStyles.button.secondary}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                onClick={logout}
                className={componentStyles.button.ghost}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className={luxuryTheme.components.dashboard.statCard}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${luxuryTheme.colors.text.secondary}`}>Total Sites</p>
                  <p className={`text-3xl font-bold ${luxuryTheme.colors.text.primary}`}>{projects.length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Globe className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={luxuryTheme.components.dashboard.statCard}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${luxuryTheme.colors.text.secondary}`}>Total Views</p>
                  <p className={`text-3xl font-bold ${luxuryTheme.colors.text.primary}`}>{totalViews.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Eye className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={luxuryTheme.components.dashboard.statCard}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${luxuryTheme.colors.text.secondary}`}>Conversions</p>
                  <p className={`text-3xl font-bold ${luxuryTheme.colors.text.primary}`}>{totalConversions}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={luxuryTheme.components.dashboard.statCard}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${luxuryTheme.colors.text.secondary}`}>Conversion Rate</p>
                  <p className={`text-3xl font-bold ${luxuryTheme.colors.text.primary}`}>{conversionRate}%</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <Users className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Filter Tabs */}
        <div className="flex space-x-2 mb-8 bg-gray-800/50 backdrop-blur-sm p-2 rounded-xl w-fit border border-gray-700">
          {(['all', 'draft', 'published', 'archived'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedFilter === filter
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-400/30'
                  : `${luxuryTheme.colors.text.secondary} hover:${luxuryTheme.colors.text.accent} hover:bg-yellow-400/10`
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                selectedFilter === filter
                  ? 'bg-black/20 text-black'
                  : 'bg-gray-700 text-gray-300'
              }`}>
                {filter === 'all' ? projects.length : projects.filter(p => p.status === filter).length}
              </span>
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${luxuryTheme.components.dashboard.cardHover} group cursor-pointer`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className={`text-lg line-clamp-1 ${luxuryTheme.colors.text.primary} group-hover:${luxuryTheme.colors.text.accent} transition-colors`}>
                        {project.name}
                      </CardTitle>
                      <p className={`text-sm mt-1 line-clamp-2 ${luxuryTheme.colors.text.secondary}`}>
                        {project.description}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Template & URL */}
                    <div className="space-y-2">
                      <p className={`text-xs ${luxuryTheme.colors.text.tertiary}`}>
                        Template: {project.template}
                      </p>
                      {project.url && (
                        <div className="flex items-center space-x-2">
                          <Globe className={`w-4 h-4 ${luxuryTheme.colors.text.tertiary}`} />
                          <a 
                            href={project.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`text-sm ${luxuryTheme.colors.text.accent} hover:${luxuryTheme.colors.text.accentHover} truncate transition-colors`}
                          >
                            {project.url}
                          </a>
                          <ExternalLink className={`w-3 h-3 ${luxuryTheme.colors.text.tertiary}`} />
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className={luxuryTheme.colors.text.tertiary}>Views</p>
                        <p className={`font-semibold ${luxuryTheme.colors.text.primary}`}>
                          {project.views.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className={luxuryTheme.colors.text.tertiary}>Conversions</p>
                        <p className={`font-semibold ${luxuryTheme.colors.text.primary}`}>
                          {project.conversions}
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className={`text-xs ${luxuryTheme.colors.text.tertiary}`}>
                      <p>Created: {project.createdAt.toLocaleDateString()}</p>
                      <p>Updated: {project.updatedAt.toLocaleDateString()}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditProject(project.id)}
                        className={`flex-1 ${componentStyles.button.primary}`}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicateProject(project)}
                        className={componentStyles.button.ghost}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProject(project.id)}
                        className={`${componentStyles.button.ghost} hover:text-red-400 hover:border-red-400`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Luxury Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 inline-block mb-6">
              <Globe className={`w-16 h-16 ${luxuryTheme.colors.text.tertiary} mx-auto`} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${luxuryTheme.colors.text.primary}`}>
              {selectedFilter === 'all' ? 'No sites yet' : `No ${selectedFilter} sites`}
            </h3>
            <p className={`mb-8 ${luxuryTheme.colors.text.secondary} max-w-md mx-auto`}>
              {selectedFilter === 'all' 
                ? 'Get started by creating your first intelligent marketing website'
                : `You don't have any ${selectedFilter} sites yet`
              }
            </p>
            <Button 
              onClick={handleCreateNew}
              className={componentStyles.button.primary}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Site
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}