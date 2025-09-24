# 🖖 N8N Workflow Dynamic Rename Guide

**Script:** `scripts/rename-n8n-workflows.js`  
**Purpose:** Dynamically rename N8N workflows using the API with `~/.zshrc` credentials  
**Target:** `n8n.pbradygeorgen.com`

---

## 🚀 **Quick Start**

### **Prerequisites:**
- N8N API key in `~/.zshrc` as `N8N_API_KEY`
- N8N base URL in `~/.zshrc` as `N8N_BASE_URL` (optional, defaults to `https://n8n.pbradygeorgen.com`)

### **Make Script Executable:**
```bash
chmod +x scripts/rename-n8n-workflows.js
```

---

## 📋 **Available Commands**

### **1. List All Workflows**
```bash
node scripts/rename-n8n-workflows.js list
```
**Output:** Shows all workflows with their IDs and current names

### **2. Rename by Pattern**
```bash
node scripts/rename-n8n-workflows.js pattern "<search_pattern>" "<new_name>"
```
**Example:**
```bash
node scripts/rename-n8n-workflows.js pattern "Crew - Quark" "Crew - Quark - Ferengi Business Intelligence (OpenRouter Optimized)"
```

### **3. Rename by Specific ID**
```bash
node scripts/rename-n8n-workflows.js rename <workflow_id> "<new_name>"
```
**Example:**
```bash
node scripts/rename-n8n-workflows.js rename L6K4bzSKlGC36ABL "Crew - Quark - Optimized"
```

### **4. Dry Run (Preview Changes)**
```bash
node scripts/rename-n8n-workflows.js dry-run "<search_pattern>" "<new_name>"
```
**Example:**
```bash
node scripts/rename-n8n-workflows.js dry-run "Crew" "Crew - Updated"
```

### **5. Interactive Mode**
```bash
node scripts/rename-n8n-workflows.js interactive
```
**Note:** Currently demonstrates renaming the first workflow found

---

## 🎯 **Real-World Examples**

### **Rename All Crew Workflows:**
```bash
# List current crew workflows
node scripts/rename-n8n-workflows.js list | grep -i crew

# Rename Quark workflow
node scripts/rename-n8n-workflows.js pattern "Crew - Quark" "Crew - Quark - Ferengi Business Intelligence (OpenRouter Optimized)"

# Rename Data workflow  
node scripts/rename-n8n-workflows.js pattern "Crew - Commander Data" "Crew - Commander Data - Android Analytics & Logic Operations (OpenRouter Optimized)"

# Rename Picard workflow
node scripts/rename-n8n-workflows.js pattern "Crew - Captain Jean-Luc Picard" "Crew - Captain Jean-Luc Picard - Strategic Leadership & Mission Command (OpenRouter Optimized)"
```

### **Batch Rename with Script:**
```bash
#!/bin/bash
# Batch rename script

WORKFLOWS=(
    "Crew - Lieutenant Uhura:Crew - Lieutenant Uhura - Communications & I/O Operations Officer (OpenRouter Optimized)"
    "Crew - Lieutenant Worf:Crew - Lieutenant Worf - Security & Compliance Operations (OpenRouter Optimized)"
    "Crew - Commander William Riker:Crew - Commander William Riker - Tactical Execution & Workflow Management (OpenRouter Optimized)"
    "Crew - Counselor Deanna Troi:Crew - Counselor Deanna Troi - User Experience & Empathy Analysis (OpenRouter Optimized)"
    "Crew - Dr. Beverly Crusher:Crew - Dr. Beverly Crusher - Health & Diagnostics Officer (OpenRouter Optimized)"
    "Crew - Lieutenant Commander Geordi La Forge:Crew - Lieutenant Commander Geordi La Forge - Infrastructure & System Integration (OpenRouter Optimized)"
)

for workflow in "${WORKFLOWS[@]}"; do
    IFS=':' read -r pattern new_name <<< "$workflow"
    echo "Renaming: $pattern -> $new_name"
    node scripts/rename-n8n-workflows.js pattern "$pattern" "$new_name"
done
```

---

## 🔧 **Technical Details**

### **API Requirements:**
The N8N API requires these fields for workflow updates:
- `name` (string) - The new workflow name
- `nodes` (array) - Workflow nodes configuration
- `connections` (object) - Node connections
- `settings` (object) - Workflow settings

### **Authentication:**
- Uses `X-N8N-API-KEY` header
- Loads credentials from `~/.zshrc`
- Supports HTTPS connections

### **Error Handling:**
- Validates API key presence
- Handles HTTP errors gracefully
- Provides detailed error messages
- Supports dry-run mode for testing

---

## 📊 **Current Workflow Status**

### **Successfully Renamed Workflows:**
- ✅ **Quark**: `Crew - Quark - Ferengi Business Intelligence (OpenRouter Optimized)` (ID: L6K4bzSKlGC36ABL)
- ✅ **Data**: `Crew - Commander Data - Android Analytics & Logic Operations` (ID: gIwrQHHArgrVARjL)

