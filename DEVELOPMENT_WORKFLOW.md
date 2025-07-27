# Development Workflow - AI Marketing Web Builder Platform

## 🔄 Pull Request Workflow

### Overview
All changes to the AI Marketing Web Builder Platform must go through Pull Requests (PRs) with automated testing and code review before merging to `main`. This ensures code quality, prevents breaking changes, and maintains platform stability.

## 🚀 Development Process

### 1. Feature Development
```bash
# Start from latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/magic-connector-improvements
# or
git checkout -b fix/ai-customization-performance
# or  
git checkout -b docs/update-deployment-guide
```

### 2. Development Guidelines
- **Commit Frequently**: Every 30 minutes during active development
- **Meaningful Commits**: Clear description of changes and business value
- **Test Locally**: Run tests before pushing
- **Follow Standards**: ESLint, TypeScript, Python code quality

```bash
# Good commit messages
git commit -m "feat: Add AI workflow suggestions for contact forms

- Implement GPT-4 integration for component analysis
- Add workflow template matching based on component type
- Include confidence scoring for suggestions
- Add fallback handling for API failures

Improves Magic Connector success rate to >70%"

git commit -m "fix: Resolve drag-drop performance with 100+ components

- Optimize React DnD render cycle
- Implement virtual scrolling for component list
- Add debouncing for position updates
- Cache component measurements

Reduces interaction latency from 2s to <100ms"
```

### 3. Pull Request Creation

#### When to Create a PR
- ✅ Feature is complete and tested locally
- ✅ All commits follow git discipline
- ✅ Code follows project standards
- ✅ Documentation is updated if needed

#### PR Title Format
```
<type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Adding/updating tests
- chore: Build process or auxiliary tool changes
```

#### PR Description Template
```markdown
## Summary
Brief description of changes and why they were made.

## Changes Made
- [ ] List of specific changes
- [ ] Technical implementations
- [ ] Files modified

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests passing
- [ ] Magic Moment journey tested
- [ ] Performance benchmarks met

## Performance Impact
- Response time: <measurement>
- Bundle size: <before/after>
- Memory usage: <impact>

## Screenshots/Videos
[Include for UI changes]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests added for new functionality
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## 🧪 Automated Quality Gates

### PR Checks (Required to Pass)
All PRs automatically run these checks:

#### 1. Code Quality
- **ESLint**: JavaScript/TypeScript linting
- **TypeScript**: Type checking
- **Ruff**: Python linting  
- **Black/isort**: Python formatting
- **MyPy**: Python type checking

#### 2. Build Verification
- **Frontend Build**: Next.js build success
- **Backend Setup**: FastAPI application starts
- **Dependency Check**: No conflicts or vulnerabilities

#### 3. Testing Suite
- **Playwright E2E**: Full browser testing
- **Magic Moment Test**: Critical user journey
- **Component Library**: Drag-drop functionality
- **AI Customization**: Performance benchmarks

#### 4. Security & Performance
- **Security Scan**: Vulnerability detection
- **Lighthouse CI**: Performance audit
- **Bundle Analysis**: Size and optimization

### Quality Standards
- ✅ **Magic Moment Journey**: <30 minutes template-to-live-site
- ✅ **AI Customization**: <5 seconds response time
- ✅ **Platform Response**: <2 seconds for user interactions
- ✅ **Component Performance**: 100+ components without degradation
- ✅ **Test Coverage**: 95% success rate for E2E tests

## 👥 Code Review Process

### Review Requirements
- **Minimum**: 1 approval required
- **Automatic**: All automated checks must pass
- **Reviewers**: Team leads or senior developers

### Review Guidelines

#### For Reviewers
Focus on:
- **Functionality**: Does it work as intended?
- **Code Quality**: Is it maintainable and readable?
- **Performance**: Does it meet our standards?
- **Security**: Are there any vulnerabilities?
- **Architecture**: Does it fit our design patterns?

#### Review Comments
```markdown
# Requesting Changes
❌ **Issue**: This function could cause memory leaks with large datasets.
**Suggestion**: Consider implementing pagination or virtual scrolling.
**Reference**: Similar pattern in `component-library.tsx` lines 45-60.

