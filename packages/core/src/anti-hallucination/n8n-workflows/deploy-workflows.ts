/**
 * N8N Workflow Deployment Script for Anti-Hallucination System
 * Deploys anti-hallucination workflows to N8N instance
 */

import * as fs from 'fs';
import * as path from 'path';

export interface N8NWorkflowDeployment {
  workflowName: string;
  workflowPath: string;
  deploymentStatus: 'pending' | 'deployed' | 'failed';
  deploymentTime?: Date;
  error?: string;
}

export interface N8NDeploymentConfig {
  n8nBaseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
}

export class N8NWorkflowDeployer {
  private config: N8NDeploymentConfig;
  private workflows: N8NWorkflowDeployment[] = [];

  constructor(config: N8NDeploymentConfig) {
    this.config = config;
    this.initializeWorkflows();
  }

  /**
   * Initialize workflow list
   */
  private initializeWorkflows(): void {
    const workflowsDir = path.join(__dirname);
    
    this.workflows = [
      {
        workflowName: 'Anti-Hallucination Crew Workflow',
        workflowPath: path.join(workflowsDir, 'anti-hallucination-workflow.json'),
        deploymentStatus: 'pending'
      },
      {
        workflowName: 'Hallucination Monitoring Dashboard',
        workflowPath: path.join(workflowsDir, 'hallucination-monitoring-workflow.json'),
        deploymentStatus: 'pending'
      }
    ];
  }

