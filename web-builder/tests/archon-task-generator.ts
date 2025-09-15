/**
 * Archon Task Generator for BMAD Workflow Integration
 * Generates Archon tasks for testing all pages and endpoints
 */

import fs from 'fs';
import path from 'path';

// Define the task structure
interface ArchonTask {
  taskId: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'review' | 'complete';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  dependencies: string[];
  estimatedTime?: string;
}

// Frontend pages from the documentation
const frontendPages = [
  { path: '/', description: 'Landing page with marketing content' },
  { path: '/auth/login', description: 'User authentication page' },
  { path: '/auth/register', description: 'New user registration page' },
  { path: '/dashboard', description: 'User dashboard after login' },
  { path: '/builder', description: 'Main website builder interface' },
  { path: '/builder/templates', description: 'Template selection interface' },
  { path: '/canvas', description: 'Main canvas for website building' },
  { path: '/canvas-ai', description: 'AI-enhanced canvas interface' },
  { path: '/analytics', description: 'Analytics dashboard' },
  { path: '/analytics-dashboard', description: 'Detailed analytics interface' },
  { path: '/sla-dashboard', description: 'SLA monitoring dashboard' },
  { path: '/smart-templates', description: 'AI-powered template recommendations' },
  { path: '/templates', description: 'Template library browsing' },
  { path: '/migration', description: 'Website migration tools' },
  { path: '/context-aware-demo', description: 'Business context demo page' },
  { path: '/test', description: 'Debug/test page' },
  { path: '/privacy', description: 'Privacy policy page' },
  { path: '/terms', description: 'Terms of service page' }
];

// Backend API endpoints from the documentation
const backendEndpoints = [
  { path: '/api/v1/auth/login', description: 'User authentication', module: 'Authentication' },
  { path: '/api/v1/auth/register', description: 'User registration', module: 'Authentication' },
  { path: '/api/v1/auth/refresh', description: 'Token refresh', module: 'Authentication' },
  { path: '/api/v1/templates', description: 'Template management', module: 'Templates' },
  { path: '/api/v1/workflows', description: 'Workflow management', module: 'Workflows' },
  { path: '/api/v1/crm', description: 'CRM functionality', module: 'CRM' },
  { path: '/api/v1/publishing', description: 'Site publishing', module: 'Publishing' },
  { path: '/api/v1/collaboration', description: 'Real-time collaboration', module: 'Collaboration' },
  { path: '/api/v1/ws', description: 'WebSocket connections', module: 'Workflows' },
  { path: '/api/v1/sla-optimization', description: 'SLA optimization', module: 'SLA' },
  { path: '/api/v1/sla-remediation', description: 'SLA remediation', module: 'SLA' },
  { path: '/api/v1/ai', description: 'AI features', module: 'AI' },
  { path: '/api/v1/business-context', description: 'Business context', module: 'Business Context' }
];

// Function to generate frontend page testing tasks
function generateFrontendPageTasks(): ArchonTask[] {
  return frontendPages.map((page, index) => {
    const taskId = `test-frontend-page-${index + 1}`;
    return {
      taskId,
      title: `Test Frontend Page: ${page.path}`,
      description: `Validate the ${page.path} page functionality including UI elements, navigation, and user interactions. Verify that the page loads correctly and all interactive elements work as expected.`,
      status: 'todo',
      priority: page.path.includes('auth') || page.path === '/' || page.path === '/dashboard' ? 'high' : 'medium',
      tags: ['frontend', 'testing', 'page-validation'],
      dependencies: [],
      estimatedTime: '2 hours'
    };
  });
}

// Function to generate backend API endpoint testing tasks
function generateBackendEndpointTasks(): ArchonTask[] {
  return backendEndpoints.map((endpoint, index) => {
    const taskId = `test-backend-endpoint-${index + 1}`;
    return {
      taskId,
      title: `Test Backend API Endpoint: ${endpoint.path}`,
      description: `Validate the ${endpoint.path} API endpoint functionality including request/response handling, error cases, and data validation. Verify that the endpoint behaves correctly under various conditions and returns appropriate status codes.`,
      status: 'todo',
      priority: endpoint.path.includes('auth') || endpoint.path.includes('templates') ? 'high' : 'medium',
      tags: ['backend', 'testing', 'api-validation', endpoint.module.toLowerCase()],
      dependencies: [],
      estimatedTime: '3 hours'
    };
  });
}

