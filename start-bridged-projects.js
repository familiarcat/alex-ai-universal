#!/usr/bin/env node

const EnhancedProjectServer = require('./managed-projects/enhanced-project-server');
const MultiProjectManager = require('./examples/demo-project/src/multi-project-manager');
const UniversalThemeManager = require('./universal-theme-system/theme-manager');

async function main() {
  const projectManager = new MultiProjectManager();
  const themeManager = new UniversalThemeManager();

  const projects = projectManager.getAllProjects();
  const overrides = new Map([
    ['alpha', 3004], // move alpha off 3000 since dashboard owns 3000
  ]);

  await Promise.all(projects.map(async (project) => {
    const themeId = themeManager.getProjectTheme(project.id);
    const server = new EnhancedProjectServer({
      ...project,
      port: overrides.get(project.id) || project.port,
    }, themeId);
    await server.start();
  }));

  console.log('\n🧭 Bridged project servers are running. Access via:');
  console.log('   Alpha:  http://localhost:3000/bridge/projects/alpha/');
  console.log('   Beta:   http://localhost:3000/bridge/projects/beta/');
  console.log('   Gamma:  http://localhost:3000/bridge/projects/gamma/');
}

main().catch((err) => {
  console.error('Failed to start bridged projects:', err);
  process.exit(1);
});


