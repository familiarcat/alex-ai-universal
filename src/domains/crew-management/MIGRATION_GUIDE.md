# Crew Management Domain - Migration Guide

## Source Package
`packages/core`

## Migration Mapping


### crew-assignment
- **Source:** `packages/core/src`
- **Target:** `src/domains/crew-management/domain/services`
- **Description:** Crew assignment logic

### crew-members
- **Source:** `packages/core/src`
- **Target:** `src/domains/crew-management/domain/entities`
- **Description:** Crew member entities

### crew-coordination
- **Source:** `packages/core/src`
- **Target:** `src/domains/crew-management/application/commands`
- **Description:** Crew coordination commands


## Migration Steps

1. **Extract crew logic from packages/core**
   - Identify all crew-related files
   - Map to appropriate DDD layers
   - Create domain entities/aggregates

2. **Create domain objects**
   - CrewMember aggregate
   - CrewRole value object
   - CrewAssignment service

3. **Update imports**
   - Update all references to crew code
   - Point to new domain locations

4. **Test migration**
   - Verify crew functionality
   - Test crew assignment
   - Validate domain logic

## Status
🟡 In Progress
