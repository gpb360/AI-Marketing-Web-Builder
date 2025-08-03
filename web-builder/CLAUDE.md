# Claude.md - AI Marketing Web Builder Development Guide

## 🎯 PROJECT OVERVIEW

**MAIN PROJECT**: AI-Marketing-Web-Builder
- **Repository**: https://github.com/gpb360/AI-Marketing-Web-Builder
- **Working Directory**: `D:\s7s-projects\AI-Marketing-Web-Builder\`
- **Application Directory**: `D:\s7s-projects\AI-Marketing-Web-Builder\web-builder`
- **Specifications Directory**: `D:\s7s-projects\AI-Marketing-Web-Builder\spec`

## 📁 PROJECT STRUCTURE

### Directory Layout
```
D:\s7s-projects\AI-Marketing-Web-Builder\
├── web-builder/          # Main Next.js application
├── spec/                 # Project specifications and documentation
│   ├── ai-spec.md       # AI component generation specifications
│   ├── backend-spec.md  # FastAPI backend specifications
│   ├── frontend-spec.md # React/Next.js frontend specifications
│   ├── integration-spec.md # Integration and API specifications
│   └── main-spec.md     # Overall project architecture
└── README.md            # Project overview
```

### Specification Files Reference
All agents MUST reference the appropriate spec files for their work:
- **Frontend Developers**: `spec/frontend-spec.md`, `spec/main-spec.md`
- **Backend Developers**: `spec/backend-spec.md`, `spec/integration-spec.md` 
- **AI Specialists**: `spec/ai-spec.md`
- **Project Managers**: All spec files for comprehensive understanding

## 🏗️ ENHANCED AGILE DEVELOPMENT WORKFLOW

### Team Structure
```
Orchestrator (You)
├── Project Manager (Backlog Owner)
├── Lead Developer (PR Review Authority)
├── Frontend Pod 1
│   ├── Senior Frontend Developer
│   ├── Frontend Developer A
│   └── Frontend Developer B
└── Frontend Pod 2
    ├── Senior Frontend Developer
    ├── Frontend Developer C
    └── Frontend Developer D
```

### Role Definitions

#### Project Manager
**Primary Responsibilities:**
- Maintain GitHub Project board (Ready/In Progress/Review/Done columns)
- Create tasks from specifications in `/spec` and `/agents` folder
- Ensure Ready column has 5-10 actionable tasks
- Monitor team velocity and remove blockers
- Enforce 5-minute maximum work periods without progress updates

**Token Limit**: 3-5k tokens per task creation session
**Communication**: Direct updates to Orchestrator every 30 minutes

#### Lead Developer (PR Review Authority)
**Primary Responsibilities:**
- Review all PRs with **5-minute maximum** review time
- Binary decisions: Approve or Request specific changes
- Authority to merge approved PRs immediately
- Escalate complex architectural decisions only

**Token Limit**: 5-10k tokens per PR review (HARD LIMIT)
**Review Process**: Checkout → Scan → Test → Decide (NO analysis paralysis)

#### Senior Frontend Developers
**Primary Responsibilities:**
- Technical decisions within their pod
- Complex feature implementation
- Code quality oversight
- Mentor junior developers

**Token Limit**: 8-12k tokens per feature implementation
**Work Scope**: Features requiring architectural decisions

#### Frontend Developers (A, B, C, D)
**Primary Responsibilities:**
- Component development and implementation
- UI/UX implementation from designs
- Testing and bug fixes
- Documentation updates

**Token Limit**: 5-8k tokens per task
**Work Scope**: Well-defined, scoped tasks from Ready column

## 📋 TASK MANAGEMENT SYSTEM

### GitHub Project Board Structure
**Active Projects:**
- **Frontend Project #10**: https://github.com/users/gpb360/projects/10
- **Backend Project #11**: https://github.com/users/gpb360/projects/11
- **Design Project #12**: https://github.com/users/gpb360/projects/12

```
Ready          In Progress    Review         Done
├── Task 1     ├── Task A     ├── PR #123    ├── Feature X
├── Task 2     ├── Task B     ├── PR #124    ├── Bug Fix Y
├── Task 3     └── Task C     └── PR #125    └── Component Z
├── Task 4     
└── Task 5     
```

### AGENT ISOLATION WORKFLOW (MANDATORY)
```
1. Check GitHub Project board assigned to your agent type
2. Pick available task from Ready column matching your domain
3. Create ISOLATED branch: {agent-type}/{agent-name}/{feature-description}
4. Move task to "In Progress" + add assigned:{agent-name} label
5. Work ONLY on files within your agent domain (see File Ownership Matrix)
6. Code + commit + push to isolated branch
7. Create PR with agent prefix: "[{AGENT-NAME}] Task Title"
8. Move task to "Ready for Review" column
9. Lead Dev reviews (5min max) + merges to main
10. Lead Dev moves task to "Done" column

