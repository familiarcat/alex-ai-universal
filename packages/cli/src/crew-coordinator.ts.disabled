/**
 * Crew Coordinator
 * 
 * Intelligently assigns crew members to tasks based on project type,
 * task requirements, and crew member specializations.
 */

import { CrewMember } from '@alex-ai/universal';
import { ProjectInfo } from './project-detector';

export interface AssignedCrewMember {
  name: string;
  specialization: string;
  capabilities: string[];
  avatar: string;
  reason: string;
}

export class CrewCoordinator {
  private crewMembers: CrewMember[] = [
    {
      id: 'captain-picard',
      name: 'Captain Jean-Luc Picard',
      department: 'Command',
      specialization: 'Strategic Planning',
      personality: 'Diplomatic, strategic, and wise leader',
      capabilities: ['Strategic planning', 'Decision making', 'Mission command', 'Leadership'],
      avatar: '👨‍✈️'
    },
    {
      id: 'commander-riker',
      name: 'Commander William Riker',
      department: 'Tactical',
      specialization: 'Tactical Execution',
      personality: 'Confident, tactical, and decisive',
      capabilities: ['Code implementation', 'Workflow management', 'Tactical execution', 'Team leadership'],
      avatar: '👨‍💼'
    },
    {
      id: 'commander-data',
      name: 'Commander Data',
      department: 'Operations',
      specialization: 'Data Analysis',
      personality: 'Logical, analytical, and precise',
      capabilities: ['Code analysis', 'Logic operations', 'Data processing', 'AI/ML'],
      avatar: '🤖'
    },
    {
      id: 'geordi-la-forge',
      name: 'Geordi La Forge',
      department: 'Engineering',
      specialization: 'System Integration',
      personality: 'Innovative, technical, and problem-solving',
      capabilities: ['System integration', 'Infrastructure', 'Technical solutions', 'API design'],
      avatar: '👨‍🔧'
    },
    {
      id: 'lieutenant-worf',
      name: 'Lieutenant Worf',
      department: 'Security',
      specialization: 'Security & Testing',
      personality: 'Honorable, security-focused, and disciplined',
      capabilities: ['Security analysis', 'Testing', 'Risk assessment', 'Compliance'],
      avatar: '👨‍✈️'
    },
    {
      id: 'dr-crusher',
      name: 'Dr. Beverly Crusher',
      department: 'Medical',
      specialization: 'Performance Optimization',
      personality: 'Caring, analytical, and health-focused',
      capabilities: ['Performance optimization', 'Health diagnostics', 'System monitoring', 'Quality assurance'],
      avatar: '👩‍⚕️'
    },
    {
      id: 'counselor-troi',
      name: 'Counselor Deanna Troi',
      department: 'Counseling',
      specialization: 'User Experience',
      personality: 'Empathetic, user-focused, and intuitive',
      capabilities: ['User experience', 'Quality assurance', 'Empathy analysis', 'UX design'],
      avatar: '👩‍💼'
    },
    {
      id: 'lieutenant-uhura',
      name: 'Lieutenant Uhura',
      department: 'Communications',
      specialization: 'Automation',
      personality: 'Communicative, organized, and efficient',
      capabilities: ['Workflow automation', 'Communications', 'I/O operations', 'Documentation'],
      avatar: '👩‍💻'
    },
    {
      id: 'quark',
      name: 'Quark',
      department: 'Business',
      specialization: 'Business Analysis',
      personality: 'Entrepreneurial, profit-focused, and strategic',
      capabilities: ['Business analysis', 'ROI optimization', 'Budget analysis', 'Strategic planning'],
      avatar: '👨‍💼'
    }
  ];

