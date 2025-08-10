# Enhanced Agent Workflows with GitHub Project Integration

## 🔄 **MANDATORY GITHUB PROJECT WORKFLOW**

All agents must follow this enhanced workflow that includes GitHub Project tracking at every step. This prevents orphaned components and ensures complete visibility.

### **📋 GitHub Project Boards**
- **Frontend Project #10**: https://github.com/users/gpb360/projects/10
- **Backend Project #11**: https://github.com/users/gpb360/projects/11  
- **Design Project #12**: https://github.com/users/gpb360/projects/12

## 🚨 **UPDATED AGENT ISOLATION WORKFLOW (MANDATORY)**

**EVERY AGENT** must follow this exact protocol - no exceptions:

```
1. CHECK GitHub Project board assigned to your agent type
2. PICK available task from Ready column matching your domain
3. VERIFY task is linked to GitHub issue with acceptance criteria  
4. CREATE ISOLATED branch: {agent-type}/{agent-name}/{feature-description}
5. MOVE task to "In Progress" + add assigned:{agent-name} label
6. WORK ONLY on files within your agent domain (see File Ownership Matrix)
7. CODE + commit + push to isolated branch
8. CREATE PR with agent prefix: "[{AGENT-NAME}] Task Title"
9. LINK PR to GitHub issue in PR description: "Closes #issue-number"
10. MOVE task to "Ready for Review" column
11. WAIT for Lead Dev review (5min max) + merge
12. Lead Dev moves task to "Done" column automatically
```

**CRITICAL**: Each agent MUST link PRs to GitHub issues for complete traceability

### **📊 Task Selection Protocol**

#### **1. Check Your Project Board**
Before starting ANY work:
```bash
# Frontend agents check:
gh project list --owner gpb360  # Verify project #10

# Backend agents check:  
gh project list --owner gpb360  # Verify project #11

# Design agents check:
gh project list --owner gpb360  # Verify project #12
```

#### **2. Select Task from Ready Column**
- **Frontend agents**: Only pick tasks from Frontend Project #10 Ready column
- **Backend agents**: Only pick tasks from Backend Project #11 Ready column  
- **Design agents**: Only pick tasks from Design Project #12 Ready column
- **Integration agents**: Pick from Frontend Project #10 (integration tasks default here)

#### **3. Verify Task Completeness**
Every task must have:
- ✅ Clear title with story number (e.g., "Story 3.2: Create SmartTemplateSelector")
- ✅ Detailed description with acceptance criteria
- ✅ Proper labels (story-X.X, frontend/backend/design)
- ✅ Estimated duration and complexity
- ✅ Agent assignment guidance

## 🎯 **Agent-Specific Enhanced Workflows**

### **Frontend Developer Enhanced Workflow**

```
ENHANCED FRONTEND WORKFLOW:
1. Visit: https://github.com/users/gpb360/projects/10
2. Select task from Ready column with "frontend" label
3. Verify GitHub issue has complete acceptance criteria
4. Create branch: frontend/frontend-developer/task-name-kebab-case
5. Move GitHub issue to "In Progress" status
6. Add issue comment: "🔄 Started development - Agent: frontend-developer"
7. Implement according to acceptance criteria
8. Write tests for all new components/hooks
9. Commit with message: "[FRONTEND-DEVELOPER] Implement {feature}"
10. Push branch: git push -u origin frontend/frontend-developer/task-name
11. Create PR: gh pr create --title "[FRONTEND-DEVELOPER] Story X.X: Task Title" 
                              --body "Closes #{issue-number}"
12. Move GitHub issue to "Ready for Review" 
13. Add issue comment: "✅ Implementation complete - PR created"
```

**Frontend File Ownership (STRICT)**:
- **Primary**: `web-builder/src/components/builder/`
- **Primary**: `web-builder/src/components/ui/`
- **Primary**: `web-builder/src/hooks/`
- **Primary**: `web-builder/src/lib/client/`
- **Secondary**: `web-builder/src/lib/` (shared utilities)
- **RESTRICTED**: Backend files, API routes, design assets

### **Backend Architect Enhanced Workflow**

```
ENHANCED BACKEND WORKFLOW:
1. Visit: https://github.com/users/gpb360/projects/11
2. Select task from Ready column with "backend" label  
3. Verify GitHub issue has API specifications and requirements
4. Create branch: backend/backend-architect/task-name-kebab-case
5. Move GitHub issue to "In Progress" status
6. Add issue comment: "🔄 Started development - Agent: backend-architect"
7. Implement API/service according to specifications
8. Write comprehensive tests (unit + integration)
9. Update API documentation if applicable
10. Commit with message: "[BACKEND-ARCHITECT] Implement {feature}"
11. Push branch: git push -u origin backend/backend-architect/task-name
12. Create PR: gh pr create --title "[BACKEND-ARCHITECT] Story X.X: Task Title"
                              --body "Closes #{issue-number}"
13. Move GitHub issue to "Ready for Review"
14. Add issue comment: "✅ Implementation complete - PR created"
```

**Backend File Ownership (STRICT)**:
- **Primary**: `backend/` (entire directory)
- **Primary**: `web-builder/src/app/api/`
- **Secondary**: Database migrations, configuration files
- **RESTRICTED**: Frontend components, UI files, design assets

### **UI Designer Enhanced Workflow**

