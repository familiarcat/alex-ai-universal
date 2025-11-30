import { ValueObject } from '@shared/types/common.types';
import { ValidationError } from '@shared/types/errors.types';

/**
 * Crew Role enumeration
 * Based on Star Trek crew positions
 */
export enum CrewRoleType {
  COMMANDING_OFFICER = 'commanding_officer',
  FIRST_OFFICER = 'first_officer',
  OPERATIONS_OFFICER = 'operations_officer',
  CHIEF_ENGINEER = 'chief_engineer',
  SECURITY_OFFICER = 'security_officer',
  MEDICAL_OFFICER = 'medical_officer',
  COMMUNICATIONS_OFFICER = 'communications_officer',
  COUNSELOR = 'counselor',
  BUSINESS_ADVISOR = 'business_advisor',
}

/**
 * Crew Role value object
 */
export class CrewRole implements ValueObject {
  private constructor(private readonly _value: CrewRoleType) {}

  static commandingOfficer(): CrewRole {
    return new CrewRole(CrewRoleType.COMMANDING_OFFICER);
  }

  static firstOfficer(): CrewRole {
    return new CrewRole(CrewRoleType.FIRST_OFFICER);
  }

  static operationsOfficer(): CrewRole {
    return new CrewRole(CrewRoleType.OPERATIONS_OFFICER);
  }

  static chiefEngineer(): CrewRole {
    return new CrewRole(CrewRoleType.CHIEF_ENGINEER);
  }

  static securityOfficer(): CrewRole {
    return new CrewRole(CrewRoleType.SECURITY_OFFICER);
  }

  static medicalOfficer(): CrewRole {
    return new CrewRole(CrewRoleType.MEDICAL_OFFICER);
  }

  static communicationsOfficer(): CrewRole {
    return new CrewRole(CrewRoleType.COMMUNICATIONS_OFFICER);
  }

  static counselor(): CrewRole {
    return new CrewRole(CrewRoleType.COUNSELOR);
  }

  static businessAdvisor(): CrewRole {
    return new CrewRole(CrewRoleType.BUSINESS_ADVISOR);
  }

  static fromString(role: string): CrewRole {
    const normalized = role.toLowerCase().replace(/\s+/g, '_');
    
    switch (normalized) {
      case 'commanding_officer':
      case 'captain':
        return CrewRole.commandingOfficer();
      case 'first_officer':
      case 'commander':
        return CrewRole.firstOfficer();
      case 'operations_officer':
      case 'operations':
        return CrewRole.operationsOfficer();
      case 'chief_engineer':
      case 'engineer':
        return CrewRole.chiefEngineer();
      case 'security_officer':
      case 'security':
        return CrewRole.securityOfficer();
      case 'medical_officer':
      case 'doctor':
        return CrewRole.medicalOfficer();
      case 'communications_officer':
      case 'communications':
        return CrewRole.communicationsOfficer();
      case 'counselor':
        return CrewRole.counselor();
      case 'business_advisor':
      case 'business':
        return CrewRole.businessAdvisor();
      default:
        throw new ValidationError(`Invalid crew role: ${role}`);
    }
  }

  get value(): CrewRoleType {
    return this._value;
  }

  get displayName(): string {
    const names: Record<CrewRoleType, string> = {
      [CrewRoleType.COMMANDING_OFFICER]: 'Commanding Officer',
      [CrewRoleType.FIRST_OFFICER]: 'First Officer',
      [CrewRoleType.OPERATIONS_OFFICER]: 'Operations Officer',
      [CrewRoleType.CHIEF_ENGINEER]: 'Chief Engineer',
      [CrewRoleType.SECURITY_OFFICER]: 'Security Officer',
      [CrewRoleType.MEDICAL_OFFICER]: 'Medical Officer',
      [CrewRoleType.COMMUNICATIONS_OFFICER]: 'Communications Officer',
      [CrewRoleType.COUNSELOR]: 'Counselor',
      [CrewRoleType.BUSINESS_ADVISOR]: 'Business Advisor',
    };
    return names[this._value];
  }

  equals(other: CrewRole): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }
}