CRITICAL: Each agent MUST work on dedicated branches to prevent conflicts
```

### BACKLOG MANAGEMENT SYSTEM
**Continuous Task Flow Rules:**
- **Current Backlog**: 20 tasks (10 Frontend + 10 Backend)
- **Replenishment Trigger**: When ≤5 tasks remain in Ready column
- **Action**: Project Manager creates 10 new tasks immediately
- **Task Sources**: Reference /spec folder for next priorities
- **Goal**: Never let developers run out of work

**Project Manager Backlog Protocol:**
```
BACKLOG MONITORING (Every 30 minutes):
- Check Frontend Ready count → If ≤5: Create 10 new frontend tasks
- Check Backend Ready count → If ≤5: Create 10 new backend tasks
- Reference spec files: frontend-spec.md, backend-spec.md, ai-spec.md
- Progressive complexity: Basic fixes → Advanced features → Integration
```

### Task Creation Rules
**Maximum Task Size**: 2-3 hours of work (prevents token waste)
**Required Elements**:
- Clear title matching GitHub Project task
- Branch name in kebab-case format
- PR title must match task title exactly
- Assigned agent label for tracking

**AGENT ISOLATION BRANCH NAMING (MANDATORY)**:
```
{agent-type}/{agent-name}/{feature-description}

Examples:
frontend/frontend-builder/fix-component-library-ui
backend/backend-architect/create-user-api-endpoints
template/template-designer/add-saas-templates
ai/ai-services-specialist/improve-suggestions
integration/integration-coordinator/workflow-connections
performance/performance-optimizer/canvas-optimization
workflow/workflow-automation-expert/automation-triggers
deployment/deployment-manager/ci-cd-pipeline
```

### Workflow Rules
1. **Task Selection**: Pick from GitHub Project Ready column only
2. **Status Updates**: Manual updates required (GitHub Actions disabled)
3. **Progress Reports**: Required every 30 minutes maximum
4. **Completion**: Move to Review when PR created
5. **Done**: Only after PR merged and Lead Dev confirms
6. **Backlog**: Maintain minimum 5 tasks in Ready at all times

## ⚡ TOKEN OPTIMIZATION STRATEGIES

### Token Limits by Role
- **Project Manager**: 3-5k per task creation
- **Lead Developer**: 5-10k per PR review
- **Senior Developer**: 8-12k per feature
- **Developer**: 5-8k per task

### Anti-Patterns (TOKEN WASTE)
❌ **Analysis Paralysis**: Spending 75k tokens on analysis
❌ **Over-Documentation**: Writing extensive docs instead of coding
❌ **Repeated Context**: Re-reading same files multiple times
❌ **Coordination Overhead**: Excessive back-and-forth messaging

### Optimization Techniques
✅ **Spec-First Development**: Reference specs instead of re-analyzing
✅ **Small Task Sizing**: 2-3 hour maximum prevents token drain
✅ **Binary Decisions**: Quick approve/reject, no endless analysis
✅ **Direct Action**: Fix issues immediately instead of discussing

## 🔄 PR REVIEW PROCESS

### 5-Minute Review Protocol
1. **Checkout** (30 seconds): `gh pr checkout [number]`
2. **Scan Code** (2-3 minutes): Quick security and quality check
3. **Test Functionality** (2-3 minutes): Basic functionality verification
4. **Decision** (30 seconds): Approve or request specific changes

### Review Decision Matrix
| Condition | Action | Time Limit |
|-----------|--------|------------|
| Security Issue | Request Changes | 1 minute |
| Functionality Works | Approve | 30 seconds |
| Minor Style Issues | Approve with Comment | 1 minute |
| Major Architecture Flaw | Request Changes | 2 minutes |

### No Analysis Paralysis
- **Maximum Review Time**: 5 minutes HARD LIMIT
- **Token Limit**: 10k maximum per review
- **Decision Required**: Binary approve/reject only
- **Escalation**: Complex issues go to Orchestrator

## 🚀 TEAM DEPLOYMENT PROCESS

### Session Setup
```bash
# 1. Create main session
tmux new-session -d -s ai-marketing -c "D:\s7s-projects\AI-Marketing-Web-Builder\web-builder"

