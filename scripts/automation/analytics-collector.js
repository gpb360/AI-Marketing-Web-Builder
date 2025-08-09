#!/usr/bin/env node
/**
 * Epic 2: Analytics Collector - Comprehensive Workflow Analytics
 * Collects, analyzes and reports on workflow performance metrics
 */

const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;
const path = require('path');

class WorkflowAnalytics {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    this.owner = process.env.GITHUB_REPOSITORY?.split('/')[0] || 'gpb360';
    this.repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'AI-Marketing-Web-Builder';
    this.analytics = {
      timestamp: new Date().toISOString(),
      epic: 'Epic 2: Workflow Automation System',
      metrics: {},
      trends: {},
      insights: [],
      performance: {}
    };
  }

  async collectWorkflowMetrics() {
    console.log('📊 Collecting Workflow Performance Metrics...');

    try {
      // Get workflow runs for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: workflows } = await this.octokit.rest.actions.listWorkflowRuns({
        owner: this.owner,
        repo: this.repo,
        per_page: 100,
        created: `>=${thirtyDaysAgo.toISOString()}`
      });

      const metrics = {
        total_runs: workflows.workflow_runs.length,
        successful_runs: workflows.workflow_runs.filter(r => r.conclusion === 'success').length,
        failed_runs: workflows.workflow_runs.filter(r => r.conclusion === 'failure').length,
        cancelled_runs: workflows.workflow_runs.filter(r => r.conclusion === 'cancelled').length,
        average_duration: 0,
        success_rate: 0,
        failure_rate: 0,
        by_workflow: {},
        by_trigger: {},
        daily_statistics: {}
      };

      // Calculate averages and rates
      if (metrics.total_runs > 0) {
        metrics.success_rate = (metrics.successful_runs / metrics.total_runs * 100).toFixed(2);
        metrics.failure_rate = (metrics.failed_runs / metrics.total_runs * 100).toFixed(2);
      }

      // Analyze by workflow type
      const workflowStats = {};
      const dailyStats = {};
      let totalDuration = 0;
      let durationCount = 0;

      for (const run of workflows.workflow_runs) {
        // Workflow-specific stats
        if (!workflowStats[run.name]) {
          workflowStats[run.name] = {
            total: 0,
            success: 0,
            failed: 0,
            average_duration: 0,
            durations: []
          };
        }
        
        workflowStats[run.name].total++;
        if (run.conclusion === 'success') workflowStats[run.name].success++;
        if (run.conclusion === 'failure') workflowStats[run.name].failed++;

        // Calculate duration
        if (run.run_started_at && run.updated_at) {
          const duration = new Date(run.updated_at) - new Date(run.run_started_at);
          workflowStats[run.name].durations.push(duration);
          totalDuration += duration;
          durationCount++;
        }

        // Daily statistics
        const date = new Date(run.created_at).toDateString();
        if (!dailyStats[date]) {
          dailyStats[date] = { total: 0, success: 0, failed: 0 };
        }
        dailyStats[date].total++;
        if (run.conclusion === 'success') dailyStats[date].success++;
        if (run.conclusion === 'failure') dailyStats[date].failed++;

        // Trigger analysis
        const trigger = run.event;
        if (!metrics.by_trigger[trigger]) {
          metrics.by_trigger[trigger] = { count: 0, success: 0, failed: 0 };
        }
        metrics.by_trigger[trigger].count++;
        if (run.conclusion === 'success') metrics.by_trigger[trigger].success++;
        if (run.conclusion === 'failure') metrics.by_trigger[trigger].failed++;
      }

      // Calculate workflow averages
      for (const [name, stats] of Object.entries(workflowStats)) {
        if (stats.durations.length > 0) {
          stats.average_duration = stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length;
        }
        stats.success_rate = stats.total > 0 ? (stats.success / stats.total * 100).toFixed(2) : 0;
        delete stats.durations; // Remove raw data
      }

      metrics.by_workflow = workflowStats;
      metrics.daily_statistics = dailyStats;
      metrics.average_duration = durationCount > 0 ? (totalDuration / durationCount) : 0;

      this.analytics.metrics.workflows = metrics;
      return metrics;
    } catch (error) {
      console.error('❌ Error collecting workflow metrics:', error);
      return null;
    }
  }

  async collectPRMetrics() {
    console.log('🔄 Collecting Pull Request Analytics...');

    try {
      const { data: pulls } = await this.octokit.rest.pulls.list({
        owner: this.owner,
        repo: this.repo,
        state: 'all',
        per_page: 100,
        sort: 'updated',
        direction: 'desc'
      });

      const prMetrics = {
        total_prs: pulls.length,
        open_prs: pulls.filter(pr => pr.state === 'open').length,
        merged_prs: pulls.filter(pr => pr.merged_at).length,
        closed_prs: pulls.filter(pr => pr.state === 'closed' && !pr.merged_at).length,
        average_review_time: 0,
        average_merge_time: 0,
        by_author: {},
        by_label: {},
        review_statistics: {
          total_reviews: 0,
          average_reviews_per_pr: 0,
          review_response_time: []
        }
      };

      let totalReviewTime = 0;
      let totalMergeTime = 0;
      let reviewTimeCount = 0;
      let mergeTimeCount = 0;

      for (const pr of pulls) {
        // Author statistics
        const author = pr.user.login;
        if (!prMetrics.by_author[author]) {
          prMetrics.by_author[author] = { total: 0, merged: 0, open: 0 };
        }
        prMetrics.by_author[author].total++;
        if (pr.merged_at) prMetrics.by_author[author].merged++;
        if (pr.state === 'open') prMetrics.by_author[author].open++;

        // Label analysis
        for (const label of pr.labels) {
          if (!prMetrics.by_label[label.name]) {
            prMetrics.by_label[label.name] = 0;
          }
          prMetrics.by_label[label.name]++;
        }

        // Review analysis
        try {
          const { data: reviews } = await this.octokit.rest.pulls.listReviews({
            owner: this.owner,
            repo: this.repo,
            pull_number: pr.number
          });

          prMetrics.review_statistics.total_reviews += reviews.length;

          if (reviews.length > 0) {
            const firstReviewTime = new Date(reviews[0].submitted_at) - new Date(pr.created_at);
            prMetrics.review_statistics.review_response_time.push(firstReviewTime);
            totalReviewTime += firstReviewTime;
            reviewTimeCount++;
          }
        } catch (error) {
          console.log(`Warning: Could not fetch reviews for PR #${pr.number}`);
        }

        // Merge time calculation
        if (pr.merged_at) {
          const mergeTime = new Date(pr.merged_at) - new Date(pr.created_at);
          totalMergeTime += mergeTime;
          mergeTimeCount++;
        }
      }

      // Calculate averages
      prMetrics.average_review_time = reviewTimeCount > 0 ? (totalReviewTime / reviewTimeCount) : 0;
      prMetrics.average_merge_time = mergeTimeCount > 0 ? (totalMergeTime / mergeTimeCount) : 0;
      prMetrics.review_statistics.average_reviews_per_pr = prMetrics.total_prs > 0 ? 
        (prMetrics.review_statistics.total_reviews / prMetrics.total_prs).toFixed(2) : 0;

      this.analytics.metrics.pull_requests = prMetrics;
      return prMetrics;
    } catch (error) {
      console.error('❌ Error collecting PR metrics:', error);
      return null;
    }
  }

  async collectAgentMetrics() {
    console.log('🤖 Collecting Agent Performance Metrics...');

    try {
      // Analyze commit patterns for agent activity
      const { data: commits } = await this.octokit.rest.repos.listCommits({
        owner: this.owner,
        repo: this.repo,
        per_page: 100
      });

      const agentMetrics = {
        total_agent_commits: 0,
        agents_active: new Set(),
        commit_patterns: {},
        isolation_compliance: 0,
        branch_patterns: {}
      };

      // Analyze commits for agent patterns
      for (const commit of commits) {
        const message = commit.commit.message;
        
        // Detect agent commits
        const agentPattern = /\[([\w-]+)\]/;
        const agentMatch = message.match(agentPattern);
        
        if (agentMatch) {
          agentMetrics.total_agent_commits++;
          const agent = agentMatch[1];
          agentMetrics.agents_active.add(agent);
          
          if (!agentMetrics.commit_patterns[agent]) {
            agentMetrics.commit_patterns[agent] = 0;
          }
          agentMetrics.commit_patterns[agent]++;
        }
      }

      // Convert Set to array for JSON serialization
      agentMetrics.agents_active = Array.from(agentMetrics.agents_active);
      agentMetrics.active_agent_count = agentMetrics.agents_active.length;

      // Analyze branch patterns for isolation compliance
      const { data: branches } = await this.octokit.rest.repos.listBranches({
        owner: this.owner,
        repo: this.repo,
        per_page: 100
      });

      let isolationCompliantBranches = 0;
      const agentBranchPattern = /^(frontend|backend|template|ai|integration|performance|workflow|deployment)\//;

      for (const branch of branches.branches) {
        if (agentBranchPattern.test(branch.name)) {
          isolationCompliantBranches++;
          const category = branch.name.split('/')[0];
          if (!agentMetrics.branch_patterns[category]) {
            agentMetrics.branch_patterns[category] = 0;
          }
          agentMetrics.branch_patterns[category]++;
        }
      }

      agentMetrics.isolation_compliance = branches.branches.length > 0 ? 
        (isolationCompliantBranches / branches.branches.length * 100).toFixed(2) : 0;

      this.analytics.metrics.agents = agentMetrics;
      return agentMetrics;
    } catch (error) {
      console.error('❌ Error collecting agent metrics:', error);
      return null;
    }
  }

  async generateInsights() {
    console.log('🧠 Generating Performance Insights...');

    const insights = [];
    const workflows = this.analytics.metrics.workflows;
    const prs = this.analytics.metrics.pull_requests;
    const agents = this.analytics.metrics.agents;

    // Workflow insights
    if (workflows) {
      if (workflows.success_rate < 90) {
        insights.push({
          type: 'warning',
          category: 'workflows',
          title: 'Low Workflow Success Rate',
          description: `Current success rate is ${workflows.success_rate}%. Target is >90%.`,
          recommendation: 'Review failed workflows and implement reliability improvements.',
          priority: 'high'
        });
      }

      if (workflows.average_duration > 10 * 60 * 1000) { // 10 minutes
        insights.push({
          type: 'performance',
          category: 'workflows',
          title: 'Long Workflow Duration',
          description: `Average workflow duration is ${(workflows.average_duration / 60000).toFixed(1)} minutes.`,
          recommendation: 'Optimize CI/CD pipelines and implement parallel job execution.',
          priority: 'medium'
        });
      }
    }

    // PR insights
    if (prs) {
      if (prs.average_review_time > 5 * 60 * 1000) { // 5 minutes
        insights.push({
          type: 'sla_violation',
          category: 'pull_requests',
          title: 'Slow PR Review Times',
          description: `Average review time is ${(prs.average_review_time / 60000).toFixed(1)} minutes. SLA is 5 minutes.`,
          recommendation: 'Implement automated reviewer assignment and review reminders.',
          priority: 'high'
        });
      }

      const openPRRatio = prs.total_prs > 0 ? (prs.open_prs / prs.total_prs) : 0;
      if (openPRRatio > 0.3) { // More than 30% open PRs
        insights.push({
          type: 'bottleneck',
          category: 'pull_requests',
          title: 'High Open PR Ratio',
          description: `${(openPRRatio * 100).toFixed(1)}% of PRs are currently open.`,
          recommendation: 'Implement stricter review deadlines and automated merge policies.',
          priority: 'medium'
        });
      }
    }

    // Agent insights
    if (agents) {
      if (agents.isolation_compliance < 80) {
        insights.push({
          type: 'process_violation',
          category: 'agents',
          title: 'Poor Branch Isolation Compliance',
          description: `Only ${agents.isolation_compliance}% of branches follow agent isolation patterns.`,
          recommendation: 'Enforce agent branch naming conventions and provide training.',
          priority: 'high'
        });
      }

      if (agents.active_agent_count < 5) {
        insights.push({
          type: 'utilization',
          category: 'agents',
          title: 'Low Agent Utilization',
          description: `Only ${agents.active_agent_count} agents are actively contributing.`,
          recommendation: 'Distribute work more evenly across agent specializations.',
          priority: 'low'
        });
      }
    }

    this.analytics.insights = insights;
    return insights;
  }

  async generateReport() {
    console.log('📋 Generating Comprehensive Analytics Report...');

    // Set performance score
    const workflows = this.analytics.metrics.workflows;
    const prs = this.analytics.metrics.pull_requests;
    
    let performanceScore = 100;
    
    if (workflows && workflows.success_rate < 90) performanceScore -= 20;
    if (prs && prs.average_review_time > 5 * 60 * 1000) performanceScore -= 15;
    if (this.analytics.insights.filter(i => i.priority === 'high').length > 0) performanceScore -= 10;

    this.analytics.performance = {
      overall_score: Math.max(0, performanceScore),
      grade: performanceScore >= 90 ? 'A' : performanceScore >= 80 ? 'B' : performanceScore >= 70 ? 'C' : 'D',
      status: performanceScore >= 80 ? 'excellent' : performanceScore >= 60 ? 'good' : 'needs_improvement'
    };

    // Save report
    const reportPath = path.join(__dirname, '../../reports/analytics-report.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(this.analytics, null, 2));

    console.log(`✅ Analytics report saved to: ${reportPath}`);
    console.log(`📊 Overall Performance Score: ${this.analytics.performance.overall_score}/100 (${this.analytics.performance.grade})`);

    return this.analytics;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const analytics = new WorkflowAnalytics();

  try {
    if (args.includes('--collect-all')) {
      console.log('🚀 Starting Epic 2 Analytics Collection...');
      await analytics.collectWorkflowMetrics();
      await analytics.collectPRMetrics();
      await analytics.collectAgentMetrics();
      console.log('✅ All metrics collected successfully');
    } else if (args.includes('--generate-insights')) {
      await analytics.generateInsights();
      console.log('✅ Insights generated successfully');
    } else {
      // Full analytics run
      console.log('🚀 Starting Comprehensive Epic 2 Analytics...');
      await analytics.collectWorkflowMetrics();
      await analytics.collectPRMetrics();
      await analytics.collectAgentMetrics();
      await analytics.generateInsights();
      await analytics.generateReport();
      
      console.log(`✅ Epic 2 Analytics Complete: Score ${analytics.analytics.performance.overall_score}/100`);
    }
  } catch (error) {
    console.error('❌ Analytics Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { WorkflowAnalytics };