/**
 * Create Vibe Project Use Case
 * Orchestrates multiple domains to create a project with theme and crew
 * 
 * Reviewed by: Captain Picard (Orchestration)
 */

import { Project } from '@projects/domain/aggregates/project';
import { ProjectRepository } from '@projects/infrastructure/repositories/project.repository.interface';
import { ThemeCollection } from '@themes/domain/aggregates/theme-collection';
import { CrewMemberRepository } from '@crew/infrastructure/repositories/crew-member.repository.interface';
import { eventBus } from '@infrastructure/messaging/event-bus';
import { v4 as uuidv4 } from 'uuid';

export interface CreateVibeProjectCommand {
  name: string;
  description: string;
  vibe: string; // e.g., "cyberpunk", "minimal", "professional"
  features: string[];
  technologies: string[];
  budget?: number;
  timeline?: string;
  createdBy: string;
}

export interface CreateVibeProjectResult {
  project: Project;
  themeId: string;
  themeName: string;
  assignedCrewIds: string[];
  assignedCrewNames: string[];
}

export class CreateVibeProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly crewRepository: CrewMemberRepository,
    private readonly themeCollection: ThemeCollection
  ) {}

  async execute(command: CreateVibeProjectCommand): Promise<CreateVibeProjectResult> {
    // 1. Find theme matching vibe
    const matchingThemes = this.themeCollection.search(command.vibe);
    
    if (matchingThemes.length === 0) {
      throw new Error(`No themes found matching vibe: ${command.vibe}`);
    }

    const selectedTheme = matchingThemes[0];

    // 2. Find best crew members based on technologies
    const availableCrew = await this.crewRepository.findAvailable();
    
    // Simple matching: assign crew with relevant expertise
    const assignedCrew = availableCrew.slice(0, 3); // Assign 3 crew members

    // 3. Create project
    const project = Project.create({
      id: uuidv4(),
      name: command.name,
      description: command.description,
      createdBy: command.createdBy,
      themeId: selectedTheme.id,
      assignedCrewIds: assignedCrew.map(c => c.id),
      budget: command.budget,
      timeline: command.timeline,
      features: command.features,
      technologies: command.technologies,
    });

    // 4. Assign theme
    project.assignTheme(selectedTheme.id);

    // 5. Assign crew members
    for (const crewMember of assignedCrew) {
      crewMember.assignToProject(project.id, `Work on ${command.name}`);
      await this.crewRepository.save(crewMember);
    }

    // 6. Save project
    await this.projectRepository.save(project);

    // 7. Publish domain events
    await eventBus.publishAll(project.getDomainEvents());
    project.clearDomainEvents();

    return {
      project,
      themeId: selectedTheme.id,
      themeName: selectedTheme.name,
      assignedCrewIds: assignedCrew.map(c => c.id),
      assignedCrewNames: assignedCrew.map(c => c.name),
    };
  }
}