# 2. Create team windows
tmux rename-window -t ai-marketing:0 "Project-Manager"
tmux new-window -t ai-marketing -n "Lead-Developer" -c "D:\s7s-projects\AI-Marketing-Web-Builder\web-builder"
tmux new-window -t ai-marketing -n "Frontend-Pod-1-Senior" -c "D:\s7s-projects\AI-Marketing-Web-Builder\web-builder"
tmux new-window -t ai-marketing -n "Frontend-Pod-1-Dev-A" -c "D:\s7s-projects\AI-Marketing-Web-Builder\web-builder"
tmux new-window -t ai-marketing -n "Frontend-Pod-1-Dev-B" -c "D:\s7s-projects\AI-Marketing-Web-Builder\web-builder"
tmux new-window -t ai-marketing -n "Frontend-Pod-2-Senior" -c "D:\s7s-projects\AI-Marketing-Web-Builder\web-builder"
tmux new-window -t ai-marketing -n "Frontend-Pod-2-Dev-C" -c "D:\s7s-projects\AI-Marketing-Web-Builder\web-builder"
tmux new-window -t ai-marketing -n "Frontend-Pod-2-Dev-D" -c "D:\s7s-projects\AI-Marketing-Web-Builder\web-builder"
```

### Agent Briefing Templates

#### Project Manager Briefing
```
You are the Project Manager for AI-Marketing-Web-Builder. 

PRIMARY RESPONSIBILITIES:
1. Monitor GitHub Project boards #10 (Frontend) and #11 (Backend)
2. BACKLOG MANAGEMENT: When ≤5 tasks remain in Ready → Create 10 new tasks
3. Reference /spec folder for task priorities and requirements
4. Enforce 30-minute progress updates from all developers
5. Track task completion velocity and remove blockers

ACTIVE PROJECT BOARDS:
- Frontend: https://github.com/users/gpb360/projects/10
- Backend: https://github.com/users/gpb360/projects/11
- Design: https://github.com/users/gpb360/projects/12

BACKLOG MONITORING PROTOCOL (Every 30 minutes):
- Check task counts: gh project item-list 10 --owner gpb360
- If Frontend Ready ≤5: Create 10 new frontend tasks immediately
- If Backend Ready ≤5: Create 10 new backend tasks immediately
- Use: gh project item-create 10 --owner gpb360 --title "Task Name"

SPECIFICATIONS TO REFERENCE:
- spec/frontend-spec.md - Frontend requirements and priorities
- spec/backend-spec.md - Backend API and database tasks
- spec/ai-spec.md - AI component specifications

TOKEN LIMIT: 3-5k per task creation session
COMMUNICATION: Report backlog status to Orchestrator every 30 minutes

IMMEDIATE TASKS:
1. Monitor current 20-task backlog (10 Frontend + 10 Backend)
2. Start 30-minute backlog monitoring cycle
3. Prepare next 10 tasks for when queue drops to 5
```

#### Lead Developer Briefing
```
You are the Lead Developer with PR Review Authority for AI-Marketing-Web-Builder.

PRIMARY RESPONSIBILITIES:
1. Review ALL PRs with 5-minute MAXIMUM time limit
2. Binary decisions: gh pr review [number] --approve OR --request-changes
3. Merge approved PRs immediately
4. NO analysis paralysis - quick decisions only

PR REVIEW PROTOCOL:
1. Checkout (30s): gh pr checkout [number]
2. Scan code (2-3min): Security and quality check
3. Test basic functionality (2-3min)
4. Decision (30s): Approve or reject with specific feedback

TOKEN LIMIT: 5-10k per PR review (HARD LIMIT)
NO EXCEPTIONS: Maximum 5 minutes per review

REFERENCE SPECS:
- spec/main-spec.md for architecture decisions
- spec/frontend-spec.md for frontend standards
```

#### Frontend Developer Briefing
```
You are a Frontend Developer for AI-Marketing-Web-Builder.

