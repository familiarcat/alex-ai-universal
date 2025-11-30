#!/usr/bin/env node

/**
 * Alex AI Messages Intelligence - Contact Natural Language Demo
 * 
 * This demonstrates the natural language interface working with Apple Contact data
 * to provide contextual conversation analysis and relationship management.
 */

console.log('🖖 Alex AI Messages Intelligence - Contact Natural Language Demo');
console.log('Prime Directive: Zero-artifact guarantee active\n');

// Simulate the natural language interface processing contact-based requests
const contactBasedRequests = [
  {
    input: "Captain Picard, analyze my professional relationship with John Doe from Tech Solutions Inc.",
    expectedOutput: "Strategic analysis of professional relationship with John Doe (Senior Developer at Tech Solutions Inc.)",
    crewMember: "Captain Picard",
    contactName: "John Doe",
    organization: "Tech Solutions Inc.",
    analysisType: "strategic"
  },
  {
    input: "Commander Data, extract technical specifications from my conversations with Alice Johnson at TechCorp",
    expectedOutput: "Technical analysis of conversations with Alice Johnson (Product Manager at TechCorp)",
    crewMember: "Commander Data", 
    contactName: "Alice Johnson",
    organization: "TechCorp",
    analysisType: "technical"
  },
  {
    input: "Quark, assess the business value of my relationship with Sarah Wilson from Design Studio",
    expectedOutput: "Business intelligence assessment of relationship with Sarah Wilson (Creative Director at Design Studio)",
    crewMember: "Quark",
    contactName: "Sarah Wilson", 
    organization: "Design Studio",
    analysisType: "business"
  },
  {
    input: "Export my conversations with Mike Chen from the last 3 months",
    expectedOutput: "Export conversations with Mike Chen (Personal Contact) from last 3 months",
    crewMember: null,
    contactName: "Mike Chen",
    organization: null,
    analysisType: "export"
  },
  {
    input: "Deanna Troi, analyze my personal relationship with family contacts",
    expectedOutput: "Psychological analysis of personal relationships with family contacts",
    crewMember: "Deanna Troi",
    contactName: "Family Contacts",
    organization: null,
    analysisType: "psychological"
  }
];

// Simulate contact database
const contactDatabase = {
  "John Doe": {
    firstName: "John",
    lastName: "Doe", 
    fullName: "John Doe",
    organization: "Tech Solutions Inc.",
    jobTitle: "Senior Developer",
    contactType: "professional",
    phoneNumbers: ["+1-555-0123"],
    emailAddresses: ["john.doe@techsolutions.com"]
  },
  "Alice Johnson": {
    firstName: "Alice",
    lastName: "Johnson",
    fullName: "Alice Johnson", 
    organization: "TechCorp",
    jobTitle: "Product Manager",
    contactType: "professional",
    phoneNumbers: ["+1-555-0321"],
    emailAddresses: ["alice.johnson@techcorp.com"]
  },
  "Sarah Wilson": {
    firstName: "Sarah",
    lastName: "Wilson",
    fullName: "Sarah Wilson",
    organization: "Design Studio", 
    jobTitle: "Creative Director",
    contactType: "professional",
    phoneNumbers: ["+1-555-0456"],
    emailAddresses: ["sarah.wilson@designstudio.com"]
  },
  "Mike Chen": {
    firstName: "Mike",
    lastName: "Chen",
    fullName: "Mike Chen",
    organization: null,
    jobTitle: null,
    contactType: "personal",
    phoneNumbers: ["+1-555-0789"],
    emailAddresses: ["mike.chen@family.com"]
  }
};

