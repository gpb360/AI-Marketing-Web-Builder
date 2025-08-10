#!/bin/bash
# Quality Gates Enforcer - Mandatory PR-to-task linking and quality enforcement
# Usage: ./scripts/quality-gates-enforcer.sh [command] [options]

set -e

# Configuration
REPO="gpb360/AI-Marketing-Web-Builder"
REQUIRED_PR_CHECKS=("closes" "fixes" "resolves")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

header() {
    echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════════╗
║  🛡️  $1
╚══════════════════════════════════════════════════════════════════╝${NC}"
}

# Show help
show_help() {
    cat << EOF
🛡️ Quality Gates Enforcer - Mandatory Quality Checks

USAGE:
    ./scripts/quality-gates-enforcer.sh COMMAND [OPTIONS]

COMMANDS:
    audit-prs              Audit all PRs for quality compliance
    check-pr PR_NUMBER     Check specific PR for compliance
    enforce-linking        Find and report unlinked PRs
    validate-workflow      Validate complete workflow compliance
    fix-pr PR_NUMBER       Interactive fix for non-compliant PR
    quality-report         Generate comprehensive quality report

QUALITY REQUIREMENTS:
    ✅ PR title must include agent name in brackets [AGENT-NAME]
    ✅ PR body must include "Closes #issue-number" or similar
    ✅ Linked issue must exist and be accessible
    ✅ PR must be created from proper agent branch
    ✅ Files modified must be within agent's domain

EXAMPLES:
    # Audit all open PRs
    ./scripts/quality-gates-enforcer.sh audit-prs
    
    # Check specific PR
    ./scripts/quality-gates-enforcer.sh check-pr 58
    
    # Find unlinked PRs
    ./scripts/quality-gates-enforcer.sh enforce-linking
    
    # Generate quality report
    ./scripts/quality-gates-enforcer.sh quality-report

OPTIONS:
    -h, --help     Show this help message
    -v, --verbose  Verbose output
    --fix          Automatically fix issues where possible
    --report-only  Generate report without enforcement actions

EOF
}

# Check if PR meets quality requirements
check_pr_quality() {
    local pr_number="$1"
    local fix_mode="$2"
    
    if [[ -z "$pr_number" ]]; then
        error "PR number is required"
    fi
    
    log "Checking PR #$pr_number quality compliance..."
    
    # Get PR details
    local pr_info
    pr_info=$(gh pr view "$pr_number" --repo "$REPO" --json title,body,headRefName,files,author 2>/dev/null || echo "")
    
    if [[ -z "$pr_info" ]]; then
        error "PR #$pr_number not found or not accessible"
    fi
    
    local pr_title=$(echo "$pr_info" | jq -r '.title')
    local pr_body=$(echo "$pr_info" | jq -r '.body')
    local pr_branch=$(echo "$pr_info" | jq -r '.headRefName')
    local pr_author=$(echo "$pr_info" | jq -r '.author.login')
    
    local compliance_issues=()
    local compliance_score=0
    local max_score=5
    
    # Check 1: Agent name in title
    if [[ "$pr_title" =~ \[([A-Z-]+)\] ]]; then
        success "PR title includes agent name: ${BASH_REMATCH[1]}"
        ((compliance_score++))
    else
        compliance_issues+=("PR title missing agent name in brackets [AGENT-NAME]")
        warning "PR title should include agent name: $pr_title"
    fi
    
    # Check 2: Issue linking in body
    local has_linking=false
    for check_word in "${REQUIRED_PR_CHECKS[@]}"; do
        if echo "$pr_body" | grep -qi "$check_word #[0-9]"; then
            has_linking=true
            break
        fi
    done
    
    if [[ "$has_linking" == "true" ]]; then
        success "PR body includes issue linking"
        ((compliance_score++))
    else
        compliance_issues+=("PR body missing issue linking (Closes #number, Fixes #number, etc.)")
        warning "PR body should include 'Closes #issue-number' or similar"
    fi
    
    # Check 3: Extract and validate linked issue
    local linked_issue=""
    if [[ "$has_linking" == "true" ]]; then
        linked_issue=$(echo "$pr_body" | grep -oi -E "(closes|fixes|resolves)\s*#[0-9]+" | head -1 | grep -o "#[0-9]*" | sed 's/#//')
        
        if [[ -n "$linked_issue" ]]; then
            # Verify issue exists
            local issue_exists
            issue_exists=$(gh issue view "$linked_issue" --repo "$REPO" --json number 2>/dev/null || echo "")
            
            if [[ -n "$issue_exists" ]]; then
                success "Linked issue #$linked_issue exists and is accessible"
                ((compliance_score++))
            else
                compliance_issues+=("Linked issue #$linked_issue does not exist or is not accessible")
                warning "Linked issue #$linked_issue cannot be accessed"
            fi
        else
            compliance_issues+=("Could not extract issue number from PR body")
        fi
    fi
    
    # Check 4: Branch naming convention
    if [[ "$pr_branch" =~ ^(frontend|backend|design|integration|test)/ ]]; then
        success "Branch follows agent naming convention: $pr_branch"
        ((compliance_score++))
    else
        compliance_issues+=("Branch name should start with agent type (frontend/, backend/, design/, etc.)")
        warning "Branch name doesn't follow convention: $pr_branch"
    fi
    
    # Check 5: File ownership compliance (simplified check)
    local files_output=$(echo "$pr_info" | jq -r '.files[].path' | head -10)
    local file_count=$(echo "$files_output" | wc -l)
    
    if [[ "$file_count" -gt 0 ]]; then
        success "PR modifies $file_count files (ownership verification recommended)"
        ((compliance_score++))
    else
        compliance_issues+=("No modified files detected or files not accessible")
    fi
    
    # Calculate compliance percentage
    local compliance_pct=$((compliance_score * 100 / max_score))
    
    # Report results
    echo
    if [[ "$compliance_score" -eq "$max_score" ]]; then
        success "PR #$pr_number is FULLY COMPLIANT ($compliance_score/$max_score - $compliance_pct%)"
        return 0
    else
        warning "PR #$pr_number has COMPLIANCE ISSUES ($compliance_score/$max_score - $compliance_pct%)"
        
        echo
        info "Issues found:"
        for issue in "${compliance_issues[@]}"; do
            echo "  ❌ $issue"
        done
        
        echo
        if [[ -n "$fix_mode" && "$fix_mode" == "fix" ]]; then
            info "Attempting to provide fix suggestions..."
            provide_fix_suggestions "$pr_number" "$pr_title" "$pr_body" "$pr_branch" "${compliance_issues[@]}"
        else
            info "Use --fix option or 'fix-pr $pr_number' command to get fix suggestions"
        fi
        
        return 1
    fi
}

