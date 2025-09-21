"use strict";
/**
 * VSCode Adapter - VSCode-specific implementation
 *
 * Adapts the universal extension core to VSCode's API
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
exports.createVSCodeExtension = exports.VSCodeAdapter = void 0;
var vscode = require("vscode");
var extension_core_1 = require("./extension-core");
var VSCodeAdapter = /** @class */ (function () {
    function VSCodeAdapter(extensionContext) {
        this.extensionContext = extensionContext;
    }
    VSCodeAdapter.prototype.showMessage = function (message, type) {
        if (type === void 0) { type = 'info'; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (type) {
                    case 'info':
                        vscode.window.showInformationMessage(message);
                        break;
                    case 'warning':
                        vscode.window.showWarningMessage(message);
                        break;
                    case 'error':
                        vscode.window.showErrorMessage(message);
                        break;
                }
                return [2 /*return*/];
            });
        });
    };
    VSCodeAdapter.prototype.showInputBox = function (prompt, placeholder) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.window.showInputBox({
                            prompt: prompt,
                            placeHolder: placeholder,
                            validateInput: function (value) { return value.trim().length > 0 ? null : 'Please enter a message'; }
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VSCodeAdapter.prototype.showQuickPick = function (items, placeholder) {
        return __awaiter(this, void 0, void 0, function () {
            var selected;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.window.showQuickPick(items, {
                            placeHolder: placeholder,
                            canPickMany: false
                        })];
                    case 1:
                        selected = _a.sent();
                        return [2 /*return*/, selected];
                }
            });
        });
    };
    VSCodeAdapter.prototype.createDocument = function (content, language) {
        if (language === void 0) { language = 'markdown'; }
        return __awaiter(this, void 0, void 0, function () {
            var doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.workspace.openTextDocument({
                            content: content,
                            language: language
                        })];
                    case 1:
                        doc = _a.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(doc)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    VSCodeAdapter.prototype.insertText = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, position_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) return [3 /*break*/, 2];
                        position_1 = editor.selection.active;
                        return [4 /*yield*/, editor.edit(function (editBuilder) {
                                editBuilder.insert(position_1, text);
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    VSCodeAdapter.prototype.getActiveFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, document, selection;
            return __generator(this, function (_a) {
                editor = vscode.window.activeTextEditor;
                if (!editor)
                    return [2 /*return*/, undefined];
                document = editor.document;
                selection = editor.selection;
                return [2 /*return*/, {
                        path: document.fileName,
                        content: document.getText(),
                        language: document.languageId,
                        selection: {
                            start: document.offsetAt(selection.start),
                            end: document.offsetAt(selection.end)
                        }
                    }];
            });
        });
    };
    VSCodeAdapter.prototype.getWorkspacePath = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolder;
            return __generator(this, function (_b) {
                workspaceFolder = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0];
                return [2 /*return*/, (workspaceFolder === null || workspaceFolder === void 0 ? void 0 : workspaceFolder.uri.fsPath) || process.cwd()];
            });
        });
    };
    VSCodeAdapter.prototype.getProjectType = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspacePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getWorkspacePath()];
                    case 1:
                        workspacePath = _a.sent();
                        return [4 /*yield*/, this.fileExists(workspacePath, 'package.json')];
                    case 2:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        return [2 /*return*/, 'node'];
                    case 3: return [4 /*yield*/, this.fileExists(workspacePath, 'requirements.txt')];
                    case 4:
                        if (!_a.sent()) return [3 /*break*/, 5];
                        return [2 /*return*/, 'python'];
                    case 5: return [4 /*yield*/, this.fileExists(workspacePath, 'Cargo.toml')];
                    case 6:
                        if (!_a.sent()) return [3 /*break*/, 7];
                        return [2 /*return*/, 'rust'];
                    case 7: return [4 /*yield*/, this.fileExists(workspacePath, 'pom.xml')];
                    case 8:
                        if (!_a.sent()) return [3 /*break*/, 9];
                        return [2 /*return*/, 'java'];
                    case 9: return [4 /*yield*/, this.fileExists(workspacePath, 'go.mod')];
                    case 10:
                        if (_a.sent()) {
                            return [2 /*return*/, 'go'];
                        }
                        _a.label = 11;
                    case 11: return [2 /*return*/, 'unknown'];
                }
            });
        });
    };
    VSCodeAdapter.prototype.getDependencies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspacePath, packageJsonPath, packageJsonContent, packageJson, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getWorkspacePath()];
                    case 1:
                        workspacePath = _b.sent();
                        packageJsonPath = vscode.Uri.joinPath(vscode.Uri.file(workspacePath), 'package.json');
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, vscode.workspace.fs.readFile(packageJsonPath)];
                    case 3:
                        packageJsonContent = _b.sent();
                        packageJson = JSON.parse(packageJsonContent.toString());
                        return [2 /*return*/, Object.keys(packageJson.dependencies || {})];
                    case 4:
                        _a = _b.sent();
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    VSCodeAdapter.prototype.fileExists = function (workspacePath, fileName) {
        return __awaiter(this, void 0, void 0, function () {
            var filePath, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        filePath = vscode.Uri.joinPath(vscode.Uri.file(workspacePath), fileName);
                        return [4 /*yield*/, vscode.workspace.fs.stat(filePath)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return VSCodeAdapter;
}());
exports.VSCodeAdapter = VSCodeAdapter;
function createVSCodeExtension(extensionContext) {
    var _this = this;
    var adapter = new VSCodeAdapter(extensionContext);
    var core = new extension_core_1.UniversalExtensionCore(adapter);
    // Register VSCode commands
    var engageCommand = vscode.commands.registerCommand('alex-ai.engage', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.engage()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    var statusCommand = vscode.commands.registerCommand('alex-ai.status', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.showStatus()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    var crewCommand = vscode.commands.registerCommand('alex-ai.crew', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.showCrew()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    var quickChatCommand = vscode.commands.registerCommand('alex-ai.quickChat', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.quickChat()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Register all commands
    extensionContext.subscriptions.push(engageCommand, statusCommand, crewCommand, quickChatCommand);
    return core;
}
exports.createVSCodeExtension = createVSCodeExtension;
