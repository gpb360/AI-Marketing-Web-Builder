#!/usr/bin/env node

/**
 * Archon-BMad Webhook Integration Service
 * Handles bidirectional synchronization between Archon tasks and BMad workflow
 */

const express = require('express');
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

const app = express();
app.use(express.json());

// Middleware for webhook authentication
app.use('/webhook', (req, res, next) => {
    const signature = req.headers['x-archon-signature'];
    const expectedSignature = `sha256=${WEBHOOK_SECRET}`;
    
    if (signature !== expectedSignature) {
        console.error('❌ Invalid webhook signature');
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    next();
});

// Utility functions
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
        
        // Check for tests
        let hasTests = false;
        let testsPass = false;
        
        try {
            execSync('npm run test --dry-run', { stdio: 'ignore' });
            hasTests = true;
            
            try {
                execSync('npm test', { stdio: 'ignore' });
                testsPass = true;
            } catch (e) {
                // Tests exist but don't pass
            }
        } catch (e) {
            // No tests
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
            execSync(`${scriptPath} "${bmadAgent}" "${featureDesc}"`, { stdio: 'inherit' });
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

async function updateArchonTaskStatus(taskId, bmadPhase, testResults = null) {
    const archonStatus = BMAD_TO_ARCHON_STATUS[bmadPhase];
    
    if (!archonStatus) {
        console.error(`⚠️  Unknown BMad phase: ${bmadPhase}`);
        return { success: false, error: 'Unknown BMad phase' };
    }
    
    console.log(`🔄 Updating Archon task ${taskId} to status: ${archonStatus}`);
    
    // TODO: Implement actual Archon MCP API call
    // For now, we'll simulate the update
    const updateData = {
        action: 'update',
        task_id: taskId,
        update_fields: {
            status: archonStatus,
            bmad_phase: bmadPhase,
            last_sync: new Date().toISOString()
        }
    };
    
    if (testResults) {
        updateData.update_fields.test_results = testResults;
    }
    
    console.log('📝 Would update Archon task with:', updateData);
    
    return { success: true, status: archonStatus };
}

async function createArchonTask(branchInfo) {
    const { agentName, featureDesc } = branchInfo;
    const archonAgent = AGENT_MAPPINGS[agentName] || agentName;
    
    const taskData = {
        action: 'create',
        project_id: ARCHON_PROJECT_ID,
        title: `BMad: ${featureDesc}`,
        description: `Auto-created from BMad branch: ${branchInfo.branch}\\nAgent: ${agentName}\\nType: ${branchInfo.agentType}`,
        assignee: archonAgent,
        feature: featureDesc.split('-')[0], // Use first part as feature label
        sources: [
            {
                url: `git-branch://${branchInfo.branch}`,
                type: 'git_branch',
                relevance: 'Source branch for this task'
            }
        ]
    };
    
    console.log('📝 Would create Archon task with:', taskData);
    
    // TODO: Implement actual Archon MCP API call
    return { success: true, taskId: `task-${Date.now()}` };
}

// Webhook endpoints

// Handle Archon task events
app.post('/webhook/archon', async (req, res) => {
    const { event, data } = req.body;
    
    console.log(`📨 Received Archon webhook: ${event}`);
    
    try {
        switch (event) {
            case 'task.created':
                const branchResult = createBMadBranch(data);
                res.json({ 
                    success: branchResult.success, 
                    message: 'BMad branch creation initiated',
                    branch: branchResult.branch 
                });
                break;
                
            case 'task.updated':
                console.log('ℹ️  Task update received - no BMad action needed');
                res.json({ success: true, message: 'Task update acknowledged' });
                break;
                
            case 'task.assigned':
                console.log('ℹ️  Task assignment change - no BMad action needed');
                res.json({ success: true, message: 'Task assignment acknowledged' });
                break;
                
            default:
                console.log(`⚠️  Unknown event type: ${event}`);
                res.status(400).json({ error: 'Unknown event type' });
        }
    } catch (error) {
        console.error('❌ Error handling Archon webhook:', error);
        res.status(500).json({ error: error.message });
    }
});

// Handle BMad phase updates
app.post('/webhook/bmad', async (req, res) => {
    const { phase, taskId, testResults, branchName } = req.body;
    
    console.log(`📨 Received BMad webhook: phase=${phase}, branch=${branchName}`);
    
    try {
        if (taskId) {
            const result = await updateArchonTaskStatus(taskId, phase, testResults);
            res.json(result);
        } else {
            console.log('ℹ️  No task ID provided - skipping Archon update');
            res.json({ success: true, message: 'Phase update acknowledged' });
        }
    } catch (error) {
        console.error('❌ Error handling BMad webhook:', error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoints for manual operations

// Sync current branch
app.post('/api/sync', async (req, res) => {
    try {
        const branchInfo = getCurrentBranchInfo();
        if (!branchInfo) {
            return res.status(400).json({ error: 'Invalid branch format' });
        }
        
        const phaseInfo = checkBMadPhase(branchInfo);
        
        // Create Archon task if it doesn't exist
        const taskResult = await createArchonTask(branchInfo);
        
        res.json({
            success: true,
            branch: branchInfo,
            phase: phaseInfo,
            task: taskResult
        });
    } catch (error) {
        console.error('❌ Error syncing branch:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get status report
app.get('/api/status', (req, res) => {
    try {
        const branchInfo = getCurrentBranchInfo();
        
        if (!branchInfo) {
            return res.json({
                branch: 'main',
                status: 'No sync needed - on main branch'
            });
        }
        
        const phaseInfo = checkBMadPhase(branchInfo);
        const archonStatus = BMAD_TO_ARCHON_STATUS[phaseInfo.phase];
        
        // Check BMad compliance
        let complianceStatus = 'unknown';
        try {
            execSync('./.claude/scripts/branch-isolation-check.sh', { stdio: 'ignore' });
            complianceStatus = 'compliant';
        } catch (e) {
            complianceStatus = 'violations';
        }
        
        res.json({
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
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        service: 'archon-bmad-webhook',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Archon-BMad Webhook Service running on port ${PORT}`);
    console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/webhook/archon`);
    console.log(`📊 Status API: http://localhost:${PORT}/api/status`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
});