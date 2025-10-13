import { ValueObject } from '@shared/types/common.types';
import { ValidationError } from '@shared/types/errors.types';

/**
 * Theme Category enumeration
 */
export enum ThemeCategoryType {
  MODERN = 'modern',
  MINIMAL = 'minimal',
  BOLD = 'bold',
  STANDARD = 'standard',
  DARK = 'dark',
  LIGHT = 'light',
  PROFESSIONAL = 'professional',
  CREATIVE = 'creative',
}

/**
 * Theme Category value object
 */
export class ThemeCategory implements ValueObject {
  private constructor(private readonly _value: ThemeCategoryType) {}

  static modern(): ThemeCategory {
    return new ThemeCategory(ThemeCategoryType.MODERN);
  }

  static minimal(): ThemeCategory {
    return new ThemeCategory(ThemeCategoryType.MINIMAL);
  }

  static bold(): ThemeCategory {
    return new ThemeCategory(ThemeCategoryType.BOLD);
  }

  static standard(): ThemeCategory {
    return new ThemeCategory(ThemeCategoryType.STANDARD);
  }

  static dark(): ThemeCategory {
    return new ThemeCategory(ThemeCategoryType.DARK);
  }

  static light(): ThemeCategory {
    return new ThemeCategory(ThemeCategoryType.LIGHT);
  }

  static professional(): ThemeCategory {
    return new ThemeCategory(ThemeCategoryType.PROFESSIONAL);
  }

  static creative(): ThemeCategory {
    return new ThemeCategory(ThemeCategoryType.CREATIVE);
  }

  static fromString(category: string): ThemeCategory {
    const normalized = category.toLowerCase();
    
    switch (normalized) {
      case 'modern':
        return ThemeCategory.modern();
      case 'minimal':
        return ThemeCategory.minimal();
      case 'bold':
        return ThemeCategory.bold();
      case 'standard':
        return ThemeCategory.standard();
      case 'dark':
        return ThemeCategory.dark();
      case 'light':
        return ThemeCategory.light();
      case 'professional':
        return ThemeCategory.professional();
      case 'creative':
        return ThemeCategory.creative();
      default:
        throw new ValidationError(`Invalid theme category: ${category}`);
    }
  }

  get value(): ThemeCategoryType {
    return this._value;
  }

  equals(other: ThemeCategory): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }
}

