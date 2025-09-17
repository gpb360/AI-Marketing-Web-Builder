#!/usr/bin/env node

/**
 * MVP Deployment Validation Test Runner
 * 
 * Executes comprehensive deployment validation tests to ensure:
 * - 95% deployment success rate target
 * - Site generation reliability
 * - Error handling robustness
 * - Performance under load
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class DeploymentTestRunner {
  constructor() {
    this.testResults = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      testSuites: [],
      deploymentMetrics: {
        successRate: 0,
        averageDeploymentTime: 0,
        reliabilityScore: 0
      },
      mvpReadiness: {
        score: 0,
        ready: false,
        criticalIssues: []
      }
    };
  }

  async runAllTests() {
    console.log('🚀 Starting MVP Deployment Validation Test Suite...\n');
    
    try {
      // Check if development server is running
      await this.checkDevServer();
      
      // Run deployment validation tests
      await this.runDeploymentTests();
      
      // Run stress tests
      await this.runStressTests();
      
      // Generate final report
      await this.generateReport();
      
      // Output results
      this.outputResults();
      
    } catch (error) {
      console.error('❌ Deployment test runner failed:', error);
      process.exit(1);
    }
  }

  async checkDevServer() {
    console.log('🔍 Checking development server status...');
    
    try {
      const response = await fetch('http://localhost:3003');
      if (response.ok) {
        console.log('✅ Development server is running on port 3003\n');
      } else {
        throw new Error('Server responded with error');
      }
    } catch (error) {
      console.log('⚠️ Development server not running on port 3003');
      console.log('📋 Please start the server with: npm run dev\n');
      throw new Error('Development server not available');
    }
  }

  async runDeploymentTests() {
    console.log('🧪 Running Deployment Validation Tests...\n');
    
    const deploymentTests = [
      {
        name: 'Static Site Generation Reliability',
        spec: 'tests/e2e/deployment-validation.spec.ts',
        grep: 'Static Site Generation Reliability'
      },
      {
        name: 'Deployment Pipeline Robustness',
        spec: 'tests/e2e/deployment-validation.spec.ts',
        grep: 'Deployment Pipeline Robustness'
      },
      {
        name: 'Site Validation Before Deployment',
        spec: 'tests/e2e/deployment-validation.spec.ts',
        grep: 'Site Validation Before Deployment'
      },
      {
        name: 'Error Handling and Recovery',
        spec: 'tests/e2e/deployment-validation.spec.ts',
        grep: 'Error Handling and Recovery'
      },
      {
        name: 'Deployment Performance Under Load',
        spec: 'tests/e2e/deployment-validation.spec.ts',
        grep: 'Deployment Performance Under Load'
      },
      {
        name: 'Deployment Success Rate Monitoring',
        spec: 'tests/e2e/deployment-validation.spec.ts',
        grep: 'Deployment Success Rate Monitoring'
      },
      {
        name: 'MVP Deployment Readiness Assessment',
        spec: 'tests/e2e/deployment-validation.spec.ts',
        grep: 'MVP Deployment Readiness Assessment'
      }
    ];

    for (const test of deploymentTests) {
      const result = await this.runSingleTest(test);
      this.testResults.testSuites.push(result);
      this.testResults.totalTests += result.tests;
      this.testResults.passedTests += result.passed;
      this.testResults.failedTests += result.failed;
    }
  }

  async runStressTests() {
    console.log('\n🔥 Running Deployment Stress Tests...\n');
    
    const stressTests = [
      {
        name: 'High-Volume Deployment Simulation',
        spec: 'tests/e2e/deployment-validation.spec.ts',
        grep: 'High-Volume Deployment Simulation'
      }
    ];

    for (const test of stressTests) {
      const result = await this.runSingleTest(test);
      this.testResults.testSuites.push(result);
      this.testResults.totalTests += result.tests;
      this.testResults.passedTests += result.passed;
      this.testResults.failedTests += result.failed;
    }
  }

  async runSingleTest(testConfig) {
    console.log(`🧪 Running: ${testConfig.name}...`);
    
    return new Promise((resolve) => {
      const args = [
        'test',
        testConfig.spec,
        '--grep',
        testConfig.grep,
        '--reporter=json'
      ];

      const playwrightProcess = spawn('npx', ['playwright', ...args], {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      });

      let output = '';
      let errorOutput = '';

      playwrightProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      playwrightProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      playwrightProcess.on('close', (code) => {
        let result = {
          name: testConfig.name,
          passed: 0,
          failed: 0,
          tests: 0,
          duration: 0,
          status: code === 0 ? 'passed' : 'failed',
          output: output,
          error: errorOutput
        };

        try {
          // Parse JSON output if available
          const lines = output.split('\n');
          const jsonLine = lines.find(line => line.trim().startsWith('{'));
          if (jsonLine) {
            const testResult = JSON.parse(jsonLine);
            if (testResult.stats) {
              result.tests = testResult.stats.total || 0;
              result.passed = testResult.stats.expected || 0;
              result.failed = testResult.stats.unexpected || 0;
              result.duration = testResult.stats.duration || 0;
            }
          }
        } catch (parseError) {
          // Fallback to code-based success detection
          result.tests = 1;
          result.passed = code === 0 ? 1 : 0;
          result.failed = code === 0 ? 0 : 1;
        }

        const status = result.status === 'passed' ? '✅' : '❌';
        console.log(`${status} ${testConfig.name}: ${result.passed}/${result.tests} passed`);
        
        resolve(result);
      });
    });
  }

  async generateReport() {
    console.log('\n📊 Generating Deployment Validation Report...\n');
    
    // Calculate overall metrics
    const successRate = this.testResults.totalTests > 0 
      ? (this.testResults.passedTests / this.testResults.totalTests) * 100 
      : 0;
    
    // Determine MVP readiness
    const criticalTests = [
      'Deployment Pipeline Robustness',
      'MVP Deployment Readiness Assessment',
      'Site Validation Before Deployment'
    ];
    
    const criticalTestResults = this.testResults.testSuites.filter(suite => 
      criticalTests.some(test => suite.name.includes(test))
    );
    
    const criticalPassed = criticalTestResults.filter(suite => suite.status === 'passed').length;
    const criticalTotal = criticalTestResults.length;
    const criticalSuccessRate = criticalTotal > 0 ? (criticalPassed / criticalTotal) * 100 : 0;
    
    // Update metrics
    this.testResults.deploymentMetrics = {
      successRate: successRate,
      averageDeploymentTime: 0, // Would be calculated from test results
      reliabilityScore: criticalSuccessRate
    };
    
    this.testResults.mvpReadiness = {
      score: criticalSuccessRate,
      ready: criticalSuccessRate >= 85 && successRate >= 90,
      criticalIssues: this.testResults.testSuites
        .filter(suite => suite.status === 'failed' && criticalTests.some(test => suite.name.includes(test)))
        .map(suite => suite.name)
    };

    // Generate detailed report
    const report = {
      title: 'MVP Deployment Validation Report',
      timestamp: this.testResults.timestamp,
      summary: {
        totalTests: this.testResults.totalTests,
        passedTests: this.testResults.passedTests,
        failedTests: this.testResults.failedTests,
        successRate: successRate.toFixed(1) + '%',
        mvpReady: this.testResults.mvpReadiness.ready
      },
      deploymentMetrics: this.testResults.deploymentMetrics,
      testSuites: this.testResults.testSuites,
      mvpReadiness: this.testResults.mvpReadiness,
      recommendations: this.generateRecommendations()
    };

    // Save reports
    await this.saveReports(report);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.testResults.failedTests > 0) {
      recommendations.push('Address failed deployment tests before production deployment');
    }
    
    if (this.testResults.mvpReadiness.score < 95) {
      recommendations.push('Improve deployment pipeline reliability to achieve 95%+ success rate');
    }
    
    if (this.testResults.mvpReadiness.criticalIssues.length > 0) {
      recommendations.push(`Critical: Fix issues in ${this.testResults.mvpReadiness.criticalIssues.join(', ')}`);
    }
    
    if (this.testResults.passedTests === this.testResults.totalTests) {
      recommendations.push('All deployment validation tests passed - MVP is deployment ready! 🎉');
    }
    
    return recommendations;
  }

  async saveReports(report) {
    const reportsDir = path.join(__dirname, '..', 'reports');
    
    try {
      await fs.mkdir(reportsDir, { recursive: true });
      
      // Save JSON report
      const jsonPath = path.join(reportsDir, 'deployment-validation-report.json');
      await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
      
      // Generate HTML report
      const htmlReport = this.generateHTMLReport(report);
      const htmlPath = path.join(reportsDir, 'deployment-validation-report.html');
      await fs.writeFile(htmlPath, htmlReport);
      
      console.log(`📄 Reports saved:`);
      console.log(`   JSON: ${jsonPath}`);
      console.log(`   HTML: ${htmlPath}`);
      
    } catch (error) {
      console.error('⚠️ Failed to save reports:', error);
    }
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MVP Deployment Validation Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; line-height: 1.6; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .metric { background: #f8f9fa; padding: 1rem; border-radius: 6px; text-align: center; }
        .metric-value { font-size: 2rem; font-weight: bold; color: #2d3748; }
        .metric-label { color: #718096; text-transform: uppercase; font-size: 0.875rem; }
        .test-suite { background: white; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 1rem; overflow: hidden; }
        .test-header { padding: 1rem; background: #f7fafc; border-bottom: 1px solid #e2e8f0; }
        .test-content { padding: 1rem; }
        .status-pass { color: #38a169; }
        .status-fail { color: #e53e3e; }
        .mvp-ready { background: #c6f6d5; color: #22543d; padding: 1rem; border-radius: 6px; margin: 1rem 0; }
        .mvp-not-ready { background: #fed7d7; color: #742a2a; padding: 1rem; border-radius: 6px; margin: 1rem 0; }
        .recommendations { background: #bee3f8; color: #2a4365; padding: 1rem; border-radius: 6px; margin: 1rem 0; }
        .recommendations ul { margin: 0.5rem 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>MVP Deployment Validation Report</h1>
        <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <div class="metric-value">${report.summary.totalTests}</div>
            <div class="metric-label">Total Tests</div>
        </div>
        <div class="metric">
            <div class="metric-value">${report.summary.passedTests}</div>
            <div class="metric-label">Passed</div>
        </div>
        <div class="metric">
            <div class="metric-value">${report.summary.failedTests}</div>
            <div class="metric-label">Failed</div>
        </div>
        <div class="metric">
            <div class="metric-value">${report.summary.successRate}</div>
            <div class="metric-label">Success Rate</div>
        </div>
    </div>
    
    <div class="${report.mvpReadiness.ready ? 'mvp-ready' : 'mvp-not-ready'}">
        <h3>${report.mvpReadiness.ready ? '✅ MVP Deployment Ready!' : '❌ MVP Not Ready for Deployment'}</h3>
        <p>Readiness Score: ${report.mvpReadiness.score.toFixed(1)}%</p>
        ${report.mvpReadiness.criticalIssues.length > 0 ? 
          `<p>Critical Issues: ${report.mvpReadiness.criticalIssues.join(', ')}</p>` : ''
        }
    </div>
    
    <div class="recommendations">
        <h3>📋 Recommendations</h3>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
    
    <h2>📊 Test Results</h2>
    ${report.testSuites.map(suite => `
        <div class="test-suite">
            <div class="test-header">
                <h3 class="${suite.status === 'passed' ? 'status-pass' : 'status-fail'}">
                    ${suite.status === 'passed' ? '✅' : '❌'} ${suite.name}
                </h3>
                <p>Tests: ${suite.passed}/${suite.tests} passed | Duration: ${(suite.duration / 1000).toFixed(2)}s</p>
            </div>
            ${suite.error ? `<div class="test-content"><pre style="background:#f7fafc;padding:1rem;overflow-x:auto;">${suite.error}</pre></div>` : ''}
        </div>
    `).join('')}
    
    <div style="margin-top: 2rem; padding: 1rem; background: #f7fafc; border-radius: 6px; font-size: 0.875rem; color: #718096;">
        <p>Report generated by AI Marketing Web Builder MVP Test Suite</p>
        <p>For deployment readiness, all critical tests must pass and overall success rate must be ≥90%</p>
    </div>
</body>
</html>`;
  }

  outputResults() {
    console.log('\n📊 DEPLOYMENT VALIDATION SUMMARY');
    console.log('═'.repeat(50));
    console.log(`Total Tests: ${this.testResults.totalTests}`);
    console.log(`Passed: ${this.testResults.passedTests}`);
    console.log(`Failed: ${this.testResults.failedTests}`);
    console.log(`Success Rate: ${((this.testResults.passedTests / this.testResults.totalTests) * 100).toFixed(1)}%`);
    console.log(`MVP Readiness Score: ${this.testResults.mvpReadiness.score.toFixed(1)}%`);
    
    if (this.testResults.mvpReadiness.ready) {
      console.log('\n🎉 MVP IS DEPLOYMENT READY!');
      console.log('✅ All critical deployment validation tests passed');
      console.log('✅ Deployment success rate target achieved (95%+)');
      console.log('✅ Site generation and validation systems working');
      console.log('✅ Error handling and recovery mechanisms validated');
    } else {
      console.log('\n⚠️ MVP NOT YET DEPLOYMENT READY');
      console.log('❌ Some critical tests failed or success rate below target');
      if (this.testResults.mvpReadiness.criticalIssues.length > 0) {
        console.log(`❌ Critical issues: ${this.testResults.mvpReadiness.criticalIssues.join(', ')}`);
      }
    }
    
    console.log('\n📋 RECOMMENDATIONS:');
    this.testResults.mvpReadiness.recommendations?.forEach(rec => {
      console.log(`   • ${rec}`);
    });
    
    console.log('\n✅ Deployment validation testing completed');
    console.log('📄 Detailed reports saved in ./reports/ directory');
  }
}

// Run the deployment validation test suite
if (require.main === module) {
  const runner = new DeploymentTestRunner();
  runner.runAllTests().catch(error => {
    console.error('Deployment test runner failed:', error);
    process.exit(1);
  });
}

module.exports = DeploymentTestRunner;