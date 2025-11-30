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

  'agentic-system': {
    title: '🖖 Agentic System',
    description: 'Enhanced agentic architecture with Ship\'s Computer interface and individual crew member access to Supabase vector data. Features Majel Barrett voice responses and unified crew coordination.',
    status: 'implemented',
    implementationLevel: 90,
    requirements: [
      'Ship\'s Computer interface with voice responses',
      'Individual crew vector data access',
      'Unified crew coordination system',
      'Supabase vector database integration',
      'Real-time crew status monitoring'
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
    description: 'Comprehensive system health monitoring dashboard with real-time metrics, automated alerts, and performance tracking. Features CPU, memory, network, and uptime monitoring.',
    status: 'implemented',
    implementationLevel: 90,
    requirements: [
      'Historical metrics dashboard',
      'Advanced alerting rules'
    ]
  },
  
  'configuration': {
    title: '⚙️ Configuration',
    description: 'Advanced system configuration management with localStorage persistence, auto-save functionality, and real-time validation. Features comprehensive settings management.',
    status: 'implemented',
    implementationLevel: 90,
    requirements: [
      'Configuration backup/restore',
      'Advanced validation rules'
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
    description: 'Fully functional theme management system with real-time theme switching, CSS custom properties integration, and global theme persistence. All themes now properly apply across the entire application with WCAG AA compliant contrast ratios.',
    status: 'implemented',
    implementationLevel: 98,
    requirements: [
      'Theme sharing system',
      'Advanced theme validation'
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
    description: 'Apply selected theme to the application with global persistence and CSS custom properties. Features automatic theme application and localStorage persistence.',
    status: 'implemented',
    implementationLevel: 90,
    requirements: [
      'Theme sharing capabilities'
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
    description: 'Save configuration changes to the system with localStorage persistence and auto-save functionality. Features real-time validation and error handling.',
    status: 'implemented',
    implementationLevel: 85,
    requirements: [
      'Backend API integration',
      'Advanced validation rules'
    ]
  },
  
  'health-controls': {
    title: 'Health Monitoring Controls',
    description: 'Comprehensive system health monitoring with real-time metrics, automated alerts, and diagnostic tools. Features CPU, memory, and network monitoring.',
    status: 'implemented',
    implementationLevel: 85,
    requirements: [
      'Advanced diagnostic tools',
      'Historical metrics tracking'
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
  },

  // Role Management Features
  'edit-role': {
    title: '✏️ Edit Role',
    description: 'Modify role permissions, descriptions, and access levels. Create custom roles with specific capabilities and restrictions.',
    status: 'implemented',
    implementationLevel: 80,
    requirements: [
      'Role editing interface',
      'Permission management system',
      'Access level configuration',
      'Role validation and testing'
    ]
  },

  'create-role': {
    title: '➕ Create New Role',
    description: 'Create custom roles with specific permissions and access levels. Define role hierarchy and capabilities.',
    status: 'implemented',
    implementationLevel: 85,
    requirements: [
      'Role creation wizard',
      'Permission selection interface',
      'Role validation system',
      'Access level configuration'
    ]
  },

  'assign-roles': {
    title: '👥 Assign Roles',
    description: 'Assign roles to users and manage role-based access control. Bulk role assignment and user management.',
    status: 'implemented',
    implementationLevel: 75,
    requirements: [
      'User role assignment interface',
      'Bulk assignment capabilities',
      'Role hierarchy management',
      'Access control validation'
    ]
  },

  'audit-access': {
    title: '🔍 Audit Access',
    description: 'Audit user access patterns, role usage, and security events. Generate access reports and compliance documentation.',
    status: 'implemented',
    implementationLevel: 70,
    requirements: [
      'Access logging system',
      'Audit report generation',
      'Compliance documentation',
      'Security event tracking'
    ]
  },

  'security-settings': {
    title: '🛡️ Security Settings',
    description: 'Configure security policies, access controls, and authentication settings. Manage security protocols and compliance.',
    status: 'implemented',
    implementationLevel: 65,
    requirements: [
      'Security policy configuration',
      'Authentication settings',
      'Access control management',
      'Compliance monitoring'
    ]
  },

  // Theme Customization Features
  'create-theme': {
    title: '➕ Create Theme',
    description: 'Create custom themes with personalized colors, layouts, and visual styles. Design unique user experiences.',
    status: 'implemented',
    implementationLevel: 90,
    requirements: [
      'Theme creation wizard',
      'Color palette editor',
      'Live preview system',
      'Theme validation and testing'
    ]
  },

  'export-theme': {
    title: '📤 Export Theme',
    description: 'Export custom themes for sharing or backup. Generate theme files in various formats for distribution.',
    status: 'implemented',
    implementationLevel: 80,
    requirements: [
      'Theme export functionality',
      'Multiple format support',
      'Theme packaging system',
      'Sharing capabilities'
    ]
  },

  'import-theme': {
    title: '📥 Import Theme',
    description: 'Import themes from files or URLs. Support for various theme formats and validation.',
    status: 'implemented',
    implementationLevel: 75,
    requirements: [
      'Theme import system',
      'File format validation',
      'Theme compatibility checking',
      'Import preview and testing'
    ]
  },

  'theme-gallery': {
    title: '🖼️ Theme Gallery',
    description: 'Browse and download themes from the community gallery. Discover new themes and share your creations.',
    status: 'implemented',
    implementationLevel: 70,
    requirements: [
      'Theme gallery interface',
      'Community theme sharing',
      'Theme rating and reviews',
      'Download and installation'
    ]
  },

  'reset-defaults': {
    title: '🔄 Reset Defaults',
    description: 'Reset theme settings to default values. Restore original theme configurations and clear customizations.',
    status: 'implemented',
    implementationLevel: 85,
    requirements: [
      'Default theme restoration',
      'Customization clearing',
      'Confirmation dialogs',
      'Backup and recovery'
    ]
  },

  // Crew Management Features
  'crew-analytics': {
    title: '📊 Crew Analytics',
    description: 'Comprehensive analytics and reporting for crew performance, mission success rates, and operational metrics.',
    status: 'implemented',
    implementationLevel: 80,
    requirements: [
      'Performance analytics dashboard',
      'Mission success tracking',
      'Operational metrics',
      'Report generation system'
    ]
  },

  'assign-task': {
    title: '📋 Assign Task',
    description: 'Assign specific tasks and missions to crew members. Track task progress and completion status.',
    status: 'implemented',
    implementationLevel: 85,
    requirements: [
      'Task assignment interface',
      'Progress tracking system',
      'Completion monitoring',
      'Task prioritization'
    ]
  },

  'view-performance': {
    title: '📊 Performance Report',
    description: 'Generate detailed performance reports for individual crew members. Analyze metrics and identify improvement areas.',
    status: 'implemented',
    implementationLevel: 90,
    requirements: [
      'Performance report generation',
      'Metric analysis tools',
      'Trend identification',
      'Improvement recommendations'
    ]
  },

  'crew-scheduling': {
    title: '📅 Crew Scheduling',
    description: 'Manage crew schedules, shifts, and availability. Optimize crew assignments and resource allocation.',
    status: 'implemented',
    implementationLevel: 75,
    requirements: [
      'Schedule management interface',
      'Availability tracking',
      'Shift optimization',
      'Resource allocation tools'
    ]
  },

  'mission-assignment': {
    title: '🎯 Mission Assignment',
    description: 'Assign missions to crew members based on capabilities and availability. Track mission progress and outcomes.',
    status: 'implemented',
    implementationLevel: 80,
    requirements: [
      'Mission assignment system',
      'Capability matching',
      'Progress tracking',
      'Outcome analysis'
    ]
  },

  'performance-review': {
    title: '📈 Performance Review',
    description: 'Conduct comprehensive performance reviews for crew members. Generate feedback and improvement plans.',
    status: 'implemented',
    implementationLevel: 85,
    requirements: [
      'Performance review system',
      'Feedback generation',
      'Improvement planning',
      'Review scheduling'
    ]
  },

  'crew-training': {
    title: '🎓 Crew Training',
    description: 'Manage crew training programs and skill development. Track training progress and certification status.',
    status: 'implemented',
    implementationLevel: 70,
    requirements: [
      'Training program management',
      'Skill development tracking',
      'Certification monitoring',
      'Training scheduling'
    ]
  },

  'crew-responsibilities': {
    title: '🧠 Crew Responsibilities',
    description: 'Internal system logic visualization showing how crew members are associated with components. Understand the computer\'s definition of crew responsibilities and component ownership.',
    status: 'implemented',
    implementationLevel: 95,
    requirements: [
      'Responsibility mapping visualization',
      'Component assignment logic explanation',
      'Vector data access documentation',
      'System architecture insights'
    ]
  },

  'emergency-protocols': {
    title: '🚨 Emergency Protocols',
    description: 'Emergency crew role swapping and RAG memory inheritance system. Handle crew member failures, infinite loops, and unresponsive states with automatic backup activation and knowledge transfer.',
    status: 'implemented',
    implementationLevel: 90,
    requirements: [
      'Emergency detection and response protocols',
      'Automatic role swapping capabilities',
      'RAG memory inheritance system',
      'Backup crew activation procedures',
      'System continuity maintenance'
    ]
  },

  'n8n-integration': {
    title: '🖖 N8N Integration',
    description: 'Real-time workflow management and system integration with N8N server. Execute workflows, monitor executions, and manage Alex AI crew coordination through automated workflows.',
    status: 'implemented',
    implementationLevel: 85,
    requirements: [
      'Real-time N8N server connection',
      'Workflow execution and monitoring',
      'Crew coordination workflow integration',
      'Memory sync automation',
      'Emergency protocol execution',
      'Live execution status tracking'
    ]
  }
}