```
ENHANCED DESIGN WORKFLOW:
1. Visit: https://github.com/users/gpb360/projects/12
2. Select task from Ready column with "design" label
3. Verify GitHub issue has design specifications and requirements  
4. Create branch: design/ui-designer/task-name-kebab-case
5. Move GitHub issue to "In Progress" status
6. Add issue comment: "🎨 Started design work - Agent: ui-designer"
7. Create templates/components according to design system
8. Ensure mobile-first responsive design
9. Test across different screen sizes and devices
10. Commit with message: "[UI-DESIGNER] Create {design-element}"
11. Push branch: git push -u origin design/ui-designer/task-name
12. Create PR: gh pr create --title "[UI-DESIGNER] Story X.X: Task Title"
                              --body "Closes #{issue-number}"
13. Move GitHub issue to "Ready for Review"
14. Add issue comment: "✅ Design complete - PR created"
```

**Design File Ownership (STRICT)**:
- **Primary**: `web-builder/src/components/templates/`
- **Primary**: `web-builder/src/lib/templates/`
- **Primary**: `design/` directory (if exists)
- **Secondary**: Template-related styling and assets
- **RESTRICTED**: Core application logic, APIs, non-design files

### **Integration Coordinator Enhanced Workflow**

```
ENHANCED INTEGRATION WORKFLOW:
1. Visit: https://github.com/users/gpb360/projects/10 (integration tasks default here)
2. Select task from Ready column with "integration" label
3. Verify GitHub issue has cross-system requirements
4. Create branch: integration/integration-coordinator/task-name-kebab-case  
5. Move GitHub issue to "In Progress" status
6. Add issue comment: "🔗 Started integration work - Agent: integration-coordinator"
7. Coordinate between multiple systems/components
8. Ensure end-to-end functionality works
9. Write integration tests
10. Commit with message: "[INTEGRATION-COORDINATOR] Integrate {systems}"
11. Push branch: git push -u origin integration/integration-coordinator/task-name
12. Create PR: gh pr create --title "[INTEGRATION-COORDINATOR] Story X.X: Task Title"
                              --body "Closes #{issue-number}"
13. Move GitHub issue to "Ready for Review" 
14. Add issue comment: "✅ Integration complete - PR created"
```

## 📈 **Progress Tracking Requirements**

### **Mandatory Issue Updates**
All agents must update GitHub issues at these milestones:

1. **Task Start**: Add comment "🔄 Started development - Agent: {agent-name}"
2. **50% Complete**: Add comment "⏳ 50% complete - {brief progress update}"
3. **Blocked**: Add comment "🚫 BLOCKED - {reason and needed help}"
4. **PR Created**: Add comment "✅ Implementation complete - PR created"

### **Status Column Management**
- **Ready**: Tasks available for pickup
- **In Progress**: Currently being worked on (move here when starting)
- **Ready for Review**: PR created and awaiting review (move here when PR created)
- **Done**: PR merged and complete (Lead Dev moves here)

## 🔗 **PR-to-Issue Linking (MANDATORY)**

### **Required PR Description Format**
```markdown
## Story Connection
Closes #{issue-number}

## Implementation Summary
- [x] Acceptance Criteria 1
- [x] Acceptance Criteria 2  
- [x] Acceptance Criteria 3

## Testing
- [x] Unit tests passing
- [x] Integration tests passing
- [x] Manual testing complete

## Agent Verification
- **Agent**: {agent-name}
- **Files Modified**: List of files
- **Domain Compliance**: ✅ All files within agent domain
```

### **GitHub Issue Linking Commands**
```bash
# When creating PR, use one of these formats in PR body:
"Closes #123"          # Closes issue when PR merges
"Fixes #123"           # Fixes issue when PR merges  
"Resolves #123"        # Resolves issue when PR merges

# Multiple issues:
"Closes #123, closes #124"
```

## 🚨 **Quality Gates & Enforcement**

### **Pre-Work Checklist**
Before starting ANY task:
- [ ] GitHub issue exists and is assigned to me
- [ ] Issue has complete acceptance criteria
- [ ] Issue is in correct project board for my agent type
- [ ] Issue is in "Ready" column
- [ ] I understand all requirements

### **Pre-PR Checklist** 
Before creating PR:
- [ ] All acceptance criteria implemented
- [ ] Tests written and passing
- [ ] Code follows domain ownership rules
- [ ] Commit messages follow format
- [ ] Ready to link to GitHub issue

### **Post-PR Checklist**
After creating PR:
- [ ] PR description includes "Closes #{issue-number}"
- [ ] GitHub issue moved to "Ready for Review"
- [ ] Issue comment added confirming completion
- [ ] All CI/CD checks are passing

## 🎛️ **Automation Helpers**

### **Quick Commands for Agents**

```bash
# Check your project board tasks
gh project item-list {project-id} --owner gpb360

# Create PR with issue linking
gh pr create --title "[AGENT-NAME] Story X.X: Task Title" \
             --body "Closes #123

## Implementation Summary
{summary}

## Testing
- [x] All tests passing"

# Add issue comment  
gh issue comment {issue-number} --repo gpb360/AI-Marketing-Web-Builder \
                                --body "✅ Implementation complete - PR created"

# Check issue status
gh issue view {issue-number} --repo gpb360/AI-Marketing-Web-Builder
```

## 📊 **Success Metrics**

### **Agent Performance Indicators**
- **Task Completion Rate**: % of picked tasks completed successfully  
- **PR-to-Issue Linking**: 100% required compliance
- **Domain Compliance**: 0 violations of file ownership rules
- **Quality Gates**: All checklist items completed

### **Project Health Indicators**
- **Orphaned Components**: 0 components without GitHub issue tracking
- **Unlinked PRs**: 0 PRs without issue connections
- **Stale Tasks**: Tasks in "In Progress" for >2 days trigger review
- **Review Bottlenecks**: Tasks in "Ready for Review" for >1 day trigger escalation

This enhanced workflow ensures complete visibility, proper coordination, and zero orphaned components going forward. All agents must follow these protocols without exception.