# Claude.md - AI Marketing Web Builder Development Guide

## 🎯 PROJECT OVERVIEW

**MAIN PROJECT**: AI-Marketing-Web-Builder
- **Repository**: https://github.com/gpb360/AI-Marketing-Web-Builder
- **Working Directory**: `D:\s7s-projects\AI-Marketing-Web-Builder\`
- **Application Directory**: `D:\s7s-projects\AI-Marketing-Web-Builder\web-builder`
- **Agent Directory**: `D:\s7s-projects\AI-Marketing-Web-Builder\.claude\agents`

## 📁 PROJECT STRUCTURE

### Directory Layout
```
D:\s7s-projects\AI-Marketing-Web-Builder\
├── web-builder/          # Main Next.js application
├── .claude/agents/       # Specialized AI agents with embedded specifications
│   ├── engineering/     # Frontend, backend, AI engineering agents
│   ├── design/          # UI/UX design and template creation agents
│   ├── marketing/       # Growth, content, and social media agents
│   ├── product/         # Product management and research agents
│   ├── project-management/ # Coordination and delivery agents
│   ├── studio-operations/  # Business operations agents
│   └── testing/         # Quality assurance and testing agents
└── README.md            # Project overview
```

### Agent-Based Development Reference
All development work uses specialized agents with embedded specifications:
- **Frontend Development**: `.claude/agents/engineering/frontend-developer.md` (Complete frontend specs)
- **Backend Development**: `.claude/agents/engineering/backend-architect.md` (Complete backend & API specs)
- **AI Features**: `.claude/agents/engineering/ai-engineer.md` (Complete AI integration specs)
- **UI/UX Design**: `.claude/agents/design/ui-designer.md` (Complete template & design specs)
- **Project Coordination**: `.claude/agents/project-management/studio-producer.md` (Complete project specs)

## 🏗️ ENHANCED AGILE DEVELOPMENT WORKFLOW

### Agent-Based Team Structure
```
AI Marketing Web Builder Platform
├── Engineering Agents
│   ├── frontend-developer.md       # React, Next.js, drag-drop builder
│   ├── backend-architect.md        # FastAPI, workflows, CRM
│   ├── ai-engineer.md             # GPT-4, Claude, AI customization
│   ├── mobile-app-builder.md      # React Native, mobile experience
│   └── devops-automator.md        # CI/CD, deployment, infrastructure
├── Design Agents  
│   ├── ui-designer.md             # 30+ templates, component library
│   ├── ux-researcher.md           # User testing, journey optimization
│   └── brand-guardian.md          # Brand consistency, guidelines
├── Product & Management Agents
│   ├── studio-producer.md         # Cross-team coordination, Magic Moment
│   ├── sprint-prioritizer.md      # 6-day cycle planning
│   └── project-shipper.md         # Launch coordination, go-to-market
└── Specialized Agents
    ├── marketing/ (7 agents)       # Growth, social media, content
    ├── studio-operations/ (5 agents) # Analytics, finance, support
    └── testing/ (5 agents)        # QA, performance, API testing
```

### Role Definitions

#### Studio Producer Agent (Project Coordination)
**Primary Responsibilities:**
- Coordinate cross-team delivery of the Magic Moment functionality
- Manage agent specialization and resource allocation
- Ensure smooth handoffs between engineering, design, and AI agents
- Monitor progress toward AI Marketing Web Builder platform goals
- Facilitate 6-day sprint cycles with agent-specific priorities
- Maintain GitHub Project board (Ready/In Progress/Review/Done columns)
- Create tasks from specifications in `/spec` and `/agents` folder
- Ensure Ready column has 5-10 actionable tasks
- Monitor team velocity and remove blockers
- Enforce 5-minute maximum work periods without progress updates


**Token Limit**: 3-5k tokens per task creation session
**Communication**: Direct updates to Orchestrator every 30 minutes

#### Engineering Agents (Development Authority)
**Primary Responsibilities:**
- Frontend Agent: Drag-drop builder, 30+ templates, AI customization UI
- Backend Agent: Workflow engine, CRM, APIs, Magic Connector backend
- AI Agent: Component analysis, workflow suggestions, v0-style editing
- Each agent has complete specifications and implementation authority

**Integration Focus**: Cross-agent coordination for Magic Moment functionality
**Performance Targets**: <30min template-to-site, >80% AI success rate

#### Design Agents (Visual Authority)
**Primary Responsibilities:**
- UI Designer: 30+ premium templates across 6 categories, component library
- UX Researcher: User journey optimization, Magic Moment validation
- Brand Guardian: Visual consistency, template customization guidelines
- Each agent maintains design system integrity

**Quality Focus**: Mobile-first responsive design, AI-customizable components
**Success Metrics**: 95% Lighthouse score, <3s template loading

#### Specialized Support Agents
**Primary Responsibilities:**
- Marketing Agents: Growth, social media, app store optimization
- Operations Agents: Analytics, finance, infrastructure, support
- Testing Agents: QA, performance benchmarking, API testing
- Each agent provides domain expertise when needed

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

## 🔒 AGENT ISOLATION & BRANCH MANAGEMENT SYSTEM

### Critical Problem Solved
**BEFORE**: Multiple agents working on same branch → merge conflicts, lost work, confusion
**AFTER**: Each agent works in isolation → clean merges, parallel development, zero conflicts

### Agent Branch Isolation Rules (MANDATORY)

#### 1. Branch Naming Convention (STRICT)
```bash
{agent-type}/{agent-name}/{feature-description}

