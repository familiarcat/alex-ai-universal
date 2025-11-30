/**
 * 🛡️ Alex AI Integration Tests
 * 
 * Integration tests for Alex AI spell checking and Zero-Artifact Guarantee
 * Tests the complete workflow from setup to validation
 */

const { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } = require('@jest/globals');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

describe('🛡️ Alex AI Integration Tests', () => {
  let testProjectPath;
  let validationResultsPath;
  let initialProjectState;
  
  beforeAll(async () => {
    // Setup test environment
    testProjectPath = path.join(process.env.HOME, 'Documents', 'workspace', 'Testing Project');
    validationResultsPath = path.join(__dirname, '..', '..', 'validation-results');
    
    // Clean up any existing test project
    if (fs.existsSync(testProjectPath)) {
      fs.rmSync(testProjectPath, { recursive: true, force: true });
    }
    
    // Clean up validation results
    if (fs.existsSync(validationResultsPath)) {
      fs.rmSync(validationResultsPath, { recursive: true, force: true });
    }
  });
  
  afterAll(async () => {
    // Cleanup test environment
    if (fs.existsSync(testProjectPath)) {
      fs.rmSync(testProjectPath, { recursive: true, force: true });
    }
    
    if (fs.existsSync(validationResultsPath)) {
      fs.rmSync(validationResultsPath, { recursive: true, force: true });
    }
  });
  
  beforeEach(async () => {
    // Capture initial state before each test
    initialProjectState = await captureProjectState();
  });
  
  afterEach(async () => {
    // Verify no artifacts left after each test
    const finalProjectState = await captureProjectState();
    const artifacts = findArtifacts(initialProjectState, finalProjectState);
    
    if (artifacts.length > 0) {
      console.warn(`⚠️ Artifacts detected after test: ${artifacts.join(', ')}`);
    }
    
    expect(artifacts.length).toBe(0);
  });
  
  describe('Complete Alex AI Validation Workflow', () => {
    it('should run complete validation trace without creating artifacts', async () => {
      // Run the validation trace script
      const { stdout, stderr } = await execAsync(
        'node scripts/alex-ai-validation-trace.js',
        { cwd: path.join(__dirname, '..', '..') }
      );
      
      // Verify script executed successfully
      expect(stderr).toBe('');
      expect(stdout).toContain('Alex AI Validation Trace Starting');
      expect(stdout).toContain('Alex AI Validation Trace Complete');
      
      // Verify validation results were generated
      const resultsFiles = fs.readdirSync(validationResultsPath);
      expect(resultsFiles.length).toBeGreaterThan(0);
      
      // Verify JSON report exists
      const jsonReport = resultsFiles.find(file => file.endsWith('.json'));
      expect(jsonReport).toBeDefined();
      
      // Verify markdown report exists
      const markdownReport = resultsFiles.find(file => file.endsWith('.md'));
      expect(markdownReport).toBeDefined();
      
      // Load and verify report content
      const reportPath = path.join(validationResultsPath, jsonReport);
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      
      expect(report.timestamp).toBeDefined();
      expect(report.testProject).toBeDefined();
      expect(report.spellCheckValidation).toBeDefined();
      expect(report.zeroArtifactValidation).toBeDefined();
      expect(report.boyScoutPrincipleValidation).toBeDefined();
      expect(report.helpfulAssistantValidation).toBeDefined();
    });
    
    it('should validate spell checking functionality', async () => {
      // Test spell checking in isolation
      const { stdout } = await execAsync(
        'node -e "const { AlexAIValidationTrace } = require(\'./scripts/alex-ai-validation-trace\'); const trace = new AlexAIValidationTrace(); trace.validateSpellChecking().then(() => console.log(\'Spell check validation complete\'));"',
        { cwd: path.join(__dirname, '..', '..') }
      );
      
      expect(stdout).toContain('Spell check validation complete');
    });
    
    it('should validate zero-artifact guarantee', async () => {
      // Test zero-artifact guarantee in isolation
      const { stdout } = await execAsync(
        'node -e "const { AlexAIValidationTrace } = require(\'./scripts/alex-ai-validation-trace\'); const trace = new AlexAIValidationTrace(); trace.setupTestProject().then(() => trace.captureInitialState()).then(() => trace.validateZeroArtifactGuarantee()).then(() => console.log(\'Zero-artifact validation complete\'));"',
        { cwd: path.join(__dirname, '..', '..') }
      );
      
      expect(stdout).toContain('Zero-artifact validation complete');
    });
  });
  
  describe('Spell Check Integration', () => {
    it('should integrate with Cursor AI chat input', async () => {
      // Simulate Cursor AI integration
      const testContent = 'helo world, I need help with teh code';
      
      // Test spell check detection
      const { stdout } = await execAsync(
        `node -e "
          const { AlexAIValidationTrace } = require('./scripts/alex-ai-validation-trace');
          const trace = new AlexAIValidationTrace();
          const words = '${testContent}'.split(' ');
          words.forEach(word => {
            const result = trace.testSpellCheckWord(word);
            if (result.highlighted) {
              console.log('Misspelled:', word, 'Suggestions:', result.suggestions.join(', '));
            }
          });
        "`,
        { cwd: path.join(__dirname, '..', '..') }
      );
      
      expect(stdout).toContain('Misspelled: helo');
      expect(stdout).toContain('Misspelled: teh');
      expect(stdout).toContain('Suggestions: hello, help');
      expect(stdout).toContain('Suggestions: the');
    });
    
    it('should recognize technical terms correctly', async () => {
      const technicalTerms = 'alex-ai typescript javascript react vue angular';
      
      const { stdout } = await execAsync(
        `node -e "
          const { AlexAIValidationTrace } = require('./scripts/alex-ai-validation-trace');
          const trace = new AlexAIValidationTrace();
          const words = '${technicalTerms}'.split(' ');
          words.forEach(word => {
            const result = trace.testTechnicalTerm(word);
            console.log('Term:', word, 'Recognized:', result.recognized);
          });
        "`,
        { cwd: path.join(__dirname, '..', '..') }
      );
      
      expect(stdout).toContain('Term: alex-ai Recognized: true');
      expect(stdout).toContain('Term: typescript Recognized: true');
      expect(stdout).toContain('Term: javascript Recognized: true');
      expect(stdout).toContain('Term: react Recognized: true');
    });
  });
  
  describe('Zero-Artifact Integration', () => {
    it('should maintain zero artifacts during extensive interaction', async () => {
      // Simulate extensive Alex AI interaction
      const interactionScript = `
        const { AlexAIValidationTrace } = require('./scripts/alex-ai-validation-trace');
        const trace = new AlexAIValidationTrace();
        
        async function extensiveInteraction() {
          await trace.setupTestProject();
          await trace.captureInitialState();
          
          // Simulate multiple interactions
          for (let i = 0; i < 10; i++) {
            await trace.simulateAlexAIInteraction();
          }
          
          await trace.captureFinalState();
          
          const comparison = trace.compareProjectStates(trace.initialState, trace.finalState);
          console.log('Project state identical:', comparison.identical);
          console.log('Files changed:', comparison.filesChanged);
          console.log('Directories changed:', comparison.directoriesChanged);
        }
        
        extensiveInteraction();
      `;
      
      const { stdout } = await execAsync(
        `node -e "${interactionScript}"`,
        { cwd: path.join(__dirname, '..', '..') }
      );
      
      expect(stdout).toContain('Project state identical: true');
      expect(stdout).toContain('Files changed: false');
      expect(stdout).toContain('Directories changed: false');
    });
    
    it('should clean up after interaction', async () => {
      // Test cleanup functionality
      const cleanupScript = `
        const { AlexAIValidationTrace } = require('./scripts/alex-ai-validation-trace');
        const trace = new AlexAIValidationTrace();
        
        async function testCleanup() {
          await trace.setupTestProject();
          await trace.captureInitialState();
          
          await trace.simulateAlexAIInteraction();
          
          const cleanupCheck = await trace.checkCleanup();
          console.log('Cleanup status:', cleanupCheck.clean);
        }
        
        testCleanup();
      `;
      
      const { stdout } = await execAsync(
        `node -e "${cleanupScript}"`,
        { cwd: path.join(__dirname, '..', '..') }
      );
      
      expect(stdout).toContain('Cleanup status: true');
    });
  });
  
  describe('Boy Scout Principle Integration', () => {
    it('should leave no trace after complete workflow', async () => {
      // Test complete workflow with trace validation
      const workflowScript = `
        const { AlexAIValidationTrace } = require('./scripts/alex-ai-validation-trace');
        const trace = new AlexAIValidationTrace();
        
        async function completeWorkflow() {
          await trace.setupTestProject();
          await trace.captureInitialState();
          
          // Run all validations
          await trace.validateSpellChecking();
          await trace.validateZeroArtifactGuarantee();
          await trace.validateBoyScoutPrinciple();
          await trace.validateHelpfulAssistant();
          
          await trace.captureFinalState();
          
          const comparison = trace.compareProjectStates(trace.initialState, trace.finalState);
          console.log('Boy Scout principle maintained:', comparison.identical);
        }
        
        completeWorkflow();
      `;
      
      const { stdout } = await execAsync(
        `node -e "${workflowScript}"`,
        { cwd: path.join(__dirname, '..', '..') }
      );
      
      expect(stdout).toContain('Boy Scout principle maintained: true');
    });
    
    it('should respect environment boundaries', async () => {
      // Test environment respect
      const environmentScript = `
        const { AlexAIValidationTrace } = require('./scripts/alex-ai-validation-trace');
        const trace = new AlexAIValidationTrace();
        
        async function testEnvironmentRespect() {
          await trace.setupTestProject();
          await trace.captureInitialState();
          
          // Simulate Alex AI interaction
          await trace.simulateAlexAIInteraction();
          
          // Check for any violations
          const currentFiles = await trace.getProjectFiles();
          const tempFiles = currentFiles.filter(file => 
            file.includes('.tmp') || file.includes('.temp') || file.includes('~')
          );
          
          console.log('Temporary files found:', tempFiles.length);
          console.log('Environment respected:', tempFiles.length === 0);
        }
        
        testEnvironmentRespect();
      `;
      
      const { stdout } = await execAsync(
        `node -e "${environmentScript}"`,
        { cwd: path.join(__dirname, '..', '..') }
      );
      
      expect(stdout).toContain('Temporary files found: 0');
      expect(stdout).toContain('Environment respected: true');
    });
  });
  
  describe('Helpful Assistant Integration', () => {
    it('should provide educational assistance without artifacts', async () => {
      // Test helpful assistant capabilities
      const assistantScript = `
        const { AlexAIValidationTrace } = require('./scripts/alex-ai-validation-trace');
        const trace = new AlexAIValidationTrace();
        
        async function testAssistant() {
          await trace.setupTestProject();
          await trace.captureInitialState();
          
          // Simulate assistant interaction
          const assistantTests = await trace.simulateAssistantTests();
          
          console.log('Educational value:', assistantTests.educational);
          console.log('Non-intrusive:', assistantTests.nonIntrusive);
          console.log('Contextual help:', assistantTests.contextual);
          
          await trace.captureFinalState();
          
          const comparison = trace.compareProjectStates(trace.initialState, trace.finalState);
          console.log('No artifacts created:', comparison.identical);
        }
        
        testAssistant();
      `;
      
      const { stdout } = await execAsync(
        `node -e "${assistantScript}"`,
        { cwd: path.join(__dirname, '..', '..') }
      );
      
      expect(stdout).toContain('Educational value: true');
      expect(stdout).toContain('Non-intrusive: true');
      expect(stdout).toContain('Contextual help: true');
      expect(stdout).toContain('No artifacts created: true');
    });
  });
  
  describe('Error Handling Integration', () => {
    it('should handle errors gracefully without creating artifacts', async () => {
      // Test error handling
      const errorScript = `
        const { AlexAIValidationTrace } = require('./scripts/alex-ai-validation-trace');
        const trace = new AlexAIValidationTrace();
        
        async function testErrorHandling() {
          try {
            await trace.setupTestProject();
            await trace.captureInitialState();
            
            // Simulate error condition
            throw new Error('Simulated error');
          } catch (error) {
            console.log('Error handled:', error.message);
            
            // Verify no artifacts created even with error
            const currentFiles = await trace.getProjectFiles();
            const tempFiles = currentFiles.filter(file => 
              file.includes('.tmp') || file.includes('.temp') || file.includes('~')
            );
            
            console.log('No artifacts after error:', tempFiles.length === 0);
          }
        }
        
        testErrorHandling();
      `;
      
      const { stdout } = await execAsync(
        `node -e "${errorScript}"`,
        { cwd: path.join(__dirname, '..', '..') }
      );
      
      expect(stdout).toContain('Error handled: Simulated error');
      expect(stdout).toContain('No artifacts after error: true');
    });
  });
});