# Approving
✅ **Great work!** The AI customization performance improvements are excellent.
The <2s response time consistently meets our quality standards.

# Questions
❓ **Question**: Should we add error boundaries for the new AI components?
This could improve user experience if the AI service is temporarily unavailable.
```

### Review Checklist
- [ ] **Functionality**: Feature works as described
- [ ] **Tests**: Adequate test coverage
- [ ] **Performance**: Meets quality standards
- [ ] **Security**: No vulnerabilities introduced
- [ ] **Documentation**: Updated if necessary
- [ ] **Breaking Changes**: None or properly documented

## 🔀 Merge Process

### Merge Requirements
- ✅ All automated checks passing
- ✅ At least 1 approval from code reviewer
- ✅ No conflicts with main branch
- ✅ Branch is up to date

### Merge Strategy
**Squash and Merge** (Recommended)
- Keeps main branch history clean
- Combines feature commits into single commit
- Preserves PR description in commit message

```bash
# After PR approval, GitHub will squash merge:
feat: Add Magic Connector AI workflow suggestions (#23)

* Implement GPT-4 integration for component analysis
* Add workflow template matching based on component type  
* Include confidence scoring for suggestions
* Add fallback handling for API failures

Improves Magic Connector success rate to >70%
Closes #15, #18
```

### Post-Merge
- ✅ Branch automatically deleted
- ✅ Main branch tests run automatically
- ✅ Deployment pipeline triggered (future)
- ✅ Team notified of successful merge

## 🚨 Emergency Hotfixes

For critical production issues:

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-ai-service-error

# Make minimal fix
# Test thoroughly
# Create PR with "HOTFIX" label

# Expedited review process
# Merge immediately after approval
```

## 📊 Development Team Coordination

### Daily Development Rhythm
- **Morning Standup**: Review active PRs and blockers
- **Continuous**: Create PRs for completed features
- **Afternoon**: Code reviews and PR approvals
- **Evening**: Main branch testing and integration

### PR Management
- **Draft PRs**: Use for work in progress
- **Ready for Review**: All checks passing
- **Approved**: Ready to merge
- **Merged**: Feature complete

### Team Communication
```bash
# In tmux sessions, reference PRs:
"Working on PR #23 - Magic Connector improvements"
"Ready for review: PR #24 - AI performance optimization"
"Merged PR #22 - Component library expansion"
```

## 🎯 Quality Metrics

### Success Criteria
- **PR Merge Rate**: >95% of PRs merge successfully
- **Automated Test Pass Rate**: >98% on first run
- **Review Turnaround**: <24 hours average
- **Main Branch Stability**: 100% uptime
- **Feature Delivery**: Consistent velocity

### Monitoring
- GitHub Actions dashboard for test results
- PR analytics for review time
- Main branch health monitoring
- Performance regression tracking

## 🔧 Troubleshooting

### Common Issues

#### Failed PR Checks
```bash
# Fix linting issues
npm run lint --fix

# Fix TypeScript errors  
npx tsc --noEmit

# Fix Python formatting
black src/
isort src/

# Rerun tests locally
npm run test
```

#### Merge Conflicts
```bash
# Update branch with latest main
git checkout main
git pull origin main
git checkout feature-branch
git rebase main

# Resolve conflicts
# Push updated branch
git push --force-with-lease origin feature-branch
```

#### Failed E2E Tests
- Check Playwright report artifacts
- Review Magic Moment test results
- Verify performance benchmarks
- Test locally with `npm run test:headed`

---

**This workflow ensures high-quality, stable development while maintaining velocity and team coordination for the AI Marketing Web Builder Platform.** 🚀