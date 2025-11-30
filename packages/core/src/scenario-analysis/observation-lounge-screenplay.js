"use strict";
/**
 * Observation Lounge Screenplay Format
 *
 * Enhanced cinematic screenplay format for crew learning debriefs
 * with character motivations and emotional depth
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservationLoungeScreenplay = void 0;
class ObservationLoungeScreenplay {
    /**
     * Generate cinematic screenplay format for Observation Lounge session
     */
    generateScreenplayOpening() {
        return `
🖖 OBSERVATION LOUNGE - CREW LEARNING DEBRIEF
${'='.repeat(80)}
FADE IN:

INT. OBSERVATION LOUNGE - USS ENTERPRISE - DAY

The spacious observation lounge overlooks the stars. The crew gathers
around the conference table, each member carrying their specialized
analysis and unique perspective on the project.

CAPTAIN PICARD stands at the head of the table, his commanding
presence setting the tone for this crucial debrief session.

PICARD
(authoritatively)
"Let us gather in the Observation Lounge to discuss what we have learned
from this mission. Each of you brings unique insights that will guide
our future endeavors."

ALL CREW MEMBERS
(in unison)
"Aye, Captain!"
`;
    }
    /**
     * Generate character-specific screenplay segment
     */
    generateCharacterSegment(crewMember, learning) {
        const characterProfile = this.getCharacterProfile(crewMember);
        return `
${'='.repeat(80)}
INT. OBSERVATION LOUNGE - ${crewMember.toUpperCase()} SPEAKS
${'='.repeat(80)}

${characterProfile.name} ${characterProfile.action}, ${characterProfile.motivation}

${characterProfile.name.toUpperCase()}
${characterProfile.dialogue_style}
"${characterProfile.opening_statement}"

${characterProfile.name} ${characterProfile.insight_action}, ${characterProfile.insight_motivation}

PROJECT INSIGHTS:
${learning.projectInsights.map((insight, index) => `  ${index + 1}. ${insight}`).join('\n')}

${characterProfile.name} ${characterProfile.technical_action}, ${characterProfile.technical_motivation}

TECHNICAL LEARNINGS:
${learning.technicalLearnings.map((learning, index) => `  ${index + 1}. ${learning}`).join('\n')}

${characterProfile.name} ${characterProfile.client_action}, ${characterProfile.client_motivation}

CLIENT UNDERSTANDING:
${learning.clientUnderstanding.map((understanding, index) => `  ${index + 1}. ${understanding}`).join('\n')}

${characterProfile.name} ${characterProfile.collaboration_action}, ${characterProfile.collaboration_motivation}

COLLABORATION INSIGHTS:
${learning.collaborationInsights.map((insight, index) => `  ${index + 1}. ${insight}`).join('\n')}

${characterProfile.name} ${characterProfile.introspection_action}, ${characterProfile.introspection_motivation}

INTROSPECTION:
  ${learning.introspection}

${characterProfile.name} ${characterProfile.closing_action}, ${characterProfile.closing_motivation}

${characterProfile.name.toUpperCase()}
${characterProfile.dialogue_style}
"${characterProfile.closing_statement}"

RAG MEMORIES STORED: ${learning.ragMemories.length}
`;
    }
    /**
     * Generate screenplay closing
     */
    generateScreenplayClosing() {
        return `
${'='.repeat(80)}
FADE OUT:

🎯 OBSERVATION LOUNGE SESSION COMPLETE
${'='.repeat(80)}

INT. OBSERVATION LOUNGE - LATER

PICARD stands, his expression one of satisfaction and pride.

PICARD
(with genuine appreciation)
"Excellent work, crew. Our learnings have been documented and stored
in our RAG system. This collective wisdom will serve us well in
future missions."

ALL CREW MEMBERS
(standing at attention)
"Aye, Captain! Mission accomplished!"

FADE TO BLACK.

THE END
`;
    }
    /**
     * Get detailed character profile for screenplay format
     */
    getCharacterProfile(crewMember) {
        const profiles = {
            'Captain Picard': {
                name: 'PICARD',
                action: 'stands with commanding presence, his hands clasped behind his back',
                motivation: 'driven by his deep commitment to Starfleet principles and the welfare of his crew',
                dialogue_style: '(with measured authority and philosophical depth)',
                opening_statement: 'As your commanding officer, I must emphasize the strategic implications of our findings.',
                insight_action: 'pauses thoughtfully, his eyes reflecting years of command experience',
                insight_motivation: 'weighing each insight against his vast experience in diplomacy and leadership',
                technical_action: 'nods approvingly, recognizing the technical excellence',
                technical_motivation: 'appreciating how technical solutions serve the greater mission',
                client_action: 'leans forward with genuine concern',
                client_motivation: 'his sense of duty compelling him to ensure client satisfaction',
                collaboration_action: 'gestures inclusively to the entire crew',
                collaboration_motivation: 'his leadership philosophy emphasizing unity and mutual support',
                introspection_action: 'gazes out at the stars beyond the viewport',
                introspection_motivation: 'his contemplative nature seeking deeper understanding of their mission',
                closing_action: 'straightens his uniform with quiet dignity',
                closing_motivation: 'his sense of duty and honor guiding his final words',
                closing_statement: 'These insights will serve our mission well. We are stronger together than we could ever be alone.'
            },
            'Commander Data': {
                name: 'DATA',
                action: 'sits with perfect posture, his golden eyes reflecting precise calculations',
                motivation: 'driven by his quest to understand humanity and improve his analytical capabilities',
                dialogue_style: '(with precise, analytical delivery)',
                opening_statement: 'Fascinating. The data patterns reveal significant insights into our technical implementation.',
                insight_action: 'processes information with visible computational intensity',
                insight_motivation: 'his positronic brain analyzing every detail for maximum efficiency',
                technical_action: 'his eyes brighten with interest',
                technical_motivation: 'his love of precision and logical systems driving his analysis',
                client_action: 'tilts his head with curiosity',
                client_motivation: 'his desire to understand human needs and behaviors',
                collaboration_action: 'considers the crew dynamics with scientific interest',
                collaboration_motivation: 'studying human interaction patterns to improve his social algorithms',
                introspection_action: 'pauses in contemplation, his positronic brain processing emotions',
                introspection_motivation: 'his ongoing journey to understand and develop emotional intelligence',
                closing_action: 'nods with mechanical precision',
                closing_motivation: 'his logical mind satisfied with the comprehensive analysis',
                closing_statement: 'This analysis has provided valuable data for future missions. I am... pleased with our progress.'
            },
            'Lieutenant Worf': {
                name: 'WORF',
                action: 'stands rigidly at attention, his Klingon warrior posture commanding respect',
                motivation: 'driven by honor, duty, and his fierce commitment to protecting the crew',
                dialogue_style: '(with Klingon intensity and warrior\'s honor)',
                opening_statement: 'Honor demands that we address the security implications with the utmost vigilance.',
                insight_action: 'his eyes narrow with warrior\'s focus',
                insight_motivation: 'his Klingon honor requiring thorough assessment of all threats',
                technical_action: 'studies the technical details with tactical precision',
                technical_motivation: 'his warrior\'s mind analyzing every technical aspect for vulnerabilities',
                client_action: 'his protective instincts activated',
                client_motivation: 'his duty to safeguard all those under his protection',
                collaboration_action: 'acknowledges his crewmates with warrior\'s respect',
                collaboration_motivation: 'his Klingon code of honor valuing loyalty and mutual defense',
                introspection_action: 'reflects with the depth of a warrior-philosopher',
                introspection_motivation: 'his complex identity as both Klingon warrior and Starfleet officer',
                closing_action: 'strikes his chest in traditional Klingon salute',
                closing_motivation: 'his honor satisfied by thorough preparation and protection',
                closing_statement: 'Today is a good day to have prepared for battle. We are ready for any challenge.'
            },
            'Counselor Troi': {
                name: 'TROI',
                action: 'sits with empathic grace, her Betazoid senses attuned to the emotional undercurrents',
                motivation: 'driven by her empathic abilities and desire to understand and help others',
                dialogue_style: '(with gentle empathy and intuitive insight)',
                opening_statement: 'I sense the emotional resonance of our work and its impact on those we serve.',
                insight_action: 'closes her eyes briefly, sensing the emotional landscape',
                insight_motivation: 'her empathic abilities allowing her to feel the human impact of their work',
                technical_action: 'considers the human factors behind technical decisions',
                technical_motivation: 'her psychology training helping her understand how technology affects people',
                client_action: 'leans forward with genuine care and understanding',
                client_motivation: 'her natural empathy compelling her to ensure client emotional well-being',
                collaboration_action: 'smiles warmly at her crewmates',
                collaboration_motivation: 'her role as counselor fostering harmony and understanding among the crew',
                introspection_action: 'reflects with deep emotional intelligence',
                introspection_motivation: 'her empathic nature seeking to understand the deeper emotional truths',
                closing_action: 'places her hand over her heart',
                closing_motivation: 'her empathic connection to the crew and their mission',
                closing_statement: 'The emotional bonds we\'ve formed and the care we\'ve shown will guide us to success.'
            },
            'Dr. Crusher': {
                name: 'CRUSHER',
                action: 'sits with the composed demeanor of a seasoned physician, her medical tricorder nearby',
                motivation: 'driven by her Hippocratic oath and commitment to healing and preserving life',
                dialogue_style: '(with medical precision and compassionate care)',
                opening_statement: 'From a medical perspective, I must ensure our systems are healthy and optimized.',
                insight_action: 'analyzes with the diagnostic eye of a physician',
                insight_motivation: 'her medical training teaching her to identify and prevent system ailments',
                technical_action: 'examines technical details like symptoms and diagnoses',
                technical_motivation: 'her medical mindset applying preventive care principles to technology',
                client_action: 'considers the health and well-being of end users',
                client_motivation: 'her healing instincts extending to all those who interact with their systems',
                collaboration_action: 'approaches team dynamics with healing and support',
                collaboration_motivation: 'her role as ship\'s doctor fostering crew health and morale',
                introspection_action: 'reflects with the wisdom of one who has seen life and death',
                introspection_motivation: 'her medical experience giving her unique perspective on growth and healing',
                closing_action: 'checks her medical tricorder with satisfaction',
                closing_motivation: 'her professional satisfaction in maintaining system health',
                closing_statement: 'Prevention is always better than cure. Our proactive approach will serve us well.'
            },
            'Geordi La Forge': {
                name: 'LA FORGE',
                action: 'leans forward with engineering enthusiasm, his VISOR scanning technical details',
                motivation: 'driven by his love of innovation and solving complex engineering challenges',
                dialogue_style: '(with engineering passion and innovative spirit)',
                opening_statement: 'The engineering possibilities are truly exciting! I can see multiple optimization opportunities.',
                insight_action: 'his VISOR whirring as he processes technical data',
                insight_motivation: 'his engineering mind constantly seeking elegant solutions to complex problems',
                technical_action: 'gestures animatedly as he explains technical concepts',
                technical_motivation: 'his passion for engineering driving him to share knowledge and innovation',
                client_action: 'considers the practical applications with engineering pragmatism',
                client_motivation: 'his focus on building solutions that truly serve user needs',
                collaboration_action: 'encourages innovation and creative problem-solving',
                collaboration_motivation: 'his belief that the best solutions come from collaborative engineering',
                introspection_action: 'reflects on the evolution of technology and human progress',
                introspection_motivation: 'his vision of technology as a force for positive change',
                closing_action: 'adjusts his VISOR with engineering precision',
                closing_motivation: 'his satisfaction in contributing to technological advancement',
                closing_statement: 'Every challenge is an opportunity to innovate. We\'re building the future, one solution at a time.'
            },
            'Lieutenant Uhura': {
                name: 'UHURA',
                action: 'sits with communications officer precision, her earpiece ready for any message',
                motivation: 'driven by her expertise in communication and her role as the ship\'s information hub',
                dialogue_style: '(with clear, precise communication and cultural sensitivity)',
                opening_statement: 'Clear communication is essential. I\'ve analyzed our information flow patterns.',
                insight_action: 'listens intently, processing every nuance of communication',
                insight_motivation: 'her expertise in languages and cultures enhancing information processing',
                technical_action: 'coordinates technical details with communication protocols',
                technical_motivation: 'her understanding that technology must serve communication needs',
                client_action: 'ensures clear, culturally appropriate communication channels',
                client_motivation: 'her commitment to breaking down communication barriers',
                collaboration_action: 'facilitates clear communication between all crew members',
                collaboration_motivation: 'her role as communications officer ensuring everyone is heard',
                introspection_action: 'reflects on the power of clear communication to build bridges',
                introspection_motivation: 'her understanding that communication is the foundation of understanding',
                closing_action: 'touches her earpiece with professional pride',
                closing_motivation: 'her satisfaction in maintaining clear communication channels',
                closing_statement: 'When we communicate clearly, we build bridges. When we build bridges, we succeed together.'
            },
            'Commander Riker': {
                name: 'RIKER',
                action: 'sits with tactical confidence, his experience evident in his relaxed but alert posture',
                motivation: 'driven by his tactical expertise and his commitment to successful mission execution',
                dialogue_style: '(with tactical confidence and leadership experience)',
                opening_statement: 'From a tactical standpoint, I can see clear paths to successful execution.',
                insight_action: 'strategizes with the confidence of an experienced first officer',
                insight_motivation: 'his tactical training helping him identify the most effective approaches',
                technical_action: 'evaluates technical solutions for tactical advantages',
                technical_motivation: 'his experience in high-pressure situations requiring reliable technology',
                client_action: 'focuses on mission success and client satisfaction',
                client_motivation: 'his leadership philosophy emphasizing results and team success',
                collaboration_action: 'coordinates team efforts with tactical precision',
                collaboration_motivation: 'his experience in leading diverse teams to achieve common goals',
                introspection_action: 'reflects on leadership and the responsibility of command',
                introspection_motivation: 'his growth as a leader learning from every mission and challenge',
                closing_action: 'nods with the confidence of a seasoned officer',
                closing_motivation: 'his satisfaction in leading the crew to mission success',
                closing_statement: 'Leadership is about enabling others to do their best work. We\'re ready for whatever comes next.'
            },
            'Quark': {
                name: 'QUARK',
                action: 'rubs his hands together with Ferengi business acumen, calculating profit margins',
                motivation: 'driven by his Ferengi instincts for profit and his role as business operations expert',
                dialogue_style: '(with Ferengi business savvy and profit-focused analysis)',
                opening_statement: 'Ah, let me analyze this from a business perspective. I see excellent profit potential here!',
                insight_action: 'calculates potential returns with Ferengi precision',
                insight_motivation: 'his business instincts constantly evaluating opportunities for profit and growth',
                technical_action: 'considers technology as an investment with measurable returns',
                technical_motivation: 'his Ferengi training in recognizing valuable assets and opportunities',
                client_action: 'focuses on client satisfaction as a business strategy',
                client_motivation: 'his understanding that happy clients are repeat customers and referral sources',
                collaboration_action: 'sees teamwork as a business partnership',
                collaboration_motivation: 'his Ferengi philosophy that successful partnerships benefit all parties',
                introspection_action: 'reflects on the business of technology and innovation',
                introspection_motivation: 'his unique perspective on how technology creates business value',
                closing_action: 'grins with Ferengi satisfaction',
                closing_motivation: 'his business instincts satisfied with the profit potential',
                closing_statement: 'Rule of Acquisition #45: Expand or die. And this project has excellent expansion potential!'
            }
        };
        return profiles[crewMember] || {
            name: crewMember.toUpperCase(),
            action: 'presents their findings',
            motivation: 'driven by their expertise and commitment to the mission',
            dialogue_style: '(with professional dedication)',
            opening_statement: 'I have completed my analysis of the project.',
            insight_action: 'presents their insights',
            insight_motivation: 'their expertise guiding their analysis',
            technical_action: 'discusses technical aspects',
            technical_motivation: 'their technical knowledge informing their perspective',
            client_action: 'considers client needs',
            client_motivation: 'their commitment to client satisfaction',
            collaboration_action: 'reflects on team dynamics',
            collaboration_motivation: 'their understanding of effective collaboration',
            introspection_action: 'reflects on their experience',
            introspection_motivation: 'their growth mindset driving continuous improvement',
            closing_action: 'concludes their presentation',
            closing_motivation: 'their satisfaction in contributing to the mission',
            closing_statement: 'I am confident in our ability to succeed in this mission.'
        };
    }
}
exports.ObservationLoungeScreenplay = ObservationLoungeScreenplay;
//# sourceMappingURL=observation-lounge-screenplay.js.map