# 🖖 Crew Management Domain

**Bounded Context:** Managing Star Trek-themed AI crew members with specialized roles

## Purpose

The Crew Management domain is the **core domain** of Alex AI. It handles:
- Crew member identity and personality
- Crew roster management
- Task assignment and collaboration
- Specialized agent capabilities

## Ubiquitous Language

- **Crew Member**: An AI agent with specialized role (e.g., Captain Picard, Commander Data)
- **Crew Roster**: Collection of active crew members
- **Assignment**: Mapping crew member to project/task
- **Expertise**: Crew member's specialized knowledge area
- **Collaboration**: Crew members working together

## Aggregates

### CrewMember (Root)
- **Identity**: Unique crew member ID
- **Properties**: Name, role, expertise, personality, status
- **Invariants**: 
  - Must have unique identity
  - Role must be valid Star Trek role
  - Cannot be assigned to multiple tasks simultaneously (unless multi-tasking enabled)

### CrewRoster
- **Purpose**: Manages collection of crew members
- **Operations**: Add, remove, find available crew, assign crew

## Domain Events

- `CrewMemberAssigned`: When crew assigned to task
- `TaskCompleted`: When crew completes assigned task
- `KnowledgeShared`: When crew shares learning with others
- `CrewCollaborated`: When multiple crew work together

## Key Entities

1. **Captain Picard** - Strategic leadership
2. **Commander Data** - Analytical/technical
3. **Lt. Cmdr. La Forge** - Engineering/infrastructure
4. **Lieutenant Worf** - Security/governance
5. **Counselor Troi** - UX/empathy
6. **Dr. Crusher** - System health
7. **Lieutenant Uhura** - Communication/integration
8. **Quark** - Business value
9. **Commander Riker** - Tactical execution

## Dependencies

- **Outbound**: None (core domain)
- **Inbound**: Project Management (for crew assignments)

## Migration Status

- [ ] Directory structure created
- [ ] Aggregates defined
- [ ] Value objects implemented
- [ ] Domain events defined
- [ ] Commands/queries created
- [ ] Repository interfaces defined
- [ ] Tests written
- [ ] Legacy code migrated

## Crew Assignment

**Owner**: Lieutenant Worf  
**Effort**: 4 hours  
**Priority**: HIGH

