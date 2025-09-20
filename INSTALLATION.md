# Alex AI Universal - Installation Guide

## 🚀 Quick Installation

### NPX (Recommended - No Installation Required)
```bash
# Use immediately without installation
npx alexi@latest

# Start with a specific command
npx alexi unified-system initialize
```

### Global Installation
```bash
# Install globally for system-wide access
npm install -g alexi

# Verify installation
alexi --version

# Use from any directory
alexi chat
alexi crew
alexi status
```

### Local Installation
```bash
# Install in your project
npm install alexi

# Use with npx
npx alexi --help
```

## ⚙️ Configuration Setup

### 1. Environment Variables

Add these to your `~/.zshrc` file:

```bash
# N8N Configuration
export N8N_API_URL="https://n8n.pbradygeorgen.com/api/v1"
export N8N_API_KEY="your-n8n-api-key"

# Supabase Configuration
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-supabase-anon-key"

# OpenAI Configuration
export OPENAI_API_KEY="your-openai-api-key"

# Alex AI Configuration
export ALEX_AI_ENABLE_RAG="true"
export ALEX_AI_ENABLE_SCRAPING="true"
export ALEX_AI_ENABLE_BILATERAL_SYNC="true"
export ALEX_AI_LEARNING_RATE="0.1"
export ALEX_AI_MAX_EMBEDDINGS="1000"

# Reload shell configuration
source ~/.zshrc
```

### 2. Initialize Alex AI

```bash
# Initialize in your project
npx alexi unified-system initialize

# Test the system
npx alexi unified-system test

# Check status
npx alexi unified-system status
```

## 🎯 Usage Examples

### Basic Commands
```bash
# Start interactive chat
npx alexi chat

# Show crew members
npx alexi crew

# Check system status
npx alexi status

# Run demonstration
npx alexi demo
```

### Advanced Commands
```bash
# Unified system management
npx alexi unified-system initialize
npx alexi unified-system status
npx alexi unified-system test
npx alexi unified-system query "Your question here"

# Learning model verification
npx alexi learning-model verify-status
npx alexi learning-model show-details
npx alexi learning-model test-functionality
```

### Natural Language Usage

In Cursor AI Chat or VSCode:
```
"Engage AlexAI - Help me implement user authentication with JWT"
"Alex AI, optimize my database queries for better performance"
"Commander Data, analyze my machine learning model and suggest improvements"
"Lieutenant Worf, review my code for security vulnerabilities"
```

## 🔧 Integration Examples

### Cursor AI Integration
1. Open Cursor AI
2. In the chat, type: "Engage AlexAI - Initialize yourself in this project"
3. Alex AI will automatically set up and be ready for natural language commands

### VSCode Integration
1. Install the VSCode extension
2. Use Command Palette: "Alex AI: Engage"
3. Or use natural language in the chat

### CLI Integration
1. Navigate to your project directory
2. Run: `npx alexi unified-system initialize`
3. Start using natural language commands

## 📊 Verification

### Check Installation
```bash
# Check version
npx alexi --version

# Check system status
npx alexi unified-system status

# Test functionality
npx alexi unified-system test
```

### Expected Output
- ✅ **RAG Learning**: Active and learning
- ✅ **N8N Integration**: Connected and syncing
- ✅ **Crew System**: All crew members ready
- ✅ **Security**: Client ambiguity maintained
- ✅ **Scraping**: Global scraping active

## 🛠️ Troubleshooting

### Common Issues

#### Command Not Found
```bash
# Check if alexi is in PATH
echo $PATH | grep -i alexi

# If not found, reinstall
npm install -g alexi
```

#### Permission Denied
```bash
# Fix npm permissions
sudo chown -R $(whoami) $(npm config get prefix)

# Or use npx instead
npx alexi@latest
```

#### Configuration Issues
```bash
# Check configuration
npx alexi unified-system config

# Reset configuration
npx alexi unified-system setup
```

### Getting Help
```bash
# Show help
npx alexi --help

# Show unified system help
npx alexi unified-system help

# Show learning model help
npx alexi learning-model help
```

## 🎉 Success!

Once installed and configured, you can:

1. **Use natural language** with Alex AI in Cursor AI or VSCode
2. **Get specialized help** from different crew members
3. **Learn from your projects** with RAG vector learning
4. **Automate workflows** with N8N integration
5. **Scrape relevant information** with global scraping

**Welcome to the future of AI-assisted development! 🖖**





