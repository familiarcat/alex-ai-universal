/**
 * Alex AI Multi-Project Manager
 * Manages multiple projects from a single dashboard
 */

const http = require('http');
const { Server: SocketIO } = require('socket.io');

class MultiProjectManager {
  constructor() {
    this.projects = new Map();
    this.nextPort = 3000;
    this.reservedPorts = new Set([3001]); // Dashboard port
    
    // Initialize with 3 sample projects
    this.initializeProjects();
  }

  initializeProjects() {
    this.projects.set('alpha', {
      id: 'alpha',
      name: 'Enterprise E-commerce',
      description: 'Full-stack e-commerce platform with React and Node.js',
      port: 3000,
      status: 'stopped',
      type: 'e-commerce',
      tech: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      assignedCrew: ['data', 'troi', 'worf'],
      createdAt: new Date().toISOString(),
      metrics: {
        uptime: 0,
        requests: 0,
        errors: 0,
        responseTime: 0
      },
      budget: 15000,
      timeline: '4 weeks',
      features: [
        'Product catalog',
        'Shopping cart',
        'Payment processing',
        'Admin dashboard'
      ]
    });

    this.projects.set('beta', {
      id: 'beta',
      name: 'Starfleet Medical Portal',
      description: 'HIPAA-compliant healthcare portal with telemedicine',
      port: 3002,
      status: 'stopped',
      type: 'healthcare',
      tech: ['Next.js', 'Supabase', 'TailwindCSS'],
      assignedCrew: ['crusher', 'laforge', 'worf'],
      createdAt: new Date().toISOString(),
      metrics: {
        uptime: 0,
        requests: 0,
        errors: 0,
        responseTime: 0
      },
      budget: 25000,
      timeline: '6 weeks',
      features: [
        'Patient records',
        'Appointment scheduling',
        'Telemedicine',
        'HIPAA compliance'
      ]
    });

    this.projects.set('gamma', {
      id: 'gamma',
      name: 'Federation Analytics',
      description: 'Real-time data visualization and analytics platform',
      port: 3003,
      status: 'stopped',
      type: 'analytics',
      tech: ['React', 'D3.js', 'Python/FastAPI', 'TimescaleDB'],
      assignedCrew: ['data', 'picard', 'quark'],
      createdAt: new Date().toISOString(),
      metrics: {
        uptime: 0,
        requests: 0,
        errors: 0,
        responseTime: 0
      },
      budget: 10000,
      timeline: '3 weeks',
      features: [
        'Real-time dashboards',
        'Custom reports',
        'Data export',
        'API access'
      ]
    });
  }

  getAllProjects() {
    return Array.from(this.projects.values());
  }

  getProject(projectId) {
    return this.projects.get(projectId);
  }

  getProjectStats() {
    const projects = this.getAllProjects();
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'running').length,
      stopped: projects.filter(p => p.status === 'stopped').length,
      totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
      avgResponseTime: projects.reduce((sum, p) => sum + p.metrics.responseTime, 0) / projects.length
    };
  }

  async startProject(projectId) {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);
    
    project.status = 'running';
    project.startedAt = new Date().toISOString();
    return project;
  }

  async stopProject(projectId) {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);
    
    project.status = 'stopped';
    project.stoppedAt = new Date().toISOString();
    return project;
  }

  updateProjectMetrics(projectId, metrics) {
    const project = this.projects.get(projectId);
    if (project) {
      Object.assign(project.metrics, metrics);
    }
  }

  assignCrewToProject(projectId, crewId) {
    const project = this.projects.get(projectId);
    if (project && !project.assignedCrew.includes(crewId)) {
      project.assignedCrew.push(crewId);
    }
    return project;
  }

  removeCrewFromProject(projectId, crewId) {
    const project = this.projects.get(projectId);
    if (project) {
      project.assignedCrew = project.assignedCrew.filter(id => id !== crewId);
    }
    return project;
  }

  getCrewWorkload() {
    const workload = {};
    this.projects.forEach(project => {
      project.assignedCrew.forEach(crewId => {
        if (!workload[crewId]) workload[crewId] = [];
        workload[crewId].push({
          projectId: project.id,
          projectName: project.name
        });
      });
    });
    return workload;
  }
}

module.exports = MultiProjectManager;

