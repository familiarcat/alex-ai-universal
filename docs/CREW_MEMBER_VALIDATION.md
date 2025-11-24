# Crew Member Validation System

**Date:** November 23, 2025  
**Status:** ✅ Active  
**Purpose:** Prevent introduction of non-official crew members into the DDD system

---

## 🛡️ Protection System

The crew member validation system ensures that only official crew members from the roster are used throughout the system, preventing accidental introduction of non-official characters that could contaminate the DDD/memory system.

---

## ✅ Official Crew Members

### Command Division
1. **picard** - Captain Jean-Luc Picard
2. **riker** - Commander William Riker

### Operations & Engineering
3. **data** - Commander Data
4. **la_forge** / **geordi** - Lieutenant Commander Geordi La Forge
5. **obrien** / **chief_obrien** - Chief Miles O'Brien

### Security & Medical
6. **worf** - Lieutenant Worf
7. **crusher** - Dr. Beverly Crusher (NOT Wesley)

### Support Division
8. **troi** - Counselor Deanna Troi
9. **uhura** - Lieutenant Uhura
10. **quark** - Quark

---

## ❌ Invalid Crew Members (Blocked)

The following are **explicitly blocked** and will be flagged:

- **wesley** / **wesley_crusher** / **ensign_wesley**
- Any other non-official crew members

---

## 🔧 Validation System

### Automatic Validation

The system automatically:
1. **Scans migration plans** for crew member references
2. **Validates LLM responses** for non-official crew members
3. **Replaces invalid references** with appropriate official crew members
4. **Logs warnings** when invalid references are found

### Validation Script

```bash
# Validate crew members in migration plan
node scripts/migrate-n8n-to-mcp/validate-crew-members.js
```

### Integration Points

1. **Migration Coordinator**: Validates crew assignments in execution plans
2. **MCP Server**: Only accepts official crew member IDs
3. **Crew Manager**: Only initializes official crew members
4. **Memory System**: Only stores memories for official crew members

---

## 📋 Usage in Prompts

When creating prompts for crew coordination, always include:

```javascript
const officialCrewList = [
  'picard', 'riker', 'data', 'la_forge', 'geordi',
  'worf', 'troi', 'crusher', 'uhura', 'quark', 'obrien'
];

const prompt = `Only use official crew members: ${officialCrewList.join(', ')}
DO NOT use: Wesley Crusher or any non-official crew members.`;
```

---

## 🚨 Error Handling

### If Invalid Crew Member Detected

1. **Warning logged**: System logs warning with invalid reference
2. **Automatic replacement**: Invalid reference replaced with appropriate official crew member
3. **Validation report**: Issue added to validation report
4. **No system contamination**: Invalid crew member never enters DDD/memory system

### Example

```
⚠️  Warning: Removed invalid crew member reference: wesley_crusher
   Replaced with: Commander Data
```

---

## ✅ Verification

### Check System Integrity

```bash
# Validate all crew references
node scripts/migrate-n8n-to-mcp/validate-crew-members.js

# Check MCP server crew list
grep -r "CREW_MEMBERS" lib/mcp-crew-memories-server.js

# Verify crew roster
cat crew-roster.json | jq '.crewMembers[].name'
```

---

## 📊 Current Status

- ✅ **Validation System**: Active
- ✅ **MCP Server**: Only official crew members
- ✅ **Migration Plan**: Validated (no invalid references)
- ✅ **Memory System**: Protected
- ✅ **DDD System**: Clean

---

## 🎯 Best Practices

1. **Always validate** crew member references before use
2. **Use official IDs** from crew-roster.json
3. **Include validation** in prompts to LLMs
4. **Post-process responses** to clean any invalid references
5. **Monitor logs** for validation warnings

---

**This system ensures the integrity of our crew management and DDD architecture.**