  async assignTask(taskName: string, projectInfo?: ProjectInfo): Promise<AssignedCrewMember[]> {
    const taskLower = taskName.toLowerCase();
    const assignedCrew: AssignedCrewMember[] = [];

    // Task-based assignment logic
    for (const member of this.crewMembers) {
      const assignment = this.evaluateCrewMember(member, taskLower, projectInfo);
      if (assignment) {
        assignedCrew.push(assignment);
      }
    }

    // If no specific assignments, assign based on project type
    if (assignedCrew.length === 0 && projectInfo) {
      const projectBasedAssignment = this.assignBasedOnProjectType(projectInfo);
      assignedCrew.push(...projectBasedAssignment);
    }

    // Default assignment if still no matches
    if (assignedCrew.length === 0) {
      assignedCrew.push({
        name: 'Commander Data',
        specialization: 'Data Analysis',
        capabilities: ['Code analysis', 'Logic operations', 'Data processing'],
        avatar: '🤖',
        reason: 'Default assignment for general assistance'
      });
    }

    return assignedCrew;
  }

  private evaluateCrewMember(member: CrewMember, taskName: string, projectInfo?: ProjectInfo): AssignedCrewMember | null {
    const capabilities = member.capabilities.map(cap => cap.toLowerCase());
    const specialization = member.specialization.toLowerCase();
    const department = member.department.toLowerCase();

    // Direct task matching
    if (this.matchesTask(taskName, capabilities, specialization, department)) {
      return {
        name: member.name,
        specialization: member.specialization,
        capabilities: member.capabilities,
        avatar: member.avatar || '🤖',
        reason: `Specialized in ${member.specialization} and has relevant capabilities`
      };
    }

    // Project type matching
    if (projectInfo && this.matchesProjectType(projectInfo, capabilities, specialization, department)) {
      return {
        name: member.name,
        specialization: member.specialization,
        capabilities: member.capabilities,
        avatar: member.avatar || '🤖',
        reason: `Best suited for ${projectInfo.type} projects`
      };
    }

    return null;
  }

  private matchesTask(taskName: string, capabilities: string[], specialization: string, department: string): boolean {
    // Build task matching
    if (taskName.includes('build') || taskName.includes('compile') || taskName.includes('make')) {
      return capabilities.some(cap => 
        cap.includes('implementation') || 
        cap.includes('engineering') || 
        cap.includes('system') ||
        cap.includes('infrastructure')
      );
    }

    // Test task matching
    if (taskName.includes('test') || taskName.includes('testing') || taskName.includes('spec')) {
      return capabilities.some(cap => 
        cap.includes('testing') || 
        cap.includes('quality') || 
        cap.includes('security') ||
        cap.includes('assurance')
      );
    }

    // Security task matching
    if (taskName.includes('security') || taskName.includes('audit') || taskName.includes('vulnerability')) {
      return capabilities.some(cap => 
        cap.includes('security') || 
        cap.includes('compliance') || 
        cap.includes('risk') ||
        cap.includes('testing')
      );
    }

    // Deploy task matching
    if (taskName.includes('deploy') || taskName.includes('release') || taskName.includes('production')) {
      return capabilities.some(cap => 
        cap.includes('deployment') || 
        cap.includes('infrastructure') || 
        cap.includes('system') ||
        cap.includes('automation')
      );
    }

    // Research task matching
    if (taskName.includes('research') || taskName.includes('analyze') || taskName.includes('investigate')) {
      return capabilities.some(cap => 
        cap.includes('analysis') || 
        cap.includes('research') || 
        cap.includes('data') ||
        cap.includes('logic')
      );
    }

    // Optimize task matching
    if (taskName.includes('optimize') || taskName.includes('performance') || taskName.includes('improve')) {
      return capabilities.some(cap => 
        cap.includes('optimization') || 
        cap.includes('performance') || 
        cap.includes('health') ||
        cap.includes('quality')
      );
    }

    // Design task matching
    if (taskName.includes('design') || taskName.includes('ui') || taskName.includes('ux')) {
      return capabilities.some(cap => 
        cap.includes('design') || 
        cap.includes('user') || 
        cap.includes('experience') ||
        cap.includes('empathy')
      );
    }

    // Business task matching
    if (taskName.includes('business') || taskName.includes('cost') || taskName.includes('roi') || taskName.includes('budget')) {
      return capabilities.some(cap => 
        cap.includes('business') || 
        cap.includes('roi') || 
        cap.includes('budget') ||
        cap.includes('analysis')
      );
    }

    // Documentation task matching
    if (taskName.includes('document') || taskName.includes('doc') || taskName.includes('readme')) {
      return capabilities.some(cap => 
        cap.includes('documentation') || 
        cap.includes('communication') || 
        cap.includes('automation') ||
        cap.includes('workflow')
      );
    }

    return false;
  }

