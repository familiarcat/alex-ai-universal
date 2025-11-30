#!/usr/bin/env node
"use strict";
/**
 * 🚀 N8N Integration CLI
 *
 * Provides CLI commands for the truly unique bi-directional sync system
 * and N8N integration features for Alex AI platform
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
exports.N8NIntegrationCLI = void 0;
var commander_1 = require("commander");
var child_process_1 = require("child_process");
var fs = require("fs");
var path = require("path");
var N8NIntegrationCLI = /** @class */ (function () {
    function N8NIntegrationCLI() {
        this.program = new commander_1.Command('n8n-integration');
        this.setupCommands();
    }
    N8NIntegrationCLI.prototype.setupCommands = function () {
        var _this = this;
        // Main N8N integration command
        this.program
            .command('sync')
            .description('Start the truly unique bi-directional sync system')
            .option('-w, --watch', 'Enable file watching mode', true)
            .option('-p, --poll-interval <seconds>', 'N8N polling interval in seconds', '5')
            .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.startBiDirectionalSync(options)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Sync status command
        this.program
            .command('sync-status')
            .description('Check the status of N8N integration and sync system')
            .action(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkSyncStatus()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Force sync command
        this.program
            .command('force-sync')
            .description('Force immediate synchronization between local JSON and N8N')
            .action(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.forceSync()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Start sync daemon
        this.program
            .command('daemon')
            .description('Start N8N integration as a background daemon')
            .option('-p, --pid-file <path>', 'PID file path', '/tmp/alex-ai-n8n-sync.pid')
            .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.startDaemon(options)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Stop sync daemon
        this.program
            .command('stop-daemon')
            .description('Stop the N8N integration daemon')
            .option('-p, --pid-file <path>', 'PID file path', '/tmp/alex-ai-n8n-sync.pid')
            .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.stopDaemon(options)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Test bi-directional sync
        this.program
            .command('test')
            .description('Test the bi-directional sync functionality')
            .action(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.testBiDirectionalSync()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // List workflows
        this.program
            .command('list-workflows')
            .description('List all Alex AI workflows in N8N')
            .action(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.listWorkflows()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Get workflow details
        this.program
            .command('workflow <id>')
            .description('Get details of a specific workflow')
            .action(function (workflowId) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getWorkflowDetails(workflowId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Sync specific workflow
        this.program
            .command('sync-workflow <id>')
            .description('Sync a specific workflow between local and N8N')
            .action(function (workflowId) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.syncSpecificWorkflow(workflowId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Start the truly unique bi-directional sync system
     */
    N8NIntegrationCLI.prototype.startBiDirectionalSync = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var scriptPath, child_1;
            return __generator(this, function (_a) {
                console.log('🚀 Starting Truly Unique Bi-Directional Sync System');
                console.log('==================================================');
                try {
                    scriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'truly-unique-bidirectional-sync.js');
                    if (!fs.existsSync(scriptPath)) {
                        console.error('❌ Sync script not found:', scriptPath);
                        return [2 /*return*/];
                    }
                    console.log('✅ Starting sync system...');
                    console.log("\uD83D\uDCC1 Watching: ".concat(path.join(process.cwd(), 'packages', 'core', 'src', 'crew-workflows')));
                    console.log("\uD83D\uDD04 Polling interval: ".concat(options.pollInterval, " seconds"));
                    console.log("\uD83D\uDC40 File watching: ".concat(options.watch ? 'Enabled' : 'Disabled'));
                    child_1 = (0, child_process_1.spawn)('node', [scriptPath], {
                        stdio: 'inherit',
                        cwd: process.cwd()
                    });
                    child_1.on('error', function (error) {
                        console.error('❌ Sync system error:', error.message);
                    });
                    child_1.on('exit', function (code) {
                        console.log("\uD83D\uDED1 Sync system exited with code: ".concat(code));
                    });
                    // Handle graceful shutdown
                    process.on('SIGINT', function () {
                        console.log('\n🛑 Stopping sync system...');
                        child_1.kill('SIGINT');
                        process.exit(0);
                    });
                }
                catch (error) {
                    console.error('❌ Failed to start sync system:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Check sync status
     */
    N8NIntegrationCLI.prototype.checkSyncStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var scriptPath, scriptExists, crewWorkflowsDir, localFilesExist, files, pidFile, daemonRunning, pid;
            return __generator(this, function (_a) {
                console.log('📊 N8N Integration Status');
                console.log('========================');
                try {
                    scriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'truly-unique-bidirectional-sync.js');
                    scriptExists = fs.existsSync(scriptPath);
                    console.log("\uD83D\uDCC4 Sync script: ".concat(scriptExists ? '✅ Found' : '❌ Not found'));
                    crewWorkflowsDir = path.join(process.cwd(), 'packages', 'core', 'src', 'crew-workflows');
                    localFilesExist = fs.existsSync(crewWorkflowsDir);
                    console.log("\uD83D\uDCC1 Local workflows: ".concat(localFilesExist ? '✅ Found' : '❌ Not found'));
                    if (localFilesExist) {
                        files = fs.readdirSync(crewWorkflowsDir).filter(function (f) { return f.endsWith('.json'); });
                        console.log("   \u2022 ".concat(files.length, " workflow files found"));
                        files.forEach(function (file) {
                            console.log("     - ".concat(file));
                        });
                    }
                    pidFile = '/tmp/alex-ai-n8n-sync.pid';
                    daemonRunning = fs.existsSync(pidFile);
                    console.log("\uD83D\uDD04 Daemon status: ".concat(daemonRunning ? '✅ Running' : '❌ Not running'));
                    if (daemonRunning) {
                        pid = fs.readFileSync(pidFile, 'utf8').trim();
                        console.log("   \u2022 PID: ".concat(pid));
                    }
                    console.log('\n🎯 System Status: Ready for bi-directional sync');
                }
                catch (error) {
                    console.error('❌ Status check failed:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Force immediate synchronization
     */
    N8NIntegrationCLI.prototype.forceSync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var scriptPath, child;
            return __generator(this, function (_a) {
                console.log('🔄 Forcing Immediate Synchronization');
                console.log('====================================');
                try {
                    scriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'direct-json-n8n-sync.js');
                    if (!fs.existsSync(scriptPath)) {
                        console.error('❌ Direct sync script not found:', scriptPath);
                        return [2 /*return*/];
                    }
                    console.log('📤 Forcing sync from local to N8N...');
                    child = (0, child_process_1.spawn)('node', [scriptPath, 'sync'], {
                        stdio: 'inherit',
                        cwd: process.cwd()
                    });
                    child.on('error', function (error) {
                        console.error('❌ Force sync error:', error.message);
                    });
                    child.on('exit', function (code) {
                        if (code === 0) {
                            console.log('✅ Force sync completed successfully');
                        }
                        else {
                            console.log("\u274C Force sync failed with code: ".concat(code));
                        }
                    });
                }
                catch (error) {
                    console.error('❌ Force sync failed:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Start sync daemon
     */
    N8NIntegrationCLI.prototype.startDaemon = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var scriptPath, child;
            var _a;
            return __generator(this, function (_b) {
                console.log('🔄 Starting N8N Integration Daemon');
                console.log('==================================');
                try {
                    scriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'truly-unique-bidirectional-sync.js');
                    if (!fs.existsSync(scriptPath)) {
                        console.error('❌ Sync script not found:', scriptPath);
                        return [2 /*return*/];
                    }
                    console.log("\uD83D\uDCC4 PID file: ".concat(options.pidFile));
                    console.log('🚀 Starting daemon...');
                    child = (0, child_process_1.spawn)('node', [scriptPath], {
                        stdio: 'pipe',
                        cwd: process.cwd(),
                        detached: true
                    });
                    // Write PID file
                    fs.writeFileSync(options.pidFile, ((_a = child.pid) === null || _a === void 0 ? void 0 : _a.toString()) || '');
                    console.log("\u2705 Daemon started with PID: ".concat(child.pid));
                    console.log('🔄 N8N integration is now running in the background');
                    // Detach from parent process
                    child.unref();
                }
                catch (error) {
                    console.error('❌ Failed to start daemon:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Stop sync daemon
     */
    N8NIntegrationCLI.prototype.stopDaemon = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var pid;
            return __generator(this, function (_a) {
                console.log('🛑 Stopping N8N Integration Daemon');
                console.log('==================================');
                try {
                    if (!fs.existsSync(options.pidFile)) {
                        console.log('❌ PID file not found - daemon may not be running');
                        return [2 /*return*/];
                    }
                    pid = fs.readFileSync(options.pidFile, 'utf8').trim();
                    console.log("\uD83D\uDCC4 Found PID: ".concat(pid));
                    // Kill the process
                    process.kill(parseInt(pid), 'SIGTERM');
                    // Remove PID file
                    fs.unlinkSync(options.pidFile);
                    console.log('✅ Daemon stopped successfully');
                }
                catch (error) {
                    console.error('❌ Failed to stop daemon:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Test bi-directional sync
     */
    N8NIntegrationCLI.prototype.testBiDirectionalSync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var testScriptPath, child;
            return __generator(this, function (_a) {
                console.log('🧪 Testing Bi-Directional Sync');
                console.log('==============================');
                try {
                    testScriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'demo-truly-unique-sync.js');
                    if (!fs.existsSync(testScriptPath)) {
                        console.error('❌ Test script not found:', testScriptPath);
                        return [2 /*return*/];
                    }
                    console.log('🧪 Running sync test...');
                    child = (0, child_process_1.spawn)('node', [testScriptPath], {
                        stdio: 'inherit',
                        cwd: process.cwd()
                    });
                    child.on('error', function (error) {
                        console.error('❌ Test error:', error.message);
                    });
                    child.on('exit', function (code) {
                        if (code === 0) {
                            console.log('✅ Bi-directional sync test completed successfully');
                        }
                        else {
                            console.log("\u274C Test failed with code: ".concat(code));
                        }
                    });
                }
                catch (error) {
                    console.error('❌ Test failed:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * List all workflows
     */
    N8NIntegrationCLI.prototype.listWorkflows = function () {
        return __awaiter(this, void 0, void 0, function () {
            var listScriptPath, child;
            return __generator(this, function (_a) {
                console.log('📋 Alex AI Workflows in N8N');
                console.log('===========================');
                try {
                    listScriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'list-n8n-workflows.js');
                    if (!fs.existsSync(listScriptPath)) {
                        console.error('❌ List script not found:', listScriptPath);
                        return [2 /*return*/];
                    }
                    child = (0, child_process_1.spawn)('node', [listScriptPath], {
                        stdio: 'inherit',
                        cwd: process.cwd()
                    });
                    child.on('error', function (error) {
                        console.error('❌ List error:', error.message);
                    });
                }
                catch (error) {
                    console.error('❌ List failed:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get workflow details
     */
    N8NIntegrationCLI.prototype.getWorkflowDetails = function (workflowId) {
        return __awaiter(this, void 0, void 0, function () {
            var debugScriptPath, child;
            return __generator(this, function (_a) {
                console.log("\uD83D\uDCCB Workflow Details: ".concat(workflowId));
                console.log('===============================');
                try {
                    debugScriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'debug-quark-workflow.js');
                    if (!fs.existsSync(debugScriptPath)) {
                        console.error('❌ Debug script not found:', debugScriptPath);
                        return [2 /*return*/];
                    }
                    child = (0, child_process_1.spawn)('node', [debugScriptPath], {
                        stdio: 'inherit',
                        cwd: process.cwd()
                    });
                    child.on('error', function (error) {
                        console.error('❌ Debug error:', error.message);
                    });
                }
                catch (error) {
                    console.error('❌ Debug failed:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Sync specific workflow
     */
    N8NIntegrationCLI.prototype.syncSpecificWorkflow = function (workflowId) {
        return __awaiter(this, void 0, void 0, function () {
            var syncScriptPath, child;
            return __generator(this, function (_a) {
                console.log("\uD83D\uDD04 Syncing Workflow: ".concat(workflowId));
                console.log('===============================');
                try {
                    syncScriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'direct-json-n8n-sync.js');
                    if (!fs.existsSync(syncScriptPath)) {
                        console.error('❌ Sync script not found:', syncScriptPath);
                        return [2 /*return*/];
                    }
                    console.log("\uD83D\uDCE4 Syncing workflow ".concat(workflowId, "..."));
                    child = (0, child_process_1.spawn)('node', [syncScriptPath, 'sync'], {
                        stdio: 'inherit',
                        cwd: process.cwd()
                    });
                    child.on('error', function (error) {
                        console.error('❌ Sync error:', error.message);
                    });
                    child.on('exit', function (code) {
                        if (code === 0) {
                            console.log("\u2705 Workflow ".concat(workflowId, " synced successfully"));
                        }
                        else {
                            console.log("\u274C Sync failed with code: ".concat(code));
                        }
                    });
                }
                catch (error) {
                    console.error('❌ Sync failed:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get the CLI program
     */
    N8NIntegrationCLI.prototype.getProgram = function () {
        return this.program;
    };
    return N8NIntegrationCLI;
}());
exports.N8NIntegrationCLI = N8NIntegrationCLI;
// Export for use in main CLI
exports.default = N8NIntegrationCLI;
