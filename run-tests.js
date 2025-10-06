#!/usr/bin/env node

/**
 * ALEX AI E2E TEST RUNNER
 * Simple script to run tests with different options
 */

const { E2ETestingFramework } = require('./e2e-testing-framework');
const readline = require('readline');

class TestRunner {
  constructor() {
    this.framework = new E2ETestingFramework();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async showMenu() {
    console.log('🚀 ALEX AI E2E TEST RUNNER');
    console.log('==========================');
    console.log('');
    console.log('Choose an option:');
    console.log('1. Run complete test suite');
    console.log('2. Run single custom test');
    console.log('3. Interactive testing mode');
    console.log('4. Run specific test scenario');
    console.log('5. Performance testing');
    console.log('6. Exit');
    console.log('');

    this.rl.question('Enter your choice (1-6): ', async (choice) => {
      await this.handleChoice(choice);
    });
  }

  async handleChoice(choice) {
    switch (choice) {
      case '1':
        await this.runCompleteSuite();
        break;
      case '2':
        await this.runCustomTest();
        break;
      case '3':
        await this.runInteractiveMode();
        break;
      case '4':
        await this.runSpecificScenario();
        break;
      case '5':
        await this.runPerformanceTest();
        break;
      case '6':
        console.log('🖖 Live long and prosper!');
        this.rl.close();
        return;
      default:
        console.log('❌ Invalid choice. Please try again.');
        await this.showMenu();
        return;
    }
  }

  async runCompleteSuite() {
    console.log('🧪 Running complete test suite...');
    console.log('');
    await this.framework.runTestSuite();
    console.log('');
    await this.showMenu();
  }

  async runCustomTest() {
    this.rl.question('Enter your test input: ', async (input) => {
      if (!input.trim()) {
        console.log('❌ Input cannot be empty.');
        await this.showMenu();
        return;
      }
      
      console.log('');
      console.log('🧪 Running custom test...');
      console.log('');
      await this.framework.runE2ETest(input, 'custom_test');
      console.log('');
      await this.showMenu();
    });
  }

  async runInteractiveMode() {
    console.log('🎭 Interactive testing mode activated!');
    console.log('Type "exit" to return to menu.');
    console.log('');

    const askForInput = () => {
      this.rl.question('Enter test input (or "exit"): ', async (input) => {
        if (input.toLowerCase() === 'exit') {
          await this.showMenu();
          return;
        }
        
        if (!input.trim()) {
          console.log('❌ Input cannot be empty.');
          askForInput();
          return;
        }
        
        console.log('');
        console.log('🧪 Running interactive test...');
        console.log('');
        await this.framework.runE2ETest(input, 'interactive_test');
        console.log('');
        askForInput();
      });
    };

    askForInput();
  }

  async runSpecificScenario() {
    console.log('Available test scenarios:');
    console.log('1. technical_debugging');
    console.log('2. performance_optimization');
    console.log('3. security_implementation');
    console.log('4. ux_improvement');
    console.log('5. business_optimization');
    console.log('');

    this.rl.question('Enter scenario name: ', async (scenario) => {
      const testInputs = {
        'technical_debugging': "Help me debug this React component that's not rendering properly",
        'performance_optimization': "What's the best way to optimize our database queries for better performance?",
        'security_implementation': "I need to implement secure authentication for our web application",
        'ux_improvement': "How can we improve our user experience design?",
        'business_optimization': "What's the most cost-effective way to scale our infrastructure?"
      };

      const input = testInputs[scenario];
      if (!input) {
        console.log('❌ Invalid scenario. Please try again.');
        await this.showMenu();
        return;
      }

      console.log('');
      console.log(`🧪 Running ${scenario} scenario...`);
      console.log('');
      await this.framework.runE2ETest(input, scenario);
      console.log('');
      await this.showMenu();
    });
  }

  async runPerformanceTest() {
    console.log('⚡ Running performance test...');
    console.log('This will run multiple tests to measure performance.');
    console.log('');

    const testInputs = [
      "Help me optimize my React application",
      "What's the best way to implement authentication?",
      "How can I improve my database performance?",
      "What are the best practices for API design?",
      "How do I implement proper error handling?"
    ];

    const results = [];
    const startTime = Date.now();

    for (let i = 0; i < testInputs.length; i++) {
      console.log(`🎯 Performance Test ${i + 1}/${testInputs.length}`);
      const result = await this.framework.runE2ETest(testInputs[i], `perf_test_${i + 1}`);
      results.push(result);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const successfulTests = results.filter(r => r.success).length;

    console.log('');
    console.log('📊 PERFORMANCE TEST RESULTS');
    console.log('============================');
    console.log(`Total Tests: ${results.length}`);
    console.log(`Successful: ${successfulTests}`);
    console.log(`Failed: ${results.length - successfulTests}`);
    console.log(`Total Time: ${totalTime}ms`);
    console.log(`Average Time per Test: ${Math.round(totalTime / results.length)}ms`);
    console.log(`Success Rate: ${((successfulTests / results.length) * 100).toFixed(1)}%`);
    console.log('');

    await this.showMenu();
  }
}

// Run the test runner
async function main() {
  const runner = new TestRunner();
  await runner.showMenu();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TestRunner };



