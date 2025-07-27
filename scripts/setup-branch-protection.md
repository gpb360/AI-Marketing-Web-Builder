# Branch Protection Setup Guide

## GitHub Branch Protection Rules

To enforce the PR workflow and prevent direct pushes to main, set up these branch protection rules:

### 1. Navigate to Repository Settings
- Go to: `https://github.com/gpb360/AI-Marketing-Web-Builder/settings/branches`
- Click "Add rule" for the `main` branch

### 2. Branch Protection Rule Configuration

```yaml
Branch name pattern: main

Protection Rules:
✅ Require a pull request before merging
  ✅ Require approvals: 1
  ✅ Dismiss stale PR approvals when new commits are pushed
  ✅ Require review from code owners (if CODEOWNERS file exists)

✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  Required status checks:
    - lint-and-format
    - backend-checks  
    - build-frontend
    - playwright-tests
    - magic-moment-test
    - security-scan
    - pr-ready

✅ Require conversation resolution before merging

✅ Require signed commits (optional but recommended)

✅ Require linear history (prevents merge commits)

✅ Include administrators (applies rules to repo admins too)

❌ Allow force pushes (keep disabled for safety)
❌ Allow deletions (keep disabled for safety)
```

### 3. Additional Repository Settings

#### Actions Permissions
- Go to: `Settings > Actions > General`
- Set "Actions permissions" to: `Allow all actions and reusable workflows`
- Enable "Allow GitHub Actions to create and approve pull requests"

#### Branch Settings
- Go to: `Settings > General`
- Set default branch to: `main`
- Enable "Automatically delete head branches" after PR merge

## 4. Team Access Rules

### Collaborator Permissions
```yaml
Development Team:
  - Read: All team members
  - Write: Senior developers and team leads
  - Admin: Repository owner and project leads

Review Requirements:
  - At least 1 approval required
  - Code owner review (if applicable)
  - All automated checks must pass
```

## 5. Verification

After setting up branch protection, verify:

1. **Direct Push Blocked**: Try pushing directly to main (should fail)
```bash
git checkout main
echo "test" > test.txt
git add test.txt
git commit -m "test direct push"
git push origin main
# Should see: "remote: error: GH006: Protected branch update failed"
```

2. **PR Required**: Must create PR for any changes
```bash
git checkout -b test-branch
git push origin test-branch
# Create PR through GitHub UI
```

3. **Status Checks**: PR shows required checks
- All GitHub Actions workflows run
- Checks must pass before merge button activates

## 6. Emergency Access

### Bypass Protection (Emergency Only)
Repository admins can temporarily disable protection for critical hotfixes:

1. Go to branch protection settings
2. Temporarily disable "Include administrators"
3. Make emergency fix
4. Re-enable protection immediately

### Hotfix Process
```bash
# For critical production issues only
git checkout main
git checkout -b hotfix/critical-issue
# Make minimal fix
# Create PR with "HOTFIX" label for expedited review
```

## 7. Monitoring

### PR Metrics to Track
- Time from PR creation to merge
- Automated test success rate
- Code review turnaround time
- Main branch stability

### GitHub Insights
- Use repository insights to monitor:
  - Pull request activity
  - Contributor activity  
  - Code frequency
  - Dependency graph

---

This setup ensures code quality, prevents breaking changes, and maintains a stable main branch while allowing efficient development through the PR workflow.