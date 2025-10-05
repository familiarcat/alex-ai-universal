#!/usr/bin/env node
"use strict";
/**
 * 🎯 Debugging CLI
 *
 * Provides CLI commands for the Cursor AI debugging system
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
exports.DebuggingCLI = void 0;
var commander_1 = require("commander");
var core_1 = require("@alex-ai/core");
var fs = require("fs");
var DebuggingCLI = /** @class */ (function () {
    function DebuggingCLI() {
        this.program = new commander_1.Command('debugging');
        this.debuggingCoordinator = new core_1.DebuggingCoordinator();
        this.setupCommands();
    }
    DebuggingCLI.prototype.setupCommands = function () {
        var _this = this;
        // Main debugging command
        this.program
            .command('analyze')
            .description('Analyze debugging request with image and code analysis')
            .option('-i, --image <path>', 'Path to UI screenshot image')
            .option('-c, --code <path>', 'Path to code file to analyze')
            .option('-p, --prompt <text>', 'User prompt describing the debugging issue')
            .option('-x, --context <text>', 'Additional context for analysis')
            .option('--priority <level>', 'Priority level (low, medium, high, critical)', 'medium')
            .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.analyzeDebuggingRequest(options)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Image analysis command
        this.program
            .command('analyze-image <imagePath>')
            .description('Analyze UI screenshot for debugging')
            .option('-c, --context <text>', 'Additional context for analysis')
            .action(function (imagePath, options) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.analyzeImage(imagePath, options)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Code analysis command
        this.program
            .command('analyze-code <codePath>')
            .description('Analyze code file for debugging')
            .option('-e, --elements <elements>', 'UI elements to map to code')
            .option('-c, --context <text>', 'Additional context for analysis')
            .action(function (codePath, options) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.analyzeCode(codePath, options)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Crew orchestration command
        this.program
            .command('orchestrate')
            .description('Orchestrate crew debugging session')
            .option('-i, --image <path>', 'Path to image analysis result')
            .option('-c, --code <path>', 'Path to code analysis result')
            .option('-p, --prompt <text>', 'User prompt for debugging')
            .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.orchestrateCrewSession(options)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Observation lounge command
        this.program
            .command('observation-lounge')
            .description('Conduct observation lounge session')
            .option('-s, --session <id>', 'Debugging session ID')
            .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.conductObservationLounge(options)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Full debugging workflow
        this.program
            .command('full-debug')
            .description('Run complete debugging workflow')
            .option('-i, --image <path>', 'Path to UI screenshot image')
            .option('-c, --code <path>', 'Path to code file to analyze')
            .option('-p, --prompt <text>', 'User prompt describing the debugging issue')
            .option('-x, --context <text>', 'Additional context for analysis')
            .option('--priority <level>', 'Priority level (low, medium, high, critical)', 'medium')
            .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.runFullDebuggingWorkflow(options)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Get session summary
        this.program
            .command('session-summary <sessionId>')
            .description('Get debugging session summary')
            .action(function (sessionId) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSessionSummary(sessionId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Get crew expertise
        this.program
            .command('crew-expertise')
            .description('Get crew member expertise summary')
            .action(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCrewExpertise()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Test debugging system
        this.program
            .command('test-debugging')
            .description('Test debugging system with sample data')
            .action(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.testDebuggingSystem()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Analyze debugging request
     */
    DebuggingCLI.prototype.analyzeDebuggingRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🎯 Analyzing Debugging Request');
                        console.log('==============================');
                        if (!options.prompt) {
                            console.error('❌ Prompt is required. Use --prompt to specify the debugging issue.');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        request = {
                            userPrompt: options.prompt,
                            imagePath: options.image,
                            codeFilePath: options.code,
                            context: options.context,
                            priority: options.priority
                        };
                        console.log('📝 Request Details:');
                        console.log("  Prompt: ".concat(request.userPrompt));
                        console.log("  Image: ".concat(request.imagePath || 'Not provided'));
                        console.log("  Code: ".concat(request.codeFilePath || 'Not provided'));
                        console.log("  Context: ".concat(request.context || 'Not provided'));
                        console.log("  Priority: ".concat(request.priority));
                        console.log('');
                        return [4 /*yield*/, this.debuggingCoordinator.processDebuggingRequest(request)];
                    case 2:
                        response = _a.sent();
                        console.log('✅ Debugging Analysis Complete');
                        console.log('=============================');
                        console.log("Session ID: ".concat(response.sessionId));
                        console.log("Confidence: ".concat(response.confidence, "%"));
                        console.log("Hallucination Detected: ".concat(response.hallucinationDetected ? 'Yes' : 'No'));
                        console.log("Memory Storage: ".concat(response.memoryStorageDecision));
                        console.log('');
                        console.log('🎯 Final Recommendations:');
                        response.finalRecommendations.forEach(function (rec, index) {
                            console.log("  ".concat(index + 1, ". ").concat(rec));
                        });
                        console.log('');
                        console.log('🔧 Debugging Steps:');
                        response.debuggingSteps.forEach(function (step, index) {
                            console.log("  ".concat(index + 1, ". ").concat(step));
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('❌ Debugging analysis failed:', error_1 instanceof Error ? error_1.message : String(error_1));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyze image
     */
    DebuggingCLI.prototype.analyzeImage = function (imagePath, options) {
        return __awaiter(this, void 0, void 0, function () {
            var ImageAnalyzer, imageAnalyzer, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🖼️  Analyzing Image');
                        console.log('==================');
                        if (!fs.existsSync(imagePath)) {
                            console.error("\u274C Image file not found: ".concat(imagePath));
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@alex-ai/core'); })];
                    case 2:
                        ImageAnalyzer = (_a.sent()).ImageAnalyzer;
                        imageAnalyzer = new ImageAnalyzer();
                        return [4 /*yield*/, imageAnalyzer.analyzeImage(imagePath, options.context)];
                    case 3:
                        result = _a.sent();
                        console.log('✅ Image Analysis Complete');
                        console.log('=========================');
                        console.log("Image: ".concat(result.imagePath));
                        console.log("Confidence: ".concat(result.confidence, "%"));
                        console.log("UI Elements Found: ".concat(result.uiElements.length));
                        console.log("Buttons Found: ".concat(result.buttons.length));
                        console.log('');
                        if (result.buttons.length > 0) {
                            console.log('🔘 Button Analysis:');
                            result.buttons.forEach(function (button, index) {
                                console.log("  ".concat(index + 1, ". ").concat(button.element.text || 'Unnamed Button'));
                                console.log("     Click Handler: ".concat(button.clickHandler || 'Not found'));
                                console.log("     Function: ".concat(button.functionName || 'Not found'));
                                console.log("     Issues: ".concat(button.potentialIssues.length));
                            });
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error('❌ Image analysis failed:', error_2 instanceof Error ? error_2.message : String(error_2));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyze code
     */
    DebuggingCLI.prototype.analyzeCode = function (codePath, options) {
        return __awaiter(this, void 0, void 0, function () {
            var CodeAnalyzer, codeAnalyzer, elements, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🔍 Analyzing Code');
                        console.log('=================');
                        if (!fs.existsSync(codePath)) {
                            console.error("\u274C Code file not found: ".concat(codePath));
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@alex-ai/core'); })];
                    case 2:
                        CodeAnalyzer = (_a.sent()).CodeAnalyzer;
                        codeAnalyzer = new CodeAnalyzer();
                        elements = options.elements ? options.elements.split(',') : undefined;
                        return [4 /*yield*/, codeAnalyzer.analyzeCode(codePath, elements, options.context)];
                    case 3:
                        result = _a.sent();
                        console.log('✅ Code Analysis Complete');
                        console.log('========================');
                        console.log("File: ".concat(result.filePath));
                        console.log("Confidence: ".concat(result.confidence, "%"));
                        console.log("Functions Found: ".concat(result.functions.length));
                        console.log("Click Handlers: ".concat(result.clickHandlers.length));
                        console.log('');
                        if (result.functions.length > 0) {
                            console.log('🔧 Functions:');
                            result.functions.forEach(function (func, index) {
                                console.log("  ".concat(index + 1, ". ").concat(func.name, " (").concat(func.type, ")"));
                                console.log("     File: ".concat(func.file, ":").concat(func.line));
                                console.log("     Async: ".concat(func.isAsync ? 'Yes' : 'No'));
                                console.log("     Error Handling: ".concat(func.hasErrorHandling ? 'Yes' : 'No'));
                            });
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        console.error('❌ Code analysis failed:', error_3 instanceof Error ? error_3.message : String(error_3));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Orchestrate crew session
     */
    DebuggingCLI.prototype.orchestrateCrewSession = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var mockImageAnalysis, mockCodeAnalysis, DebuggingOrchestrator, orchestrator, session, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🎭 Orchestrating Crew Session');
                        console.log('==============================');
                        if (!options.prompt) {
                            console.error('❌ Prompt is required. Use --prompt to specify the debugging issue.');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        mockImageAnalysis = {
                            imagePath: options.image || 'mock-image.png',
                            timestamp: new Date().toISOString(),
                            uiElements: [],
                            buttons: [],
                            potentialClickIssues: [],
                            debuggingRecommendations: [],
                            confidence: 85
                        };
                        mockCodeAnalysis = {
                            filePath: options.code || 'mock-code.js',
                            functions: [],
                            clickHandlers: [],
                            potentialIssues: [],
                            debuggingSuggestions: [],
                            confidence: 90,
                            timestamp: new Date().toISOString()
                        };
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@alex-ai/core'); })];
                    case 2:
                        DebuggingOrchestrator = (_a.sent()).DebuggingOrchestrator;
                        orchestrator = new DebuggingOrchestrator();
                        return [4 /*yield*/, orchestrator.orchestrateDebuggingSession(mockImageAnalysis, mockCodeAnalysis, options.prompt)];
                    case 3:
                        session = _a.sent();
                        console.log('✅ Crew Session Complete');
                        console.log('=======================');
                        console.log("Session ID: ".concat(session.sessionId));
                        console.log("Crew Responses: ".concat(session.crewResponses.length));
                        console.log("Consensus: ".concat(session.consensus));
                        console.log("Hallucination Detected: ".concat(session.hallucinationDetected ? 'Yes' : 'No'));
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        console.error('❌ Crew orchestration failed:', error_4 instanceof Error ? error_4.message : String(error_4));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Conduct observation lounge
     */
    DebuggingCLI.prototype.conductObservationLounge = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var mockDebuggingSession, DebuggingObservationLounge, observationLounge, session, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🎭 Conducting Observation Lounge Session');
                        console.log('========================================');
                        if (!options.session) {
                            console.error('❌ Session ID is required. Use --session to specify the session ID.');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        mockDebuggingSession = {
                            sessionId: options.session,
                            imageAnalysis: {},
                            codeAnalysis: {},
                            crewResponses: [],
                            consensus: 'Mock consensus',
                            finalRecommendations: [],
                            hallucinationDetected: false,
                            memoryStorageDecision: 'individual',
                            timestamp: new Date().toISOString()
                        };
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@alex-ai/core'); })];
                    case 2:
                        DebuggingObservationLounge = (_a.sent()).DebuggingObservationLounge;
                        observationLounge = new DebuggingObservationLounge();
                        return [4 /*yield*/, observationLounge.conductObservationLoungeSession(mockDebuggingSession)];
                    case 3:
                        session = _a.sent();
                        console.log('✅ Observation Lounge Session Complete');
                        console.log('=====================================');
                        console.log("Session ID: ".concat(session.sessionId));
                        console.log("Crew Discussions: ".concat(session.crewDiscussions.length));
                        console.log("Hallucination Analysis: ".concat(session.hallucinationAnalysis.detected ? 'Detected' : 'Not detected'));
                        console.log("Consensus Level: ".concat(session.consensusBuilding.consensusLevel, "%"));
                        console.log("Memory Storage: ".concat(session.memoryStorageDecision.strategy));
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        console.error('❌ Observation lounge failed:', error_5 instanceof Error ? error_5.message : String(error_5));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Run full debugging workflow
     */
    DebuggingCLI.prototype.runFullDebuggingWorkflow = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🎯 Running Full Debugging Workflow');
                        console.log('==================================');
                        if (!options.prompt) {
                            console.error('❌ Prompt is required. Use --prompt to specify the debugging issue.');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        request = {
                            userPrompt: options.prompt,
                            imagePath: options.image,
                            codeFilePath: options.code,
                            context: options.context,
                            priority: options.priority
                        };
                        console.log('🚀 Starting complete debugging workflow...');
                        console.log('');
                        return [4 /*yield*/, this.debuggingCoordinator.processDebuggingRequest(request)];
                    case 2:
                        response = _a.sent();
                        console.log('🎉 Full Debugging Workflow Complete!');
                        console.log('===================================');
                        console.log("Session ID: ".concat(response.sessionId));
                        console.log("Overall Confidence: ".concat(response.confidence, "%"));
                        console.log("Hallucination Detected: ".concat(response.hallucinationDetected ? 'Yes' : 'No'));
                        console.log("Memory Storage Decision: ".concat(response.memoryStorageDecision));
                        console.log('');
                        // Display crew responses
                        console.log('🎭 Crew Member Responses:');
                        response.debuggingSession.crewResponses.forEach(function (response, index) {
                            console.log("  ".concat(index + 1, ". ").concat(response.crewMember, " (").concat(response.specialization, ")"));
                            console.log("     LLM Used: ".concat(response.llmUsed));
                            console.log("     Confidence: ".concat(response.confidence, "%"));
                            console.log("     Analysis: ".concat(response.analysis.substring(0, 100), "..."));
                            console.log('');
                        });
                        // Display final recommendations
                        console.log('🎯 Final Recommendations:');
                        response.finalRecommendations.forEach(function (rec, index) {
                            console.log("  ".concat(index + 1, ". ").concat(rec));
                        });
                        console.log('');
                        // Display debugging steps
                        console.log('🔧 Debugging Steps:');
                        response.debuggingSteps.forEach(function (step, index) {
                            console.log("  ".concat(index + 1, ". ").concat(step));
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        console.error('❌ Full debugging workflow failed:', error_6 instanceof Error ? error_6.message : String(error_6));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get session summary
     */
    DebuggingCLI.prototype.getSessionSummary = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var summary;
            return __generator(this, function (_a) {
                console.log('📊 Debugging Session Summary');
                console.log('============================');
                try {
                    summary = this.debuggingCoordinator.getDebuggingSessionSummary(sessionId);
                    console.log(summary);
                }
                catch (error) {
                    console.error('❌ Failed to get session summary:', error instanceof Error ? error.message : String(error));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get crew expertise
     */
    DebuggingCLI.prototype.getCrewExpertise = function () {
        return __awaiter(this, void 0, void 0, function () {
            var expertise;
            return __generator(this, function (_a) {
                console.log('🎭 Alex AI Crew Expertise');
                console.log('=========================');
                try {
                    expertise = this.debuggingCoordinator.getCrewMemberExpertiseSummary();
                    console.log(expertise);
                }
                catch (error) {
                    console.error('❌ Failed to get crew expertise:', error instanceof Error ? error.message : String(error));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Test debugging system
     */
    DebuggingCLI.prototype.testDebuggingSystem = function () {
        return __awaiter(this, void 0, void 0, function () {
            var testRequest, response, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🧪 Testing Debugging System');
                        console.log('===========================');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        testRequest = {
                            userPrompt: 'Test debugging request - button click not working',
                            priority: 'medium'
                        };
                        console.log('Running test with mock data...');
                        return [4 /*yield*/, this.debuggingCoordinator.processDebuggingRequest(testRequest)];
                    case 2:
                        response = _a.sent();
                        console.log('✅ Test completed successfully!');
                        console.log("Session ID: ".concat(response.sessionId));
                        console.log("Confidence: ".concat(response.confidence, "%"));
                        console.log("Crew Responses: ".concat(response.debuggingSession.crewResponses.length));
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        console.error('❌ Test failed:', error_7 instanceof Error ? error_7.message : String(error_7));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the CLI program
     */
    DebuggingCLI.prototype.getProgram = function () {
        return this.program;
    };
    return DebuggingCLI;
}());
exports.DebuggingCLI = DebuggingCLI;
// Export for use in main CLI
exports.default = DebuggingCLI;
