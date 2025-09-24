#!/usr/bin/env node

/**
 * Test AI Integration
 * 
 * Simple test to verify Alex AI works with real OpenAI API
 */

const { UniversalAlexAIManager } = require('./packages/core/dist/index.js');

async function testAIIntegration() {
    console.log('🚀 Testing Alex AI Integration with Real OpenAI API...\n');
    
    try {
        // Initialize Alex AI
        const alexAI = new UniversalAlexAIManager();
        await alexAI.initialize({
            environment: 'development',
            enableN8NIntegration: true,
            enableStealthScraping: true,
            enableCrewManagement: true,
            enableTesting: true,
            logLevel: 'info'
        });
        
        console.log('✅ Alex AI initialized successfully\n');
        
        // Test with Commander Data
        console.log('🤖 Testing with Commander Data...');
        const dataResponse = await alexAI.sendMessage({
            message: 'Explain the concept of artificial intelligence in simple terms',
            context: {
                filePath: 'test.js',
                language: 'javascript',
                projectType: 'node'
            }
        });
        
        console.log(`\n📝 Response from ${dataResponse.crewMember}:`);
        console.log(dataResponse.response);
        console.log(`\n⏰ Timestamp: ${dataResponse.timestamp}`);
        
        if (dataResponse.suggestions && dataResponse.suggestions.length > 0) {
            console.log('\n💡 Suggestions:');
            dataResponse.suggestions.forEach(suggestion => console.log(`  • ${suggestion}`));
        }
        
        // Test with Captain Picard
        console.log('\n\n👨‍✈️ Testing with Captain Picard...');
        const picardResponse = await alexAI.sendMessage({
            message: 'What is the best strategy for leading a development team?',
            context: {
                filePath: 'team-management.md',
                language: 'markdown',
                projectType: 'documentation'
            },
            crewMember: 'Captain Jean-Luc Picard'
        });
        
        console.log(`\n📝 Response from ${picardResponse.crewMember}:`);
        console.log(picardResponse.response);
        
        // Test with Geordi La Forge
        console.log('\n\n👨‍🔧 Testing with Geordi La Forge...');
        const geordiResponse = await alexAI.sendMessage({
            message: 'How can I optimize this code for better performance?',
            context: {
                filePath: 'app.js',
                language: 'javascript',
                content: 'function slowFunction() { for(let i = 0; i < 1000000; i++) { console.log(i); } }',
                projectType: 'node'
            },
            crewMember: 'Geordi La Forge'
        });
        
        console.log(`\n📝 Response from ${geordiResponse.crewMember}:`);
        console.log(geordiResponse.response);
        
        console.log('\n🎉 All tests completed successfully!');
        console.log('✅ Alex AI is now working with real OpenAI API integration');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run the test
testAIIntegration();
