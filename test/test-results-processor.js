/**
 * Alex AI Jest Results Processor
 * --------------------------------
 * Captures Jest output and writes a structured summary that the crew
 * automation, RAG pipelines, and dashboard tooling can ingest later.
 *
 * Zero-artifact guarantee: all artifacts live inside `validation-results/`
 * which is already tracked for automated validation snapshots.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const OUTPUT_DIRECTORY = path.join(process.cwd(), 'validation-results');

function formatTestCase(testCase) {
  return {
    title: testCase.fullName,
    status: testCase.status,
    durationMs: testCase.duration ?? null,
    failureMessages: Array.isArray(testCase.failureMessages) ? testCase.failureMessages : []
  };
}

function formatSuite(suite) {
  return {
    path: suite.testFilePath,
    status: suite.status,
    durationMs: suite.perfStats ? suite.perfStats.runtime : null,
    assertionSummary: {
      passed: suite.numPassingTests,
      failed: suite.numFailingTests,
      skipped: suite.numPendingTests,
      todo: suite.numTodoTests
    },
    tests: (suite.testResults || []).map(formatTestCase)
  };
}

function buildSummary(results) {
  return {
    generatedAt: new Date().toISOString(),
    success: results.success,
    stats: {
      totalTests: results.numTotalTests,
      passedTests: results.numPassedTests,
      failedTests: results.numFailedTests,
      pendingTests: results.numPendingTests,
      runtimeMs: results.testResults.reduce(
        (total, suite) => total + (suite.perfStats ? suite.perfStats.runtime : 0),
        0
      )
    },
    suites: (results.testResults || []).map(formatSuite)
  };
}

module.exports = async function alexAIResultsProcessor(results) {
  try {
    if (!fs.existsSync(OUTPUT_DIRECTORY)) {
      fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
    }

    const summary = buildSummary(results);
    const fileName = `jest-results-${Date.now()}.json`;
    const filePath = path.join(OUTPUT_DIRECTORY, fileName);

    fs.writeFileSync(filePath, JSON.stringify(summary, null, 2), 'utf8');

    console.log('\n🧪 Alex AI Jest Summary saved to', filePath);
    console.log(
      `   • Passed: ${summary.stats.passedTests}  Failed: ${summary.stats.failedTests}  Total: ${summary.stats.totalTests}`
    );
  } catch (error) {
    console.warn('⚠️  Failed to persist Jest results summary:', error.message);
  }

  return results;
};

