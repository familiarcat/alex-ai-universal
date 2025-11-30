"use strict";
/**
 * Hallucination Detector for Anti-Hallucination System
 * Detects hallucinations through crew consensus analysis
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HallucinationDetector = void 0;
class HallucinationDetector {
    constructor(hallucinationThreshold = 0.3, semanticSimilarityThreshold = 0.7, factualAlignmentThreshold = 0.6) {
        this.hallucinationThreshold = hallucinationThreshold;
        this.semanticSimilarityThreshold = semanticSimilarityThreshold;
        this.factualAlignmentThreshold = factualAlignmentThreshold;
    }
    /**
     * Analyze crew consensus and detect hallucinations
     */
    async analyzeCrewConsensus(perspectives) {
        if (perspectives.length < 2) {
            throw new Error('At least 2 crew perspectives required for consensus analysis');
        }
        const consensus = await this.calculateConsensus(perspectives);
        const analyses = [];
        for (const perspective of perspectives) {
            const analysis = await this.analyzePerspective(perspective, consensus, perspectives);
            analyses.push(analysis);
        }
        const overallHealth = this.calculateOverallHealth(analyses);
        return {
            consensus,
            analyses,
            overallHealth
        };
    }
    /**
     * Calculate crew consensus
     */
    async calculateConsensus(perspectives) {
        // Group similar responses
        const responseGroups = await this.groupSimilarResponses(perspectives);
        // Find the largest group as consensus
        const largestGroup = responseGroups.reduce((largest, group) => group.length > largest.length ? group : largest);
        // Calculate consensus metrics
        const consensusResponse = largestGroup[0].response;
        const consensusConfidence = this.calculateAverageConfidence(largestGroup);
        const participantCount = perspectives.length;
        const agreementScore = largestGroup.length / participantCount;
        const dominantPerspective = largestGroup[0].crewMember;
        const outlierCount = participantCount - largestGroup.length;
        return {
            consensusResponse,
            consensusConfidence,
            participantCount,
            agreementScore,
            dominantPerspective,
            outlierCount
        };
    }
    /**
     * Group similar responses using semantic similarity
     */
    async groupSimilarResponses(perspectives) {
        const groups = [];
        const processed = new Set();
        for (let i = 0; i < perspectives.length; i++) {
            if (processed.has(i))
                continue;
            const group = [perspectives[i]];
            processed.add(i);
            for (let j = i + 1; j < perspectives.length; j++) {
                if (processed.has(j))
                    continue;
                const similarity = await this.calculateSemanticSimilarity(perspectives[i].response, perspectives[j].response);
                if (similarity >= this.semanticSimilarityThreshold) {
                    group.push(perspectives[j]);
                    processed.add(j);
                }
            }
            groups.push(group);
        }
        return groups;
    }
    /**
     * Analyze individual perspective against consensus
     */
    async analyzePerspective(perspective, consensus, allPerspectives) {
        const deviationScore = await this.calculateDeviation(perspective, consensus);
        const isHallucination = deviationScore > this.hallucinationThreshold;
        const consensusAlignment = 1 - deviationScore;
        const severity = this.determineSeverity(deviationScore);
        const correctionPrompt = isHallucination
            ? await this.generateCorrectionPrompt(perspective, consensus, allPerspectives)
            : '';
        const learningOpportunity = isHallucination
            ? await this.identifyLearningOpportunity(perspective, consensus, allPerspectives)
            : '';
        return {
            crewMember: perspective.crewMember,
            isHallucination,
            deviationScore,
            consensusAlignment,
            correctionPrompt,
            learningOpportunity,
            detectedAt: new Date(),
            severity
        };
    }
    /**
     * Calculate deviation score for a perspective
     */
    async calculateDeviation(perspective, consensus) {
        const semanticSimilarity = await this.calculateSemanticSimilarity(perspective.response, consensus.consensusResponse);
        const factualAlignment = await this.calculateFactualAlignment(perspective.response, consensus.consensusResponse);
        const confidenceWeight = this.calculateConfidenceWeight(perspective.confidence, consensus.consensusConfidence);
        // Weighted deviation score (0-1, where 1 is maximum deviation)
        const deviation = 1 - ((semanticSimilarity * 0.4) +
            (factualAlignment * 0.4) +
            (confidenceWeight * 0.2));
        return Math.max(0, Math.min(1, deviation));
    }
    /**
     * Calculate semantic similarity between two responses
     */
    async calculateSemanticSimilarity(response1, response2) {
        // Simplified semantic similarity calculation
        // In production, this would use a proper embedding model
        const words1 = this.tokenize(response1);
        const words2 = this.tokenize(response2);
        const intersection = words1.filter(word => words2.includes(word));
        const union = [...new Set([...words1, ...words2])];
        // Jaccard similarity
        const jaccardSimilarity = intersection.length / union.length;
        // Enhanced with keyword matching
        const keywordSimilarity = this.calculateKeywordSimilarity(response1, response2);
        // Weighted combination
        return (jaccardSimilarity * 0.6) + (keywordSimilarity * 0.4);
    }
    /**
     * Calculate factual alignment between responses
     */
    async calculateFactualAlignment(response1, response2) {
        // Extract factual claims from responses
        const facts1 = this.extractFactualClaims(response1);
        const facts2 = this.extractFactualClaims(response2);
        if (facts1.length === 0 && facts2.length === 0) {
            return 1.0; // No factual claims to compare
        }
        if (facts1.length === 0 || facts2.length === 0) {
            return 0.0; // One has facts, other doesn't
        }
        // Calculate factual overlap
        let alignedFacts = 0;
        for (const fact1 of facts1) {
            for (const fact2 of facts2) {
                if (this.areFactsAligned(fact1, fact2)) {
                    alignedFacts++;
                    break;
                }
            }
        }
        return alignedFacts / Math.max(facts1.length, facts2.length);
    }
    /**
     * Calculate confidence weight
     */
    calculateConfidenceWeight(perspectiveConfidence, consensusConfidence) {
        const confidenceDiff = Math.abs(perspectiveConfidence - consensusConfidence);
        return Math.max(0, 1 - (confidenceDiff * 2));
    }
    /**
     * Determine hallucination severity
     */
    determineSeverity(deviationScore) {
        if (deviationScore >= 0.8)
            return 'critical';
        if (deviationScore >= 0.6)
            return 'high';
        if (deviationScore >= 0.4)
            return 'medium';
        return 'low';
    }
    /**
     * Generate correction prompt for hallucinating crew member
     */
    async generateCorrectionPrompt(perspective, consensus, allPerspectives) {
        const crewInsights = allPerspectives
            .filter(p => p.crewMember !== perspective.crewMember)
            .map(p => `${p.crewMember}: ${p.response}`)
            .join('\n');
        return `
${this.getCrewMemberPersona(perspective.crewMember)}: Your response deviated significantly from the crew consensus.

Original Response: ${perspective.response}

Crew Consensus: ${consensus.consensusResponse}

Crew Insights:
${crewInsights}

Please revise your response to align with the crew consensus while maintaining your unique perspective and expertise. Focus on the factual accuracy and logical consistency identified by your crew members.

Key areas to address:
1. Factual accuracy alignment with crew consensus
2. Logical consistency with crew reasoning
3. Maintain your specialized perspective while ensuring accuracy
4. Incorporate relevant insights from crew members
`;
    }
    /**
     * Identify learning opportunity from hallucination
     */
    async identifyLearningOpportunity(perspective, consensus, allPerspectives) {
        const deviationType = this.classifyDeviationType(perspective.response, consensus.consensusResponse);
        return `
Learning Opportunity for ${perspective.crewMember}:

Deviation Type: ${deviationType}
Original Response: ${perspective.response}
Consensus Response: ${consensus.consensusResponse}

Key Learning Points:
1. ${this.generateLearningPoint1(perspective, consensus)}
2. ${this.generateLearningPoint2(perspective, consensus)}
3. ${this.generateLearningPoint3(perspective, consensus)}

Recommended Actions:
- Review crew consensus reasoning
- Analyze factual discrepancies
- Enhance domain knowledge in affected areas
- Improve prompt interpretation skills
`;
    }
    /**
     * Tokenize text into words
     */
    tokenize(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2);
    }
    /**
     * Calculate keyword similarity
     */
    calculateKeywordSimilarity(response1, response2) {
        const keywords1 = this.extractKeywords(response1);
        const keywords2 = this.extractKeywords(response2);
        const intersection = keywords1.filter(k => keywords2.includes(k));
        const union = [...new Set([...keywords1, ...keywords2])];
        return union.length > 0 ? intersection.length / union.length : 0;
    }
    /**
     * Extract keywords from text
     */
    extractKeywords(text) {
        // Simple keyword extraction
        const words = this.tokenize(text);
        const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
        return words
            .filter(word => !stopWords.has(word) && word.length > 3)
            .slice(0, 10);
    }
    /**
     * Extract factual claims from response
     */
    extractFactualClaims(response) {
        // Simplified factual claim extraction
        // In production, this would use more sophisticated NLP
        const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
        return sentences.filter(sentence => {
            const lower = sentence.toLowerCase();
            return lower.includes('is') || lower.includes('are') || lower.includes('was') ||
                lower.includes('were') || lower.includes('will') || lower.includes('can') ||
                lower.includes('has') || lower.includes('have');
        });
    }
    /**
     * Check if two factual claims are aligned
     */
    areFactsAligned(fact1, fact2) {
        // Simplified factual alignment check
        const words1 = this.tokenize(fact1);
        const words2 = this.tokenize(fact2);
        const overlap = words1.filter(word => words2.includes(word)).length;
        const totalWords = Math.max(words1.length, words2.length);
        return overlap / totalWords > 0.5;
    }
    /**
     * Get crew member persona for correction prompts
     */
    getCrewMemberPersona(crewMember) {
        const personas = new Map([
            ['Captain Picard', 'Captain Picard'],
            ['Commander Data', 'Commander Data'],
            ['Counselor Troi', 'Counselor Troi'],
            ['Lieutenant Worf', 'Lieutenant Worf'],
            ['Commander Riker', 'Commander Riker'],
            ['Lieutenant Commander La Forge', 'Lieutenant Commander La Forge'],
            ['Doctor Crusher', 'Doctor Crusher'],
            ['Lieutenant Commander Tasha Yar', 'Lieutenant Commander Tasha Yar'],
            ['Lieutenant Commander Spock', 'Lieutenant Commander Spock']
        ]);
        return personas.get(crewMember) || crewMember;
    }
    /**
     * Calculate average confidence
     */
    calculateAverageConfidence(perspectives) {
        const total = perspectives.reduce((sum, p) => sum + p.confidence, 0);
        return total / perspectives.length;
    }
    /**
     * Calculate overall health score
     */
    calculateOverallHealth(analyses) {
        const hallucinationCount = analyses.filter(a => a.isHallucination).length;
        const totalCount = analyses.length;
        return 1 - (hallucinationCount / totalCount);
    }
    /**
     * Classify deviation type
     */
    classifyDeviationType(response, consensus) {
        // Simplified deviation classification
        if (response.length < consensus.length * 0.5)
            return 'Insufficient Detail';
        if (response.length > consensus.length * 2)
            return 'Excessive Detail';
        if (this.hasContradictoryFacts(response, consensus))
            return 'Factual Contradiction';
        if (this.hasLogicalInconsistency(response))
            return 'Logical Inconsistency';
        return 'General Deviation';
    }
    /**
     * Check for contradictory facts
     */
    hasContradictoryFacts(response, consensus) {
        // Simplified contradiction detection
        const responseFacts = this.extractFactualClaims(response);
        const consensusFacts = this.extractFactualClaims(consensus);
        // Check for direct contradictions (very simplified)
        for (const fact1 of responseFacts) {
            for (const fact2 of consensusFacts) {
                if (this.areFactsContradictory(fact1, fact2)) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Check if two facts are contradictory
     */
    areFactsContradictory(fact1, fact2) {
        // Very simplified contradiction detection
        const negationWords = ['not', 'no', 'never', 'none', 'cannot', 'shouldn\'t', 'won\'t'];
        const lower1 = fact1.toLowerCase();
        const lower2 = fact2.toLowerCase();
        // Check if one has negation and other doesn't for similar concepts
        const hasNegation1 = negationWords.some(word => lower1.includes(word));
        const hasNegation2 = negationWords.some(word => lower2.includes(word));
        if (hasNegation1 !== hasNegation2) {
            // Check if they're talking about similar concepts
            const words1 = this.tokenize(fact1);
            const words2 = this.tokenize(fact2);
            const overlap = words1.filter(word => words2.includes(word)).length;
            const totalWords = Math.max(words1.length, words2.length);
            return overlap / totalWords > 0.6;
        }
        return false;
    }
    /**
     * Check for logical inconsistency
     */
    hasLogicalInconsistency(response) {
        // Simplified logical inconsistency detection
        const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
        for (let i = 0; i < sentences.length - 1; i++) {
            for (let j = i + 1; j < sentences.length; j++) {
                if (this.areSentencesContradictory(sentences[i], sentences[j])) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Check if two sentences are contradictory
     */
    areSentencesContradictory(sentence1, sentence2) {
        // Very simplified contradiction detection between sentences
        return this.areFactsContradictory(sentence1, sentence2);
    }
    /**
     * Generate learning points
     */
    generateLearningPoint1(perspective, consensus) {
        return `Improve prompt interpretation to better align with crew consensus reasoning`;
    }
    generateLearningPoint2(perspective, consensus) {
        return `Enhance domain knowledge in areas where deviation occurred`;
    }
    generateLearningPoint3(perspective, consensus) {
        return `Strengthen collaborative reasoning skills to better integrate crew insights`;
    }
    /**
     * Update thresholds
     */
    updateThresholds(hallucinationThreshold, semanticSimilarityThreshold, factualAlignmentThreshold) {
        if (hallucinationThreshold !== undefined) {
            this.hallucinationThreshold = hallucinationThreshold;
        }
        if (semanticSimilarityThreshold !== undefined) {
            this.semanticSimilarityThreshold = semanticSimilarityThreshold;
        }
        if (factualAlignmentThreshold !== undefined) {
            this.factualAlignmentThreshold = factualAlignmentThreshold;
        }
    }
    /**
     * Get current thresholds
     */
    getThresholds() {
        return {
            hallucinationThreshold: this.hallucinationThreshold,
            semanticSimilarityThreshold: this.semanticSimilarityThreshold,
            factualAlignmentThreshold: this.factualAlignmentThreshold
        };
    }
}
exports.HallucinationDetector = HallucinationDetector;
//# sourceMappingURL=hallucination-detector.js.map