# 🖖 **ALEX AI UNIVERSAL - COMPLETE API REFERENCE**

> **The Definitive Guide to Alex AI Universal CLI Commands and Use Cases**

**Version**: 1.0.0  
**Target Audience**: Expert Software Developers  
**Purpose**: Comprehensive API reference with practical use cases and examples  

---

## 📋 **TABLE OF CONTENTS**

### **🚀 Getting Started**
- [Quick Start & Setup](#-quick-start--setup)
- [System Requirements](#-system-requirements)
- [Configuration](#-configuration)

### **💻 Core CLI Commands**
- [System Status & Health](#-system-status--health)
- [Chat & Interaction](#-chat--interaction)
- [Project Initialization](#-project-initialization)

### **👥 Crew Management**
- [Crew Discovery & Self-Improvement](#-crew-discovery--self-improvement)
- [Crew Consciousness](#-crew-consciousness)
- [Individual Crew Member Commands](#-individual-crew-member-commands)

### **🔄 Workflow & Automation**
- [N8N Workflow Management](#-n8n-workflow-management)
- [Scenario Analysis](#-scenario-analysis)
- [🖖 Observation Lounge](#-observation-lounge)

### **🔐 Security & Enterprise**
- [Enterprise Security System](#-enterprise-security-system)
- [Security Audits & Compliance](#-security-audits--compliance)

### **📊 Monitoring & Maintenance**
- [Health Monitoring](#-health-monitoring)
- [Performance Optimization](#-performance-optimization)
- [Memory Management](#-memory-management)

### **🎯 Advanced Use Cases**
- [Project Lifecycle Management](#-project-lifecycle-management)
- [Team Collaboration](#-team-collaboration)
- [Scaling & Growth](#-scaling--growth)

---

## 🚀 **QUICK START & SETUP**

### **Installation Options**

#### **NPX (Recommended - No Installation)**
```bash
# Immediate access without installation
npx alexi@latest
```

**When to Use**: Quick testing, one-off projects, or when you don't want to install globally.

#### **Global Installation**
```bash
# Install globally for system-wide access
npm install -g alexi
alexi --version
```

**When to Use**: Daily development work, team environments, or when you need consistent access across projects.

#### **Local Project Integration**
```bash
# Add to existing project
npm install alexi --save-dev
npx alexi
```

**When to Use**: Project-specific configurations, CI/CD pipelines, or when you want version control over Alex AI.

---

## 💻 **CORE CLI COMMANDS**

### **System Status & Health**

#### **`alexi status`**
**Purpose**: Provides comprehensive system health check and status overview.

**What it does**:
- Checks Alex AI core system status
- Verifies crew member availability
- Validates N8N connection
- Reports RAG memory system health
- Displays configuration status

**When to use**:
- **Daily health checks**: Start your day with a system status check
- **Troubleshooting**: When experiencing issues with Alex AI
- **Onboarding**: Verify system setup after installation
- **Pre-deployment**: Ensure all systems are operational before major releases

**Natural Language Examples**:
```
"Alex AI, what's the current system status?"
"Check if all crew members are ready for today's work"
"Is the RAG memory system functioning properly?"
"Verify N8N connectivity before starting workflow automation"
```

**CLI Examples**:
```bash
# Basic status check
alexi status

# Detailed status with verbose output
alexi status --verbose

# Status check for specific components
alexi status --crew
alexi status --memory
alexi status --n8n
```

**Expected Output**:
```
🖖 Alex AI Universal - System Status
=====================================
✅ Core System: Operational
✅ Crew Members: 9/9 Available
✅ RAG Memory: 1,247 memories stored
✅ N8N Integration: Connected
✅ Security System: Active
```

**Command Options**:
```bash
alexi status --help
# or
alexi status -h

# Available options:
--verbose, -v          Show detailed status information
--crew, -c            Show only crew member status
--memory, -m          Show only memory system status
--n8n, -n             Show only N8N integration status
--security, -s        Show only security system status
--json, -j            Output status in JSON format
--format <type>       Output format: text, json, yaml
--quiet, -q           Suppress non-essential output
```

---

#### **`alexi chat`**
**Purpose**: Interactive chat interface with Alex AI crew members.

**What it does**:
- Provides conversational interface with AI crew
- Routes queries to appropriate crew members
- Maintains conversation context
- Integrates with RAG memory system

**When to use**:
- **Quick questions**: Ask specific technical questions
- **Brainstorming**: Collaborate on solutions
- **Learning**: Understand concepts through conversation
- **Debugging**: Get help with specific problems

**Natural Language Examples**:
```
"Commander Data, analyze this error message for me"
"Captain Picard, what's the best approach for scaling this application?"
"Lieutenant Worf, is this code secure enough for production?"
"Help me understand the trade-offs between microservices and monoliths"
```

**CLI Examples**:
```bash
# Interactive chat session
alexi chat

# Direct query to specific crew member
alexi chat --crew "Commander Data" --query "Analyze this performance issue"

# Chat with context from file
alexi chat --context ./error.log

# Chat session with memory integration
alexi chat --use-memory
```

**Command Options**:
```bash
alexi chat --help
# or
alexi chat -h

# Available options:
--crew <name>, -c <name>    Direct query to specific crew member
--query <text>, -q <text>   Send direct query without interactive mode
--context <file>, -f <file> Load context from file for conversation
--use-memory, -m           Enable RAG memory integration
--session <id>, -s <id>    Continue existing chat session
--save-session, -save      Save current session for later use
--load-session <id>, -l <id> Load previous chat session
--history, -hist           Show chat history
--clear-history, -clear    Clear chat history
--format <type>            Output format: text, json, markdown
--verbose, -v              Show detailed conversation metadata
```

---

#### **`alexi init`**
**Purpose**: Initialize Alex AI in your current project.

**What it does**:
- Creates `.alex-ai-config.json` configuration file
- Sets up project-specific settings
- Integrates with existing development workflow
- Configures crew member specializations for your project

**When to use**:
- **New projects**: Set up Alex AI for a fresh project
- **Existing projects**: Add Alex AI to current development workflow
- **Team onboarding**: Standardize Alex AI setup across team
- **CI/CD integration**: Configure automated workflows

**Natural Language Examples**:
```
"Initialize Alex AI for this React project"
"Set up Alex AI with security focus for this enterprise application"
"Configure Alex AI for our microservices architecture"
"Initialize with emphasis on performance optimization"
```

**CLI Examples**:
```bash
# Basic initialization
alexi init

# Initialize with specific configuration
alexi init --config ./alex-ai-config.json

# Initialize with security focus
alexi init --security-focused

# Initialize for specific project type
alexi init --project-type "react-app"
alexi init --project-type "microservices"
alexi init --project-type "enterprise"
```

**Command Options**:
```bash
alexi init --help
# or
alexi init -h

# Available options:
--config <file>, -c <file>      Use custom configuration file
--project-type <type>, -t <type> Set project type: react-app, microservices, enterprise, api, web-app
--security-focused, -s          Initialize with enhanced security settings
--crew-config <file>, -crew <file> Custom crew configuration file
--n8n-config <file>, -n8n <file>  Custom N8N configuration file
--memory-config <file>, -mem <file> Custom memory system configuration
--force, -f                     Force initialization even if config exists
--dry-run, -d                   Show what would be initialized without creating files
--interactive, -i               Interactive initialization with prompts
--template <name>, -tmpl <name>  Use predefined template configuration
--output <dir>, -o <dir>        Specify output directory for configuration files
--verbose, -v                   Show detailed initialization process
```

---

## 👥 **CREW MANAGEMENT**

### **Crew Discovery & Self-Improvement**

#### **`alexi crew-discovery start <crewMember>`**
**Purpose**: Begin crew member self-discovery and improvement process.

**What it does**:
- Initiates self-analysis for specific crew member
- Identifies areas for improvement
- Creates learning plan based on project needs
- Tracks progress and development

**When to use**:
- **Project setup**: Optimize crew for specific project requirements
- **Performance issues**: When crew member isn't performing optimally
- **New features**: Prepare crew for new project requirements
- **Team growth**: Develop crew capabilities over time

**Natural Language Examples**:
```
"Start Commander Data's self-discovery for machine learning projects"
"Begin Captain Picard's strategic planning improvement"
"Initiate Lieutenant Worf's security expertise development"
"Start crew discovery for our new DevOps requirements"
```

**CLI Examples**:
```bash
# Start discovery for specific crew member
alexi crew-discovery start "Commander Data"
alexi crew-discovery start "Captain Picard"
alexi crew-discovery start "Lieutenant Worf"

# Start with specific focus area
alexi crew-discovery start "Commander Data" --focus "machine-learning"
alexi crew-discovery start "Captain Picard" --focus "strategic-planning"

# Start discovery for all crew members
alexi crew-discovery start --all
```

**Command Options**:
```bash
alexi crew-discovery start --help
# or
alexi crew-discovery start -h

# Available options:
--focus <area>, -f <area>      Focus on specific area: machine-learning, strategic-planning, security, engineering, etc.
--all, -a                     Start discovery for all crew members
--force, -force               Force restart even if discovery is already active
--config <file>, -c <file>    Use custom discovery configuration
--timeout <seconds>, -t <seconds> Set discovery timeout in seconds
--interactive, -i             Interactive discovery with user prompts
--output <format>, -o <format> Output format: text, json, yaml
--verbose, -v                 Show detailed discovery process
--dry-run, -d                 Show what would be discovered without starting
--resume, -r                  Resume previous discovery session
```

---

#### **`alexi crew-discovery add-feature <member> <name> <desc> <category>`**
**Purpose**: Add new capabilities to crew members.

**What it does**:
- Extends crew member capabilities
- Integrates new features with existing knowledge
- Updates crew member profile and specializations
- Enables new use cases and scenarios

**When to use**:
- **New technologies**: Add support for new frameworks or tools
- **Project requirements**: Extend capabilities for specific needs
- **Team growth**: Develop crew member expertise
- **Innovation**: Experiment with new capabilities

**Natural Language Examples**:
```
"Add Kubernetes expertise to Commander Data"
"Give Captain Picard advanced project management capabilities"
"Add GraphQL knowledge to Geordi La Forge"
"Extend Lieutenant Worf's security knowledge to include OWASP Top 10"
```

**CLI Examples**:
```bash
# Add feature to specific crew member
alexi crew-discovery add-feature "Commander Data" "Kubernetes" "Container orchestration expertise" "infrastructure"

# Add with impact level
alexi crew-discovery add-feature "Captain Picard" "Strategic Planning" "Advanced strategic planning" "capability" --impact high

# Add multiple features
alexi crew-discovery add-feature "Geordi La Forge" "GraphQL" "GraphQL API development" "api" --impact medium
alexi crew-discovery add-feature "Lieutenant Worf" "OWASP" "OWASP security standards" "security" --impact high
```

**Command Options**:
```bash
alexi crew-discovery add-feature --help
# or
alexi crew-discovery add-feature -h

# Available options:
--impact <level>, -i <level>    Set impact level: low, medium, high, critical
--category <cat>, -c <cat>     Set feature category: technical, capability, security, infrastructure, api, etc.
--priority <level>, -p <level> Set priority level: low, medium, high
--tags <tags>, -t <tags>       Add comma-separated tags to feature
--version <ver>, -v <ver>      Set feature version
--dependencies <deps>, -d <deps> Specify feature dependencies
--documentation <doc>, -doc <doc> Add feature documentation
--examples <examples>, -e <examples> Add usage examples
--force, -f                    Force add feature even if conflicts exist
--dry-run, -dr                 Show what would be added without adding
--verbose, -verbose            Show detailed feature addition process
```

---

#### **`alexi crew-discovery introspect <member>`**
**Purpose**: Deep analysis of crew member's current state and capabilities.

**What it does**:
- Analyzes crew member's knowledge base
- Identifies strengths and weaknesses
- Provides detailed capability assessment
- Suggests improvement opportunities

**When to use**:
- **Performance review**: Assess crew member effectiveness
- **Capability audit**: Understand current skills and knowledge
- **Optimization**: Identify areas for improvement
- **Planning**: Prepare for upcoming project requirements

**Natural Language Examples**:
```
"Analyze Commander Data's current technical capabilities"
"Introspect Captain Picard's strategic planning skills"
"Review Lieutenant Worf's security knowledge base"
"Assess the crew's overall readiness for our next project"
```

**CLI Examples**:
```bash
# Introspect specific crew member
alexi crew-discovery introspect "Commander Data"
alexi crew-discovery introspect "Captain Picard"

# Introspect with detailed analysis
alexi crew-discovery introspect "Lieutenant Worf" --detailed

# Introspect all crew members
alexi crew-discovery introspect --all

# Introspect with specific focus
alexi crew-discovery introspect "Commander Data" --focus "machine-learning"
```

**Command Options**:
```bash
alexi crew-discovery introspect --help
# or
alexi crew-discovery introspect -h

# Available options:
--detailed, -d               Show detailed analysis with metrics
--focus <area>, -f <area>    Focus analysis on specific area: technical, strategic, security, etc.
--all, -a                   Introspect all crew members
--format <type>, -fmt <type> Output format: text, json, yaml, html
--include-metrics, -m        Include performance metrics in analysis
--include-history, -h        Include historical analysis data
--include-recommendations, -r Include improvement recommendations
--output <file>, -o <file>   Save analysis to file
--verbose, -v               Show detailed introspection process
--timeout <seconds>, -t <seconds> Set introspection timeout
--compare <member>, -c <member> Compare with another crew member
```

---

#### **`alexi crew-discovery complete <member>`**
**Purpose**: Complete crew member's current learning cycle.

**What it does**:
- Finalizes current learning objectives
- Integrates new knowledge with existing capabilities
- Updates crew member profile
- Prepares for next learning cycle

**When to use**:
- **Learning completion**: When crew member has achieved learning goals
- **Project milestones**: Complete learning cycles at project milestones
- **Performance optimization**: Finalize improvements before next phase
- **Team development**: Complete team growth cycles

**Natural Language Examples**:
```
"Complete Commander Data's machine learning training"
"Finalize Captain Picard's strategic planning development"
"Complete Lieutenant Worf's security certification process"
"Finish the crew's DevOps transformation learning"
```

**CLI Examples**:
```bash
# Complete learning for specific crew member
alexi crew-discovery complete "Commander Data"
alexi crew-discovery complete "Captain Picard"

# Complete with summary
alexi crew-discovery complete "Lieutenant Worf" --summary

# Complete all active learning cycles
alexi crew-discovery complete --all

# Complete with specific learning objective
alexi crew-discovery complete "Commander Data" --objective "machine-learning"
```

**Command Options**:
```bash
alexi crew-discovery complete --help
# or
alexi crew-discovery complete -h

# Available options:
--summary, -s               Show completion summary
--objective <obj>, -o <obj> Complete specific learning objective
--all, -a                  Complete all active learning cycles
--force, -f                Force completion even if objectives not met
--save-report, -save        Save completion report to file
--format <type>, -fmt <type> Report format: text, json, yaml
--include-metrics, -m       Include learning metrics in completion
--next-cycle, -n            Prepare for next learning cycle
--verbose, -v              Show detailed completion process
--dry-run, -d              Show what would be completed without completing
```

---

#### **`alexi crew-discovery list-features <member>`**
**Purpose**: Display all capabilities and features of a crew member.

**What it does**:
- Lists all current capabilities
- Shows feature categories and descriptions
- Displays impact levels and usage statistics
- Provides capability overview

**When to use**:
- **Capability review**: Understand what crew member can do
- **Team planning**: Plan project assignments based on capabilities
- **Documentation**: Create capability documentation
- **Optimization**: Identify unused or underutilized features

**Natural Language Examples**:
```
"Show me all of Commander Data's technical capabilities"
"List Captain Picard's strategic planning features"
"Display Lieutenant Worf's security expertise"
"What can the crew do for our project?"
```

**CLI Examples**:
```bash
# List features for specific crew member
alexi crew-discovery list-features "Commander Data"
alexi crew-discovery list-features "Captain Picard"

# List with detailed descriptions
alexi crew-discovery list-features "Lieutenant Worf" --detailed

# List features by category
alexi crew-discovery list-features "Commander Data" --category "technical"

# List all crew member features
alexi crew-discovery list-features --all
```

**Command Options**:
```bash
alexi crew-discovery list-features --help
# or
alexi crew-discovery list-features -h

# Available options:
--detailed, -d              Show detailed feature descriptions
--category <cat>, -c <cat>  Filter features by category: technical, security, api, etc.
--impact <level>, -i <level> Filter by impact level: low, medium, high, critical
--all, -a                  List features for all crew members
--format <type>, -fmt <type> Output format: text, json, yaml, table
--sort-by <field>, -s <field> Sort by: name, category, impact, priority, version
--search <term>, -search <term> Search features by name or description
--include-examples, -e      Include usage examples for features
--include-metrics, -m       Include feature usage metrics
--output <file>, -o <file>  Save feature list to file
--verbose, -v              Show detailed feature information
```

---

#### **`alexi crew-discovery stats <member>`**
**Purpose**: Display statistics and performance metrics for crew members.

**What it does**:
- Shows usage statistics
- Displays performance metrics
- Provides learning progress data
- Shows memory and knowledge base statistics

**When to use**:
- **Performance monitoring**: Track crew member effectiveness
- **Usage analysis**: Understand how crew members are being used
- **Progress tracking**: Monitor learning and development
- **Optimization**: Identify performance bottlenecks

**Natural Language Examples**:
```
"Show me Commander Data's performance statistics"
"Display Captain Picard's usage metrics"
"What are Lieutenant Worf's learning progress stats?"
"Give me the crew's overall performance report"
```

**CLI Examples**:
```bash
# Stats for specific crew member
alexi crew-discovery stats "Commander Data"
alexi crew-discovery stats "Captain Picard"

# Detailed statistics
alexi crew-discovery stats "Lieutenant Worf" --detailed

# Stats for all crew members
alexi crew-discovery stats --all

# Stats with time range
alexi crew-discovery stats "Commander Data" --time-range "last-week"
```

**Command Options**:
```bash
alexi crew-discovery stats --help
# or
alexi crew-discovery stats -h

# Available options:
--detailed, -d               Show detailed statistics and metrics
--time-range <range>, -t <range> Time range: last-hour, last-day, last-week, last-month, last-year
--all, -a                   Show stats for all crew members
--format <type>, -fmt <type> Output format: text, json, yaml, csv
--include-history, -h        Include historical statistics
--include-trends, -tr        Include trend analysis
--include-comparisons, -c    Include comparisons with other crew members
--output <file>, -o <file>   Save statistics to file
--sort-by <field>, -s <field> Sort by: performance, usage, learning, efficiency
--filter <criteria>, -f <criteria> Filter statistics by criteria
--verbose, -v               Show detailed statistics calculation
```

---

#### **`alexi crew-discovery demo <member>`**
**Purpose**: Demonstrate crew member capabilities through interactive examples.

**What it does**:
- Shows crew member in action
- Provides interactive examples
- Demonstrates key capabilities
- Allows hands-on exploration

**When to use**:
- **Learning**: Understand crew member capabilities
- **Training**: Learn how to use crew members effectively
- **Evaluation**: Test crew member performance
- **Onboarding**: Introduce new team members to crew capabilities

**Natural Language Examples**:
```
"Demonstrate Commander Data's analytical capabilities"
"Show me Captain Picard's strategic planning in action"
"Demo Lieutenant Worf's security analysis"
"Let me see the crew's collaborative capabilities"
```

**CLI Examples**:
```bash
# Demo specific crew member
alexi crew-discovery demo "Commander Data"
alexi crew-discovery demo "Captain Picard"

# Demo with specific scenario
alexi crew-discovery demo "Lieutenant Worf" --scenario "security-audit"

# Interactive demo
alexi crew-discovery demo "Commander Data" --interactive

# Demo all crew members
alexi crew-discovery demo --all
```

**Command Options**:
```bash
alexi crew-discovery demo --help
# or
alexi crew-discovery demo -h

# Available options:
--scenario <scenario>, -s <scenario> Use specific demo scenario: security-audit, code-review, architecture-design, etc.
--interactive, -i             Enable interactive demo mode
--all, -a                    Demo all crew members
--format <type>, -fmt <type>  Demo output format: text, json, html
--duration <seconds>, -d <seconds> Set demo duration in seconds
--include-examples, -e        Include practical examples in demo
--include-metrics, -m         Show performance metrics during demo
--output <file>, -o <file>    Save demo output to file
--record, -r                 Record demo session for replay
--playback <file>, -p <file>  Playback recorded demo session
--verbose, -v                Show detailed demo process
--step-by-step, -step        Show demo step by step with pauses
```

---

### **Crew Consciousness**

#### **`alexi crew-consciousness demo`**
**Purpose**: Demonstrate advanced crew coordination and collective intelligence.

**What it does**:
- Shows crew working together
- Demonstrates collective problem-solving
- Displays crew consciousness capabilities
- Provides examples of crew collaboration

**When to use**:
- **Complex problems**: When individual crew members aren't enough
- **Team coordination**: Demonstrate crew collaboration
- **Learning**: Understand crew consciousness capabilities
- **Evaluation**: Test crew collective intelligence

**Natural Language Examples**:
```
"Demonstrate the crew's collective problem-solving abilities"
"Show me how the crew works together on complex challenges"
"Demo the crew consciousness system"
"Let me see the crew's collaborative intelligence in action"
```

**CLI Examples**:
```bash
# Basic crew consciousness demo
alexi crew-consciousness demo

# Demo with specific scenario
alexi crew-consciousness demo --scenario "complex-architecture"

# Interactive demo
alexi crew-consciousness demo --interactive

# Demo with specific crew members
alexi crew-consciousness demo --crew "Captain Picard,Commander Data"
```

**Command Options**:
```bash
alexi crew-consciousness demo --help
# or
alexi crew-consciousness demo -h

# Available options:
--scenario <scenario>, -s <scenario> Use specific scenario: complex-architecture, team-coordination, problem-solving, etc.
--interactive, -i             Enable interactive demo mode
--crew <members>, -c <members> Specify crew members to include (comma-separated)
--format <type>, -fmt <type>  Demo output format: text, json, html
--duration <seconds>, -d <seconds> Set demo duration in seconds
--include-analysis, -a        Include detailed crew analysis
--include-insights, -ins      Include collective insights generation
--include-coordination, -coord Include crew coordination examples
--output <file>, -o <file>    Save demo output to file
--record, -r                 Record demo session for replay
--verbose, -v                Show detailed demo process
--step-by-step, -step        Show demo step by step with pauses
```

---

## 🔄 **WORKFLOW & AUTOMATION**

### **N8N Workflow Management**

#### **`alexi n8n-workflows update-all`**
**Purpose**: Update all N8N workflows with latest crew configurations.

**What it does**:
- Synchronizes all workflows with current crew state
- Updates crew member configurations
- Refreshes workflow definitions
- Ensures consistency across all workflows

**When to use**:
- **After crew changes**: When crew members have been updated
- **Regular maintenance**: Keep workflows current
- **Deployment**: Before deploying new workflow versions
- **Troubleshooting**: When workflows seem out of sync

**Natural Language Examples**:
```
"Update all N8N workflows with the latest crew configurations"
"Sync all workflows after crew member updates"
"Refresh N8N workflows for the new project requirements"
"Update workflows before the next deployment"
```

**CLI Examples**:
```bash
# Update all workflows
alexi n8n-workflows update-all

# Update with specific options
alexi n8n-workflows update-all --force
alexi n8n-workflows update-all --dry-run

# Update with verbose output
alexi n8n-workflows update-all --verbose
```

**Command Options**:
```bash
alexi n8n-workflows update-all --help
# or
alexi n8n-workflows update-all -h

# Available options:
--force, -f                Force update even if workflows are current
--dry-run, -d              Show what would be updated without updating
--verbose, -v              Show detailed update process
--backup, -b               Create backup before updating
--rollback <version>, -r <version> Rollback to specific version
--parallel, -p             Update workflows in parallel for speed
--timeout <seconds>, -t <seconds> Set update timeout in seconds
--include-crew, -c         Include crew-specific workflows
--include-memory, -m       Include memory-related workflows
--include-security, -s     Include security workflows
--output <file>, -o <file> Save update log to file
--format <type>, -fmt <type> Output format: text, json, yaml
```

---

#### **`alexi n8n-workflows update-crew`**
**Purpose**: Update crew-specific workflows in N8N.

**What it does**:
- Updates workflows related to crew operations
- Synchronizes crew member workflows
- Refreshes crew-specific automation
- Ensures crew workflows are current

**When to use**:
- **Crew updates**: After modifying crew member capabilities
- **Workflow maintenance**: Regular crew workflow updates
- **New crew features**: When adding new crew capabilities
- **Performance optimization**: Update crew workflows for better performance

**Natural Language Examples**:
```
"Update crew workflows in N8N"
"Sync crew member workflows with latest configurations"
"Refresh crew automation workflows"
"Update crew workflows for the new project setup"
```

**CLI Examples**:
```bash
# Update crew workflows
alexi n8n-workflows update-crew

# Update specific crew member workflows
alexi n8n-workflows update-crew --member "Commander Data"

# Update with force
alexi n8n-workflows update-crew --force

# Update with dry run
alexi n8n-workflows update-crew --dry-run
```

**Command Options**:
```bash
alexi n8n-workflows update-crew --help
# or
alexi n8n-workflows update-crew -h

# Available options:
--member <name>, -m <name>   Update workflows for specific crew member
--force, -f                Force update even if workflows are current
--dry-run, -d              Show what would be updated without updating
--verbose, -v              Show detailed update process
--backup, -b               Create backup before updating
--parallel, -p             Update crew workflows in parallel
--timeout <seconds>, -t <seconds> Set update timeout in seconds
--include-features, -feat   Include crew member features in update
--include-learning, -learn Include learning workflows
--output <file>, -o <file> Save update log to file
--format <type>, -fmt <type> Output format: text, json, yaml
```

---

#### **`alexi n8n-workflows retrieve-memories`**
**Purpose**: Retrieve and sync memories from N8N workflows.

**What it does**:
- Fetches memories stored in N8N workflows
- Synchronizes memory data with RAG system
- Updates local memory cache
- Ensures memory consistency

**When to use**:
- **Memory sync**: Keep local and remote memories in sync
- **Data recovery**: Restore memories from N8N
- **Migration**: Move memories between systems
- **Backup**: Retrieve memories from backup workflows

**Natural Language Examples**:
```
"Retrieve all memories from N8N workflows"
"Sync memories from the N8N system"
"Restore memories from N8N backup"
"Update local memories with N8N data"
```

**CLI Examples**:
```bash
# Retrieve all memories
alexi n8n-workflows retrieve-memories

# Retrieve specific memory types
alexi n8n-workflows retrieve-memories --type "project-insights"

# Retrieve with filtering
alexi n8n-workflows retrieve-memories --filter "last-week"

# Retrieve with verbose output
alexi n8n-workflows retrieve-memories --verbose
```

**Command Options**:
```bash
alexi n8n-workflows retrieve-memories --help
# or
alexi n8n-workflows retrieve-memories -h

# Available options:
--type <type>, -t <type>     Retrieve specific memory types: project-insights, technical-learning, client-understanding, etc.
--filter <criteria>, -f <criteria> Filter memories by criteria: date, crew-member, category
--format <type>, -fmt <type> Output format: text, json, yaml, csv
--verbose, -v               Show detailed retrieval process
--backup, -b                Create backup before retrieval
--sync, -s                  Sync with local memory system
--validate, -val            Validate retrieved memories
--output <file>, -o <file>  Save retrieved memories to file
--include-metadata, -m      Include memory metadata
--include-tags, -tags       Include memory tags
--timeout <seconds>, -timeout <seconds> Set retrieval timeout
```

---

#### **`alexi n8n-workflows memory-stats`**
**Purpose**: Display memory statistics from N8N workflows.

**What it does**:
- Shows memory usage statistics
- Displays memory distribution
- Provides memory health metrics
- Shows memory growth trends

**When to use**:
- **Memory monitoring**: Track memory usage and growth
- **Performance analysis**: Understand memory patterns
- **Capacity planning**: Plan for memory growth
- **Health checks**: Monitor memory system health

**Natural Language Examples**:
```
"Show me N8N memory statistics"
"Display memory usage from N8N workflows"
"What's the current memory distribution?"
"Give me memory health metrics"
```

**CLI Examples**:
```bash
# Basic memory stats
alexi n8n-workflows memory-stats

# Detailed memory statistics
alexi n8n-workflows memory-stats --detailed

# Memory stats with time range
alexi n8n-workflows memory-stats --time-range "last-month"

# Memory stats by type
alexi n8n-workflows memory-stats --by-type
```

**Command Options**:
```bash
alexi n8n-workflows memory-stats --help
# or
alexi n8n-workflows memory-stats -h

# Available options:
--detailed, -d               Show detailed memory statistics
--time-range <range>, -t <range> Time range: last-hour, last-day, last-week, last-month, last-year
--by-type, -type             Group statistics by memory type
--by-crew, -crew             Group statistics by crew member
--format <type>, -fmt <type> Output format: text, json, yaml, csv
--include-trends, -trends    Include trend analysis
--include-growth, -growth    Include growth metrics
--include-usage, -usage      Include usage statistics
--output <file>, -o <file>   Save statistics to file
--compare <period>, -c <period> Compare with previous period
--verbose, -v               Show detailed statistics calculation
```

---

#### **`alexi n8n-workflows optimize-storage`**
**Purpose**: Optimize memory storage in N8N workflows.

**What it does**:
- Compresses and optimizes memory storage
- Removes duplicate or outdated memories
- Optimizes memory structure
- Improves storage efficiency

**When to use**:
- **Performance optimization**: Improve memory system performance
- **Storage management**: Reduce memory storage usage
- **Maintenance**: Regular memory optimization
- **Cleanup**: Remove outdated or duplicate memories

**Natural Language Examples**:
```
"Optimize N8N memory storage"
"Clean up and compress memory data"
"Remove duplicate memories from N8N"
"Optimize memory storage for better performance"
```

**CLI Examples**:
```bash
# Optimize storage
alexi n8n-workflows optimize-storage

# Optimize with specific options
alexi n8n-workflows optimize-storage --aggressive
alexi n8n-workflows optimize-storage --dry-run

# Optimize specific memory types
alexi n8n-workflows optimize-storage --type "old-memories"
```

**Command Options**:
```bash
alexi n8n-workflows optimize-storage --help
# or
alexi n8n-workflows optimize-storage -h

# Available options:
--aggressive, -a             Perform aggressive optimization
--dry-run, -d               Show what would be optimized without optimizing
--type <type>, -t <type>     Optimize specific memory types: old-memories, duplicate-memories, unused-memories
--format <type>, -fmt <type> Output format: text, json, yaml
--backup, -b                Create backup before optimization
--compress, -c              Enable compression during optimization
--remove-duplicates, -rd    Remove duplicate memories
--archive-old, -ao          Archive old memories instead of deleting
--output <file>, -o <file>  Save optimization report to file
--verbose, -v               Show detailed optimization process
--timeout <seconds>, -timeout <seconds> Set optimization timeout
```

---

#### **`alexi n8n-workflows test-connection`**
**Purpose**: Test connection to N8N instance.

**What it does**:
- Verifies N8N connectivity
- Tests authentication
- Checks workflow access
- Validates configuration

**When to use**:
- **Setup verification**: After initial N8N configuration
- **Troubleshooting**: When experiencing connection issues
- **Health checks**: Regular connectivity verification
- **Migration**: After moving N8N instances

**Natural Language Examples**:
```
"Test connection to N8N"
"Verify N8N connectivity"
"Check if N8N is accessible"
"Validate N8N configuration"
```

**CLI Examples**:
```bash
# Test connection
alexi n8n-workflows test-connection

# Test with verbose output
alexi n8n-workflows test-connection --verbose

# Test specific N8N instance
alexi n8n-workflows test-connection --url "https://n8n.example.com"

# Test with authentication
alexi n8n-workflows test-connection --auth
```

**Command Options**:
```bash
alexi n8n-workflows test-connection --help
# or
alexi n8n-workflows test-connection -h

# Available options:
--verbose, -v               Show detailed connection test information
--url <url>, -u <url>       Test connection to specific N8N URL
--auth, -a                  Test authentication credentials
--timeout <seconds>, -t <seconds> Set connection timeout in seconds
--retries <count>, -r <count> Number of connection retry attempts
--format <type>, -fmt <type> Output format: text, json, yaml
--include-workflows, -w     Test workflow access
--include-executions, -e    Test execution access
--include-credentials, -c   Test credentials access
--output <file>, -o <file>  Save test results to file
--benchmark, -b             Run connection benchmark test
--diagnose, -d              Run detailed connection diagnostics
```

---

#### **`alexi n8n-workflows demo`**
**Purpose**: Demonstrate N8N workflow capabilities.

**What it does**:
- Shows N8N workflow functionality
- Demonstrates workflow automation
- Provides interactive examples
- Shows integration capabilities

**When to use**:
- **Learning**: Understand N8N workflow capabilities
- **Training**: Learn how to use N8N workflows
- **Evaluation**: Test N8N workflow functionality
- **Onboarding**: Introduce team to N8N workflows

**Natural Language Examples**:
```
"Demonstrate N8N workflow capabilities"
"Show me how N8N workflows work"
"Demo the workflow automation system"
"Let me see N8N integration in action"
```

**CLI Examples**:
```bash
# Basic demo
alexi n8n-workflows demo

# Demo with specific workflow
alexi n8n-workflows demo --workflow "crew-coordination"

# Interactive demo
alexi n8n-workflows demo --interactive

# Demo with specific scenario
alexi n8n-workflows demo --scenario "project-setup"
```

**Command Options**:
```bash
alexi n8n-workflows demo --help
# or
alexi n8n-workflows demo -h

# Available options:
--workflow <name>, -w <name>  Demo specific workflow by name
--scenario <scenario>, -s <scenario> Use specific demo scenario: project-setup, crew-coordination, memory-sync, etc.
--interactive, -i             Enable interactive demo mode
--format <type>, -fmt <type>  Demo output format: text, json, html
--duration <seconds>, -d <seconds> Set demo duration in seconds
--include-execution, -e       Include workflow execution examples
--include-monitoring, -m      Include workflow monitoring examples
--include-troubleshooting, -t Include troubleshooting examples
--output <file>, -o <file>    Save demo output to file
--record, -r                 Record demo session for replay
--verbose, -v                Show detailed demo process
--step-by-step, -step        Show demo step by step with pauses
```

---

### **Scenario Analysis**

#### **`alexi scenario-analysis run`**
**Purpose**: Run comprehensive scenario analysis of the project.

**What it does**:
- Analyzes project structure and requirements
- Evaluates crew member effectiveness
- Identifies optimization opportunities
- Provides comprehensive project insights

**When to use**:
- **Project assessment**: Understand project current state
- **Optimization**: Identify areas for improvement
- **Planning**: Prepare for project phases
- **Evaluation**: Assess project health and progress

**Natural Language Examples**:
```
"Run a comprehensive analysis of this project"
"Analyze the current project state and requirements"
"Evaluate how well the crew is performing"
"Give me a complete project assessment"
```

**CLI Examples**:
```bash
# Run scenario analysis
alexi scenario-analysis run

# Run with specific focus
alexi scenario-analysis run --focus "performance"
alexi scenario-analysis run --focus "security"

# Run with detailed output
alexi scenario-analysis run --detailed

# Run with specific crew members
alexi scenario-analysis run --crew "Commander Data,Captain Picard"
```

**Command Options**:
```bash
alexi scenario-analysis run --help
# or
alexi scenario-analysis run -h

# Available options:
--focus <area>, -f <area>    Focus analysis on specific area: performance, security, architecture, etc.
--detailed, -d              Show detailed analysis with metrics
--crew <members>, -c <members> Include specific crew members (comma-separated)
--format <type>, -fmt <type> Output format: text, json, yaml, html
--include-recommendations, -r Include improvement recommendations
--include-metrics, -m       Include performance metrics
--include-trends, -t        Include trend analysis
--output <file>, -o <file>  Save analysis to file
--parallel, -p              Run analysis in parallel for speed
--timeout <seconds>, -timeout <seconds> Set analysis timeout
--verbose, -v               Show detailed analysis process
```

---

#### **`alexi scenario-analysis end-to-end-test`**
**Purpose**: Run complete end-to-end test of the Alex AI system.

**What it does**:
- Tests all system components
- Verifies crew coordination
- Tests memory systems
- Validates workflow integration

**When to use**:
- **System validation**: Verify all systems are working
- **Pre-deployment**: Before major releases
- **Troubleshooting**: When experiencing system issues
- **Health checks**: Regular system validation

**Natural Language Examples**:
```
"Run a complete system test"
"Test all Alex AI components end-to-end"
"Verify the entire system is working properly"
"Perform a comprehensive system validation"
```

**CLI Examples**:
```bash
# Run end-to-end test
alexi scenario-analysis end-to-end-test

# Run with verbose output
alexi scenario-analysis end-to-end-test --verbose

# Run specific test components
alexi scenario-analysis end-to-end-test --components "crew,memory"

# Run with detailed reporting
alexi scenario-analysis end-to-end-test --detailed
```

**Command Options**:
```bash
alexi scenario-analysis end-to-end-test --help
# or
alexi scenario-analysis end-to-end-test -h

# Available options:
--verbose, -v               Show detailed test process and results
--components <list>, -c <list> Test specific components: crew,memory,n8n,security (comma-separated)
--format <type>, -fmt <type> Output format: text, json, yaml, html
--detailed, -d              Show detailed test results and metrics
--parallel, -p              Run tests in parallel for speed
--timeout <seconds>, -t <seconds> Set test timeout in seconds
--include-performance, -perf Include performance testing
--include-security, -sec   Include security testing
--include-integration, -int Include integration testing
--output <file>, -o <file>  Save test results to file
--retry <count>, -r <count> Number of retry attempts for failed tests
--benchmark, -b             Run benchmark tests
```

---

#### **`alexi scenario-analysis details`**
**Purpose**: Display detailed information about scenario analysis.

**What it does**:
- Shows scenario analysis configuration
- Displays available scenarios
- Provides analysis options
- Shows historical analysis data

**When to use**:
- **Configuration review**: Understand analysis settings
- **Planning**: Plan analysis approach
- **Documentation**: Create analysis documentation
- **Optimization**: Optimize analysis parameters

**Natural Language Examples**:
```
"Show me scenario analysis details"
"Display available analysis scenarios"
"What analysis options are available?"
"Give me the analysis configuration"
```

**CLI Examples**:
```bash
# Show analysis details
alexi scenario-analysis details

# Show with specific scenario
alexi scenario-analysis details --scenario "project-assessment"

# Show with verbose output
alexi scenario-analysis details --verbose

# Show historical data
alexi scenario-analysis details --history
```

**Command Options**:
```bash
alexi scenario-analysis details --help
# or
alexi scenario-analysis details -h

# Available options:
--scenario <name>, -s <name>  Show details for specific scenario
--verbose, -v               Show detailed information
--history, -h               Show historical analysis data
--format <type>, -fmt <type> Output format: text, json, yaml, html
--include-config, -c        Include configuration details
--include-metrics, -m       Include performance metrics
--include-examples, -e      Include usage examples
--output <file>, -o <file>  Save details to file
--compare <scenario>, -comp <scenario> Compare with another scenario
--export, -exp              Export scenario configuration
--import <file>, -imp <file> Import scenario configuration
```

---

#### **`alexi scenario-analysis test-crew <member>`**
**Purpose**: Test individual crew member learning and capabilities.

**What it does**:
- Tests specific crew member performance
- Evaluates learning progress
- Identifies improvement areas
- Provides crew member assessment

**When to use**:
- **Individual assessment**: Evaluate specific crew member
- **Learning validation**: Verify learning progress
- **Performance review**: Assess crew member effectiveness
- **Optimization**: Identify crew member improvement needs

**Natural Language Examples**:
```
"Test Commander Data's learning progress"
"Evaluate Captain Picard's performance"
"Assess Lieutenant Worf's capabilities"
"Test the crew member's current skills"
```

**CLI Examples**:
```bash
# Test specific crew member
alexi scenario-analysis test-crew "Commander Data"
alexi scenario-analysis test-crew "Captain Picard"

# Test with specific focus
alexi scenario-analysis test-crew "Lieutenant Worf" --focus "security"

# Test with detailed output
alexi scenario-analysis test-crew "Commander Data" --detailed

# Test with specific scenario
alexi scenario-analysis test-crew "Captain Picard" --scenario "strategic-planning"
```

**Command Options**:
```bash
alexi scenario-analysis test-crew --help
# or
alexi scenario-analysis test-crew -h

# Available options:
--focus <area>, -f <area>    Focus test on specific area: technical, strategic, security, etc.
--detailed, -d              Show detailed test results
--scenario <scenario>, -s <scenario> Use specific test scenario: strategic-planning, code-analysis, security-audit, etc.
--format <type>, -fmt <type> Output format: text, json, yaml, html
--include-metrics, -m       Include performance metrics
--include-learning, -l      Include learning progress assessment
--include-recommendations, -r Include improvement recommendations
--output <file>, -o <file>  Save test results to file
--timeout <seconds>, -t <seconds> Set test timeout
--compare <member>, -c <member> Compare with another crew member
--verbose, -v               Show detailed test process
--benchmark, -b             Run benchmark tests
```

---

### **🖖 Observation Lounge**

#### **`alexi scenario-analysis observation-lounge`**
**Purpose**: Conduct cinematic crew stand-up meeting with specialized findings.

**What it does**:
- Gathers crew members for cinematic presentation
- Each crew member presents findings in character
- Provides comprehensive project insights
- Creates immersive storytelling experience

**When to use**:
- **Daily stand-ups**: Regular team alignment meetings
- **Project reviews**: After major milestones
- **Learning sessions**: Crew knowledge sharing
- **Team building**: Foster crew collaboration and morale

**Natural Language Examples**:
```
"Gather the crew in the Observation Lounge for a stand-up meeting"
"Let's have a cinematic crew debrief on the project status"
"Conduct an Observation Lounge session for team alignment"
"Bring the crew together for a learning debrief"
```

**CLI Examples**:
```bash
# Basic Observation Lounge session
alexi scenario-analysis observation-lounge

# Observation Lounge with specific focus
alexi scenario-analysis observation-lounge --focus "project-status"
alexi scenario-analysis observation-lounge --focus "learning-review"

# Observation Lounge with specific crew members
alexi scenario-analysis observation-lounge --crew "Captain Picard,Commander Data"

# Observation Lounge with detailed output
alexi scenario-analysis observation-lounge --detailed
```

**Command Options**:
```bash
alexi scenario-analysis observation-lounge --help
# or
alexi scenario-analysis observation-lounge -h

# Available options:
--focus <focus>, -f <focus>    Focus on specific area: project-status, learning-review, daily-standup, deployment-readiness
--crew <members>, -c <members> Include specific crew members (comma-separated)
--detailed, -d                Show detailed crew presentations
--format <type>, -fmt <type>  Output format: text, json, html, screenplay
--cinematic, -cin             Enable full cinematic screenplay format
--interactive, -i             Enable interactive crew presentations
--include-metrics, -m         Include crew performance metrics
--include-insights, -ins      Include collective insights generation
--output <file>, -o <file>    Save session to file
--record, -r                  Record session for replay
--duration <minutes>, -dur <minutes> Set session duration in minutes
--verbose, -v                 Show detailed session process
--step-by-step, -step         Show crew presentations step by step
```

---

## 🔐 **SECURITY & ENTERPRISE**

### **Enterprise Security System**

#### **`alexi security audit`**
**Purpose**: Conduct comprehensive security audit of the project.

**What it does**:
- Analyzes code for security vulnerabilities
- Checks for compliance with security standards
- Evaluates security configurations
- Provides security recommendations

**When to use**:
- **Pre-deployment**: Before releasing to production
- **Regular audits**: Scheduled security assessments
- **Compliance**: Meet regulatory requirements
- **Incident response**: After security incidents

**Natural Language Examples**:
```
"Conduct a security audit of this project"
"Check for security vulnerabilities in the code"
"Perform a compliance security assessment"
"Audit the security configuration"
```

**CLI Examples**:
```bash
# Basic security audit
alexi security audit

# Audit with specific standards
alexi security audit --standard "OWASP"
alexi security audit --standard "PCI-DSS"

# Audit with detailed reporting
alexi security audit --detailed

# Audit specific components
alexi security audit --components "api,database"
```

**Command Options**:
```bash
alexi security audit --help
# or
alexi security audit -h

# Available options:
--standard <std>, -s <std>    Security standard: OWASP, PCI-DSS, SOC2, ISO27001, HIPAA
--detailed, -d               Show detailed audit results
--components <list>, -c <list> Audit specific components: api,database,frontend,infrastructure (comma-separated)
--format <type>, -fmt <type> Output format: text, json, yaml, html
--include-recommendations, -r Include security recommendations
--include-remediation, -rem  Include remediation steps
--include-compliance, -comp  Include compliance assessment
--output <file>, -o <file>   Save audit report to file
--severity <level>, -sev <level> Filter by severity: low, medium, high, critical
--ignore <patterns>, -i <patterns> Ignore specific patterns or files
--verbose, -v               Show detailed audit process
--parallel, -p              Run audit in parallel for speed
```

---

#### **`alexi security classify`**
**Purpose**: Classify data and content according to security levels.

**What it does**:
- Analyzes content for sensitivity
- Applies appropriate security classifications
- Ensures compliance with data handling policies
- Protects sensitive information

**When to use**:
- **Data handling**: When processing sensitive data
- **Compliance**: Meet data classification requirements
- **Security policies**: Enforce security classifications
- **Risk management**: Identify sensitive content

**Natural Language Examples**:
```
"Classify this data according to security levels"
"Apply security classifications to the content"
"Ensure proper data classification for compliance"
"Identify and classify sensitive information"
```

**CLI Examples**:
```bash
# Classify content
alexi security classify --content "sensitive data"

# Classify with specific level
alexi security classify --level "confidential" --content "user data"

# Classify with policy
alexi security classify --policy "enterprise" --content "financial data"

# Classify with detailed output
alexi security classify --detailed --content "personal information"
```

**Command Options**:
```bash
alexi security classify --help
# or
alexi security classify -h

# Available options:
--level <level>, -l <level>   Classification level: public, internal, confidential, secret, top-secret
--content <content>, -c <content> Content to classify (text or file path)
--policy <policy>, -p <policy> Use specific classification policy: enterprise, government, healthcare, financial
--detailed, -d               Show detailed classification reasoning
--format <type>, -fmt <type> Output format: text, json, yaml, html
--include-recommendations, -r Include handling recommendations
--include-tags, -t           Include security tags
--include-handling, -h       Include data handling instructions
--output <file>, -o <file>   Save classification report to file
--batch <file>, -b <file>    Process multiple items from file
--validate, -v               Validate existing classifications
--auto-classify, -a          Enable automatic classification
--verbose, -verbose          Show detailed classification process
```

---

## 📊 **MONITORING & MAINTENANCE**

### **Health Monitoring**

#### **`alexi health check`**
**Purpose**: Perform comprehensive health check of all systems.

**What it does**:
- Checks system health status
- Monitors performance metrics
- Validates configurations
- Reports system status

**When to use**:
- **Regular monitoring**: Scheduled health checks
- **Troubleshooting**: When experiencing issues
- **Performance monitoring**: Track system performance
- **Maintenance**: Before and after maintenance

**Natural Language Examples**:
```
"Perform a complete health check"
"Monitor system health and performance"
"Check if all systems are running properly"
"Validate system health and configuration"
```

**CLI Examples**:
```bash
# Basic health check
alexi health check

# Health check with specific components
alexi health check --components "crew,memory,n8n"

# Health check with detailed metrics
alexi health check --detailed

# Health check with monitoring
alexi health check --monitor --interval 30
```

**Command Options**:
```bash
alexi health check --help
# or
alexi health check -h

# Available options:
--components <list>, -c <list> Check specific components: crew,memory,n8n,security (comma-separated)
--detailed, -d               Show detailed health metrics
--monitor, -m                Enable continuous monitoring mode
--interval <seconds>, -i <seconds> Monitoring interval in seconds
--format <type>, -fmt <type> Output format: text, json, yaml, html
--include-metrics, -metrics  Include performance metrics
--include-alerts, -alerts    Include alert notifications
--include-trends, -trends    Include health trends
--output <file>, -o <file>   Save health report to file
--threshold <level>, -t <level> Set alert threshold level
--notify <method>, -n <method> Notification method: email, slack, webhook
--verbose, -v               Show detailed health check process
--timeout <seconds>, -timeout <seconds> Set health check timeout
```

---

### **Performance Optimization**

#### **`alexi optimize`**
**Purpose**: Optimize system performance and efficiency.

**What it does**:
- Analyzes performance bottlenecks
- Optimizes system configurations
- Improves resource utilization
- Enhances overall performance

**When to use**:
- **Performance issues**: When system is slow
- **Resource optimization**: Improve resource usage
- **Scaling preparation**: Before scaling up
- **Maintenance**: Regular performance optimization

**Natural Language Examples**:
```
"Optimize system performance"
"Improve resource utilization and efficiency"
"Fix performance bottlenecks"
"Enhance overall system performance"
```

**CLI Examples**:
```bash
# Basic optimization
alexi optimize

# Optimize specific components
alexi optimize --components "memory,crew"

# Optimize with specific focus
alexi optimize --focus "performance"
alexi optimize --focus "memory"

# Optimize with detailed analysis
alexi optimize --detailed
```

**Command Options**:
```bash
alexi optimize --help
# or
alexi optimize -h

# Available options:
--components <list>, -c <list> Optimize specific components: memory,crew,performance,n8n (comma-separated)
--focus <area>, -f <area>    Focus optimization on specific area: performance, memory, cpu, storage
--detailed, -d               Show detailed optimization analysis
--format <type>, -fmt <type> Output format: text, json, yaml, html
--include-recommendations, -r Include optimization recommendations
--include-benchmarks, -b     Include performance benchmarks
--include-metrics, -m        Include optimization metrics
--output <file>, -o <file>   Save optimization report to file
--auto-apply, -a             Automatically apply safe optimizations
--dry-run, -dr               Show what would be optimized without applying
--aggressive, -ag            Perform aggressive optimizations
--verbose, -v               Show detailed optimization process
--timeout <seconds>, -t <seconds> Set optimization timeout
```

---

### **Memory Management**

#### **`alexi memory status`**
**Purpose**: Display memory system status and statistics.

**What it does**:
- Shows memory usage statistics
- Displays memory health metrics
- Reports memory growth trends
- Provides memory system status

**When to use**:
- **Memory monitoring**: Track memory usage
- **Capacity planning**: Plan for memory growth
- **Performance analysis**: Understand memory patterns
- **Health checks**: Monitor memory system health

**Natural Language Examples**:
```
"Show me memory system status"
"Display memory usage and statistics"
"What's the current memory health?"
"Give me memory system metrics"
```

**CLI Examples**:
```bash
# Basic memory status
alexi memory status

# Memory status with detailed metrics
alexi memory status --detailed

# Memory status with time range
alexi memory status --time-range "last-week"

# Memory status by type
alexi memory status --by-type
```

**Command Options**:
```bash
alexi memory status --help
# or
alexi memory status -h

# Available options:
--detailed, -d               Show detailed memory statistics
--time-range <range>, -t <range> Time range: last-hour, last-day, last-week, last-month, last-year
--by-type, -type             Group statistics by memory type
--by-crew, -crew             Group statistics by crew member
--format <type>, -fmt <type> Output format: text, json, yaml, csv
--include-trends, -trends    Include memory usage trends
--include-growth, -growth    Include memory growth metrics
--include-efficiency, -eff   Include memory efficiency metrics
--output <file>, -o <file>   Save memory report to file
--compare <period>, -c <period> Compare with previous period
--threshold <level>, -th <level> Set memory usage threshold alerts
--verbose, -v               Show detailed memory analysis
--monitor, -m               Enable continuous memory monitoring
```

---

#### **`alexi memory cleanup`**
**Purpose**: Clean up and optimize memory storage.

**What it does**:
- Removes outdated memories
- Compresses memory storage
- Optimizes memory structure
- Improves memory efficiency

**When to use**:
- **Storage management**: Reduce memory usage
- **Performance optimization**: Improve memory performance
- **Maintenance**: Regular memory cleanup
- **Cleanup**: Remove outdated data

**Natural Language Examples**:
```
"Clean up and optimize memory storage"
"Remove outdated memories from the system"
"Compress and optimize memory data"
"Improve memory storage efficiency"
```

**CLI Examples**:
```bash
# Basic memory cleanup
alexi memory cleanup

# Cleanup with specific options
alexi memory cleanup --aggressive
alexi memory cleanup --dry-run

# Cleanup specific memory types
alexi memory cleanup --type "old-memories"

# Cleanup with detailed output
alexi memory cleanup --detailed
```

**Command Options**:
```bash
alexi memory cleanup --help
# or
alexi memory cleanup -h

# Available options:
--aggressive, -a             Perform aggressive cleanup
--dry-run, -d               Show what would be cleaned without cleaning
--type <type>, -t <type>     Clean specific memory types: old-memories, duplicate-memories, unused-memories
--format <type>, -fmt <type> Output format: text, json, yaml, html
--backup, -b                Create backup before cleanup
--compress, -c              Enable compression during cleanup
--remove-duplicates, -rd    Remove duplicate memories
--archive-old, -ao          Archive old memories instead of deleting
--output <file>, -o <file>  Save cleanup report to file
--include-metrics, -m       Include cleanup metrics
--include-recommendations, -r Include cleanup recommendations
--verbose, -v               Show detailed cleanup process
--timeout <seconds>, -timeout <seconds> Set cleanup timeout
```

---

## 🎯 **ADVANCED USE CASES**

### **Project Lifecycle Management**

#### **Project Setup Phase**
```bash
# Initialize Alex AI for new project
alexi init --project-type "react-app" --security-focused

# Configure crew for project requirements
alexi crew-discovery start --all --focus "react-development"

# Set up N8N workflows
alexi n8n-workflows update-all

# Run initial scenario analysis
alexi scenario-analysis run --focus "project-setup"
```

**Natural Language Examples**:
```
"Set up Alex AI for our new React project with security focus"
"Configure the crew for React development requirements"
"Initialize N8N workflows for the new project"
"Run analysis to understand project setup needs"
```

---

#### **Development Phase**
```bash
# Daily health checks
alexi status
alexi health check

# Crew coordination and learning
alexi scenario-analysis observation-lounge --focus "daily-standup"

# Security monitoring
alexi security audit --standard "OWASP"

# Performance optimization
alexi optimize --focus "development-performance"
```

**Natural Language Examples**:
```
"Check system health and crew status for today's development"
"Conduct daily crew stand-up for project coordination"
"Perform security audit to ensure code quality"
"Optimize system performance for development work"
```

---

#### **Testing Phase**
```bash
# Comprehensive system testing
alexi scenario-analysis end-to-end-test

# Crew member testing
alexi scenario-analysis test-crew --all

# Security compliance testing
alexi security audit --standard "PCI-DSS" --detailed

# Memory system validation
alexi memory status --detailed
```

**Natural Language Examples**:
```
"Run comprehensive system tests before deployment"
"Test all crew members for readiness"
"Perform security compliance audit"
"Validate memory system for production readiness"
```

---

#### **Deployment Phase**
```bash
# Pre-deployment checks
alexi status --verbose
alexi security audit --standard "enterprise"

# Crew final coordination
alexi scenario-analysis observation-lounge --focus "deployment-readiness"

# N8N workflow finalization
alexi n8n-workflows update-all --force

# Final health check
alexi health check --detailed
```

**Natural Language Examples**:
```
"Perform final system checks before deployment"
"Conduct crew coordination for deployment readiness"
"Finalize N8N workflows for production"
"Complete final health validation"
```

---

### **Team Collaboration**

#### **Daily Team Coordination**
```bash
# Morning stand-up
alexi scenario-analysis observation-lounge --focus "daily-standup"

# Crew status check
alexi crew-discovery stats --all

# System health monitoring
alexi health check --monitor
```

**Natural Language Examples**:
```
"Conduct morning crew stand-up for team alignment"
"Check crew performance and status"
"Monitor system health throughout the day"
```

---

#### **Weekly Team Reviews**
```bash
# Weekly crew assessment
alexi crew-discovery introspect --all --detailed

# Project progress analysis
alexi scenario-analysis run --focus "weekly-progress"

# Memory system optimization
alexi memory cleanup --aggressive
```

**Natural Language Examples**:
```
"Perform weekly crew assessment and review"
"Analyze project progress for the week"
"Optimize memory system for better performance"
```

---

#### **Monthly Team Planning**
```bash
# Comprehensive crew analysis
alexi crew-discovery stats --all --time-range "last-month"

# Project scenario analysis
alexi scenario-analysis run --detailed

# N8N workflow optimization
alexi n8n-workflows optimize-storage
```

**Natural Language Examples**:
```
"Analyze crew performance over the last month"
"Run comprehensive project scenario analysis"
"Optimize N8N workflows for better efficiency"
```

---

### **Scaling & Growth**

#### **Performance Scaling**
```bash
# Performance analysis
alexi optimize --detailed --focus "scaling"

# Memory system scaling
alexi memory status --detailed --time-range "last-month"

# Crew capability assessment
alexi crew-discovery introspect --all --focus "scaling-capabilities"
```

**Natural Language Examples**:
```
"Analyze system performance for scaling requirements"
"Assess memory system growth and scaling needs"
"Evaluate crew capabilities for scaling challenges"
```

---

#### **Team Growth**
```bash
# Crew development planning
alexi crew-discovery start --all --focus "team-growth"

# New capability integration
alexi crew-discovery add-feature --all --capability "scaling-expertise"

# Workflow expansion
alexi n8n-workflows update-all --expand
```

**Natural Language Examples**:
```
"Start crew development for team growth requirements"
"Add scaling expertise to all crew members"
"Expand N8N workflows for larger team coordination"
```

---

## 🎯 **BEST PRACTICES & RECOMMENDATIONS**

### **Daily Workflow**
1. **Morning**: `alexi status` - Check system health
2. **Stand-up**: `alexi scenario-analysis observation-lounge` - Crew coordination
3. **Development**: `alexi chat` - Interactive crew assistance
4. **Evening**: `alexi health check` - End-of-day validation

### **Weekly Maintenance**
1. **Monday**: `alexi crew-discovery stats --all` - Crew performance review
2. **Wednesday**: `alexi security audit` - Security assessment
3. **Friday**: `alexi memory cleanup` - Memory optimization

### **Monthly Optimization**
1. **Month Start**: `alexi scenario-analysis run --detailed` - Comprehensive analysis
2. **Mid-Month**: `alexi crew-discovery introspect --all` - Crew assessment
3. **Month End**: `alexi n8n-workflows optimize-storage` - Workflow optimization

### **Project Milestones**
1. **Project Start**: `alexi init` + `alexi crew-discovery start --all`
2. **Development Phase**: Regular `alexi scenario-analysis observation-lounge`
3. **Testing Phase**: `alexi scenario-analysis end-to-end-test`
4. **Deployment**: `alexi security audit` + `alexi health check`

---

## 🔧 **TROUBLESHOOTING GUIDE**

### **Common Issues**

#### **System Not Responding**
```bash
# Check system status
alexi status --verbose

# Test connections
alexi n8n-workflows test-connection

# Health check
alexi health check --detailed
```

#### **Crew Member Issues**
```bash
# Test specific crew member
alexi scenario-analysis test-crew "Commander Data"

# Introspect crew member
alexi crew-discovery introspect "Commander Data" --detailed

# Restart crew discovery
alexi crew-discovery start "Commander Data" --force
```

#### **Memory System Problems**
```bash
# Check memory status
alexi memory status --detailed

# Clean up memory
alexi memory cleanup --aggressive

# Optimize storage
alexi n8n-workflows optimize-storage
```

#### **N8N Workflow Issues**
```bash
# Test N8N connection
alexi n8n-workflows test-connection --verbose

# Update workflows
alexi n8n-workflows update-all --force

# Retrieve memories
alexi n8n-workflows retrieve-memories
```

---

## 📚 **ADDITIONAL RESOURCES**

### **Documentation**
- [Alex AI Universal Cheat Sheet](../guides/ALEX_AI_UNIVERSAL_CHEAT_SHEET.md)
- [Installation Guide](../../INSTALLATION.md)
- [Security Documentation](../../ENTERPRISE_SECURITY_SYSTEM_DOCUMENTATION.md)

### **Examples**
- [Project Setup Examples](../../examples/)
- [Crew Development Examples](../../examples/crew-development/)
- [Workflow Examples](../../examples/workflows/)

### **Support**
- [Troubleshooting Guide](../../TROUBLESHOOTING.md)
- [FAQ](../../FAQ.md)
- [Community Support](../../CONTRIBUTING.md)

---

**🖖 This API reference provides comprehensive guidance for using Alex AI Universal in real-world development scenarios. Each command is designed to enhance your development workflow, improve team collaboration, and ensure project success through AI-assisted development.**

---

*Generated on January 18, 2025*  
*Alex AI Universal Project*  
*API Reference Version: 1.0.0*
