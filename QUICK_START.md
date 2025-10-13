# 🚀 Alex AI - Quick Start Guide

**Get the AI Crew Symphony running in 60 seconds!**

---

## ⚡ One-Command Start

```bash
npm run start:all
```

**That's it!** This will:
1. Clear any existing servers
2. Start the Dashboard (port 3001)
3. Start Next.js UI (port 3000)
4. Open all pages in your browser
5. Display live logs

---

## 🌐 What Opens

Your browser will automatically open:

1. **Dashboard** - http://localhost:3001
   - Crew Management
   - Multi-Project Orchestration
   - System Status

2. **Next.js Home** - http://localhost:3000
   - Main Interface
   - Navigation Hub

3. **RAG Query** - http://localhost:3000/crew-rag-query
   - Crew Knowledge Search
   - Learning Insights

4. **LCARS System** - http://localhost:3000/lcars
   - LLM Optimization
   - Cost Tracking

---

## 🧪 Test the System

### Quick API Test
```bash
bash test-dashboard-api.sh
```

This demonstrates:
- Creating 2 simultaneous projects
- Assigning crew members
- Orchestrating workflows
- Tracking costs and progress

### Check Crew Status
```bash
npm run crew:roster
```

Shows all 11 crew members live from n8n.

---

## 🎯 Quick Demo

### Create a Project

**Option 1: Via API**
```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Awesome App",
    "type": "web-app",
    "description": "A revolutionary application",
    "crewIds": ["BdNHOluRYUw2JxGW", "Imn7p6pVgi6SRvnF"]
  }'
```

**Option 2: Via Dashboard**
1. Open http://localhost:3001
2. Use the configuration interface
3. See real-time updates

### Get Crew Recommendations
```bash
curl http://localhost:3001/api/projects/recommend?type=full-stack
```

Returns optimal crew composition for your project type!

### View System Status
```bash
curl http://localhost:3001/api/system/status | jq
```

---

## 🛑 Stop All Servers

```bash
lsof -ti:3000,3001 | xargs kill
```

Or use the PIDs from the startup script.

---

## 📚 Main Features

### 🎭 11 AI Crew Members
- Captain Picard (Strategic Leadership)
- Commander Data (Analytics)
- Commander Riker (Execution)
- Lt. Cmdr. La Forge (Infrastructure)
- Lieutenant Worf (Security)
- Counselor Troi (UX Design)
- Dr. Crusher (Diagnostics)
- Lieutenant Uhura (Communications)
- Quark (Business Intelligence)
- LCARS Library Computer (LLM Optimization)
- LCARS ARS (Real-time Preview)

### 🚀 Multi-Project Management
- Create unlimited projects
- Assign crew members
- Parallel execution
- Independent progress tracking

### 🧠 RAG Knowledge System
- Crew learning tracked
- Cross-project insights
- Continuous improvement
- Search and query interface

### 💰 LCARS Optimization
- Dynamic LLM selection
- Cost tracking
- Performance monitoring
- Real-time optimization

### 📡 Real-time Updates
- WebSocket communication
- Live crew status
- Project progress
- System health

---

## 🎯 Use Cases

### For Solo Developers
```bash
# Start the platform
npm run start:all

# Create your first client project
# Dashboard will recommend optimal crew
# Watch the AI crew build it in symphony
```

### For Teams
```bash
# Multiple developers can:
# - Create different projects
# - Share crew insights
# - Monitor all projects together
```

### For Agencies
```bash
# Manage multiple client projects:
# - Each with specialized crew
# - Parallel execution
# - Cost tracking per client
```

---

## 📖 Documentation

### Getting Started
- **QUICK_START.md** - This file (you are here!)
- **README.md** - Project overview

### Crew Management
- **CREW_ROSTER.md** - Complete crew profiles
- **CREW_QUICK_REFERENCE.md** - Fast access

### Technical Docs
- **DASHBOARD_INTEGRATION_STATUS.md** - API specs
- **DEMO_MULTI_PROJECT_SYMPHONY.md** - Live demo
- **LCARS_SYSTEM_IMPLEMENTATION.md** - LCARS details

### Milestones
- **MILESTONE_CREW_ROSTER_SYSTEM_2025_10_11.md**
- **MILESTONE_COMPLETE_N8N_CLI_CONTROL_2025_01_11.md**
- **ACCOMPLISHMENT_SUMMARY.md**

---

## 🔧 Advanced Commands

### Crew Management
```bash
npm run crew:roster  # Sync crew from n8n
npm run crew:list    # Same as above
npm run crew:sync    # Same as above
```

### Demos
```bash
npm run demo              # Basic demo
npm run demo:dashboard    # Dashboard only
npm run demo:live-preview # Preview only
```

### Development
```bash
npm run start:all   # All servers + browsers
npm run dev:all     # Same as above
```

### Testing
```bash
npm test                    # Run all tests
bash test-dashboard-api.sh  # Test dashboard APIs
```

---

## 🎓 Learn More

### API Endpoints
See **DASHBOARD_INTEGRATION_STATUS.md** for complete API documentation.

### Crew Capabilities
See **CREW_ROSTER.md** for detailed crew member profiles.

### Architecture
See **DEMO_MULTI_PROJECT_SYMPHONY.md** for system architecture.

---

## 🎊 What You Have

**A fully operational multi-project AI development platform featuring:**

✅ 11 specialized AI crew members  
✅ Multi-project parallel execution  
✅ Real-time orchestration  
✅ Shared RAG knowledge  
✅ LCARS cost optimization  
✅ Complete visibility and control  

---

## 🖖 Next Steps

1. **Explore the Dashboard** - http://localhost:3001
2. **Try the APIs** - `bash test-dashboard-api.sh`
3. **Query the Crew** - http://localhost:3000/crew-rag-query
4. **View LCARS** - http://localhost:3000/lcars
5. **Create Your First Project!**

---

**Welcome to the future of AI-assisted development!** 🎭🎼

🖖 Live long and prosper!

---

*Last Updated: 2025-10-11*  
*Platform Status: Production Ready*  
*Crew Status: 100% Operational*



