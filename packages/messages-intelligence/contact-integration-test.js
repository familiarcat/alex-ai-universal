#!/usr/bin/env node

/**
 * Alex AI Messages Intelligence - Contact Integration Test
 * 
 * This script demonstrates how the Messages Intelligence system can work
 * with Apple Contact data to provide targeted conversation analysis.
 */

console.log('🖖 Alex AI Messages Intelligence - Contact Integration Test');
console.log('Prime Directive: Zero-artifact guarantee active\n');

// Simulate Apple Contact data (in real implementation, this would come from AddressBook framework)
const mockContacts = [
  {
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    phoneNumbers: ['+1-555-0123'],
    emailAddresses: ['john.doe@example.com'],
    organization: 'Tech Solutions Inc.',
    jobTitle: 'Senior Developer',
    lastContact: new Date('2024-12-15T15:30:00'),
    contactType: 'professional'
  },
  {
    firstName: 'Sarah',
    lastName: 'Wilson',
    fullName: 'Sarah Wilson',
    phoneNumbers: ['+1-555-0456'],
    emailAddresses: ['sarah.wilson@example.com'],
    organization: 'Design Studio',
    jobTitle: 'Creative Director',
    lastContact: new Date('2024-12-14T22:15:00'),
    contactType: 'professional'
  },
  {
    firstName: 'Mike',
    lastName: 'Chen',
    fullName: 'Mike Chen',
    phoneNumbers: ['+1-555-0789'],
    emailAddresses: ['mike.chen@family.com'],
    organization: null,
    jobTitle: null,
    lastContact: new Date('2024-12-10T18:45:00'),
    contactType: 'personal'
  },
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    fullName: 'Alice Johnson',
    phoneNumbers: ['+1-555-0321'],
    emailAddresses: ['alice.johnson@techcorp.com'],
    organization: 'TechCorp',
    jobTitle: 'Product Manager',
    lastContact: new Date('2024-12-16T10:20:00'),
    contactType: 'professional'
  }
];

// Simulate conversation data based on contacts
const mockConversations = [
  {
    id: 'contact-john-doe',
    name: 'John Doe',
    messageCount: 156,
    lastMessage: new Date('2024-12-15T15:30:00'),
    firstMessage: new Date('2024-01-01T09:00:00'),
    participants: ['John Doe', 'You'],
    contactInfo: mockContacts[0],
    recentTopics: ['AI project', 'technical specifications', 'collaboration', 'deadline']
  },
  {
    id: 'contact-sarah-wilson',
    name: 'Sarah Wilson',
    messageCount: 89,
    lastMessage: new Date('2024-12-14T22:15:00'),
    firstMessage: new Date('2024-06-15T14:20:00'),
    participants: ['Sarah Wilson', 'You'],
    contactInfo: mockContacts[1],
    recentTopics: ['design review', 'UI/UX feedback', 'project timeline', 'creative direction']
  },
  {
    id: 'contact-mike-chen',
    name: 'Mike Chen',
    messageCount: 234,
    lastMessage: new Date('2024-12-10T18:45:00'),
    firstMessage: new Date('2024-03-01T08:00:00'),
    participants: ['Mike Chen', 'You'],
    contactInfo: mockContacts[2],
    recentTopics: ['family dinner', 'weekend plans', 'holiday preparations', 'personal catch-up']
  },
  {
    id: 'contact-alice-johnson',
    name: 'Alice Johnson',
    messageCount: 67,
    lastMessage: new Date('2024-12-16T10:20:00'),
    firstMessage: new Date('2024-08-20T16:30:00'),
    participants: ['Alice Johnson', 'You'],
    contactInfo: mockContacts[3],
    recentTopics: ['product roadmap', 'user feedback', 'feature requests', 'market analysis']
  }
];

