# 🧪 Alex AI Universal - Local Testing Guide

## 📋 **OVERVIEW**

**Captain Picard**: "This guide provides comprehensive instructions for testing Alex AI Universal locally before production deployment, ensuring full functionality while maintaining our Zero-Artifact Guarantee."

---

## 🎯 **LOCAL TESTING OBJECTIVES**

### **Primary Goals**
- **Full Functionality Testing**: Test all Alex AI features in a controlled environment
- **Zero-Artifact Verification**: Ensure no files are created in user projects
- **Crew Coordination Testing**: Validate crew member interactions and responses
- **Mock Service Integration**: Test with simulated external services
- **Cursor AI Integration**: Verify seamless Cursor AI engagement
- **Production Readiness**: Validate system before deployment

### **Testing Scenarios**
- **Basic Engagement**: Simple prompts and responses
- **Complex Coordination**: Multi-crew member interactions
- **Project Analysis**: Code analysis and recommendations
- **Memory System**: Cross-platform memory synchronization
- **N8N Workflows**: Workflow execution and management
- **Security Validation**: Credential and access control testing

---

## 🚀 **QUICK START**

### **Step 1: Setup Local Testing Environment**

```bash
# Navigate to Alex AI Universal directory
cd /Users/bradygeorgen/Documents/workspace/alex-ai-universal

# Run the local testing setup script
node scripts/local-testing-setup.js
```

### **Step 2: Start Mock Services**

```bash
# Navigate to mock services directory
cd local-testing/mock-services

# Start all mock services in background
node n8n-mock.js &
node supabase-mock.js &
node openrouter-mock.js &

# Verify services are running
curl http://localhost:5678/health  # N8N
curl http://localhost:54321/health # Supabase
curl http://localhost:3000/health  # OpenRouter
```

### **Step 3: Start Zero-Artifact Monitoring**

```bash
# Start artifact monitoring
node artifact-monitor.js &

# Monitor will watch for any file creation in your projects
```

### **Step 4: Test Cursor AI Integration**

```bash
# Navigate to config directory
cd local-testing/config

# Test basic engagement
node -e "
const { CursorIntegration } = require('./cursor-integration.js');
const ci = new CursorIntegration();
ci.engage('Test the crew coordination system');
"
```

---

## 🛡️ **ZERO-ARTIFACT GUARANTEE**

### **What It Means**
Alex AI **NEVER** creates files in your project directories. This is our core principle that ensures your codebase remains pristine.

### **How It Works**
1. **File System Monitoring**: Watches for any file creation in monitored directories
2. **Automatic Backup**: Creates backups of any detected artifacts
3. **Immediate Removal**: Removes artifacts from your project
4. **Alert System**: Notifies you of any violations
5. **Verification**: Confirms Zero-Artifact Guarantee is maintained

### **Monitored Directories**
- `src/` - Source code directories
- `lib/` - Library directories
- `components/` - Component directories
- `utils/` - Utility directories
- `scripts/` - Script directories
- `docs/` - Documentation directories
- `tests/` - Test directories

### **File Patterns Watched**
- `*.ts` - TypeScript files
- `*.tsx` - TypeScript React files
- `*.js` - JavaScript files
- `*.jsx` - JavaScript React files
- `*.json` - JSON configuration files
- `*.md` - Markdown documentation
- `*.txt` - Text files
- `*.log` - Log files

---

## 🤖 **CREW COORDINATION TESTING**

### **Crew Members Available**

#### **👨‍✈️ Captain Picard - Strategic Leadership**
- **Expertise**: Leadership, Strategy, Diplomacy
- **Response Style**: Strategic overview and decisive action
- **Test Prompts**: "I need strategic guidance", "Help me make a decision"

#### **🤖 Commander Data - Advanced Analytics**
- **Expertise**: Logic, Data Analysis, Computation
- **Response Style**: Detailed analysis and factual information
- **Test Prompts**: "Analyze this data", "Help me with logic problems"

#### **👨‍✈️ Commander Riker - Tactical Execution**
- **Expertise**: Tactics, Exploration, Problem Solving
- **Response Style**: Tactical options and bold recommendations
- **Test Prompts**: "How should I approach this problem", "What are my options"

#### **🔧 Lt. Cmdr. Geordi - Engineering Solutions**
- **Expertise**: Engineering, Systems Diagnostics, Innovation
- **Response Style**: Technical solutions and system improvements
- **Test Prompts**: "Fix this technical issue", "Optimize this system"