# Agent Type Categories:
frontend/     # Frontend development
backend/      # Backend APIs and services
template/     # Template design and creation
ai/           # AI services and integrations
integration/  # System integrations
performance/  # Performance optimizations
workflow/     # Workflow automation
deployment/   # Deployment and DevOps

# Examples:
frontend/frontend-builder/drag-drop-improvements
backend/backend-architect/user-authentication-api
template/template-designer/saas-templates-batch-3
ai/ai-services-specialist/component-suggestions-v2
```

#### 2. File Ownership Matrix (CONFLICT PREVENTION)

**Frontend Builder Agent**
- **Primary**: `web-builder/src/components/builder/`
- **Primary**: `web-builder/src/components/ui/`
- **Secondary**: `web-builder/src/hooks/`
- **Secondary**: `web-builder/src/lib/`
- **RESTRICTED**: Backend files, API routes

**Backend Architect Agent**
- **Primary**: `backend/` (entire directory)
- **Primary**: `web-builder/src/app/api/`
- **Secondary**: Database migrations, configs
- **RESTRICTED**: Frontend components, UI files

**Template Designer Agent**
- **Primary**: `web-builder/src/components/templates/`
- **Primary**: `web-builder/src/lib/templates/`
- **Primary**: `web-builder/src/data/templates/`
- **Secondary**: Template-related components
- **RESTRICTED**: Core builder logic, APIs

**AI Services Specialist Agent**
- **Primary**: `web-builder/src/lib/ai/`
- **Primary**: AI-related API routes
- **Secondary**: AI integration components
- **RESTRICTED**: Non-AI related files

**Integration Coordinator Agent**
- **Primary**: Integration-specific components
- **Primary**: Workflow connection logic
- **Secondary**: API integration files
- **RESTRICTED**: Core UI components

**Performance Optimizer Agent**
- **Primary**: Performance-related utilities
- **Primary**: Optimization configurations
- **Secondary**: Component performance fixes
- **RESTRICTED**: New feature development

**Workflow Automation Expert Agent**
- **Primary**: Workflow automation logic
- **Primary**: Automation API endpoints
- **Secondary**: Workflow UI components
- **RESTRICTED**: Non-workflow features

**Deployment Manager Agent**
- **Primary**: Deployment configurations
- **Primary**: CI/CD pipelines
- **Primary**: Infrastructure files
- **RESTRICTED**: Application code

#### 3. Branch Creation Protocol

```bash
# STEP 1: Identify your agent type and current main branch
git checkout main
git pull origin main

# STEP 2: Create isolated branch with agent prefix
git checkout -b {agent-type}/{agent-name}/{feature-description}

# Examples:
git checkout -b frontend/frontend-builder/component-library-fixes
git checkout -b backend/backend-architect/user-auth-endpoints
git checkout -b template/template-designer/ecommerce-templates

# STEP 3: Push and set upstream
git push -u origin {agent-type}/{agent-name}/{feature-description}
```

#### 4. File Modification Rules (PREVENT CONFLICTS)

**BEFORE MODIFYING ANY FILE:**
1. **Check File Ownership Matrix** - Is this file in your domain?
2. **Search for Recent Changes** - Has another agent modified this recently?
3. **Coordinate if Necessary** - If file is shared, coordinate with other agent
4. **Document Changes** - Clear commit messages with agent prefix

**Agent Commit Message Format:**
```
[AGENT-NAME] Brief description of change

- Specific change 1
- Specific change 2
- Files modified: list of files

# Examples:
[FRONTEND-BUILDER] Fix drag-drop performance issues
[BACKEND-ARCHITECT] Add user authentication endpoints
[TEMPLATE-DESIGNER] Create SaaS template collection
```

#### 5. Pull Request Protocol (AGENT ISOLATION)

**PR Title Format:**
```
[{AGENT-NAME}] Feature: Brief description