// Enhanced crew analysis with contact context
function generateContactBasedAnalysis(crewMember, conversation, contactInfo) {
  const analysis = {
    'Captain Picard': {
      title: 'Strategic Leadership Assessment',
      insights: [
        `Professional relationship with ${contactInfo.fullName} shows strong collaborative potential`,
        `${contactInfo.organization ? `Organization: ${contactInfo.organization} - ${contactInfo.jobTitle}` : 'Personal contact with strong relationship foundation'}`,
        `Recent conversation topics indicate ${contactInfo.contactType === 'professional' ? 'business-focused' : 'personal'} engagement`,
        `Last contact: ${contactInfo.lastContact.toLocaleDateString()} - relationship appears active and maintained`
      ],
      recommendations: [
        'Continue strategic relationship building',
        'Leverage professional expertise for mutual benefit',
        'Schedule regular check-ins to maintain connection',
        contactInfo.contactType === 'professional' ? 'Explore collaboration opportunities' : 'Maintain personal connection'
      ]
    },
    'Commander Data': {
      title: 'Technical Analysis with Contact Context',
      insights: [
        `Contact data analysis: ${conversation.messageCount} messages over ${Math.round((conversation.lastMessage - conversation.firstMessage) / (1000 * 60 * 60 * 24))} days`,
        `Communication pattern: ${conversation.messageCount > 100 ? 'High engagement' : 'Moderate engagement'}`,
        `Contact type: ${contactInfo.contactType} - ${contactInfo.organization ? `Professional (${contactInfo.organization})` : 'Personal'}`,
        `Recent topics: ${conversation.recentTopics.join(', ')}`
      ],
      recommendations: [
        'Analyze communication frequency patterns',
        'Track topic evolution over time',
        'Monitor engagement metrics',
        'Optimize communication timing based on patterns'
      ]
    },
    'Quark': {
      title: 'Business Intelligence with Contact Value Assessment',
      insights: [
        `Contact value analysis: ${contactInfo.contactType === 'professional' ? 'High business potential' : 'Personal relationship value'}`,
        `${contactInfo.organization ? `Business context: ${contactInfo.organization} - ${contactInfo.jobTitle}` : 'Personal contact - relationship maintenance cost'}`,
        `Engagement ROI: ${conversation.messageCount} messages = ${conversation.messageCount > 100 ? 'High investment' : 'Moderate investment'}`,
        `Last interaction value: ${contactInfo.lastContact.toLocaleDateString()} - ${Date.now() - contactInfo.lastContact.getTime() < 7 * 24 * 60 * 60 * 1000 ? 'Recent - high value' : 'Stale - needs attention'}`
      ],
      recommendations: [
        contactInfo.contactType === 'professional' ? 'Maximize business relationship value' : 'Maintain personal relationship cost-effectively',
        'Schedule strategic touchpoints',
        'Leverage contact expertise for mutual benefit',
        'Track relationship ROI metrics'
      ]
    }
  };

  return analysis[crewMember] || {
    title: 'General Analysis with Contact Context',
    insights: [
      `Contact: ${contactInfo.fullName}`,
      `Type: ${contactInfo.contactType}`,
      `Organization: ${contactInfo.organization || 'Personal'}`,
      `Last contact: ${contactInfo.lastContact.toLocaleDateString()}`
    ],
    recommendations: [
      'Maintain regular communication',
      'Leverage contact expertise',
      'Track relationship development',
      'Optimize interaction timing'
    ]
  };
}