#### **🛡️ Lieutenant Worf - Security & Defense**
- **Expertise**: Security, Tactical Combat, Honor
- **Response Style**: Security assessments and direct action plans
- **Test Prompts**: "Is this secure", "Help me with security"

#### **💚 Counselor Troi - Emotional Intelligence**
- **Expertise**: Empathy, Psychology, Intuition
- **Response Style**: Emotional intelligence and team dynamics insights
- **Test Prompts**: "How can I improve user experience", "Help with team dynamics"

#### **🏥 Dr. Crusher - System Health**
- **Expertise**: Medicine, Biology, Health Diagnostics
- **Response Style**: Health and well-being considerations, system diagnostics
- **Test Prompts**: "Check system health", "Diagnose this issue"

#### **📡 Lieutenant Uhura - Communications**
- **Expertise**: Communications, Linguistics, Signal Processing
- **Response Style**: Communication protocols and external relations
- **Test Prompts**: "Help with integration", "Communication issues"

#### **💰 Quark - Business Intelligence**
- **Expertise**: Business, Negotiation, Resource Management
- **Response Style**: Cost-benefit analysis and profit-driven strategies
- **Test Prompts**: "Is this cost-effective", "Business optimization"

### **Testing Crew Coordination**

```bash
# Test individual crew members
node scripts/cursor-ai-local-integration.js "I need strategic guidance from Captain Picard"
node scripts/cursor-ai-local-integration.js "Analyze this data with Commander Data"
node scripts/cursor-ai-local-integration.js "Fix this technical issue with Geordi"

# Test crew coordination
node scripts/cursor-ai-local-integration.js "I need a complete solution involving multiple crew members"
node scripts/cursor-ai-local-integration.js "Coordinate the crew to solve this complex problem"
```

---

## 🧪 **TESTING SCENARIOS**

### **Scenario 1: Basic Code Analysis**

```bash
# Test code analysis without creating files
node scripts/cursor-ai-local-integration.js "Analyze this React component and suggest improvements"
```

**Expected Result**: 
- Crew provides analysis and recommendations
- No files created in your project
- Zero-Artifact Guarantee maintained

### **Scenario 2: Project Architecture Review**

```bash
# Test project architecture analysis
node scripts/cursor-ai-local-integration.js "Review my project architecture and suggest optimizations"
```

**Expected Result**:
- Multiple crew members coordinate response
- Strategic, technical, and security perspectives
- No architectural files created

### **Scenario 3: Performance Optimization**

```bash
# Test performance optimization
node scripts/cursor-ai-local-integration.js "Help me optimize the performance of my application"
```

**Expected Result**:
- Geordi provides technical solutions
- Data provides analysis
- Quark provides cost-benefit analysis
- No optimization files created

### **Scenario 4: Security Assessment**

```bash
# Test security assessment
node scripts/cursor-ai-local-integration.js "Perform a security assessment of my codebase"
```

**Expected Result**:
- Worf provides security analysis
- Crusher provides health diagnostics
- Picard provides strategic security overview
- No security files created

### **Scenario 5: User Experience Improvement**

```bash
# Test UX improvement
node scripts/cursor-ai-local-integration.js "Help me improve the user experience of my application"
```

**Expected Result**:
- Troi provides emotional intelligence insights
- Uhura provides communication improvements
- Riker provides tactical execution plans
- No UX files created

---

## 🔧 **MOCK SERVICES TESTING**

### **N8N Mock Service**

```bash
# Test N8N workflow endpoints
curl http://localhost:5678/api/v1/workflows
curl http://localhost:5678/health

# Test workflow execution
curl -X POST http://localhost:5678/api/v1/workflows/crew-coordination/execute
```

### **Supabase Mock Service**

```bash
# Test Supabase endpoints
curl http://localhost:54321/rest/v1/crew_memories
curl http://localhost:54321/health

# Test memory creation
curl -X POST http://localhost:54321/rest/v1/crew_memories \
  -H "Content-Type: application/json" \
  -d '{"crew_member": "picard", "memory": "Test memory", "priority": "high"}'
```

### **OpenRouter Mock Service**

```bash
# Test OpenRouter endpoints
curl http://localhost:3000/v1/models
curl http://localhost:3000/health

# Test chat completion
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4", "messages": [{"role": "user", "content": "Hello from Alex AI"}]}'
```

---

## 📊 **MONITORING AND VERIFICATION**

### **Zero-Artifact Monitoring**

