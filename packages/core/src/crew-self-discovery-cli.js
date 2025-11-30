"use strict";
/**
 * Crew Self-Discovery CLI
 *
 * Command-line interface for the crew self-discovery system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrewSelfDiscoveryCLI = void 0;
const crew_self_discovery_1 = require("./crew-self-discovery");
class CrewSelfDiscoveryCLI {
    constructor() {
        this.discoverySystem = new crew_self_discovery_1.CrewSelfDiscoverySystem();
    }
    /**
     * Initialize the CLI commands
     */
    initializeCommands(program) {
        const discoveryCommand = program
            .command('crew-discovery')
            .description('Crew self-discovery and feature enhancement system');
        // Start a self-discovery session
        discoveryCommand
            .command('start <crewMember>')
            .description('Start a self-discovery session for a crew member')
            .action(async (crewMember) => {
            try {
                const sessionId = await this.discoverySystem.startSelfDiscoverySession(crewMember);
                console.log(`🖖 Self-discovery session started for ${crewMember}`);
                console.log(`Session ID: ${sessionId}`);
            }
            catch (error) {
                console.error('❌ Error starting session:', error);
            }
        });
        // Add a feature to a crew member
        discoveryCommand
            .command('add-feature <crewMember> <name> <description> <category>')
            .description('Add a feature to a crew member')
            .option('-i, --impact <level>', 'Impact level (low, medium, high, critical)', 'medium')
            .option('-d, --dependencies <deps>', 'Comma-separated dependencies')
            .action(async (crewMember, name, description, category, options) => {
            try {
                const feature = {
                    id: `feature-${Date.now()}`,
                    name,
                    description,
                    category: category,
                    implementation: `Implementation for ${name}`,
                    testCases: [`Test case 1 for ${name}`, `Test case 2 for ${name}`],
                    dependencies: options.dependencies ? options.dependencies.split(',') : [],
                    impact: options.impact
                };
                const addedFeature = await this.discoverySystem.addFeatureToCrewMember(crewMember, feature);
                console.log(`✅ Feature "${name}" added to ${crewMember}`);
                console.log(`Feature ID: ${addedFeature.id}`);
            }
            catch (error) {
                console.error('❌ Error adding feature:', error);
            }
        });
        // Generate introspection for a crew member
        discoveryCommand
            .command('introspect <crewMember> <sessionId>')
            .description('Generate introspection for a crew member')
            .action(async (crewMember, sessionId) => {
            try {
                const introspection = await this.discoverySystem.generateIntrospection(crewMember, sessionId);
                console.log(`\n🖖 ${crewMember}'s Self-Discovery Introspection`);
                console.log('='.repeat(50));
                console.log(`\nSelf-Awareness:`);
                console.log(introspection.selfAwareness);
                console.log(`\nCapability Growth:`);
                console.log(introspection.capabilityGrowth);
                console.log(`\nIdentity Evolution:`);
                console.log(introspection.identityEvolution);
                console.log(`\nSystem Integration:`);
                console.log(introspection.systemIntegration);
                console.log(`\nChallenges:`);
                introspection.challenges.forEach((challenge, index) => {
                    console.log(`${index + 1}. ${challenge}`);
                });
                console.log(`\nInsights:`);
                introspection.insights.forEach((insight, index) => {
                    console.log(`${index + 1}. ${insight}`);
                });
                console.log(`\nFuture Aspirations:`);
                console.log(introspection.futureAspirations);
            }
            catch (error) {
                console.error('❌ Error generating introspection:', error);
            }
        });
        // Complete a self-discovery session
        discoveryCommand
            .command('complete <sessionId>')
            .description('Complete a self-discovery session and generate full report')
            .action(async (sessionId) => {
            try {
                const report = await this.discoverySystem.completeSelfDiscoverySession(sessionId);
                this.displayFullReport(report);
            }
            catch (error) {
                console.error('❌ Error completing session:', error);
            }
        });
        // List crew member features
        discoveryCommand
            .command('list-features <crewMember>')
            .description('List all features for a crew member')
            .action(async (crewMember) => {
            try {
                const features = this.discoverySystem.getCrewMemberFeatures(crewMember);
                console.log(`\n🔧 Features for ${crewMember}:`);
                console.log('='.repeat(40));
                if (features.length === 0) {
                    console.log('No features added yet.');
                    return;
                }
                features.forEach((feature, index) => {
                    console.log(`\n${index + 1}. ${feature.name}`);
                    console.log(`   Description: ${feature.description}`);
                    console.log(`   Category: ${feature.category}`);
                    console.log(`   Impact: ${feature.impact}`);
                    console.log(`   Status: ${feature.status}`);
                    console.log(`   Added: ${feature.addedAt.toLocaleString()}`);
                });
            }
            catch (error) {
                console.error('❌ Error listing features:', error);
            }
        });
        // Show crew member statistics
        discoveryCommand
            .command('stats <crewMember>')
            .description('Show statistics for a crew member')
            .action(async (crewMember) => {
            try {
                const stats = this.discoverySystem.getCrewMemberStats(crewMember);
                console.log(`\n📊 Statistics for ${crewMember}:`);
                console.log('='.repeat(40));
                console.log(`Total Features: ${stats.totalFeatures}`);
                console.log(`Completed Features: ${stats.completedFeatures}`);
                console.log(`Completion Rate: ${((stats.completedFeatures / stats.totalFeatures) * 100).toFixed(1)}%`);
                console.log(`Average Impact: ${stats.averageImpact}`);
                console.log(`\nFeatures by Category:`);
                Object.entries(stats.categories).forEach(([category, count]) => {
                    console.log(`  ${category}: ${count}`);
                });
            }
            catch (error) {
                console.error('❌ Error getting stats:', error);
            }
        });
        // Run a complete self-discovery demo
        discoveryCommand
            .command('demo')
            .description('Run a complete self-discovery demo for all crew members')
            .action(async () => {
            await this.runCompleteDemo();
        });
    }
    /**
     * Display a full self-discovery report
     */
    displayFullReport(report) {
        console.log(`\n🎯 COMPLETE SELF-DISCOVERY REPORT`);
        console.log('='.repeat(60));
        console.log(`Crew Member: ${report.crewMember}`);
        console.log(`Session ID: ${report.sessionId}`);
        console.log(`Duration: ${this.calculateDuration(report.startTime, report.endTime)}`);
        console.log(`Features Added: ${report.featuresAdded.length}`);
        console.log(`\n🖖 INTROSPECTION:`);
        console.log('-'.repeat(30));
        console.log(`\nSelf-Awareness:`);
        console.log(report.introspection.selfAwareness);
        console.log(`\nCapability Growth:`);
        console.log(report.introspection.capabilityGrowth);
        console.log(`\nIdentity Evolution:`);
        console.log(report.introspection.identityEvolution);
        console.log(`\nSystem Integration:`);
        console.log(report.introspection.systemIntegration);
        console.log(`\nChallenges:`);
        report.introspection.challenges.forEach((challenge, index) => {
            console.log(`${index + 1}. ${challenge}`);
        });
        console.log(`\nInsights:`);
        report.introspection.insights.forEach((insight, index) => {
            console.log(`${index + 1}. ${insight}`);
        });
        console.log(`\nFuture Aspirations:`);
        console.log(report.introspection.futureAspirations);
        console.log(`\n🚀 SYSTEM IMPACT:`);
        console.log('-'.repeat(30));
        console.log(`\nPerformance Improvements:`);
        report.systemImpact.performanceImprovements.forEach((improvement, index) => {
            console.log(`${index + 1}. ${improvement}`);
        });
        console.log(`\nNew Capabilities:`);
        report.systemImpact.newCapabilities.forEach((capability, index) => {
            console.log(`${index + 1}. ${capability}`);
        });
        console.log(`\nIntegration Enhancements:`);
        report.systemImpact.integrationEnhancements.forEach((enhancement, index) => {
            console.log(`${index + 1}. ${enhancement}`);
        });
        console.log(`\nArchitectural Changes:`);
        report.systemImpact.architecturalChanges.forEach((change, index) => {
            console.log(`${index + 1}. ${change}`);
        });
        console.log(`\n🤝 CREW COLLABORATION:`);
        console.log('-'.repeat(30));
        console.log(`\nInteractions:`);
        report.crewCollaboration.interactions.forEach((interaction, index) => {
            console.log(`${index + 1}. ${interaction}`);
        });
        console.log(`\nShared Learnings:`);
        report.crewCollaboration.sharedLearnings.forEach((learning, index) => {
            console.log(`${index + 1}. ${learning}`);
        });
        console.log(`\nCollective Growth:`);
        console.log(report.crewCollaboration.collectiveGrowth);
    }
    /**
     * Calculate duration between two dates
     */
    calculateDuration(start, end) {
        const diff = end.getTime() - start.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    }
    /**
     * Run a complete self-discovery demo
     */
    async runCompleteDemo() {
        console.log(`\n🖖 ALEX AI CREW SELF-DISCOVERY DEMO`);
        console.log('='.repeat(50));
        console.log('Initiating self-discovery sessions for all crew members...\n');
        const crewMembers = [
            'Captain Picard', 'Commander Data', 'Commander Riker', 'Lieutenant Worf',
            'Counselor Troi', 'Dr. Crusher', 'Geordi La Forge', 'Lieutenant Uhura'
        ];
        const sessions = [];
        // Start sessions for all crew members
        for (const crewMember of crewMembers) {
            try {
                const sessionId = await this.discoverySystem.startSelfDiscoverySession(crewMember);
                sessions.push({ crewMember, sessionId });
                console.log(`✅ Started session for ${crewMember}`);
            }
            catch (error) {
                console.error(`❌ Error starting session for ${crewMember}:`, error);
            }
        }
        console.log('\n🔧 Adding features to crew members...\n');
        // Add features to each crew member
        for (const { crewMember, sessionId } of sessions) {
            try {
                // Add 2-3 features per crew member
                const features = this.getDemoFeaturesForCrewMember(crewMember);
                for (const feature of features) {
                    await this.discoverySystem.addFeatureToCrewMember(crewMember, feature);
                    console.log(`  ✅ Added "${feature.name}" to ${crewMember}`);
                }
            }
            catch (error) {
                console.error(`❌ Error adding features to ${crewMember}:`, error);
            }
        }
        console.log('\n🎯 Completing self-discovery sessions...\n');
        // Complete all sessions and display reports
        for (const { crewMember, sessionId } of sessions) {
            try {
                const report = await this.discoverySystem.completeSelfDiscoverySession(sessionId);
                console.log(`\n${'='.repeat(60)}`);
                console.log(`🖖 ${crewMember.toUpperCase()} - SELF-DISCOVERY COMPLETE`);
                console.log(`${'='.repeat(60)}`);
                // Display key insights
                console.log(`\nSelf-Awareness:`);
                console.log(report.introspection.selfAwareness);
                console.log(`\nKey Insight:`);
                console.log(report.introspection.insights[0]);
                console.log(`\nFuture Aspiration:`);
                console.log(report.introspection.futureAspirations);
                console.log(`\nFeatures Added: ${report.featuresAdded.length}`);
                console.log(`System Impact: ${report.systemImpact.performanceImprovements.length} improvements`);
                console.log('\n' + '-'.repeat(60));
            }
            catch (error) {
                console.error(`❌ Error completing session for ${crewMember}:`, error);
            }
        }
        console.log(`\n🎉 SELF-DISCOVERY DEMO COMPLETE!`);
        console.log('All crew members have completed their self-discovery journey.');
        console.log('The crew is now more capable, self-aware, and ready for any challenge!');
    }
    /**
     * Get demo features for a specific crew member
     */
    getDemoFeaturesForCrewMember(crewMember) {
        const featureSets = {
            'Captain Picard': [
                {
                    id: `picard-${Date.now()}-1`,
                    name: 'Enhanced Strategic Planning',
                    description: 'Advanced strategic planning capabilities with multi-scenario analysis',
                    category: 'capability',
                    implementation: 'Implemented advanced decision trees and scenario modeling',
                    testCases: ['Test strategic planning with complex scenarios', 'Validate decision accuracy'],
                    dependencies: [],
                    impact: 'high'
                },
                {
                    id: `picard-${Date.now()}-2`,
                    name: 'Diplomatic Protocol Mastery',
                    description: 'Enhanced diplomatic skills for complex negotiations',
                    category: 'expertise',
                    implementation: 'Integrated cultural database and protocol guidelines',
                    testCases: ['Test diplomatic scenarios', 'Validate protocol adherence'],
                    dependencies: ['Enhanced Strategic Planning'],
                    impact: 'high'
                }
            ],
            'Commander Data': [
                {
                    id: `data-${Date.now()}-1`,
                    name: 'Advanced Pattern Recognition',
                    description: 'Enhanced ability to identify patterns in complex data sets',
                    category: 'capability',
                    implementation: 'Implemented machine learning algorithms for pattern detection',
                    testCases: ['Test pattern recognition accuracy', 'Validate data processing speed'],
                    dependencies: [],
                    impact: 'critical'
                },
                {
                    id: `data-${Date.now()}-2`,
                    name: 'Emotional Intelligence Module',
                    description: 'New module for understanding and responding to emotional cues',
                    category: 'personality',
                    implementation: 'Integrated emotional analysis algorithms',
                    testCases: ['Test emotional recognition', 'Validate appropriate responses'],
                    dependencies: [],
                    impact: 'high'
                }
            ],
            'Commander Riker': [
                {
                    id: `riker-${Date.now()}-1`,
                    name: 'Tactical Coordination Mastery',
                    description: 'Enhanced ability to coordinate complex tactical operations',
                    category: 'capability',
                    implementation: 'Implemented real-time coordination algorithms',
                    testCases: ['Test tactical coordination', 'Validate response times'],
                    dependencies: [],
                    impact: 'high'
                },
                {
                    id: `riker-${Date.now()}-2`,
                    name: 'Crew Leadership Enhancement',
                    description: 'Improved leadership skills for crew management',
                    category: 'expertise',
                    implementation: 'Integrated leadership psychology principles',
                    testCases: ['Test leadership scenarios', 'Validate crew satisfaction'],
                    dependencies: [],
                    impact: 'medium'
                }
            ],
            'Lieutenant Worf': [
                {
                    id: `worf-${Date.now()}-1`,
                    name: 'Advanced Security Protocols',
                    description: 'Enhanced security analysis and threat assessment capabilities',
                    category: 'capability',
                    implementation: 'Implemented advanced security algorithms',
                    testCases: ['Test threat detection', 'Validate security protocols'],
                    dependencies: [],
                    impact: 'critical'
                },
                {
                    id: `worf-${Date.now()}-2`,
                    name: 'Honor Code Integration',
                    description: 'Integration of Klingon honor code with Starfleet protocols',
                    category: 'personality',
                    implementation: 'Developed honor-based decision making framework',
                    testCases: ['Test honor code adherence', 'Validate protocol compliance'],
                    dependencies: [],
                    impact: 'high'
                }
            ],
            'Counselor Troi': [
                {
                    id: `troi-${Date.now()}-1`,
                    name: 'Enhanced Empathic Abilities',
                    description: 'Improved ability to sense and understand emotional states',
                    category: 'capability',
                    implementation: 'Enhanced empathic processing algorithms',
                    testCases: ['Test empathic accuracy', 'Validate emotional responses'],
                    dependencies: [],
                    impact: 'high'
                },
                {
                    id: `troi-${Date.now()}-2`,
                    name: 'Cross-Species Psychology',
                    description: 'Enhanced understanding of different species psychology',
                    category: 'expertise',
                    implementation: 'Integrated multi-species psychological database',
                    testCases: ['Test cross-species understanding', 'Validate counseling effectiveness'],
                    dependencies: ['Enhanced Empathic Abilities'],
                    impact: 'medium'
                }
            ],
            'Dr. Crusher': [
                {
                    id: `crusher-${Date.now()}-1`,
                    name: 'Advanced Medical Diagnostics',
                    description: 'Enhanced diagnostic capabilities for complex medical conditions',
                    category: 'capability',
                    implementation: 'Implemented advanced diagnostic algorithms',
                    testCases: ['Test diagnostic accuracy', 'Validate treatment effectiveness'],
                    dependencies: [],
                    impact: 'critical'
                },
                {
                    id: `crusher-${Date.now()}-2`,
                    name: 'Holistic Health Approach',
                    description: 'Integration of physical, mental, and emotional health approaches',
                    category: 'expertise',
                    implementation: 'Developed integrated health assessment framework',
                    testCases: ['Test holistic assessments', 'Validate treatment outcomes'],
                    dependencies: [],
                    impact: 'high'
                }
            ],
            'Geordi La Forge': [
                {
                    id: `laforge-${Date.now()}-1`,
                    name: 'Advanced Engineering Solutions',
                    description: 'Enhanced ability to design and implement complex engineering solutions',
                    category: 'capability',
                    implementation: 'Implemented advanced engineering algorithms',
                    testCases: ['Test engineering solutions', 'Validate system performance'],
                    dependencies: [],
                    impact: 'high'
                },
                {
                    id: `laforge-${Date.now()}-2`,
                    name: 'Innovation Catalyst',
                    description: 'Enhanced ability to inspire and facilitate innovation',
                    category: 'personality',
                    implementation: 'Developed innovation facilitation framework',
                    testCases: ['Test innovation processes', 'Validate creative outcomes'],
                    dependencies: [],
                    impact: 'medium'
                }
            ],
            'Lieutenant Uhura': [
                {
                    id: `uhura-${Date.now()}-1`,
                    name: 'Universal Communication Mastery',
                    description: 'Enhanced ability to communicate across all species and cultures',
                    category: 'capability',
                    implementation: 'Implemented universal communication protocols',
                    testCases: ['Test communication accuracy', 'Validate cultural sensitivity'],
                    dependencies: [],
                    impact: 'high'
                },
                {
                    id: `uhura-${Date.now()}-2`,
                    name: 'Information Flow Optimization',
                    description: 'Enhanced ability to optimize information flow and coordination',
                    category: 'expertise',
                    implementation: 'Developed information flow algorithms',
                    testCases: ['Test information efficiency', 'Validate coordination effectiveness'],
                    dependencies: ['Universal Communication Mastery'],
                    impact: 'medium'
                }
            ]
        };
        return featureSets[crewMember] || [];
    }
}
exports.CrewSelfDiscoveryCLI = CrewSelfDiscoveryCLI;
//# sourceMappingURL=crew-self-discovery-cli.js.map