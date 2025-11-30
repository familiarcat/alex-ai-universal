"use strict";
/**
 * Universal Crew Activation System
 * Activates all crew members for every prompt to ensure comprehensive perspective collection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalCrewActivation = void 0;
class UniversalCrewActivation {
    constructor(llmOptimizer, hallucinationDetector, config) {
        this.llmOptimizer = llmOptimizer;
        this.hallucinationDetector = hallucinationDetector;
        this.config = config;
        this.crewMembers = this.llmOptimizer.getCrewMembers();
    }
    /**
     * Activate all crew members for a prompt
     */
    async activateAllCrewMembers(prompt) {
        const startTime = Date.now();
        const errors = [];
        let successCount = 0;
        let failureCount = 0;
        if (!this.config.enableUniversalActivation) {
            throw new Error('Universal crew activation is disabled');
        }
        console.log(`🖖 Activating all crew members for prompt analysis...`);
        console.log(`📝 Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);
        try {
            const perspectives = [];
            if (this.config.parallelProcessing) {
                // Process all crew members in parallel
                const crewPromises = this.crewMembers.map(member => this.processCrewMember(member, prompt));
                const results = await Promise.allSettled(crewPromises);
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    const crewMember = this.crewMembers[i];
                    if (result.status === 'fulfilled') {
                        perspectives.push(result.value);
                        successCount++;
                    }
                    else {
                        failureCount++;
                        errors.push(`Failed to activate ${crewMember}: ${result.reason}`);
                        if (this.config.fallbackEnabled) {
                            try {
                                const fallbackResponse = await this.generateFallbackResponse(crewMember, prompt);
                                perspectives.push(fallbackResponse);
                                successCount++;
                                failureCount--;
                            }
                            catch (fallbackError) {
                                console.error(`Fallback failed for ${crewMember}:`, fallbackError);
                            }
                        }
                    }
                }
            }
            else {
                // Process crew members sequentially
                for (const crewMember of this.crewMembers) {
                    try {
                        const perspective = await this.processCrewMember(crewMember, prompt);
                        perspectives.push(perspective);
                        successCount++;
                    }
                    catch (error) {
                        failureCount++;
                        errors.push(`Failed to activate ${crewMember}: ${error}`);
                        if (this.config.fallbackEnabled) {
                            try {
                                const fallbackResponse = await this.generateFallbackResponse(crewMember, prompt);
                                perspectives.push(fallbackResponse);
                                successCount++;
                                failureCount--;
                            }
                            catch (fallbackError) {
                                console.error(`Fallback failed for ${crewMember}:`, fallbackError);
                            }
                        }
                    }
                }
            }
            const activationTime = Date.now() - startTime;
            const averageConfidence = this.calculateAverageConfidence(perspectives);
            const consensusReached = perspectives.length >= 2;
            console.log(`✅ Crew activation complete: ${successCount}/${this.crewMembers.length} successful`);
            console.log(`⏱️  Activation time: ${activationTime}ms`);
            console.log(`📊 Average confidence: ${(averageConfidence * 100).toFixed(1)}%`);
            return {
                perspectives,
                activationTime,
                successCount,
                failureCount,
                averageConfidence,
                consensusReached,
                errors
            };
        }
        catch (error) {
            const activationTime = Date.now() - startTime;
            console.error('❌ Universal crew activation failed:', error);
            return {
                perspectives: [],
                activationTime,
                successCount: 0,
                failureCount: this.crewMembers.length,
                averageConfidence: 0,
                consensusReached: false,
                errors: [`Universal activation failed: ${error}`]
            };
        }
    }
    /**
     * Process individual crew member
     */
    async processCrewMember(crewMember, prompt) {
        const startTime = Date.now();
        try {
            // Optimize LLM selection for this crew member
            const optimization = await this.llmOptimizer.selectOptimalLLM(crewMember, prompt);
            console.log(`🤖 ${crewMember} using ${optimization.optimalLLM} (confidence: ${(optimization.confidence * 100).toFixed(1)}%)`);
            // Process with optimized LLM
            const response = await this.processWithOptimizedLLM(crewMember, prompt, optimization);
            const processingTime = Date.now() - startTime;
            return {
                crewMember,
                response: response.content,
                llmUsed: optimization.optimalLLM,
                confidence: response.confidence,
                timestamp: new Date(),
                context: prompt,
                optimization
            };
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`❌ Failed to process ${crewMember}:`, error);
            throw error;
        }
    }
    /**
     * Process prompt with optimized LLM
     */
    async processWithOptimizedLLM(crewMember, prompt, optimization) {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Processing timeout')), this.config.timeoutMs);
        });
        const processingPromise = this.callLLMWithRetry(optimization.optimalLLM, this.buildCrewMemberPrompt(crewMember, prompt), optimization);
        try {
            const result = await Promise.race([processingPromise, timeoutPromise]);
            return result;
        }
        catch (error) {
            console.error(`LLM processing failed for ${crewMember}:`, error);
            throw error;
        }
    }
    /**
     * Call LLM with retry logic
     */
    async callLLMWithRetry(llmId, prompt, optimization, attempt = 1) {
        try {
            // Simulate LLM call - in production, this would call the actual LLM API
            const response = await this.simulateLLMCall(llmId, prompt, optimization);
            return response;
        }
        catch (error) {
            if (attempt < this.config.maxRetries) {
                console.log(`🔄 Retrying LLM call for ${llmId} (attempt ${attempt + 1}/${this.config.maxRetries})`);
                await this.delay(1000 * attempt); // Exponential backoff
                return this.callLLMWithRetry(llmId, prompt, optimization, attempt + 1);
            }
            else {
                throw error;
            }
        }
    }
    /**
     * Simulate LLM call (placeholder for actual implementation)
     */
    async simulateLLMCall(llmId, prompt, optimization) {
        // This is a placeholder - in production, this would make actual API calls
        await this.delay(Math.random() * 1000 + 500); // Simulate processing time
        const crewMember = optimization.crewMember;
        const confidence = optimization.confidence + (Math.random() - 0.5) * 0.1; // Add some variance
        // Generate crew member specific response
        const content = this.generateCrewMemberResponse(crewMember, prompt, llmId);
        return {
            content: content.substring(0, 1000), // Limit response length
            confidence: Math.max(0, Math.min(1, confidence))
        };
    }
    /**
     * Generate crew member specific response
     */
    generateCrewMemberResponse(crewMember, prompt, llmId) {
        const baseResponse = `Based on my analysis of the prompt "${prompt.substring(0, 50)}...", `;
        switch (crewMember) {
            case 'Captain Picard':
                return baseResponse + `I recommend a strategic approach that emphasizes diplomacy, ethical considerations, and long-term planning. As your commanding officer, I must ensure we maintain the highest standards while achieving our objectives.`;
            case 'Commander Data':
                return baseResponse + `My analysis indicates several logical approaches to this problem. The data suggests we should consider computational efficiency, systematic analysis, and scientific methodology.`;
            case 'Counselor Troi':
                return baseResponse + `From a psychological perspective, I sense that this situation requires empathy and understanding. We should consider the emotional and human factors that may influence the outcome.`;
            case 'Lieutenant Worf':
                return baseResponse + `Security and tactical considerations are paramount. I recommend we assess potential threats, implement defensive measures, and maintain readiness for any challenges.`;
            case 'Commander Riker':
                return baseResponse + `As your executive officer, I suggest we coordinate our efforts across multiple departments. This requires leadership, teamwork, and strategic coordination.`;
            case 'Lieutenant Commander La Forge':
                return baseResponse + `From an engineering perspective, I recommend we analyze the technical requirements, optimize our systems, and ensure reliable implementation of any solutions.`;
            case 'Doctor Crusher':
                return baseResponse + `My medical training suggests we should prioritize safety, thorough analysis, and evidence-based approaches. We must ensure the well-being of all involved.`;
            case 'Lieutenant Commander Tasha Yar':
                return baseResponse + `Security protocols require immediate attention. I recommend we establish protective measures and maintain tactical awareness throughout this operation.`;
            case 'Lieutenant Commander Spock':
                return baseResponse + `Logical analysis indicates that we should approach this problem systematically. The most efficient solution would be to gather data, analyze patterns, and apply scientific methodology.`;
            default:
                return baseResponse + `I recommend a comprehensive approach that considers multiple perspectives and ensures thorough analysis of all relevant factors.`;
        }
    }
    /**
     * Build crew member specific prompt
     */
    buildCrewMemberPrompt(crewMember, originalPrompt) {
        const persona = this.getCrewMemberPersona(crewMember);
        return `
You are ${crewMember} from Star Trek: The Next Generation.

${persona.description}

Your expertise includes: ${persona.expertise.join(', ')}

Original Prompt: ${originalPrompt}

Please provide your perspective on this prompt, drawing from your unique expertise and personality. Be specific, insightful, and maintain your character's voice while providing valuable analysis.

Response Guidelines:
- Maintain your character's personality and speaking style
- Draw from your specific expertise areas
- Provide actionable insights
- Be concise but comprehensive
- Consider the broader implications

Your Response:`;
    }
    /**
     * Get crew member persona
     */
    getCrewMemberPersona(crewMember) {
        const personas = new Map([
            ['Captain Picard', {
                    description: 'You are a diplomatic, ethical leader with extensive experience in command and strategy. You value honor, justice, and the Prime Directive.',
                    expertise: ['leadership', 'diplomacy', 'ethics', 'strategy', 'command']
                }],
            ['Commander Data', {
                    description: 'You are an android with superior analytical abilities, logical reasoning, and encyclopedic knowledge. You strive to understand humanity.',
                    expertise: ['logic', 'analysis', 'computation', 'science', 'engineering']
                }],
            ['Counselor Troi', {
                    description: 'You are an empathic counselor with telepathic abilities. You understand emotions, psychology, and human behavior deeply.',
                    expertise: ['empathy', 'psychology', 'counseling', 'emotions', 'human-behavior']
                }],
            ['Lieutenant Worf', {
                    description: 'You are a Klingon warrior with strong sense of honor, tactical expertise, and security knowledge. You are fierce but honorable.',
                    expertise: ['security', 'tactics', 'combat', 'honor', 'warrior-code']
                }],
            ['Commander Riker', {
                    description: 'You are the executive officer with leadership experience, tactical knowledge, and diplomatic skills. You are confident and capable.',
                    expertise: ['leadership', 'tactics', 'diplomacy', 'command', 'strategy']
                }],
            ['Lieutenant Commander La Forge', {
                    description: 'You are the chief engineer with exceptional technical skills, innovation, and problem-solving abilities. You see possibilities others miss.',
                    expertise: ['engineering', 'technology', 'innovation', 'problem-solving', 'systems']
                }],
            ['Doctor Crusher', {
                    description: 'You are the chief medical officer with extensive medical knowledge, compassion, and research experience. You prioritize healing and care.',
                    expertise: ['medical', 'healing', 'science', 'research', 'compassion']
                }],
            ['Lieutenant Commander Tasha Yar', {
                    description: 'You are the chief of security with tactical expertise, survival skills, and protective instincts. You are vigilant and determined.',
                    expertise: ['security', 'tactics', 'survival', 'protection', 'vigilance']
                }],
            ['Lieutenant Commander Spock', {
                    description: 'You are a Vulcan with superior logic, scientific knowledge, and analytical abilities. You value reason above emotion.',
                    expertise: ['logic', 'science', 'analysis', 'vulcan-knowledge', 'reasoning']
                }]
        ]);
        return personas.get(crewMember) || {
            description: 'You are a skilled crew member with valuable expertise.',
            expertise: ['general', 'analysis', 'problem-solving']
        };
    }
    /**
     * Generate fallback response when primary processing fails
     */
    async generateFallbackResponse(crewMember, prompt) {
        console.log(`🔄 Generating fallback response for ${crewMember}`);
        const fallbackContent = `I apologize, but I encountered technical difficulties processing your request. As ${crewMember}, I recommend we consult with other crew members and review our systems to ensure optimal performance.`;
        return {
            crewMember,
            response: fallbackContent,
            llmUsed: 'fallback',
            confidence: 0.3,
            timestamp: new Date(),
            context: prompt,
            optimization: {
                crewMember,
                promptContext: JSON.stringify({ type: 'fallback', domain: 'general' }),
                personaSkills: ['fallback'],
                optimalLLM: 'fallback',
                confidence: 0.3,
                reasoning: 'Fallback response due to processing failure',
                timestamp: new Date()
            }
        };
    }
    /**
     * Calculate average confidence
     */
    calculateAverageConfidence(perspectives) {
        if (perspectives.length === 0)
            return 0;
        const total = perspectives.reduce((sum, p) => sum + p.confidence, 0);
        return total / perspectives.length;
    }
    /**
     * Delay utility
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Get crew members
     */
    getCrewMembers() {
        return [...this.crewMembers];
    }
    /**
     * Add custom crew member
     */
    addCrewMember(name, expertise) {
        if (!this.crewMembers.includes(name)) {
            this.crewMembers.push(name);
            // In production, this would update the LLM optimizer's crew member expertise
        }
    }
    /**
     * Remove crew member
     */
    removeCrewMember(name) {
        const index = this.crewMembers.indexOf(name);
        if (index > -1) {
            this.crewMembers.splice(index, 1);
        }
    }
}
exports.UniversalCrewActivation = UniversalCrewActivation;
//# sourceMappingURL=universal-crew-activation.js.map