#!/usr/bin/env node
/**
 * Epic 2: SLA Monitor - Advanced Performance Tracking
 * Monitors and enforces Service Level Agreements across the development pipeline
 */

const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;
const path = require('path');

// SLA Configuration
const SLA_THRESHOLDS = {
  pr_review_time: 5 * 60 * 1000,      // 5 minutes in milliseconds
  build_time: 10 * 60 * 1000,         // 10 minutes
  test_execution: 8 * 60 * 1000,      // 8 minutes
  deployment_time: 15 * 60 * 1000,    // 15 minutes
  agent_response: 2 * 60 * 1000,      // 2 minutes for agent responses
  task_completion: 4 * 60 * 60 * 1000 // 4 hours for task completion
};

class SLAMonitor {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    this.owner = process.env.GITHUB_REPOSITORY?.split('/')[0] || 'gpb360';
    this.repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'AI-Marketing-Web-Builder';
    this.violations = [];
    this.metrics = {};
  }

  async monitorPRReviewTimes() {
    console.log('📊 Monitoring PR Review Times...');
    
    try {
      const { data: pulls } = await this.octokit.rest.pulls.list({
        owner: this.owner,
        repo: this.repo,
        state: 'open',
        per_page: 50
      });

      for (const pull of pulls) {
        const { data: reviews } = await this.octokit.rest.pulls.listReviews({
          owner: this.owner,
          repo: this.repo,
          pull_number: pull.number
        });

        const createdAt = new Date(pull.created_at);
        const now = new Date();
        const timeSinceCreation = now - createdAt;

        // Check if PR has been reviewed
        if (reviews.length === 0 && timeSinceCreation > SLA_THRESHOLDS.pr_review_time) {
          this.violations.push({
            type: 'pr_review_time',
            pr_number: pull.number,
            title: pull.title,
            time_elapsed: timeSinceCreation,
            threshold: SLA_THRESHOLDS.pr_review_time,
            severity: 'high'
          });
        }

        // Check review response times
        for (const review of reviews) {
          const reviewTime = new Date(review.submitted_at) - createdAt;
          if (reviewTime > SLA_THRESHOLDS.pr_review_time) {
            this.violations.push({
              type: 'pr_review_response',
              pr_number: pull.number,
              review_id: review.id,
              response_time: reviewTime,
              threshold: SLA_THRESHOLDS.pr_review_time,
              severity: 'medium'
            });
          }
        }
      }

      this.metrics.pr_review_violations = this.violations.filter(v => 
        v.type === 'pr_review_time' || v.type === 'pr_review_response'
      ).length;

      return this.violations.length > 0;
    } catch (error) {
      console.error('❌ Error monitoring PR review times:', error);
      return false;
    }
  }

  async monitorBuildTimes() {
    console.log('🏗️ Monitoring Build Performance...');
    
    try {
      const { data: workflows } = await this.octokit.rest.actions.listWorkflowRuns({
        owner: this.owner,
        repo: this.repo,
        per_page: 20,
        status: 'completed'
      });

      for (const run of workflows.workflow_runs) {
        if (run.conclusion !== 'success' && run.conclusion !== 'failure') continue;

        const startTime = new Date(run.run_started_at || run.created_at);
        const endTime = new Date(run.updated_at);
        const buildTime = endTime - startTime;

        if (buildTime > SLA_THRESHOLDS.build_time) {
          this.violations.push({
            type: 'build_time',
            workflow: run.name,
            run_id: run.id,
            build_time: buildTime,
            threshold: SLA_THRESHOLDS.build_time,
            severity: buildTime > SLA_THRESHOLDS.build_time * 1.5 ? 'critical' : 'high'
          });
        }
      }

      this.metrics.build_time_violations = this.violations.filter(v => 
        v.type === 'build_time'
      ).length;

      return this.violations.filter(v => v.type === 'build_time').length > 0;
    } catch (error) {
      console.error('❌ Error monitoring build times:', error);
      return false;
    }
  }

  async monitorTestExecution() {
    console.log('🧪 Monitoring Test Execution Performance...');
    
    try {
      const { data: workflows } = await this.octokit.rest.actions.listWorkflowRuns({
        owner: this.owner,
        repo: this.repo,
        per_page: 10
      });

      for (const run of workflows.workflow_runs) {
        if (!run.name.toLowerCase().includes('test')) continue;

        const { data: jobs } = await this.octokit.rest.actions.listJobsForWorkflowRun({
          owner: this.owner,
          repo: this.repo,
          run_id: run.id
        });

        for (const job of jobs.jobs) {
          if (job.started_at && job.completed_at) {
            const testTime = new Date(job.completed_at) - new Date(job.started_at);
            
            if (testTime > SLA_THRESHOLDS.test_execution) {
              this.violations.push({
                type: 'test_execution',
                job_name: job.name,
                run_id: run.id,
                execution_time: testTime,
                threshold: SLA_THRESHOLDS.test_execution,
                severity: 'medium'
              });
            }
          }
        }
      }

      this.metrics.test_execution_violations = this.violations.filter(v => 
        v.type === 'test_execution'
      ).length;

      return this.violations.filter(v => v.type === 'test_execution').length > 0;
    } catch (error) {
      console.error('❌ Error monitoring test execution:', error);
      return false;
    }
  }

  async generateReport() {
    console.log('📋 Generating SLA Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      epic: 'Epic 2: Workflow Automation System',
      summary: {
        total_violations: this.violations.length,
        critical_violations: this.violations.filter(v => v.severity === 'critical').length,
        high_violations: this.violations.filter(v => v.severity === 'high').length,
        medium_violations: this.violations.filter(v => v.severity === 'medium').length
      },
      metrics: this.metrics,
      violations: this.violations,
      sla_thresholds: {
        'PR Review Time': '5 minutes',
        'Build Time': '10 minutes',
        'Test Execution': '8 minutes',
        'Deployment Time': '15 minutes',
        'Agent Response': '2 minutes',
        'Task Completion': '4 hours'
      },
      recommendations: this.generateRecommendations()
    };

    // Save report
    const reportPath = path.join(__dirname, '../../reports/sla-report.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Output for GitHub Actions
    console.log(`::set-output name=total_violations::${report.summary.total_violations}`);
    console.log(`::set-output name=critical_violations::${report.summary.critical_violations}`);
    console.log(`::set-output name=report_path::${reportPath}`);

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.metrics.pr_review_violations > 0) {
      recommendations.push({
        area: 'PR Reviews',
        issue: `${this.metrics.pr_review_violations} PR review SLA violations detected`,
        solution: 'Implement automated reviewer assignment and escalation policies',
        priority: 'high'
      });
    }

    if (this.metrics.build_time_violations > 0) {
      recommendations.push({
        area: 'Build Performance',
        issue: `${this.metrics.build_time_violations} build time violations detected`,
        solution: 'Optimize CI/CD pipelines, implement build caching, parallelize jobs',
        priority: 'medium'
      });
    }

    if (this.metrics.test_execution_violations > 0) {
      recommendations.push({
        area: 'Test Performance',
        issue: `${this.metrics.test_execution_violations} test execution violations detected`,
        solution: 'Optimize test suites, implement test sharding, use faster test runners',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  async updateDashboard() {
    console.log('📊 Updating SLA Dashboard...');
    
    // Create dashboard update comment on latest commit
    try {
      const { data: commits } = await this.octokit.rest.repos.listCommits({
        owner: this.owner,
        repo: this.repo,
        per_page: 1
      });

      if (commits.length > 0) {
        const dashboardContent = this.generateDashboardContent();
        
        await this.octokit.rest.repos.createCommitComment({
          owner: this.owner,
          repo: this.repo,
          commit_sha: commits[0].sha,
          body: dashboardContent
        });
      }
    } catch (error) {
      console.error('❌ Error updating dashboard:', error);
    }
  }

  generateDashboardContent() {
    const violationsByType = this.violations.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {});

    return `## 📊 Epic 2: SLA Monitor Dashboard

### Current Status: ${this.violations.length === 0 ? '✅ All SLAs Met' : '⚠️ Violations Detected'}

**Violations Summary:**
- **Total Violations:** ${this.violations.length}
- **Critical:** ${this.violations.filter(v => v.severity === 'critical').length}
- **High:** ${this.violations.filter(v => v.severity === 'high').length}
- **Medium:** ${this.violations.filter(v => v.severity === 'medium').length}

**Performance Metrics:**
${Object.entries(violationsByType).map(([type, count]) => 
  `- **${type.replace('_', ' ').toUpperCase()}:** ${count} violations`
).join('\n')}

**SLA Thresholds:**
- PR Review Time: ≤5 minutes
- Build Time: ≤10 minutes  
- Test Execution: ≤8 minutes
- Deployment Time: ≤15 minutes

*Last Updated: ${new Date().toISOString()}*
*Generated by Epic 2 Workflow Automation System*`;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const monitor = new SLAMonitor();

  try {
    if (args.includes('--metric=pr_review_time')) {
      const hasViolations = await monitor.monitorPRReviewTimes();
      console.log(`::set-output name=violation::${hasViolations}`);
    } else if (args.includes('--metric=build_time')) {
      const hasViolations = await monitor.monitorBuildTimes();
      console.log(`::set-output name=violation::${hasViolations}`);
    } else if (args.includes('--metric=test_execution')) {
      const hasViolations = await monitor.monitorTestExecution();
      console.log(`::set-output name=violation::${hasViolations}`);
    } else if (args.includes('--generate-report')) {
      await monitor.monitorPRReviewTimes();
      await monitor.monitorBuildTimes();
      await monitor.monitorTestExecution();
      await monitor.generateReport();
    } else if (args.includes('--update-dashboard')) {
      await monitor.updateDashboard();
    } else {
      // Run all monitoring by default
      console.log('🚀 Starting Epic 2 SLA Monitoring...');
      await monitor.monitorPRReviewTimes();
      await monitor.monitorBuildTimes();
      await monitor.monitorTestExecution();
      await monitor.generateReport();
      await monitor.updateDashboard();
      
      console.log(`✅ SLA Monitoring Complete: ${monitor.violations.length} violations detected`);
    }
  } catch (error) {
    console.error('❌ SLA Monitor Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { SLAMonitor };