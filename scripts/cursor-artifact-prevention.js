#!/usr/bin/env node

/**
 * 🛡️ Alex AI Universal - Cursor AI Artifact Prevention System
 * 
 * Comprehensive system to prevent Cursor AI from creating Alex AI artifacts
 * Features: Real-time monitoring, automatic cleanup, prevention protocols
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  // Artifact patterns to prevent
  artifactPatterns: [
    // Alex AI specific patterns
    'alex-ai-artifacts/',
    'alex-ai-temp/',
    'alex-ai-memory/',
    'alex-ai-session/',
    'alex-ai-cache/',
    'alex-ai-logs/',
    'alex-ai-backups/',
    'alex-ai-workflows/',
    'alex-ai-memories/',
    'alex-ai-configs/',
    'alex-ai-sessions/',
    'alex-ai-data/',
    'alex-ai-files/',
    'alex-ai-output/',
    'alex-ai-results/',
    'alex-ai-reports/',
    'alex-ai-docs/',
    'alex-ai-scripts/',
    'alex-ai-templates/',
    'alex-ai-examples/',
    'alex-ai-tests/',
    'alex-ai-samples/',
    'alex-ai-demos/',
    'alex-ai-showcase/',
    'alex-ai-presentation/',
    'alex-ai-slides/',
    'alex-ai-presentations/',
    'alex-ai-documentation/',
    'alex-ai-guides/',
    'alex-ai-tutorials/',
    'alex-ai-walkthroughs/',
    'alex-ai-explanations/',
    'alex-ai-notes/',
    'alex-ai-notes.md',
    'alex-ai-summary.md',
    'alex-ai-analysis.md',
    'alex-ai-review.md',
    'alex-ai-assessment.md',
    'alex-ai-evaluation.md',
    'alex-ai-report.md',
    'alex-ai-findings.md',
    'alex-ai-recommendations.md',
    'alex-ai-suggestions.md',
    'alex-ai-improvements.md',
    'alex-ai-optimizations.md',
    'alex-ai-enhancements.md',
    'alex-ai-fixes.md',
    'alex-ai-solutions.md',
    'alex-ai-implementations.md',
    'alex-ai-code/',
    'alex-ai-components/',
    'alex-ai-utils/',
    'alex-ai-helpers/',
    'alex-ai-services/',
    'alex-ai-apis/',
    'alex-ai-endpoints/',
    'alex-ai-routes/',
    'alex-ai-controllers/',
    'alex-ai-models/',
    'alex-ai-schemas/',
    'alex-ai-types/',
    'alex-ai-interfaces/',
    'alex-ai-enums/',
    'alex-ai-constants/',
    'alex-ai-configurations/',
    'alex-ai-settings/',
    'alex-ai-options/',
    'alex-ai-preferences/',
    'alex-ai-parameters/',
    'alex-ai-arguments/',
    'alex-ai-inputs/',
    'alex-ai-outputs/',
    'alex-ai-responses/',
    'alex-ai-results/',
    'alex-ai-data/',
    'alex-ai-content/',
    'alex-ai-text/',
    'alex-ai-messages/',
    'alex-ai-communications/',
    'alex-ai-notifications/',
    'alex-ai-alerts/',
    'alex-ai-warnings/',
    'alex-ai-errors/',
    'alex-ai-logs/',
    'alex-ai-debug/',
    'alex-ai-trace/',
    'alex-ai-monitoring/',
    'alex-ai-metrics/',
    'alex-ai-stats/',
    'alex-ai-analytics/',
    'alex-ai-insights/',
    'alex-ai-intelligence/',
    'alex-ai-knowledge/',
    'alex-ai-wisdom/',
    'alex-ai-expertise/',
    'alex-ai-skills/',
    'alex-ai-abilities/',
    'alex-ai-capabilities/',
    'alex-ai-features/',
    'alex-ai-functionality/',
    'alex-ai-operations/',
    'alex-ai-processes/',
    'alex-ai-workflows/',
    'alex-ai-automations/',
    'alex-ai-integrations/',
    'alex-ai-connections/',
    'alex-ai-bindings/',
    'alex-ai-links/',
    'alex-ai-associations/',
    'alex-ai-relationships/',
    'alex-ai-dependencies/',
    'alex-ai-requirements/',
    'alex-ai-specifications/',
    'alex-ai-documentation/',
    'alex-ai-readme/',
    'alex-ai-instructions/',
    'alex-ai-manuals/',
    'alex-ai-handbooks/',
    'alex-ai-references/',
    'alex-ai-glossaries/',
    'alex-ai-dictionaries/',
    'alex-ai-vocabularies/',
    'alex-ai-terminologies/',
    'alex-ai-definitions/',
    'alex-ai-explanations/',
    'alex-ai-descriptions/',
    'alex-ai-details/',
    'alex-ai-information/',
    'alex-ai-data/',
    'alex-ai-facts/',
    'alex-ai-truths/',
    'alex-ai-realities/',
    'alex-ai-actualities/',
    'alex-ai-existences/',
    'alex-ai-beings/',
    'alex-ai-entities/',
    'alex-ai-objects/',
    'alex-ai-subjects/',
    'alex-ai-items/',
    'alex-ai-elements/',
    'alex-ai-components/',
    'alex-ai-parts/',
    'alex-ai-pieces/',
    'alex-ai-fragments/',
    'alex-ai-segments/',
    'alex-ai-sections/',
    'alex-ai-divisions/',
    'alex-ai-categories/',
    'alex-ai-classifications/',
    'alex-ai-groupings/',
    'alex-ai-collections/',
    'alex-ai-sets/',
    'alex-ai-batches/',
    'alex-ai-groups/',
    'alex-ai-clusters/',
    'alex-ai-bundles/',
    'alex-ai-packages/',
    'alex-ai-modules/',
    'alex-ai-libraries/',
    'alex-ai-frameworks/',
    'alex-ai-toolkits/',
    'alex-ai-sdks/',
    'alex-ai-apis/',
    'alex-ai-services/',
    'alex-ai-platforms/',
    'alex-ai-systems/',
    'alex-ai-applications/',
    'alex-ai-programs/',
    'alex-ai-software/',
    'alex-ai-tools/',
    'alex-ai-utilities/',
    'alex-ai-instruments/',
    'alex-ai-devices/',
    'alex-ai-machines/',
    'alex-ai-engines/',
    'alex-ai-processors/',
    'alex-ai-computers/',
    'alex-ai-servers/',
    'alex-ai-clients/',
    'alex-ai-browsers/',
    
    // Cursor AI specific patterns
    'cursor-ai-artifacts/',
    'cursor-ai-temp/',
    'cursor-ai-memory/',
    'cursor-ai-session/',
    'cursor-ai-cache/',
    'cursor-ai-logs/',
    'cursor-ai-backups/',
    'cursor-ai-workflows/',
    'cursor-ai-memories/',
    'cursor-ai-configs/',
    'cursor-ai-sessions/',
    'cursor-ai-data/',
    'cursor-ai-files/',
    'cursor-ai-output/',
    'cursor-ai-results/',
    'cursor-ai-reports/',
    'cursor-ai-docs/',
    'cursor-ai-scripts/',
    'cursor-ai-templates/',
    'cursor-ai-examples/',
    'cursor-ai-tests/',
    'cursor-ai-samples/',
    'cursor-ai-demos/',
    'cursor-ai-showcase/',
    'cursor-ai-presentation/',
    'cursor-ai-slides/',
    'cursor-ai-presentations/',
    'cursor-ai-documentation/',
    'cursor-ai-guides/',
    'cursor-ai-tutorials/',
    'cursor-ai-walkthroughs/',
    'cursor-ai-explanations/',
    'cursor-ai-notes/',
    'cursor-ai-notes.md',
    'cursor-ai-summary.md',
    'cursor-ai-analysis.md',
    'cursor-ai-review.md',
    'cursor-ai-assessment.md',
    'cursor-ai-evaluation.md',
    'cursor-ai-report.md',
    'cursor-ai-findings.md',
    'cursor-ai-recommendations.md',
    'cursor-ai-suggestions.md',
    'cursor-ai-improvements.md',
    'cursor-ai-optimizations.md',
    'cursor-ai-enhancements.md',
    'cursor-ai-fixes.md',
    'cursor-ai-solutions.md',
    'cursor-ai-implementations.md',
    'cursor-ai-code/',
    'cursor-ai-components/',
    'cursor-ai-utils/',
    'cursor-ai-helpers/',
    'cursor-ai-services/',
    'cursor-ai-apis/',
    'cursor-ai-endpoints/',
    'cursor-ai-routes/',
    'cursor-ai-controllers/',
    'cursor-ai-models/',
    'cursor-ai-schemas/',
    'cursor-ai-types/',
    'cursor-ai-interfaces/',
    'cursor-ai-enums/',
    'cursor-ai-constants/',
    'cursor-ai-configurations/',
    'cursor-ai-settings/',
    'cursor-ai-options/',
    'cursor-ai-preferences/',
    'cursor-ai-parameters/',
    'cursor-ai-arguments/',
    'cursor-ai-inputs/',
    'cursor-ai-outputs/',
    'cursor-ai-responses/',
    'cursor-ai-results/',
    'cursor-ai-data/',
    'cursor-ai-content/',
    'cursor-ai-text/',
    'cursor-ai-messages/',
    'cursor-ai-communications/',
    'cursor-ai-notifications/',
    'cursor-ai-alerts/',
    'cursor-ai-warnings/',
    'cursor-ai-errors/',
    'cursor-ai-logs/',
    'cursor-ai-debug/',
    'cursor-ai-trace/',
    'cursor-ai-monitoring/',
    'cursor-ai-metrics/',
    'cursor-ai-stats/',
    'cursor-ai-analytics/',
    'cursor-ai-insights/',
    'cursor-ai-intelligence/',
    'cursor-ai-knowledge/',
    'cursor-ai-wisdom/',
    'cursor-ai-expertise/',
    'cursor-ai-skills/',
    'cursor-ai-abilities/',
    'cursor-ai-capabilities/',
    'cursor-ai-features/',
    'cursor-ai-functionality/',
    'cursor-ai-operations/',
    'cursor-ai-processes/',
    'cursor-ai-workflows/',
    'cursor-ai-automations/',
    'cursor-ai-integrations/',
    'cursor-ai-connections/',
    'cursor-ai-bindings/',
    'cursor-ai-links/',
    'cursor-ai-associations/',
    'cursor-ai-relationships/',
    'cursor-ai-dependencies/',
    'cursor-ai-requirements/',
    'cursor-ai-specifications/',
    'cursor-ai-documentation/',
    'cursor-ai-readme/',
    'cursor-ai-instructions/',
    'cursor-ai-manuals/',
    'cursor-ai-handbooks/',
    'cursor-ai-references/',
    'cursor-ai-glossaries/',
    'cursor-ai-dictionaries/',
    'cursor-ai-vocabularies/',
    'cursor-ai-terminologies/',
    'cursor-ai-definitions/',
    'cursor-ai-explanations/',
    'cursor-ai-descriptions/',
    'cursor-ai-details/',
    'cursor-ai-information/',
    'cursor-ai-data/',
    'cursor-ai-facts/',
    'cursor-ai-truths/',
    'cursor-ai-realities/',
    'cursor-ai-actualities/',
    'cursor-ai-existences/',
    'cursor-ai-beings/',
    'cursor-ai-entities/',
    'cursor-ai-objects/',
    'cursor-ai-subjects/',
    'cursor-ai-items/',
    'cursor-ai-elements/',
    'cursor-ai-components/',
    'cursor-ai-parts/',
    'cursor-ai-pieces/',
    'cursor-ai-fragments/',
    'cursor-ai-segments/',
    'cursor-ai-sections/',
    'cursor-ai-divisions/',
    'cursor-ai-categories/',
    'cursor-ai-classifications/',
    'cursor-ai-groupings/',
    'cursor-ai-collections/',
    'cursor-ai-sets/',
    'cursor-ai-batches/',
    'cursor-ai-groups/',
    'cursor-ai-clusters/',
    'cursor-ai-bundles/',
    'cursor-ai-packages/',
    'cursor-ai-modules/',
    'cursor-ai-libraries/',
    'cursor-ai-frameworks/',
    'cursor-ai-toolkits/',
    'cursor-ai-sdks/',
    'cursor-ai-apis/',
    'cursor-ai-services/',
    'cursor-ai-platforms/',
    'cursor-ai-systems/',
    'cursor-ai-applications/',
    'cursor-ai-programs/',
    'cursor-ai-software/',
    'cursor-ai-tools/',
    'cursor-ai-utilities/',
    'cursor-ai-instruments/',
    'cursor-ai-devices/',
    'cursor-ai-machines/',
    'cursor-ai-engines/',
    'cursor-ai-processors/',
    'cursor-ai-computers/',
    'cursor-ai-servers/',
    'cursor-ai-clients/',
    'cursor-ai-browsers/',
    
    // General AI patterns
    'ai-artifacts/',
    'ai-temp/',
    'ai-memory/',
    'ai-session/',
    'ai-cache/',
    'ai-logs/',
    'ai-backups/',
    'ai-workflows/',
    'ai-memories/',
    'ai-configs/',
    'ai-sessions/',
    'ai-data/',
    'ai-files/',
    'ai-output/',
    'ai-results/',
    'ai-reports/',
    'ai-docs/',
    'ai-scripts/',
    'ai-templates/',
    'ai-examples/',
    'ai-tests/',
    'ai-samples/',
    'ai-demos/',
    'ai-showcase/',
    'ai-presentation/',
    'ai-slides/',
    'ai-presentations/',
    'ai-documentation/',
    'ai-guides/',
    'ai-tutorials/',
    'ai-walkthroughs/',
    'ai-explanations/',
    'ai-notes/',
    'ai-notes.md',
    'ai-summary.md',
    'ai-analysis.md',
    'ai-review.md',
    'ai-assessment.md',
    'ai-evaluation.md',
    'ai-report.md',
    'ai-findings.md',
    'ai-recommendations.md',
    'ai-suggestions.md',
    'ai-improvements.md',
    'ai-optimizations.md',
    'ai-enhancements.md',
    'ai-fixes.md',
    'ai-solutions.md',
    'ai-implementations.md',
    'ai-code/',
    'ai-components/',
    'ai-utils/',
    'ai-helpers/',
    'ai-services/',
    'ai-apis/',
    'ai-endpoints/',
    'ai-routes/',
    'ai-controllers/',
    'ai-models/',
    'ai-schemas/',
    'ai-types/',
    'ai-interfaces/',
    'ai-enums/',
    'ai-constants/',
    'ai-configurations/',
    'ai-settings/',
    'ai-options/',
    'ai-preferences/',
    'ai-parameters/',
    'ai-arguments/',
    'ai-inputs/',
    'ai-outputs/',
    'ai-responses/',
    'ai-results/',
    'ai-data/',
    'ai-content/',
    'ai-text/',
    'ai-messages/',
    'ai-communications/',
    'ai-notifications/',
    'ai-alerts/',
    'ai-warnings/',
    'ai-errors/',
    'ai-logs/',
    'ai-debug/',
    'ai-trace/',
    'ai-monitoring/',
    'ai-metrics/',
    'ai-stats/',
    'ai-analytics/',
    'ai-insights/',
    'ai-intelligence/',
    'ai-knowledge/',
    'ai-wisdom/',
    'ai-expertise/',
    'ai-skills/',
    'ai-abilities/',
    'ai-capabilities/',
    'ai-features/',
    'ai-functionality/',
    'ai-operations/',
    'ai-processes/',
    'ai-workflows/',
    'ai-automations/',
    'ai-integrations/',
    'ai-connections/',
    'ai-bindings/',
    'ai-links/',
    'ai-associations/',
    'ai-relationships/',
    'ai-dependencies/',
    'ai-requirements/',
    'ai-specifications/',
    'ai-documentation/',
    'ai-readme/',
    'ai-instructions/',
    'ai-manuals/',
    'ai-handbooks/',
    'ai-references/',
    'ai-glossaries/',
    'ai-dictionaries/',
    'ai-vocabularies/',
    'ai-terminologies/',
    'ai-definitions/',
    'ai-explanations/',
    'ai-descriptions/',
    'ai-details/',
    'ai-information/',
    'ai-data/',
    'ai-facts/',
    'ai-truths/',
    'ai-realities/',
    'ai-actualities/',
    'ai-existences/',
    'ai-beings/',
    'ai-entities/',
    'ai-objects/',
    'ai-subjects/',
    'ai-items/',
    'ai-elements/',
    'ai-components/',
    'ai-parts/',
    'ai-pieces/',
    'ai-fragments/',
    'ai-segments/',
    'ai-sections/',
    'ai-divisions/',
    'ai-categories/',
    'ai-classifications/',
    'ai-groupings/',
    'ai-collections/',
    'ai-sets/',
    'ai-batches/',
    'ai-groups/',
    'ai-clusters/',
    'ai-bundles/',
    'ai-packages/',
    'ai-modules/',
    'ai-libraries/',
    'ai-frameworks/',
    'ai-toolkits/',
    'ai-sdks/',
    'ai-apis/',
    'ai-services/',
    'ai-platforms/',
    'ai-systems/',
    'ai-applications/',
    'ai-programs/',
    'ai-software/',
    'ai-tools/',
    'ai-utilities/',
    'ai-instruments/',
    'ai-devices/',
    'ai-machines/',
    'ai-engines/',
    'ai-processors/',
    'ai-computers/',
    'ai-servers/',
    'ai-clients/',
    'ai-browsers/',
    
    // Chat patterns
    'chat-artifacts/',
    'chat-temp/',
    'chat-memory/',
    'chat-session/',
    'chat-cache/',
    'chat-logs/',
    'chat-backups/',
    'chat-workflows/',
    'chat-memories/',
    'chat-configs/',
    'chat-sessions/',
    'chat-data/',
    'chat-files/',
    'chat-output/',
    'chat-results/',
    'chat-reports/',
    'chat-docs/',
    'chat-scripts/',
    'chat-templates/',
    'chat-examples/',
    'chat-tests/',
    'chat-samples/',
    'chat-demos/',
    'chat-showcase/',
    'chat-presentation/',
    'chat-slides/',
    'chat-presentations/',
    'chat-documentation/',
    'chat-guides/',
    'chat-tutorials/',
    'chat-walkthroughs/',
    'chat-explanations/',
    'chat-notes/',
    'chat-notes.md',
    'chat-summary.md',
    'chat-analysis.md',
    'chat-review.md',
    'chat-assessment.md',
    'chat-evaluation.md',
    'chat-report.md',
    'chat-findings.md',
    'chat-recommendations.md',
    'chat-suggestions.md',
    'chat-improvements.md',
    'chat-optimizations.md',
    'chat-enhancements.md',
    'chat-fixes.md',
    'chat-solutions.md',
    'chat-implementations.md',
    'chat-code/',
    'chat-components/',
    'chat-utils/',
    'chat-helpers/',
    'chat-services/',
    'chat-apis/',
    'chat-endpoints/',
    'chat-routes/',
    'chat-controllers/',
    'chat-models/',
    'chat-schemas/',
    'chat-types/',
    'chat-interfaces/',
    'chat-enums/',
    'chat-constants/',
    'chat-configurations/',
    'chat-settings/',
    'chat-options/',
    'chat-preferences/',
    'chat-parameters/',
    'chat-arguments/',
    'chat-inputs/',
    'chat-outputs/',
    'chat-responses/',
    'chat-results/',
    'chat-data/',
    'chat-content/',
    'chat-text/',
    'chat-messages/',
    'chat-communications/',
    'chat-notifications/',
    'chat-alerts/',
    'chat-warnings/',
    'chat-errors/',
    'chat-logs/',
    'chat-debug/',
    'chat-trace/',
    'chat-monitoring/',
    'chat-metrics/',
    'chat-stats/',
    'chat-analytics/',
    'chat-insights/',
    'chat-intelligence/',
    'chat-knowledge/',
    'chat-wisdom/',
    'chat-expertise/',
    'chat-skills/',
    'chat-abilities/',
    'chat-capabilities/',
    'chat-features/',
    'chat-functionality/',
    'chat-operations/',
    'chat-processes/',
    'chat-workflows/',
    'chat-automations/',
    'chat-integrations/',
    'chat-connections/',
    'chat-bindings/',
    'chat-links/',
    'chat-associations/',
    'chat-relationships/',
    'chat-dependencies/',
    'chat-requirements/',
    'chat-specifications/',
    'chat-documentation/',
    'chat-readme/',
    'chat-instructions/',
    'chat-manuals/',
    'chat-handbooks/',
    'chat-references/',
    'chat-glossaries/',
    'chat-dictionaries/',
    'chat-vocabularies/',
    'chat-terminologies/',
    'chat-definitions/',
    'chat-explanations/',
    'chat-descriptions/',
    'chat-details/',
    'chat-information/',
    'chat-data/',
    'chat-facts/',
    'chat-truths/',
    'chat-realities/',
    'chat-actualities/',
    'chat-existences/',
    'chat-beings/',
    'chat-entities/',
    'chat-objects/',
    'chat-subjects/',
    'chat-items/',
    'chat-elements/',
    'chat-components/',
    'chat-parts/',
    'chat-pieces/',
    'chat-fragments/',
    'chat-segments/',
    'chat-sections/',
    'chat-divisions/',
    'chat-categories/',
    'chat-classifications/',
    'chat-groupings/',
    'chat-collections/',
    'chat-sets/',
    'chat-batches/',
    'chat-groups/',
    'chat-clusters/',
    'chat-bundles/',
    'chat-packages/',
    'chat-modules/',
    'chat-libraries/',
    'chat-frameworks/',
    'chat-toolkits/',
    'chat-sdks/',
    'chat-apis/',
    'chat-services/',
    'chat-platforms/',
    'chat-systems/',
    'chat-applications/',
    'chat-programs/',
    'chat-software/',
    'chat-tools/',
    'chat-utilities/',
    'chat-instruments/',
    'chat-devices/',
    'chat-machines/',
    'chat-engines/',
    'chat-processors/',
    'chat-computers/',
    'chat-servers/',
    'chat-clients/',
    'chat-browsers/'
  ],
  
  // File patterns to prevent
  filePatterns: [
    '*.ai-temp',
    '*.ai-memory',
    '*.ai-session',
    '*.ai-cache',
    '*.ai-log',
    '*.ai-backup',
    '*.ai-workflow',
    '*.ai-memory',
    '*.ai-config',
    '*.ai-session',
    '*.ai-data',
    '*.ai-file',
    '*.ai-output',
    '*.ai-result',
    '*.ai-report',
    '*.ai-doc',
    '*.ai-script',
    '*.ai-template',
    '*.ai-example',
    '*.ai-test',
    '*.ai-sample',
    '*.ai-demo',
    '*.ai-showcase',
    '*.ai-presentation',
    '*.ai-slide',
    '*.ai-presentation',
    '*.ai-documentation',
    '*.ai-guide',
    '*.ai-tutorial',
    '*.ai-walkthrough',
    '*.ai-explanation',
    '*.ai-note',
    '*.ai-summary',
    '*.ai-analysis',
    '*.ai-review',
    '*.ai-assessment',
    '*.ai-evaluation',
    '*.ai-report',
    '*.ai-finding',
    '*.ai-recommendation',
    '*.ai-suggestion',
    '*.ai-improvement',
    '*.ai-optimization',
    '*.ai-enhancement',
    '*.ai-fix',
    '*.ai-solution',
    '*.ai-implementation',
    '*.ai-code',
    '*.ai-component',
    '*.ai-util',
    '*.ai-helper',
    '*.ai-service',
    '*.ai-api',
    '*.ai-endpoint',
    '*.ai-route',
    '*.ai-controller',
    '*.ai-model',
    '*.ai-schema',
    '*.ai-type',
    '*.ai-interface',
    '*.ai-enum',
    '*.ai-constant',
    '*.ai-configuration',
    '*.ai-setting',
    '*.ai-option',
    '*.ai-preference',
    '*.ai-parameter',
    '*.ai-argument',
    '*.ai-input',
    '*.ai-output',
    '*.ai-response',
    '*.ai-result',
    '*.ai-data',
    '*.ai-content',
    '*.ai-text',
    '*.ai-message',
    '*.ai-communication',
    '*.ai-notification',
    '*.ai-alert',
    '*.ai-warning',
    '*.ai-error',
    '*.ai-log',
    '*.ai-debug',
    '*.ai-trace',
    '*.ai-monitoring',
    '*.ai-metric',
    '*.ai-stat',
    '*.ai-analytic',
    '*.ai-insight',
    '*.ai-intelligence',
    '*.ai-knowledge',
    '*.ai-wisdom',
    '*.ai-expertise',
    '*.ai-skill',
    '*.ai-ability',
    '*.ai-capability',
    '*.ai-feature',
    '*.ai-functionality',
    '*.ai-operation',
    '*.ai-process',
    '*.ai-workflow',
    '*.ai-automation',
    '*.ai-integration',
    '*.ai-connection',
    '*.ai-binding',
    '*.ai-link',
    '*.ai-association',
    '*.ai-relationship',
    '*.ai-dependency',
    '*.ai-requirement',
    '*.ai-specification',
    '*.ai-documentation',
    '*.ai-readme',
    '*.ai-instruction',
    '*.ai-manual',
    '*.ai-handbook',
    '*.ai-reference',
    '*.ai-glossary',
    '*.ai-dictionary',
    '*.ai-vocabulary',
    '*.ai-terminology',
    '*.ai-definition',
    '*.ai-explanation',
    '*.ai-description',
    '*.ai-detail',
    '*.ai-information',
    '*.ai-data',
    '*.ai-fact',
    '*.ai-truth',
    '*.ai-reality',
    '*.ai-actuality',
    '*.ai-existence',
    '*.ai-being',
    '*.ai-entity',
    '*.ai-object',
    '*.ai-subject',
    '*.ai-item',
    '*.ai-element',
    '*.ai-component',
    '*.ai-part',
    '*.ai-piece',
    '*.ai-fragment',
    '*.ai-segment',
    '*.ai-section',
    '*.ai-division',
    '*.ai-category',
    '*.ai-classification',
    '*.ai-grouping',
    '*.ai-collection',
    '*.ai-set',
    '*.ai-batch',
    '*.ai-group',
    '*.ai-cluster',
    '*.ai-bundle',
    '*.ai-package',
    '*.ai-module',
    '*.ai-library',
    '*.ai-framework',
    '*.ai-toolkit',
    '*.ai-sdk',
    '*.ai-api',
    '*.ai-service',
    '*.ai-platform',
    '*.ai-system',
    '*.ai-application',
    '*.ai-program',
    '*.ai-software',
    '*.ai-tool',
    '*.ai-utility',
    '*.ai-instrument',
    '*.ai-device',
    '*.ai-machine',
    '*.ai-engine',
    '*.ai-processor',
    '*.ai-computer',
    '*.ai-server',
    '*.ai-client',
    '*.ai-browser'
  ],
  
  // Backup directory for artifacts
  backupDir: path.join(__dirname, '..', 'local-testing', 'artifact-backups'),
  
  // Log file
  logFile: path.join(__dirname, '..', 'local-testing', 'logs', 'artifact-prevention.log'),
  
  // Monitoring intervals
  monitoring: {
    checkInterval: 1000,    // 1 second
    cleanupInterval: 60000  // 1 minute
  }
};

/**
 * 🛡️ Cursor AI Artifact Prevention System
 */
