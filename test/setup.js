/**
 * 🛡️ Alex AI Test Setup
 * 
 * Global test setup and configuration
 */

// Global test timeout
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Create temporary directory for tests
  createTempDir: () => {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    const tempDir = path.join(os.tmpdir(), `alex-ai-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    return tempDir;
  },
  
  // Clean up temporary directory
  cleanupTempDir: (dir) => {
    const fs = require('fs');
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  },
  
  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Capture console output
  captureConsole: () => {
    const originalConsole = { ...console };
    const output = { logs: [], errors: [], warns: [] };
    
    console.log = (...args) => output.logs.push(args.join(' '));
    console.error = (...args) => output.errors.push(args.join(' '));
    console.warn = (...args) => output.warns.push(args.join(' '));
    
    return {
      output,
      restore: () => {
        Object.assign(console, originalConsole);
      }
    };
  }
};

// Global test data
global.testData = {
  spellCheckWords: [
    'helo', 'recieve', 'teh', 'alot', 'seperate',
    'occured', 'definately', 'accomodate', 'embarass',
    'neccessary', 'occassion', 'priviledge', 'seperate'
  ],
  technicalTerms: [
    'alex-ai', 'cursor-ai', 'typescript', 'javascript',
    'react', 'vue', 'angular', 'nodejs', 'npm',
    'vscode', 'git', 'github', 'docker', 'kubernetes'
  ],
  testProjectFiles: {
    'README.md': '# Testing Project\n\nThis is a test project for Alex AI validation.',
    'package.json': JSON.stringify({
      name: 'testing-project',
      version: '1.0.0',
      description: 'Test project for Alex AI validation',
      main: 'src/index.js',
      scripts: {
        start: 'node src/index.js',
        test: 'echo "No tests specified"'
      }
    }, null, 2),
    'src/index.js': `// Testing Project Entry Point
console.log('Hello World!');

function greetUser(name) {
  return \`Hello, \${name}!\`;
}

module.exports = { greetUser };`,
    'src/utils.js': `// Utility Functions
function formatDate(date) {
  return date.toISOString();
}

function validateEmail(email) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}

module.exports = { formatDate, validateEmail };`
  }
};

// Global test expectations
global.expectAlexAI = {
  // Expect no artifacts
  noArtifacts: (initialState, finalState) => {
    const newFiles = finalState.files.filter(file => 
      !initialState.files.includes(file)
    );
    const newDirectories = finalState.directories.filter(dir => 
      !initialState.directories.includes(dir)
    );
    
    expect(newFiles.length).toBe(0);
    expect(newDirectories.length).toBe(0);
  },
  
  // Expect spell check functionality
  spellCheckWorks: (result) => {
    expect(result.highlighted).toBeDefined();
    expect(result.suggestions).toBeDefined();
    expect(result.alexAIBranding).toBe(true);
  },
  
  // Expect technical terms recognized
  technicalTermsRecognized: (result) => {
    expect(result.highlighted).toBe(false);
    expect(result.recognized).toBe(true);
  },
  
  // Expect Boy Scout principle
  boyScoutPrinciple: (comparison) => {
    expect(comparison.identical).toBe(true);
    expect(comparison.filesChanged).toBe(false);
    expect(comparison.directoriesChanged).toBe(false);
  }
};

// Global test hooks
beforeAll(() => {
  console.log('🛡️ Alex AI Test Suite Starting...');
});

afterAll(() => {
  console.log('✅ Alex AI Test Suite Complete!');
});

beforeEach(() => {
  // Reset any global state if needed
});

afterEach(() => {
  // Cleanup after each test
});
