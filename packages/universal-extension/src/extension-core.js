"use strict";
/**
 * Universal Extension Core - Shared Code for VSCode and Cursor
 *
 * This is the single source of truth for all IDE extensions
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
exports.__esModule = true;
exports.UniversalExtensionCore = void 0;
var core_1 = require("@alex-ai/core");
var UniversalExtensionCore = /** @class */ (function () {
    function UniversalExtensionCore(extensionAPI) {
        this.isInitialized = false;
        this.alexAI = new core_1.UniversalAlexAIManager();
        this.extensionAPI = extensionAPI;
    }
    UniversalExtensionCore.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isInitialized)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        config = {
                            environment: 'development',
                            enableN8NIntegration: true,
                            enableStealthScraping: true,
                            enableCrewManagement: true,
                            enableTesting: true,
                            logLevel: 'info'
                        };
                        return [4 /*yield*/, this.alexAI.initialize(config)];
                    case 2:
                        _a.sent();
                        this.isInitialized = true;
                        console.log('✅ Universal Extension Core initialized');
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('❌ Failed to initialize Universal Extension Core:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    UniversalExtensionCore.prototype.engage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var context, userMessage, response, responseContent, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, this.getCurrentContext()];
                    case 3:
                        context = _a.sent();
                        return [4 /*yield*/, this.extensionAPI.showInputBox('What would you like the crew to help you with?', 'Ask the crew anything...')];
                    case 4:
                        userMessage = _a.sent();
                        if (!userMessage)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.alexAI.sendMessage({
                                message: userMessage,
                                context: context
                            })];
                    case 5:
                        response = _a.sent();
                        responseContent = "# Alex AI Response - ".concat(response.crewMember, "\n\n").concat(response.response, "\n\n**Timestamp:** ").concat(response.timestamp, "\n\n").concat(response.suggestions && response.suggestions.length > 0 ?
                            "## Suggestions\n\n".concat(response.suggestions.map(function (s) { return "- ".concat(s); }).join('\n')) : '', "\n\n").concat(response.codeActions && response.codeActions.length > 0 ?
                            "## Available Actions\n\n".concat(response.codeActions.map(function (a) { return "- **".concat(a.title, "**: ").concat(a.description); }).join('\n')) : '');
                        return [4 /*yield*/, this.extensionAPI.createDocument(responseContent, 'markdown')];
                    case 6:
                        _a.sent();
                        if (response.suggestions && response.suggestions.length > 0) {
                            this.extensionAPI.showMessage("Alex AI has ".concat(response.suggestions.length, " suggestions for you!"), 'info');
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _a.sent();
                        this.extensionAPI.showMessage("Alex AI Error: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)), 'error');
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    UniversalExtensionCore.prototype.showStatus = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var status_1, context, statusContent, _b, _c, error_3;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, this.alexAI.getStatus()];
                    case 3:
                        status_1 = _d.sent();
                        return [4 /*yield*/, this.getCurrentContext()];
                    case 4:
                        context = _d.sent();
                        _c = (_b = "# Alex AI Status Report\n\n## System Status\n- **Initialized:** ".concat(status_1.isInitialized ? '✅ Yes' : '❌ No', "\n- **Connected:** ").concat(status_1.isConnected ? '✅ Yes' : '❌ No', "\n- **Active Crew:** ").concat(status_1.activeCrewMember, "\n- **Last Activity:** ").concat(new Date(status_1.lastActivity).toLocaleString(), "\n- **Messages:** ").concat(status_1.messageCount, "\n- **Errors:** ").concat(status_1.errorCount, "\n\n## Project Context\n- **Workspace:** ").concat(context.workspacePath, "\n- **Project Type:** ").concat(context.projectType, "\n- **Dependencies:** ").concat(context.dependencies.length, " packages\n- **Active File:** ").concat(((_a = context.activeFile) === null || _a === void 0 ? void 0 : _a.path) || 'None', "\n\n## Available Crew Members\n")).concat;
                        return [4 /*yield*/, this.alexAI.getCrewMembers()];
                    case 5:
                        statusContent = _c.apply(_b, [(_d.sent()).map(function (member) {
                                return "- **".concat(member.name, "** - ").concat(member.department, " (").concat(member.specialization, ")");
                            }).join('\n')]);
                        return [4 /*yield*/, this.extensionAPI.createDocument(statusContent, 'markdown')];
                    case 6:
                        _d.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_3 = _d.sent();
                        this.extensionAPI.showMessage("Status Error: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)), 'error');
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    UniversalExtensionCore.prototype.showCrew = function () {
        return __awaiter(this, void 0, void 0, function () {
            var crewMembers, crewList, crewContent, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, this.alexAI.getCrewMembers()];
                    case 3:
                        crewMembers = _a.sent();
                        crewList = crewMembers.map(function (member) {
                            return "## ".concat(member.name, "\n- **Department:** ").concat(member.department, "\n- **Specialization:** ").concat(member.specialization, "\n- **Capabilities:** ").concat(member.capabilities.join(', '), "\n- **Avatar:** ").concat(member.avatar || '🤖', "\n\n---");
                        }).join('\n');
                        crewContent = "# Alex AI Crew Members\n\n".concat(crewList, "\n\n## How to Use\n1. Use the command palette to \"Engage Alex AI\"\n2. Ask questions or request help\n3. The crew will automatically select the best member for your task\n4. Each crew member has unique expertise and personality");
                        return [4 /*yield*/, this.extensionAPI.createDocument(crewContent, 'markdown')];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_4 = _a.sent();
                        this.extensionAPI.showMessage("Crew Error: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)), 'error');
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    UniversalExtensionCore.prototype.quickChat = function () {
        return __awaiter(this, void 0, void 0, function () {
            var context, userMessage, response, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, this.getCurrentContext()];
                    case 3:
                        context = _a.sent();
                        return [4 /*yield*/, this.extensionAPI.showInputBox('Quick question for the crew:', 'Type your question...')];
                    case 4:
                        userMessage = _a.sent();
                        if (!userMessage)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.alexAI.sendMessage({
                                message: userMessage,
                                context: context
                            })];
                    case 5:
                        response = _a.sent();
                        this.extensionAPI.showMessage("[".concat(response.crewMember, "] ").concat(response.response), 'info');
                        return [3 /*break*/, 7];
                    case 6:
                        error_5 = _a.sent();
                        this.extensionAPI.showMessage("Quick Chat Error: ".concat(error_5 instanceof Error ? error_5.message : String(error_5)), 'error');
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    UniversalExtensionCore.prototype.getCurrentContext = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspacePath, activeFile, projectType, dependencies;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.extensionAPI.getWorkspacePath()];
                    case 1:
                        workspacePath = _a.sent();
                        return [4 /*yield*/, this.extensionAPI.getActiveFile()];
                    case 2:
                        activeFile = _a.sent();
                        return [4 /*yield*/, this.extensionAPI.getProjectType()];
                    case 3:
                        projectType = _a.sent();
                        return [4 /*yield*/, this.extensionAPI.getDependencies()];
                    case 4:
                        dependencies = _a.sent();
                        return [2 /*return*/, {
                                workspacePath: workspacePath,
                                activeFile: activeFile,
                                projectType: projectType,
                                dependencies: dependencies
                            }];
                }
            });
        });
    };
    UniversalExtensionCore.prototype.getCrewMembers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.alexAI.getCrewMembers()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    UniversalExtensionCore.prototype.getStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.alexAI.getStatus()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return UniversalExtensionCore;
}());
exports.UniversalExtensionCore = UniversalExtensionCore;