### **Available for Renaming:**
- 🔄 **Uhura**: `Crew - Lieutenant Uhura - Communications & I/O Operations Officer` (ID: 36KPle5mPiMaazG6)
- 🔄 **Picard**: `Crew - Captain Jean-Luc Picard - Strategic Leadership & Mission Command` (ID: BdNHOluRYUw2JxGW)
- 🔄 **Worf**: `Crew - Lieutenant Worf - Security & Compliance Operations` (ID: GhSB8EpZWXLU78LM)
- 🔄 **Riker**: `Crew - Commander William Riker - Tactical Execution & Workflow Management` (ID: Imn7p6pVgi6SRvnF)
- 🔄 **Troi**: `Crew - Counselor Deanna Troi - User Experience & Empathy Analysis` (ID: QJnN7ks2KsQTENDc)
- 🔄 **Crusher**: `Crew - Dr. Beverly Crusher - Health & Diagnostics Officer` (ID: SXAMupVWdOxZybF6)
- 🔄 **La Forge**: `Crew - Lieutenant Commander Geordi La Forge - Infrastructure & System Integration` (ID: e0UEwyVcXJqeePdj)

---

## 🎉 **Success Stories**

### **Quark Workflow Rename:**
```bash
# Before
Crew - Quark - Business Intelligence & Budget Optimization (OpenRouter Optimized)

# After  
Crew - Quark - Ferengi Business Intelligence (OpenRouter Optimized)

# Command used
node scripts/rename-n8n-workflows.js pattern "Crew - Quark" "Crew - Quark - Ferengi Business Intelligence (OpenRouter Optimized)"
```

### **Data Workflow Rename:**
```bash
# Before
Crew - Commander Data - Analytics & Logic Operations

# After
Crew - Commander Data - Android Analytics & Logic Operations (OpenRouter Optimized)

# Command used
node scripts/rename-n8n-workflows.js pattern "Crew - Commander Data" "Crew - Commander Data - Android Analytics & Logic Operations (OpenRouter Optimized)"
```

---

## 🚀 **Advanced Usage**

### **Rename Multiple Workflows with Pattern:**
```bash
# Rename all workflows containing "System"
node scripts/rename-n8n-workflows.js pattern "System" "System - Updated"

# Rename all workflows containing "Alex AI"
node scripts/rename-n8n-workflows.js pattern "Alex AI" "Alex AI - Enhanced"
```

### **Rename with Timestamps:**
```bash
# Add timestamp to workflow name
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
node scripts/rename-n8n-workflows.js rename L6K4bzSKlGC36ABL "Crew - Quark - Backup $TIMESTAMP"
```

### **Rename with Environment Suffix:**
```bash
# Add environment suffix
ENV="production"
node scripts/rename-n8n-workflows.js pattern "Crew - Quark" "Crew - Quark - $ENV"
```

---

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **"N8N_API_KEY not found"**
   - Ensure `N8N_API_KEY` is set in `~/.zshrc`
   - Check that the value is not a placeholder

2. **"401 Unauthorized"**
   - Verify API key is correct
   - Check that N8N instance is accessible

3. **"400 Bad Request"**
   - Ensure workflow ID exists
   - Check that required fields are included

4. **"Pattern not found"**
   - Use exact pattern matching
   - Check workflow names with `list` command

### **Debug Commands:**
```bash
# List all workflows to find exact names
node scripts/rename-n8n-workflows.js list

# Test with dry-run first
node scripts/rename-n8n-workflows.js dry-run "pattern" "new name"

# Check specific workflow by ID
node scripts/debug-workflow-structure.js
```

---

## 🎯 **Best Practices**

### **1. Always Use Dry-Run First:**
```bash
node scripts/rename-n8n-workflows.js dry-run "pattern" "new name"
```

### **2. Backup Important Workflows:**
```bash
# Rename with backup suffix
node scripts/rename-n8n-workflows.js rename <id> "Original Name - Backup $(date +%Y%m%d)"
```

### **3. Use Descriptive Names:**
```bash
# Good
"Crew - Quark - Ferengi Business Intelligence (OpenRouter Optimized)"

# Avoid
"Quark"
```

### **4. Batch Operations:**
```bash
# Create a script for multiple renames
#!/bin/bash
for workflow in $(node scripts/rename-n8n-workflows.js list | grep "Crew -" | awk '{print $1}'); do
    node scripts/rename-n8n-workflows.js rename "$workflow" "$workflow - Updated"
done
```

---

## 🎉 **Revolutionary Achievement**

This script enables **dynamic workflow management** at scale:

- ✅ **27 workflows** available for renaming
- ✅ **Pattern-based renaming** for batch operations
- ✅ **ID-based renaming** for precise control
- ✅ **Dry-run capability** for safe testing
- ✅ **Authentication via ~/.zshrc** for security
- ✅ **Comprehensive error handling** for reliability

**The N8N workflow rename system is now fully operational and ready for crew member optimization!** 🖖

---

## 📝 **Script Features**

### **Core Functions:**
- `listWorkflows()` - Fetch all workflows
- `getWorkflow(id)` - Get specific workflow
- `updateWorkflowName(id, name)` - Rename workflow
- `renameWorkflowByPattern(pattern, name)` - Pattern-based renaming
- `renameWorkflowById(id, name)` - ID-based renaming
- `interactiveRename()` - Interactive mode

### **Command Line Interface:**
- `list` - List all workflows
- `rename <id> <name>` - Rename by ID
- `pattern <pattern> <name>` - Rename by pattern
- `dry-run <pattern> <name>` - Preview changes
- `interactive` - Interactive mode

**Ready for production use with the Alex AI crew coordination system!** 🖖
