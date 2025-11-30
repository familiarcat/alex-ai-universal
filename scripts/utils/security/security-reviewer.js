/**
 * Security Review for Automation Scripts
 * 
 * Reviews scripts for security best practices
 */

const { SecurityUtils } = require('../../../packages/shared-utilities/src/security');

class SecurityReviewer {
  reviewScript(scriptPath) {
    const fs = require('fs');
    const content = fs.readFileSync(scriptPath, 'utf8');
    
    const checks = {
      noHardcodedCredentials: !this.hasHardcodedCredentials(content),
      usesSecureCredentials: this.usesSecureCredentials(content),
      sanitizesOutput: this.sanitizesOutput(content),
      validatesInput: this.validatesInput(content)
    };
    
    const allPass = Object.values(checks).every(c => c === true);
    
    return {
      checks,
      secure: allPass,
      recommendations: this.getRecommendations(checks)
    };
  }
  
  hasHardcodedCredentials(content) {
    const patterns = [
      /password\s*=\s*["'][^"']+["']/i,
      /api[_-]?key\s*=\s*["'][^"']+["']/i,
      /secret\s*=\s*["'][^"']+["']/i
    ];
    return patterns.some(pattern => pattern.test(content));
  }
  
  usesSecureCredentials(content) {
    return content.includes('process.env') || content.includes('SecurityUtils');
  }
  
  sanitizesOutput(content) {
    return content.includes('sanitize') || content.includes('SecurityUtils.sanitize');
  }
  
  validatesInput(content) {
    return content.includes('validate') || content.includes('check');
  }
  
  getRecommendations(checks) {
    const recommendations = [];
    if (checks.hasHardcodedCredentials) recommendations.push('Remove hardcoded credentials');
    if (!checks.usesSecureCredentials) recommendations.push('Use secure credential loading');
    if (!checks.sanitizesOutput) recommendations.push('Sanitize output to prevent credential leaks');
    if (!checks.validatesInput) recommendations.push('Add input validation');
    return recommendations;
  }
}

module.exports = { SecurityReviewer };
