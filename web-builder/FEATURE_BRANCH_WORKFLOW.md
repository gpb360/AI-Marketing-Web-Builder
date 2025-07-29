# Feature Branch Workflow - AI Marketing Web Builder

## 🎯 **New Development Protocol**

From now on, **every team member works in their own feature branch**. No more shared branches or direct commits to main.

## 📋 **Branch Naming Convention**

```
feature/{agent-role}/{task-description}

Examples:
- feature/frontend-builder/ai-customization-panel
- feature/backend-architect/user-authentication-api
- feature/template-designer/ecommerce-template
- feature/integration-coordinator/real-time-collaboration
- feature/ai-services-specialist/component-suggestions
```

## 🚀 **Workflow Steps**

### **1. Start New Feature**
```bash
# Always start from updated main
git checkout main
git pull origin main

# Create your feature branch
git checkout -b feature/your-agent-role/task-name

# Push and set upstream
git push -u origin feature/your-agent-role/task-name
```

### **2. Development Cycle**
```bash
# Work on your feature
# Make commits as you progress
git add .
git commit -m "Clear description of changes"

# Push regularly
git push origin feature/your-agent-role/task-name
```

### **3. Create Pull Request**
```bash
# When feature is complete, create PR via GitHub API or web interface
# PR Title: [AGENT-ROLE] Feature Description
# Example: "[Frontend-Builder] AI Customization Panel Implementation"
```

### **4. PR Review & Merge**
- **Reviewer**: You (as repo owner) review your own PR
- **Approval**: Approve if feature works and is complete
- **Merge**: Use "Squash and merge" to keep clean history
- **Cleanup**: Delete feature branch after merge

## 🛡️ **Branch Protection Rules**

### **main branch** (Protected)
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ No direct pushes allowed
- ✅ Force push disabled

### **feature branches** (Open)
- ✅ Direct pushes allowed
- ✅ Force push allowed (for rebasing)
- ✅ Anyone can create/delete

## 👥 **Agent-Specific Guidelines**

### **Frontend-Builder Agent**
- Branch: `feature/frontend-builder/{feature-name}`
- Focus: UI components, React components, TypeScript fixes
- Dependencies: Templates, API integration

### **Backend-Architect Agent**
- Branch: `feature/backend-architect/{feature-name}`
- Focus: FastAPI endpoints, database models, authentication
- Dependencies: Database migrations, API documentation

### **Template-Designer Agent**
- Branch: `feature/template-designer/{template-name}`
- Focus: New premium templates, design systems
- Dependencies: Component library, responsive design

### **Integration-Coordinator Agent**
- Branch: `feature/integration-coordinator/{integration-name}`
- Focus: Cross-system testing, workflow coordination
- Dependencies: All other agent outputs

### **AI-Services-Specialist Agent**
- Branch: `feature/ai-services/{feature-name}`
- Focus: AI model integration, component suggestions
- Dependencies: API endpoints, component data

### **Deployment-Manager Agent**
- Branch: `feature/deployment/{deployment-name}`
- Focus: CI/CD, infrastructure, production setup
- Dependencies: Complete application code

## 📊 **Quality Gates**

### **Before Creating PR**
- [ ] Feature works locally
- [ ] TypeScript compiles without errors
- [ ] No console errors or warnings
- [ ] Basic testing completed
- [ ] Code follows project conventions

### **PR Requirements**
- [ ] Clear title with agent role prefix
- [ ] Comprehensive description of what was built
- [ ] Screenshots/demo for UI changes
- [ ] Testing instructions included
- [ ] Breaking changes documented

### **Before Merging**
- [ ] All CI checks pass (when enabled)
- [ ] Code review completed
- [ ] No merge conflicts with main
- [ ] Feature branch is up to date

## 🔄 **Coordination Protocol**

### **Cross-Agent Dependencies**
When your feature depends on another agent's work:

1. **Check existing PRs** first - other agent may have already implemented
2. **Create interface/mock** if you need to proceed without waiting
3. **Comment on relevant PR** to coordinate integration
4. **Update your PR** once dependency is merged

### **Conflict Resolution**
If multiple agents modify same files:

1. **First to merge wins** - no conflicts
2. **Second agent rebases** their branch on updated main
3. **Resolve conflicts** in your feature branch
4. **Test integration** before creating PR

## 📈 **Progress Tracking**

### **Individual Agent Progress**
Each agent maintains their own todo list and tracks:
- Current feature branch
- Tasks completed this sprint
- Blockers and dependencies
- Next planned features

### **Team Coordination**
Weekly sync to review:
- Merged features
- Current feature branches
- Upcoming dependencies
- Integration testing needs

## 🎯 **Success Metrics**

- **Clean main branch** - always deployable
- **Fast feature delivery** - small, focused PRs
- **Minimal conflicts** - good coordination
- **High quality** - working features, no bugs
- **Clear history** - readable commit messages

## 🚨 **Emergency Protocols**

### **Hotfix Process**
For critical production fixes:
```bash
git checkout main
git checkout -b hotfix/critical-fix-name
# Make minimal fix
# Create PR immediately
# Merge without waiting
```

### **Main Branch Broken**
If main becomes unstable:
1. **Stop all feature development**
2. **Create emergency fix branch**
3. **Fix and merge immediately**
4. **All agents rebase feature branches**

---

## ✅ **Current Status**

**PR #13 Ready to Merge**: https://github.com/gpb360/AI-Marketing-Web-Builder/pull/13

This PR contains all critical fixes and makes the platform functional. Once merged, all future development follows this feature branch workflow.

**Next Steps:**
1. Merge PR #13 to get stable main branch
2. All agents create new feature branches from updated main
3. Begin parallel development on next priorities