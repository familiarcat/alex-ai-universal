# Alex AI Testing Environment

This directory contains a complete testing environment for all Alex AI components in a controlled, private deployment.

## 🚀 Quick Start

1. **Start the testing environment:**
   ```bash
   ./start.sh
   ```

2. **Stop the testing environment:**
   ```bash
   ./stop.sh
   ```

3. **Run tests:**
   ```bash
   ./test.sh
   ```

## 📁 Directory Structure

```
testing-environment/
├── vscode-workspace/          # VS Code testing workspace
├── cursor-workspace/          # Cursor AI testing workspace
├── web-platform/             # Web platform testing
├── test-projects/            # Test projects for integration testing
├── test-data/                # Test data and configurations
├── config/                   # Testing configurations
├── start.sh                  # Start script
├── stop.sh                   # Stop script
├── test.sh                   # Test script
└── README.md                 # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the testing environment root:

```bash
# Alex AI Testing Environment Configuration
N8N_API_KEY=your_n8n_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
GITHUB_TOKEN=your_github_token_here
```

### Private Registry

The testing environment is configured to use a private NPM registry for Alex AI packages:

- Registry: `https://npm.pkg.github.com`
- Scope: `@alex-ai`
- Version: `1.0.0-private`

## 🧪 Testing Components

### 1. NPM Packages
- `@alex-ai/core` - Core Alex AI functionality
- `@alex-ai/cli` - Command-line interface

### 2. VS Code Extension
- Extension: `@alex-ai/vscode`
- Workspace: `vscode-workspace/alex-ai-testing.code-workspace`

### 3. Cursor AI Extension
- Extension: `@alex-ai/cursor`
- Workspace: `cursor-workspace/`

### 4. Web Platform
- Platform: `@alex-ai/web`
- URL: `http://localhost:3000`

## 🎯 Test Projects

The testing environment includes several test projects:

1. **React Test Project** - React application for testing
2. **Node.js Test Project** - Node.js application for testing
3. **TypeScript Test Project** - TypeScript application for testing

## 🔍 Debugging

### Logs
- Setup log: `setup.log`
- Application logs: Check individual component logs

### Common Issues
1. **Private registry access**: Ensure `GITHUB_TOKEN` is set
2. **N8N integration**: Verify `N8N_API_KEY` is correct
3. **RAG memory**: Check `SUPABASE_URL` and `SUPABASE_ANON_KEY`

## 📞 Support

For issues with the testing environment, check:
1. Environment variables are correctly set
2. Private registry access is working
3. All required services (N8N, Supabase) are accessible

## 🚀 Next Steps

1. Configure your environment variables
2. Start the testing environment
3. Test each component individually
4. Run integration tests
5. Report any issues or feedback

Happy testing! 🎉
