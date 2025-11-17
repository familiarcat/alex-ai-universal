export interface EC2CostResult {
  instanceType: string;
  baseCompute: number;
  detailedMonitoring: number;
  total: number;
  hourly: number;
}

export interface EBSCostResult {
  volumeSizeGB: number;
  volumeType: string;
  storageCost: number;
  monthly: number;
}

export interface CloudWatchCostResult {
  logRetentionDays: number;
  estimatedLogGB: number;
  ingestionCost: number;
  storageCost: number;
  total: number;
}

export function calculateEC2Costs(instanceType: string, detailedMonitoring?: boolean): EC2CostResult;
export function calculateEBSCosts(volumeSizeGB: number, volumeType?: string): EBSCostResult;
export function calculateCloudWatchCosts(logRetentionDays: number, estimatedLogGB?: number): CloudWatchCostResult;