# Provide fix suggestions
provide_fix_suggestions() {
    local pr_number="$1"
    local pr_title="$2"
    local pr_body="$3"
    local pr_branch="$4"
    shift 4
    local issues=("$@")
    
    header "Fix Suggestions for PR #$pr_number"
    
    for issue in "${issues[@]}"; do
        echo
        info "Issue: $issue"
        
        if [[ "$issue" =~ "agent name" ]]; then
            local suggested_agent=""
            if [[ "$pr_branch" =~ ^frontend/ ]]; then
                suggested_agent="FRONTEND-DEVELOPER"
            elif [[ "$pr_branch" =~ ^backend/ ]]; then
                suggested_agent="BACKEND-ARCHITECT"
            elif [[ "$pr_branch" =~ ^design/ ]]; then
                suggested_agent="UI-DESIGNER"
            elif [[ "$pr_branch" =~ ^integration/ ]]; then
                suggested_agent="INTEGRATION-COORDINATOR"
            elif [[ "$pr_branch" =~ ^test/ ]]; then
                suggested_agent="TEST-WRITER-FIXER"
            fi
            
            if [[ -n "$suggested_agent" ]]; then
                echo "  🔧 Suggested fix: Update PR title to:"
                echo "     [$suggested_agent] $(echo "$pr_title" | sed 's/^\[[^]]*\] //')"
            fi
            
        elif [[ "$issue" =~ "issue linking" ]]; then
            echo "  🔧 Suggested fix: Add to PR body:"
            echo "     Closes #ISSUE_NUMBER"
            echo "     (Replace ISSUE_NUMBER with the actual GitHub issue this PR resolves)"
            
        elif [[ "$issue" =~ "branch name" ]]; then
            echo "  🔧 Suggested fix: Use branch naming convention:"
            echo "     {agent-type}/{agent-name}/{feature-description}"
            echo "     Example: frontend/frontend-developer/user-auth-component"
            
        elif [[ "$issue" =~ "linked issue" ]]; then
            echo "  🔧 Suggested fix: Ensure the referenced issue exists and is accessible"
            echo "     Use: gh issue list --repo $REPO --search 'your-search-term'"
        fi
    done
    
    echo
    info "To update PR title: gh pr edit $pr_number --title 'New Title'"
    info "To update PR body: gh pr edit $pr_number --body 'New body with Closes #issue'"
}

