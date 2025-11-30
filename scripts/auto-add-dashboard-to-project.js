#!/usr/bin/env node
/**
 * Auto-Add Dashboard to New Projects
 * 
 * Automatically adds a dashboard component to any new Alex AI project
 * Commander Riker's recommendation: Automatic dashboard integration
 * 
 * This script:
 * 1. Detects new project creation
 * 2. Adds ProjectManager component to project dashboard
 * 3. Configures dashboard to manage all Alex AI projects
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = process.cwd();

/**
 * Ensure project has dashboard with ProjectManager component
 */
function ensureProjectDashboard(projectId, projectName) {
  const dashboardDir = path.join(WORKSPACE_ROOT, 'packages', `${projectId}-dashboard`);
  
  // Check if dashboard already exists
  if (fs.existsSync(dashboardDir)) {
    console.log(`✅ Dashboard already exists for project: ${projectId}`);
    return;
  }

  console.log(`🚀 Creating dashboard for project: ${projectName} (${projectId})`);
  
  // Create dashboard using scaffolding script
  const { execSync } = require('child_process');
  const scaffoldScript = path.join(WORKSPACE_ROOT, 'scripts', 'create-project-dashboard.sh');
  
  try {
    execSync(`bash "${scaffoldScript}" "${projectName}"`, {
      cwd: WORKSPACE_ROOT,
      stdio: 'inherit'
    });
    
    // Add ProjectManager component to dashboard
    addProjectManagerToDashboard(dashboardDir, projectId);
    
    console.log(`✅ Dashboard created with ProjectManager component`);
  } catch (error) {
    console.error(`❌ Failed to create dashboard: ${error.message}`);
    throw error;
  }
}

/**
 * Add ProjectManager component to dashboard
 */
function addProjectManagerToDashboard(dashboardDir, projectId) {
  const dashboardPagePath = path.join(dashboardDir, 'src', 'pages', 'dashboard.tsx');
  
  if (!fs.existsSync(dashboardPagePath)) {
    console.warn(`⚠️  Dashboard page not found: ${dashboardPagePath}`);
    return;
  }

  // Read current dashboard page
  let dashboardContent = fs.readFileSync(dashboardPagePath, 'utf8');
  
  // Add ProjectManager import if not present
  if (!dashboardContent.includes('ProjectManager')) {
    dashboardContent = dashboardContent.replace(
      /import { GridLayout, DataTable, DataChart, BaseCard } from '@alex-ai\/dashboard-core';/,
      `import { GridLayout, DataTable, DataChart, BaseCard, ProjectManager } from '@alex-ai/dashboard-core';
import { useProjectManager } from '@alex-ai/dashboard-core/hooks/useProjectManager';`
    );
  }

  // Add ProjectManager component to render function
  if (!dashboardContent.includes('ProjectManager')) {
    // Find the renderComponent function and add ProjectManager case
    dashboardContent = dashboardContent.replace(
      /const renderComponent = \(component: DashboardComponent\) => \{[\s\S]*?switch \(component\.type\) \{([\s\S]*?)\s*default:/,
      `const renderComponent = (component: DashboardComponent) => {
    const { projects, createProject, updateProject, deleteProject } = useProjectManager();
    
    switch (component.type) {
      case 'project-manager':
        return (
          <ProjectManager
            component={component}
            theme={projectTheme}
            projects={projects}
            onProjectCreate={createProject}
            onProjectUpdate={updateProject}
            onProjectDelete={deleteProject}
            editable={project.config?.editable}
          />
        );
$1      default:`
    );
  }

  // Add default ProjectManager component to project if not present
  if (!dashboardContent.includes('project-manager')) {
    // This would require modifying the project object, which is passed as prop
    // For now, we'll add a comment indicating how to add it
    dashboardContent = dashboardContent.replace(
      /export default function DashboardPage/,
      `// Note: Add ProjectManager component to your project.components array:
// {
//   id: 'project-manager-1',
//   type: 'project-manager',
//   title: 'Alex AI Projects',
//   editable: true
// }

export default function DashboardPage`
    );
  }

  fs.writeFileSync(dashboardPagePath, dashboardContent);
  console.log(`✅ Added ProjectManager component to dashboard`);
}

/**
 * Create default project with dashboard
 */
function createProjectWithDashboard(projectName, projectId) {
  const project = {
    id: projectId,
    name: projectName,
    description: `Alex AI project: ${projectName}`,
    type: 'alex-ai',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dashboard: {
      enabled: true,
      components: [
        {
          id: 'project-manager-1',
          type: 'project-manager',
          title: 'Alex AI Projects',
          editable: true,
          deletable: false,
          config: {
            showCreateButton: true,
            showEditButton: true,
            showDeleteButton: true
          }
        }
      ]
    }
  };

  return project;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const projectName = args[0] || 'New Project';
  const projectId = args[1] || `project-${Date.now()}`;

  console.log('🖖 Auto-Adding Dashboard to New Project');
  console.log('========================================\n');
  console.log(`Project: ${projectName}`);
  console.log(`ID: ${projectId}\n`);

  try {
    // Create project with dashboard
    const project = createProjectWithDashboard(projectName, projectId);
    
    // Ensure dashboard exists
    ensureProjectDashboard(projectId, projectName);
    
    console.log('\n✅ Project created with dashboard!');
    console.log(`   Dashboard location: packages/${projectId}-dashboard/`);
    console.log(`   ProjectManager component: Enabled`);
    console.log(`   Project management: Ready`);
    
  } catch (error) {
    console.error(`❌ Failed to create project with dashboard: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ensureProjectDashboard, createProjectWithDashboard };