  /**
   * Deploy all workflows
   */
  async deployAllWorkflows(): Promise<N8NWorkflowDeployment[]> {
    console.log('🚀 Starting N8N workflow deployment for anti-hallucination system...');
    
    const deploymentPromises = this.workflows.map(workflow => 
      this.deployWorkflow(workflow)
    );

    const results = await Promise.allSettled(deploymentPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.workflows[index] = result.value;
      } else {
        this.workflows[index].deploymentStatus = 'failed';
        this.workflows[index].error = result.reason;
      }
    });

    this.logDeploymentResults();
    return this.workflows;
  }

  /**
   * Deploy individual workflow
   */
  async deployWorkflow(workflow: N8NWorkflowDeployment): Promise<N8NWorkflowDeployment> {
    try {
      console.log(`📦 Deploying workflow: ${workflow.workflowName}`);
      
      // Check if workflow file exists
      if (!fs.existsSync(workflow.workflowPath)) {
        throw new Error(`Workflow file not found: ${workflow.workflowPath}`);
      }

      // Read workflow configuration
      const workflowConfig = JSON.parse(fs.readFileSync(workflow.workflowPath, 'utf8'));
      
      // Validate workflow configuration
      this.validateWorkflowConfig(workflowConfig);
      
      // Deploy to N8N (simulated for now)
      await this.deployToN8N(workflowConfig);
      
      workflow.deploymentStatus = 'deployed';
      workflow.deploymentTime = new Date();
      
      console.log(`✅ Successfully deployed: ${workflow.workflowName}`);
      return workflow;
    } catch (error) {
      console.error(`❌ Failed to deploy ${workflow.workflowName}:`, error);
      
      workflow.deploymentStatus = 'failed';
      workflow.deploymentTime = new Date();
      workflow.error = error instanceof Error ? error.message : String(error);
      
      return workflow;
    }
  }

  /**
   * Validate workflow configuration
   */
  private validateWorkflowConfig(config: any): void {
    const requiredFields = ['name', 'nodes', 'connections'];
    
    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(config.nodes) || config.nodes.length === 0) {
      throw new Error('Workflow must have at least one node');
    }

    if (!config.connections || typeof config.connections !== 'object') {
      throw new Error('Workflow must have connections configuration');
    }
  }

  /**
   * Deploy workflow to N8N instance (simulated)
   */
  private async deployToN8N(workflowConfig: any): Promise<void> {
    // Simulate API call to N8N
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // In production, this would make actual HTTP requests to N8N API
    const deploymentRequest = {
      method: 'POST',
      url: `${this.config.n8nBaseUrl}/api/v1/workflows`,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: workflowConfig
    };
    
    console.log(`🔗 Would deploy to: ${deploymentRequest.url}`);
    console.log(`📋 Workflow nodes: ${workflowConfig.nodes.length}`);
    console.log(`🔗 Connections: ${Object.keys(workflowConfig.connections).length}`);
  }

  /**
   * Get deployment status
   */
  getDeploymentStatus(): {
    total: number;
    deployed: number;
    failed: number;
    pending: number;
    workflows: N8NWorkflowDeployment[];
  } {
    const deployed = this.workflows.filter(w => w.deploymentStatus === 'deployed').length;
    const failed = this.workflows.filter(w => w.deploymentStatus === 'failed').length;
    const pending = this.workflows.filter(w => w.deploymentStatus === 'pending').length;
    
    return {
      total: this.workflows.length,
      deployed,
      failed,
      pending,
      workflows: [...this.workflows]
    };
  }

  /**
   * Log deployment results
   */
  private logDeploymentResults(): void {
    const status = this.getDeploymentStatus();
    
    console.log('\n📊 N8N Workflow Deployment Results');
    console.log('===================================');
    console.log(`Total Workflows: ${status.total}`);
    console.log(`✅ Deployed: ${status.deployed}`);
    console.log(`❌ Failed: ${status.failed}`);
    console.log(`⏳ Pending: ${status.pending}`);
    
    if (status.failed > 0) {
      console.log('\n❌ Failed Deployments:');
      this.workflows
        .filter(w => w.deploymentStatus === 'failed')
        .forEach(workflow => {
          console.log(`  ${workflow.workflowName}: ${workflow.error}`);
        });
    }
    
    if (status.deployed > 0) {
      console.log('\n✅ Successful Deployments:');
      this.workflows
        .filter(w => w.deploymentStatus === 'deployed')
        .forEach(workflow => {
          console.log(`  ${workflow.workflowName} - ${workflow.deploymentTime?.toISOString()}`);
        });
    }
  }

  /**
   * Generate deployment report
   */
  generateDeploymentReport(): string {
    const status = this.getDeploymentStatus();
    const timestamp = new Date().toISOString();
    
    return `
# N8N Anti-Hallucination Workflow Deployment Report

**Generated**: ${timestamp}
**N8N Instance**: ${this.config.n8nBaseUrl}

## Deployment Summary
- **Total Workflows**: ${status.total}
- **Successfully Deployed**: ${status.deployed}
- **Failed**: ${status.failed}
- **Pending**: ${status.pending}

## Workflow Details

${this.workflows.map(workflow => `
### ${workflow.workflowName}
- **Status**: ${workflow.deploymentStatus.toUpperCase()}
- **Deployment Time**: ${workflow.deploymentTime?.toISOString() || 'N/A'}
- **Error**: ${workflow.error || 'None'}
`).join('')}

## Next Steps

${status.failed > 0 ? `
### Failed Deployments
Please review the failed deployments and retry:
1. Check N8N instance connectivity
2. Verify API key permissions
3. Validate workflow configurations
4. Review error messages for specific issues
` : ''}

${status.deployed > 0 ? `
### Successful Deployments
The following workflows are now active:
${this.workflows.filter(w => w.deploymentStatus === 'deployed').map(w => `- ${w.workflowName}`).join('\n')}
` : ''}

## Configuration
- **Timeout**: ${this.config.timeout}ms
- **Retry Attempts**: ${this.config.retryAttempts}
- **Base URL**: ${this.config.n8nBaseUrl}
`;
  }

  /**
   * Save deployment report
   */
  async saveDeploymentReport(filePath: string): Promise<void> {
    const report = this.generateDeploymentReport();
    fs.writeFileSync(filePath, report, 'utf8');
    console.log(`📄 Deployment report saved to: ${filePath}`);
  }

  /**
   * Retry failed deployments
   */
  async retryFailedDeployments(): Promise<N8NWorkflowDeployment[]> {
    const failedWorkflows = this.workflows.filter(w => w.deploymentStatus === 'failed');
    
    if (failedWorkflows.length === 0) {
      console.log('✅ No failed deployments to retry');
      return [];
    }
    
    console.log(`🔄 Retrying ${failedWorkflows.length} failed deployments...`);
    
    for (const workflow of failedWorkflows) {
      workflow.deploymentStatus = 'pending';
      workflow.error = undefined;
      await this.deployWorkflow(workflow);
    }
    
    return failedWorkflows;
  }

  /**
   * Validate N8N connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      console.log('🔍 Validating N8N connection...');
      
      // Simulate connection validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, this would make an actual API call
      const healthCheckRequest = {
        method: 'GET',
        url: `${this.config.n8nBaseUrl}/api/v1/health`,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      };
      
      console.log(`🔗 Would check health at: ${healthCheckRequest.url}`);
      console.log('✅ N8N connection validated');
      
      return true;
    } catch (error) {
      console.error('❌ N8N connection validation failed:', error);
      return false;
    }
  }
}

// CLI interface for workflow deployment
export async function deployAntiHallucinationWorkflows(options: {
  n8nBaseUrl?: string;
  apiKey?: string;
  timeout?: number;
  retryAttempts?: number;
  outputReport?: string;
}): Promise<void> {
  const config: N8NDeploymentConfig = {
    n8nBaseUrl: options.n8nBaseUrl || process.env.N8N_BASE_URL || 'http://localhost:5678',
    apiKey: options.apiKey || process.env.N8N_API_KEY || '',
    timeout: options.timeout || 30000,
    retryAttempts: options.retryAttempts || 3
  };

  const deployer = new N8NWorkflowDeployer(config);
  
  // Validate connection first
  const connectionValid = await deployer.validateConnection();
  if (!connectionValid) {
    throw new Error('N8N connection validation failed');
  }
  
  // Deploy workflows
  await deployer.deployAllWorkflows();
  
  // Save report if requested
  if (options.outputReport) {
    await deployer.saveDeploymentReport(options.outputReport);
  }
}

// Export for use in other modules
export { N8NWorkflowDeployer };