class CursorArtifactPreventionSystem {
  constructor() {
    this.isRunning = false;
    this.watchers = new Map();
    this.artifactsDetected = 0;
    this.artifactsRemoved = 0;
    this.startTime = null;
    
    this.setupDirectories();
  }
  
  /**
   * Setup directories
   */
  setupDirectories() {
    // Create backup directory
    if (!fs.existsSync(CONFIG.backupDir)) {
      fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    }
    
    // Create logs directory
    const logsDir = path.dirname(CONFIG.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }
  
  /**
   * Start artifact prevention system
   */
  async start() {
    console.log('🛡️ Starting Cursor AI Artifact Prevention System...');
    console.log('');
    
    this.isRunning = true;
    this.startTime = Date.now();
    
    // Start monitoring
    this.startMonitoring();
    
    // Start cleanup interval
    this.startCleanupInterval();
    
    console.log('✅ Artifact prevention system started');
    console.log(`📁 Backup directory: ${CONFIG.backupDir}`);
    console.log(`📊 Monitoring ${CONFIG.artifactPatterns.length} artifact patterns`);
    console.log(`📊 Monitoring ${CONFIG.filePatterns.length} file patterns`);
    console.log('');
    
    // Handle shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }
  
  /**
   * Start monitoring
   */
  startMonitoring() {
    // Monitor current directory and subdirectories
    const currentDir = process.cwd();
    
    const watcher = chokidar.watch(currentDir, {
      ignored: /(^|[\/\\\\])\\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true
    });
    
    watcher.on('add', (filePath) => this.handleFileChange('add', filePath));
    watcher.on('change', (filePath) => this.handleFileChange('change', filePath));
    watcher.on('unlink', (filePath) => this.handleFileChange('unlink', filePath));
    
    this.watchers.set(currentDir, watcher);
    console.log(`👁️  Monitoring: ${currentDir}`);
  }
  
  /**
   * Handle file changes
   */
  handleFileChange(event, filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Check if this is an artifact
    if (this.isArtifact(relativePath)) {
      console.log(`🚨 ARTIFACT DETECTED: ${event} ${relativePath}`);
      
      this.artifactsDetected++;
      
      if (event === 'add' || event === 'change') {
        this.handleArtifact(filePath, relativePath);
      }
    }
  }
  
  /**
   * Check if path is an artifact
   */
  isArtifact(relativePath) {
    // Check directory patterns
    for (const pattern of CONFIG.artifactPatterns) {
      if (relativePath.includes(pattern)) {
        return true;
      }
    }
    
    // Check file patterns
    const fileName = path.basename(relativePath);
    for (const pattern of CONFIG.filePatterns) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      if (regex.test(fileName)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Handle detected artifact
   */
  async handleArtifact(filePath, relativePath) {
    try {
      // Create backup
      await this.backupArtifact(filePath, relativePath);
      
      // Remove artifact
      await this.removeArtifact(filePath);
      
      this.artifactsRemoved++;
      
      console.log(`  ✅ Artifact backed up and removed: ${relativePath}`);
      
      // Log the incident
      this.logArtifact(relativePath, 'removed');
      
    } catch (error) {
      console.error(`  ❌ Failed to handle artifact ${relativePath}:`, error.message);
      this.logArtifact(relativePath, 'error', error.message);
    }
  }
  
  /**
   * Backup artifact
   */
  async backupArtifact(filePath, relativePath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = path.basename(filePath);
    const backupPath = path.join(CONFIG.backupDir, `${timestamp}-${fileName}`);
    
    if (fs.existsSync(filePath)) {
      if (fs.statSync(filePath).isDirectory()) {
        // Copy directory
        await execAsync(`cp -r "${filePath}" "${backupPath}"`);
      } else {
        // Copy file
        fs.copyFileSync(filePath, backupPath);
      }
    }
  }
  
  /**
   * Remove artifact
   */
  async removeArtifact(filePath) {
    if (fs.existsSync(filePath)) {
      if (fs.statSync(filePath).isDirectory()) {
        // Remove directory
        await execAsync(`rm -rf "${filePath}"`);
      } else {
        // Remove file
        fs.unlinkSync(filePath);
      }
    }
  }
  
  /**
   * Log artifact incident
   */
  logArtifact(relativePath, action, error = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      path: relativePath,
      action: action,
      error: error
    };
    
    fs.appendFileSync(CONFIG.logFile, JSON.stringify(logEntry) + '\n');
  }
  
  /**
   * Start cleanup interval
   */
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupOldBackups();
    }, CONFIG.monitoring.cleanupInterval);
  }
  
