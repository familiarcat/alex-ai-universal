#!/usr/bin/env node
/**
 * Security Memory Guard
 * 
 * Prevents sensitive information from being stored in Supabase memories
 * Includes comprehensive detection patterns and sanitization
 */

class SecurityMemoryGuard {
  constructor() {
    this.secretPatterns = this.initializeSecretPatterns();
    this.clientPatterns = this.initializeClientPatterns();
    this.industryPatterns = this.initializeIndustryPatterns();
    this.warningThreshold = 0.7; // Confidence threshold for warnings
  }

  initializeSecretPatterns() {
    return {
      // API Keys and Tokens
      apiKeys: [
        /api[_-]?key/i,
        /access[_-]?token/i,
        /bearer[_-]?token/i,
        /auth[_-]?token/i,
        /jwt[_-]?token/i,
        /oauth[_-]?token/i,
        /refresh[_-]?token/i,
        /session[_-]?token/i,
        /secret[_-]?key/i,
        /private[_-]?key/i,
        /public[_-]?key/i
      ],
      
      // Database Credentials
      database: [
        /database[_-]?url/i,
        /db[_-]?url/i,
        /connection[_-]?string/i,
        /mongodb[_-]?uri/i,
        /postgres[_-]?url/i,
        /mysql[_-]?url/i,
        /redis[_-]?url/i,
        /database[_-]?password/i,
        /db[_-]?password/i
      ],
      
      // Cloud Service Credentials
      cloud: [
        /aws[_-]?access[_-]?key/i,
        /aws[_-]?secret[_-]?key/i,
        /azure[_-]?key/i,
        /gcp[_-]?key/i,
        /google[_-]?api[_-]?key/i,
        /firebase[_-]?key/i,
        /stripe[_-]?key/i,
        /paypal[_-]?key/i,
        /twilio[_-]?key/i,
        /sendgrid[_-]?key/i
      ],
      
      // Environment Variables
      environment: [
        /process\.env\./i,
        /env\[/i,
        /getenv\(/i,
        /\.env/i
      ],
      
      // File Paths with Secrets
      filePaths: [
        /\.env/i,
        /config[_-]?secret/i,
        /secret[_-]?config/i,
        /credentials/i,
        /keys[_-]?file/i,
        /private[_-]?key/i,
        /\.pem$/i,
        /\.key$/i,
        /\.p12$/i,
        /\.pfx$/i
      ],
      
      // Common Secret Formats
      formats: [
        /[A-Za-z0-9+/]{40,}={0,2}/, // Base64 encoded secrets
        /[A-Fa-f0-9]{32,}/, // Hex encoded secrets
        /sk_[A-Za-z0-9]{24,}/, // Stripe keys
        /pk_[A-Za-z0-9]{24,}/, // Stripe keys
        /[A-Za-z0-9]{20,}_[A-Za-z0-9]{20,}/, // Common key patterns
        /[A-Za-z0-9]{32,}/, // Long alphanumeric strings
        /[A-Za-z0-9]{40,}/, // Very long alphanumeric strings
        /[A-Za-z0-9]{64,}/  // Very long alphanumeric strings
      ]
    };
  }

  initializeClientPatterns() {
    return {
      // Client Information
      clientData: [
        /client[_-]?id/i,
        /client[_-]?secret/i,
        /client[_-]?name/i,
        /customer[_-]?id/i,
        /user[_-]?id/i,
        /account[_-]?id/i,
        /organization[_-]?id/i,
        /company[_-]?id/i,
        /business[_-]?id/i
      ],
      
      // Personal Information
      personal: [
        /ssn/i,
        /social[_-]?security/i,
        /tax[_-]?id/i,
        /ein/i,
        /passport/i,
        /driver[_-]?license/i,
        /credit[_-]?card/i,
        /bank[_-]?account/i,
        /routing[_-]?number/i,
        /account[_-]?number/i
      ],
      
      // Contact Information
      contact: [
        /phone[_-]?number/i,
        /email[_-]?address/i,
        /home[_-]?address/i,
        /billing[_-]?address/i,
        /shipping[_-]?address/i,
        /zip[_-]?code/i,
        /postal[_-]?code/i
      ]
    };
  }

  initializeIndustryPatterns() {
    return {
      // Financial Information
      financial: [
        /revenue/i,
        /profit/i,
        /loss/i,
        /budget/i,
        /cost[_-]?center/i,
        /financial[_-]?statement/i,
        /balance[_-]?sheet/i,
        /income[_-]?statement/i,
        /cash[_-]?flow/i,
        /roi/i,
        /kpi/i,
        /metrics/i
      ],
      
      // Business Strategy
      strategy: [
        /business[_-]?plan/i,
        /strategy/i,
        /roadmap/i,
        /milestone/i,
        /goal/i,
        /objective/i,
        /target/i,
        /forecast/i,
        /projection/i,
        /timeline/i
      ],
      
      // Intellectual Property
      intellectual: [
        /patent/i,
        /trademark/i,
        /copyright/i,
        /proprietary/i,
        /confidential/i,
        /trade[_-]?secret/i,
        /algorithm/i,
        /formula/i,
        /recipe/i,
        /process/i
      ],
      
      // Legal Information
      legal: [
        /contract/i,
        /agreement/i,
        /nda/i,
        /non[_-]?disclosure/i,
        /terms[_-]?of[_-]?service/i,
        /privacy[_-]?policy/i,
        /legal[_-]?document/i,
        /litigation/i,
        /lawsuit/i,
        /settlement/i
      ]
    };
  }

  async scanContent(content, context = {}) {
    const results = {
      isSafe: true,
      warnings: [],
      blocked: false,
      sanitizedContent: content,
      confidence: 0,
      detectedPatterns: [],
      redactionApplied: false,
      learningData: {
        clientType: null,
        businessType: null,
        financialMetrics: null,
        strategyElements: null
      }
    };

    if (!content || typeof content !== 'string') {
      return results;
    }

    // Check for secret patterns (ALWAYS BLOCK)
    const secretResults = this.checkSecretPatterns(content);
    if (secretResults.detected) {
      results.isSafe = false;
      results.blocked = true;
      results.warnings.push(`🚨 SECURITY ALERT: Secrets detected - BLOCKED: ${secretResults.patterns.join(', ')}`);
      results.detectedPatterns.push(...secretResults.patterns);
      results.sanitizedContent = this.sanitizeContent(content, secretResults.patterns);
      return results; // Block immediately for secrets
    }

    // Check for client patterns (REDACT with learning)
    const clientResults = this.checkClientPatterns(content);
    if (clientResults.detected) {
      results.warnings.push(`⚠️  CLIENT DATA WARNING: Client information detected - will be redacted`);
      results.detectedPatterns.push(...clientResults.patterns);
      results.confidence += 0.2;
      
      // Extract learning data while redacting sensitive info
      const learningData = this.extractClientLearningData(content);
      results.learningData = { ...results.learningData, ...learningData };
      results.redactionApplied = true;
    }

    // Check for financial patterns (REDACT with learning)
    const financialResults = this.checkFinancialPatterns(content);
    if (financialResults.detected) {
      results.warnings.push(`⚠️  FINANCIAL DATA WARNING: Financial information detected - will be redacted`);
      results.detectedPatterns.push(...financialResults.patterns);
      results.confidence += 0.3;
      
      // Extract financial metrics while redacting client info
      const financialData = this.extractFinancialLearningData(content);
      results.learningData = { ...results.learningData, ...financialData };
      results.redactionApplied = true;
    }

    // Check for business strategy patterns (REDACT with learning)
    const strategyResults = this.checkStrategyPatterns(content);
    if (strategyResults.detected) {
      results.warnings.push(`⚠️  STRATEGY DATA WARNING: Business strategy detected - will be redacted`);
      results.detectedPatterns.push(...strategyResults.patterns);
      results.confidence += 0.2;
      
      // Extract strategy elements while redacting client info
      const strategyData = this.extractStrategyLearningData(content);
      results.learningData = { ...results.learningData, ...strategyData };
      results.redactionApplied = true;
    }

    // Apply intelligent redaction if needed
    if (results.redactionApplied) {
      results.sanitizedContent = this.applyIntelligentRedaction(content, results.learningData);
    }

    // Calculate overall confidence
    results.confidence = Math.min(results.confidence, 1.0);

    // Only block if it's pure secrets (already handled above)
    // Financial and strategy data gets redacted, not blocked
    if (results.confidence >= this.warningThreshold && !results.redactionApplied) {
      results.isSafe = false;
      results.blocked = true;
    }

    return results;
  }

  checkSecretPatterns(content) {
    let detected = false;
    const patterns = [];

    for (const [category, regexList] of Object.entries(this.secretPatterns)) {
      for (const regex of regexList) {
        if (regex.test(content)) {
          detected = true;
          patterns.push(`${category}: ${regex.source}`);
        }
      }
    }

    return {
      detected,
      patterns
    };
  }

  checkClientPatterns(content) {
    let detected = false;
    const patterns = [];

    for (const [category, regexList] of Object.entries(this.clientPatterns)) {
      for (const regex of regexList) {
        if (regex.test(content)) {
          detected = true;
          patterns.push(`${category}: ${regex.source}`);
        }
      }
    }

    return {
      detected,
      patterns
    };
  }

  checkIndustryPatterns(content) {
    let detected = false;
    const patterns = [];

    for (const [category, regexList] of Object.entries(this.industryPatterns)) {
      for (const regex of regexList) {
        if (regex.test(content)) {
          detected = true;
          patterns.push(`${category}: ${regex.source}`);
        }
      }
    }

    return {
      detected,
      patterns
    };
  }

  checkFinancialPatterns(content) {
    const financialPatterns = {
      revenue: [/revenue/i, /income/i, /sales/i, /earnings/i],
      profit: [/profit/i, /net[_-]?income/i, /gross[_-]?profit/i],
      budget: [/budget/i, /spending/i, /expenses/i, /costs/i],
      metrics: [/roi/i, /kpi/i, /metrics/i, /performance/i],
      amounts: [/\$[\d,]+/, /[\d,]+[km]?[km]?/i] // $ amounts and large numbers
    };

    let detected = false;
    const patterns = [];

    for (const [category, regexList] of Object.entries(financialPatterns)) {
      for (const regex of regexList) {
        if (regex.test(content)) {
          detected = true;
          patterns.push(`financial: ${category}`);
        }
      }
    }

    return { detected, patterns };
  }

  checkStrategyPatterns(content) {
    const strategyPatterns = {
      business_plan: [/business[_-]?plan/i, /strategic[_-]?plan/i],
      strategy: [/strategy/i, /strategic/i, /approach/i],
      roadmap: [/roadmap/i, /timeline/i, /milestone/i],
      goals: [/goal/i, /objective/i, /target/i],
      growth: [/growth/i, /expansion/i, /scaling/i],
      market: [/market/i, /competition/i, /competitive/i]
    };

    let detected = false;
    const patterns = [];

    for (const [category, regexList] of Object.entries(strategyPatterns)) {
      for (const regex of regexList) {
        if (regex.test(content)) {
          detected = true;
          patterns.push(`strategy: ${category}`);
        }
      }
    }

    return { detected, patterns };
  }

  extractClientLearningData(content) {
    const learningData = {
      clientType: null,
      businessType: null
    };

    // Extract client type patterns
    const clientTypePatterns = [
      /(marketing[_-]?firm|marketing[_-]?agency)/i,
      /(tech[_-]?company|technology[_-]?firm)/i,
      /(consulting[_-]?firm|consulting[_-]?company)/i,
      /(startup|start[_-]?up)/i,
      /(enterprise|enterprise[_-]?company)/i,
      /(non[_-]?profit|nonprofit)/i,
      /(e[_-]?commerce|ecommerce)/i,
      /(saas|software[_-]?as[_-]?a[_-]?service)/i,
      /(fintech|financial[_-]?technology)/i,
      /(healthtech|health[_-]?technology)/i,
      /(edtech|education[_-]?technology)/i,
      /(retail[_-]?company|retailer)/i,
      /(manufacturing[_-]?company|manufacturer)/i,
      /(service[_-]?company|service[_-]?provider)/i
    ];

    for (const pattern of clientTypePatterns) {
      const match = content.match(pattern);
      if (match) {
        learningData.clientType = match[1] || match[0];
        break;
      }
    }

    // Extract business type patterns
    const businessTypePatterns = [
      /(b2b|business[_-]?to[_-]?business)/i,
      /(b2c|business[_-]?to[_-]?consumer)/i,
      /(b2g|business[_-]?to[_-]?government)/i,
      /(saas|subscription[_-]?based)/i,
      /(marketplace|platform)/i,
      /(e[_-]?commerce|online[_-]?retail)/i,
      /(consulting|professional[_-]?services)/i,
      /(agency|creative[_-]?services)/i
    ];

    for (const pattern of businessTypePatterns) {
      const match = content.match(pattern);
      if (match) {
        learningData.businessType = match[1] || match[0];
        break;
      }
    }

    return learningData;
  }

  extractFinancialLearningData(content) {
    const financialData = {
      financialMetrics: {}
    };

    // Extract revenue patterns
    const revenueMatch = content.match(/(?:revenue|income|sales)[:\s]*\$?([\d,]+(?:[km]?[km]?)?)/i);
    if (revenueMatch) {
      financialData.financialMetrics.revenue = revenueMatch[1];
    }

    // Extract profit patterns
    const profitMatch = content.match(/(?:profit|net[_-]?income)[:\s]*\$?([\d,]+(?:[km]?[km]?)?)/i);
    if (profitMatch) {
      financialData.financialMetrics.profit = profitMatch[1];
    }

    // Extract budget patterns
    const budgetMatch = content.match(/(?:budget|spending)[:\s]*\$?([\d,]+(?:[km]?[km]?)?)/i);
    if (budgetMatch) {
      financialData.financialMetrics.budget = budgetMatch[1];
    }

    // Extract ROI patterns
    const roiMatch = content.match(/(?:roi|return[_-]?on[_-]?investment)[:\s]*([\d.]+%?)/i);
    if (roiMatch) {
      financialData.financialMetrics.roi = roiMatch[1];
    }

    return financialData;
  }

  extractStrategyLearningData(content) {
    const strategyData = {
      strategyElements: []
    };

    // Extract strategy elements
    const strategyKeywords = [
      'business_plan', 'strategy', 'roadmap', 'goals', 'growth', 'market',
      'expansion', 'scaling', 'competitive', 'positioning', 'differentiation'
    ];

    for (const keyword of strategyKeywords) {
      const pattern = new RegExp(keyword, 'i');
      if (pattern.test(content)) {
        strategyData.strategyElements.push(keyword);
      }
    }

    return strategyData;
  }

  applyIntelligentRedaction(content, learningData) {
    let redactedContent = content;

    // Redact specific client information while preserving client type
    const clientInfoPatterns = [
      /client[:\s]+[A-Za-z0-9\s]+(?:inc|llc|corp|company|firm|agency)/gi,
      /company[:\s]+[A-Za-z0-9\s]+(?:inc|llc|corp|company|firm|agency)/gi,
      /[A-Za-z0-9\s]+(?:inc|llc|corp|company|firm|agency)[:\s]+/gi,
      /client[_-]?name[:\s]+[A-Za-z0-9\s]+/gi,
      /company[_-]?name[:\s]+[A-Za-z0-9\s]+/gi
    ];

    for (const pattern of clientInfoPatterns) {
      redactedContent = redactedContent.replace(pattern, 'Client A');
    }

    // Redact contact information
    const contactPatterns = [
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, // Email
      /\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g, // Phone
      /\b\d{1,5}\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Place|Pl)\b/gi // Address
    ];

    for (const pattern of contactPatterns) {
      redactedContent = redactedContent.replace(pattern, '[REDACTED]');
    }

    // Add learning data context
    if (learningData.clientType) {
      redactedContent = `Client Type: ${learningData.clientType}\n\n${redactedContent}`;
    }

    if (learningData.businessType) {
      redactedContent = `Business Type: ${learningData.businessType}\n\n${redactedContent}`;
    }

    if (learningData.financialMetrics && Object.keys(learningData.financialMetrics).length > 0) {
      const metrics = Object.entries(learningData.financialMetrics)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      redactedContent = `Financial Metrics (Client A): ${metrics}\n\n${redactedContent}`;
    }

    if (learningData.strategyElements && learningData.strategyElements.length > 0) {
      redactedContent = `Strategy Elements: ${learningData.strategyElements.join(', ')}\n\n${redactedContent}`;
    }

    return redactedContent;
  }

  sanitizeContent(content, patterns) {
    let sanitized = content;

    // Replace detected patterns with placeholders
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      sanitized = sanitized.replace(regex, '[REDACTED]');
    }

    // Additional sanitization for common secret formats
    sanitized = sanitized.replace(/[A-Za-z0-9+/]{40,}={0,2}/g, '[REDACTED_BASE64]');
    sanitized = sanitized.replace(/[A-Fa-f0-9]{32,}/g, '[REDACTED_HEX]');
    sanitized = sanitized.replace(/sk_[A-Za-z0-9]{24,}/g, '[REDACTED_STRIPE_KEY]');
    sanitized = sanitized.replace(/pk_[A-Za-z0-9]{24,}/g, '[REDACTED_STRIPE_PUBLIC]');

    return sanitized;
  }

