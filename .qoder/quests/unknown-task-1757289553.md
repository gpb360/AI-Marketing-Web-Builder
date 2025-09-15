# Archon MCP and BMAD PM Integration for Task Management

## Overview

This document outlines the process for checking the Archon MCP system and using BMAD PM to create additional tasks while backend development is in progress. The AI Marketing Web Builder project uses both Archon for task tracking and BMAD for project management workflows.

## System Architecture

### Archon MCP Integration
The project uses Archon MCP server for knowledge management, task tracking, and project organization. Key components include:

1. **Archon Webhook Service**: Bidirectional synchronization between Archon tasks and BMAD workflow
2. **Task Status Mapping**: BMAD phases map to Archon statuses (story_created → todo, in_development → doing, etc.)
3. **Agent Mappings**: BMAD agents map to Archon roles (frontend-builder → frontend-developer, etc.)

### BMAD PM System
BMAD (Business Method Analysis & Development) provides project management capabilities with:

1. **Task Creation Workflows**: Create stories, epics, and documentation
2. **Agent-Based Approach**: Different agents for different roles (PM, Architect, Developer, etc.)
3. **Template-Driven Documents**: Standardized templates for PRDs, stories, and architecture docs

## Checking Archon MCP Status

### 1. Verify Archon MCP Server Availability
Before proceeding with task creation, ensure the Archon MCP server is running:

```bash
# Check if Archon MCP server is accessible
curl -v http://localhost:8080/health
```

If the server is not running, start it according to your Archon installation instructions.

### 2. Check Current Project Status
List all tasks for the current project to understand the current state:

```bash
# Get current project status
archon:manage_task(
  action="list",
  filter_by="project", 
  filter_value="7f28b875-3e32-4f1d-8349-c38df1d1ad67",
  include_closed=false
)
```

### 3. Identify Next Priority Task
Find the highest priority task that needs attention:

```bash
# Get next priority task
archon:manage_task(
  action="list",
  filter_by="status",
  filter_value="todo",
  project_id="7f28b875-3e32-4f1d-8349-c38df1d1ad67"
)
```

## Running BMAD PM to Create Tasks

### 1. Start BMAD Master Agent
The BMAD Master agent can execute any BMAD task directly:

```bash
# Start BMAD Master agent
npx bmad-method agent bmad-master
```

Alternatively, if using the bundled web version, load the BMAD Master agent from `.bmad-core/agents/bmad-master.md`.

### 2. Create New Tasks Using BMAD PM

#### Option A: Create a New Story
To create a new user story for implementation:

```bash
# Create a new story using BMAD
@pm create-story
```

This will:
1. Prompt for story details
2. Generate a structured story document
3. Save to the appropriate location based on configuration

#### Option B: Create a New Epic
To create a new epic for a feature set:

```bash
# Create a new epic using BMAD
@pm create-epic
```

This will:
1. Define the epic scope and goals
2. Create related user stories
3. Establish success criteria and definition of done

#### Option C: Create Documentation
To create project documentation:

```bash
# Create documentation using BMAD
@pm create-doc
```

This will:
1. Show available templates
2. Allow selection of appropriate template
3. Generate documentation based on the template

### 3. Sync BMAD Tasks with Archon
After creating tasks in BMAD, sync them with Archon:

```bash
# Start the Archon-BMad webhook service if not already running
node .claude/scripts/simple-webhook-service.js

# Sync current branch with Archon
curl -X POST http://localhost:8090/api/sync
```

## Workflow Integration

### Task Creation Process
1. **Analyze Current State**: Check Archon for existing tasks and priorities
2. **Identify Gaps**: Determine what additional tasks are needed
3. **Create Tasks in BMAD**: Use appropriate BMAD PM commands to create new tasks
4. **Sync with Archon**: Ensure new tasks are visible in Archon for tracking
5. **Assign and Prioritize**: Set task priorities and assign to team members

### Parallel Development
While backend development is in progress:
1. **Frontend Tasks**: Create UI/UX related stories and epics
2. **Documentation Tasks**: Generate required documentation
3. **Integration Tasks**: Define API contracts and integration points
4. **Testing Tasks**: Create test plans and automation tasks

## Best Practices

### Task Granularity
- Keep tasks small and focused (1-4 hours of work)
- Ensure clear acceptance criteria
- Include all necessary context for implementation

### Status Management
- Update task status regularly in both systems
- Use proper status transitions (todo → doing → review → done)
- Link pull requests to tasks when moving to review status

### Collaboration
- Use Archon task comments for team communication
- Coordinate on shared files through task comments
- Follow branch naming conventions for proper tracking

## Example Commands

### Archon Commands
```bash
# Create a new project
archon:manage_project(action="create", title="New Feature Set")

# Create a task
archon:manage_task(
  action="create",
  project_id="7f28b875-3e32-4f1d-8349-c38df1d1ad67",
  title="Implement User Authentication",
  description="Create login and registration functionality",
  assignee="frontend-developer",
  task_order=1
)

# Update task status
archon:manage_task(
  action="update",
  task_id="task-123",
  update_fields={"status": "doing"}
)
```

### BMAD Commands
```bash
# Create a new story
@pm create-story

# Create a new epic
@pm create-epic

# Create documentation
@pm create-doc prd-tmpl

# Execute a checklist
@pm execute-checklist story-draft-checklist
```

## Troubleshooting

### Common Issues
1. **Archon Server Not Responding**: Ensure the Archon MCP server is running on port 8080
2. **BMAD Agent Not Found**: Verify BMAD installation and configuration
3. **Sync Issues**: Check webhook service is running and accessible

### Diagnostic Commands
```bash
# Check Archon webhook service status
curl http://localhost:8090/health

# Check current git branch and BMAD phase
./.claude/scripts/archon-bmad-sync.sh status

# Verify branch isolation compliance
./.claude/scripts/branch-isolation-check.sh
```