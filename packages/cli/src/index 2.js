"use strict";
/**
 * Universal Alex AI CLI
 *
 * Main entry point for the universal Alex AI CLI package
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignedCrewMember = exports.CrewCoordinator = exports.ContextManager = exports.ProjectDetector = exports.AlexAICLI = void 0;
var cli_1 = require("./cli");
Object.defineProperty(exports, "AlexAICLI", { enumerable: true, get: function () { return cli_1.AlexAICLI; } });
var project_detector_1 = require("./project-detector");
Object.defineProperty(exports, "ProjectDetector", { enumerable: true, get: function () { return project_detector_1.ProjectDetector; } });
var context_manager_1 = require("./context-manager");
Object.defineProperty(exports, "ContextManager", { enumerable: true, get: function () { return context_manager_1.ContextManager; } });
var crew_coordinator_1 = require("./crew-coordinator");
Object.defineProperty(exports, "CrewCoordinator", { enumerable: true, get: function () { return crew_coordinator_1.CrewCoordinator; } });
Object.defineProperty(exports, "AssignedCrewMember", { enumerable: true, get: function () { return crew_coordinator_1.AssignedCrewMember; } });
