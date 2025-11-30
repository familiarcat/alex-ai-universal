/**
 * Agile Scrum Workflow Management
 * 
 * Manages Agile Scrum workflows for each project:
 * - Sprints
 * - Backlog
 * - Tasks/User Stories
 * - Burndown charts
 * - Team velocity
 * 
 * Reviewed by: Commander Riker (Operations)
 */

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goal: string;
  status: 'planned' | 'active' | 'completed';
  velocity?: number;
}

export interface BacklogItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  storyPoints?: number;
  status: 'backlog' | 'sprint' | 'in_progress' | 'done';
  sprintId?: string;
  assigneeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScrumMetrics {
  projectId: string;
  currentSprint?: Sprint;
  velocity: number;
  burndown: Array<{ date: Date; remaining: number }>;
  completedItems: number;
  totalItems: number;
}

export class ScrumWorkflowManager {
  /**
   * Create sprint for project
   */
  static createSprint(
    projectId: string,
    name: string,
    startDate: Date,
    endDate: Date,
    goal: string
  ): Sprint {
    return {
      id: `sprint-${Date.now()}`,
      projectId,
      name,
      startDate,
      endDate,
      goal,
      status: 'planned'
    };
  }
  
  /**
   * Add item to backlog
   */
  static createBacklogItem(
    projectId: string,
    title: string,
    description: string,
    priority: BacklogItem['priority'] = 'medium'
  ): BacklogItem {
    return {
      id: `item-${Date.now()}`,
      projectId,
      title,
      description,
      priority,
      status: 'backlog',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  /**
   * Get project metrics
   */
  static getProjectMetrics(
    projectId: string,
    sprints: Sprint[],
    backlogItems: BacklogItem[]
  ): ScrumMetrics {
    const activeSprint = sprints.find(s => s.status === 'active');
    const completedItems = backlogItems.filter(i => i.status === 'done').length;
    const totalItems = backlogItems.length;
    
    // Calculate velocity (average story points per sprint)
    const completedSprints = sprints.filter(s => s.status === 'completed');
    const velocity = completedSprints.length > 0
      ? completedSprints.reduce((sum, s) => sum + (s.velocity || 0), 0) / completedSprints.length
      : 0;
    
    return {
      projectId,
      currentSprint: activeSprint,
      velocity,
      burndown: [], // Would calculate from sprint data
      completedItems,
      totalItems
    };
  }
}

