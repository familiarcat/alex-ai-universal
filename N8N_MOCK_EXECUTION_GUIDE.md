# 🧪 N8N Mock Execution Guide

**Problem**: When trying to execute workflows in the N8N UI, you get "waiting to call the trigger url" and "Waiting for Trigger event" warnings because the workflows are configured as webhook triggers.

**Solution**: Add mock data capability to existing workflows for testing in N8N UI while preserving webhook functionality for Alex AI integration.

---

## 🎯 **IMMEDIATE SOLUTION**

### **Method 1: Add Manual Trigger Node (Recommended)**

1. **Open any crew workflow** in N8N UI (e.g., "CREW - Captain Jean-Luc Picard")

2. **Add a Manual Trigger Node**:
   - Click the "+" button to add a new node
   - Search for "Manual Trigger"
   - Add it to the left of your existing webhook trigger

3. **Configure Mock Data**:
   - In the Manual Trigger node, click "Add Mock Data"
   - Use this JSON structure:
   ```json
   {
     "prompt": "Test prompt for Captain Jean-Luc Picard - This is mock data for testing the workflow in N8N UI. Please provide your perspective on optimizing team communication and coordination.",
     "message": "Mock message for Captain Jean-Luc Picard testing",
     "timestamp": "2025-09-21T21:20:00.000Z",
     "testMode": true,
     "source": "n8n-ui-manual-testing",
     "crewMember": "Captain Jean-Luc Picard",
     "context": {
       "domain": "testing",
       "complexity": "medium",
       "type": "analytical"
     }
   }
   ```

4. **Connect the Manual Trigger**:
   - Connect the Manual Trigger output to the same nodes as your webhook trigger
   - This creates a parallel path for testing

5. **Save and Test**:
   - Save the workflow
   - Click "Execute workflow" - it will now run with mock data

### **Method 2: Use Existing Webhook with Test Data**

1. **Copy the webhook URL** from your workflow
2. **Use a tool like Postman or curl** to send test data:
   ```bash
   curl -X POST "https://n8n.pbradygeorgen.com/webhook/crew-captain-jean-luc-picard" \
   -H "Content-Type: application/json" \
   -d '{
     "prompt": "Test prompt for Captain Jean-Luc Picard",
     "message": "Mock message for testing",
     "testMode": true
   }'
   ```

---

## 🔧 **DETAILED STEP-BY-STEP INSTRUCTIONS**

### **For Captain Jean-Luc Picard Workflow:**

1. **Open the workflow** in N8N UI
2. **Add Manual Trigger**:
   - Position: Left of the webhook trigger
   - Name: "Manual Trigger (Test Mode)"
   - Mock Data:
   ```json
   {
     "prompt": "Captain, we need your strategic perspective on optimizing our crew coordination systems. This is a test execution to validate our workflow functionality.",
     "message": "Test message for Captain Picard workflow validation",
     "timestamp": "2025-09-21T21:20:00.000Z",
     "testMode": true,
     "source": "n8n-ui-manual-testing",
     "crewMember": "Captain Jean-Luc Picard",
     "context": {
       "domain": "leadership",
       "complexity": "high",
       "type": "strategic"
     }
   }
   ```

3. **Connect the Manual Trigger** to:
   - "Captain Jean-Luc Picard Memory Retrieval"
   - "LLM Selection Agent"

4. **Test the workflow** by clicking "Execute workflow"

### **For Other Crew Members:**

Use the same pattern but adjust the mock data:

**Commander Data**:
```json
{
  "prompt": "Commander Data, please analyze the current system performance and provide your technical assessment. This is a test execution.",
  "crewMember": "Commander Data",
  "context": {
    "domain": "technical-analysis",
    "complexity": "high",
    "type": "analytical"
  }
}
```

**Dr. Beverly Crusher**:
```json
{
  "prompt": "Doctor, we need your medical perspective on crew health monitoring systems. This is a test execution.",
  "crewMember": "Dr. Beverly Crusher",
  "context": {
    "domain": "medical",
    "complexity": "medium",
    "type": "analytical"
  }
}
```

---

## 🧪 **TESTING YOUR WORKFLOWS**

### **In N8N UI:**
1. **Select the Manual Trigger** node
2. **Click "Execute workflow"**
3. **Monitor the execution** in the logs panel
4. **Check the final response** for test mode indicators

### **Expected Results:**
- ✅ Workflow executes without waiting for webhook
- ✅ Mock data flows through all nodes
- ✅ AI agent responds with test context
- ✅ Memory storage and communication work
- ✅ Final response includes test mode indicators

---

## 🔄 **DUAL MODE OPERATION**

Your workflows will now support **both modes**:

### **Mode 1: Manual Testing (N8N UI)**
- Uses Manual Trigger with mock data
- Executes immediately when "Execute workflow" is clicked
- Perfect for testing and validation

### **Mode 2: Webhook Integration (Alex AI)**
- Uses original webhook trigger
- Waits for external calls from Alex AI
- Maintains full integration functionality

---

## 🚨 **TROUBLESHOOTING**

### **If workflow still waits for trigger:**
1. **Check connections**: Ensure Manual Trigger is connected to the workflow
2. **Verify mock data**: Make sure mock data is properly formatted JSON
3. **Check node order**: Manual Trigger should be the first node in execution

### **If execution fails:**
1. **Check API credentials**: Ensure Supabase and OpenRouter credentials are configured
2. **Verify node configurations**: Make sure all nodes have proper parameters
3. **Check logs**: Look for specific error messages in the execution logs

### **If response is empty:**
1. **Check LLM selection**: Ensure the LLM selection node is working
2. **Verify API calls**: Check if OpenRouter API calls are successful
3. **Check response formatting**: Ensure the response node is properly configured

---

## 📋 **QUICK REFERENCE**

### **Mock Data Template:**
```json
{
  "prompt": "[Crew-specific test prompt]",
  "message": "[Test message]",
  "timestamp": "[Current timestamp]",
  "testMode": true,
  "source": "n8n-ui-manual-testing",
  "crewMember": "[Crew Member Name]",
  "context": {
    "domain": "[crew expertise domain]",
    "complexity": "[low/medium/high]",
    "type": "[analytical/strategic/technical/empathic]"
  }
}
```

### **Crew Member Contexts:**
- **Captain Picard**: leadership, strategy, diplomacy
- **Commander Data**: technical-analysis, logic, computation
- **Commander Riker**: leadership, tactics, command
- **Dr. Crusher**: medical, healing, research
- **Counselor Troi**: empathy, psychology, counseling
- **Lieutenant Uhura**: communications, I/O, coordination
- **Lieutenant Worf**: security, tactics, honor
- **Geordi La Forge**: engineering, technology, innovation

---

## ✅ **SUCCESS INDICATORS**

When working correctly, you should see:
- ✅ **Immediate execution** (no waiting for trigger)
- ✅ **Mock data flowing** through all nodes
- ✅ **AI responses** with test context
- ✅ **Memory storage** working
- ✅ **Observation Lounge communication** functioning
- ✅ **Final response** with test mode indicators

---

## 🎯 **NEXT STEPS**

1. **Add Manual Triggers** to all crew workflows
2. **Test each workflow** with appropriate mock data
3. **Verify both modes** work (manual + webhook)
4. **Document any issues** for further refinement

**Your workflows will now support both N8N UI testing and Alex AI integration!** 🚀
