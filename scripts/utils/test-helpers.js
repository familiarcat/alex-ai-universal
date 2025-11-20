/**
 * 🧪 Test Helper Utilities
 * 
 * Shared utilities for E2E tests:
 * - Retry logic with exponential backoff
 * - Error message formatting
 * - Test result reporting
 */

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Result of function
 */
async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    retryableErrors = [429, 500, 502, 503, 504],
    onRetry = null
  } = options;

  let lastError;
  let currentDelay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if error is retryable
      const status = error.status || error.response?.status || error.code;
      const isRetryable = retryableErrors.includes(status) || 
                         error.message?.includes('timeout') ||
                         error.message?.includes('ECONNRESET');

      if (!isRetryable || attempt >= maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(currentDelay, maxDelay);
      
      if (onRetry) {
        onRetry(attempt, maxRetries, delay, error);
      } else {
        console.log(`   ⏳ Retry ${attempt}/${maxRetries} after ${delay/1000}s... (${error.message || status})`);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      currentDelay *= backoffMultiplier;
    }
  }

  throw lastError;
}

/**
 * Format error message with actionable steps
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 * @returns {string} Formatted error message
 */
function formatErrorMessage(error, context = {}) {
  const status = error.status || error.response?.status || error.code;
  const message = error.message || error.response?.data?.message || 'Unknown error';
  
  let formatted = `❌ Error: ${message}`;
  
  if (status) {
    formatted += ` (Status: ${status})`;
  }

  // Add actionable steps based on error type
  const actionableSteps = [];

  if (status === 404) {
    actionableSteps.push(
      '1. Verify workflow is active in n8n UI',
      '2. Check webhook path is correct',
      '3. Wait 30-60 seconds after workflow activation',
      '4. Run diagnostic: node scripts/diagnose-webhook-registration.js'
    );
  } else if (status === 429) {
    actionableSteps.push(
      '1. Wait 30-60 seconds for rate limit to reset',
      '2. Reduce request frequency',
      '3. Use retry logic with exponential backoff'
    );
  } else if (status === 401 || status === 403) {
    actionableSteps.push(
      '1. Verify N8N_API_KEY is set in ~/.zshrc',
      '2. Check API key has correct permissions',
      '3. Regenerate API key if needed'
    );
  } else if (status >= 500) {
    actionableSteps.push(
      '1. Check n8n container is running',
      '2. Review n8n logs: docker logs n8n',
      '3. Restart n8n container if needed'
    );
  } else if (error.message?.includes('timeout')) {
    actionableSteps.push(
      '1. Check network connectivity',
      '2. Verify n8n instance is accessible',
      '3. Increase timeout if needed'
    );
  }

  if (context.webhookPath) {
    actionableSteps.push(`4. Test webhook directly: curl -X POST ${context.baseUrl || 'https://n8n.pbradygeorgen.com'}/webhook/${context.webhookPath} -H "Content-Type: application/json" -d '{"test": true}'`);
  }

  if (actionableSteps.length > 0) {
    formatted += '\n\n💡 Actionable Steps:\n';
    actionableSteps.forEach(step => {
      formatted += `   ${step}\n`;
    });
  }

  return formatted;
}

/**
 * Create test result summary
 * @param {Array} testResults - Array of test results
 * @returns {Object} Summary object
 */
function createTestSummary(testResults) {
  const summary = {
    total: testResults.length,
    passed: 0,
    failed: 0,
    warnings: 0,
    skipped: 0,
    duration: 0,
    details: []
  };

  testResults.forEach(test => {
    if (test.status === 'passed') {
      summary.passed++;
    } else if (test.status === 'failed') {
      summary.failed++;
    } else if (test.status === 'warning') {
      summary.warnings++;
    } else if (test.status === 'skipped') {
      summary.skipped++;
    }

    if (test.duration) {
      summary.duration += test.duration;
    }

    summary.details.push({
      name: test.name,
      status: test.status,
      duration: test.duration || 0,
      error: test.error || null
    });
  });

  return summary;
}

/**
 * Print test result summary
 * @param {Object} summary - Test summary object
 */
function printTestSummary(summary) {
  console.log('\n' + '═'.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('═'.repeat(80) + '\n');

  console.log(`Total Tests: ${summary.total}`);
  console.log(`✅ Passed: ${summary.passed}`);
  console.log(`❌ Failed: ${summary.failed}`);
  console.log(`⚠️  Warnings: ${summary.warnings}`);
  console.log(`⏭️  Skipped: ${summary.skipped}`);
  
  if (summary.duration > 0) {
    console.log(`⏱️  Duration: ${(summary.duration / 1000).toFixed(2)}s`);
  }

  console.log('');

  if (summary.details.length > 0) {
    console.log('Test Details:');
    summary.details.forEach(detail => {
      const icon = detail.status === 'passed' ? '✅' :
                   detail.status === 'failed' ? '❌' :
                   detail.status === 'warning' ? '⚠️ ' : '⏭️ ';
      console.log(`   ${icon} ${detail.name}`);
      if (detail.error) {
        console.log(`      Error: ${detail.error}`);
      }
      if (detail.duration > 0) {
        console.log(`      Duration: ${(detail.duration / 1000).toFixed(2)}s`);
      }
    });
    console.log('');
  }

  console.log('═'.repeat(80) + '\n');

  // Recommendations
  if (summary.failed > 0) {
    console.log('💡 Recommendations:');
    if (summary.details.some(d => d.error?.includes('404'))) {
      console.log('   • Some tests failed due to webhook registration issues');
      console.log('   • Run: node scripts/diagnose-webhook-registration.js');
      console.log('   • Verify workflows are active in n8n UI\n');
    }
    if (summary.details.some(d => d.error?.includes('429'))) {
      console.log('   • Rate limiting detected - wait 30-60 seconds and retry\n');
    }
  }

  // Final status
  if (summary.failed === 0 && summary.warnings === 0) {
    console.log('🎉 All tests passed!\n');
  } else if (summary.failed === 0) {
    console.log('✅ All tests passed with warnings\n');
  } else {
    console.log(`❌ ${summary.failed} test(s) failed\n`);
  }
}

module.exports = {
  retryWithBackoff,
  formatErrorMessage,
  createTestSummary,
  printTestSummary
};

