#!/usr/bin/env node

/**
 * Simple Archon-BMad Webhook Service (No External Dependencies)
 * Uses only Node.js built-in modules for maximum compatibility
 */

const http = require('http');
const url = require('url');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.ARCHON_WEBHOOK_PORT || 8090;
const WEBHOOK_SECRET = process.env.ARCHON_WEBHOOK_SECRET || 'default-secret';
const ARCHON_PROJECT_ID = '7f28b875-3e32-4f1d-8349-c38df1d1ad67';

// BMad phase to Archon status mapping
const BMAD_TO_ARCHON_STATUS = {
    'story_created': 'todo',
    'in_development': 'doing', 
    'qa_testing': 'review',
    'e2e_validation': 'review',
    'deployed': 'done',
    'complete': 'done'
};

// Agent mappings between BMad and Archon
const AGENT_MAPPINGS = {
    'frontend-builder': 'frontend-developer',
    'frontend-developer': 'frontend-developer', 
    'backend-architect': 'backend-architect',
    'template-designer': 'template-designer',
    'ai-services-specialist': 'ai-engineer',
    'integration-coordinator': 'integration-coordinator',
    'performance-optimizer': 'performance-optimizer',
    'workflow-automation-expert': 'workflow-automation-expert',
    'deployment-manager': 'deployment-manager',
    'qa-automation-agent': 'prp-validator'
};

// Utility functions
function parseJSON(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
}

function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-archon-signature'
    });
    res.end(JSON.stringify(data));
}

function getCurrentBranchInfo() {
    try {
        const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        
        // Match agent branch pattern: {agent-type}/{agent-name}/{feature-description}
        const agentMatch = currentBranch.match(/^([^/]+)\/([^/]+)\/(.+)$/);
        if (agentMatch) {
            return {
                branch: currentBranch,
                agentType: agentMatch[1],
                agentName: agentMatch[2],
                featureDesc: agentMatch[3]
            };
        }
        
        // Match feature branch pattern: feature/{story-description}
        const featureMatch = currentBranch.match(/^feature\/(.+)$/);
        if (featureMatch) {
            return {
                branch: currentBranch,
                agentType: 'feature',
                agentName: 'general',
                featureDesc: featureMatch[1]
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error getting branch info:', error.message);
        return null;
    }
}

function checkBMadPhase(branchInfo) {
    try {
        // Check commit count
        const commitCount = parseInt(execSync('git rev-list --count HEAD ^main 2>/dev/null || echo "0"', { encoding: 'utf8' }).trim());
        
        // Check for tests (simplified check)
        let hasTests = false;
        let testsPass = false;
        
        // Look for common test patterns
        if (fs.existsSync('package.json')) {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            if (packageJson.scripts && packageJson.scripts.test) {
                hasTests = true;
                try {
                    execSync('npm test', { stdio: 'ignore' });
                    testsPass = true;
                } catch (e) {
                    // Tests exist but don't pass
                }
            }
        }
        
        // Determine phase
        let currentPhase = 'story_created';
        
        if (commitCount > 0) {
            currentPhase = 'in_development';
            
            if (hasTests) {
                currentPhase = 'qa_testing';
                
                if (testsPass) {
                    currentPhase = 'e2e_validation';
                }
            }
        }
        
        return {
            phase: currentPhase,
            commitCount,
            hasTests,
            testsPass
        };
    } catch (error) {
        console.error('Error checking BMad phase:', error.message);
        return { phase: 'story_created', commitCount: 0, hasTests: false, testsPass: false };
    }
}

function createBMadBranch(taskData) {
    const { assignee, title, feature } = taskData;
    
    // Convert Archon agent to BMad agent
    let bmadAgent = 'frontend-developer'; // Default fallback
    for (const [bmadAgentName, archonAgent] of Object.entries(AGENT_MAPPINGS)) {
        if (archonAgent === assignee) {
            bmadAgent = bmadAgentName;
            break;
        }
    }
    
    // Generate feature description from title
    const featureDesc = title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    
    console.log(`🌿 Creating BMad branch for agent: ${bmadAgent}, feature: ${featureDesc}`);
    
    try {
        // Check if branch creation script exists
        const scriptPath = './.claude/scripts/agent-branch-create.sh';
        if (fs.existsSync(scriptPath)) {
            execSync(`bash ${scriptPath} "${bmadAgent}" "${featureDesc}"`, { stdio: 'inherit' });
            console.log('✅ BMad branch created successfully');
            return { success: true, branch: `${AGENT_MAPPINGS[bmadAgent]}/${bmadAgent}/${featureDesc}` };
        } else {
            console.error('❌ BMad branch creation script not found');
            return { success: false, error: 'Branch creation script not found' };
        }
    } catch (error) {
        console.error('❌ Error creating BMad branch:', error.message);
        return { success: false, error: error.message };
    }
}

// HTTP request handler
function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const pathname = parsedUrl.pathname;
    
    // Handle CORS preflight
    if (method === 'OPTIONS') {
        sendJSON(res, 200, { message: 'CORS preflight' });
        return;
    }
    
    // Collect request body for POST requests
    if (method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            const data = parseJSON(body);
            handlePostRequest(req, res, pathname, data);
        });
    } else if (method === 'GET') {
        handleGetRequest(req, res, pathname, parsedUrl.query);
    } else {
        sendJSON(res, 405, { error: 'Method not allowed' });
    }
}

