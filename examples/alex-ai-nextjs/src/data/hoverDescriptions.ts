export interface HoverDescription {
  title: string
  description: string
  status: 'implemented' | 'partial' | 'not-implemented'
  implementationLevel: number
  requirements: string[]
}

export const hoverDescriptions: Record<string, HoverDescription> = {
  // Primary Navigation
  'dashboard': {
    title: '🎛️ Dashboard',
    description: 'Main control panel with crew intelligence monitoring, real-time updates, and system overview. Features enhanced dashboard with interactive crew grid and mission status display.',
    status: 'implemented',
    implementationLevel: 85,
    requirements: [
      'WebSocket integration for real-time updates',
      'Backend API for crew status data',
      'Mission progress tracking',
      'System performance metrics'
    ]
  },
  
  'live-frontend': {
    title: '🌐 Live Frontend',
    description: 'Public-facing view of the application with live updates. Currently displays dashboard layout but lacks real-time content synchronization and public-specific features.',
    status: 'partial',
    implementationLevel: 60,
    requirements: [
      'Real-time content synchronization',
      'Public-specific content filtering',
      'Live update mechanisms',
      'Public engagement features'
    ]
  },
  
  'admin-panel': {
    title: '🔐 Admin Panel',
    description: 'Administrative control center for system management. Currently displays admin interface but lacks backend integration for actual administrative functions.',
    status: 'partial',
    implementationLevel: 40,
    requirements: [
      'User management system',
      'System configuration controls',
      'Security monitoring',
      'Administrative logs',
      'Database management tools'
    ]
  },
  
  'public-view': {
    title: '👁️ Public View',
    description: 'Public information page for external visitors. Basic layout implemented but lacks public-specific content and features.',
    status: 'partial',
    implementationLevel: 30,
    requirements: [
      'Public information content',
      'Contact forms',
      'Public documentation',
      'System status for public',
      'Public engagement features'
    ]
  },
  
  // Secondary Navigation
  'health-check': {
    title: '🏥 Health Check',
    description: 'System health monitoring dashboard with real-time status indicators. Displays system metrics but lacks actual health monitoring backend integration.',
    status: 'partial',
    implementationLevel: 50,
    requirements: [
      'Real-time system monitoring',
      'Health metrics collection',
      'Alert system',
      'Performance tracking',
      'System diagnostics'
    ]
  },
  
  'configuration': {
    title: '⚙️ Configuration',
    description: 'System configuration management interface. Provides configuration options but lacks backend persistence and validation.',
    status: 'partial',
    implementationLevel: 45,
    requirements: [
      'Configuration persistence',
      'Validation system',
      'Real-time configuration updates',
      'Configuration backup/restore',
      'Advanced settings'
    ]
  },
  
  'crew-status': {
    title: '👥 Crew Status',
    description: 'Comprehensive crew member status dashboard with real-time activity tracking, performance metrics, and task management. Fully functional with filtering and sorting capabilities.',
    status: 'implemented',
    implementationLevel: 90,
    requirements: [
      'Real-time crew activity updates',
      'Task assignment interface',
      'Performance analytics'
    ]
  },
  
  'contrast-test': {
    title: '🎨 Contrast Test',
    description: 'Accessibility testing tool for UI contrast validation. Provides comprehensive contrast testing across different themes and components with WCAG compliance checking.',
    status: 'implemented',
    implementationLevel: 95,
    requirements: [
      'Automated contrast reporting',
      'Export functionality'
    ]
  },
  
  'theme-manager': {
    title: '🎨 Theme Manager',
    description: 'Advanced theme management system with custom theme creation, real-time preview, and theme persistence. Theme switching works but lacks global application.',
    status: 'partial',
    implementationLevel: 70,
    requirements: [
      'Global theme application',
      'Theme persistence',
      'Custom theme validation',
      'Theme sharing system'
    ]
  },
  
  'navigation-demo': {
    title: '🧭 Navigation Demo',
    description: 'Interactive demonstration of role-based navigation system. Shows different user roles, permissions, and access levels with live role switching.',
    status: 'implemented',
    implementationLevel: 100,
    requirements: []
  },
  
  // Interactive Elements
  'role-switcher': {
    title: 'Role Switcher',
    description: 'Dynamic role switching for testing different access levels. Instantly changes navigation permissions and available features.',
    status: 'implemented',
    implementationLevel: 100,
    requirements: []
  },
  
  'theme-apply': {
    title: 'Apply Theme',
    description: 'Apply selected theme to the application. Currently updates local state but doesn\'t persist or apply globally.',
    status: 'partial',
    implementationLevel: 60,
    requirements: [
      'Global theme application',
      'Theme persistence'
    ]
  },
  
  'crew-member-card': {
    title: 'Crew Member Profile',
    description: 'Interactive crew member profiles with status indicators, specializations, and performance metrics. Click for detailed information.',
    status: 'implemented',
    implementationLevel: 85,
    requirements: [
      'Detailed crew member modals',
      'Task assignment interface'
    ]
  },
  
  'config-save': {
    title: 'Save Configuration',
    description: 'Save configuration changes to the system. Currently displays placeholder functionality without backend persistence.',
    status: 'not-implemented',
    implementationLevel: 20,
    requirements: [
      'Backend persistence',
      'Validation system',
      'Success/error feedback'
    ]
  },
  
  'health-controls': {
    title: 'Health Monitoring Controls',
    description: 'System health monitoring controls for diagnostics and maintenance. Interface exists but lacks actual monitoring functionality.',
    status: 'not-implemented',
    implementationLevel: 15,
    requirements: [
      'Actual monitoring system',
      'Diagnostic tools',
      'Alert management'
    ]
  },
  
  // Demo Actions
  'view-dashboard': {
    title: 'View Dashboard',
    description: 'Navigate to the main dashboard view with enhanced controls and crew intelligence monitoring.',
    status: 'implemented',
    implementationLevel: 85,
    requirements: [
      'Real-time data updates',
      'Interactive crew selection'
    ]
  },
  
  'view-live-frontend': {
    title: 'View Live Frontend',
    description: 'Switch to the live frontend view showing public-facing content with real-time updates.',
    status: 'partial',
    implementationLevel: 60,
    requirements: [
      'Real-time content sync',
      'Public content filtering'
    ]
  },
  
  'view-admin-panel': {
    title: 'View Admin Panel',
    description: 'Access the administrative control panel with system management capabilities and security controls.',
    status: 'partial',
    implementationLevel: 40,
    requirements: [
      'Admin backend integration',
      'User management system',
      'Security monitoring'
    ]
  },
  
  'view-public-page': {
    title: 'View Public Page',
    description: 'Display the public information page with system status and public engagement features.',
    status: 'partial',
    implementationLevel: 30,
    requirements: [
      'Public content management',
      'Contact forms',
      'Public documentation'
    ]
  }
}
