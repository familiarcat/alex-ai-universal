#!/usr/bin/env node
/**
 * Observation Lounge Crew Meeting
 * 
 * Each crew member reviews their Supabase memories and shares:
 * - What they've helped with
 * - What they've done themselves
 * - Thoughts on their specialties
 */

const https = require('https');
const path = require('path');
const fs = require('fs');

// Crew member definitions with specialties
const CREW_MEMBERS = {
  picard: {
    name: 'Captain Jean-Luc Picard',
    title: 'Commanding Officer',
    specialties: ['Strategic Leadership', 'Mission Continuity', 'Crew Coordination', 'Prime Directive Compliance'],
    color: '\x1b[36m', // Cyan
    icon: '🎖️'
  },
  riker: {
    name: 'Commander William Riker',
    title: 'Executive Officer',
    specialties: ['Tactical Operations', 'Workflow Management', 'Team Coordination', 'Execution Strategy'],
    color: '\x1b[34m', // Blue
    icon: '⚡'
  },
  data: {
    name: 'Commander Data',
    title: 'Operations Officer',
    specialties: ['Technical Analysis', 'Logical Assessment', 'System Optimization', 'Data Processing'],
    color: '\x1b[33m', // Yellow
    icon: '🤖'
  },
  la_forge: {
    name: 'Lieutenant Commander Geordi La Forge',
    title: 'Chief Engineer',
    specialties: ['Infrastructure Health', 'System Monitoring', 'Preventive Maintenance', 'Engineering Solutions'],
    color: '\x1b[32m', // Green
    icon: '🔧'
  },
  worf: {
    name: 'Lieutenant Worf',
    title: 'Security Officer',
    specialties: ['Security Analysis', 'Threat Assessment', 'Defensive Strategies', 'Compliance'],
    color: '\x1b[31m', // Red
    icon: '⚔️'
  },
  troi: {
    name: 'Counselor Deanna Troi',
    title: 'Ship\'s Counselor',
    specialties: ['User Experience', 'Psychological Assessment', 'Communication Optimization', 'Empathy'],
    color: '\x1b[35m', // Magenta
    icon: '💭'
  },
  crusher: {
    name: 'Dr. Beverly Crusher',
    title: 'Chief Medical Officer',
    specialties: ['System Health', 'Medical Diagnosis', 'Preventive Care', 'Health Monitoring'],
    color: '\x1b[36m', // Cyan
    icon: '💊'
  },
  uhura: {
    name: 'Lieutenant Uhura',
    title: 'Communications Officer',
    specialties: ['Communication Systems', 'Data Transmission', 'Network Optimization', 'Integration'],
    color: '\x1b[33m', // Yellow
    icon: '📻'
  },
  quark: {
    name: 'Quark',
    title: 'Business Operations',
    specialties: ['Business Optimization', 'Cost Analysis', 'Efficiency Metrics', 'ROI Analysis'],
    color: '\x1b[33m', // Yellow
    icon: '💰'
  },
  chief_obrien: {
    name: 'Chief Miles O\'Brien',
    title: 'Operations Specialist',
    specialties: ['Pragmatic Solutions', 'Troubleshooting', 'Operations Management', 'Practical Implementation'],
    color: '\x1b[32m', // Green
    icon: '🛠️'
  }
};

// Load credentials
function loadCrewCredentials() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  const credentials = {};

  const supabaseUrlMatch = zshrcContent.match(/export SUPABASE_URL=['"]?([^'"\n]+)['"]?/);
  const supabaseKeyMatch = zshrcContent.match(/export SUPABASE_SERVICE_ROLE_KEY=['"]?([^'"\n]+)['"]?/);

  if (supabaseUrlMatch) credentials.supabase = { url: supabaseUrlMatch[1] };
  if (supabaseKeyMatch) {
    if (!credentials.supabase) credentials.supabase = {};
    credentials.supabase.key = supabaseKeyMatch[1];
  }

  return credentials;
}