# Examples:
[FRONTEND-BUILDER] Feature: Improved component library UI
[BACKEND-ARCHITECT] Feature: User authentication system
[TEMPLATE-DESIGNER] Feature: Premium SaaS templates
```

**PR Description Template:**
```markdown
## Agent: {AGENT-NAME}
## Branch: {agent-type}/{agent-name}/{feature-description}

### Changes Made
- [ ] Change 1
- [ ] Change 2
- [ ] Change 3

### Files Modified
- `path/to/file1.tsx`
- `path/to/file2.ts`

### Agent Domain Compliance
- [ ] All files are within my agent domain
- [ ] No conflicts with other agent work
- [ ] Followed file ownership matrix

### Testing
- [ ] Local testing completed
- [ ] No breaking changes
- [ ] Performance impact assessed

### Merge Requirements
- [ ] Ready for 5-minute review
- [ ] No merge conflicts
- [ ] Agent isolation maintained
```

#### 6. Merge Conflict Prevention System

**Daily Branch Sync Protocol:**
```bash
# Every morning before starting work:
git checkout main
git pull origin main
git checkout {your-agent-branch}
git rebase main

# If conflicts arise:
1. Check if conflicting files are in your domain
2. If NOT in your domain → coordinate with owning agent
3. If in your domain → resolve and continue
4. Document resolution in commit message
```

**Shared File Coordination:**
For files that multiple agents need to modify:
1. **Create Shared Branch**: `shared/{feature-name}`
2. **Collaborate in Real-time**: Both agents work together
3. **Quick Merge**: <2 hour collaboration window
4. **Individual PRs**: Separate PRs from shared branch

#### 7. Agent Handoff Procedures

**When Agent A needs Agent B to continue work:**

```bash
# Agent A completes their part
git checkout agent-a/work-branch
git push origin agent-a/work-branch

# Agent A creates handoff branch
git checkout -b handoff/agent-a-to-agent-b/feature-name
git push -u origin handoff/agent-a-to-agent-b/feature-name

# Agent B picks up work
git checkout handoff/agent-a-to-agent-b/feature-name
git checkout -b agent-b/agent-name/continue-feature
# Continue work...
```

**Handoff Documentation:**
```markdown
## Handoff: {Agent A} → {Agent B}
## Feature: {Feature Name}
## Branch: handoff/{agent-a}-to-{agent-b}/{feature-name}

### Work Completed by {Agent A}
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Remaining Work for {Agent B}
- [ ] Task 4
- [ ] Task 5
- [ ] Task 6

### Key Files
- `file1.tsx` - Completed by Agent A
- `file2.ts` - Needs Agent B work
- `file3.tsx` - Shared file, coordinate changes

### Dependencies
- API endpoint: /api/feature (Agent A)
- Frontend component: FeatureComponent (Agent B)
- Integration: WorkflowConnection (Agent B)

### Notes
- Specific implementation details
- Edge cases to consider
- Testing requirements
```

#### 8. Emergency Conflict Resolution

**If Merge Conflicts Occur Despite Isolation:**

1. **STOP ALL WORK** on conflicted files
2. **Identify Conflict Owner** via file ownership matrix
3. **Coordinate Resolution** in <30 minutes
4. **Document Resolution** in shared commit
5. **Update Ownership Matrix** if needed

**Escalation Protocol:**
- **Level 1**: Direct agent-to-agent coordination (30 min)
- **Level 2**: Lead Developer intervention (15 min)
- **Level 3**: Orchestrator decision (5 min)

#### 9. Branch Cleanup Protocol

**After PR Merge:**
```bash
# Delete local branch
git branch -d {agent-type}/{agent-name}/{feature-name}

# Delete remote branch
git push origin --delete {agent-type}/{agent-name}/{feature-name}

# Update local main
git checkout main
git pull origin main
```

**Weekly Branch Audit:**
- Remove stale agent branches
- Update file ownership matrix
- Review conflict patterns
- Adjust agent domains if needed

### Agent Isolation Success Metrics

**Zero-Conflict Goals:**
- 0 merge conflicts per sprint
- <5 minute PR review times
- 100% agent domain compliance
- <2 hour handoff completion

**Monitoring Dashboard:**
- Branch creation per agent
- File modification patterns
- Conflict frequency by agent
- Handoff success rate

This agent isolation system ensures **parallel development without conflicts**, **clear ownership boundaries**, and **efficient collaboration when needed**.