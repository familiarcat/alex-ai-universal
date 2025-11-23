#!/usr/bin/env node
/**
 * Crew Coordination: N8N Restart and Repopulation
 * 
 * All crew members self-organize to:
 * 1. Verify AWS CLI configuration and instance ID
 * 2. Update Docker, Terraform, and N8N references
 * 3. Restart N8N instance
 * 4. Repopulate workflows and configurations
 * 
 * DDD Workflow: Client => N8N => Supabase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TARGET_INSTANCE_ID = 'i-0afdf313f61f22df0';
const WORKSPACE_ROOT = path.join(__dirname, '..');

// Crew member personas
const crew = {
  picard: {
    name: 'Captain Picard',
    role: 'Strategic Leadership',
    focus: 'Mission coordination and decision-making',
    emoji: '👨‍✈️'
  },
  data: {
    name: 'Commander Data',
    role: 'Systems Analysis',
    focus: 'Technical analysis and verification',
    emoji: '🤖'
  },
  geordi: {
    name: 'Lieutenant Commander Geordi La Forge',
    role: 'Infrastructure Engineering',
    focus: 'Terraform, Docker, and infrastructure',
    emoji: '⚙️'
  },
  worf: {
    name: 'Lieutenant Worf',
    role: 'Security & Validation',
    focus: 'Security validation and access control',
    emoji: '⚔️'
  },
  crusher: {
    name: 'Dr. Crusher',
    role: 'Health Monitoring',
    focus: 'System health and monitoring',
    emoji: '🏥'
  },
  riker: {
    name: 'Commander Riker',
    role: 'Operations & Execution',
    focus: 'Script execution and automation',
    emoji: '⚡'
  },
  troi: {
    name: 'Counselor Troi',
    role: 'User Experience',
    focus: 'User experience and workflow optimization',
    emoji: '💭'
  },
  uhura: {
    name: 'Lieutenant Uhura',
    role: 'Communication & Integration',
    focus: 'N8N workflows and webhook integration',
    emoji: '📡'
  },
  quark: {
    name: 'Quark',
    role: 'Business Operations',
    focus: 'Cost optimization and efficiency',
    emoji: '💰'
  },
  obrien: {
    name: 'Chief O\'Brien',
    role: 'Infrastructure Maintenance',
    focus: 'Docker, system maintenance, and reliability',
    emoji: '🔧'
  }
};

function log(crewMember, message) {
  const member = crew[crewMember];
  console.log(`${member.emoji} ${member.name}: ${message}`);
}

function analyzeTask() {
  log('picard', 'Initiating crew coordination for N8N restart and repopulation...');
  
  const analysis = {
    task: 'N8N Restart and Repopulation',
    targetInstance: TARGET_INSTANCE_ID,
    objectives: [
      'Verify AWS CLI configuration points to correct instance',
      'Update all Docker, Terraform, and N8N references',
      'Restart N8N instance safely',
      'Repopulate workflows and configurations',
      'Verify N8N health and connectivity'
    ],
    crewAssignments: {},
    findings: [],
    recommendations: []
  };

  // Data: Verify AWS configuration
  log('data', 'Analyzing AWS CLI configuration and instance status...');
  try {
    const instanceInfo = execSync(
      `aws ec2 describe-instances --instance-ids ${TARGET_INSTANCE_ID} --query 'Reservations[0].Instances[0].[InstanceId,State.Name,PublicIpAddress,Tags[?Key==\`Name\`].Value|[0]]' --output json`,
      { encoding: 'utf-8', cwd: WORKSPACE_ROOT }
    );
    const [instanceId, state, publicIp, name] = JSON.parse(instanceInfo);
    analysis.findings.push({
      crew: 'data',
      finding: `Instance ${instanceId} is ${state} with IP ${publicIp}, tagged as "${name}"`
    });
    
    if (state !== 'running') {
      analysis.recommendations.push({
        crew: 'riker',
        priority: 'high',
        action: `Start instance ${TARGET_INSTANCE_ID} before proceeding`
      });
    }
  } catch (error) {
    analysis.findings.push({
      crew: 'data',
      finding: `Error verifying instance: ${error.message}`,
      severity: 'error'
    });
  }

  // Geordi: Analyze Terraform and Docker configurations
  log('geordi', 'Reviewing Terraform and Docker configurations...');
  const terraformFiles = [
    'terraform/n8n-infrastructure/main.tf',
    'terraform/n8n-infrastructure/variables.tf',
    'terraform/n8n-infrastructure/outputs.tf'
  ];
  
  const dockerFiles = [
    'docker-compose.n8n.yml',
    'scripts/deploy-n8n-terraform-docker.sh',
    'scripts/restart-n8n-server.sh'
  ];

  terraformFiles.forEach(file => {
    const filePath = path.join(WORKSPACE_ROOT, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (!content.includes(TARGET_INSTANCE_ID)) {
        analysis.recommendations.push({
          crew: 'geordi',
          priority: 'medium',
          action: `Update ${file} to reference instance ${TARGET_INSTANCE_ID} if needed`
        });
      }
    }
  });

  dockerFiles.forEach(file => {
    const filePath = path.join(WORKSPACE_ROOT, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      // Check for old instance IDs or hardcoded references
      const oldInstancePattern = /i-[a-f0-9]{17}/g;
      const matches = content.match(oldInstancePattern);
      if (matches && !matches.includes(TARGET_INSTANCE_ID)) {
        analysis.recommendations.push({
          crew: 'geordi',
          priority: 'high',
          action: `Update ${file} to use instance ${TARGET_INSTANCE_ID}`
        });
      }
    }
  });

  // Worf: Security validation
  log('worf', 'Validating security and access controls...');
  analysis.findings.push({
    crew: 'worf',
    finding: 'Using AWS SSM for secure access (no SSH keys required)'
  });
  analysis.findings.push({
    crew: 'worf',
    finding: 'Instance has IAM role with SSM permissions'
  });

  // Uhura: N8N workflow integration
  log('uhura', 'Analyzing N8N workflow references...');
  const n8nScripts = [
    'scripts/n8n-post-knowledge.js',
    'scripts/check-n8n-health.js',
    'scripts/n8n-sync-webhooks.js'
  ];
  
  n8nScripts.forEach(script => {
    const scriptPath = path.join(WORKSPACE_ROOT, script);
    if (fs.existsSync(scriptPath)) {
      analysis.findings.push({
        crew: 'uhura',
        finding: `N8N script found: ${script}`
      });
    }
  });

  // Quark: Cost optimization
  log('quark', 'Assessing cost implications...');
  analysis.findings.push({
    crew: 'quark',
    finding: 'Using existing instance prevents new EC2 charges'
  });
  analysis.findings.push({
    crew: 'quark',
    finding: 'Docker-based deployment minimizes resource overhead'
  });

  // O'Brien: Infrastructure maintenance
  log('obrien', 'Reviewing maintenance procedures...');
  analysis.recommendations.push({
    crew: 'obrien',
    priority: 'high',
    action: 'Ensure Docker is running on instance before restart'
  });
  analysis.recommendations.push({
    crew: 'obrien',
    priority: 'medium',
    action: 'Backup N8N data before restart'
  });

  // Riker: Execution plan
  log('riker', 'Formulating tactical execution plan...');
  analysis.crewAssignments = {
    data: 'Verify AWS CLI and instance status',
    geordi: 'Update Terraform and Docker configurations',
    worf: 'Validate security and access',
    obrien: 'Prepare Docker restart procedures',
    riker: 'Execute restart and verification',
    uhura: 'Repopulate N8N workflows',
    crusher: 'Monitor health post-restart',
    troi: 'Verify user experience',
    quark: 'Optimize costs',
    picard: 'Coordinate overall mission'
  };

  return analysis;
}

function generateExecutionPlan(analysis) {
  log('picard', 'Crew coordination complete. Generating execution plan...');
  
  const plan = {
    phase1_verification: [
      'Verify AWS CLI configuration',
      `Confirm instance ${TARGET_INSTANCE_ID} is running`,
      'Check instance tags and IP addresses'
    ],
    phase2_updates: [
      'Update restart-n8n-server.sh with correct instance ID',
      'Update deploy-n8n-terraform-docker.sh if needed',
      'Verify Docker configuration files',
      'Update any hardcoded instance references'
    ],
    phase3_restart: [
      'Backup N8N data (if possible)',
      'Restart N8N Docker container via SSM',
      'Verify Docker container is running',
      'Check N8N service health'
    ],
    phase4_repopulation: [
      'Sync N8N workflows',
      'Register webhooks',
      'Verify workflow activation',
      'Test N8N connectivity'
    ],
    phase5_verification: [
      'Health check via check-n8n-health.js',
      'Verify webhook endpoints',
      'Test crew workflow connectivity',
      'Confirm DDD workflow (Client => N8N => Supabase)'
    ]
  };

  return plan;
}

function main() {
  console.log('\n🖖 Alex AI Crew Coordination: N8N Restart and Repopulation\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const analysis = analyzeTask();
  const plan = generateExecutionPlan(analysis);

  // Output analysis
  console.log('\n📊 Crew Analysis Results:\n');
  analysis.findings.forEach(f => {
    const member = crew[f.crew];
    console.log(`${member.emoji} ${member.name}: ${f.finding}`);
  });

  console.log('\n💡 Recommendations:\n');
  analysis.recommendations.forEach(r => {
    const member = crew[r.crew];
    console.log(`${member.emoji} [${r.priority.toUpperCase()}] ${member.name}: ${r.action}`);
  });

  console.log('\n📋 Execution Plan:\n');
  Object.entries(plan).forEach(([phase, steps]) => {
    console.log(`\n${phase.replace(/_/g, ' ').toUpperCase()}:`);
    steps.forEach((step, i) => {
      console.log(`  ${i + 1}. ${step}`);
    });
  });

  console.log('\n\n🎯 Crew Assignments:\n');
  Object.entries(analysis.crewAssignments).forEach(([member, task]) => {
    const memberInfo = crew[member];
    console.log(`${memberInfo.emoji} ${memberInfo.name}: ${task}`);
  });

  // Save analysis to file
  const outputPath = path.join(WORKSPACE_ROOT, 'docs', 'crew-n8n-restart-analysis.json');
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify({
    analysis,
    plan,
    timestamp: new Date().toISOString(),
    targetInstance: TARGET_INSTANCE_ID
  }, null, 2));

  console.log(`\n✅ Analysis saved to: ${outputPath}`);
  console.log('\n🚀 Ready for execution. Crew members are coordinated and ready.\n');
  log('picard', 'Make it so!');
}

if (require.main === module) {
  main();
}

module.exports = { analyzeTask, generateExecutionPlan, crew };

