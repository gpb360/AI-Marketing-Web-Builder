# Sub-Agents Configuration

## 🔍 Available Sub-Agents

Your project has 4 specialized sub-agents configured in `.claude/sub-agents/`:

### 1. **mcp-health-checker** (`mcp-health-checker.json`)
**Purpose**: Monitors MCP server health and connectivity
- **Responsibilities**:
  - Regular health checks on all MCP servers
  - Detecting connection failures and timeouts
  - Providing diagnostics for MCP issues
  - Auto-restarting failed servers
  - Logging server status and performance metrics
  - Alerting on critical failures

### 2. **mcp-manager** (`mcp-manager.json`)
**Purpose**: Manages MCP server setup and configuration
- **Responsibilities**:
  - Installing required MCP packages
  - Validating MCP configuration files
  - Starting/stopping MCP servers
  - Troubleshooting MCP connection issues
  - Managing multiple MCP server instances

### 3. **playwright-mcp** (`playwright-mcp.json`)
**Purpose**: Playwright MCP server specialist
- **Responsibilities**:
  - Ensuring @playwright/mcp package installation
  - Configuring browser-specific MCP servers
  - Managing browser downloads and setup
  - Handling headless/headed configurations
  - Setting up viewport and session options
  - Troubleshooting browser connection issues

### 4. **github-mcp** (`github-mcp.json`)
**Purpose**: GitHub MCP server specialist
- **Responsibilities**:
  - GitHub Personal Access Token authentication
  - GitHub MCP server configuration with Docker
  - GitHub Projects board integration (#10, #11, #12)
  - Issue and PR workflow automation
  - Repository management and code analysis
  - Team coordination through GitHub APIs

## 📁 Directory Structure
```
.claude/
├── mcp.json                     # Main MCP server configuration
├── sub-agents/
│   ├── README.md               # This file
│   ├── mcp-health-checker.json # Health monitoring agent
│   ├── mcp-manager.json        # MCP management agent
│   ├── playwright-mcp.json     # Playwright specialist
│   └── github-mcp.json         # GitHub specialist
├── .env.local.template         # Environment template
└── GITHUB_MCP_SETUP.md         # GitHub setup guide
```

## 🚀 Usage Instructions

### Activating Sub-Agents
Use these sub-agents by referring to their names when needed:

```bash
# Use GitHub MCP agent for repository operations
claude use github-mcp

# Use Playwright agent for browser automation
claude use playwright-mcp

# Use health checker for diagnostics
claude use mcp-health-checker
```

### Environment Setup
1. Copy environment template: `cp .env.local.template .env.local`
2. Add your GitHub token to `.env.local`
3. Verify MCP servers: `claude mcp`

## 🔧 Configuration Details

### MCP Servers Currently Configured:
- **playwright**: Chromium automation
- **playwright-firefox**: Firefox testing
- **playwright-webkit**: Safari testing
- **github**: GitHub API integration

### Required Tools:
- Docker (for GitHub MCP server)
- Node.js/npm (for Playwright MCP)
- GitHub Personal Access Token

## 📊 Monitoring

The health-checker agent will automatically:
- Monitor all MCP servers every 30 seconds
- Log performance metrics
- Alert on connection failures
- Attempt auto-restart on failures

## 🎯 Next Steps

1. **Set up GitHub token** in `.env.local`
2. **Test all agents** with `claude mcp`
3. **Monitor health** with the health-checker agent
4. **Use specific agents** for targeted operations