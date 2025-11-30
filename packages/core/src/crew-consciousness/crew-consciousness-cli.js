"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrewConsciousnessCLI = void 0;
const crew_consciousness_workflow_1 = require("./crew-consciousness-workflow");
class CrewConsciousnessCLI {
    constructor() {
        // Mock credentials for demo
        const n8nCreds = { apiUrl: 'mock-n8n-url', apiKey: 'mock-n8n-key' };
        const supabaseConf = { url: 'mock-supabase-url', anonKey: 'mock-anon-key', serviceRoleKey: 'mock-service-key' };
        this.workflow = new crew_consciousness_workflow_1.CrewConsciousnessWorkflow(n8nCreds, supabaseConf);
    }
    initializeCommands(program) {
        const consciousnessCommand = program
            .command('crew-consciousness')
            .description('Crew consciousness and cohesive project analysis system');
        // Initialize new crew consciousness session
        consciousnessCommand
            .command('init')
            .description('Initialize new crew consciousness session for project analysis')
            .option('-n, --name <name>', 'Project name')
            .option('-t, --type <type>', 'Project type')
            .option('-c, --client <client>', 'Client name')
            .option('-tech, --technologies <technologies>', 'Comma-separated technologies')
            .option('-d, --description <description>', 'Project description')
            .option('-o, --objectives <objectives>', 'Comma-separated objectives')
            .option('-con, --constraints <constraints>', 'Comma-separated constraints')
            .option('-tl, --timeline <timeline>', 'Project timeline')
            .action(async (options) => {
            try {
                const projectRequest = {
                    projectName: options.name || 'Default Project',
                    projectType: options.type || 'AI Application',
                    client: options.client || 'Enterprise Client',
                    technologies: options.technologies ? options.technologies.split(',') : ['Next.js', 'TypeScript'],
                    description: options.description || 'AI-powered application development',
                    objectives: options.objectives ? options.objectives.split(',') : ['Deliver high-quality solution'],
                    constraints: options.constraints ? options.constraints.split(',') : [],
                    timeline: options.timeline || '8 weeks',
                };
                const sessionId = await this.workflow.initializeSession(projectRequest);
                console.log(`✅ Crew consciousness session initialized: ${sessionId}`);
                console.log(`Project: ${projectRequest.projectName}`);
                console.log(`Client: ${projectRequest.client}`);
                console.log(`Technologies: ${projectRequest.technologies.join(', ')}`);
            }
            catch (error) {
                console.error('❌ Error initializing session:', error);
            }
        });
        // Process crew member analysis
        consciousnessCommand
            .command('analyze <sessionId> <crewMember>')
            .description('Process individual crew member analysis for a session')
            .action(async (sessionId, crewMember) => {
            try {
                const analysis = await this.workflow.processCrewMemberAnalysis(sessionId, crewMember);
                console.log(`\n🔍 ${crewMember.toUpperCase()} ANALYSIS COMPLETE`);
                console.log('='.repeat(50));
                console.log(`Perspective: ${analysis.perspective}`);
                console.log(`\nKey Insights:`);
                analysis.keyInsights.forEach((insight, index) => {
                    console.log(`  ${index + 1}. ${insight}`);
                });
                console.log(`\nTechnical Learnings:`);
                analysis.technicalLearnings.forEach((learning, index) => {
                    console.log(`  ${index + 1}. ${learning}`);
                });
                console.log(`\nBusiness Implications:`);
                analysis.businessImplications.forEach((implication, index) => {
                    console.log(`  ${index + 1}. ${implication}`);
                });
                console.log(`\nRecommendations:`);
                analysis.recommendations.forEach((recommendation, index) => {
                    console.log(`  ${index + 1}. ${recommendation}`);
                });
                console.log(`\nSelf-Reflection: ${analysis.selfReflection}`);
                console.log(`Confidence Level: ${analysis.confidenceLevel}/10`);
                console.log(`Impact Level: ${analysis.impactLevel}`);
            }
            catch (error) {
                console.error('❌ Error processing crew member analysis:', error);
            }
        });
        // Generate collective insights
        consciousnessCommand
            .command('insights <sessionId>')
            .description('Generate collective insights from all crew member analyses')
            .action(async (sessionId) => {
            try {
                const insights = await this.workflow.generateCollectiveInsights(sessionId);
                console.log(`\n🧠 COLLECTIVE INSIGHTS GENERATED`);
                console.log('='.repeat(60));
                console.log(`\nStrategic Overview:`);
                console.log(insights.strategicOverview);
                console.log(`\nTechnical Summary:`);
                console.log(insights.technicalSummary);
                console.log(`\nBusiness Value:`);
                console.log(insights.businessValue);
                console.log(`\nRisk Assessment:`);
                console.log(insights.riskAssessment);
                console.log(`\nImplementation Plan:`);
                console.log(insights.implementationPlan);
                console.log(`\nSuccess Metrics:`);
                insights.successMetrics.forEach((metric, index) => {
                    console.log(`  ${index + 1}. ${metric}`);
                });
                console.log(`\nCrew Synergy:`);
                console.log(insights.crewSynergy);
                console.log(`\nSystem Evolution:`);
                console.log(insights.systemEvolution);
            }
            catch (error) {
                console.error('❌ Error generating collective insights:', error);
            }
        });
        // Complete crew consciousness session
        consciousnessCommand
            .command('complete <sessionId>')
            .description('Complete crew consciousness session and update N8N workflows')
            .action(async (sessionId) => {
            try {
                const completedSession = await this.workflow.completeSession(sessionId);
                console.log(`\n🎯 CREW CONSCIOUSNESS SESSION COMPLETED`);
                console.log('='.repeat(60));
                console.log(`Session ID: ${completedSession.sessionId}`);
                console.log(`Project: ${completedSession.projectRequest.projectName}`);
                console.log(`Crew Members: ${completedSession.individualAnalyses.size}`);
                console.log(`RAG Memories Stored: ${completedSession.ragMemoriesStored}`);
                console.log(`N8N Workflows Updated: ${completedSession.n8nWorkflowsUpdated}`);
                console.log(`Duration: ${completedSession.endTime.getTime() - completedSession.startTime.getTime()}ms`);
                console.log(`Status: ${completedSession.status}`);
            }
            catch (error) {
                console.error('❌ Error completing session:', error);
            }
        });
        // Show crew learning statistics
        consciousnessCommand
            .command('stats')
            .description('Show crew learning statistics and growth metrics')
            .action(() => {
            try {
                const stats = this.workflow.getCrewLearningStats();
                console.log(`\n📊 CREW LEARNING STATISTICS`);
                console.log('='.repeat(60));
                for (const [crewMember, data] of Object.entries(stats)) {
                    const memberData = data;
                    console.log(`\n${crewMember}:`);
                    console.log(`  Total Analyses: ${memberData.totalAnalyses}`);
                    console.log(`  Total Insights: ${memberData.totalInsights}`);
                    console.log(`  Total Learnings: ${memberData.totalLearnings}`);
                    console.log(`  Average Confidence: ${memberData.averageConfidence.toFixed(1)}/10`);
                    console.log(`  Last Analysis: ${memberData.lastAnalysis}`);
                }
            }
            catch (error) {
                console.error('❌ Error getting crew learning stats:', error);
            }
        });
        // Run complete crew consciousness demo
        consciousnessCommand
            .command('demo')
            .description('Run complete crew consciousness workflow demo')
            .action(async () => {
            try {
                await this.workflow.runDemo();
            }
            catch (error) {
                console.error('❌ Error running demo:', error);
            }
        });
        // Quick project analysis
        consciousnessCommand
            .command('quick-analyze')
            .description('Quick project analysis with all crew members')
            .option('-n, --name <name>', 'Project name', 'Quick Analysis Project')
            .option('-t, --type <type>', 'Project type', 'AI Application')
            .option('-c, --client <client>', 'Client name', 'Enterprise Client')
            .option('-tech, --technologies <technologies>', 'Comma-separated technologies', 'Next.js,TypeScript,AI')
            .option('-d, --description <description>', 'Project description', 'Quick AI project analysis')
            .action(async (options) => {
            try {
                console.log('\n🚀 QUICK CREW CONSCIOUSNESS ANALYSIS');
                console.log('='.repeat(60));
                console.log('Initializing session and processing all crew analyses...');
                const projectRequest = {
                    projectName: options.name,
                    projectType: options.type,
                    client: options.client,
                    technologies: options.technologies.split(','),
                    description: options.description,
                    objectives: ['Deliver high-quality solution', 'Meet client requirements'],
                    constraints: [],
                    timeline: '4 weeks',
                };
                // Initialize session
                const sessionId = await this.workflow.initializeSession(projectRequest);
                console.log(`✅ Session initialized: ${sessionId}`);
                // Process all crew member analyses
                console.log('\n🔍 Processing crew member analyses...');
                const crewMembers = ['captain-picard', 'commander-data', 'commander-riker', 'lieutenant-worf', 'counselor-troi', 'dr.-crusher', 'geordi-la-forge', 'lieutenant-uhura', 'quark'];
                for (const member of crewMembers) {
                    await this.workflow.processCrewMemberAnalysis(sessionId, member);
                    console.log(`  ✅ ${member} analysis complete`);
                }
                // Generate collective insights
                console.log('\n🧠 Generating collective insights...');
                await this.workflow.generateCollectiveInsights(sessionId);
                // Complete session
                console.log('\n🎯 Completing session...');
                const completedSession = await this.workflow.completeSession(sessionId);
                // Display summary
                console.log('\n📊 QUICK ANALYSIS COMPLETE');
                console.log('='.repeat(60));
                console.log(`Project: ${completedSession.projectRequest.projectName}`);
                console.log(`Crew Members: ${completedSession.individualAnalyses.size}`);
                console.log(`RAG Memories: ${completedSession.ragMemoriesStored}`);
                console.log(`N8N Workflows: ${completedSession.n8nWorkflowsUpdated}`);
                console.log(`Duration: ${completedSession.endTime.getTime() - completedSession.startTime.getTime()}ms`);
                console.log('\n🎉 Quick crew consciousness analysis complete!');
                console.log('All crew members have analyzed the project and insights have been stored in RAG memory!');
            }
            catch (error) {
                console.error('❌ Error running quick analysis:', error);
            }
        });
    }
}
exports.CrewConsciousnessCLI = CrewConsciousnessCLI;
//# sourceMappingURL=crew-consciousness-cli.js.map