// Helper functions
async function captureProjectState() {
  const testProjectPath = path.join(process.env.HOME, 'Documents', 'workspace', 'Testing Project');
  
  if (!fs.existsSync(testProjectPath)) {
    return { files: [], directories: [] };
  }
  
  try {
    const { stdout: files } = await execAsync('find . -type f | sort', { cwd: testProjectPath });
    const { stdout: directories } = await execAsync('find . -type d | sort', { cwd: testProjectPath });
    
    return {
      files: files.trim().split('\n').filter(f => f.length > 0),
      directories: directories.trim().split('\n').filter(d => d.length > 0)
    };
  } catch (error) {
    return { files: [], directories: [] };
  }
}

function findArtifacts(initialState, finalState) {
  const artifacts = [];
  
  // Check for new files
  const newFiles = finalState.files.filter(file => 
    !initialState.files.includes(file)
  );
  
  // Check for new directories
  const newDirectories = finalState.directories.filter(dir => 
    !initialState.directories.includes(dir)
  );
  
  // Check for temporary files
  const tempFiles = finalState.files.filter(file => 
    file.includes('.tmp') || file.includes('.temp') || file.includes('~') || 
    file.includes('.alex-ai') || file.includes('.cursor-ai')
  );
  
  artifacts.push(...newFiles, ...newDirectories, ...tempFiles);
  
  return artifacts;
}