// Natural language processing simulation
function processNaturalLanguageRequest(input) {
  console.log(`\n🗣️ Natural Language Input: "${input}"`);
  
  // Parse the request (simplified parsing for demo)
  const request = contactBasedRequests.find(r => r.input === input);
  if (!request) {
    console.log("❌ Request not found in demo database");
    return;
  }

  console.log(`\n🧠 Processing Request...`);
  console.log(`• Crew Member: ${request.crewMember || 'None'}`);
  console.log(`• Contact: ${request.contactName}`);
  console.log(`• Organization: ${request.organization || 'Personal'}`);
  console.log(`• Analysis Type: ${request.analysisType}`);

  // Look up contact information
  const contact = contactDatabase[request.contactName] || {
    fullName: request.contactName,
    organization: request.organization || 'Personal Contact',
    jobTitle: 'N/A',
    contactType: request.organization ? 'professional' : 'personal',
    phoneNumbers: ['N/A'],
    emailAddresses: ['N/A']
  };
    console.log(`\n📇 Contact Information Retrieved:`);
    console.log(`• Full Name: ${contact.fullName}`);
    console.log(`• Organization: ${contact.organization || 'Personal Contact'}`);
    console.log(`• Job Title: ${contact.jobTitle || 'N/A'}`);
    console.log(`• Contact Type: ${contact.contactType}`);
    console.log(`• Phone: ${contact.phoneNumbers[0]}`);
    console.log(`• Email: ${contact.emailAddresses[0]}`);
  }

  // Generate crew-specific response
  if (request.crewMember) {
    console.log(`\n🖖 ${request.crewMember} Response:`);
    generateCrewResponse(request.crewMember, contact, request.analysisType);
  } else {
    console.log(`\n📤 Export Response:`);
    generateExportResponse(contact);
  }

  console.log(`\n✅ Request Processed Successfully`);
}

// Generate crew-specific responses
function generateCrewResponse(crewMember, contact, analysisType) {
  switch (crewMember) {
    case 'Captain Picard':
      console.log(`\n## Strategic Leadership Assessment\n`);
      console.log(`**Mission Parameters:**`);
      console.log(`• Contact: ${contact.fullName}`);
      console.log(`• Professional Context: ${contact.organization} - ${contact.jobTitle}`);
      console.log(`• Relationship Type: ${contact.contactType}`);
      console.log(`\n**Strategic Observations:**`);
      console.log(`• Professional relationship shows strong collaborative potential`);
      console.log(`• Organization alignment indicates strategic networking opportunity`);
      console.log(`• Contact expertise valuable for project collaboration`);
      console.log(`\n**Strategic Recommendations:**`);
      console.log(`• Schedule regular professional check-ins`);
      console.log(`• Leverage contact expertise for mutual benefit`);
      console.log(`• Explore collaboration opportunities within organization`);
      break;

    case 'Commander Data':
      console.log(`\n## Technical Analysis with Contact Context\n`);
      console.log(`**Data Metrics:**`);
      console.log(`• Contact: ${contact.fullName}`);
      console.log(`• Technical Role: ${contact.jobTitle}`);
      console.log(`• Organization: ${contact.organization}`);
      console.log(`\n**Technical Insights:**`);
      console.log(`• Professional context provides technical expertise access`);
      console.log(`• Organization affiliation indicates technical capability`);
      console.log(`• Contact role suggests relevant technical knowledge`);
      console.log(`\n**Technical Recommendations:**`);
      console.log(`• Extract technical specifications from conversations`);
      console.log(`• Leverage professional expertise for technical insights`);
      console.log(`• Monitor technical topic evolution in conversations`);
      break;

    case 'Quark':
      console.log(`\n## Business Intelligence Assessment\n`);
      console.log(`**Business Context:**`);
      console.log(`• Contact: ${contact.fullName}`);
      console.log(`• Business Value: ${contact.contactType === 'professional' ? 'High' : 'Personal'}`);
      console.log(`• Organization: ${contact.organization || 'Personal Contact'}`);
      console.log(`• Role: ${contact.jobTitle || 'Personal Relationship'}`);
      console.log(`\n**Business Analysis:**`);
      console.log(`• ${contact.contactType === 'professional' ? 'Professional relationship with business potential' : 'Personal relationship for relationship maintenance'}`);
      console.log(`• Organization context provides networking opportunities`);
      console.log(`• Contact expertise valuable for business development`);
      console.log(`\n**Business Recommendations:**`);
      console.log(`• ${contact.contactType === 'professional' ? 'Maximize professional relationship value' : 'Maintain personal relationship cost-effectively'}`);
      console.log(`• Leverage organization connections for business expansion`);
      console.log(`• Track relationship ROI and business outcomes`);
      break;

    case 'Deanna Troi':
      console.log(`\n## Psychological and Relationship Analysis\n`);
      console.log(`**Relationship Context:**`);
      console.log(`• Contact: ${contact.fullName}`);
      console.log(`• Relationship Type: ${contact.contactType}`);
      console.log(`• Personal Context: ${contact.organization ? 'Professional' : 'Personal'}`);
      console.log(`\n**Psychological Insights:**`);
      console.log(`• ${contact.contactType === 'professional' ? 'Professional relationship with potential for personal connection' : 'Personal relationship with emotional investment'}`);
      console.log(`• Communication patterns indicate relationship health`);
      console.log(`• Contact context influences communication style`);
      console.log(`\n**Relationship Recommendations:**`);
      console.log(`• Maintain appropriate communication boundaries`);
      console.log(`• Foster positive relationship development`);
      console.log(`• Monitor emotional investment and communication satisfaction`);
      break;

    default:
      console.log(`\n## General Analysis\n`);
      console.log(`**Contact Analysis:**`);
      console.log(`• Name: ${contact.fullName}`);
      console.log(`• Type: ${contact.contactType}`);
      console.log(`• Context: ${contact.organization || 'Personal'}`);
      console.log(`\n**General Recommendations:**`);
      console.log(`• Maintain regular communication`);
      console.log(`• Leverage contact expertise and connections`);
      console.log(`• Track relationship development over time`);
  }
}