// Function to generate integration testing tasks
function generateIntegrationTasks(): ArchonTask[] {
  return [
    {
      taskId: 'integration-test-1',
      title: 'Frontend-Backend Authentication Integration',
      description: 'Validate the complete authentication flow from frontend login/registration forms to backend API endpoints. Verify token handling, session management, and error scenarios.',
      status: 'todo',
      priority: 'high',
      tags: ['integration', 'authentication', 'frontend', 'backend'],
      dependencies: [],
      estimatedTime: '4 hours'
    },
    {
      taskId: 'integration-test-2',
      title: 'Template Management Integration',
      description: 'Validate the template management workflow from frontend template selection to backend template API operations. Verify data consistency, error handling, and performance.',
      status: 'todo',
      priority: 'high',
      tags: ['integration', 'templates', 'frontend', 'backend'],
      dependencies: [],
      estimatedTime: '3 hours'
    },
    {
      taskId: 'integration-test-3',
      title: 'Workflow Builder Integration',
      description: 'Validate the workflow builder functionality from frontend drag-and-drop interface to backend workflow API operations. Verify workflow persistence, execution, and real-time updates.',
      status: 'todo',
      priority: 'high',
      tags: ['integration', 'workflows', 'frontend', 'backend'],
      dependencies: [],
      estimatedTime: '5 hours'
    },
    {
      taskId: 'integration-test-4',
      title: 'AI Features Integration',
      description: 'Validate the AI features integration from frontend component suggestions to backend AI service endpoints. Verify response quality, error handling, and performance metrics.',
      status: 'todo',
      priority: 'medium',
      tags: ['integration', 'ai', 'frontend', 'backend'],
      dependencies: [],
      estimatedTime: '4 hours'
    },
    {
      taskId: 'integration-test-5',
      title: 'Real-time Collaboration Integration',
      description: 'Validate the real-time collaboration features including WebSocket connections, presence indicators, and collaborative editing. Verify synchronization and conflict resolution.',
      status: 'todo',
      priority: 'medium',
      tags: ['integration', 'collaboration', 'websocket', 'frontend', 'backend'],
      dependencies: [],
      estimatedTime: '6 hours'
    }
  ];
}

// Function to generate reporting tasks
function generateReportingTasks(): ArchonTask[] {
  return [
    {
      taskId: 'reporting-task-1',
      title: 'Generate Page Categorization Report',
      description: 'Generate a comprehensive report categorizing all pages as workable or missing. Include detailed analysis of page functionality and test coverage.',
      status: 'todo',
      priority: 'medium',
      tags: ['reporting', 'analysis', 'documentation'],
      dependencies: [],
      estimatedTime: '2 hours'
    },
    {
      taskId: 'reporting-task-2',
      title: 'Generate Test Execution Report',
      description: 'Generate a comprehensive test execution report summarizing results from all frontend, backend, and integration tests. Include pass/fail statistics and performance metrics.',
      status: 'todo',
      priority: 'high',
      tags: ['reporting', 'testing', 'metrics'],
      dependencies: [],
      estimatedTime: '3 hours'
    },
    {
      taskId: 'reporting-task-3',
      title: 'Generate BMAD Archon Workflow Report',
      description: 'Generate a final report for the BMAD Archon workflow system summarizing all test results, page categorizations, and recommendations for future work.',
      status: 'todo',
      priority: 'high',
      tags: ['reporting', 'archon', 'bmad', 'workflow'],
      dependencies: [],
      estimatedTime: '2 hours'
    }
  ];
}

// Function to generate all Archon tasks
function generateAllArchonTasks(): ArchonTask[] {
  const frontendTasks = generateFrontendPageTasks();
  const backendTasks = generateBackendEndpointTasks();
  const integrationTasks = generateIntegrationTasks();
  const reportingTasks = generateReportingTasks();
  
  return [...frontendTasks, ...backendTasks, ...integrationTasks, ...reportingTasks];
}

// Function to save tasks to a JSON file
function saveTasksToFile(tasks: ArchonTask[]) {
  const tasksPath = path.join(__dirname, 'archon-tasks.json');
  fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
  console.log(`✅ Archon tasks saved to ${tasksPath}`);
  
  // Also save as a more readable format
  const readableTasksPath = path.join(__dirname, 'archon-tasks-readable.json');
  const readableTasks = tasks.map(task => ({
    'Task ID': task.taskId,
    'Title': task.title,
    'Description': task.description,
    'Status': task.status,
    'Priority': task.priority,
    'Tags': task.tags.join(', '),
    'Dependencies': task.dependencies.join(', '),
    'Estimated Time': task.estimatedTime || 'N/A'
  }));
  fs.writeFileSync(readableTasksPath, JSON.stringify(readableTasks, null, 2));
  console.log(`✅ Readable Archon tasks saved to ${readableTasksPath}`);
}