  /**
   * Cleanup old backups
   */
  cleanupOldBackups() {
    try {
      const files = fs.readdirSync(CONFIG.backupDir);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      for (const file of files) {
        const filePath = path.join(CONFIG.backupDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > oneDay) {
          if (stats.isDirectory()) {
            fs.rmSync(filePath, { recursive: true });
          } else {
            fs.unlinkSync(filePath);
          }
          console.log(`🗑️  Cleaned up old backup: ${file}`);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old backups:', error.message);
    }
  }
  
  /**
   * Get system status
   */
  getStatus() {
    const uptime = this.startTime ? Date.now() - this.startTime : 0;
    
    return {
      isRunning: this.isRunning,
      uptime: uptime,
      artifactsDetected: this.artifactsDetected,
      artifactsRemoved: this.artifactsRemoved,
      watchers: this.watchers.size,
      patterns: CONFIG.artifactPatterns.length + CONFIG.filePatterns.length
    };
  }
  
  /**
   * Stop system
   */
  stop() {
    console.log('\n🛑 Stopping artifact prevention system...');
    
    this.isRunning = false;
    
    // Close all watchers
    this.watchers.forEach(watcher => watcher.close());
    this.watchers.clear();
    
    console.log('✅ Artifact prevention system stopped');
    console.log(`📊 Total artifacts detected: ${this.artifactsDetected}`);
    console.log(`📊 Total artifacts removed: ${this.artifactsRemoved}`);
    
    process.exit(0);
  }
}

// Main execution
if (require.main === module) {
  const preventionSystem = new CursorArtifactPreventionSystem();
  preventionSystem.start().catch(console.error);
}

module.exports = { CursorArtifactPreventionSystem };
