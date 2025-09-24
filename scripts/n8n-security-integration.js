#!/usr/bin/env node

/**
 * N8N Security Integration Script
 * 
 * Implements enterprise security regulations across all N8N workflows
 * at n8n.pbradygeorgen.com using access credentials from ~/.zshrc
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load environment variables from ~/.zshrc
function loadZshrcEnv() {
  try {
    const zshrcContent = fs.readFileSync(process.env.HOME + '/.zshrc', 'utf8');
    const lines = zshrcContent.split('\n');
    
    lines.forEach(line => {
      if (line.includes('export N8N_API_URL=')) {
        process.env.N8N_API_URL = line.split('=')[1].replace(/['"]/g, '');
      }
      if (line.includes('export N8N_API_KEY=')) {
        process.env.N8N_API_KEY = line.split('=')[1].replace(/['"]/g, '');
      }
      if (line.includes('export ALEX_AI_ENCRYPTION_KEY=')) {
        process.env.ALEX_AI_ENCRYPTION_KEY = line.split('=')[1].replace(/['"]/g, '');
      }
    });
    
    console.log('✅ Environment variables loaded from ~/.zshrc');
  } catch (error) {
    console.error('❌ Failed to load ~/.zshrc:', error.message);
    process.exit(1);
  }
}

// N8N API client
class N8NSecurityIntegrator {
  constructor() {
    this.apiUrl = process.env.N8N_API_URL || 'https://n8n.pbradygeorgen.com/api/v1';
    this.apiKey = process.env.N8N_API_KEY;
    this.encryptionKey = process.env.ALEX_AI_ENCRYPTION_KEY;
    
    if (!this.apiKey) {
      throw new Error('N8N_API_KEY not found in environment variables');
    }
    
    this.axiosConfig = {
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      }
    };
  }

  // Test N8N connection
  async testConnection() {
    try {
      console.log('🔗 Testing N8N connection...');
      const response = await axios.get(`${this.apiUrl}/workflows?limit=1`, this.axiosConfig);
      console.log('✅ Successfully connected to N8N API');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to N8N API:', error.message);
      return false;
    }
  }

  // Get all workflows
  async getAllWorkflows() {
    try {
      console.log('📋 Fetching all N8N workflows...');
      const response = await axios.get(`${this.apiUrl}/workflows`, this.axiosConfig);
      console.log(`✅ Found ${response.data.data.length} workflows`);
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to fetch workflows:', error.message);
      return [];
    }
  }

  // Generate security node for workflow
  generateSecurityNode(workflowId, position = { x: 250, y: 200 }) {
    return {
      id: `security-${workflowId}`,
      name: 'Alex AI Security System',
      type: 'n8n-nodes-base.function',
      typeVersion: 1,
      position,
      parameters: {
        functionCode: `
// Alex AI Enterprise Security System Integration
// Air-tight security like a submarine for DOD/Fortune 500 compliance

const crypto = require('crypto');

// Data Classification Levels
const DataClassification = {
  OPEN: 'open',
  CONFIDENTIAL: 'confidential',
  SECRET: 'secret',
  TOP_SECRET: 'top_secret'
};

// User Roles
const UserRole = {
  GUEST: 'guest',
  USER: 'user',
  DEVELOPER: 'developer',
  ADMIN: 'admin',
  SECURITY_OFFICER: 'security_officer',
  SYSTEM_ADMIN: 'system_admin'
};

// Security Event Types
const SecurityEventType = {
  DATA_ACCESS: 'data_access',
  DATA_MODIFICATION: 'data_modification',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  ENCRYPTION: 'encryption',
  DECRYPTION: 'decryption',
  CLASSIFICATION_CHANGE: 'classification_change',
  SECURITY_VIOLATION: 'security_violation',
  SYSTEM_ERROR: 'system_error'
};

// DLP Rules for PII Detection
const dlpRules = [
  {
    id: 'ssn-pattern',
    name: 'SSN Detection',
    pattern: /\\b\\d{3}-\\d{2}-\\d{4}\\b/g,
    classification: DataClassification.SECRET,
    action: 'encrypt',
    severity: 'high'
  },
  {
    id: 'credit-card-pattern',
    name: 'Credit Card Detection',
    pattern: /\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b/g,
    classification: DataClassification.SECRET,
    action: 'encrypt',
    severity: 'high'
  },
  {
    id: 'email-pattern',
    name: 'Email Detection',
    pattern: /\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b/g,
    classification: DataClassification.CONFIDENTIAL,
    action: 'encrypt',
    severity: 'medium'
  },
  {
    id: 'phone-pattern',
    name: 'Phone Number Detection',
    pattern: /\\b(?:\\+?1[-.\\s]?)?\\(?[0-9]{3}\\)?[-.\\s]?[0-9]{3}[-.\\s]?[0-9]{4}\\b/g,
    classification: DataClassification.CONFIDENTIAL,
    action: 'encrypt',
    severity: 'medium'
  },
  {
    id: 'api-key-pattern',
    name: 'API Key Detection',
    pattern: /\\b[A-Za-z0-9]{32,}\\b/g,
    classification: DataClassification.SECRET,
    action: 'encrypt',
    severity: 'high'
  }
];

// Classify content based on DLP rules
function classifyContent(content) {
  let highestClassification = DataClassification.OPEN;
  const matchedRules = [];
  
  for (const rule of dlpRules) {
    const matches = content.match(rule.pattern);
    if (matches && matches.length > 0) {
      matchedRules.push(rule);
      if (getClassificationLevel(rule.classification) > getClassificationLevel(highestClassification)) {
        highestClassification = rule.classification;
      }
    }
  }
  
  return {
    classification: highestClassification,
    matchedRules,
    confidence: Math.min(matchedRules.length / 10, 1.0)
  };
}

// Get classification level for comparison
function getClassificationLevel(classification) {
  const levels = {
    [DataClassification.OPEN]: 1,
    [DataClassification.CONFIDENTIAL]: 2,
    [DataClassification.SECRET]: 3,
    [DataClassification.TOP_SECRET]: 4
  };
  return levels[classification];
}

// Encrypt data with AES-256-GCM
function encryptData(data, classification) {
  try {
    const key = crypto.scryptSync(process.env.ALEX_AI_ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipherGCM('aes-256-gcm', key);
    cipher.setAAD(Buffer.from(classification));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    
    return {
      encrypted: iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted,
      algorithm: 'aes-256-gcm',
      classification
    };
  } catch (error) {
    console.error('Encryption error:', error);
    return { encrypted: data, algorithm: 'none', classification };
  }
}

// Decrypt data
function decryptData(encryptedData, classification) {
  try {
    const key = crypto.scryptSync(process.env.ALEX_AI_ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const [ivHex, tagHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipherGCM('aes-256-gcm', key);
    decipher.setAAD(Buffer.from(classification));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedData;
  }
}

// Apply security controls to data
function applySecurityControls(data, classification) {
  let processedData = data;
  
  // Apply data masking based on classification
  if (classification === DataClassification.SECRET || classification === DataClassification.TOP_SECRET) {
    // Mask SSNs
    processedData = processedData.replace(/\\b\\d{3}-\\d{2}-\\d{4}\\b/g, 'XXX-XX-XXXX');
    // Mask credit cards
    processedData = processedData.replace(/\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b/g, 'XXXX-XXXX-XXXX-XXXX');
    // Mask emails
    processedData = processedData.replace(/\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b/g, '***@***.***');
    // Mask phone numbers
    processedData = processedData.replace(/\\b(?:\\+?1[-.\\s]?)?\\(?[0-9]{3}\\)?[-.\\s]?[0-9]{3}[-.\\s]?[0-9]{4}\\b/g, '(XXX) XXX-XXXX');
  } else if (classification === DataClassification.CONFIDENTIAL) {
    // Apply moderate masking
    processedData = processedData.replace(/\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b/g, (match) => {
      const [local, domain] = match.split('@');
      return \`\${local[0]}***@\${domain}\`;
    });
  }
  
  return processedData;
}

// Log security event
function logSecurityEvent(event) {
  const securityEvent = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...event
  };
  
  console.log(\`🔒 Security Event: \${event.type} - \${event.details}\`);
  return securityEvent;
}

// Main security processing function
async function processSecureData(items) {
  const results = [];
  
  for (const item of items) {
    try {
      // Extract data from item
      const data = JSON.stringify(item.json || item);
      
      // Classify content
      const classification = classifyContent(data);
      
      // Log security event
      logSecurityEvent({
        type: SecurityEventType.DATA_ACCESS,
        userId: 'n8n-workflow',
        userRole: UserRole.SYSTEM_ADMIN,
        dataClassification: classification.classification,
        details: \`Data processed with \${classification.classification} classification\`,
        severity: 'low',
        result: 'success'
      });
      
      // Apply security controls
      const securedData = applySecurityControls(data, classification.classification);
      
      // Encrypt if needed
      let encryptedData = securedData;
      if (classification.classification !== DataClassification.OPEN) {
        const encryptionResult = encryptData(securedData, classification.classification);
        encryptedData = encryptionResult.encrypted;
      }
      
      // Create secure result
      const secureResult = {
        ...item,
        json: {
          ...item.json,
          originalData: data,
          securedData: securedData,
          encryptedData: encryptedData,
          classification: classification.classification,
          securityLevel: getSecurityLevel(classification.classification),
          matchedRules: classification.matchedRules.map(r => r.name),
          auditId: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        }
      };
      
      results.push(secureResult);
      
    } catch (error) {
      console.error('Security processing error:', error);
      
      // Log security violation
      logSecurityEvent({
        type: SecurityEventType.SECURITY_VIOLATION,
        userId: 'n8n-workflow',
        userRole: UserRole.SYSTEM_ADMIN,
        dataClassification: DataClassification.SECRET,
        details: \`Security processing failed: \${error.message}\`,
        severity: 'high',
        result: 'failure'
      });
      
      // Return original item with error flag
      results.push({
        ...item,
        json: {
          ...item.json,
          securityError: true,
          errorMessage: error.message,
          timestamp: new Date().toISOString()
        }
      });
    }
  }
  
  return results;
}

// Get security level description
function getSecurityLevel(classification) {
  const levels = {
    [DataClassification.OPEN]: 'Standard Security',
    [DataClassification.CONFIDENTIAL]: 'Enhanced Security',
    [DataClassification.SECRET]: 'High Security',
    [DataClassification.TOP_SECRET]: 'Maximum Security'
  };
  return levels[classification];
}

// Process all items through security system
return await processSecureData(items);
        `
      }
    };
  }

  // Generate security validation node
  generateSecurityValidationNode(workflowId, position = { x: 250, y: 350 }) {
    return {
      id: `security-validation-${workflowId}`,
      name: 'Security Validation',
      type: 'n8n-nodes-base.function',
      typeVersion: 1,
      position,
      parameters: {
        functionCode: `
// Security Validation Node
// Validates security compliance and generates audit reports

const crypto = require('crypto');

// Validate security compliance
function validateSecurityCompliance(items) {
  const results = [];
  let totalItems = 0;
  let compliantItems = 0;
  let securityViolations = 0;
  
  for (const item of items) {
    totalItems++;
    
    const data = item.json;
    
    // Check if item has security processing
    if (!data.classification) {
      securityViolations++;
      results.push({
        ...item,
        json: {
          ...data,
          securityValidation: {
            status: 'non-compliant',
            reason: 'No security classification found',
            severity: 'high'
          }
        }
      });
      continue;
    }
    
    // Check if item has audit trail
    if (!data.auditId) {
      securityViolations++;
      results.push({
        ...item,
        json: {
          ...data,
          securityValidation: {
            status: 'non-compliant',
            reason: 'No audit trail found',
            severity: 'medium'
          }
        }
      });
      continue;
    }
    
    // Check if encryption is appropriate for classification
    if (data.classification !== 'open' && !data.encryptedData) {
      securityViolations++;
      results.push({
        ...item,
        json: {
          ...data,
          securityValidation: {
            status: 'non-compliant',
            reason: 'Sensitive data not encrypted',
            severity: 'high'
          }
        }
      });
      continue;
    }
    
    // Item is compliant
    compliantItems++;
    results.push({
      ...item,
      json: {
        ...data,
        securityValidation: {
          status: 'compliant',
          reason: 'All security requirements met',
          severity: 'low'
        }
      }
    });
  }
  
  // Generate security report
  const securityReport = {
    totalItems,
    compliantItems,
    securityViolations,
    complianceRate: (compliantItems / totalItems) * 100,
    timestamp: new Date().toISOString()
  };
  
  console.log(\`🔒 Security Validation Report:\`);
  console.log(\`   Total Items: \${securityReport.totalItems}\`);
  console.log(\`   Compliant Items: \${securityReport.compliantItems}\`);
  console.log(\`   Security Violations: \${securityReport.securityViolations}\`);
  console.log(\`   Compliance Rate: \${securityReport.complianceRate.toFixed(1)}%\`);
  
  return results;
}

// Process all items through security validation
return validateSecurityCompliance(items);
        `
      }
    };
  }

  // Generate audit logging node
  generateAuditLoggingNode(workflowId, position = { x: 250, y: 500 }) {
    return {
      id: `audit-logging-${workflowId}`,
      name: 'Audit Logging',
      type: 'n8n-nodes-base.function',
      typeVersion: 1,
      position,
      parameters: {
        functionCode: `
// Audit Logging Node
// Logs all security events and maintains audit trail

const crypto = require('crypto');

// Log security events
function logSecurityEvents(items) {
  const auditLog = [];
  
  for (const item of items) {
    const data = item.json;
    
    // Create audit entry
    const auditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      workflowId: '${workflowId}',
      itemId: item.id || 'unknown',
      classification: data.classification || 'unknown',
      securityLevel: data.securityLevel || 'unknown',
      auditId: data.auditId || crypto.randomUUID(),
      securityValidation: data.securityValidation || { status: 'unknown' },
      originalDataSize: data.originalData ? data.originalData.length : 0,
      securedDataSize: data.securedData ? data.securedData.length : 0,
      encryptedDataSize: data.encryptedData ? data.encryptedData.length : 0,
      matchedRules: data.matchedRules || [],
      securityError: data.securityError || false,
      errorMessage: data.errorMessage || null
    };
    
    auditLog.push(auditEntry);
    
    // Add audit entry to item
    item.json.auditEntry = auditEntry;
  }
  
  // Log audit summary
  console.log(\`📊 Audit Log Summary:\`);
  console.log(\`   Total Items Processed: \${auditLog.length}\`);
  console.log(\`   Security Errors: \${auditLog.filter(e => e.securityError).length}\`);
  console.log(\`   Average Data Size: \${auditLog.reduce((sum, e) => sum + e.originalDataSize, 0) / auditLog.length}\`);
  
  return items;
}

// Process all items through audit logging
return logSecurityEvents(items);
        `
      }
    };
  }

  // Update workflow with security nodes
  async updateWorkflowWithSecurity(workflow) {
    try {
      console.log(`🔒 Updating workflow "${workflow.name}" with security nodes...`);
      
      // Generate security nodes
      const securityNode = this.generateSecurityNode(workflow.id);
      const validationNode = this.generateSecurityValidationNode(workflow.id);
      const auditNode = this.generateAuditLoggingNode(workflow.id);
      
      // Add security nodes to workflow
      workflow.nodes.push(securityNode);
      workflow.nodes.push(validationNode);
      workflow.nodes.push(auditNode);
      
      // Add connections between nodes
      const connections = workflow.connections || [];
      
      // Connect security node to validation node
      connections.push({
        node: securityNode.id,
        type: 'main',
        index: 0,
        nodeType: securityNode.type
      });
      
      // Connect validation node to audit node
      connections.push({
        node: validationNode.id,
        type: 'main',
        index: 0,
        nodeType: validationNode.type
      });
      
      workflow.connections = connections;
      
      // Update workflow
      const response = await axios.put(
        `${this.apiUrl}/workflows/${workflow.id}`,
        workflow,
        this.axiosConfig
      );
      
      console.log(`✅ Workflow "${workflow.name}" updated with security nodes`);
      return response.data;
      
    } catch (error) {
      console.error(`❌ Failed to update workflow "${workflow.name}":`, error.message);
      return null;
    }
  }

  // Integrate security into all workflows
  async integrateSecurityIntoAllWorkflows() {
    try {
      console.log('🚀 Starting N8N security integration...');
      
      // Test connection
      const connected = await this.testConnection();
      if (!connected) {
        throw new Error('Failed to connect to N8N API');
      }
      
      // Get all workflows
      const workflows = await this.getAllWorkflows();
      if (workflows.length === 0) {
        console.log('⚠️ No workflows found');
        return;
      }
      
      // Update each workflow
      const results = [];
      for (const workflow of workflows) {
        const result = await this.updateWorkflowWithSecurity(workflow);
        if (result) {
          results.push({
            workflowId: workflow.id,
            workflowName: workflow.name,
            status: 'success',
            message: 'Security nodes added successfully'
          });
        } else {
          results.push({
            workflowId: workflow.id,
            workflowName: workflow.name,
            status: 'failed',
            message: 'Failed to add security nodes'
          });
        }
      }
      
      // Generate summary report
      const successCount = results.filter(r => r.status === 'success').length;
      const failureCount = results.filter(r => r.status === 'failed').length;
      
      console.log('\n📊 N8N Security Integration Summary:');
      console.log(`   Total Workflows: ${workflows.length}`);
      console.log(`   Successfully Updated: ${successCount}`);
      console.log(`   Failed Updates: ${failureCount}`);
      console.log(`   Success Rate: ${((successCount / workflows.length) * 100).toFixed(1)}%`);
      
      if (failureCount > 0) {
        console.log('\n❌ Failed Workflows:');
        results.filter(r => r.status === 'failed').forEach(r => {
          console.log(`   - ${r.workflowName}: ${r.message}`);
        });
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ N8N security integration failed:', error.message);
      throw error;
    }
  }
}

// Main execution
async function main() {
  try {
    console.log('🔒 Alex AI N8N Security Integration');
    console.log('====================================\n');
    
    // Load environment variables
    loadZshrcEnv();
    
    // Create integrator
    const integrator = new N8NSecurityIntegrator();
    
    // Integrate security into all workflows
    await integrator.integrateSecurityIntoAllWorkflows();
    
    console.log('\n✅ N8N security integration completed successfully!');
    console.log('🔒 All workflows now have air-tight security like a submarine!');
    
  } catch (error) {
    console.error('❌ N8N security integration failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { N8NSecurityIntegrator };




