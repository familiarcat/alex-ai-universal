#!/usr/bin/env node
"use strict";
/**
 * Simple Alex AI CLI - Minimal Working Version
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
var core_1 = require("@alex-ai/core");
var commander = require("commander");
var program = new commander.Command();
program
    .name('alex-ai')
    .description('Alex AI Universal - AI Code Assistant')
    .version('1.0.0');
program
    .command('init')
    .description('Initialize Alex AI')
    .action(function () { return __awaiter(void 0, void 0, void 0, function () {
    var alexAI;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('🚀 Initializing Alex AI...');
                alexAI = new core_1.MinimalAlexAI();
                return [4 /*yield*/, alexAI.initialize()];
            case 1:
                _a.sent();
                console.log('✅ Alex AI initialized successfully!');
                return [2 /*return*/];
        }
    });
}); });
program
    .command('status')
    .description('Check Alex AI status')
    .action(function () { return __awaiter(void 0, void 0, void 0, function () {
    var alexAI, status;
    return __generator(this, function (_a) {
        console.log('📊 Checking Alex AI status...');
        alexAI = new core_1.MinimalAlexAI();
        status = alexAI.getStatus();
        console.log('Status:', status);
        return [2 /*return*/];
    });
}); });
program
    .command('chat <message>')
    .description('Chat with Alex AI')
    .action(function (message) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log('💬 Chatting with Alex AI...');
        console.log('Message:', message);
        console.log('Response: Hello! I am Alex AI, your AI code assistant. How can I help you today?');
        return [2 /*return*/];
    });
}); });
program
    .command('help')
    .description('Show help information')
    .action(function () {
    console.log('🖖 Alex AI Universal - AI Code Assistant');
    console.log('');
    console.log('Available commands:');
    console.log('  init     - Initialize Alex AI');
    console.log('  status   - Check Alex AI status');
    console.log('  chat     - Chat with Alex AI');
    console.log('  help     - Show this help');
    console.log('');
    console.log('Examples:');
    console.log('  alex-ai init');
    console.log('  alex-ai status');
    console.log('  alex-ai chat "Hello Alex AI"');
});
// Parse command line arguments
program.parse();
// If no command provided, show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
