/**
 * Template Rankings View Component
 * 
 * Displays real-time template rankings with filtering, sorting,
 * and detailed performance comparisons.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Star,
  Users,
  Target,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Eye,
  BarChart3,
  Crown,
  Medal,
  Trophy
} from 'lucide-react';

interface TemplateRanking {
  templateId: string;
  templateInfo: {
    id: string;
    name: string;
    category: string;
    status: string;
    createdAt: string;
  };
  overallRank: number;
  categoryRank: number;
  performanceBand: string;
  overallScore: number;
  performanceScore: number;
  popularityScore: number;
  qualityScore: number;
  successScore: number;
  rankChange7d: number;
  rankChange30d: number;
  avgConversionRate: number;
  avgBounceRate: number;
  avgSessionDuration: number;
  totalUsage: number;
  successRate: number;
  avgRating: number;
  ratingCount: number;
  lastAnalyzedAt: string;
}

interface TemplateRankingsViewProps {
  defaultCategory?: string;
  defaultPerformanceBand?: string;
  showFilters?: boolean;
  pageSize?: number;
  autoRefresh?: boolean;
}

const TemplateRankingsView: React.FC<TemplateRankingsViewProps> = ({
  defaultCategory = '',
  defaultPerformanceBand = '',
  showFilters = true,
  pageSize = 25,
  autoRefresh = true
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rankings, setRankings] = useState<TemplateRanking[]>([]);
  const [topPerformers, setTopPerformers] = useState<TemplateRanking[]>([]);
  const [categoryLeaders, setCategoryLeaders] = useState<Record<string, TemplateRanking>>({});
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [selectedPerformanceBand, setSelectedPerformanceBand] = useState(defaultPerformanceBand);
  const [sortBy, setSortBy] = useState<'rank' | 'score' | 'usage' | 'rating'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Template categories for filter dropdown
  const categories = [
    'landing_page',
    'ecommerce',
    'blog',
    'portfolio',
    'business',
    'saas',
    'agency',
    'restaurant',
    'healthcare',
    'education'
  ];

  const performanceBands = [
    'top_performer',
    'good',
    'average',
    'poor',
    'underperforming'
  ];

  // Load rankings data
  const loadRankingsData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((currentPage - 1) * pageSize).toString()
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedPerformanceBand) params.append('performance_band', selectedPerformanceBand);

      // Load main rankings
      const response = await fetch(
        `/api/v1/templates/rankings?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load rankings');
      }

      const data = await response.json();
      setRankings(data.rankings || []);
      setTotalPages(Math.ceil((data.total || 0) / pageSize));

      // Load top performers
      const topResponse = await fetch(
        '/api/v1/templates/top-performers?limit=5',
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (topResponse.ok) {
        const topData = await topResponse.json();
        setTopPerformers(topData.rankings || []);
      }

      // Load category leaders
      const leadersResponse = await fetch(
        '/api/v1/templates/category-leaders',
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (leadersResponse.ok) {
        const leadersData = await leadersResponse.json();
        setCategoryLeaders(leadersData || {});
      }

      setLastUpdated(new Date());

    } catch (err: any) {
      setError(err.message || 'Failed to load rankings');
      console.error('Rankings loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedPerformanceBand, currentPage, pageSize]);

  // Load data on mount and set up auto-refresh
  useEffect(() => {
    loadRankingsData();

    if (autoRefresh) {
      const interval = setInterval(loadRankingsData, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [loadRankingsData, autoRefresh]);

  // Filter rankings based on search term
  const filteredRankings = rankings.filter(ranking => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      ranking.templateInfo.name.toLowerCase().includes(searchLower) ||
      ranking.templateInfo.category.toLowerCase().includes(searchLower)
    );
  });

  // Utility functions
  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(0)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPerformanceBandColor = (band: string): string => {
    const colors = {
      'top_performer': 'bg-green-500 text-white',
      'good': 'bg-blue-500 text-white',
      'average': 'bg-yellow-500 text-black',
      'poor': 'bg-orange-500 text-white',
      'underperforming': 'bg-red-500 text-white'
    };
    return colors[band as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getPerformanceBandIcon = (band: string) => {
    switch (band) {
      case 'top_performer':
        return <Crown className="h-4 w-4" />;
      case 'good':
        return <Medal className="h-4 w-4" />;
      case 'average':
        return <Award className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  if (loading && rankings.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading template rankings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Rankings</h1>
          <p className="text-muted-foreground">
            Real-time performance rankings and analytics
            {lastUpdated && (
              <span className="ml-2">
                • Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <Button onClick={loadRankingsData} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Top Performers Showcase */}
      {topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Top Performers
            </CardTitle>
            <CardDescription>Highest-ranking templates across all categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {topPerformers.map((template, index) => (
                <div key={template.templateId} className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    {getRankIcon(index + 1)}
                    <span className="ml-2 text-2xl font-bold">#{template.overallRank}</span>
                  </div>
                  <h3 className="font-medium text-sm mb-1">{template.templateInfo.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{template.templateInfo.category}</p>
                  <div className="text-sm font-medium">{template.overallScore.toFixed(1)}/100</div>
                  <Progress value={template.overallScore} className="h-1 mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Leaders */}
      {Object.keys(categoryLeaders).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="h-5 w-5 mr-2 text-purple-500" />
              Category Leaders
            </CardTitle>
            <CardDescription>Top template in each category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(categoryLeaders).map(([category, leader]) => (
                <div key={category} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {category.replace('_', ' ')}
                    </Badge>
                    <Crown className="h-4 w-4 text-purple-500" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">{leader.templateInfo.name}</h4>
                  <div className="flex items-center justify-between text-xs">
                    <span>#{leader.categoryRank}</span>
                    <span>{leader.overallScore.toFixed(0)}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPerformanceBand} onValueChange={setSelectedPerformanceBand}>
                <SelectTrigger>
                  <SelectValue placeholder="All Performance Bands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Performance Bands</SelectItem>
                  {performanceBands.map((band) => (
                    <SelectItem key={band} value={band}>
                      {band.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rank">Ranking</SelectItem>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="usage">Usage</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Template Rankings</CardTitle>
          <CardDescription>
            Showing {filteredRankings.length} templates
            {selectedCategory && ` in ${selectedCategory.replace('_', ' ')}`}
            {selectedPerformanceBand && ` with ${selectedPerformanceBand.replace('_', ' ')} performance`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Metrics</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRankings.map((ranking) => (
                  <TableRow key={ranking.templateId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {getRankIcon(ranking.overallRank)}
                        <span className={`${ranking.overallRank <= 3 ? 'font-bold text-lg' : ''} ml-1`}>
                          #{ranking.overallRank}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">{ranking.templateInfo.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {ranking.totalUsage} uses
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline">
                        {ranking.templateInfo.category.replace('_', ' ')}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        Category #{ranking.categoryRank}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getPerformanceBandColor(ranking.performanceBand)}>
                        {getPerformanceBandIcon(ranking.performanceBand)}
                        <span className="ml-1">
                          {ranking.performanceBand.replace('_', ' ')}
                        </span>
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-lg font-bold">{ranking.overallScore.toFixed(1)}</div>
                      <Progress value={ranking.overallScore} className="w-16 h-1 mt-1" />
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Conv:</span>
                          <span>{formatPercentage(ranking.avgConversionRate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bounce:</span>
                          <span>{formatPercentage(ranking.avgBounceRate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Success:</span>
                          <span>{formatPercentage(ranking.successRate)}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(ranking.rankChange7d)}
                        <span className="text-sm">
                          {ranking.rankChange7d !== 0 && Math.abs(ranking.rankChange7d)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">7d</div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="font-medium">{ranking.avgRating.toFixed(1)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {ranking.ratingCount} ratings
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  size="sm"
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  size="sm"
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateRankingsView;