/**
 * 🛡️ Alex AI Validation Unit Tests
 * 
 * Unit tests for Alex AI spell checking and Zero-Artifact Guarantee
 */

const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const fs = require('fs');
const path = require('path');
const { AlexAIValidationTrace } = require('../../scripts/alex-ai-validation-trace');

describe('🛡️ Alex AI Validation Trace', () => {
  let validationTrace;
  let testProjectPath;
  
  beforeEach(() => {
    validationTrace = new AlexAIValidationTrace();
    testProjectPath = path.join(process.env.HOME, 'Documents', 'workspace', 'Testing Project');
  });
  
  afterEach(() => {
    // Cleanup test project if it exists
    if (fs.existsSync(testProjectPath)) {
      fs.rmSync(testProjectPath, { recursive: true, force: true });
    }
  });
  
  describe('Spell Check Validation', () => {
    it('should detect misspelled words', () => {
      const misspelledWords = ['helo', 'recieve', 'teh', 'alot'];
      
      misspelledWords.forEach(word => {
        const result = validationTrace.testSpellCheckWord(word);
        expect(result.highlighted).toBe(true);
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.alexAIBranding).toBe(true);
      });
    });
    
    it('should recognize technical terms', () => {
      const technicalTerms = ['alex-ai', 'typescript', 'javascript', 'react'];
      
      technicalTerms.forEach(term => {
        const result = validationTrace.testTechnicalTerm(term);
        expect(result.highlighted).toBe(false);
        expect(result.recognized).toBe(true);
      });
    });
    
    it('should provide appropriate suggestions', () => {
      const testCases = [
        { word: 'helo', expectedSuggestions: ['hello', 'help'] },
        { word: 'recieve', expectedSuggestions: ['receive'] },
        { word: 'teh', expectedSuggestions: ['the'] }
      ];
      
      testCases.forEach(({ word, expectedSuggestions }) => {
        const result = validationTrace.testSpellCheckWord(word);
        expect(result.suggestions).toEqual(expect.arrayContaining(expectedSuggestions));
      });
    });
  });
  
  describe('Zero-Artifact Guarantee', () => {
    it('should not create new files during interaction', async () => {
      // Setup test project
      await validationTrace.setupTestProject();
      await validationTrace.captureInitialState();
      
      // Simulate Alex AI interaction
      await validationTrace.simulateAlexAIInteraction();
      
      // Capture final state
      await validationTrace.captureFinalState();
      
      // Validate no new files
      const stateComparison = validationTrace.compareProjectStates(
        validationTrace.initialState,
        validationTrace.finalState
      );
      
      expect(stateComparison.identical).toBe(true);
    });
    
    it('should not create temporary files', async () => {
      await validationTrace.setupTestProject();
      await validationTrace.captureInitialState();
      
      // Simulate Alex AI interaction
      await validationTrace.simulateAlexAIInteraction();
      
      // Check for temporary files
      const currentFiles = await validationTrace.getProjectFiles();
      const tempFiles = currentFiles.filter(file => 
        file.includes('.tmp') || file.includes('.temp') || file.includes('~')
      );
      
      expect(tempFiles.length).toBe(0);
    });
    
    it('should maintain project structure integrity', async () => {
      await validationTrace.setupTestProject();
      await validationTrace.captureInitialState();
      
      // Simulate Alex AI interaction
      await validationTrace.simulateAlexAIInteraction();
      
      // Capture final state
      await validationTrace.captureFinalState();
      
      // Validate structure integrity
      expect(validationTrace.finalState.files.length).toBe(validationTrace.initialState.files.length);
      expect(validationTrace.finalState.directories.length).toBe(validationTrace.initialState.directories.length);
    });
  });
  
  describe('Boy Scout Principle', () => {
    it('should leave no trace after interaction', async () => {
      await validationTrace.setupTestProject();
      await validationTrace.captureInitialState();
      
      // Simulate Alex AI interaction
      await validationTrace.simulateAlexAIInteraction();
      
      // Capture final state
      await validationTrace.captureFinalState();
      
      // Validate no trace left
      const stateComparison = validationTrace.compareProjectStates(
        validationTrace.initialState,
        validationTrace.finalState
      );
      
      expect(stateComparison.identical).toBe(true);
      expect(stateComparison.filesChanged).toBe(false);
      expect(stateComparison.directoriesChanged).toBe(false);
    });
    
    it('should respect the environment', async () => {
      await validationTrace.setupTestProject();
      await validationTrace.captureInitialState();
      
      // Simulate Alex AI interaction
      await validationTrace.simulateAlexAIInteraction();
      
      // Validate environment respect
      const cleanupCheck = await validationTrace.checkCleanup();
      expect(cleanupCheck.clean).toBe(true);
    });
  });
  
  describe('Helpful Assistant Capabilities', () => {
    it('should provide educational value', async () => {
      const assistantTests = await validationTrace.simulateAssistantTests();
      expect(assistantTests.educational).toBe(true);
    });
    
    it('should be non-intrusive', async () => {
      const assistantTests = await validationTrace.simulateAssistantTests();
      expect(assistantTests.nonIntrusive).toBe(true);
    });
    
    it('should provide contextual help', async () => {
      const assistantTests = await validationTrace.simulateAssistantTests();
      expect(assistantTests.contextual).toBe(true);
    });
  });
  
  describe('Validation Report Generation', () => {
    it('should generate comprehensive validation report', async () => {
      await validationTrace.setupTestProject();
      await validationTrace.captureInitialState();
      await validationTrace.validateSpellChecking();
      await validationTrace.validateZeroArtifactGuarantee();
      await validationTrace.validateBoyScoutPrinciple();
      await validationTrace.validateHelpfulAssistant();
      await validationTrace.captureFinalState();
      await validationTrace.generateValidationReport();
      
      expect(validationTrace.results.timestamp).toBeDefined();
      expect(validationTrace.results.testProject).toBeDefined();
      expect(validationTrace.results.spellCheckValidation).toBeDefined();
      expect(validationTrace.results.zeroArtifactValidation).toBeDefined();
      expect(validationTrace.results.boyScoutPrincipleValidation).toBeDefined();
      expect(validationTrace.results.helpfulAssistantValidation).toBeDefined();
    });
    
    it('should determine overall status correctly', async () => {
      // Test with all validations passing
      validationTrace.results.spellCheckValidation = { status: 'PASSED' };
      validationTrace.results.zeroArtifactValidation = { status: 'PASSED' };
      validationTrace.results.boyScoutPrincipleValidation = { status: 'PASSED' };
      validationTrace.results.helpfulAssistantValidation = { status: 'PASSED' };
      
      await validationTrace.generateValidationReport();
      expect(validationTrace.results.overallStatus).toBe('PASSED');
    });
  });
});

