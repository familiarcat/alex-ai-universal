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
    gp3: { perGB: 0.08, perIOPS: 0.005 },
    gp2: { perGB: 0.10, perIOPS: 0.10 }
  },
  cloudwatch: {
    logsIngestion: 0.50,
    logsStorage: 0.03,
    detailedMonitoring: 7.00
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

function calculateCloudWatchCosts(logRetentionDays = 30, estimatedLogGB = 1) {
  // Estimate: 1GB logs per month, 30-day retention
  const ingestionCost = estimatedLogGB * AWS_PRICING.cloudwatch.logsIngestion;
  const storageCost = estimatedLogGB * AWS_PRICING.cloudwatch.logsStorage * (logRetentionDays / 30);
  
  return {
    logRetentionDays,
    estimatedLogGB,
    ingestionCost,
    storageCost,
    total: ingestionCost + storageCost
  };
}

module.exports = {
  calculateEC2Costs,
  calculateEBSCosts,
  calculateCloudWatchCosts,
  AWS_PRICING
};