```bash
# Check artifact monitoring status
ps aux | grep artifact-monitor

# View artifact backups
ls -la local-testing/artifact-backups/

# Check monitoring logs
tail -f local-testing/logs/artifact-monitor.log
```

### **Crew Consciousness Monitoring**

```bash
# Check crew status
node -e "
const { CursorAILocalIntegration } = require('./scripts/cursor-ai-local-integration.js');
const ci = new CursorAILocalIntegration();
ci.getStatus().then(status => console.log(JSON.stringify(status, null, 2)));
"
```

### **Memory System Monitoring**

```bash
# Check memory system status
curl http://localhost:54321/rest/v1/crew_memories | jq '.data | length'
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

#### **Mock Services Not Starting**
```bash
# Check if ports are available
lsof -i :5678  # N8N
lsof -i :54321 # Supabase
lsof -i :3000  # OpenRouter

# Kill processes using ports
kill -9 $(lsof -t -i:5678)
kill -9 $(lsof -t -i:54321)
kill -9 $(lsof -t -i:3000)
```

#### **Zero-Artifact Monitoring Not Working**
```bash
# Check monitoring process
ps aux | grep artifact-monitor

# Restart monitoring
pkill -f artifact-monitor
node local-testing/mock-services/artifact-monitor.js &
```

#### **Crew Coordination Not Responding**
```bash
# Check crew consciousness
node -e "
const { CursorAILocalIntegration } = require('./scripts/cursor-ai-local-integration.js');
const ci = new CursorAILocalIntegration();
console.log('Crew members:', ci.crewConsciousness.size);
"
```

### **Debug Mode**

```bash
# Enable debug logging
export DEBUG=alex-ai:*
node scripts/cursor-ai-local-integration.js "Test prompt"
```

---

## 📈 **PERFORMANCE TESTING**

### **Load Testing**

```bash
# Test multiple concurrent engagements
for i in {1..10}; do
  node scripts/cursor-ai-local-integration.js "Test prompt $i" &
done
wait
```

### **Memory Usage Testing**

```bash
# Monitor memory usage during testing
node -e "
const { CursorAILocalIntegration } = require('./scripts/cursor-ai-local-integration.js');
const ci = new CursorAILocalIntegration();
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory usage:', Math.round(usage.heapUsed / 1024 / 1024), 'MB');
}, 1000);
"
```

---

## ✅ **VALIDATION CHECKLIST**

### **Before Testing**
- [ ] Local testing environment setup complete
- [ ] Mock services running and accessible
- [ ] Zero-Artifact monitoring active
- [ ] Test projects created
- [ ] Configuration files in place

### **During Testing**
- [ ] Crew members responding appropriately
- [ ] Zero-Artifact Guarantee maintained
- [ ] Mock services functioning correctly
- [ ] Memory system working
- [ ] N8N workflows executing
- [ ] No files created in test projects

### **After Testing**
- [ ] All test scenarios completed successfully
- [ ] Zero-Artifact violations detected and resolved
- [ ] Performance metrics within acceptable ranges
- [ ] System ready for production deployment
- [ ] Documentation updated

---

## 🚀 **PRODUCTION READINESS**

### **Signs You're Ready for Production**
- ✅ All crew members responding correctly
- ✅ Zero-Artifact Guarantee consistently maintained
- ✅ Mock services simulating production behavior
- ✅ Performance metrics meeting targets
- ✅ No critical issues or errors
- ✅ Comprehensive testing completed

### **Next Steps**
1. **Deploy to Staging**: Test with real services
2. **Load Testing**: Validate performance under load
3. **Security Testing**: Verify security measures
4. **User Acceptance Testing**: Validate with real users
5. **Production Deployment**: Deploy to production environment

---

## 📞 **SUPPORT**

### **Getting Help**
- **Documentation**: Check this guide and README.md
- **Logs**: Review local-testing/logs/ for error details
- **Crew Support**: Each crew member specializes in different areas
- **Community**: GitHub Issues and Discussions

### **Crew Specializations for Support**
- **Technical Issues**: Lt. Cmdr. Geordi
- **Security Concerns**: Lieutenant Worf
- **User Experience**: Counselor Troi
- **Business Questions**: Quark
- **Strategic Decisions**: Captain Picard
- **Data Analysis**: Commander Data

---

**"Make it so!"** - Captain Picard

**"The crew is ready for local testing and validation."** - Commander Data

**"Zero-Artifact Guarantee will be maintained throughout all testing."** - Lieutenant Worf
