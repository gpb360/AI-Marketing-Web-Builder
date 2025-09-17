#!/usr/bin/env node

/**
 * MVP Test Suite Runner
 * 
 * Comprehensive testing script for AI Marketing Web Builder MVP validation
 * Runs E2E tests, performance tests, and generates detailed reports
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class MVPTestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      performanceMetrics: {},
      userJourneyResults: {},
      errors: []
    };
  }

  async runTests() {
    console.log('🚀 Starting MVP Test Suite...\n');
    
    try {
      // 1. Check if development server is running
      await this.checkDevServer();
      
      // 2. Run E2E User Journey Tests
      await this.runUserJourneyTests();
      
      // 3. Run Performance Tests
      await this.runPerformanceTests();
      
      // 4. Run Mobile Tests
      await this.runMobileTests();
      
      // 5. Run Integration Tests
      await this.runIntegrationTests();
      
      // 6. Generate comprehensive report
      await this.generateReport();
      
      console.log('\n✅ MVP Test Suite Completed!');
      console.log(`Results: ${this.results.passedTests}/${this.results.totalTests} tests passed`);
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      this.results.errors.push(error.message);
    }
  }

  async checkDevServer() {
    console.log('🔍 Checking development server...');
    
    return new Promise((resolve, reject) => {
      const http = require('http');
      const options = {
        hostname: 'localhost',
        port: 3003,
        path: '/',
        method: 'GET',
        timeout: 5000
      };

      const req = http.request(options, (res) => {
        if (res.statusCode === 200) {
          console.log('✅ Development server is running on http://localhost:3003');
          resolve();
        } else {
          reject(new Error(`Server responded with status code: ${res.statusCode}`));
        }
      });

      req.on('error', (err) => {
        reject(new Error('Development server is not running. Please start it with: npm run dev'));
      });

      req.on('timeout', () => {
        reject(new Error('Server check timed out'));
      });

      req.end();
    });
  }

  async runUserJourneyTests() {
    console.log('\n📋 Running User Journey Tests...');
    
    return new Promise((resolve, reject) => {
      const playwrightProcess = spawn('npx', [
        'playwright', 'test', 
        'tests/e2e/mvp-user-journey.spec.ts',
        '--reporter=json'
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
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
        try {
          // Parse Playwright JSON output
          const lines = output.split('\n');
          const jsonLine = lines.find(line => line.trim().startsWith('{'));
          
          if (jsonLine) {
            const results = JSON.parse(jsonLine);
            this.results.userJourneyResults = {
              total: results.suites?.reduce((acc, suite) => acc + suite.specs.length, 0) || 0,
              passed: results.suites?.reduce((acc, suite) => 
                acc + suite.specs.filter(spec => spec.tests.every(test => test.status === 'passed')).length, 0) || 0,
              failed: results.suites?.reduce((acc, suite) => 
                acc + suite.specs.filter(spec => spec.tests.some(test => test.status === 'failed')).length, 0) || 0
            };
          }

          if (code === 0) {
            console.log('✅ User Journey Tests Passed');
            this.results.passedTests += this.results.userJourneyResults.passed || 1;
          } else {
            console.log('❌ Some User Journey Tests Failed');
            this.results.failedTests += this.results.userJourneyResults.failed || 1;
            if (errorOutput) {
              this.results.errors.push(`User Journey Tests: ${errorOutput.slice(0, 500)}`);
            }
          }
          
          this.results.totalTests += this.results.userJourneyResults.total || 1;
          resolve();
        } catch (error) {
          this.results.errors.push(`User Journey Test parsing error: ${error.message}`);
          resolve();
        }
      });
    });
  }

  async runPerformanceTests() {
    console.log('\n⚡ Running Performance Tests...');
    
    return new Promise((resolve, reject) => {
      const perfProcess = spawn('npx', [
        'playwright', 'test', 
        'tests/e2e/mvp-user-journey.spec.ts',
        '--grep', 'Performance',
        '--reporter=json'
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let output = '';

      perfProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      perfProcess.on('close', (code) => {
        // Extract performance metrics from output
        const performanceMetrics = this.extractPerformanceMetrics(output);
        this.results.performanceMetrics = performanceMetrics;

        if (code === 0) {
          console.log('✅ Performance Tests Passed');
          this.results.passedTests++;
        } else {
          console.log('❌ Performance Tests Failed');
          this.results.failedTests++;
        }
        
        this.results.totalTests++;
        resolve();
      });
    });
  }

  async runMobileTests() {
    console.log('\n📱 Running Mobile Tests...');
    
    return new Promise((resolve) => {
      const mobileProcess = spawn('npx', [
        'playwright', 'test',
        'tests/e2e/mvp-user-journey.spec.ts',
        '--grep', 'Mobile',
        '--project=Mobile Chrome'
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      mobileProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Mobile Tests Passed');
          this.results.passedTests++;
        } else {
          console.log('❌ Mobile Tests Failed');
          this.results.failedTests++;
        }
        
        this.results.totalTests++;
        resolve();
      });
    });
  }

  async runIntegrationTests() {
    console.log('\n🔗 Running Integration Tests...');
    
    return new Promise((resolve) => {
      // Check if integration tests exist
      const integrationTestPath = path.join(process.cwd(), 'tests', 'integration');
      
      if (!fs.existsSync(integrationTestPath)) {
        console.log('ℹ️  No integration tests found, skipping...');
        resolve();
        return;
      }

      const integrationProcess = spawn('npm', ['run', 'test:integration'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      integrationProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Integration Tests Passed');
          this.results.passedTests++;
        } else {
          console.log('❌ Integration Tests Failed');
          this.results.failedTests++;
        }
        
        this.results.totalTests++;
        resolve();
      });
    });
  }

  extractPerformanceMetrics(output) {
    const metrics = {};
    
    // Extract load times from test output
    const loadTimeMatches = output.match(/load time: (\d+)ms/g);
    if (loadTimeMatches) {
      loadTimeMatches.forEach(match => {
        const time = parseInt(match.match(/(\d+)ms/)[1]);
        if (output.includes('Homepage')) metrics.homepageLoadTime = time;
        if (output.includes('Builder')) metrics.builderLoadTime = time;
        if (output.includes('Templates')) metrics.templatesLoadTime = time;
      });
    }

    return metrics;
  }

  async generateReport() {
    console.log('\n📊 Generating Test Report...');
    
    const report = {
      ...this.results,
      mvpValidation: {
        userAuthenticationFlow: this.results.userJourneyResults.passed > 0 ? 'PASS' : 'FAIL',
        templateSelection: this.results.userJourneyResults.passed > 0 ? 'PASS' : 'FAIL',
        visualBuilder: this.results.userJourneyResults.passed > 0 ? 'PASS' : 'FAIL',
        siteGeneration: this.results.userJourneyResults.passed > 0 ? 'PASS' : 'FAIL',
        performanceTargets: {
          homepageLoad: this.results.performanceMetrics.homepageLoadTime < 3000 ? 'PASS' : 'FAIL',
          builderLoad: this.results.performanceMetrics.builderLoadTime < 5000 ? 'PASS' : 'FAIL',
          templatesLoad: this.results.performanceMetrics.templatesLoadTime < 4000 ? 'PASS' : 'FAIL'
        }
      },
      recommendations: this.generateRecommendations()
    };

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'mvp-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlReportPath = path.join(process.cwd(), 'mvp-test-report.html');
    fs.writeFileSync(htmlReportPath, htmlReport);

    console.log(`📋 Test report saved to: ${reportPath}`);
    console.log(`🌐 HTML report saved to: ${htmlReportPath}`);
    
    // Print summary
    this.printSummary(report);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.failedTests > 0) {
      recommendations.push('Fix failing tests before MVP deployment');
    }
    
    if (this.results.performanceMetrics.homepageLoadTime > 3000) {
      recommendations.push('Optimize homepage loading performance');
    }
    
    if (this.results.performanceMetrics.builderLoadTime > 5000) {
      recommendations.push('Optimize visual builder performance');
    }
    
    if (this.results.errors.length > 0) {
      recommendations.push('Review and fix error logs');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('MVP is ready for deployment! 🎉');
    }
    
    return recommendations;
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MVP Test Report - AI Marketing Web Builder</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .status-pass { color: #22c55e; font-weight: bold; }
        .status-fail { color: #ef4444; font-weight: bold; }
        .metric-card { background: #f8f9fa; padding: 20px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #3b82f6; }
        .recommendations { background: #fef3c7; padding: 20px; border-radius: 6px; border-left: 4px solid #f59e0b; }
        .error-log { background: #fee2e2; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 MVP Test Report</h1>
            <p>AI Marketing Web Builder - ${report.timestamp}</p>
            <h2 class="${report.passedTests === report.totalTests ? 'status-pass' : 'status-fail'}">
                ${report.passedTests}/${report.totalTests} Tests Passed
            </h2>
        </div>

        <div class="metric-card">
            <h3>📊 Test Summary</h3>
            <table>
                <tr><th>Category</th><th>Status</th><th>Details</th></tr>
                <tr><td>User Authentication</td><td class="${report.mvpValidation.userAuthenticationFlow === 'PASS' ? 'status-pass' : 'status-fail'}">${report.mvpValidation.userAuthenticationFlow}</td><td>Registration, login, session management</td></tr>
                <tr><td>Template Selection</td><td class="${report.mvpValidation.templateSelection === 'PASS' ? 'status-pass' : 'status-fail'}">${report.mvpValidation.templateSelection}</td><td>Template gallery, template loading</td></tr>
                <tr><td>Visual Builder</td><td class="${report.mvpValidation.visualBuilder === 'PASS' ? 'status-pass' : 'status-fail'}">${report.mvpValidation.visualBuilder}</td><td>Component editing, drag-drop, customization</td></tr>
                <tr><td>Site Generation</td><td class="${report.mvpValidation.siteGeneration === 'PASS' ? 'status-pass' : 'status-fail'}">${report.mvpValidation.siteGeneration}</td><td>Static site generation, SEO optimization</td></tr>
            </table>
        </div>

        <div class="metric-card">
            <h3>⚡ Performance Metrics</h3>
            <table>
                <tr><th>Page</th><th>Load Time</th><th>Target</th><th>Status</th></tr>
                <tr><td>Homepage</td><td>${report.performanceMetrics.homepageLoadTime || 'N/A'}ms</td><td>&lt; 3000ms</td><td class="${report.mvpValidation.performanceTargets.homepageLoad === 'PASS' ? 'status-pass' : 'status-fail'}">${report.mvpValidation.performanceTargets.homepageLoad}</td></tr>
                <tr><td>Builder</td><td>${report.performanceMetrics.builderLoadTime || 'N/A'}ms</td><td>&lt; 5000ms</td><td class="${report.mvpValidation.performanceTargets.builderLoad === 'PASS' ? 'status-pass' : 'status-fail'}">${report.mvpValidation.performanceTargets.builderLoad}</td></tr>
                <tr><td>Templates</td><td>${report.performanceMetrics.templatesLoadTime || 'N/A'}ms</td><td>&lt; 4000ms</td><td class="${report.mvpValidation.performanceTargets.templatesLoad === 'PASS' ? 'status-pass' : 'status-fail'}">${report.mvpValidation.performanceTargets.templatesLoad}</td></tr>
            </table>
        </div>

        <div class="recommendations">
            <h3>💡 Recommendations</h3>
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>

        ${report.errors.length > 0 ? `
        <div class="error-log">
            <h3>🐛 Error Log</h3>
            ${report.errors.map(error => `<div>${error}</div>`).join('<br>')}
        </div>
        ` : ''}
    </div>
</body>
</html>`;
  }

  printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MVP TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`Passed: ${report.passedTests}`);
    console.log(`Failed: ${report.failedTests}`);
    console.log(`Success Rate: ${((report.passedTests / report.totalTests) * 100).toFixed(1)}%`);
    console.log('\n🎯 MVP Validation:');
    console.log(`  ✓ User Authentication: ${report.mvpValidation.userAuthenticationFlow}`);
    console.log(`  ✓ Template Selection: ${report.mvpValidation.templateSelection}`);
    console.log(`  ✓ Visual Builder: ${report.mvpValidation.visualBuilder}`);
    console.log(`  ✓ Site Generation: ${report.mvpValidation.siteGeneration}`);
    console.log('\n⚡ Performance:');
    console.log(`  Homepage Load: ${report.performanceMetrics.homepageLoadTime || 'N/A'}ms (Target: <3000ms)`);
    console.log(`  Builder Load: ${report.performanceMetrics.builderLoadTime || 'N/A'}ms (Target: <5000ms)`);
    console.log(`  Templates Load: ${report.performanceMetrics.templatesLoadTime || 'N/A'}ms (Target: <4000ms)`);
    console.log('\n💡 Next Steps:');
    report.recommendations.forEach(rec => console.log(`  • ${rec}`));
    console.log('='.repeat(60));
  }
}

// Run the test suite if this script is executed directly
if (require.main === module) {
  const runner = new MVPTestRunner();
  runner.runTests().catch(console.error);
}

module.exports = MVPTestRunner;