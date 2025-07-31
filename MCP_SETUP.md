# MCP Server Setup Guide for AI Marketing Web Builder

## Overview
This guide will help you set up MCP (Model Context Protocol) servers for the AI Marketing Web Builder project to enable advanced AI capabilities.

## Prerequisites

### 1. Docker (for GitHub MCP Server)
Docker must be installed and running:
```bash
docker --version
```

### 2. Node.js and npm (for Playwright MCP)
Node.js and npm must be installed:
```bash
node --version
npm --version
```

### 3. GitHub Token (for GitHub MCP Server)
You need a GitHub Personal Access Token with the following permissions:
- `repo` (full control of private repositories)
- `project` (full control of projects)

## Setup Instructions

### Step 1: Set GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Create a new token with `repo` and `project` scopes
3. Add the token to your environment:

```bash
# Add to your shell profile (.bashrc, .zshrc, etc.)
export GITHUB_TOKEN=your_github_token_here

# Or create/update .env.local in project root
echo "GITHUB_TOKEN=your_github_token_here" >> .env.local
```

### Step 2: Install Dependencies

```bash
cd web-builder
npm install @playwright/mcp
```

### Step 3: Verify MCP Configuration

The MCP servers are configured in:
- `/.claude/settings.json` - Main project configuration
- `/web-builder/.claude/settings.json` - Web builder specific configuration

### Step 4: Test MCP Servers

```bash
# Test Docker availability for GitHub MCP
docker run --rm -i ghcr.io/github/github-mcp-server:latest --help

# Test Playwright MCP
npx @playwright/mcp --help
```

## MCP Servers Available

### 1. GitHub MCP Server
- **Purpose**: GitHub repository and project management
- **Command**: `docker run --rm -i ghcr.io/github/github-mcp-server:latest`
- **Requirements**: Docker + GITHUB_TOKEN environment variable

### 2. Playwright MCP Server
- **Purpose**: Browser automation and testing
- **Command**: `npx @playwright/mcp --browser chromium`
- **Requirements**: Node.js + @playwright/mcp package

### 3. Playwright Firefox MCP Server
- **Purpose**: Firefox-specific browser automation
- **Command**: `npx @playwright/mcp --browser firefox`

### 4. Playwright WebKit MCP Server
- **Purpose**: Safari/WebKit-specific browser automation
- **Command**: `npx @playwright/mcp --browser webkit`

## Troubleshooting

### MCP Not Detected
If `/mcp` command shows "No MCP servers configured":

1. **Check file locations**:
   ```bash
   ls -la .claude/settings.json
   ls -la web-builder/.claude/settings.json
   ```

2. **Verify JSON syntax**:
   ```bash
   cat .claude/settings.json | jq .
   ```

3. **Check environment variables**:
   ```bash
   echo $GITHUB_TOKEN
   ```

4. **Restart Claude Code**:
   ```bash
   claude restart
   ```

### Docker Issues
If GitHub MCP fails:
1. Ensure Docker is running: `docker ps`
2. Pull the latest image: `docker pull ghcr.io/github/github-mcp-server:latest`
3. Check Docker permissions

### Playwright Issues
If Playwright MCP fails:
1. Install dependencies: `npm install @playwright/mcp`
2. Install browsers: `npx playwright install chromium`
3. Check Node.js version compatibility

## Verification Commands

```bash
# Test all MCP configurations
claude mcp list

# Test individual servers
claude mcp test github
claude mcp test playwright

# Check MCP server status
claude doctor
```

## Usage Examples

### GitHub Integration
```bash
# List repositories
claude mcp github list-repos

# List project items
claude mcp github list-project-items --project 10
```

### Playwright Integration
```bash
# Take a screenshot
claude mcp playwright screenshot https://example.com

# Navigate and interact
claude mcp playwright navigate https://example.com
```

## Configuration Files

### Main Configuration
Location: `/.claude/settings.json`
```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server:latest"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp", "--browser", "chromium", "--headless"],
      "env": {
        "HEADLESS": "true"
      }
    }
  }
}
```

## Support

For issues with MCP setup:
1. Check Claude documentation: https://docs.anthropic.com/en/docs/claude-code/mcp
2. Verify all prerequisites are installed
3. Check the troubleshooting section above
4. Restart Claude Code after configuration changes