# GitHub MCP Server Setup Guide

## ✅ Installation Complete

Your GitHub MCP server has been successfully configured and is ready to use!

## 📋 Setup Summary

### MCP Server Configuration
**Location**: `web-builder/.claude/mcp.json`

**Configured Servers**:
1. **playwright** - Browser automation
2. **playwright-firefox** - Firefox testing
3. **playwright-webkit** - Safari testing  
4. **github** - GitHub API integration

### GitHub MCP Server Details
- **Source**: Official GitHub MCP server
- **Method**: Docker container (ghcr.io/github/github-mcp-server:latest)
- **Status**: ✅ Downloaded and ready

## 🔑 Authentication Setup

### 1. Create GitHub Personal Access Token
1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token" (classic)
3. **Required scopes**:
   - `repo` (full repository access)
   - `user` (read user profile data)
   - `issues` (read/write issues)
   - `pull_requests` (read/write PRs)
   - `project` (read/write projects)

### 2. Environment Configuration
1. Copy the template file:
   ```bash
   cp .env.local.template .env.local
   ```

2. Edit `.env.local` and add your token:
   ```bash
   GITHUB_TOKEN=ghp_your_actual_token_here
   ```

## 🚀 Usage Examples

Once configured, you can use Claude with GitHub integration:

### Repository Operations
- "Show me the open issues in this repository"
- "Create a new issue for implementing dark mode"
- "List all pull requests in the project"

### Project Management  
- "What's in the Ready column of Frontend Project #10?"
- "Move task 'Fix component library' to In Progress"
- "Create 5 new frontend tasks from the spec files"

### Code Analysis
- "Show me the recent commits on the feature/migration-service branch"
- "Review the latest PR for security issues"
- "Generate a summary of changes in the last week"

## 🔧 Testing Configuration

### Verify Docker Access
```bash
sudo docker run --rm ghcr.io/github/github-mcp-server:latest --help
```

### Test GitHub Integration
After setting your token in `.env.local`, test with:
```bash
# Test basic connectivity
claude mcp list
```

## 🛠️ Troubleshooting

### Common Issues

1. **Docker Permission Denied**
   ```bash
   # Add user to docker group (requires logout/login)
   sudo usermod -aG docker $USER
   ```

2. **Token Not Found**
   - Ensure `.env.local` exists in `web-builder/` directory
   - Verify token format: `ghp_...`
   - Check file permissions: `chmod 600 .env.local`

3. **MCP Server Not Starting**
   - Check Docker daemon: `sudo systemctl status docker`
   - Verify image: `sudo docker images | grep github-mcp`

## 📊 MCP Server Capabilities

### Tools Available
- **Repository Management**: Create, read, update repositories
- **Issues & PRs**: Full lifecycle management
- **Projects**: Kanban board operations
- **Code Analysis**: File contents, commits, branches
- **User Management**: Profile info, permissions

### Environment Variables
- `GITHUB_PERSONAL_ACCESS_TOKEN`: Required for authentication
- `GITHUB_API_URL`: Optional (for GitHub Enterprise)
- `GITHUB_MCP_READ_ONLY`: Set to `true` for read-only mode

## 🔄 Development Workflow Integration

### Automated Tasks
The GitHub MCP server integrates with your existing development workflow:

1. **Project Board Monitoring**: Automatically check task counts
2. **PR Reviews**: AI-assisted code review suggestions
3. **Issue Triage**: Automated issue labeling and assignment
4. **Backlog Management**: Dynamic task creation based on specs

### Team Coordination
- **Frontend Team**: Direct access to Project #10
- **Backend Team**: Direct access to Project #11  
- **Lead Developer**: PR review automation
- **Project Manager**: Backlog monitoring and task creation

## 🎯 Next Steps

1. **Set up your GitHub token** using the instructions above
2. **Test basic functionality** with simple queries
3. **Integrate with your development workflow**
4. **Train your team** on GitHub MCP capabilities

## 📞 Support

For issues with the GitHub MCP server:
- [Official Documentation](https://github.com/github/github-mcp-server)
- [GitHub Issues](https://github.com/github/github-mcp-server/issues)
- [MCP Protocol Documentation](https://modelcontextprotocol.io)

---

**Status**: ✅ Ready for use
**Last Updated**: July 31, 2025