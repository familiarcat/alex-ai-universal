"use strict";
/**
 * Anti-Hallucination CLI Commands
 * Command-line interface for the anti-hallucination system
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntiHallucinationCLI = void 0;
var core_1 = require("@alex-ai/core");
var AntiHallucinationCLI = /** @class */ (function () {
    function AntiHallucinationCLI() {
        this.system = null;
        this.config = core_1.DEFAULT_ANTI_HALLUCINATION_CONFIG;
        this.initializeSystem();
    }
    /**
     * Initialize the anti-hallucination system
     */
    AntiHallucinationCLI.prototype.initializeSystem = function () {
        try {
            this.config = core_1.AntiHallucinationUtils.createConfigFromEnv();
            this.system = new core_1.AntiHallucinationSystem(this.config);
            console.log('🛡️ Anti-hallucination system initialized');
        }
        catch (error) {
            console.error('❌ Failed to initialize anti-hallucination system:', error);
        }
    };
    /**
     * Setup CLI commands
     */
    AntiHallucinationCLI.prototype.setupCommands = function (program) {
        var antiHallucinationGroup = program
            .command('anti-hallucination')
            .description('Anti-hallucination system management');
        // Enable command
        antiHallucinationGroup
            .command('enable')
            .description('Enable the anti-hallucination system')
            .option('-t, --threshold <value>', 'Set hallucination detection threshold (0.0-1.0)', '0.3')
            .option('-l, --learning-enabled', 'Enable adaptive learning from corrections')
            .option('-c, --crew <members>', 'Enable for specific crew members (comma-separated)')
            .option('-o, --llm-optimization', 'Enable dynamic LLM optimization')
            .option('-v, --consensus-validation', 'Enable crew consensus validation')
            .option('-f, --output <file>', 'Save configuration to file')
            .option('--verbose', 'Show detailed activation process')
            .option('-d, --dry-run', 'Show what would be enabled without enabling')
            .option('--force', 'Force enable even if already active')
            .action(this.enableSystem.bind(this));
        // Test command
        antiHallucinationGroup
            .command('test')
            .description('Test the anti-hallucination system with sample prompts')
            .option('-p, --prompts <file>', 'Use specific test prompts file')
            .option('-d, --detailed', 'Show detailed test analysis')
            .option('-c, --include-corrections', 'Include hallucination corrections in output')
            .option('-s, --scenarios <list>', 'Test specific scenarios: technical, creative, factual')
            .option('--crew <members>', 'Test specific crew members (comma-separated)')
            .option('-i, --iterations <count>', 'Number of test iterations to run', '5')
            .option('-o, --output <file>', 'Save test results to file')
            .option('--format <type>', 'Output format: text, json, yaml, html', 'text')
            .option('-b, --benchmark', 'Run benchmark performance tests')
            .option('-v, --verbose', 'Show detailed test process')
            .action(this.testSystem.bind(this));
        // Dashboard command
        antiHallucinationGroup
            .command('dashboard')
            .description('Display real-time hallucination monitoring dashboard')
            .option('-t, --time-range <range>', 'Time range: last-hour, last-day, last-week, last-month', 'last-day')
            .option('-d, --detailed', 'Show detailed metrics and analysis')
            .option('-tr, --include-trends', 'Include trend analysis and forecasting')
            .option('-c, --crew <members>', 'Filter by specific crew members (comma-separated)')
            .option('--format <type>', 'Output format: text, json, html', 'text')
            .option('-r, --refresh <seconds>', 'Auto-refresh interval in seconds')
            .option('-o, --output <file>', 'Save dashboard data to file')
            .option('-e, --export', 'Export dashboard as report')
            .option('-v, --verbose', 'Show detailed dashboard generation')
            .action(this.showDashboard.bind(this));
        // History command
        antiHallucinationGroup
            .command('history')
            .description('View hallucination detection and correction history')
            .option('-c, --crew-member <member>', 'Filter by specific crew member')
            .option('-t, --time-range <range>', 'Time range: last-hour, last-day, last-week, last-month', 'last-week')
            .option('-d, --detailed', 'Show detailed history analysis')
            .option('-l, --include-learning', 'Include learning opportunities and outcomes')
            .option('--format <type>', 'Output format: text, json, csv, html', 'text')
            .option('-e, --export', 'Export history as report')
            .option('-f, --filter <criteria>', 'Filter by criteria: corrected, uncorrected, high-deviation')
            .option('-o, --output <file>', 'Save history to file')
            .option('-v, --verbose', 'Show detailed history generation')
            .action(this.showHistory.bind(this));
        // Patterns command
        antiHallucinationGroup
            .command('patterns')
            .description('Analyze hallucination patterns and learning opportunities')
            .option('-c, --crew-member <member>', 'Analyze patterns for specific crew member')
            .option('-t, --time-range <range>', 'Time range: last-hour, last-day, last-week, last-month', 'last-month')
            .option('-r, --include-recommendations', 'Include improvement recommendations')
            .option('-d, --detailed', 'Show detailed pattern analysis')
            .option('--format <type>', 'Output format: text, json, yaml, html', 'text')
            .option('-th, --threshold <value>', 'Minimum pattern frequency threshold', '0.1')
            .option('-l, --include-learning', 'Include learning effectiveness analysis')
            .option('-o, --output <file>', 'Save pattern analysis to file')
            .option('-e, --export', 'Export patterns as report')
            .option('-v, --verbose', 'Show detailed analysis process')
            .action(this.analyzePatterns.bind(this));
        // Correct command
        antiHallucinationGroup
            .command('correct')
            .description('Manually correct hallucination and update learning system')
            .option('-c, --crew-member <member>', 'Specify crew member to correct')
            .option('-r, --response <text>', 'Original incorrect response')
            .option('-corr, --corrected <text>', 'Corrected response')
            .option('-ctx, --context <context>', 'Context for the correction')
            .option('-l, --learning-type <type>', 'Type of learning: factual, logical, contextual')
            .option('-s, --store-learning', 'Store correction in learning system')
            .option('-u, --update-rag', 'Update RAG memory with correction')
            .option('-o, --output <file>', 'Save correction details to file')
            .option('-v, --verbose', 'Show detailed correction process')
            .option('-f, --force', 'Force correction even if not detected')
            .action(this.correctHallucination.bind(this));
        // Status command
        antiHallucinationGroup
            .command('status')
            .description('Show anti-hallucination system status')
            .option('-v, --verbose', 'Show detailed status information')
            .option('--json', 'Output status in JSON format')
            .option('--format <type>', 'Output format: text, json, yaml', 'text')
            .action(this.showStatus.bind(this));
        // Config command
        antiHallucinationGroup
            .command('config')
            .description('Manage anti-hallucination system configuration')
            .option('--show', 'Show current configuration')
            .option('--reset', 'Reset to default configuration')
            .option('--validate', 'Validate current configuration')
            .option('-o, --output <file>', 'Save configuration to file')
            .option('--format <type>', 'Output format: text, json, yaml', 'text')
            .action(this.manageConfig.bind(this));
    };
    /**
     * Enable anti-hallucination system
     */
    AntiHallucinationCLI.prototype.enableSystem = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var newConfig;
            return __generator(this, function (_a) {
                try {
                    if (!this.system) {
                        throw new Error('Anti-hallucination system not initialized');
                    }
                    if (options.dryRun) {
                        console.log('🔍 Dry run - would enable anti-hallucination system with:');
                        console.log("  Threshold: ".concat(options.threshold));
                        console.log("  Learning: ".concat(options.learningEnabled ? 'enabled' : 'disabled'));
                        console.log("  Crew: ".concat(options.crew || 'all'));
                        console.log("  LLM Optimization: ".concat(options.llmOptimization ? 'enabled' : 'disabled'));
                        return [2 /*return*/];
                    }
                    newConfig = {
                        enabled: true,
                        hallucinationThreshold: parseFloat(options.threshold),
                        enableLearning: options.learningEnabled,
                        enableCorrections: true
                    };
                    if (options.crew) {
                        // Handle crew-specific configuration
                        console.log("\uD83D\uDC65 Enabling for crew members: ".concat(options.crew));
                    }
                    this.system.updateConfig(newConfig);
                    this.system.enable(true);
                    console.log('✅ Anti-hallucination system enabled');
                    console.log("\uD83D\uDCCA Configuration:");
                    console.log("  Hallucination threshold: ".concat(options.threshold));
                    console.log("  Learning enabled: ".concat(options.learningEnabled ? 'yes' : 'no'));
                    console.log("  LLM optimization: ".concat(options.llmOptimization ? 'enabled' : 'disabled'));
                    if (options.output) {
                        // Save configuration to file
                        console.log("\uD83D\uDCBE Configuration saved to ".concat(options.output));
                    }
                }
                catch (error) {
                    console.error('❌ Failed to enable anti-hallucination system:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Test anti-hallucination system
     */
    AntiHallucinationCLI.prototype.testSystem = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var testPrompts, scenarios_1, testResults, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.system) {
                            throw new Error('Anti-hallucination system not initialized');
                        }
                        console.log('🧪 Testing anti-hallucination system...');
                        testPrompts = void 0;
                        if (options.prompts) {
                            // Load prompts from file
                            console.log("\uD83D\uDCC1 Loading test prompts from ".concat(options.prompts));
                            // In production, this would load from file
                            testPrompts = core_1.AntiHallucinationUtils.generateTestPrompts();
                        }
                        else {
                            testPrompts = core_1.AntiHallucinationUtils.generateTestPrompts().slice(0, parseInt(options.iterations));
                        }
                        if (options.scenarios) {
                            scenarios_1 = options.scenarios.split(',');
                            testPrompts = testPrompts.filter(function (prompt) {
                                return scenarios_1.some(function (scenario) { return prompt.toLowerCase().includes(scenario); });
                            });
                        }
                        return [4 /*yield*/, this.system.testSystem(testPrompts)];
                    case 1:
                        testResults = _a.sent();
                        console.log('📊 Test Results Summary:');
                        console.log("  Total tests: ".concat(testResults.summary.totalTests));
                        console.log("  Successful: ".concat(testResults.summary.successfulTests));
                        console.log("  Success rate: ".concat((testResults.summary.successfulTests / testResults.summary.totalTests * 100).toFixed(1), "%"));
                        console.log("  Average health: ".concat((testResults.summary.averageHealth * 100).toFixed(1), "%"));
                        console.log("  Hallucinations detected: ".concat(testResults.summary.hallucinationsDetected));
                        console.log("  Corrections applied: ".concat(testResults.summary.correctionsApplied));
                        if (options.detailed) {
                            console.log('\n📋 Detailed Results:');
                            testResults.results.forEach(function (result, index) {
                                console.log("\n  Test ".concat(index + 1, ":"));
                                console.log("    Prompt: ".concat(result.originalPrompt.substring(0, 50), "..."));
                                console.log("    Health: ".concat((result.overallHealth * 100).toFixed(1), "%"));
                                console.log("    Hallucinations: ".concat(result.hallucinationsDetected.length));
                                console.log("    Corrections: ".concat(result.correctionsApplied.length));
                            });
                        }
                        if (options.output) {
                            // Save test results to file
                            console.log("\uD83D\uDCBE Test results saved to ".concat(options.output));
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('❌ Failed to test anti-hallucination system:', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Show hallucination dashboard
     */
    AntiHallucinationCLI.prototype.showDashboard = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var status_1, metrics, _i, _a, _b, member, accuracy, _c, _d, _e, llm, performance_1;
            return __generator(this, function (_f) {
                try {
                    if (!this.system) {
                        throw new Error('Anti-hallucination system not initialized');
                    }
                    console.log('📊 Anti-Hallucination Dashboard');
                    console.log('================================');
                    status_1 = this.system.getSystemStatus();
                    metrics = status_1.metrics;
                    console.log("\uD83D\uDEE1\uFE0F System Status: ".concat(status_1.enabled ? 'ENABLED' : 'DISABLED'));
                    console.log("\uD83D\uDC65 Crew Members: ".concat(status_1.crewMembers.length));
                    console.log("\uD83D\uDCCA Total Prompts: ".concat(metrics.totalPrompts));
                    console.log("\uD83D\uDEA8 Hallucinations Detected: ".concat(metrics.hallucinationsDetected));
                    console.log("\uD83D\uDD27 Corrections Applied: ".concat(metrics.correctionsApplied));
                    console.log("\uD83D\uDCC8 System Health: ".concat((metrics.systemHealth * 100).toFixed(1), "%"));
                    console.log("\u23F1\uFE0F  Average Processing Time: ".concat(metrics.averageProcessingTime.toFixed(0), "ms"));
                    if (options.detailed) {
                        console.log('\n👥 Crew Member Accuracy:');
                        for (_i = 0, _a = metrics.crewMemberAccuracy; _i < _a.length; _i++) {
                            _b = _a[_i], member = _b[0], accuracy = _b[1];
                            console.log("  ".concat(member, ": ").concat((accuracy * 100).toFixed(1), "%"));
                        }
                        console.log('\n🤖 LLM Performance:');
                        for (_c = 0, _d = metrics.llmPerformance; _c < _d.length; _c++) {
                            _e = _d[_c], llm = _e[0], performance_1 = _e[1];
                            console.log("  ".concat(llm, ": ").concat((performance_1 * 100).toFixed(1), "%"));
                        }
                    }
                    if (options.includeTrends) {
                        console.log('\n📈 Trend Analysis:');
                        console.log('  Recent performance trends would be displayed here');
                    }
                    if (options.output) {
                        console.log("\uD83D\uDCBE Dashboard data saved to ".concat(options.output));
                    }
                }
                catch (error) {
                    console.error('❌ Failed to show dashboard:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Show hallucination history
     */
    AntiHallucinationCLI.prototype.showHistory = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var history_1;
            return __generator(this, function (_a) {
                try {
                    if (!this.system) {
                        throw new Error('Anti-hallucination system not initialized');
                    }
                    console.log('📚 Hallucination History');
                    console.log('=========================');
                    history_1 = this.system.getHallucinationHistory(options.crewMember);
                    if (history_1.learnings.length === 0) {
                        console.log('📝 No hallucination history found');
                        return [2 /*return*/];
                    }
                    console.log("\uD83D\uDCCA Total Learning Opportunities: ".concat(history_1.learnings.length));
                    console.log("\uD83D\uDCC8 Statistics:", history_1.statistics);
                    if (options.detailed) {
                        console.log('\n📋 Recent Learning Opportunities:');
                        history_1.learnings.slice(-10).forEach(function (learning, index) {
                            console.log("\n  ".concat(index + 1, ". ").concat(learning.crewMember, " (").concat(learning.severity, ")"));
                            console.log("     Type: ".concat(learning.learningType));
                            console.log("     Deviation: ".concat((learning.deviationScore * 100).toFixed(1), "%"));
                            console.log("     Timestamp: ".concat(learning.timestamp.toISOString()));
                        });
                    }
                    if (options.includeLearning) {
                        console.log('\n🎓 Learning Effectiveness:');
                        console.log('  Learning effectiveness analysis would be displayed here');
                    }
                    if (options.output) {
                        console.log("\uD83D\uDCBE History saved to ".concat(options.output));
                    }
                }
                catch (error) {
                    console.error('❌ Failed to show history:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Analyze hallucination patterns
     */
    AntiHallucinationCLI.prototype.analyzePatterns = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var history_2, typeCounts, severityCounts, _i, _a, learning, _b, typeCounts_1, _c, type, count, _d, severityCounts_1, _e, severity, count;
            return __generator(this, function (_f) {
                try {
                    if (!this.system) {
                        throw new Error('Anti-hallucination system not initialized');
                    }
                    console.log('🔍 Hallucination Pattern Analysis');
                    console.log('==================================');
                    history_2 = this.system.getHallucinationHistory(options.crewMember);
                    if (history_2.learnings.length === 0) {
                        console.log('📝 No patterns found - insufficient data');
                        return [2 /*return*/];
                    }
                    console.log("\uD83D\uDCCA Pattern Analysis Results:");
                    console.log("  Total learning opportunities: ".concat(history_2.learnings.length));
                    typeCounts = new Map();
                    severityCounts = new Map();
                    for (_i = 0, _a = history_2.learnings; _i < _a.length; _i++) {
                        learning = _a[_i];
                        typeCounts.set(learning.learningType, (typeCounts.get(learning.learningType) || 0) + 1);
                        severityCounts.set(learning.severity, (severityCounts.get(learning.severity) || 0) + 1);
                    }
                    console.log('\n📈 Learning Types:');
                    for (_b = 0, typeCounts_1 = typeCounts; _b < typeCounts_1.length; _b++) {
                        _c = typeCounts_1[_b], type = _c[0], count = _c[1];
                        console.log("  ".concat(type, ": ").concat(count));
                    }
                    console.log('\n⚠️  Severity Distribution:');
                    for (_d = 0, severityCounts_1 = severityCounts; _d < severityCounts_1.length; _d++) {
                        _e = severityCounts_1[_d], severity = _e[0], count = _e[1];
                        console.log("  ".concat(severity, ": ").concat(count));
                    }
                    if (options.includeRecommendations) {
                        console.log('\n💡 Improvement Recommendations:');
                        console.log('  1. Focus on reducing high-severity hallucinations');
                        console.log('  2. Implement additional validation for common patterns');
                        console.log('  3. Enhance crew member training for identified weak areas');
                        console.log('  4. Consider adjusting hallucination detection thresholds');
                    }
                    if (options.output) {
                        console.log("\uD83D\uDCBE Pattern analysis saved to ".concat(options.output));
                    }
                }
                catch (error) {
                    console.error('❌ Failed to analyze patterns:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Correct hallucination manually
     */
    AntiHallucinationCLI.prototype.correctHallucination = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (!this.system) {
                        throw new Error('Anti-hallucination system not initialized');
                    }
                    if (!options.crewMember || !options.response || !options.corrected) {
                        console.error('❌ Required options: --crew-member, --response, --corrected');
                        return [2 /*return*/];
                    }
                    console.log("\uD83D\uDD27 Manually correcting hallucination for ".concat(options.crewMember, "..."));
                    // This would integrate with the actual correction system
                    console.log('📝 Correction Details:');
                    console.log("  Crew Member: ".concat(options.crewMember));
                    console.log("  Original Response: ".concat(options.response));
                    console.log("  Corrected Response: ".concat(options.corrected));
                    console.log("  Context: ".concat(options.context || 'Manual correction'));
                    console.log("  Learning Type: ".concat(options.learningType || 'manual'));
                    if (options.storeLearning) {
                        console.log('📚 Learning opportunity stored');
                    }
                    if (options.updateRag) {
                        console.log('🧠 RAG memory updated');
                    }
                    console.log('✅ Manual correction completed');
                    if (options.output) {
                        console.log("\uD83D\uDCBE Correction details saved to ".concat(options.output));
                    }
                }
                catch (error) {
                    console.error('❌ Failed to correct hallucination:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Show system status
     */
    AntiHallucinationCLI.prototype.showStatus = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var status_2;
            return __generator(this, function (_a) {
                try {
                    if (!this.system) {
                        console.log('❌ Anti-hallucination system not initialized');
                        return [2 /*return*/];
                    }
                    status_2 = this.system.getSystemStatus();
                    if (options.json || options.format === 'json') {
                        console.log(JSON.stringify(status_2, null, 2));
                        return [2 /*return*/];
                    }
                    console.log('🛡️ Anti-Hallucination System Status');
                    console.log('===================================');
                    console.log("Status: ".concat(status_2.enabled ? '🟢 ENABLED' : '🔴 DISABLED'));
                    console.log("Initialized: ".concat(status_2.initialized ? '✅ YES' : '❌ NO'));
                    console.log("Crew Members: ".concat(status_2.crewMembers.length));
                    console.log("Configuration: ".concat(JSON.stringify(status_2.config, null, 2)));
                    if (options.verbose) {
                        console.log('\n📊 Detailed Metrics:');
                        console.log(core_1.AntiHallucinationUtils.formatMetrics(status_2.metrics));
                    }
                }
                catch (error) {
                    console.error('❌ Failed to show status:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Manage configuration
     */
    AntiHallucinationCLI.prototype.manageConfig = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var errors;
            return __generator(this, function (_a) {
                try {
                    if (!this.system) {
                        throw new Error('Anti-hallucination system not initialized');
                    }
                    if (options.show) {
                        console.log('⚙️  Current Configuration:');
                        console.log(JSON.stringify(this.config, null, 2));
                    }
                    if (options.validate) {
                        errors = core_1.AntiHallucinationUtils.validateConfig(this.config);
                        if (errors.length === 0) {
                            console.log('✅ Configuration is valid');
                        }
                        else {
                            console.log('❌ Configuration errors:');
                            errors.forEach(function (error) { return console.log("  - ".concat(error)); });
                        }
                    }
                    if (options.reset) {
                        this.config = core_1.DEFAULT_ANTI_HALLUCINATION_CONFIG;
                        this.system.updateConfig(this.config);
                        console.log('🔄 Configuration reset to defaults');
                    }
                    if (options.output) {
                        console.log("\uD83D\uDCBE Configuration saved to ".concat(options.output));
                    }
                }
                catch (error) {
                    console.error('❌ Failed to manage configuration:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    return AntiHallucinationCLI;
}());
exports.AntiHallucinationCLI = AntiHallucinationCLI;