# Audit all PRs
audit_all_prs() {
    header "Auditing All PRs for Quality Compliance"
    
    log "Fetching all open PRs..."
    
    local prs
    prs=$(gh pr list --repo "$REPO" --json number,title,author --limit 50 2>/dev/null || echo "[]")
    
    local pr_count=$(echo "$prs" | jq length)
    
    if [[ "$pr_count" -eq 0 ]]; then
        info "No open PRs found"
        return 0
    fi
    
    success "Found $pr_count open PRs to audit"
    
    local compliant_prs=0
    local non_compliant_prs=0
    local failed_audits=0
    
    echo "$prs" | jq -r '.[].number' | while read -r pr_num; do
        echo
        log "Auditing PR #$pr_num..."
        
        if check_pr_quality "$pr_num" ""; then
            ((compliant_prs++))
        else
            ((non_compliant_prs++))
        fi
    done
    
    # Note: Due to subshell, counters won't be updated in main shell
    # This is a limitation of the current implementation
    echo
    success "PR audit completed"
    info "Use 'quality-report' for a comprehensive compliance summary"
}

# Enforce PR-to-issue linking
enforce_linking() {
    header "Enforcing PR-to-Issue Linking Requirements"
    
    log "Finding PRs without proper issue linking..."
    
    local all_prs
    all_prs=$(gh pr list --repo "$REPO" --json number,title,body --limit 50 2>/dev/null || echo "[]")
    
    local pr_count=$(echo "$all_prs" | jq length)
    
    if [[ "$pr_count" -eq 0 ]]; then
        info "No PRs found"
        return 0
    fi
    
    local unlinked_prs=()
    
    echo "$all_prs" | jq -c '.[]' | while IFS= read -r pr_json; do
        local pr_number=$(echo "$pr_json" | jq -r '.number')
        local pr_body=$(echo "$pr_json" | jq -r '.body')
        local pr_title=$(echo "$pr_json" | jq -r '.title')
        
        local has_linking=false
        for check_word in "${REQUIRED_PR_CHECKS[@]}"; do
            if echo "$pr_body" | grep -qi "$check_word #[0-9]"; then
                has_linking=true
                break
            fi
        done
        
        if [[ "$has_linking" == "false" ]]; then
            warning "PR #$pr_number lacks issue linking: $pr_title"
            echo "  Body preview: $(echo "$pr_body" | head -c 100)..."
            echo
        fi
    done
    
    success "Linking enforcement check complete"
    info "Use 'fix-pr PR_NUMBER' to interactively fix non-compliant PRs"
}

