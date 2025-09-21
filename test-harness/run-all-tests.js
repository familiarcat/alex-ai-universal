#!/usr/bin/env node

/**
 * Alex AI Universal Test Runner
 * 
 * Master test harness that runs all Alex AI tests:
 * - CLI Interface Tests
 * - VSCode Extension Tests
 * - Cursor AI Extension Tests
 * - Web Interface Tests
 * - Core Library Tests
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Import test modules
const AlexAITestSuite = require('./alex-ai-test-suite');
const AlexAICLITest = require('./cli-test');
const AlexAIExtensionTest = require('./extension-test');
const AlexAIWebInterfaceTest = require('./web-interface-test');

class AlexAIUniversalTestRunner {
  constructor() {
    this.projectRoot = process.cwd();
    this.testSuites = [];
    this.overallResults = {
      totalPassed: 0,
      totalFailed: 0,
      totalTests: 0,
      successRate: 0,
      testSuites: []
    };
  }

  async runAllTests() {
    console.log(chalk.blue.bold('\n🚀 Alex AI Universal Test Runner'));
    console.log(chalk.gray('====================================\n'));

    try {
      // Run comprehensive test suite
      console.log(chalk.yellow('🧪 Running Comprehensive Test Suite...'));
      const comprehensiveTest = new AlexAITestSuite();
      await comprehensiveTest.runAllTests();
      this.recordTestSuite('Comprehensive', comprehensiveTest.testResults);

      // Run CLI tests
      console.log(chalk.yellow('\n🧪 Running CLI Interface Tests...'));
      const cliTest = new AlexAICLITest();
      await cliTest.runAllTests();
      this.recordTestSuite('CLI', cliTest.testResults);

      // Run extension tests
      console.log(chalk.yellow('\n🧪 Running Extension Tests...'));
      const extensionTest = new AlexAIExtensionTest();
      await extensionTest.runAllTests();
      this.recordTestSuite('Extensions', extensionTest.testResults);

      // Run web interface tests
      console.log(chalk.yellow('\n🧪 Running Web Interface Tests...'));
      const webTest = new AlexAIWebInterfaceTest();
      await webTest.runAllTests();
      this.recordTestSuite('Web Interface', webTest.testResults);

      // Generate comprehensive report
      this.generateComprehensiveReport();

    } catch (error) {
      console.error(chalk.red('❌ Test runner failed:'), error.message);
      process.exit(1);
    }
  }

  recordTestSuite(suiteName, results) {
    const passed = results.passed || results.filter(r => r.success).length;
    const failed = results.failed || results.filter(r => !r.success).length;
    const total = passed + failed;

    this.overallResults.totalPassed += passed;
    this.overallResults.totalFailed += failed;
    this.overallResults.totalTests += total;

    this.overallResults.testSuites.push({
      name: suiteName,
      passed,
      failed,
      total,
      successRate: total > 0 ? ((passed / total) * 100).toFixed(1) : 0
    });
  }

  generateComprehensiveReport() {
    console.log(chalk.blue.bold('\n📊 Comprehensive Test Results'));
    console.log(chalk.gray('================================\n'));

    // Calculate overall success rate
    this.overallResults.successRate = this.overallResults.totalTests > 0 
      ? ((this.overallResults.totalPassed / this.overallResults.totalTests) * 100).toFixed(1)
      : 0;

    // Display overall results
    console.log(chalk.bold('Overall Results:'));
    console.log(`  Total Passed: ${chalk.green(this.overallResults.totalPassed)}`);
    console.log(`  Total Failed: ${chalk.red(this.overallResults.totalFailed)}`);
    console.log(`  Total Tests: ${chalk.cyan(this.overallResults.totalTests)}`);
    console.log(`  Success Rate: ${chalk.cyan(this.overallResults.successRate)}%\n`);

    // Display test suite results
    console.log(chalk.bold('Test Suite Results:'));
    this.overallResults.testSuites.forEach(suite => {
      const status = suite.successRate >= 80 ? chalk.green('✅') : 
                   suite.successRate >= 60 ? chalk.yellow('⚠️') : 
                   chalk.red('❌');
      
      console.log(`  ${status} ${suite.name}: ${chalk.green(suite.passed)}/${chalk.red(suite.failed)} (${chalk.cyan(suite.successRate)}%)`);
    });

    // Display recommendations
    this.displayRecommendations();

    // Save comprehensive report
    this.saveComprehensiveReport();
  }

  displayRecommendations() {
    console.log(chalk.blue.bold('\n💡 Recommendations:'));
    
    if (this.overallResults.successRate >= 90) {
      console.log(chalk.green('  🎉 Excellent! Alex AI is ready for production deployment.'));
      console.log(chalk.green('  🚀 All interfaces are working correctly.'));
    } else if (this.overallResults.successRate >= 80) {
      console.log(chalk.yellow('  ⚠️  Good! Alex AI is mostly ready with minor issues.'));
      console.log(chalk.yellow('  🔧 Fix the failing tests before production deployment.'));
    } else if (this.overallResults.successRate >= 60) {
      console.log(chalk.yellow('  ⚠️  Fair! Alex AI needs significant fixes.'));
      console.log(chalk.yellow('  🛠️  Address the failing tests before deployment.'));
    } else {
      console.log(chalk.red('  ❌ Poor! Alex AI needs major fixes.'));
      console.log(chalk.red('  🚨 Do not deploy until critical issues are resolved.'));
    }

    // Specific recommendations based on test suite results
    this.overallResults.testSuites.forEach(suite => {
      if (suite.successRate < 80) {
        console.log(chalk.red(`  🔧 Fix issues in ${suite.name} test suite`));
      }
    });
  }

  saveComprehensiveReport() {
    const reportPath = path.join(this.projectRoot, 'comprehensive-test-results.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPassed: this.overallResults.totalPassed,
        totalFailed: this.overallResults.totalFailed,
        totalTests: this.overallResults.totalTests,
        successRate: parseFloat(this.overallResults.successRate)
      },
      testSuites: this.overallResults.testSuites,
      recommendations: this.getRecommendations()
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.gray(`\n📄 Comprehensive report saved to: ${reportPath}`));
  }

  getRecommendations() {
    const recommendations = [];
    
    if (this.overallResults.successRate >= 90) {
      recommendations.push('Alex AI is ready for production deployment');
      recommendations.push('All interfaces are working correctly');
    } else if (this.overallResults.successRate >= 80) {
      recommendations.push('Fix minor issues before production deployment');
      recommendations.push('Address failing tests in specific test suites');
    } else if (this.overallResults.successRate >= 60) {
      recommendations.push('Address significant issues before deployment');
      recommendations.push('Focus on failing test suites');
    } else {
      recommendations.push('Do not deploy until critical issues are resolved');
      recommendations.push('Major fixes required across multiple test suites');
    }

    return recommendations;
  }
}

// Run all tests
if (require.main === module) {
  const testRunner = new AlexAIUniversalTestRunner();
  testRunner.runAllTests().catch(console.error);
}

module.exports = AlexAIUniversalTestRunner;


