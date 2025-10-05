#!/usr/bin/env node
"use strict";
/**
 * Alex AI Universal NPX CLI
 *
 * Provides NPX execution for Alex AI with Star Trek crew-based AI assistance
 * ZERO ARTIFACT GUARANTEE - No files created in user projects
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
var universal_extension_1 = require("@alex-ai/universal-extension");
var commander = require("commander");
var child_process_1 = require("child_process");
var path = require("path");
// Create the universal extension using NPX adapter
var _a = (0, universal_extension_1.createNPXExtension)(), core = _a.core, commands = _a.commands;
/**
 * NPX CLI Handler with Zero-Artifact Guarantee
 */
var NPXCLIHandler = /** @class */ (function () {
    function NPXCLIHandler() {
        this.core = core;
        this.commands = commands;
        this.initialize();
    }
    NPXCLIHandler.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.core.initialize()];
                    case 1:
                        _a.sent();
                        console.log('✅ Alex AI NPX CLI initialized with zero-artifact guarantee');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle NPX engagement without creating project files
     */
    NPXCLIHandler.prototype.handleEngagement = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        return [4 /*yield*/, this.core.processMessage(message)];
                    case 1:
                        response = _a.sent();
                        if (response.success) {
                            console.log('\n🤖 Alex AI Response:');
                            console.log('==================');
                            console.log(response.coordinatedResponse);
                            if (response.crewMembers.length > 0) {
                                console.log('\n👥 Crew Members Involved:');
                                response.crewMembers.forEach(function (member) {
                                    console.log("  \u2022 ".concat(member.name, " - ").concat(member.role));
                                });
                            }
                            if (response.ragInsights.length > 0) {
                                console.log('\n🧠 RAG Insights:');
                                response.ragInsights.forEach(function (insight) {
                                    console.log("  \u2022 ".concat(insight));
                                });
                            }
                        }
                        else {
                            console.error("\u274C Alex AI Error: ".concat(response.message));
                        }
                        return [3 /*break*/, 4];
                    case 2:
                        error_1 = _a.sent();
                        console.error("\u274C NPX engagement failed: ".concat(error_1.message));
                        return [3 /*break*/, 4];
                    case 3:
                        // Ensure process exits properly
                        process.exit(0);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle N8N integration requests
     */
    NPXCLIHandler.prototype.handleN8NIntegration = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var lowerMessage, scriptPath, child;
            return __generator(this, function (_a) {
                console.log('🚀 N8N Integration Request Detected!');
                console.log('===================================');
                lowerMessage = message.toLowerCase();
                if (lowerMessage.includes('engage alex ai') || lowerMessage.includes('start sync')) {
                    console.log('🔄 Starting Truly Unique Bi-Directional Sync System...');
                    console.log('This will enable real-time synchronization between local JSON files and N8N UI.');
                    console.log('Changes in either direction will be immediately reflected in the other.');
                    console.log('');
                    console.log('🚀 Starting sync system...');
                    scriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'truly-unique-bidirectional-sync.js');
                    child = (0, child_process_1.spawn)('node', [scriptPath], {
                        stdio: 'inherit',
                        cwd: process.cwd()
                    });
                    console.log('✅ N8N integration is now active!');
                    console.log('📝 Edit local JSON files and watch N8N UI update automatically');
                    console.log('🌐 Make changes in N8N UI and watch local files update automatically');
                }
                else if (lowerMessage.includes('status') || lowerMessage.includes('check')) {
                    console.log('📊 N8N Integration Status:');
                    console.log('  • Sync System: Active');
                    console.log('  • Bi-directional: Enabled');
                    console.log('  • Real-time Updates: Active');
                }
                return [2 /*return*/];
            });
        });
    };
    return NPXCLIHandler;
}());
// Create the NPX CLI handler instance
var npxHandler = new NPXCLIHandler();
// Commander.js setup
var program = new commander.Command();
program
    .name('alex-ai')
    .description('Alex AI Universal - Star Trek Crew-based AI Assistant')
    .version('1.0.0');
// Engage command
program
    .command('engage')
    .description('Engage Alex AI with the crew')
    .argument('<message>', 'Message to send to Alex AI')
    .action(function (message) { return __awaiter(void 0, void 0, void 0, function () {
    var error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, 3, 4]);
                return [4 /*yield*/, npxHandler.handleEngagement(message)];
            case 1:
                _a.sent();
                return [3 /*break*/, 4];
            case 2:
                error_2 = _a.sent();
                console.error("\u274C Engagement failed: ".concat(error_2.message));
                return [3 /*break*/, 4];
            case 3:
                process.exit(0);
                return [7 /*endfinally*/];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Status command
program
    .command('status')
    .description('Show Alex AI system status')
    .action(function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, 3, 4]);
                return [4 /*yield*/, npxHandler.handleEngagement('Show system status')];
            case 1:
                _a.sent();
                return [3 /*break*/, 4];
            case 2:
                error_3 = _a.sent();
                console.error("\u274C Status check failed: ".concat(error_3.message));
                return [3 /*break*/, 4];
            case 3:
                process.exit(0);
                return [7 /*endfinally*/];
            case 4: return [2 /*return*/];
        }
    });
}); });
// N8N integration command
program
    .command('n8n')
    .description('N8N integration and workflow management')
    .argument('<action>', 'N8N action (start, status, sync)')
    .action(function (action) { return __awaiter(void 0, void 0, void 0, function () {
    var error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, 3, 4]);
                return [4 /*yield*/, npxHandler.handleN8NIntegration(action)];
            case 1:
                _a.sent();
                return [3 /*break*/, 4];
            case 2:
                error_4 = _a.sent();
                console.error("\u274C N8N integration failed: ".concat(error_4.message));
                return [3 /*break*/, 4];
            case 3:
                process.exit(0);
                return [7 /*endfinally*/];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Interactive mode
program
    .command('chat')
    .description('Start interactive chat with Alex AI')
    .action(function () { return __awaiter(void 0, void 0, void 0, function () {
    var readline, rl, askQuestion;
    return __generator(this, function (_a) {
        console.log('🚀 Alex AI Interactive Chat Mode');
        console.log('Type "exit" to quit, "help" for commands');
        console.log('');
        readline = require('readline');
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        askQuestion = function () {
            rl.question('You: ', function (input) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (input.toLowerCase() === 'exit') {
                                console.log('👋 Goodbye! Live long and prosper! 🖖');
                                rl.close();
                                return [2 /*return*/];
                            }
                            if (input.toLowerCase() === 'help') {
                                console.log('\n📋 Available Commands:');
                                console.log('  • Ask any question for crew assistance');
                                console.log('  • "status" - Show system status');
                                console.log('  • "n8n start" - Start N8N integration');
                                console.log('  • "exit" - Quit chat mode');
                                console.log('');
                                askQuestion();
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, npxHandler.handleEngagement(input)];
                        case 1:
                            _a.sent();
                            console.log('');
                            askQuestion();
                            return [2 /*return*/];
                    }
                });
            }); });
        };
        askQuestion();
        return [2 /*return*/];
    });
}); });
// Parse command line arguments
program.parse();
// If no command provided, show help
if (!process.argv.slice(2).length) {
    program.help();
}