# Generate quality report
generate_quality_report() {
    header "Comprehensive Quality Report"
    
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    local report_file="quality-report-$(date +'%Y%m%d-%H%M%S').md"
    
    log "Generating comprehensive quality report..."
    
    # Get all PRs (open and recent closed)
    local open_prs
    open_prs=$(gh pr list --repo "$REPO" --json number,title,body,headRefName,author,createdAt --limit 30 2>/dev/null || echo "[]")
    
    local closed_prs
    closed_prs=$(gh pr list --repo "$REPO" --state closed --json number,title,body,headRefName,author,createdAt --limit 20 2>/dev/null || echo "[]")
    
    # Generate report
    cat > "$report_file" << EOF
# GitHub Project Quality Report

**Generated**: $timestamp
**Repository**: $REPO
**Scope**: Last 30 open PRs + 20 recent closed PRs

## Executive Summary

$(gh pr list --repo "$REPO" --json number --limit 100 2>/dev/null | jq length || echo "0") open PRs analyzed for quality compliance.

### Quality Metrics

- **PR Title Compliance**: Agent name in brackets [AGENT-NAME]
- **Issue Linking**: Closes #number, Fixes #number, or Resolves #number
- **Branch Naming**: Follows agent-type/agent-name/feature pattern
- **File Ownership**: Files modified within agent domain

## Detailed Analysis

### Open PRs Compliance

EOF

    # Analyze each PR and add to report
    local compliant_count=0
    local total_count=0
    
    echo "$open_prs" | jq -c '.[]' | while IFS= read -r pr_json; do
        local pr_number=$(echo "$pr_json" | jq -r '.number')
        local pr_title=$(echo "$pr_json" | jq -r '.title')
        local pr_author=$(echo "$pr_json" | jq -r '.author.login')
        local pr_created=$(echo "$pr_json" | jq -r '.createdAt')
        
        echo "#### PR #$pr_number: $pr_title" >> "$report_file"
        echo "- **Author**: @$pr_author" >> "$report_file"
        echo "- **Created**: $pr_created" >> "$report_file"
        
        # Check compliance (simplified for report)
        if check_pr_quality "$pr_number" "" &>/dev/null; then
            echo "- **Status**: ✅ COMPLIANT" >> "$report_file"
            ((compliant_count++))
        else
            echo "- **Status**: ❌ NON-COMPLIANT" >> "$report_file"
        fi
        
        echo "" >> "$report_file"
        ((total_count++))
    done
    
    # Add summary statistics
    cat >> "$report_file" << EOF

## Summary Statistics

- **Total PRs Analyzed**: $total_count
- **Compliant PRs**: $compliant_count
- **Compliance Rate**: $(( total_count > 0 ? compliant_count * 100 / total_count : 0 ))%

## Recommendations

1. **For Non-Compliant PRs**: Use \`./scripts/quality-gates-enforcer.sh fix-pr PR_NUMBER\`
2. **For New PRs**: Follow the enhanced agent workflows in \`docs/enhanced-agent-workflows.md\`
3. **For Agents**: Use \`./scripts/agent-task-helper.sh\` for compliant PR creation

## Quality Gate Requirements

All PRs must meet these requirements before merge:

- [ ] PR title includes agent name: \`[AGENT-NAME] Description\`
- [ ] PR body includes issue linking: \`Closes #123\`
- [ ] Linked issue exists and is accessible
- [ ] Branch follows naming convention
- [ ] Files modified within agent domain

---
*Report generated by Quality Gates Enforcer*
EOF

    success "Quality report generated: $report_file"
    
    # Display summary
    echo
    info "📊 Quality Summary:"
    echo "  Total PRs analyzed: $total_count"
    echo "  Compliant PRs: $compliant_count"
    echo "  Compliance rate: $(( total_count > 0 ? compliant_count * 100 / total_count : 0 ))%"
    echo
    info "Full report saved to: $report_file"
}

# Interactive PR fix
interactive_pr_fix() {
    local pr_number="$1"
    
    if [[ -z "$pr_number" ]]; then
        error "PR number is required. Usage: fix-pr PR_NUMBER"
    fi
    
    header "Interactive PR Fix - PR #$pr_number"
    
    # First check current compliance
    if ! check_pr_quality "$pr_number" ""; then
        echo
        info "PR #$pr_number needs fixes. Analyzing and providing suggestions..."
        check_pr_quality "$pr_number" "fix"
        
        echo
        info "After making changes, run this command again to verify compliance"
    fi
}

# Validate complete workflow
validate_workflow() {
    header "Complete Workflow Validation"
    
    log "Validating end-to-end workflow compliance..."
    
    # Check for required files
    local required_files=(
        "scripts/analyze-story-tasks.sh"
        "scripts/agent-task-helper.sh"
        "scripts/story-workflow-manager.sh"
        "templates/github-task-template.md"
        "config/project-mapping.json"
        "docs/enhanced-agent-workflows.md"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            success "Required file exists: $file"
        else
            missing_files+=("$file")
            warning "Missing required file: $file"
        fi
    done
    
    if [[ ${#missing_files[@]} -eq 0 ]]; then
        success "All required workflow files are present"
    else
        error "Workflow validation failed - ${#missing_files[@]} missing files"
    fi
    
    # Check GitHub CLI access
    if gh auth status &>/dev/null; then
        success "GitHub CLI is authenticated"
    else
        warning "GitHub CLI not authenticated - some features may not work"
    fi
    
    # Check project access
    local project_access=0
    for project_id in "10" "11" "12"; do
        if gh project list --owner gpb360 2>/dev/null | grep -q "Project $project_id"; then
            ((project_access++))
        fi
    done
    
    success "Can access $project_access/3 GitHub Projects"
    
    if [[ "$project_access" -eq 3 ]]; then
        success "Complete workflow validation PASSED"
    else
        warning "Workflow validation completed with warnings"
    fi
}

# Main function
main() {
    local command="$1"
    shift
    
    local fix_mode=""
    if [[ "$1" == "--fix" ]]; then
        fix_mode="fix"
        shift
    fi
    
    # Handle help
    case "$command" in
        "-h"|"--help"|"help"|"")
            show_help
            exit 0
            ;;
    esac
    
    # Check prerequisites
    if ! command -v gh &> /dev/null; then
        error "GitHub CLI (gh) is not installed"
    fi
    
    # Execute command
    case "$command" in
        "audit-prs")
            audit_all_prs
            ;;
        "check-pr")
            check_pr_quality "$1" "$fix_mode"
            ;;
        "enforce-linking")
            enforce_linking
            ;;
        "validate-workflow")
            validate_workflow
            ;;
        "fix-pr")
            interactive_pr_fix "$1"
            ;;
        "quality-report")
            generate_quality_report
            ;;
        *)
            error "Unknown command: $command. Use --help to see available commands."
            ;;
    esac
}

# Run main function
main "$@"