  private matchesProjectType(projectInfo: ProjectInfo, capabilities: string[], specialization: string, department: string): boolean {
    // React/Next.js projects
    if (projectInfo.type === 'react' || projectInfo.type === 'nextjs') {
      return capabilities.some(cap => 
        cap.includes('implementation') || 
        cap.includes('user') || 
        cap.includes('engineering') ||
        cap.includes('system')
      );
    }

    // Node.js projects
    if (projectInfo.type === 'node') {
      return capabilities.some(cap => 
        cap.includes('engineering') || 
        cap.includes('system') || 
        cap.includes('infrastructure') ||
        cap.includes('implementation')
      );
    }

    // Python projects
    if (projectInfo.type === 'python') {
      return capabilities.some(cap => 
        cap.includes('analysis') || 
        cap.includes('data') || 
        cap.includes('logic') ||
        cap.includes('engineering')
      );
    }

    // Java projects
    if (projectInfo.type === 'java') {
      return capabilities.some(cap => 
        cap.includes('engineering') || 
        cap.includes('system') || 
        cap.includes('implementation') ||
        cap.includes('infrastructure')
      );
    }

    // Go projects
    if (projectInfo.type === 'go') {
      return capabilities.some(cap => 
        cap.includes('engineering') || 
        cap.includes('system') || 
        cap.includes('infrastructure') ||
        cap.includes('performance')
      );
    }

    // Rust projects
    if (projectInfo.type === 'rust') {
      return capabilities.some(cap => 
        cap.includes('engineering') || 
        cap.includes('system') || 
        cap.includes('performance') ||
        cap.includes('optimization')
      );
    }

    return false;
  }

  private assignBasedOnProjectType(projectInfo: ProjectInfo): AssignedCrewMember[] {
    const assignments: AssignedCrewMember[] = [];

    // Always include Data for analysis
    const data = this.crewMembers.find(m => m.id === 'commander-data');
    if (data) {
      assignments.push({
        name: data.name,
        specialization: data.specialization,
        capabilities: data.capabilities,
        avatar: data.avatar || '🤖',
        reason: 'Essential for code analysis and logic operations'
      });
    }

    // Add project-specific crew members
    if (projectInfo.type === 'react' || projectInfo.type === 'nextjs') {
      const troi = this.crewMembers.find(m => m.id === 'counselor-troi');
      if (troi) {
        assignments.push({
          name: troi.name,
          specialization: troi.specialization,
          capabilities: troi.capabilities,
          avatar: troi.avatar || '🤖',
          reason: 'Best for React/Next.js user experience and design'
        });
      }
    }

    if (projectInfo.type === 'node' || projectInfo.type === 'python') {
      const laForge = this.crewMembers.find(m => m.id === 'geordi-la-forge');
      if (laForge) {
        assignments.push({
          name: laForge.name,
          specialization: laForge.specialization,
          capabilities: laForge.capabilities,
          avatar: laForge.avatar || '🤖',
          reason: 'Expert in system integration and infrastructure'
        });
      }
    }

    if (projectInfo.hasTests) {
      const worf = this.crewMembers.find(m => m.id === 'lieutenant-worf');
      if (worf) {
        assignments.push({
          name: worf.name,
          specialization: worf.specialization,
          capabilities: worf.capabilities,
          avatar: worf.avatar || '🤖',
          reason: 'Specialized in testing and quality assurance'
        });
      }
    }

    return assignments;
  }

  getCrewMembers(): CrewMember[] {
    return this.crewMembers;
  }

  getCrewMemberById(id: string): CrewMember | undefined {
    return this.crewMembers.find(member => member.id === id);
  }

  getCrewMembersByDepartment(department: string): CrewMember[] {
    return this.crewMembers.filter(member => 
      member.department.toLowerCase() === department.toLowerCase()
    );
  }

  getCrewMembersBySpecialization(specialization: string): CrewMember[] {
    return this.crewMembers.filter(member => 
      member.specialization.toLowerCase().includes(specialization.toLowerCase())
    );
  }
}
