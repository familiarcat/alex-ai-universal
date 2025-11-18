#!/usr/bin/env node
/**
 * AWS Real-Time Cost Analysis
 * 
 * Queries AWS directly for actual resource usage and costs
 * Compares Terraform configurations with actual deployments
 * Validates cost estimates and recommends optimal configurations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load AWS credentials from ~/.zshrc
function loadAWSCredentials() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  if (!fs.existsSync(zshrcPath)) {
    throw new Error('~/.zshrc not found');
  }

  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  const credentials = {};

  // Extract AWS credentials
  const awsAccessKeyMatch = zshrcContent.match(/export AWS_ACCESS_KEY_ID=['"]?([^'"\n]+)['"]?/);
  const awsSecretKeyMatch = zshrcContent.match(/export AWS_SECRET_ACCESS_KEY=['"]?([^'"\n]+)['"]?/);
  const awsRegionMatch = zshrcContent.match(/export AWS_REGION=['"]?([^'"\n]+)['"]?/);

  if (awsAccessKeyMatch) credentials.AWS_ACCESS_KEY_ID = awsAccessKeyMatch[1];
  if (awsSecretKeyMatch) credentials.AWS_SECRET_ACCESS_KEY = awsSecretKeyMatch[1];
  if (awsRegionMatch) credentials.AWS_REGION = awsRegionMatch[1];

  // Set environment variables
  if (credentials.AWS_ACCESS_KEY_ID) process.env.AWS_ACCESS_KEY_ID = credentials.AWS_ACCESS_KEY_ID;
  if (credentials.AWS_SECRET_ACCESS_KEY) process.env.AWS_SECRET_ACCESS_KEY = credentials.AWS_SECRET_ACCESS_KEY;
  if (credentials.AWS_REGION) process.env.AWS_REGION = credentials.AWS_REGION;

  return credentials;
}

// AWS Pricing (us-east-2 region, as of 2025)
const AWS_PRICING = {
  ec2: {
    't2.micro': { hourly: 0.0116, monthly: 8.35 },
    't2.small': { hourly: 0.023, monthly: 16.56 },
    't3.micro': { hourly: 0.0104, monthly: 7.49 },
    't3.small': { hourly: 0.0208, monthly: 14.98 },
    't3.medium': { hourly: 0.0416, monthly: 29.95 },
    't3.large': { hourly: 0.0832, monthly: 59.90 },
    't3.xlarge': { hourly: 0.1664, monthly: 119.81 }
  },
  ebs: {
    gp3: { perGB: 0.08 },
    gp2: { perGB: 0.10 }
  },
  cloudwatch: {
    logsIngestion: 0.50, // per GB
    logsStorage: 0.03, // per GB per month
    detailedMonitoring: 7.00 // per instance per month
  }
};

function calculateEC2Costs(instanceType, monitoring = false) {
  const pricing = AWS_PRICING.ec2[instanceType];
  if (!pricing) {
    return { error: `Unknown instance type: ${instanceType}` };
  }
  
  const baseCost = pricing.monthly;
  const detailedMonitoringCost = monitoring ? AWS_PRICING.cloudwatch.detailedMonitoring : 0;
  
  return {
    instanceType,
    baseCompute: baseCost,
    detailedMonitoring: detailedMonitoringCost,
    total: baseCost + detailedMonitoringCost,
    hourly: pricing.hourly
  };
}

function calculateEBSCosts(volumeSizeGB, volumeType = 'gp3') {
  const pricing = AWS_PRICING.ebs[volumeType];
  if (!pricing) {
    return { error: `Unknown volume type: ${volumeType}` };
  }
  
  return {
    volumeSizeGB,
    volumeType,
    storageCost: volumeSizeGB * pricing.perGB,
    monthly: volumeSizeGB * pricing.perGB
  };
}

// Query AWS for actual EC2 instances
function queryEC2Instances(region = 'us-east-2') {
  try {
    const output = execSync(
      `aws ec2 describe-instances --region ${region} --query 'Reservations[*].Instances[*].[InstanceId,InstanceType,State.Name,Tags[?Key==\`Name\`].Value|[0],PublicIpAddress,PrivateIpAddress,BlockDeviceMappings[0].Ebs.VolumeId]' --output json`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    
    const instances = JSON.parse(output);
    return instances.flat().map(instance => ({
      instanceId: instance[0],
      instanceType: instance[1],
      state: instance[2],
      name: instance[3] || 'Unnamed',
      publicIp: instance[4] || 'N/A',
      privateIp: instance[5] || 'N/A',
      volumeId: instance[6] || null
    })).filter(inst => inst.state === 'running' || inst.state === 'stopped');
  } catch (error) {
    console.error(`❌ Failed to query EC2 instances: ${error.message}`);
    return [];
  }
}

// Query EBS volumes for an instance
function queryEBSVolumes(volumeIds, region = 'us-east-2') {
  if (!volumeIds || volumeIds.length === 0) return [];
  
  try {
    const volumeIdsStr = volumeIds.join(' ');
    const output = execSync(
      `aws ec2 describe-volumes --region ${region} --volume-ids ${volumeIdsStr} --query 'Volumes[*].[VolumeId,Size,VolumeType,Iops]' --output json`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    
    const volumes = JSON.parse(output);
    return volumes.map(vol => ({
      volumeId: vol[0],
      sizeGB: vol[1],
      volumeType: vol[2],
      iops: vol[3] || 3000
    }));
  } catch (error) {
    console.error(`❌ Failed to query EBS volumes: ${error.message}`);
    return [];
  }
}

// Query CloudWatch metrics for instance
function queryCloudWatchMetrics(instanceId, region = 'us-east-2') {
  try {
    // Get CPU utilization for last 24 hours
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
    
    const output = execSync(
      `aws cloudwatch get-metric-statistics --region ${region} --namespace AWS/EC2 --metric-name CPUUtilization --dimensions Name=InstanceId,Value=${instanceId} --start-time ${startTime.toISOString()} --end-time ${endTime.toISOString()} --period 3600 --statistics Average --output json`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    
    const data = JSON.parse(output);
    const datapoints = data.Datapoints || [];
    const avgCPU = datapoints.length > 0 
      ? datapoints.reduce((sum, dp) => sum + dp.Average, 0) / datapoints.length 
      : null;
    
    return {
      avgCPUUtilization: avgCPU ? avgCPU.toFixed(2) : 'N/A',
      datapointCount: datapoints.length
    };
  } catch (error) {
    // CloudWatch metrics might not be available immediately
    return {
      avgCPUUtilization: 'N/A',
      datapointCount: 0,
      error: error.message
    };
  }
}

// Parse Terraform configuration
function parseTerraformConfig() {
  const tfDir = path.join(__dirname, '..', 'terraform', 'n8n-infrastructure');
  const mainTf = path.join(tfDir, 'main.tf');
  const varsTf = path.join(tfDir, 'variables.tf');
  
  const config = {
    instanceType: 't3.medium', // default
    monitoring: true,
    region: 'us-east-2'
  };
  
  if (fs.existsSync(mainTf)) {
    const content = fs.readFileSync(mainTf, 'utf8');
    // Check for monitoring enabled
    config.monitoring = content.includes('monitoring = true');
  }
  
  if (fs.existsSync(varsTf)) {
    const content = fs.readFileSync(varsTf, 'utf8');
    const instanceTypeMatch = content.match(/default\s*=\s*["']([^"']+)["']/);
    if (instanceTypeMatch) {
      config.instanceType = instanceTypeMatch[1];
    }
  }
  
  // Check for terraform.tfvars
  const tfvarsPath = path.join(tfDir, 'terraform.tfvars');
  if (fs.existsSync(tfvarsPath)) {
    const content = fs.readFileSync(tfvarsPath, 'utf8');
    const instanceTypeMatch = content.match(/instance_type\s*=\s*["']([^"']+)["']/);
    if (instanceTypeMatch) {
      config.instanceType = instanceTypeMatch[1];
    }
  }
  
  return config;
}

// Main analysis function
async function analyzeCosts() {
  console.log('🔍 AWS Real-Time Cost Analysis');
  console.log('================================\n');
  
  // Load credentials
  try {
    loadAWSCredentials();
    const region = process.env.AWS_REGION || 'us-east-2';
    console.log(`🌍 Region: ${region}\n`);
  } catch (error) {
    console.error(`❌ Failed to load AWS credentials: ${error.message}`);
    process.exit(1);
  }
  
  const region = process.env.AWS_REGION || 'us-east-2';
  
  // Query actual EC2 instances
  console.log('📊 Querying AWS for actual EC2 instances...');
  const instances = queryEC2Instances(region);
  
  if (instances.length === 0) {
    console.log('⚠️  No EC2 instances found in AWS account\n');
  } else {
    console.log(`✅ Found ${instances.length} EC2 instance(s)\n`);
  }
  
  // Find n8n instance
  const n8nInstance = instances.find(inst => 
    inst.name.toLowerCase().includes('n8n') || 
    inst.instanceId === 'i-0afdf313f61f22df0'
  );
  
  // Parse Terraform configuration
  console.log('📋 Parsing Terraform configuration...');
  const terraformConfig = parseTerraformConfig();
  console.log(`   Instance Type: ${terraformConfig.instanceType}`);
  console.log(`   Monitoring: ${terraformConfig.monitoring ? 'Enabled' : 'Disabled'}\n`);
  
  // Generate report
  const report = [];
  report.push('='.repeat(80));
  report.push('AWS REAL-TIME COST ANALYSIS REPORT');
  report.push('='.repeat(80));
  report.push('');
  report.push(`Generated: ${new Date().toISOString()}`);
  report.push(`Region: ${region}`);
  report.push('');
  
  // Actual AWS Resources
  report.push('🌐 ACTUAL AWS RESOURCES');
  report.push('-'.repeat(80));
  
  if (instances.length === 0) {
    report.push('⚠️  No EC2 instances found in AWS account');
  } else {
    for (const instance of instances) {
      report.push(`\n📦 Instance: ${instance.name || 'Unnamed'}`);
      report.push(`   ID: ${instance.instanceId}`);
      report.push(`   Type: ${instance.instanceType}`);
      report.push(`   State: ${instance.state}`);
      report.push(`   Public IP: ${instance.publicIp}`);
      
      // Get EBS volumes
      if (instance.volumeId) {
        const volumes = queryEBSVolumes([instance.volumeId], region);
        if (volumes.length > 0) {
          const vol = volumes[0];
          report.push(`   EBS Volume: ${vol.sizeGB}GB ${vol.volumeType}`);
        }
      }
      
      // Get CloudWatch metrics
      if (instance.state === 'running') {
        const metrics = queryCloudWatchMetrics(instance.instanceId, region);
        report.push(`   CPU Utilization (24h avg): ${metrics.avgCPUUtilization}%`);
      }
      
      // Calculate costs
      const costs = calculateEC2Costs(instance.instanceType, true);
      if (!costs.error) {
        report.push(`   💰 Estimated Monthly Cost: $${costs.total.toFixed(2)}`);
        report.push(`      - Compute: $${costs.baseCompute.toFixed(2)}`);
        report.push(`      - Monitoring: $${costs.detailedMonitoring.toFixed(2)}`);
      }
      
      if (instance.volumeId) {
        const volumes = queryEBSVolumes([instance.volumeId], region);
        if (volumes.length > 0) {
          const vol = volumes[0];
          const ebsCosts = calculateEBSCosts(vol.sizeGB, vol.volumeType);
          if (!ebsCosts.error) {
            report.push(`   💰 EBS Storage: $${ebsCosts.monthly.toFixed(2)}/month`);
          }
        }
      }
    }
  }
  
  report.push('');
  
  // Terraform Configuration Analysis
  report.push('📋 TERRAFORM CONFIGURATION');
  report.push('-'.repeat(80));
  report.push(`Instance Type: ${terraformConfig.instanceType}`);
  report.push(`Monitoring: ${terraformConfig.monitoring ? 'Enabled' : 'Disabled'}`);
  
  const tfCosts = calculateEC2Costs(terraformConfig.instanceType, terraformConfig.monitoring);
  if (!tfCosts.error) {
    report.push(`💰 Estimated Monthly Cost: $${tfCosts.total.toFixed(2)}`);
    report.push(`   - Compute: $${tfCosts.baseCompute.toFixed(2)}`);
    report.push(`   - Monitoring: $${tfCosts.detailedMonitoring.toFixed(2)}`);
  }
  
  // Default EBS (30GB gp3)
  const defaultEBSCosts = calculateEBSCosts(30, 'gp3');
  report.push(`💰 EBS Storage (30GB gp3): $${defaultEBSCosts.monthly.toFixed(2)}/month`);
  
  const tfTotal = (tfCosts.total || 0) + defaultEBSCosts.monthly;
  report.push(`📊 TERRAFORM CONFIG TOTAL: $${tfTotal.toFixed(2)}/month`);
  report.push('');
  
  // Comparison and Recommendations
  report.push('💡 COST OPTIMIZATION ANALYSIS');
  report.push('-'.repeat(80));
  
  if (n8nInstance) {
    const actualCosts = calculateEC2Costs(n8nInstance.instanceType, true);
    const tfCosts = calculateEC2Costs(terraformConfig.instanceType, true);
    
    if (!actualCosts.error && !tfCosts.error) {
      const costDiff = actualCosts.total - tfCosts.total;
      report.push(`\n📊 Actual vs Terraform Configuration:`);
      report.push(`   Actual Instance: ${n8nInstance.instanceType} - $${actualCosts.total.toFixed(2)}/month`);
      report.push(`   Terraform Config: ${terraformConfig.instanceType} - $${tfCosts.total.toFixed(2)}/month`);
      report.push(`   Difference: $${costDiff > 0 ? '+' : ''}${costDiff.toFixed(2)}/month`);
      
      if (n8nInstance.instanceType !== terraformConfig.instanceType) {
        report.push(`\n⚠️  MISMATCH: Actual instance type (${n8nInstance.instanceType}) differs from Terraform config (${terraformConfig.instanceType})`);
        report.push(`   Recommendation: Update Terraform to match actual deployment or vice versa`);
      }
    }
  }
  
  // Optimal configuration recommendation
  report.push(`\n🎯 OPTIMAL CONFIGURATION RECOMMENDATION:`);
  const microCosts = calculateEC2Costs('t3.micro', true);
  const smallCosts = calculateEC2Costs('t3.small', true);
  const mediumCosts = calculateEC2Costs('t3.medium', true);
  
  report.push(`   t3.micro:  $${microCosts.total.toFixed(2)}/month (Recommended for n8n)`);
  report.push(`   t3.small:  $${smallCosts.total.toFixed(2)}/month`);
  report.push(`   t3.medium: $${mediumCosts.total.toFixed(2)}/month`);
  
  if (terraformConfig.instanceType !== 't3.micro') {
    const currentCosts = calculateEC2Costs(terraformConfig.instanceType, true);
    const savings = currentCosts.total - microCosts.total;
    report.push(`\n💰 Potential Savings: $${savings.toFixed(2)}/month by switching to t3.micro`);
  }
  
  report.push('');
  report.push('📝 RECOMMENDATIONS:');
  report.push('   1. Use t3.micro for n8n instance (sufficient for most workloads)');
  report.push('   2. Ensure Terraform config matches actual deployment');
  report.push('   3. Monitor CloudWatch metrics to validate instance sizing');
  report.push('   4. Review EBS volume sizes and types for cost optimization');
  report.push('   5. Set up AWS Budget alerts to track spending');
  report.push('');
  report.push('='.repeat(80));
  
  // Output report
  const reportText = report.join('\n');
  console.log(reportText);
  
  // Save report
  const reportPath = path.join(__dirname, '..', '.backup-ec2-emergency', 'AWS_REAL_TIME_COST_ANALYSIS.txt');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(reportPath, reportText);
  console.log(`\n✅ Report saved to: ${reportPath}`);
  
  // Save JSON data
  const jsonData = {
    timestamp: new Date().toISOString(),
    region,
    instances,
    terraformConfig,
    recommendations: {
      optimalInstanceType: 't3.micro',
      currentTerraformType: terraformConfig.instanceType,
      potentialSavings: terraformConfig.instanceType !== 't3.micro' 
        ? (calculateEC2Costs(terraformConfig.instanceType, true).total - microCosts.total).toFixed(2)
        : 0
    }
  };
  
  const jsonPath = path.join(__dirname, '..', '.backup-ec2-emergency', 'AWS_REAL_TIME_COST_ANALYSIS.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
  console.log(`✅ JSON data saved to: ${jsonPath}`);
}

// Run analysis
if (require.main === module) {
  analyzeCosts().catch(error => {
    console.error(`❌ Analysis failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { analyzeCosts, queryEC2Instances, queryEBSVolumes, queryCloudWatchMetrics };

