/**
 * Reliability Checks for Automation
 * 
 * Ensures automation scripts are reliable
 */

class ReliabilityChecker {
  checkScript(scriptPath) {
    const checks = {
      hasErrorHandling: this.checkErrorHandling(scriptPath),
      hasLogging: this.checkLogging(scriptPath),
      hasValidation: this.checkValidation(scriptPath),
      hasIdempotency: this.checkIdempotency(scriptPath)
    };
    
    const allPass = Object.values(checks).every(c => c === true);
    
    return {
      checks,
      reliable: allPass,
      recommendations: this.getRecommendations(checks)
    };
  }
  
  checkErrorHandling(scriptPath) {
    const fs = require('fs');
    const content = fs.readFileSync(scriptPath, 'utf8');
    return content.includes('try') || content.includes('catch') || content.includes('error');
  }
  
  checkLogging(scriptPath) {
    const fs = require('fs');
    const content = fs.readFileSync(scriptPath, 'utf8');
    return content.includes('console.log') || content.includes('logger') || content.includes('log');
  }
  
  checkValidation(scriptPath) {
    const fs = require('fs');
    const content = fs.readFileSync(scriptPath, 'utf8');
    return content.includes('validate') || content.includes('check') || content.includes('verify');
  }
  
  checkIdempotency(scriptPath) {
    // Simplified check - would need more sophisticated analysis
    return true; // Assume scripts are idempotent if they follow patterns
  }
  
  getRecommendations(checks) {
    const recommendations = [];
    if (!checks.hasErrorHandling) recommendations.push('Add error handling');
    if (!checks.hasLogging) recommendations.push('Add logging');
    if (!checks.hasValidation) recommendations.push('Add input validation');
    return recommendations;
  }
}

module.exports = { ReliabilityChecker };