describe('🔍 Spell Check Helper Functions', () => {
  let validationTrace;
  
  beforeEach(() => {
    validationTrace = new AlexAIValidationTrace();
  });
  
  describe('isWordCorrect', () => {
    it('should correctly identify correct words', () => {
      const correctWords = ['hello', 'receive', 'the', 'separate'];
      correctWords.forEach(word => {
        expect(validationTrace.isWordCorrect(word)).toBe(true);
      });
    });
    
    it('should correctly identify misspelled words', () => {
      const misspelledWords = ['helo', 'recieve', 'teh', 'seperate'];
      misspelledWords.forEach(word => {
        expect(validationTrace.isWordCorrect(word)).toBe(false);
      });
    });
  });
  
  describe('getSuggestions', () => {
    it('should provide appropriate suggestions for misspelled words', () => {
      const testCases = [
        { word: 'helo', expected: ['hello', 'help'] },
        { word: 'recieve', expected: ['receive'] },
        { word: 'teh', expected: ['the'] }
      ];
      
      testCases.forEach(({ word, expected }) => {
        const suggestions = validationTrace.getSuggestions(word);
        expect(suggestions).toEqual(expect.arrayContaining(expected));
      });
    });
    
    it('should return empty array for unknown words', () => {
      const suggestions = validationTrace.getSuggestions('unknownword');
      expect(suggestions).toEqual([]);
    });
  });
  
  describe('isTechnicalTerm', () => {
    it('should recognize technical terms', () => {
      const technicalTerms = ['alex-ai', 'typescript', 'javascript', 'react'];
      technicalTerms.forEach(term => {
        expect(validationTrace.isTechnicalTerm(term)).toBe(true);
      });
    });
    
    it('should not recognize non-technical terms', () => {
      const nonTechnicalTerms = ['hello', 'world', 'test', 'example'];
      nonTechnicalTerms.forEach(term => {
        expect(validationTrace.isTechnicalTerm(term)).toBe(false);
      });
    });
  });
});

describe('🛡️ Zero-Artifact Helper Functions', () => {
  let validationTrace;
  
  beforeEach(() => {
    validationTrace = new AlexAIValidationTrace();
  });
  
  describe('compareProjectStates', () => {
    it('should correctly compare identical project states', () => {
      const state1 = {
        files: ['file1.js', 'file2.js'],
        directories: ['src', 'dist']
      };
      const state2 = {
        files: ['file1.js', 'file2.js'],
        directories: ['src', 'dist']
      };
      
      const comparison = validationTrace.compareProjectStates(state1, state2);
      expect(comparison.identical).toBe(true);
      expect(comparison.filesChanged).toBe(false);
      expect(comparison.directoriesChanged).toBe(false);
    });
    
    it('should correctly identify different project states', () => {
      const state1 = {
        files: ['file1.js', 'file2.js'],
        directories: ['src', 'dist']
      };
      const state2 = {
        files: ['file1.js', 'file2.js', 'file3.js'],
        directories: ['src', 'dist', 'build']
      };
      
      const comparison = validationTrace.compareProjectStates(state1, state2);
      expect(comparison.identical).toBe(false);
      expect(comparison.filesChanged).toBe(true);
      expect(comparison.directoriesChanged).toBe(true);
    });
  });
});
