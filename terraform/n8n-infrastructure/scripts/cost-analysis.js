#!/usr/bin/env node
/**
 * Terraform Cost Analysis
 * Analyzes Terraform configurations for cost implications
 */

const { calculateEC2Costs, calculateEBSCosts } = require('../../../packages/shared-utilities/src/cost-analysis');
const fs = require('fs');
const path = require('path');

function analyzeTerraformCosts(tfDir) {
  const mainTf = path.join(tfDir, 'main.tf');
  const varsTf = path.join(tfDir, 'variables.tf');
  
  if (!fs.existsSync(mainTf)) {
    return { error: 'main.tf not found' };
  }
  
  const content = fs.readFileSync(mainTf, 'utf8');
  
  // Extract instance type
  const instanceMatch = content.match(/instance_type\s*=\s*["']([^"']+)["']/);
  const instanceType = instanceMatch ? instanceMatch[1] : 't3.medium';
  
  // Extract volume size
  const volumeMatch = content.match(/volume_size\s*=\s*(\d+)/);
  const volumeSize = volumeMatch ? parseInt(volumeMatch[1]) : 30;
  
  const costs = {
    ec2: calculateEC2Costs(instanceType),
    ebs: calculateEBSCosts(volumeSize, 'gp3'),
    total: 0
  };
  
  costs.total = (costs.ec2?.total || costs.ec2?.monthly || 0) + (costs.ebs?.monthly || 0);
  
  return {
    instanceType,
    volumeSize,
    costs,
    recommendations: costs.total > 50 ? ['Consider cost optimization'] : []
  };
}

if (require.main === module) {
  const tfDir = process.argv[2] || path.join(__dirname, '..');
  const analysis = analyzeTerraformCosts(tfDir);
  console.log(JSON.stringify(analysis, null, 2));
}

module.exports = { analyzeTerraformCosts };