// Function to generate a task board HTML file
function generateTaskBoardHTML(tasks: ArchonTask[]): string {
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const doingTasks = tasks.filter(task => task.status === 'doing');
  const reviewTasks = tasks.filter(task => task.status === 'review');
  const completeTasks = tasks.filter(task => task.status === 'complete');
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Archon Task Board - AI-Marketing-Web-Builder Testing</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        h1 { color: #333; text-align: center; }
        .board { display: flex; gap: 20px; margin-top: 20px; }
        .column { flex: 1; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .column-header { padding: 15px; text-align: center; font-weight: bold; border-bottom: 1px solid #eee; }
        .todo .column-header { background-color: #e9ecef; }
        .doing .column-header { background-color: #d1ecf1; }
        .review .column-header { background-color: #fff3cd; }
        .complete .column-header { background-color: #d4edda; }
        .tasks { padding: 15px; min-height: 300px; }
        .task { background-color: #f8f9fa; border-radius: 6px; padding: 15px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .task-title { font-weight: bold; margin-bottom: 8px; }
        .task-description { font-size: 0.9em; color: #666; margin-bottom: 10px; }
        .task-meta { display: flex; justify-content: space-between; font-size: 0.8em; color: #888; }
        .task-tags { display: flex; gap: 5px; flex-wrap: wrap; }
        .tag { background-color: #e9ecef; padding: 2px 6px; border-radius: 4px; font-size: 0.75em; }
        .priority-high { border-left: 4px solid #dc3545; }
        .priority-medium { border-left: 4px solid #ffc107; }
        .priority-low { border-left: 4px solid #28a745; }
        .stats { text-align: center; margin: 20px 0; }
        .stat { display: inline-block; margin: 0 15px; }
        .stat-value { font-weight: bold; font-size: 1.2em; }
    </style>
</head>
<body>
    <h1>Archon Task Board - AI-Marketing-Web-Builder Testing</h1>
    
    <div class="stats">
        <div class="stat">
            <div class="stat-value">${tasks.length}</div>
            <div>Total Tasks</div>
        </div>
        <div class="stat">
            <div class="stat-value">${todoTasks.length}</div>
            <div>To Do</div>
        </div>
        <div class="stat">
            <div class="stat-value">${doingTasks.length}</div>
            <div>Doing</div>
        </div>
        <div class="stat">
            <div class="stat-value">${reviewTasks.length}</div>
            <div>Review</div>
        </div>
        <div class="stat">
            <div class="stat-value">${completeTasks.length}</div>
            <div>Complete</div>
        </div>
    </div>
    
    <div class="board">
        <div class="column todo">
            <div class="column-header">To Do (${todoTasks.length})</div>
            <div class="tasks">
                ${todoTasks.map(task => `
                <div class="task priority-${task.priority}">
                    <div class="task-title">${task.title}</div>
                    <div class="task-description">${task.description}</div>
                    <div class="task-meta">
                        <div>⏱️ ${task.estimatedTime || 'N/A'}</div>
                        <div class="task-tags">
                            ${task.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
        
        <div class="column doing">
            <div class="column-header">Doing (${doingTasks.length})</div>
            <div class="tasks">
                ${doingTasks.map(task => `
                <div class="task priority-${task.priority}">
                    <div class="task-title">${task.title}</div>
                    <div class="task-description">${task.description}</div>
                    <div class="task-meta">
                        <div>⏱️ ${task.estimatedTime || 'N/A'}</div>
                        <div class="task-tags">
                            ${task.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
        
        <div class="column review">
            <div class="column-header">Review (${reviewTasks.length})</div>
            <div class="tasks">
                ${reviewTasks.map(task => `
                <div class="task priority-${task.priority}">
                    <div class="task-title">${task.title}</div>
                    <div class="task-description">${task.description}</div>
                    <div class="task-meta">
                        <div>⏱️ ${task.estimatedTime || 'N/A'}</div>
                        <div class="task-tags">
                            ${task.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
        
        <div class="column complete">
            <div class="column-header">Complete (${completeTasks.length})</div>
            <div class="tasks">
                ${completeTasks.map(task => `
                <div class="task priority-${task.priority}">
                    <div class="task-title">${task.title}</div>
                    <div class="task-description">${task.description}</div>
                    <div class="task-meta">
                        <div>⏱️ ${task.estimatedTime || 'N/A'}</div>
                        <div class="task-tags">
                            ${task.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Function to save task board to HTML file
function saveTaskBoardToFile(tasks: ArchonTask[]) {
  const taskBoardPath = path.join(__dirname, 'archon-task-board.html');
  const htmlContent = generateTaskBoardHTML(tasks);
  fs.writeFileSync(taskBoardPath, htmlContent);
  console.log(`✅ Archon task board saved to ${taskBoardPath}`);
}

// Main function
function main() {
  console.log('📋 Generating Archon tasks for BMAD workflow integration...');
  
  const tasks = generateAllArchonTasks();
  saveTasksToFile(tasks);
  saveTaskBoardToFile(tasks);
  
  console.log('✅ Archon task generation complete!');
  console.log(`\n📊 Summary:`);
  console.log(`  Total Tasks Generated: ${tasks.length}`);
  console.log(`  Frontend Page Tests: ${frontendPages.length}`);
  console.log(`  Backend Endpoint Tests: ${backendEndpoints.length}`);
  console.log(`  Integration Tests: 5`);
  console.log(`  Reporting Tasks: 3`);
}

// Run the script
// if (require.main === module) {
//   main();
// }

export { 
  generateAllArchonTasks, 
  saveTasksToFile, 
  saveTaskBoardToFile
};

export type { ArchonTask };