function handlePostRequest(req, res, pathname, data) {
    // Check webhook authentication for webhook endpoints
    if (pathname.startsWith('/webhook/')) {
        const signature = req.headers['x-archon-signature'];
        const expectedSignature = `sha256=${WEBHOOK_SECRET}`;
        
        if (signature !== expectedSignature) {
            console.error('❌ Invalid webhook signature');
            sendJSON(res, 401, { error: 'Unauthorized' });
            return;
        }
    }
    
    switch (pathname) {
        case '/webhook/archon':
            handleArchonWebhook(req, res, data);
            break;
            
        case '/webhook/bmad':
            handleBMadWebhook(req, res, data);
            break;
            
        case '/api/sync':
            handleSync(req, res);
            break;
            
        default:
            sendJSON(res, 404, { error: 'Not found' });
    }
}

function handleGetRequest(req, res, pathname, query) {
    switch (pathname) {
        case '/health':
            sendJSON(res, 200, { 
                status: 'healthy',
                service: 'archon-bmad-webhook',
                timestamp: new Date().toISOString()
            });
            break;
            
        case '/api/status':
            handleStatus(req, res);
            break;
            
        default:
            sendJSON(res, 404, { error: 'Not found' });
    }
}

function handleArchonWebhook(req, res, data) {
    const { event, data: taskData } = data || {};
    
    console.log(`📨 Received Archon webhook: ${event}`);
    
    try {
        switch (event) {
            case 'task.created':
                const branchResult = createBMadBranch(taskData);
                sendJSON(res, 200, { 
                    success: branchResult.success, 
                    message: 'BMad branch creation initiated',
                    branch: branchResult.branch 
                });
                break;
                
            case 'task.updated':
                console.log('ℹ️  Task update received - no BMad action needed');
                sendJSON(res, 200, { success: true, message: 'Task update acknowledged' });
                break;
                
            case 'task.assigned':
                console.log('ℹ️  Task assignment change - no BMad action needed');
                sendJSON(res, 200, { success: true, message: 'Task assignment acknowledged' });
                break;
                
            default:
                console.log(`⚠️  Unknown event type: ${event}`);
                sendJSON(res, 400, { error: 'Unknown event type' });
        }
    } catch (error) {
        console.error('❌ Error handling Archon webhook:', error);
        sendJSON(res, 500, { error: error.message });
    }
}

function handleBMadWebhook(req, res, data) {
    const { phase, taskId, testResults, branchName } = data || {};
    
    console.log(`📨 Received BMad webhook: phase=${phase}, branch=${branchName}`);
    
    try {
        const archonStatus = BMAD_TO_ARCHON_STATUS[phase];
        
        if (taskId && archonStatus) {
            console.log(`🔄 Would update Archon task ${taskId} to status: ${archonStatus}`);
            // TODO: Implement actual Archon MCP API call
            sendJSON(res, 200, { success: true, status: archonStatus });
        } else {
            console.log('ℹ️  No task ID provided or unknown phase - skipping Archon update');
            sendJSON(res, 200, { success: true, message: 'Phase update acknowledged' });
        }
    } catch (error) {
        console.error('❌ Error handling BMad webhook:', error);
        sendJSON(res, 500, { error: error.message });
    }
}

function handleSync(req, res) {
    try {
        const branchInfo = getCurrentBranchInfo();
        if (!branchInfo) {
            sendJSON(res, 400, { error: 'Invalid branch format' });
            return;
        }
        
        const phaseInfo = checkBMadPhase(branchInfo);
        
        console.log(`🔄 Syncing branch: ${branchInfo.branch}, phase: ${phaseInfo.phase}`);
        
        sendJSON(res, 200, {
            success: true,
            branch: branchInfo,
            phase: phaseInfo,
            message: 'Sync completed'
        });
    } catch (error) {
        console.error('❌ Error syncing branch:', error);
        sendJSON(res, 500, { error: error.message });
    }
}

function handleStatus(req, res) {
    try {
        const branchInfo = getCurrentBranchInfo();
        
        if (!branchInfo) {
            sendJSON(res, 200, {
                branch: 'main',
                status: 'No sync needed - on main branch'
            });
            return;
        }
        
        const phaseInfo = checkBMadPhase(branchInfo);
        const archonStatus = BMAD_TO_ARCHON_STATUS[phaseInfo.phase];
        
        // Check BMad compliance
        let complianceStatus = 'unknown';
        try {
            execSync('bash ./.claude/scripts/branch-isolation-check.sh', { stdio: 'ignore' });
            complianceStatus = 'compliant';
        } catch (e) {
            complianceStatus = 'violations';
        }
        
        sendJSON(res, 200, {
            branch: branchInfo,
            bmadPhase: phaseInfo.phase,
            archonStatus,
            compliance: complianceStatus,
            metrics: {
                commitCount: phaseInfo.commitCount,
                hasTests: phaseInfo.hasTests,
                testsPass: phaseInfo.testsPass
            }
        });
    } catch (error) {
        console.error('❌ Error getting status:', error);
        sendJSON(res, 500, { error: error.message });
    }
}

// Create HTTP server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
    console.log(`🚀 Archon-BMad Webhook Service running on port ${PORT}`);
    console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/webhook/archon`);
    console.log(`📊 Status API: http://localhost:${PORT}/api/status`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 Sync API: http://localhost:${PORT}/api/sync`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down webhook service...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});