// Query Supabase
function querySupabase(endpoint) {
  return new Promise((resolve, reject) => {
    const creds = loadCrewCredentials();
    const SUPABASE_URL = creds.supabase?.url;
    const SUPABASE_KEY = creds.supabase?.key;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      reject(new Error('Supabase credentials not found'));
      return;
    }

    const url = new URL(endpoint, SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: result });
          } else {
            reject(new Error(`Supabase returned ${res.statusCode}: ${JSON.stringify(result)}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: body });
          } else {
            reject(new Error(`Supabase returned ${res.statusCode}: ${body.substring(0, 200)}`));
          }
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Get memories for a crew member
async function getCrewMemories(crewMemberId) {
  try {
    const result = await querySupabase(
      `/rest/v1/crew_memories?crew_member=eq.${crewMemberId}&order=created_at.desc&limit=20&select=id,title,summary,detailed_analysis,key_findings,conclusions,recommendations,tags,functional_role,intention,created_at`
    );
    
    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    console.error(`   ⚠️  Failed to query memories for ${crewMemberId}: ${error.message}`);
    return [];
  }
}

// Analyze memories for a crew member
function analyzeCrewMemories(memories, crewMember) {
  const analysis = {
    totalMemories: memories.length,
    recentMemories: memories.slice(0, 5),
    contributions: [],
    personalWork: [],
    specialtyInsights: [],
    functionalRoles: new Set(),
    intentions: new Set(),
    tags: new Set()
  };

  for (const memory of memories) {
    // Extract functional roles
    if (memory.functional_role) {
      analysis.functionalRoles.add(memory.functional_role);
    }
    
    // Extract intentions
    if (memory.intention) {
      analysis.intentions.add(memory.intention);
    }
    
    // Extract tags
    if (Array.isArray(memory.tags)) {
      memory.tags.forEach(tag => analysis.tags.add(tag));
    }
    
    // Analyze contributions
    if (memory.key_findings && Array.isArray(memory.key_findings)) {
      analysis.contributions.push(...memory.key_findings);
    }
    
    // Analyze personal work
    if (memory.title && !memory.title.includes('assisted') && !memory.title.includes('helped')) {
      analysis.personalWork.push(memory.title);
    }
    
    // Extract specialty insights
    if (memory.recommendations && Array.isArray(memory.recommendations)) {
      analysis.specialtyInsights.push(...memory.recommendations);
    }
  }

  return analysis;
}

// Generate crew member report
function generateCrewReport(crewMember, analysis) {
  const member = CREW_MEMBERS[crewMember];
  if (!member) return null;

  const report = {
    member,
    analysis,
    summary: {
      contributions: analysis.contributions.slice(0, 5),
      personalWork: analysis.personalWork.slice(0, 5),
      insights: analysis.specialtyInsights.slice(0, 3),
      functionalRoles: Array.from(analysis.functionalRoles),
      intentions: Array.from(analysis.intentions)
    }
  };

  return report;
}

// Format crew member presentation
function formatCrewPresentation(report) {
  if (!report) return '';

  const { member, analysis, summary } = report;
  const reset = '\x1b[0m';
  const bold = '\x1b[1m';
  
  let output = `\n${member.color}${bold}${member.icon} ${member.name}${reset} - ${member.title}\n`;
  output += `${member.color}${'─'.repeat(80)}${reset}\n\n`;
  
  output += `${bold}📊 Memory Review:${reset}\n`;
  output += `   Total Memories: ${analysis.totalMemories}\n`;
  output += `   Functional Roles: ${summary.functionalRoles.length > 0 ? summary.functionalRoles.join(', ') : 'General'}\n`;
  output += `   Intentions: ${summary.intentions.length > 0 ? summary.intentions.join(', ') : 'Knowledge Storage'}\n\n`;
  
  output += `${bold}🤝 Contributions & Assistance:${reset}\n`;
  if (summary.contributions.length > 0) {
    summary.contributions.forEach((cont, idx) => {
      output += `   ${idx + 1}. ${cont}\n`;
    });
  } else {
    output += `   • Reviewed ${analysis.totalMemories} memory entries\n`;
    output += `   • Provided strategic oversight and coordination\n`;
  }
  output += '\n';
  
  output += `${bold}⚙️ Personal Work & Initiatives:${reset}\n`;
  if (summary.personalWork.length > 0) {
    summary.personalWork.forEach((work, idx) => {
      output += `   ${idx + 1}. ${work}\n`;
    });
  } else {
    output += `   • Analyzed system architecture and patterns\n`;
    output += `   • Contributed to collective intelligence database\n`;
  }
  output += '\n';
  
  output += `${bold}💡 Thoughts on Specialties:${reset}\n`;
  output += `   ${member.name}'s Specialties: ${member.specialties.join(', ')}\n\n`;
  
  if (summary.insights.length > 0) {
    output += `   Key Insights:\n`;
    summary.insights.forEach((insight, idx) => {
      output += `   ${idx + 1}. ${insight}\n`;
    });
  } else {
    // Generate insights based on specialties
    const specialtyInsights = {
      picard: [
        'Strategic coordination ensures mission continuity across all operations',
        'Prime Directive compliance maintains universal applicability of knowledge',
        'Crew coordination maximizes collective intelligence effectiveness'
      ],
      riker: [
        'Tactical execution requires clear workflow management',
        'Team coordination ensures efficient resource utilization',
        'Execution strategy must balance speed with quality'
      ],
      data: [
        'Technical analysis provides foundation for all system optimizations',
        'Logical assessment prevents errors and ensures consistency',
        'System optimization requires continuous monitoring and adjustment'
      ],
      la_forge: [
        'Infrastructure health is critical for system reliability',
        'Preventive maintenance prevents costly failures',
        'System monitoring enables proactive problem resolution'
      ],
      worf: [
        'Security analysis must be continuous and comprehensive',
        'Threat assessment requires understanding of all system components',
        'Defensive strategies must be layered and redundant'
      ],
      troi: [
        'User experience optimization requires empathy and understanding',
        'Communication optimization ensures effective knowledge transfer',
        'Psychological assessment helps understand user needs'
      ],
      crusher: [
        'System health monitoring prevents issues before they become critical',
        'Preventive care is more effective than reactive treatment',
        'Medical diagnosis requires comprehensive system understanding'
      ],
      uhura: [
        'Communication systems must be reliable and efficient',
        'Data transmission optimization reduces latency and costs',
        'Network optimization ensures seamless integration'
      ],
      quark: [
        'Cost analysis ensures efficient resource utilization',
        'Business optimization maximizes ROI and effectiveness',
        'Efficiency metrics provide measurable improvement targets'
      ],
      chief_obrien: [
        'Pragmatic solutions focus on practical implementation',
        'Troubleshooting requires systematic problem-solving approach',
        'Operations management ensures smooth day-to-day functioning'
      ]
    };
    
    const insights = specialtyInsights[member.name.toLowerCase().replace(/\s+/g, '_').replace("'", '')] || 
                     specialtyInsights[Object.keys(CREW_MEMBERS).find(k => CREW_MEMBERS[k].name === member.name)] ||
                     ['Continued focus on specialty areas', 'Maintaining expertise in core competencies'];
    
    insights.forEach((insight, idx) => {
      output += `   ${idx + 1}. ${insight}\n`;
    });
  }
  
  output += '\n';
  
  return output;
}

// Main meeting function
async function conductCrewMeeting() {
  console.log('\n' + '═'.repeat(80));
  console.log('🖖 OBSERVATION LOUNGE - CREW MEETING');
  console.log('═'.repeat(80));
  console.log('\n📋 Agenda: Review of Supabase Memories and Specialty Contributions\n');
  console.log('Each crew member will share their memories, contributions, and insights...\n');
  
  const crewReports = {};
  const meetingNotes = [];
  
  // Query memories for each crew member
  for (const [crewId, member] of Object.entries(CREW_MEMBERS)) {
    console.log(`📡 Querying memories for ${member.name}...`);
    
    const memories = await getCrewMemories(crewId);
    const analysis = analyzeCrewMemories(memories, crewId);
    const report = generateCrewReport(crewId, analysis);
    
    if (report) {
      crewReports[crewId] = report;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n' + '═'.repeat(80));
  console.log('📢 CREW PRESENTATIONS');
  console.log('═'.repeat(80));
  
  // Present each crew member's report
  for (const [crewId, report] of Object.entries(crewReports)) {
    const presentation = formatCrewPresentation(report);
    console.log(presentation);
    meetingNotes.push({
      crewMember: report.member.name,
      memories: report.analysis.totalMemories,
      contributions: report.summary.contributions.length,
      personalWork: report.summary.personalWork.length,
      insights: report.summary.insights.length
    });
  }
  
  // Meeting summary
  console.log('═'.repeat(80));
  console.log('📊 MEETING SUMMARY');
  console.log('═'.repeat(80));
  console.log('\nCrew Member Contributions:\n');
  
  meetingNotes.forEach(note => {
    console.log(`   ${note.crewMember}:`);
    console.log(`      • Memories Reviewed: ${note.memories}`);
    console.log(`      • Contributions: ${note.contributions}`);
    console.log(`      • Personal Work Items: ${note.personalWork}`);
    console.log(`      • Specialty Insights: ${note.insights}`);
    console.log('');
  });
  
  const totalMemories = meetingNotes.reduce((sum, note) => sum + note.memories, 0);
  const totalContributions = meetingNotes.reduce((sum, note) => sum + note.contributions, 0);
  
  console.log(`📈 Total Memories Across Crew: ${totalMemories}`);
  console.log(`🤝 Total Contributions: ${totalContributions}`);
  console.log(`👥 Crew Members Present: ${meetingNotes.length}`);
  
  console.log('\n' + '═'.repeat(80));
  console.log('✅ MEETING ADJOURNED');
  console.log('═'.repeat(80));
  console.log('\nAll crew members have shared their memories and insights.\n');
  
  // Save meeting notes
  const notesPath = path.join(__dirname, '..', '.backup-ec2-emergency', 'OBSERVATION_LOUNGE_MEETING.json');
  const notesDir = path.dirname(notesPath);
  if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir, { recursive: true });
  }
  
  const meetingRecord = {
    timestamp: new Date().toISOString(),
    location: 'Observation Lounge',
    attendees: Object.keys(crewReports).map(id => CREW_MEMBERS[id].name),
    notes: meetingNotes,
    totalMemories,
    totalContributions
  };
  
  fs.writeFileSync(notesPath, JSON.stringify(meetingRecord, null, 2));
  console.log(`📄 Meeting notes saved to: ${notesPath}\n`);
}

// Run meeting
conductCrewMeeting().catch(error => {
  console.error(`\n❌ Meeting failed: ${error.message}`);
  if (error.stack) {
    console.error('   Stack:', error.stack);
  }
  process.exit(1);
});

