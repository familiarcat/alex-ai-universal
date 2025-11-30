#!/usr/bin/env node

// Observation Lounge Meeting: Summaries from Supabase crew memories
(async () => {
  try {
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
    if (!supabaseUrl || (!serviceKey && !anonKey)) {
      console.error('Missing SUPABASE_URL and a key (SUPABASE_SERVICE_ROLE_KEY preferred, otherwise SUPABASE_ANON_KEY).');
      process.exit(1);
    }

    const rest = `${supabaseUrl}/rest/v1`;
    const headers = serviceKey ?
      {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      } : {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

    const crewOrder = [
      { id: 'picard', name: 'Captain Jean-Luc Picard', title: 'Strategic Coordinator' },
      { id: 'data', name: 'Commander Data', title: 'Operations Analyst' },
      { id: 'la_forge', name: 'Lieutenant Commander Geordi La Forge', title: 'Chief Engineer' },
      { id: 'worf', name: 'Lieutenant Worf', title: 'Security Chief' },
      { id: 'troi', name: 'Counselor Deanna Troi', title: 'Empathy Specialist' },
      { id: 'riker', name: 'Commander William Riker', title: 'Executive Officer' },
      { id: 'crusher', name: 'Dr. Beverly Crusher', title: 'Chief Medical Officer' },
      { id: 'uhura', name: 'Lieutenant Uhura', title: 'Communications Officer' },
      { id: 'quark', name: 'Quark', title: 'Business Operations' }
    ];

    async function getJson(url) {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} ${url}: ${text}`);
      }
      return await res.json();
    }

    console.log('\n' + '='.repeat(80));
    console.log('🏛️  OBSERVATION LOUNGE — CREW E2E SYSTEM REVIEW');
    console.log('='.repeat(80));

    // Global stats
    const contrib = await getJson(`${rest}/crew_contributions_summary?select=*`);
    const totals = await getJson(`${rest}/crew_memory_summary?select=count`);
    const totalMemories = Array.isArray(totals) && totals[0]?.count ? totals[0].count : undefined;
    console.log(`\n📊 System overview: ${contrib.length} crew contributors${totalMemories?`, ${totalMemories} memories total`:''}`);

    for (const c of crewOrder) {
      const summaryRows = await getJson(
        `${rest}/crew_contributions_summary?select=*&crew_member=eq.${encodeURIComponent(c.id)}`
      );
      const summary = summaryRows[0] || null;
      const recent = await getJson(
        `${rest}/crew_memory_summary?select=id,title,summary,knowledge_type,priority,confidence_level,timestamp&crew_member=eq.${encodeURIComponent(c.id)}&order=timestamp.desc&limit=3`
      );

      console.log('\n' + '-'.repeat(60));
      console.log(`🎭 ${c.name.toUpperCase()} — ${c.title}`);
      if (!summary) {
        console.log('   No recorded Supabase memories yet.');
        continue;
      }
      console.log(`   Total memories: ${summary.total_memories} | Avg confidence: ${summary.avg_confidence} | Diversity: ${summary.knowledge_diversity}`);
      console.log(`   Last contribution: ${summary.last_contribution || 'n/a'}`);

      if (recent.length) {
        console.log('   Recent entries:');
        for (const r of recent) {
          const title = (r.title || '').slice(0, 120);
          const sum = (r.summary || '').replace(/\s+/g, ' ').slice(0, 160);
          console.log(`    - ${title} [${r.knowledge_type} | ${r.priority} | conf:${r.confidence_level}]`);
          console.log(`      ${sum}`);
        }
      } else {
        console.log('   No recent entries.');
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('🧭 E2E status check:');
    // Optional: ping n8n health (non-fatal)
    const n8n = (process.env.N8N_URL || process.env.N8N_BASE_URL || 'https://n8n.pbradygeorgen.com').replace(/\/$/, '');
    try {
      const r = await fetch(`${n8n}/healthz`);
      console.log(`   n8n health: ${r.ok ? 'OK' : 'FAIL'}`);
    } catch {
      console.log('   n8n health: unknown');
    }
    console.log('   Supabase: queried crew summaries and latest memories');
    console.log('='.repeat(80) + '\n');
  } catch (err) {
    console.error('Observation lounge meeting failed:', err?.message || String(err));
    process.exit(1);
  }
})();


