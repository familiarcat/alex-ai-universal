#!/usr/bin/env node

/**
 * Alex AI Platform Launcher
 * Starts all services: Dashboard + 3 Projects
 */

const ProjectServer = require('./managed-projects/project-server-template');
const MultiProjectDashboard = require('./examples/demo-project/src/multi-project-dashboard');

// Project configurations
const projects = {
  alpha: {
    name: 'Enterprise E-commerce',
    port: 3000,
    icon: '🛒',
    description: 'Full-stack e-commerce platform with React and Node.js',
    tech: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    assignedCrew: ['data', 'troi', 'worf'],
    features: [
      'Product Catalog',
      'Shopping Cart',
      'Payment Processing',
      'Admin Dashboard'
    ],
    theme: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      primary: 'rgba(102, 126, 234, 0.2)',
      accent: '#667eea',
      text: '#ffffff'
    }
  },
  beta: {
    name: 'Starfleet Medical Portal',
    port: 3002,
    icon: '🏥',
    description: 'HIPAA-compliant healthcare portal with telemedicine',
    tech: ['Next.js', 'Supabase', 'TailwindCSS'],
    assignedCrew: ['crusher', 'laforge', 'worf'],
    features: [
      'Patient Records',
      'Appointment Scheduling',
      'Telemedicine',
      'HIPAA Compliance'
    ],
    theme: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      primary: 'rgba(245, 87, 108, 0.2)',
      accent: '#f5576c',
      text: '#ffffff'
    }
  },
  gamma: {
    name: 'Federation Analytics',
    port: 3003,
    icon: '📊',
    description: 'Real-time data visualization and analytics platform',
    tech: ['React', 'D3.js', 'Python/FastAPI', 'TimescaleDB'],
    assignedCrew: ['data', 'picard', 'quark'],
    features: [
      'Real-time Dashboards',
      'Custom Reports',
      'Data Export',
      'API Access'
    ],
    theme: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      primary: 'rgba(79, 172, 254, 0.2)',
      accent: '#4facfe',
      text: '#ffffff'
    }
  }
};

async function startPlatform() {
  console.log('\n🖖 ====================================');
  console.log('   ALEX AI PLATFORM LAUNCHER');
  console.log('   Multi-Project Management System');
  console.log('====================================\n');

  try {
    // Start Dashboard
    console.log('📊 Starting Multi-Project Dashboard...');
    const dashboard = new MultiProjectDashboard(3001);
    await dashboard.start();
    console.log('✅ Dashboard operational on port 3001\n');

    // Start all projects
    for (const [id, config] of Object.entries(projects)) {
      console.log(`🚀 Starting ${config.name}...`);
      const project = new ProjectServer(config);
      await project.start();
      console.log(`✅ ${config.name} operational on port ${config.port}\n`);
    }

    console.log('🎉 ====================================');
    console.log('   ALL SYSTEMS OPERATIONAL!');
    console.log('====================================\n');
    console.log('🖖 Dashboard:   http://localhost:3001');
    console.log('🛒 Project Alpha:  http://localhost:3000');
    console.log('🏥 Project Beta:   http://localhost:3002');
    console.log('📊 Project Gamma:  http://localhost:3003');
    console.log('\n👥 Managing 3 projects with 9 crew members');
    console.log('💰 Total portfolio value: $50,000');
    console.log('\n🔄 Press Ctrl+C to stop all services\n');

  } catch (error) {
    console.error('❌ Error starting platform:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down Alex AI Platform...');
  console.log('✅ All services stopped');
  process.exit(0);
});

// Start the platform
startPlatform();

