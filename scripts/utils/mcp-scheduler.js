/**
 * 🖖 MCP Scheduler
 * 
 * Cron-based and event-driven scheduling system for MCP workflows.
 */

const { getMCPWorkflowService } = require('./mcp-workflow-service');
const { getMCPWorkflowOrchestrator } = require('./mcp-workflow-orchestrator');

class MCPScheduler {
  constructor() {
    this.scheduledJobs = new Map();
    this.eventListeners = new Map();
    this.workflowService = null;
    this.orchestrator = null;
    this.running = false;
  }

  /**
   * Initialize scheduler
   */
  initialize() {
    this.workflowService = getMCPWorkflowService();
    this.workflowService.initialize();
    this.orchestrator = getMCPWorkflowOrchestrator();
    this.orchestrator.initialize();
    return true;
  }

  /**
   * Schedule workflow with cron expression
   */
  scheduleCron(jobName, cronExpression, workflowName, workflowData, options = {}) {
    const job = {
      name: jobName,
      type: 'cron',
      cron: cronExpression,
      workflow: workflowName,
      data: workflowData,
      options: options,
      nextRun: this.calculateNextRun(cronExpression),
      enabled: true
    };

    this.scheduledJobs.set(jobName, job);
    console.log(`📅 Scheduled: ${jobName} (${cronExpression})`);
    console.log(`   Next run: ${job.nextRun.toISOString()}\n`);

    return job;
  }

  /**
   * Schedule workflow at specific time
   */
  scheduleAt(jobName, dateTime, workflowName, workflowData, options = {}) {
    const job = {
      name: jobName,
      type: 'once',
      scheduledTime: new Date(dateTime),
      workflow: workflowName,
      data: workflowData,
      options: options,
      enabled: true
    };

    this.scheduledJobs.set(jobName, job);
    console.log(`📅 Scheduled: ${jobName} at ${job.scheduledTime.toISOString()}\n`);

    return job;
  }

  /**
   * Register event listener
   */
  onEvent(eventName, workflowName, workflowData, options = {}) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }

    const listener = {
      workflow: workflowName,
      data: workflowData,
      options: options
    };

    this.eventListeners.get(eventName).push(listener);
    console.log(`👂 Registered event listener: ${eventName} → ${workflowName}\n`);

    return listener;
  }

  /**
   * Trigger event
   */
  async triggerEvent(eventName, eventData = {}) {
    const listeners = this.eventListeners.get(eventName) || [];

    if (listeners.length === 0) {
      console.log(`⚠️  No listeners for event: ${eventName}\n`);
      return { triggered: 0 };
    }

    console.log(`🔔 Triggering event: ${eventName} (${listeners.length} listeners)\n`);

    const results = await Promise.all(
      listeners.map(async (listener, index) => {
        try {
          console.log(`[${index + 1}/${listeners.length}] Executing: ${listener.workflow}\n`);
          const result = await this.workflowService.executeWorkflow(
            listener.workflow,
            { ...listener.data, eventData },
            listener.options
          );
          console.log(`✅ [${index + 1}/${listeners.length}] Completed: ${listener.workflow}\n`);
          return { success: true, result };
        } catch (error) {
          console.error(`❌ [${index + 1}/${listeners.length}] Failed: ${listener.workflow}`);
          console.error(`   Error: ${error.message}\n`);
          return { success: false, error: error.message };
        }
      })
    );

    return {
      triggered: listeners.length,
      results
    };
  }

  /**
   * Start scheduler
   */
  start() {
    if (this.running) {
      console.log('⚠️  Scheduler already running\n');
      return;
    }

    this.running = true;
    console.log('🚀 MCP Scheduler started\n');

    // Start cron job checker
    this.cronInterval = setInterval(() => {
      this.checkCronJobs();
    }, 60000); // Check every minute

    // Start one-time job checker
    this.onceInterval = setInterval(() => {
      this.checkOnceJobs();
    }, 10000); // Check every 10 seconds
  }

  /**
   * Stop scheduler
   */
  stop() {
    if (!this.running) {
      return;
    }

    this.running = false;
    if (this.cronInterval) {
      clearInterval(this.cronInterval);
    }
    if (this.onceInterval) {
      clearInterval(this.onceInterval);
    }

    console.log('🛑 MCP Scheduler stopped\n');
  }

  /**
   * Check and execute cron jobs
   */
  async checkCronJobs() {
    const now = new Date();

    for (const [jobName, job] of this.scheduledJobs.entries()) {
      if (job.type === 'cron' && job.enabled && job.nextRun <= now) {
        console.log(`⏰ Executing scheduled job: ${jobName}\n`);

        try {
          await this.workflowService.executeWorkflow(
            job.workflow,
            job.data,
            job.options
          );
          console.log(`✅ Scheduled job completed: ${jobName}\n`);

          // Calculate next run
          job.nextRun = this.calculateNextRun(job.cron);
          console.log(`   Next run: ${job.nextRun.toISOString()}\n`);
        } catch (error) {
          console.error(`❌ Scheduled job failed: ${jobName}`);
          console.error(`   Error: ${error.message}\n`);

          // Retry logic
          if (job.options.retries && job.options.retryCount < job.options.retries) {
            job.options.retryCount = (job.options.retryCount || 0) + 1;
            console.log(`   Retrying (${job.options.retryCount}/${job.options.retries})...\n`);
          }
        }
      }
    }
  }

  /**
   * Check and execute one-time jobs
   */
  async checkOnceJobs() {
    const now = new Date();

    for (const [jobName, job] of this.scheduledJobs.entries()) {
      if (job.type === 'once' && job.enabled && job.scheduledTime <= now) {
        console.log(`⏰ Executing one-time job: ${jobName}\n`);

        try {
          await this.workflowService.executeWorkflow(
            job.workflow,
            job.data,
            job.options
          );
          console.log(`✅ One-time job completed: ${jobName}\n`);

          // Remove one-time job after execution
          this.scheduledJobs.delete(jobName);
        } catch (error) {
          console.error(`❌ One-time job failed: ${jobName}`);
          console.error(`   Error: ${error.message}\n`);
        }
      }
    }
  }

  /**
   * Calculate next run time from cron expression
   * Simple implementation - supports: minute hour day month dayOfWeek
   */
  calculateNextRun(cronExpression) {
    // Simple cron parser (supports: "0 9 * * *" = daily at 9 AM)
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) {
      throw new Error(`Invalid cron expression: ${cronExpression}`);
    }

    const [minute, hour, day, month, dayOfWeek] = parts;
    const now = new Date();
    const next = new Date(now);

    // Simple calculation - next occurrence
    if (minute !== '*') {
      next.setMinutes(parseInt(minute));
      if (next <= now) {
        next.setHours(next.getHours() + 1);
      }
    }

    if (hour !== '*') {
      next.setHours(parseInt(hour));
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
    }

    return next;
  }

  /**
   * Get scheduled jobs
   */
  getScheduledJobs() {
    return Array.from(this.scheduledJobs.values());
  }

  /**
   * Get event listeners
   */
  getEventListeners() {
    const listeners = {};
    for (const [eventName, eventListeners] of this.eventListeners.entries()) {
      listeners[eventName] = eventListeners.map(l => l.workflow);
    }
    return listeners;
  }
}

// Singleton instance
let mcpSchedulerInstance = null;

function getMCPScheduler() {
  if (!mcpSchedulerInstance) {
    mcpSchedulerInstance = new MCPScheduler();
  }
  return mcpSchedulerInstance;
}

module.exports = { getMCPScheduler, MCPScheduler };

