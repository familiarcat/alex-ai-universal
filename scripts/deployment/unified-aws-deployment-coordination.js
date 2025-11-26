#!/usr/bin/env node

/**
 * 🖖 Unified AWS Deployment Coordination
 * 
 * Organizes crew to design a unified deployment structure for:
 * - mcp.pbradygeorgen.com (MCP Server)
 * - n8n.pbradygeorgen.com (n8n Workflows)
 * - projects.pbradygeorgen.com (Dashboard + Projects)
 * 
 * Crew Coordination:
 * - La Forge: Infrastructure and Docker/Terraform alignment
 * - Riker: Deployment workflow and execution
 * - Data: Configuration analysis and optimization
 * - Picard: Strategic deployment architecture
 * - O'Brien: Pragmatic implementation
 * - Quark: Cost optimization
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CREW_TEAMS = [
  {
    team: 'Infrastructure Analysis',
    members: ['la_forge', 'data'],
    task: 'Analyze Docker and Terraform configurations for alignment'
  },
  {
    team: 'Deployment Architecture',
    members: ['picard', 'la_forge'],
    task: 'Design unified deployment structure'
  },
  {
    team: 'AWS Integration',
    members: ['la_forge', 'obrien'],
    task: 'Create AWS CLI deployment scripts using ~/.zshrc credentials'
  },
  {
    team: 'Cost Optimization',
    members: ['quark', 'riker'],
    task: 'Optimize deployment costs and resource allocation'
  },
  {
    team: 'Execution',
    members: ['riker', 'obrien'],
    task: 'Implement deployment scripts and workflows'
  }
];

function loadZshrcCredentials() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  
  if (!fs.existsSync(zshrcPath)) {
    return null;
  }
  
  const zshrcContent = fs.readFileSync(zshrcPath, 'utf-8');
  const credentials = {};
  
  // Extract AWS credentials
  const awsProfileMatch = zshrcContent.match(/export\s+AWS_PROFILE=["']?([^"'\s]+)["']?/);
  if (awsProfileMatch) {
    credentials.awsProfile = awsProfileMatch[1];
  }
  
  const awsRegionMatch = zshrcContent.match(/export\s+AWS_DEFAULT_REGION=["']?([^"'\s]+)["']?/);
  if (awsRegionMatch) {
    credentials.awsRegion = awsRegionMatch[1];
  }
  
  // Extract API keys
  const n8nApiKeyMatch = zshrcContent.match(/export\s+N8N_API_KEY=["']?([^"'\n]+)["']?/);
  if (n8nApiKeyMatch) {
    credentials.n8nApiKey = n8nApiKeyMatch[1];
  }
  
  const mcpApiKeyMatch = zshrcContent.match(/export\s+MCP_API_KEY=["']?([^"'\n]+)["']?/);
  if (mcpApiKeyMatch) {
    credentials.mcpApiKey = mcpApiKeyMatch[1];
  }
  
  // Extract Supabase credentials
  const supabaseUrlMatch = zshrcContent.match(/export\s+SUPABASE_URL=["']?([^"'\n]+)["']?/);
  if (supabaseUrlMatch) {
    credentials.supabaseUrl = supabaseUrlMatch[1];
  }
  
  const supabaseAnonKeyMatch = zshrcContent.match(/export\s+SUPABASE_ANON_KEY=["']?([^"'\n]+)["']?/);
  if (supabaseAnonKeyMatch) {
    credentials.supabaseAnonKey = supabaseAnonKeyMatch[1];
  }
  
  return credentials;
}

function analyzeDockerConfigs() {
  const rootDir = process.cwd();
  const dockerConfigs = {
    mcp: null,
    dashboard: null,
    n8n: null
  };
  
  // MCP Server
  const mcpDockerfile = path.join(rootDir, 'mcp-server/Dockerfile');
  const mcpCompose = path.join(rootDir, 'mcp-server/docker-compose.yml');
  
  if (fs.existsSync(mcpDockerfile)) {
    dockerConfigs.mcp = {
      dockerfile: fs.readFileSync(mcpDockerfile, 'utf-8'),
      compose: fs.existsSync(mcpCompose) ? fs.readFileSync(mcpCompose, 'utf-8') : null
    };
  }
  
  // Dashboard
  const dashboardDockerfile = path.join(rootDir, 'dashboard/Dockerfile');
  if (fs.existsSync(dashboardDockerfile)) {
    dockerConfigs.dashboard = {
      dockerfile: fs.readFileSync(dashboardDockerfile, 'utf-8')
    };
  }
  
  // n8n (from Terraform)
  const n8nCompose = path.join(rootDir, 'terraform/n8n-infrastructure/docker-compose-with-mcp.yml');
  if (fs.existsSync(n8nCompose)) {
    dockerConfigs.n8n = {
      compose: fs.readFileSync(n8nCompose, 'utf-8')
    };
  }
  
  return dockerConfigs;
}

function analyzeTerraformConfigs() {
  const rootDir = process.cwd();
  const terraformDir = path.join(rootDir, 'terraform/n8n-infrastructure');
  
  const configs = {
    main: null,
    variables: null,
    outputs: null,
    mcpDns: null
  };
  
  if (fs.existsSync(terraformDir)) {
    const mainTf = path.join(terraformDir, 'main.tf');
    const variablesTf = path.join(terraformDir, 'variables.tf');
    const outputsTf = path.join(terraformDir, 'outputs.tf');
    const mcpDnsTf = path.join(terraformDir, 'mcp-dns.tf');
    
    if (fs.existsSync(mainTf)) {
      configs.main = fs.readFileSync(mainTf, 'utf-8');
    }
    if (fs.existsSync(variablesTf)) {
      configs.variables = fs.readFileSync(variablesTf, 'utf-8');
    }
    if (fs.existsSync(outputsTf)) {
      configs.outputs = fs.readFileSync(outputsTf, 'utf-8');
    }
    if (fs.existsSync(mcpDnsTf)) {
      configs.mcpDns = fs.readFileSync(mcpDnsTf, 'utf-8');
    }
  }
  
  return configs;
}

function generateDeploymentStructure(dockerConfigs, terraformConfigs, credentials) {
  const structure = {
    domains: {
      mcp: 'mcp.pbradygeorgen.com',
      n8n: 'n8n.pbradygeorgen.com',
      projects: 'projects.pbradygeorgen.com'
    },
    services: {
      mcp: {
        type: 'docker',
        dockerfile: 'mcp-server/Dockerfile',
        compose: 'mcp-server/docker-compose.yml',
        port: 5679,
        healthcheck: '/healthz'
      },
      n8n: {
        type: 'docker',
        compose: 'terraform/n8n-infrastructure/docker-compose-with-mcp.yml',
        port: 5678,
        healthcheck: '/healthz'
      },
      dashboard: {
        type: 'nextjs',
        dockerfile: 'dashboard/Dockerfile',
        port: 3000,
        buildCommand: 'npm run build',
        outputDir: 'out'
      }
    },
    infrastructure: {
      provider: 'aws',
      terraform: 'terraform/n8n-infrastructure/',
      region: credentials?.awsRegion || 'us-east-2',
      profile: credentials?.awsProfile || 'AmplifyUser'
    },
    deployment: {
      strategy: 'unified',
      approach: 'single-ec2-with-docker-compose',
      projectsDomain: 'projects.pbradygeorgen.com'
    }
  };
  
  return structure;
}

async function coordinateUnifiedDeployment() {
  console.log('🖖 Unified AWS Deployment Coordination\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Team organization
  console.log('👥 Crew Team Organization:\n');
  CREW_TEAMS.forEach(team => {
    console.log(`   ${team.team}:`);
    console.log(`     Members: ${team.members.map(m => m.replace('_', ' ')).join(', ')}`);
    console.log(`     Task: ${team.task}\n`);
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Step 1: Load credentials
  console.log('🔐 Loading credentials from ~/.zshrc...\n');
  const credentials = loadZshrcCredentials();
  if (credentials) {
    console.log('✅ Credentials loaded:');
    console.log(`   AWS Profile: ${credentials.awsProfile || 'Not found'}`);
    console.log(`   AWS Region: ${credentials.awsRegion || 'Not found'}`);
    console.log(`   N8N API Key: ${credentials.n8nApiKey ? 'Found' : 'Not found'}`);
    console.log(`   MCP API Key: ${credentials.mcpApiKey ? 'Found' : 'Not found'}`);
    console.log(`   Supabase URL: ${credentials.supabaseUrl ? 'Found' : 'Not found'}\n`);
  } else {
    console.warn('⚠️  Could not load credentials from ~/.zshrc\n');
  }
  
  // Step 2: Analyze Docker configs
  console.log('🐳 Lt. Cmdr. La Forge - Analyzing Docker configurations...\n');
  const dockerConfigs = analyzeDockerConfigs();
  console.log(`✅ Found Docker configurations:`);
  console.log(`   MCP Server: ${dockerConfigs.mcp ? 'Yes' : 'No'}`);
  console.log(`   Dashboard: ${dockerConfigs.dashboard ? 'Yes' : 'No'}`);
  console.log(`   n8n: ${dockerConfigs.n8n ? 'Yes' : 'No'}\n`);
  
  // Step 3: Analyze Terraform configs
  console.log('🏗️  Analyzing Terraform configurations...\n');
  const terraformConfigs = analyzeTerraformConfigs();
  console.log(`✅ Found Terraform configurations:`);
  console.log(`   Main: ${terraformConfigs.main ? 'Yes' : 'No'}`);
  console.log(`   Variables: ${terraformConfigs.variables ? 'Yes' : 'No'}`);
  console.log(`   Outputs: ${terraformConfigs.outputs ? 'Yes' : 'No'}`);
  console.log(`   MCP DNS: ${terraformConfigs.mcpDns ? 'Yes' : 'No'}\n`);
  
  // Step 4: Generate deployment structure
  console.log('📋 Captain Picard - Generating unified deployment structure...\n');
  const deploymentStructure = generateDeploymentStructure(dockerConfigs, terraformConfigs, credentials);
  
  console.log('✅ Deployment Structure:\n');
  console.log(`   Domains:`);
  console.log(`     MCP: ${deploymentStructure.domains.mcp}`);
  console.log(`     n8n: ${deploymentStructure.domains.n8n}`);
  console.log(`     Projects: ${deploymentStructure.domains.projects}\n`);
  
  console.log(`   Services:`);
  Object.entries(deploymentStructure.services).forEach(([name, service]) => {
    console.log(`     ${name}: ${service.type} (port ${service.port})`);
  });
  console.log('');
  
  console.log(`   Infrastructure:`);
  console.log(`     Provider: ${deploymentStructure.infrastructure.provider}`);
  console.log(`     Region: ${deploymentStructure.infrastructure.region}`);
  console.log(`     Profile: ${deploymentStructure.infrastructure.profile}\n`);
  
  // Save structure
  const rootDir = process.cwd();
  const reportsDir = path.join(rootDir, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportPath = path.join(reportsDir, 'unified-deployment-structure.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    credentials: {
      awsProfile: credentials?.awsProfile,
      awsRegion: credentials?.awsRegion,
      hasN8nKey: !!credentials?.n8nApiKey,
      hasMcpKey: !!credentials?.mcpApiKey,
      hasSupabase: !!credentials?.supabaseUrl
    },
    deploymentStructure,
    dockerConfigs: {
      mcp: !!dockerConfigs.mcp,
      dashboard: !!dockerConfigs.dashboard,
      n8n: !!dockerConfigs.n8n
    },
    terraformConfigs: {
      main: !!terraformConfigs.main,
      variables: !!terraformConfigs.variables,
      outputs: !!terraformConfigs.outputs,
      mcpDns: !!terraformConfigs.mcpDns
    }
  }, null, 2));
  
  console.log(`📄 Deployment structure saved to: ${reportPath}\n`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎯 Next Steps:');
  console.log('   1. Create unified docker-compose.yml for all services');
  console.log('   2. Update Terraform to include projects.pbradygeorgen.com');
  console.log('   3. Create AWS CLI deployment scripts');
  console.log('   4. Align local file structure with deployment structure\n');
  
  return { deploymentStructure, credentials, dockerConfigs, terraformConfigs };
}

if (require.main === module) {
  coordinateUnifiedDeployment().catch(console.error);
}

module.exports = { coordinateUnifiedDeployment, loadZshrcCredentials };

