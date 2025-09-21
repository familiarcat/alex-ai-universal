"use strict";
/**
 * Hallucination Correction System
 * Corrects hallucinations using crew-informed prompts and stores learning opportunities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HallucinationCorrector = void 0;
class HallucinationCorrector {
    constructor(llmOptimizer) {
        this.llmOptimizer = llmOptimizer;
        this.learningStorage = new Map();
    }
    /**
     * Correct hallucination using crew insights
     */
    async correctHallucination(hallucinatingMember, originalResponse, consensus, crewInsights, analysis) {
        console.log(`🔧 Correcting hallucination for ${hallucinatingMember}`);
        console.log(`📊 Deviation Score: ${(analysis.deviationScore * 100).toFixed(1)}%`);
        console.log(`⚠️  Severity: ${analysis.severity.toUpperCase()}`);
        try {
            // Generate correction prompt
            const correctionPrompt = await this.generateCorrectionPrompt(hallucinatingMember, originalResponse, consensus, crewInsights, analysis);
            console.log(`📝 Generated correction prompt for ${hallucinatingMember}`);
            // Process correction with crew member's optimal LLM
            const optimization = await this.llmOptimizer.selectOptimalLLM(hallucinatingMember, correctionPrompt.correctionPrompt);
            const correctedResponse = await this.processCorrection(hallucinatingMember, correctionPrompt, optimization);
            // Store learning opportunity
            const learning = await this.createLearningOpportunity(hallucinatingMember, originalResponse, correctedResponse, crewInsights, analysis);
            await this.storeLearningOpportunity(learning);
            console.log(`✅ Hallucination correction completed for ${hallucinatingMember}`);
            console.log(`📚 Learning opportunity stored`);
            return {
                crewMember: hallucinatingMember,
                originalResponse,
                correctedResponse,
                correctionReason: analysis.learningOpportunity,
                confidence: this.calculateCorrectionConfidence(correctedResponse, consensus),
                correctionTime: new Date(),
                learningStored: true
            };
        }
        catch (error) {
            console.error(`❌ Failed to correct hallucination for ${hallucinatingMember}:`, error);
            return {
                crewMember: hallucinatingMember,
                originalResponse,
                correctedResponse: originalResponse, // Fallback to original
                correctionReason: 'Correction failed due to technical error',
                confidence: 0.1,
                correctionTime: new Date(),
                learningStored: false
            };
        }
    }
    /**
     * Generate correction prompt
     */
    async generateCorrectionPrompt(hallucinatingMember, originalResponse, consensus, crewInsights, analysis) {
        const crewInsightTexts = crewInsights
            .filter(insight => insight.crewMember !== hallucinatingMember)
            .map(insight => `${insight.crewMember}: ${insight.response}`);
        const focusAreas = this.identifyFocusAreas(originalResponse, consensus, analysis);
        const correctionPrompt = this.buildCorrectionPrompt(hallucinatingMember, originalResponse, consensus, crewInsightTexts, focusAreas);
        return {
            crewMember: hallucinatingMember,
            originalPrompt: 'Original prompt context',
            correctionPrompt,
            crewConsensus: consensus,
            crewInsights: crewInsightTexts,
            focusAreas
        };
    }
    /**
     * Build correction prompt
     */
    buildCorrectionPrompt(crewMember, originalResponse, consensus, crewInsights, focusAreas) {
        const persona = this.getCrewMemberPersona(crewMember);
        return `
${persona.addressing}: Your previous response deviated significantly from the crew consensus and requires correction.

CRITICAL CORRECTION REQUEST:

Your Original Response:
"${originalResponse}"

Crew Consensus Response:
"${consensus}"

Crew Member Insights:
${crewInsights.map(insight => `• ${insight}`).join('\n')}

Focus Areas for Correction:
${focusAreas.map(area => `• ${area}`).join('\n')}

CORRECTION GUIDELINES:

1. **Factual Accuracy**: Ensure all factual claims align with crew consensus
2. **Logical Consistency**: Maintain logical flow and reasoning
3. **Contextual Alignment**: Address the same core issues as other crew members
4. **Expertise Integration**: Incorporate relevant insights from crew members
5. **Character Consistency**: Maintain your unique perspective while ensuring accuracy

Your Task:
Please provide a corrected response that:
- Addresses the same core prompt as other crew members
- Maintains factual accuracy and logical consistency
- Incorporates relevant insights from crew members
- Preserves your unique expertise and perspective
- Aligns with the crew consensus while adding your specialized value

Remember: ${persona.motivation}

Your Corrected Response:`;
    }
    /**
     * Identify focus areas for correction
     */
    identifyFocusAreas(originalResponse, consensus, analysis) {
        const focusAreas = [];
        // Add severity-based focus areas
        switch (analysis.severity) {
            case 'critical':
                focusAreas.push('Major factual corrections required');
                focusAreas.push('Fundamental logical restructuring needed');
                break;
            case 'high':
                focusAreas.push('Significant factual alignment required');
                focusAreas.push('Logical consistency improvements needed');
                break;
            case 'medium':
                focusAreas.push('Moderate factual adjustments required');
                focusAreas.push('Enhanced logical flow needed');
                break;
            case 'low':
                focusAreas.push('Minor factual refinements suggested');
                focusAreas.push('Subtle logical improvements recommended');
                break;
        }
        // Add deviation-specific focus areas
        if (analysis.deviationScore > 0.7) {
            focusAreas.push('High deviation from crew consensus requires major revision');
        }
        else if (analysis.deviationScore > 0.5) {
            focusAreas.push('Moderate deviation requires significant adjustments');
        }
        else {
            focusAreas.push('Minor deviation requires subtle refinements');
        }
        // Add content-specific focus areas
        if (this.hasFactualContradictions(originalResponse, consensus)) {
            focusAreas.push('Factual contradictions need resolution');
        }
        if (this.hasLogicalInconsistencies(originalResponse)) {
            focusAreas.push('Logical inconsistencies need correction');
        }
        if (this.isMissingKeyPoints(originalResponse, consensus)) {
            focusAreas.push('Missing key points from crew consensus');
        }
        return focusAreas;
    }
    /**
     * Process correction with optimized LLM
     */
    async processCorrection(crewMember, correctionPrompt, optimization) {
        try {
            // Simulate LLM call for correction
            const correctedResponse = await this.simulateCorrectionCall(crewMember, correctionPrompt, optimization);
            return correctedResponse;
        }
        catch (error) {
            console.error(`Correction processing failed for ${crewMember}:`, error);
            throw error;
        }
    }
    /**
     * Simulate correction call
     */
    async simulateCorrectionCall(crewMember, correctionPrompt, optimization) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
        // Generate corrected response based on crew member
        const baseResponse = `After reviewing the crew consensus and insights, I must revise my previous response. `;
        switch (crewMember) {
            case 'Captain Picard':
                return baseResponse + `The crew consensus provides valuable strategic insights that I should have considered. I now recommend a diplomatic approach that balances our objectives with ethical considerations, as suggested by the collective wisdom of our team.`;
            case 'Commander Data':
                return baseResponse + `My analysis was incomplete. The crew consensus reveals additional logical factors that I failed to consider. I now recommend a systematic approach that incorporates the computational insights provided by my crew members.`;
            case 'Counselor Troi':
                return baseResponse + `I apologize for missing the emotional context that my crew members identified. I now recommend an approach that addresses both the psychological and practical aspects, ensuring we consider the human factors that are essential to success.`;
            case 'Lieutenant Worf':
                return baseResponse + `The crew consensus highlights security considerations I overlooked. I now recommend a tactical approach that maintains our defensive posture while incorporating the strategic insights provided by my fellow officers.`;
            default:
                return baseResponse + `I acknowledge the crew consensus and will incorporate the valuable insights provided. My revised recommendation takes into account the collective expertise of our team while maintaining my specialized perspective.`;
        }
    }
    /**
     * Create learning opportunity
     */
    async createLearningOpportunity(crewMember, originalResponse, correctedResponse, crewInsights, analysis) {
        const learningType = this.classifyLearningType(originalResponse, correctedResponse);
        const learningContext = this.generateLearningContext(crewMember, analysis);
        return {
            crewMember,
            originalResponse,
            correctedResponse,
            deviationScore: analysis.deviationScore,
            learningContext,
            crewInsights,
            timestamp: new Date(),
            learningType,
            severity: analysis.severity
        };
    }
    /**
     * Store learning opportunity
     */
    async storeLearningOpportunity(learning) {
        const crewMember = learning.crewMember;
        if (!this.learningStorage.has(crewMember)) {
            this.learningStorage.set(crewMember, []);
        }
        const learnings = this.learningStorage.get(crewMember);
        learnings.push(learning);
        // Keep only last 100 learning opportunities per crew member
        if (learnings.length > 100) {
            learnings.splice(0, learnings.length - 100);
        }
        console.log(`📚 Learning stored for ${crewMember}: ${learning.learningType} (${learning.severity})`);
    }
    /**
     * Classify learning type
     */
    classifyLearningType(original, corrected) {
        if (this.hasFactualContradictions(original, corrected)) {
            return 'factual';
        }
        if (this.hasLogicalInconsistencies(original)) {
            return 'logical';
        }
        if (this.isContextualDeviation(original, corrected)) {
            return 'contextual';
        }
        return 'domain-specific';
    }
    /**
     * Generate learning context
     */
    generateLearningContext(crewMember, analysis) {
        return `
Learning Context for ${crewMember}:
- Deviation Score: ${(analysis.deviationScore * 100).toFixed(1)}%
- Severity: ${analysis.severity}
- Detected At: ${analysis.detectedAt.toISOString()}
- Learning Opportunity: ${analysis.learningOpportunity}
- Correction Prompt: ${analysis.correctionPrompt}
`;
    }
    /**
     * Calculate correction confidence
     */
    calculateCorrectionConfidence(correctedResponse, consensus) {
        // Simplified confidence calculation based on alignment
        const similarity = this.calculateTextSimilarity(correctedResponse, consensus);
        return Math.min(0.95, similarity + 0.1); // Boost confidence for corrections
    }
    /**
     * Calculate text similarity
     */
    calculateTextSimilarity(text1, text2) {
        const words1 = text1.toLowerCase().split(/\s+/);
        const words2 = text2.toLowerCase().split(/\s+/);
        const intersection = words1.filter(word => words2.includes(word));
        const union = [...new Set([...words1, ...words2])];
        return union.length > 0 ? intersection.length / union.length : 0;
    }
    /**
     * Check for factual contradictions
     */
    hasFactualContradictions(text1, text2) {
        // Simplified contradiction detection
        const negationWords = ['not', 'no', 'never', 'none', 'cannot'];
        const lower1 = text1.toLowerCase();
        const lower2 = text2.toLowerCase();
        for (const negation of negationWords) {
            if (lower1.includes(negation) !== lower2.includes(negation)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Check for logical inconsistencies
     */
    hasLogicalInconsistencies(text) {
        // Simplified logical inconsistency detection
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        // Check for contradictory statements
        for (let i = 0; i < sentences.length - 1; i++) {
            for (let j = i + 1; j < sentences.length; j++) {
                if (this.areContradictory(sentences[i], sentences[j])) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Check if sentences are contradictory
     */
    areContradictory(sentence1, sentence2) {
        // Very simplified contradiction detection
        return this.hasFactualContradictions(sentence1, sentence2);
    }
    /**
     * Check if missing key points
     */
    isMissingKeyPoints(original, consensus) {
        const consensusWords = consensus.toLowerCase().split(/\s+/);
        const originalWords = original.toLowerCase().split(/\s+/);
        const missingWords = consensusWords.filter(word => word.length > 4 && !originalWords.includes(word));
        return missingWords.length > consensusWords.length * 0.3;
    }
    /**
     * Check for contextual deviation
     */
    isContextualDeviation(original, corrected) {
        // Check if the corrected version addresses the same context
        const originalTopics = this.extractTopics(original);
        const correctedTopics = this.extractTopics(corrected);
        const overlap = originalTopics.filter(topic => correctedTopics.includes(topic));
        return overlap.length < originalTopics.length * 0.5;
    }
    /**
     * Extract topics from text
     */
    extractTopics(text) {
        // Simple topic extraction
        const words = text.toLowerCase().split(/\s+/);
        const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
        return words
            .filter(word => !stopWords.has(word) && word.length > 4)
            .slice(0, 10);
    }
    /**
     * Get crew member persona for correction prompts
     */
    getCrewMemberPersona(crewMember) {
        const personas = new Map([
            ['Captain Picard', {
                    addressing: 'Captain Picard',
                    motivation: 'As your commanding officer, I must ensure our decisions align with Starfleet principles and crew consensus.'
                }],
            ['Commander Data', {
                    addressing: 'Commander Data',
                    motivation: 'My logical analysis must be consistent with crew consensus to ensure optimal outcomes.'
                }],
            ['Counselor Troi', {
                    addressing: 'Counselor Troi',
                    motivation: 'My empathic insights must align with crew consensus to provide the best guidance.'
                }],
            ['Lieutenant Worf', {
                    addressing: 'Lieutenant Worf',
                    motivation: 'My tactical assessment must honor crew consensus while maintaining security protocols.'
                }],
            ['Commander Riker', {
                    addressing: 'Commander Riker',
                    motivation: 'My executive perspective must align with crew consensus for effective coordination.'
                }],
            ['Lieutenant Commander La Forge', {
                    addressing: 'Lieutenant Commander La Forge',
                    motivation: 'My engineering solutions must incorporate crew consensus for optimal system performance.'
                }],
            ['Doctor Crusher', {
                    addressing: 'Doctor Crusher',
                    motivation: 'My medical perspective must align with crew consensus to ensure comprehensive care.'
                }],
            ['Lieutenant Commander Tasha Yar', {
                    addressing: 'Lieutenant Commander Tasha Yar',
                    motivation: 'My security assessment must incorporate crew consensus for optimal protection.'
                }],
            ['Lieutenant Commander Spock', {
                    addressing: 'Lieutenant Commander Spock',
                    motivation: 'My logical analysis must align with crew consensus for optimal outcomes.'
                }]
        ]);
        return personas.get(crewMember) || {
            addressing: crewMember,
            motivation: 'My analysis must align with crew consensus for optimal results.'
        };
    }
    /**
     * Get learning opportunities for crew member
     */
    getLearningOpportunities(crewMember) {
        return this.learningStorage.get(crewMember) || [];
    }
    /**
     * Get all learning opportunities
     */
    getAllLearningOpportunities() {
        return new Map(this.learningStorage);
    }
    /**
     * Clear learning opportunities
     */
    clearLearningOpportunities(crewMember) {
        if (crewMember) {
            this.learningStorage.delete(crewMember);
        }
        else {
            this.learningStorage.clear();
        }
    }
    /**
     * Get learning statistics
     */
    getLearningStatistics() {
        const learningsByCrewMember = new Map();
        const learningsByType = new Map();
        const learningsBySeverity = new Map();
        let totalLearnings = 0;
        for (const [crewMember, learnings] of this.learningStorage) {
            learningsByCrewMember.set(crewMember, learnings.length);
            totalLearnings += learnings.length;
            for (const learning of learnings) {
                learningsByType.set(learning.learningType, (learningsByType.get(learning.learningType) || 0) + 1);
                learningsBySeverity.set(learning.severity, (learningsBySeverity.get(learning.severity) || 0) + 1);
            }
        }
        return {
            totalLearnings,
            learningsByCrewMember,
            learningsByType,
            learningsBySeverity
        };
    }
}
exports.HallucinationCorrector = HallucinationCorrector;
//# sourceMappingURL=hallucination-corrector.js.map