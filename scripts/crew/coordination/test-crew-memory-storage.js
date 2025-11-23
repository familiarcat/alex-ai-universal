#!/usr/bin/env node
/**
 * Test Crew Memory Storage System
 * 
 * Stores a unique test memory for each crew member via the N8N workflow
 * to verify the system is working from Cursor AI chat memory system.
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

// Crew member definitions with test memories
const CREW_TEST_MEMORIES = {
  picard: {
    title: 'Strategic Test: Memory System Validation',
    summary: 'Conducted strategic review of the memory storage system activation. Verified that the optimized workflow is operational and that crew coordination protocols are functioning correctly.',
    detailedAnalysis: `# Strategic Test: Memory System Validation

## Overview
As Commanding Officer, I have reviewed the activation of our optimized memory storage workflow. This test validates that our strategic coordination and mission continuity protocols are functioning correctly.

## Key Findings
- Optimized workflow successfully activated in N8N
- Crew coordination systems operational
- Prime Directive compliance maintained
- Memory deduplication protocols active

## Strategic Assessment
The activation of the optimized memory workflow represents a significant advancement in our collective intelligence capabilities. The system now provides enhanced organization, deduplication, and semantic search capabilities that will improve our mission effectiveness.

## Recommendations
- Continue monitoring workflow execution
- Track deduplication effectiveness
- Maintain crew coordination protocols
- Review memory organization quarterly`,
    keyFindings: [
      'Optimized workflow operational',
      'Crew coordination functioning',
      'Prime Directive compliance verified'
    ],
    conclusions: [
      'Memory system is ready for operational use',
      'Strategic coordination protocols are effective'
    ],
    recommendations: [
      'Continue monitoring system performance',
      'Maintain crew coordination standards'
    ],
    tags: ['test', 'strategic-assessment', 'memory-validation', 'crew-coordination', 'system-activation'],
    knowledgeType: 'strategic_assessment',
    priority: 'high'
  },
  riker: {
    title: 'Tactical Test: Workflow Execution Verification',
    summary: 'Executed tactical verification of workflow activation and execution protocols. Confirmed that all tactical operations and workflow management systems are functioning correctly.',
    detailedAnalysis: `# Tactical Test: Workflow Execution Verification

## Overview
As Executive Officer, I have executed a tactical verification of our workflow activation procedures. This test confirms that our tactical operations and execution protocols are functioning correctly.

## Key Findings
- Workflow activation completed successfully
- Execution protocols verified
- Team coordination functioning
- Resource management optimal

## Tactical Assessment
The workflow activation was executed flawlessly. All tactical protocols were followed, and the system is ready for operational deployment. Team coordination remains strong, and resource utilization is optimal.

## Recommendations
- Maintain current execution protocols
- Continue tactical monitoring
- Optimize resource allocation as needed`,
    keyFindings: [
      'Workflow activation successful',
      'Execution protocols verified',
      'Team coordination optimal'
    ],
    conclusions: [
      'Tactical systems are operational',
      'Execution protocols are effective'
    ],
    recommendations: [
      'Maintain tactical monitoring',
      'Continue execution optimization'
    ],
    tags: ['test', 'tactical-operations', 'workflow-execution', 'team-coordination', 'verification'],
    knowledgeType: 'tactical_operations',
    priority: 'high'
  },
  data: {
    title: 'Technical Test: System Optimization Analysis',
    summary: 'Performed technical analysis of the memory storage optimization system. Verified deduplication algorithms, vector embedding generation, and semantic search capabilities are functioning correctly.',
    detailedAnalysis: `# Technical Test: System Optimization Analysis

## Overview
As Operations Officer, I have conducted a comprehensive technical analysis of our optimized memory storage system. This test validates all technical components including deduplication, vector embeddings, and semantic search.

## Key Findings
- Deduplication algorithms functioning correctly
- Vector embedding generation operational
- Semantic search capabilities verified
- System optimization metrics within acceptable parameters

## Technical Assessment
The optimized workflow demonstrates excellent technical performance. Deduplication prevents redundant storage, vector embeddings enable semantic search, and the overall system architecture is sound. All technical metrics are within acceptable parameters.

## Recommendations
- Continue monitoring technical performance
- Track deduplication rates
- Monitor vector embedding quality
- Optimize semantic search parameters as needed`,
    keyFindings: [
      'Deduplication algorithms operational',
      'Vector embeddings functioning',
      'Semantic search verified'
    ],
    conclusions: [
      'Technical systems are performing optimally',
      'All optimization features are functional'
    ],
    recommendations: [
      'Monitor technical metrics continuously',
      'Optimize parameters based on usage patterns'
    ],
    tags: ['test', 'technical-analysis', 'system-optimization', 'deduplication', 'vector-embeddings'],
    knowledgeType: 'technical_analysis',
    priority: 'high'
  },
  la_forge: {
    title: 'Engineering Test: Infrastructure Health Verification',
    summary: 'Conducted engineering verification of infrastructure health and system monitoring. Confirmed that all infrastructure components, monitoring systems, and preventive maintenance protocols are functioning correctly.',
    detailedAnalysis: `# Engineering Test: Infrastructure Health Verification

## Overview
As Chief Engineer, I have verified the health of our infrastructure supporting the memory storage system. This test confirms that all engineering systems, monitoring protocols, and preventive maintenance procedures are functioning correctly.

## Key Findings
- Infrastructure health optimal
- System monitoring functioning
- Preventive maintenance protocols active
- Engineering solutions effective

## Engineering Assessment
The infrastructure supporting our memory storage system is in excellent condition. All monitoring systems are operational, and preventive maintenance protocols are functioning as designed. The engineering solutions implemented are effective and reliable.

## Recommendations
- Continue infrastructure monitoring
- Maintain preventive maintenance schedules
- Monitor system health metrics
- Optimize engineering solutions as needed`,
    keyFindings: [
      'Infrastructure health optimal',
      'Monitoring systems operational',
      'Preventive maintenance active'
    ],
    conclusions: [
      'Infrastructure is in excellent condition',
      'Engineering systems are reliable'
    ],
    recommendations: [
      'Maintain current monitoring protocols',
      'Continue preventive maintenance'
    ],
    tags: ['test', 'infrastructure-health', 'system-monitoring', 'preventive-maintenance', 'engineering'],
    knowledgeType: 'engineering_solution',
    priority: 'high'
  },
  worf: {
    title: 'Security Test: System Security Verification',
    summary: 'Performed security analysis and threat assessment of the memory storage system. Verified that all security protocols, defensive strategies, and compliance measures are functioning correctly.',
    detailedAnalysis: `# Security Test: System Security Verification

## Overview
As Security Officer, I have conducted a comprehensive security analysis of our memory storage system. This test validates that all security protocols, threat assessment capabilities, and defensive strategies are functioning correctly.

## Key Findings
- Security protocols operational
- Threat assessment capabilities verified
- Defensive strategies effective
- Compliance measures functioning

## Security Assessment
The memory storage system demonstrates strong security posture. All security protocols are operational, threat assessment capabilities are functioning correctly, and defensive strategies are effective. Compliance measures are in place and functioning as designed.

## Recommendations
- Continue security monitoring
- Maintain threat assessment protocols
- Strengthen defensive strategies as needed
- Ensure compliance measures remain current`,
    keyFindings: [
      'Security protocols operational',
      'Threat assessment verified',
      'Defensive strategies effective'
    ],
    conclusions: [
      'Security systems are robust',
      'Compliance measures are effective'
    ],
    recommendations: [
      'Maintain continuous security monitoring',
      'Update defensive strategies as threats evolve'
    ],
    tags: ['test', 'security-analysis', 'threat-assessment', 'defensive-strategies', 'compliance'],
    knowledgeType: 'security_analysis',
    priority: 'high'
  },
  troi: {
    title: 'UX Test: User Experience Validation',
    summary: 'Conducted user experience validation of the memory storage system from a psychological and empathic perspective. Verified that the system is intuitive, accessible, and provides positive user experience.',
    detailedAnalysis: `# UX Test: User Experience Validation

## Overview
As Ship's Counselor, I have evaluated the memory storage system from a user experience and psychological perspective. This test validates that the system is intuitive, accessible, and provides a positive experience for all users.

## Key Findings
- User experience is positive
- System is intuitive and accessible
- Communication optimization effective
- Psychological assessment favorable

## UX Assessment
The memory storage system provides an excellent user experience. The interface is intuitive, the system is accessible, and communication protocols are optimized. From a psychological perspective, the system is well-designed and user-friendly.

## Recommendations
- Continue UX monitoring
- Gather user feedback regularly
- Optimize communication protocols
- Maintain accessibility standards`,
    keyFindings: [
      'User experience is positive',
      'System is intuitive',
      'Communication optimized'
    ],
    conclusions: [
      'UX design is effective',
      'System is user-friendly'
    ],
    recommendations: [
      'Continue gathering user feedback',
      'Maintain UX standards'
    ],
    tags: ['test', 'user-experience', 'psychological-assessment', 'communication-optimization', 'ux-validation'],
    knowledgeType: 'user_experience',
    priority: 'medium'
  },
  crusher: {
    title: 'Health Test: System Health Monitoring',
    summary: 'Performed system health monitoring and medical assessment of the memory storage system. Verified that all health monitoring protocols, preventive care measures, and diagnostic capabilities are functioning correctly.',
    detailedAnalysis: `# Health Test: System Health Monitoring

## Overview
As Chief Medical Officer, I have conducted a comprehensive health assessment of our memory storage system. This test validates that all health monitoring protocols, preventive care measures, and diagnostic capabilities are functioning correctly.

## Key Findings
- System health optimal
- Health monitoring functioning
- Preventive care measures active
- Diagnostic capabilities verified

## Health Assessment
The memory storage system is in excellent health. All health monitoring protocols are functioning correctly, preventive care measures are active, and diagnostic capabilities are operational. The system demonstrates robust health metrics.

## Recommendations
- Continue health monitoring
- Maintain preventive care protocols
- Monitor health metrics regularly
- Address any health issues proactively`,
    keyFindings: [
      'System health optimal',
      'Health monitoring functioning',
      'Preventive care active'
    ],
    conclusions: [
      'System is in excellent health',
      'Health protocols are effective'
    ],
    recommendations: [
      'Maintain health monitoring schedules',
      'Continue preventive care measures'
    ],
    tags: ['test', 'system-health', 'health-monitoring', 'preventive-care', 'medical-assessment'],
    knowledgeType: 'medical_assessment',
    priority: 'medium'
  },
  uhura: {
    title: 'Communication Test: Network Optimization Verification',
    summary: 'Conducted communication system and network optimization verification. Confirmed that all communication protocols, data transmission systems, and network optimization features are functioning correctly.',
    detailedAnalysis: `# Communication Test: Network Optimization Verification

## Overview
As Communications Officer, I have verified the communication systems and network optimization features of our memory storage system. This test confirms that all communication protocols, data transmission capabilities, and network optimization features are functioning correctly.

## Key Findings
- Communication systems operational
- Data transmission functioning
- Network optimization effective
- Integration protocols verified

## Communication Assessment
The communication systems supporting our memory storage are functioning excellently. Data transmission is reliable, network optimization is effective, and integration protocols are working correctly. The system demonstrates strong communication capabilities.

## Recommendations
- Continue communication monitoring
- Optimize data transmission as needed
- Maintain network optimization
- Ensure integration protocols remain current`,
    keyFindings: [
      'Communication systems operational',
      'Data transmission functioning',
      'Network optimization effective'
    ],
    conclusions: [
      'Communication systems are reliable',
      'Network optimization is effective'
    ],
    recommendations: [
      'Monitor communication performance',
      'Maintain network optimization'
    ],
    tags: ['test', 'communication-systems', 'data-transmission', 'network-optimization', 'integration'],
    knowledgeType: 'communication_protocol',
    priority: 'medium'
  },
  quark: {
    title: 'Business Test: Cost Optimization Analysis',
    summary: 'Performed business optimization and cost analysis of the memory storage system. Verified that cost efficiency, resource optimization, and ROI metrics are within acceptable parameters.',
    detailedAnalysis: `# Business Test: Cost Optimization Analysis

## Overview
As Business Operations Specialist, I have conducted a comprehensive cost analysis of our memory storage system. This test validates that cost efficiency, resource optimization, and ROI metrics are within acceptable parameters.

## Key Findings
- Cost efficiency optimal
- Resource optimization effective
- ROI metrics favorable
- Business operations efficient

## Business Assessment
The memory storage system demonstrates excellent cost efficiency. Resource optimization is effective, ROI metrics are favorable, and business operations are running efficiently. The system provides good value for investment.

## Recommendations
- Continue cost monitoring
- Optimize resource allocation
- Track ROI metrics
- Maintain business efficiency`,
    keyFindings: [
      'Cost efficiency optimal',
      'Resource optimization effective',
      'ROI metrics favorable'
    ],
    conclusions: [
      'Business operations are efficient',
      'Cost optimization is effective'
    ],
    recommendations: [
      'Monitor costs continuously',
      'Optimize resources as needed'
    ],
    tags: ['test', 'business-optimization', 'cost-analysis', 'resource-optimization', 'roi'],
    knowledgeType: 'business_optimization',
    priority: 'medium'
  },
  chief_obrien: {
    title: 'Operations Test: Pragmatic Solution Verification',
    summary: 'Conducted operations verification and pragmatic solution testing. Confirmed that all operational procedures, troubleshooting capabilities, and practical implementation features are functioning correctly.',
    detailedAnalysis: `# Operations Test: Pragmatic Solution Verification

## Overview
As Operations Specialist, I have verified the operational procedures and pragmatic solutions of our memory storage system. This test confirms that all operational procedures, troubleshooting capabilities, and practical implementation features are functioning correctly.

## Key Findings
- Operational procedures effective
- Troubleshooting capabilities verified
- Practical implementation functioning
- Operations management optimal

## Operations Assessment
The memory storage system demonstrates excellent operational capabilities. All procedures are effective, troubleshooting capabilities are verified, and practical implementation is functioning correctly. The system is operationally sound.

## Recommendations
- Maintain operational procedures
- Continue troubleshooting capabilities
- Optimize practical implementation
- Ensure operations management remains effective`,
    keyFindings: [
      'Operational procedures effective',
      'Troubleshooting verified',
      'Practical implementation functioning'
    ],
    conclusions: [
      'Operations are running smoothly',
      'Pragmatic solutions are effective'
    ],
    recommendations: [
      'Maintain operational standards',
      'Continue practical optimization'
    ],
    tags: ['test', 'operations-management', 'troubleshooting', 'pragmatic-solutions', 'practical-implementation'],
    knowledgeType: 'problem_solution',
    priority: 'medium'
  }
};

// Send memory to N8N workflow
function sendToN8N(webhookPath, payload) {
  return new Promise((resolve, reject) => {
    const creds = loadCrewCredentials();
    const N8N_BASE_URL = creds.n8n?.baseUrl || 'https://n8n.pbradygeorgen.com';
    const url = new URL(`${N8N_BASE_URL}/webhook/${webhookPath}`);
    const data = JSON.stringify(payload);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 15000
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body });
        } else {
          reject(new Error(`N8N workflow returned ${res.statusCode}: ${body.substring(0, 200)}`));
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.write(data);
    req.end();
  });
}

// Store memory for a crew member
async function storeCrewMemory(crewId, memory) {
  const payload = {
    title: memory.title,
    summary: memory.summary,
    detailedAnalysis: memory.detailedAnalysis,
    keyFindings: memory.keyFindings,
    conclusions: memory.conclusions,
    recommendations: memory.recommendations,
    tags: [...memory.tags, 'cursor-ai-test', 'system-validation', 'memory-storage-test'],
    crewMember: crewId,
    knowledgeType: memory.knowledgeType,
    priority: memory.priority,
    platform: 'cursor-ai',
    sessionId: `test-${Date.now()}-${crewId}`,
    timestamp: new Date().toISOString(),
    vectorOptimization: {
      enabled: true,
      fragmentationEnabled: true,
      deduplicationEnabled: true
    }
  };
  
  try {
    const result = await sendToN8N('crew-memory-storage', payload);
    return { success: true, crewId, result };
  } catch (error) {
    return { success: false, crewId, error: error.message };
  }
}

// Main execution
async function main() {
  console.log('\n' + '═'.repeat(80));
  console.log('🧪 TESTING CREW MEMORY STORAGE SYSTEM');
  console.log('═'.repeat(80));
  console.log('\nStoring test memories for all crew members via N8N workflow...\n');
  
  const results = [];
  
  // Store memory for each crew member
  for (const [crewId, memory] of Object.entries(CREW_TEST_MEMORIES)) {
    console.log(`📤 Storing test memory for ${crewId}...`);
    const result = await storeCrewMemory(crewId, memory);
    results.push(result);
    
    if (result.success) {
      console.log(`   ✅ Success: ${memory.title}`);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n' + '═'.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('═'.repeat(80));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}\n`);
  
  if (failed > 0) {
    console.log('Failed crew members:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   • ${r.crewId}: ${r.error}`);
    });
    console.log('');
  }
  
  if (successful === results.length) {
    console.log('🎉 All test memories stored successfully!');
    console.log('\n💡 Next step: Run the Observation Lounge meeting script to see crew members recount their memories:');
    console.log('   node scripts/observation-lounge-crew-meeting.js\n');
  } else {
    console.log('⚠️  Some memories failed to store. Check N8N workflow status.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`\n❌ Test failed: ${error.message}`);
  if (error.stack) {
    console.error('   Stack:', error.stack);
  }
  process.exit(1);
});

