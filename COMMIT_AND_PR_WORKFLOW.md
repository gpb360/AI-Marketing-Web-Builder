# Commit and Pull Request Workflow Documentation

## Overview

This document provides comprehensive guidance for the AI Marketing Web Builder commit and pull request workflow. The workflow integrates with GitHub MCP server and follows Archon workflow patterns to ensure code quality, maintain stability, and facilitate effective collaboration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Workflow Components](#workflow-components)
4. [Step-by-Step Guide](#step-by-step-guide)
5. [Conventional Commits](#conventional-commits)
6. [GitHub MCP Integration](#github-mcp-integration)
7. [Quality Checks](#quality-checks)
8. [Branch Protection](#branch-protection)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

## Prerequisites

### Required Tools

- **Git** - Version control system
- **Docker** - For GitHub MCP server
- **Node.js & pnpm** - For frontend development
- **Python 3.11+** - For backend development
- **PowerShell** - For Windows automation scripts

### Environment Setup

1. **GitHub Token**: Set `GITHUB_TOKEN` environment variable or in `.env` file
2. **Docker**: Ensure Docker is running for GitHub MCP server
3. **Project Dependencies**: Install frontend and backend dependencies

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/gpb360/AI-Marketing-Web-Builder.git
cd AI-Marketing-Web-Builder

# 2. Run the git configuration setup
powershell -ExecutionPolicy Bypass -File scripts/setup-git-config.ps1

# 3. Verify setup
git conventional  # Should show commit types
```

## Quick Start

### Option 1: Automated Workflow (Recommended)

```bash
# Make your changes, then run the complete workflow
powershell -ExecutionPolicy Bypass -File scripts/commit-and-pr-workflow.ps1
```

### Option 2: Manual Steps

```bash
# 1. Stage changes
git add .

# 2. Run pre-commit checks
powershell -ExecutionPolicy Bypass -File scripts/pre-commit-validation.ps1

# 3. Commit with conventional format
git commit -m "feat(auth): add JWT token validation"

# 4. Push branch
git push origin feature/auth-improvements

# 5. Create PR (manual or via GitHub MCP)
```

## Workflow Components

### 1. Commit and PR Workflow Script

**Location**: `scripts/commit-and-pr-workflow.ps1`

**Features**:
- Interactive conventional commit message generation
- Automated pre-commit validation
- GitHub MCP integration for PR creation
- Cross-platform support (PowerShell/Bash)

**Usage**:
```powershell
# Interactive mode
.\scripts\commit-and-pr-workflow.ps1

# With options
.\scripts\commit-and-pr-workflow.ps1 -TargetBranch develop -AutoCommit

# Skip PR creation
.\scripts\commit-and-pr-workflow.ps1 -SkipPR
```

### 2. Pre-commit Validation Script

**Location**: `scripts/pre-commit-validation.ps1`

**Checks**:
- File size validation (>10MB warning)
- Sensitive file detection
- Secret scanning in code
- Line length validation (120 chars)
- JSON format validation
- Frontend/backend specific checks
- Branch protection compliance

**Usage**:
```powershell
# Run all validation checks
.\scripts\pre-commit-validation.ps1

# Skip warnings prompt
.\scripts\pre-commit-validation.ps1 -SkipWarnings
```

### 3. Git Configuration Setup

**Location**: `scripts/setup-git-config.ps1`

**Configures**:
- Commit message template (`.gitmessage`)
- Git hooks (commit-msg, pre-commit)
- Helpful git aliases
- Project-specific settings

**Usage**:
```powershell
# Initial setup
.\scripts\setup-git-config.ps1

# Force overwrite existing config
.\scripts\setup-git-config.ps1 -Force
```

## Step-by-Step Guide

### 1. Setup (One-time)

```bash
# Configure git for the project
powershell -ExecutionPolicy Bypass -File scripts/setup-git-config.ps1

# Verify GitHub MCP server is available
docker images | findstr github-mcp-server

# Check environment variables
echo $env:GITHUB_TOKEN
```

### 2. Development Workflow

#### A. Start New Feature

```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/story-123-user-auth

# Verify branch naming follows convention
# Pattern: {type}/{identifier}-{description}
# Examples: feature/story-123-user-auth, hotfix/login-bug, ai-agent/claude/authentication-mvp
```

#### B. Make Changes

```bash
# Develop your feature
# Edit files, add functionality, write tests

# Check status frequently
git status
```

#### C. Commit Changes

```bash
# Option 1: Use automated workflow
powershell -ExecutionPolicy Bypass -File scripts/commit-and-pr-workflow.ps1

# Option 2: Manual process
git add .
git commit  # Uses .gitmessage template for guidance
```

#### D. Push and Create PR

```bash
# Push branch
git push origin feature/story-123-user-auth

# Create PR via GitHub MCP (automated in workflow script)
# Or manually via GitHub UI
```

### 3. Review and Merge

1. **Code Review**: Team reviews the PR
2. **Automated Checks**: CI/CD pipeline runs tests
3. **Approval**: Required approvals obtained
4. **Merge**: Merge to main branch
5. **Cleanup**: Delete feature branch

## Conventional Commits

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(auth): add JWT validation` |
| `fix` | Bug fix | `fix(api): resolve timeout error` |
| `docs` | Documentation | `docs: update API reference` |
| `style` | Formatting, no logic change | `style(ui): format button components` |
| `refactor` | Code restructuring | `refactor(db): optimize queries` |
| `perf` | Performance improvement | `perf(canvas): improve rendering` |
| `test` | Adding/updating tests | `test(auth): add login flow tests` |
| `build` | Build system changes | `build(deps): update dependencies` |
| `ci` | CI/CD changes | `ci: add deployment pipeline` |
| `chore` | Maintenance tasks | `chore: update .gitignore` |

### Scopes (Project-Specific)

**Frontend**:
- `ui`, `canvas`, `auth`, `templates`, `workflow`, `theme`, `components`, `hooks`, `api`, `routing`

**Backend**:
- `api`, `auth`, `database`, `services`, `workflows`, `ai`, `crm`, `templates`, `publishing`, `analytics`

**Infrastructure**:
- `docker`, `deploy`, `ci`, `docs`, `scripts`, `tests`, `security`, `monitoring`

### Examples

```bash
# New feature
feat(auth): implement JWT token refresh mechanism

# Bug fix with scope
fix(canvas): resolve drag and drop positioning issue

# Breaking change
feat(api)!: remove deprecated v1 endpoints

BREAKING CHANGE: The v1 API endpoints have been removed.
Please upgrade to v2 endpoints. See migration guide for details.

# Documentation update
docs(README): add installation instructions for Windows

# Performance improvement
perf(database): add indexes for user queries

# Test addition
test(workflow): add integration tests for magic connector
```

## GitHub MCP Integration

### Configuration

The GitHub MCP server is configured in `web-builder/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "--env", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server:latest"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### Available Operations

**Note**: Always use GitHub MCP tools, never direct GitHub API calls.

- `list_pull_requests(owner, repo, state)` - List PRs
- `get_pull_request(owner, repo, pullNumber)` - Get PR details  
- `create_pull_request(owner, repo, title, head, base, body)` - Create PR
- `merge_pull_request(owner, repo, pullNumber)` - Merge PR

### PR Template

When creating PRs via GitHub MCP, use this template:

```markdown
## Summary
Brief description of changes made in this PR.

## Changes
- List of specific changes
- Use bullet points for clarity
- Include any breaking changes

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] E2E tests pass (if applicable)

## Checklist
- [x] Code follows project conventions
- [x] Commit messages follow conventional commit format
- [x] Pre-commit checks passed
- [ ] Documentation updated (if needed)
- [ ] Breaking changes documented (if any)

## Archon Integration
- Branch: `feature/story-123-description`
- Agent: frontend-developer
- Task Status: Ready for Review

---
*This PR was created using the GitHub MCP workflow.*
```

## Quality Checks

### Pre-commit Validation

The pre-commit validation script performs comprehensive checks:

#### File and Security Checks
- **File Size**: Warns about files >10MB
- **Sensitive Files**: Detects `.env`, `.key`, `.pem`, etc.
- **Secret Scanning**: Searches for API keys, tokens, passwords
- **Line Length**: Validates 120 character limit

#### Code Quality Checks
- **JSON Validation**: Ensures JSON files are valid
- **TODO Comments**: Reports TODO/FIXME/HACK comments
- **TypeScript**: Type checking (if configured)
- **Linting**: ESLint/Flake8 validation

#### Project-Specific Checks
- **Frontend**: pnpm lockfile consistency, TypeScript compilation
- **Backend**: Virtual environment, Python requirements, MyPy
- **Branch Protection**: Prevents direct commits to main

### Handling Validation Failures

#### Errors (Must Fix)
```bash
[ERROR] Potentially sensitive files detected:
  - config/secrets.env
[ERROR] Please remove sensitive files or add them to .gitignore
```

**Action**: Fix the issue before committing.

#### Warnings (Can Continue)
```bash
[WARNING] Large file detected: assets/video.mp4 (15MB)
[WARNING] Line longer than 120 characters found: src/utils.js:45
```

**Action**: Address if possible, or continue with confirmation.

### Quality Gates

1. **Pre-commit**: File validation, security scanning
2. **Commit Message**: Conventional commit format
3. **Pre-push**: Branch isolation, conflict detection
4. **CI/CD**: Automated tests, build verification
5. **Code Review**: Team review and approval

## Branch Protection

### Naming Conventions

Follow these patterns for branch names:

```bash
# Agent-based development
{agent-type}/{agent-name}/{feature-description}
# Examples:
frontend/frontend-developer/story-3.3-analytics
backend/backend-architect/workflow-debugging
ai-services/ai-engineer/component-suggestions

# Feature development
feature/{story-number}-{description}
# Examples:
feature/3.3-analytics-dashboard
feature/auth-improvements

# Maintenance
hotfix/{description}
bugfix/{description}
chore/{description}
```

### Main Branch Protection

Direct commits to `main` are prohibited:

```bash
[ERROR] Direct commits to main are not allowed
[ERROR] Create a feature branch and submit a pull request
```

**Required for Main Branch**:
- Pull request with review
- All status checks passing
- Up-to-date with main
- Linear history (no merge commits)

### Pre-push Validation

The pre-push hook performs agent isolation checks:

```bash
🔒 Agent Branch Isolation Compliance Checker
=================================================

Running Checks:
📝 Checking branch naming convention...
📂 Checking file ownership compliance...
⚔️  Checking for potential conflicts with other agents...

❌ PUSH BLOCKED: Agent isolation compliance failed
```

## Troubleshooting

### Common Issues

#### 1. GitHub MCP Server Issues

**Problem**: MCP server not found or connection failed
```bash
[ERROR] Docker is not running! GitHub MCP server requires Docker.
```

**Solutions**:
- Start Docker Desktop
- Pull latest MCP image: `docker pull ghcr.io/github/github-mcp-server:latest`
- Check GITHUB_TOKEN environment variable

#### 2. Pre-commit Hook Failures

**Problem**: Pre-commit hook execution fails
```bash
error: cannot spawn .git/hooks/pre-commit: No such file or directory
```

**Solutions**:
- Run setup script: `.\scripts\setup-git-config.ps1`
- Manually create hooks with proper permissions
- Use `--no-verify` flag as temporary bypass

#### 3. Commit Message Validation

**Problem**: Commit message doesn't follow conventional format
```bash
[ERROR] ❌ Commit message does not follow conventional commit format!
```

**Solutions**:
- Use the commit template: `git config commit.template .gitmessage`
- Follow conventional commit pattern: `type(scope): description`
- Use `git commit --amend` to fix message

#### 4. Branch Naming Issues

**Problem**: Branch name doesn't follow conventions
```bash
[WARNING] Branch name 'my-feature' doesn't follow standard conventions
```

**Solutions**:
- Rename branch: `git branch -m feature/story-123-my-feature`
- Follow naming patterns documented above
- Use descriptive, kebab-case names

#### 5. Large File Warnings

**Problem**: Files exceed size limits
```bash
[WARNING] Large file detected: assets/video.mp4 (15MB)
```

**Solutions**:
- Use Git LFS for large files: `git lfs track "*.mp4"`
- Move large files to external storage
- Compress files if possible
- Add to `.gitignore` if not needed in repository

### Recovery Procedures

#### Failed Commit Recovery

```bash
# If commit failed, fix issues and retry
git status
# Fix the reported issues
git add .
git commit --amend

# Or start over
git reset --soft HEAD~1
# Make fixes and commit again
```

#### Push Rejection Recovery

```bash
# If push was rejected due to validation
git log --oneline -5  # Check recent commits
# Fix branch name or conflicts
git checkout -b feature/story-123-proper-name
git push origin feature/story-123-proper-name
```

#### Hook Issues Recovery

```bash
# Bypass hooks temporarily (use sparingly)
git commit --no-verify -m "fix: emergency commit"
git push --no-verify origin branch-name

# Then fix the underlying issues
.\scripts\setup-git-config.ps1 -Force
```

## Best Practices

### Development Workflow

1. **Start with Planning**
   - Create clear, descriptive branch names
   - Understand the scope of changes
   - Plan commit structure in advance

2. **Commit Frequently**
   - Make small, focused commits
   - Each commit should represent a logical unit
   - Use conventional commit format consistently

3. **Quality First**
   - Run pre-commit checks before committing
   - Fix errors immediately, address warnings
   - Write tests for new functionality

4. **Clear Communication**
   - Write descriptive commit messages
   - Use PR descriptions to explain context
   - Document breaking changes clearly

### Code Quality

1. **Pre-commit Validation**
   ```bash
   # Always run validation before committing
   .\scripts\pre-commit-validation.ps1
   ```

2. **Type Safety**
   ```bash
   # Frontend type checking
   cd web-builder && pnpm run type-check
   
   # Backend type checking
   cd backend && mypy .
   ```

3. **Testing**
   ```bash
   # Run tests before committing
   cd web-builder && pnpm test
   cd backend && python -m pytest
   ```

### Collaboration

1. **Branch Management**
   - Keep feature branches short-lived
   - Rebase on main frequently
   - Delete merged branches promptly

2. **Code Review**
   - Request reviews early and often
   - Respond to feedback constructively
   - Test reviewed changes locally

3. **Documentation**
   - Update README when adding features
   - Document API changes
   - Keep commit messages informative

### Automation Usage

1. **Workflow Scripts**
   ```bash
   # Use automation for consistency
   .\scripts\commit-and-pr-workflow.ps1
   
   # Configure git properly
   .\scripts\setup-git-config.ps1
   ```

2. **GitHub MCP Integration**
   - Always use GitHub MCP tools for GitHub operations
   - Never use direct GitHub API calls
   - Ensure Docker is running for MCP server

3. **Continuous Improvement**
   - Monitor workflow metrics
   - Update scripts based on team feedback
   - Keep documentation current

### Security Considerations

1. **Secret Management**
   - Never commit secrets or API keys
   - Use environment variables for sensitive data
   - Regularly rotate tokens and keys

2. **Access Control**
   - Use minimal required permissions for tokens
   - Enable branch protection rules
   - Require reviews for sensitive changes

3. **Audit Trail**
   - Maintain clear commit history
   - Use conventional commits for tracking
   - Document security-related changes

## Advanced Usage

### Custom Workflow Integration

You can integrate the workflow with your IDE or other tools:

```json
// VS Code tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Commit and PR Workflow",
      "type": "shell",
      "command": "powershell",
      "args": ["-ExecutionPolicy", "Bypass", "-File", "scripts/commit-and-pr-workflow.ps1"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}
```

### CI/CD Integration

The workflow integrates with GitHub Actions:

```yaml
# .github/workflows/validate-pr.yml
name: PR Validation
on:
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate Conventional Commits
        run: |
          # Validate all commits in PR follow conventional format
          git log --oneline ${{ github.event.pull_request.base.sha }}..${{ github.event.pull_request.head.sha }} | 
          while read commit; do
            # Validation logic here
          done
```

### Metrics and Monitoring

Track workflow effectiveness:

- **Commit Quality**: Percentage of commits following conventional format
- **PR Velocity**: Time from branch creation to merge
- **Error Rates**: Pre-commit check failure rates
- **Code Coverage**: Test coverage trends

## Conclusion

This workflow provides a comprehensive solution for maintaining code quality, consistency, and collaboration in the AI Marketing Web Builder project. By following these guidelines and using the provided tools, teams can ensure:

- ✅ Consistent commit message format
- ✅ Automated quality checks
- ✅ Secure development practices
- ✅ Efficient PR management
- ✅ Clear audit trails
- ✅ Effective team collaboration

For questions or improvements to this workflow, please create an issue or submit a PR following these same guidelines.

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-24  
**Maintainer**: AI IDE Agent System