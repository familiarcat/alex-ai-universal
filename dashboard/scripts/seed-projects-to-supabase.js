#!/usr/bin/env node

/**
 * Seed Default Projects to Supabase
 * 
 * Purpose: Initialize Supabase with the 4 default projects (alpha, beta, gamma, temporal)
 * so the dashboard can properly follow DDD architecture:
 * 
 * Client (Dashboard) => n8n => Supabase (single source of truth)
 * 
 * This eliminates the need for localStorage hacks and clear-state utilities.
 */

const defaultProjects = {
  alpha: {
    headline: '✨ Discover Your Next Obsession',
    subheadline: 'Curated collections of premium streetwear and creative essentials',
    description: 'Limited edition drops and exclusive designs you won\'t find anywhere else. New releases every Friday.',
    theme: 'gradient',
    projectType: 'business',
    updatedAt: Date.now()
  },
  beta: {
    headline: 'Compassionate Care, When You Need It Most',
    subheadline: 'Board-certified providers dedicated to your health and wellness',
    description: 'Professional healthcare services with telemedicine, patient portal, and HIPAA-compliant security.',
    theme: 'pastel',
    projectType: 'business',
    updatedAt: Date.now()
  },
  gamma: {
    headline: '⚡ Unlock the Power of Your Data',
    subheadline: 'Real-time analytics and ML-powered insights for modern teams',
    description: 'Advanced dashboards, custom reports, powerful API access, and predictive analytics.',
    theme: 'cyberpunk',
    projectType: 'business',
    updatedAt: Date.now()
  },
  temporal: {
    headline: '⏰ Temporal Wake - Screenplay & Novel',
    subheadline: 'Professional screenplay and novel writing system with visualization',
    description: 'Complete creative writing suite with screenplay formatting, novel composition, outline tools, and Mermaid timeline visualization.',
    theme: 'offworld',
    projectType: 'creative',
    updatedAt: Date.now()
  }
};

async function seedProjectToSupabase(projectId, content) {
  const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
  
  console.log(`📤 Syncing ${projectId} to Supabase via n8n...`);
  
  try {
    const response = await fetch(`${N8N_URL}/webhook/project-content-store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        ...content,
        action: 'upsert',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const result = await response.json();
    console.log(`✅ ${projectId}: Synced successfully`);
    return result;
  } catch (error) {
    console.error(`❌ ${projectId}: Failed to sync - ${error.message}`);
    return null;
  }
}

async function seedAllProjects() {
  console.log('🌱 Seeding Default Projects to Supabase');
  console.log('==========================================\n');
  
  console.log('DDD Flow: Client => n8n => Supabase\n');
  
  const results = [];
  
  for (const [projectId, content] of Object.entries(defaultProjects)) {
    const result = await seedProjectToSupabase(projectId, content);
    results.push({ projectId, success: !!result });
    
    // Small delay to avoid overwhelming n8n
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n==========================================');
  console.log('📊 Seeding Summary:\n');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/4`);
  console.log(`❌ Failed: ${failed}/4\n`);
  
  if (successful === 4) {
    console.log('🎉 All projects seeded to Supabase!');
    console.log('\nNext steps:');
    console.log('1. Remove clear-state utility (no longer needed)');
    console.log('2. Dashboard will now load from Supabase via n8n');
    console.log('3. localStorage becomes optimistic cache only');
    console.log('\n🖖 DDD architecture restored!');
  } else {
    console.log('⚠️  Some projects failed to sync. Check n8n webhook configuration.');
    console.log(`\nWebhook URL: ${process.env.N8N_URL || 'https://n8n.pbradygeorgen.com'}/webhook/project-content-store`);
  }
  
  process.exit(successful === 4 ? 0 : 1);
}

// Run if executed directly
if (require.main === module) {
  seedAllProjects().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { seedAllProjects, seedProjectToSupabase, defaultProjects };