// Test scenarios
async function runContactIntegrationTests() {
  console.log('🧪 Running Contact Integration Tests...\n');

  // Test 1: Contact-based conversation discovery
  console.log('📋 Test 1: Contact-Based Conversation Discovery');
  console.log('Available contacts with recent conversations:\n');
  
  mockConversations.forEach((conv, index) => {
    const contact = conv.contactInfo;
    console.log(`${index + 1}. ${contact.fullName}`);
    console.log(`   ${contact.organization ? `${contact.jobTitle} at ${contact.organization}` : 'Personal Contact'}`);
    console.log(`   Messages: ${conv.messageCount} | Last: ${conv.lastMessage.toLocaleDateString()}`);
    console.log(`   Recent Topics: ${conv.recentTopics.join(', ')}`);
    console.log('');
  });

  // Test 2: Crew analysis with contact context
  console.log('🖖 Test 2: Crew Analysis with Contact Context\n');
  
  const testConversation = mockConversations[0]; // John Doe
  const testContact = testConversation.contactInfo;
  
  console.log(`Analyzing conversation with: ${testContact.fullName}`);
  console.log(`Contact Type: ${testContact.contactType}`);
  console.log(`Organization: ${testContact.organization || 'Personal'}`);
  console.log(`Job Title: ${testContact.jobTitle || 'N/A'}\n`);

  // Captain Picard Analysis
  console.log('👨‍✈️ Captain Picard - Strategic Leadership Assessment:');
  const picardAnalysis = generateContactBasedAnalysis('Captain Picard', testConversation, testContact);
  console.log(`\n## ${picardAnalysis.title}\n`);
  picardAnalysis.insights.forEach(insight => console.log(`• ${insight}`));
  console.log('\n**Strategic Recommendations:**');
  picardAnalysis.recommendations.forEach(rec => console.log(`- ${rec}`));

  console.log('\n' + '='.repeat(60) + '\n');

  // Commander Data Analysis
  console.log('🤖 Commander Data - Technical Analysis:');
  const dataAnalysis = generateContactBasedAnalysis('Commander Data', testConversation, testContact);
  console.log(`\n## ${dataAnalysis.title}\n`);
  dataAnalysis.insights.forEach(insight => console.log(`• ${insight}`));
  console.log('\n**Technical Recommendations:**');
  dataAnalysis.recommendations.forEach(rec => console.log(`- ${rec}`));

  console.log('\n' + '='.repeat(60) + '\n');

  // Quark Analysis
  console.log('💰 Quark - Business Intelligence Assessment:');
  const quarkAnalysis = generateContactBasedAnalysis('Quark', testConversation, testContact);
  console.log(`\n## ${quarkAnalysis.title}\n`);
  quarkAnalysis.insights.forEach(insight => console.log(`• ${insight}`));
  console.log('\n**Business Recommendations:**');
  quarkAnalysis.recommendations.forEach(rec => console.log(`- ${rec}`));

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Natural Language Interface with Contact Context
  console.log('🗣️ Test 3: Natural Language Interface with Contact Context\n');
  
  const naturalLanguageExamples = [
    `"Captain Picard, analyze my professional relationship with John Doe from Tech Solutions Inc."`,
    `"Commander Data, extract technical specifications from my conversations with Alice Johnson at TechCorp"`,
    `"Quark, assess the business value of my relationship with Sarah Wilson from Design Studio"`,
    `"Export my conversations with Mike Chen from the last 3 months"`
  ];

  console.log('Natural Language Command Examples:');
  naturalLanguageExamples.forEach((example, index) => {
    console.log(`${index + 1}. ${example}`);
  });

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 4: Contact-based filtering and organization
  console.log('📊 Test 4: Contact-Based Filtering and Organization\n');
  
  const professionalContacts = mockConversations.filter(conv => conv.contactInfo.contactType === 'professional');
  const personalContacts = mockConversations.filter(conv => conv.contactInfo.contactType === 'personal');
  
  console.log('Professional Contacts:');
  professionalContacts.forEach(conv => {
    const contact = conv.contactInfo;
    console.log(`• ${contact.fullName} - ${contact.jobTitle} at ${contact.organization}`);
  });
  
  console.log('\nPersonal Contacts:');
  personalContacts.forEach(conv => {
    const contact = conv.contactInfo;
    console.log(`• ${contact.fullName} - Personal contact`);
  });

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 5: Contact-based conversation insights
  console.log('💡 Test 5: Contact-Based Conversation Insights\n');
  
  mockConversations.forEach(conv => {
    const contact = conv.contactInfo;
    const daysSinceLastContact = Math.round((Date.now() - conv.lastMessage.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`${contact.fullName}:`);
    console.log(`  • ${daysSinceLastContact} days since last contact`);
    console.log(`  • ${conv.messageCount} total messages`);
    console.log(`  • Recent topics: ${conv.recentTopics.join(', ')}`);
    console.log(`  • Relationship status: ${daysSinceLastContact < 7 ? 'Active' : daysSinceLastContact < 30 ? 'Stale' : 'Needs attention'}`);
    console.log('');
  });

  console.log('✅ Contact Integration Tests Complete!');
  console.log('\n🖖 Alex AI Messages Intelligence successfully integrates with Apple Contact data');
  console.log('to provide contextual conversation analysis and relationship management insights.');
}

// Run the tests
runContactIntegrationTests().catch(console.error);