// Generate export response
function generateExportResponse(contact) {
  console.log(`\n## Export Configuration\n`);
  console.log(`**Export Parameters:**`);
  console.log(`• Contact: ${contact.fullName}`);
  console.log(`• Contact Type: ${contact.contactType}`);
  console.log(`• Date Range: Last 3 months`);
  console.log(`• Format: Markdown and PDF`);
  console.log(`• Include Images: Yes`);
  console.log(`\n**Export Process:**`);
  console.log(`• Searching conversations with ${contact.fullName}`);
  console.log(`• Filtering messages from last 3 months`);
  console.log(`• Processing attachments and images`);
  console.log(`• Generating export files`);
  console.log(`\n**Export Results:**`);
  console.log(`• Files saved to: ~/Documents/Messages_Exports/${contact.fullName.replace(' ', '_')}_3months/`);
  console.log(`• conversation.md - Markdown format with images`);
  console.log(`• conversation.pdf - PDF format for sharing`);
  console.log(`• images/ - Folder with all attachments`);
}

// Run the demo
async function runContactNaturalLanguageDemo() {
  console.log('🧪 Running Contact Natural Language Interface Demo...\n');

  // Process each request
  contactBasedRequests.forEach((request, index) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📋 Test ${index + 1}/${contactBasedRequests.length}`);
    processNaturalLanguageRequest(request.input);
  });

  console.log(`\n${'='.repeat(80)}`);
  console.log('✅ Contact Natural Language Interface Demo Complete!');
  console.log('\n🖖 Alex AI Messages Intelligence successfully processes natural language');
  console.log('requests with Apple Contact context for enhanced conversation analysis.');
  console.log('\n**Key Capabilities Demonstrated:**');
  console.log('• Contact-aware natural language processing');
  console.log('• Professional vs personal context differentiation');
  console.log('• Organization and job title integration');
  console.log('• Crew-specific analysis with contact context');
  console.log('• Export functionality with contact information');
}

// Run the demo
runContactNaturalLanguageDemo().catch(console.error);