  async validateMemoryEntry(memoryData) {
    const { crew_member, memory_type, content, importance } = memoryData;
    
    const scanResults = await this.scanContent(content, {
      crew_member,
      memory_type,
      importance
    });

    if (scanResults.blocked) {
      throw new Error(`Memory blocked due to security concerns: ${scanResults.warnings.join(', ')}`);
    }

    if (scanResults.warnings.length > 0) {
      console.log('⚠️  Security warnings for memory entry:');
      scanResults.warnings.forEach(warning => console.log(`  ${warning}`));
    }

    return {
      ...memoryData,
      content: scanResults.sanitizedContent,
      security_scan: {
        is_safe: scanResults.isSafe,
        warnings: scanResults.warnings,
        detected_patterns: scanResults.detectedPatterns,
        confidence: scanResults.confidence,
        timestamp: new Date().toISOString()
      }
    };
  }

  generateSecurityReport() {
    return {
      patterns_configured: {
        secret_patterns: Object.keys(this.secretPatterns).length,
        client_patterns: Object.keys(this.clientPatterns).length,
        industry_patterns: Object.keys(this.industryPatterns).length
      },
      total_patterns: this.getTotalPatternCount(),
      warning_threshold: this.warningThreshold,
      last_updated: new Date().toISOString()
    };
  }

  getTotalPatternCount() {
    let total = 0;
    for (const patterns of Object.values(this.secretPatterns)) {
      total += patterns.length;
    }
    for (const patterns of Object.values(this.clientPatterns)) {
      total += patterns.length;
    }
    for (const patterns of Object.values(this.industryPatterns)) {
      total += patterns.length;
    }
    return total;
  }
}

// Export for use in other modules
module.exports = SecurityMemoryGuard;

// CLI interface for testing
if (require.main === module) {
  const guard = new SecurityMemoryGuard();
  const testContent = process.argv[2] || '';

  if (testContent) {
    guard.scanContent(testContent)
      .then(results => {
        console.log('🔒 Security Memory Guard Results:');
        console.log(JSON.stringify(results, null, 2));
      })
      .catch(error => {
        console.error('❌ Security scan error:', error);
      });
  } else {
    console.log('🔒 Security Memory Guard');
    console.log('Usage: node security-memory-guard.js "content to scan"');
    console.log('Security Report:', guard.generateSecurityReport());
  }
}
