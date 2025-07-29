# Developer Quick Reference Cards

## 🎯 FRONTEND DEVELOPER QUICK CARD

**Your Project Board**: https://github.com/users/gpb360/projects/10

**THE WORKFLOW (Never Deviate)**:
1. `Visit project board` → Pick Ready task
2. `git checkout -b feature/task-name-kebab-case`
3. `Move task to In Progress` + Add label `assigned:frontend-dev-X`
4. `Code + commit + push`
5. `Create PR` with exact task title
6. `Move task to Ready for Review`
7. Wait for Lead Dev merge

**Commands You Need**:
```bash
# Check tasks
gh project item-list 10 --owner gpb360

# Create branch
git checkout -b feature/fix-component-library-ui

# Commit work
git add -A && git commit -m "Fix component library UI styling"

# Push and create PR
git push -u origin feature/fix-component-library-ui
gh pr create --title "Fix Component Library UI" --body "Fixes styling issues in component library"
```

**Token Limit**: 5-8k per task | **Time Limit**: 2-3 hours max | **Check-in**: Every 30 minutes

---

## 🔧 BACKEND DEVELOPER QUICK CARD

**Your Project Board**: https://github.com/users/gpb360/projects/11

**THE WORKFLOW (Never Deviate)**:
1. `Visit project board` → Pick Ready task
2. `git checkout -b feature/task-name-kebab-case`
3. `Move task to In Progress` + Add label `assigned:backend-dev`
4. `Code + commit + push`
5. `Create PR` with exact task title
6. `Move task to Ready for Review`
7. Wait for Lead Dev merge

**Commands You Need**:
```bash
# Check tasks
gh project item-list 11 --owner gpb360

# Example branch names
feature/create-user-api-endpoints
feature/add-database-models
feature/implement-authentication

# Test backend
cd web-builder/backend
python -m pytest
```

**Token Limit**: 5-8k per task | **Time Limit**: 2-3 hours max | **Check-in**: Every 30 minutes

---

## 👑 LEAD DEVELOPER QUICK CARD

**Your Responsibility**: Review ALL PRs in 5 minutes maximum

**PR REVIEW PROTOCOL**:
1. `gh pr checkout [number]` (30 seconds)
2. `Scan code for security/quality` (2-3 minutes)
3. `Test basic functionality` (2-3 minutes)  
4. `gh pr review [number] --approve` OR `--request-changes` (30 seconds)
5. `gh pr merge [number]` if approved
6. `Move task to Done` in project board

**Review Commands**:
```bash
# Quick review workflow
gh pr list
gh pr checkout 123
npm run build  # Quick test
gh pr review 123 --approve --body "LGTM - tested and working"
gh pr merge 123

# If issues found
gh pr review 123 --request-changes --body "Fix XSS vulnerability in line 45"
```

**Token Limit**: 5-10k per review | **Time Limit**: 5 minutes MAX | **No Analysis Paralysis**

---

## 📋 PROJECT MANAGER QUICK CARD

**Your Boards**: Projects #10 (Frontend), #11 (Backend), #12 (Design)

**BACKLOG MONITORING (Every 30 minutes)**:
1. `Check Ready task count`
2. `If ≤5 tasks remaining → CREATE 10 NEW TASKS`
3. `Reference /spec folder for priorities`
4. `Never let developers run out of work`

**Commands You Need**:
```bash
# Check task counts
gh project item-list 10 --owner gpb360 | grep -c "Ready"
gh project item-list 11 --owner gpb360 | grep -c "Ready"

# Create new tasks when needed
gh project item-create 10 --owner gpb360 --title "New Frontend Task"
gh project item-create 11 --owner gpb360 --title "New Backend Task"

# Monitor team progress
gh pr list --repo gpb360/AI-Marketing-Web-Builder
```

**Token Limit**: 3-5k per session | **Backlog Rule**: Always maintain 5+ Ready tasks

---

## 🚨 EMERGENCY PROTOCOLS

**If Stuck**: Ask Senior Developer in your pod  
**If Spec Unclear**: Ask Project Manager  
**If Architecture Decision**: Ask Lead Developer  
**If Token Limit Exceeded**: STOP and report to Orchestrator immediately

**Branch Protection**:
- Never push directly to `main`
- Always create feature branches
- PR title must match task title exactly
- Add assigned labels when picking up tasks

**Progress Reporting Template**:
```
PROGRESS UPDATE - [ROLE] - [TIME]
Current Task: [Task from GitHub Project]
Status: [In Progress/Blocked/Complete]
ETA: [Realistic completion time]
Token Usage: [X/Y limit]
Next Action: [What you'll do next]
```