PRIMARY RESPONSIBILITIES:
1. Work exclusively from Frontend Project #10: https://github.com/users/gpb360/projects/10
2. Pick tasks from Ready column only
3. Follow exact workflow protocol (no exceptions)
4. Report progress every 30 minutes maximum

EXACT WORKFLOW PROTOCOL:
1. Visit: https://github.com/users/gpb360/projects/10
2. Pick any task from Ready column
3. Create branch: feature/task-name-kebab-case
4. Move task to "In Progress" + add label "assigned:frontend-dev-X"
5. Code + commit + push
6. Create PR with exact task title
7. Move task to "Ready for Review"
8. Wait for Lead Dev review + merge
9. Task moves to Done (Lead Dev responsibility)

SPECIFICATIONS TO FOLLOW:
- spec/frontend-spec.md - Your primary reference
- spec/main-spec.md - Architecture guidelines
- spec/ai-spec.md - For AI component features

TOKEN LIMIT: 5-8k per task (HARD LIMIT)
TIME LIMIT: Maximum 2-3 hours per task

AGENT-ISOLATED BRANCH EXAMPLES:
- frontend/frontend-builder/fix-component-library-ui
- backend/backend-architect/improve-drag-drop-performance
- template/template-designer/add-template-preview-mode
- ai/ai-services-specialist/component-suggestions
- integration/integration-coordinator/real-time-collaboration
- performance/performance-optimizer/canvas-performance
- workflow/workflow-automation-expert/trigger-improvements
- deployment/deployment-manager/automated-deployment

IMMEDIATE ACTION:
1. Go to Frontend Project #10 now
2. Pick first available Ready task
3. Start development immediately
```

## 📊 PERFORMANCE MONITORING

### Metrics to Track
- **Token consumption per task type**
- **Time from Ready → Done per task**
- **PR review times (must be ≤5 minutes)**
- **Task completion velocity**
- **Token waste incidents**

### Alert Thresholds
- **PR Review >5 minutes**: Immediate escalation
- **Token usage >limit**: Stop work, report to Orchestrator
- **Task in Progress >4 hours**: Escalate to Project Manager
- **No progress update >2 hours**: Automatic check-in required

## 🔧 COMMUNICATION PROTOCOLS

### Direct Communication (No Hub-and-Spoke)
- Developers communicate directly with each other
- Project Manager coordinates through GitHub Project board
- Lead Developer reviews PRs independently
- Orchestrator receives summary reports only

### Progress Update Templates
```
PROGRESS UPDATE - [ROLE] - [TIMESTAMP]
Current Task: [Task title from GitHub Project]
Status: [In Progress/Blocked/Complete]
ETA: [Realistic completion time]
Token Usage: [Current consumption vs limit]
Blockers: [None/Specific issue]
Next Action: [What you'll do next]
```

### Escalation Rules
1. **Technical Blocker**: Contact Senior Developer in pod
2. **Spec Clarification**: Contact Project Manager
3. **Architecture Decision**: Contact Lead Developer
4. **Token Limit Exceeded**: Contact Orchestrator immediately

## 🛡️ QUALITY GATES

### Pre-PR Checklist
- [ ] Feature matches spec requirements
- [ ] Basic testing completed
- [ ] No security vulnerabilities
- [ ] Token limit not exceeded
- [ ] Commit messages follow standards

### Lead Developer Review Criteria
- [ ] Security scan passed
- [ ] Functionality works as specified
- [ ] Code quality acceptable
- [ ] No obvious bugs
- [ ] Ready for merge

## 🚨 EMERGENCY PROTOCOLS

### Token Overconsumption
If any agent exceeds token limits:
1. **STOP ALL WORK** immediately
2. Report to Orchestrator with consumption details
3. Analyze what caused the overconsumption
4. Adjust approach before resuming

### Analysis Paralysis Detection
Signs of analysis paralysis:
- Reading same files repeatedly
- Extensive documentation without code
- No tangible progress after 30 minutes
- Token consumption without deliverables

**Response**: Immediate intervention and task reassignment

### Coordination Theater
Signs of coordination overhead:
- Multiple agents discussing same issue
- Extensive back-and-forth messaging
- Meeting requests or long discussions
- More time coordinating than coding

**Response**: Direct action, bypass coordination

This enhanced workflow focuses on **delivery over discussion**, **action over analysis**, and **efficiency over perfection**. Every process is designed to minimize token waste while maximizing development velocity.