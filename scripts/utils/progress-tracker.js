#!/usr/bin/env node
/**
 * Progress Tracker System
 * 
 * Tracks progress of background processes and provides:
 * - Terminal progress bars
 * - Dashboard UI updates via Supabase
 * - Real-time progress visualization
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { loadSupabaseCredentials } = require('./secure-credential-loader');

// Try to use cli-progress if available, fallback to simple output
let ProgressBar = null;
try {
  ProgressBar = require('cli-progress').SingleBar;
} catch (e) {
  // Fallback: simple progress tracking
}

class ProgressTracker {
  constructor(taskId, options = {}) {
    this.taskId = taskId;
    this.options = {
      total: 100,
      updateInterval: 500, // ms
      persistToFile: true,
      persistToSupabase: true,
      ...options
    };
    
    this.current = 0;
    this.steps = [];
    this.currentStep = null;
    this.startTime = Date.now();
    this.bar = null;
    this.supabase = null;
    this.progressFile = path.join(__dirname, '../../reports/progress', `${taskId}.json`);
    
    this.initialize();
  }

  async initialize() {
    // Create progress directory
    if (this.options.persistToFile) {
      fs.mkdirSync(path.dirname(this.progressFile), { recursive: true });
    }

    // Initialize Supabase if needed
    if (this.options.persistToSupabase) {
      try {
        const creds = loadSupabaseCredentials();
        this.supabase = createClient(creds.url, creds.serviceKey);
      } catch (error) {
        console.warn('⚠️  Supabase not available for progress tracking');
        this.options.persistToSupabase = false;
      }
    }

    // Initialize progress bar
    if (ProgressBar) {
      this.bar = new ProgressBar({
        format: `{task} |{bar}| {percentage}% | {value}/{total} | ETA: {eta}s | {step}`,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
      });
      this.bar.start(this.options.total, 0, {
        task: this.taskId,
        step: 'Initializing...'
      });
    } else {
      // Simple fallback
      console.log(`\n📊 Progress: ${this.taskId}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  }

  /**
   * Add a step to track
   */
  addStep(name, weight = 1) {
    this.steps.push({
      name,
      weight,
      completed: false,
      startTime: null,
      endTime: null
    });
  }

  /**
   * Start a step
   */
  startStep(stepName) {
    const step = this.steps.find(s => s.name === stepName);
    if (step) {
      step.startTime = Date.now();
      this.currentStep = step;
      
      if (this.bar) {
        this.bar.update(this.current, {
          step: stepName
        });
      } else {
        console.log(`\n▶️  ${stepName}...`);
      }
    }
  }

  /**
   * Update progress
   */
  update(progress, stepName = null) {
    this.current = Math.min(progress, this.options.total);
    
    const step = stepName || this.currentStep?.name || 'Processing...';
    
    if (this.bar) {
      this.bar.update(this.current, {
        step: step
      });
    } else {
      const percentage = Math.round((this.current / this.options.total) * 100);
      const barLength = 50;
      const filled = Math.round((percentage / 100) * barLength);
      const empty = barLength - filled;
      const bar = '█'.repeat(filled) + '░'.repeat(empty);
      process.stdout.write(`\r${bar} ${percentage}% - ${step}`);
    }

    // Persist progress
    this.persistProgress();
  }

  /**
   * Complete a step
   */
  completeStep(stepName) {
    const step = this.steps.find(s => s.name === stepName);
    if (step) {
      step.completed = true;
      step.endTime = Date.now();
      const duration = ((step.endTime - step.startTime) / 1000).toFixed(1);
      
      if (!this.bar) {
        console.log(`\n✅ ${stepName} (${duration}s)`);
      }
    }
  }

  /**
   * Increment progress
   */
  increment(amount = 1, stepName = null) {
    this.update(this.current + amount, stepName);
  }

  /**
   * Set progress percentage
   */
  setPercentage(percentage, stepName = null) {
    this.update((percentage / 100) * this.options.total, stepName);
  }

  /**
   * Persist progress to file and Supabase
   */
  async persistProgress() {
    const progressData = {
      taskId: this.taskId,
      current: this.current,
      total: this.options.total,
      percentage: Math.round((this.current / this.options.total) * 100),
      currentStep: this.currentStep?.name || null,
      steps: this.steps.map(s => ({
        name: s.name,
        completed: s.completed,
        duration: s.endTime ? ((s.endTime - s.startTime) / 1000) : null
      })),
      elapsed: ((Date.now() - this.startTime) / 1000).toFixed(1),
      timestamp: new Date().toISOString()
    };

    // Persist to file
    if (this.options.persistToFile) {
      fs.writeFileSync(this.progressFile, JSON.stringify(progressData, null, 2));
    }

    // Persist to Supabase
    if (this.options.persistToSupabase && this.supabase) {
      try {
        await this.supabase
          .from('task_progress')
          .upsert({
            task_id: this.taskId,
            progress_data: progressData,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'task_id'
          });
      } catch (error) {
        // Silently fail - progress tracking is non-critical
      }
    }
  }

  /**
   * Complete the task
   */
  complete(message = 'Complete') {
    if (this.bar) {
      this.bar.update(this.options.total, {
        step: message
      });
      this.bar.stop();
    } else {
      const percentage = 100;
      const bar = '█'.repeat(50);
      console.log(`\r${bar} ${percentage}% - ${message}`);
      console.log('\n✅ Task complete!\n');
    }

    // Mark all steps as complete
    this.steps.forEach(step => {
      if (!step.completed) {
        step.completed = true;
        step.endTime = Date.now();
      }
    });

    this.persistProgress();
  }

  /**
   * Fail the task
   */
  fail(error) {
    if (this.bar) {
      this.bar.stop();
    }

    const progressData = {
      taskId: this.taskId,
      status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString()
    };

    if (this.options.persistToFile) {
      fs.writeFileSync(this.progressFile, JSON.stringify(progressData, null, 2));
    }

    console.error(`\n❌ Task failed: ${error.message}\n`);
  }
}

module.exports = { ProgressTracker };

