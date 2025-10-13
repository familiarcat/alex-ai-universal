import { Entity } from '@shared/types/common.types';
import { ValidationError } from '@shared/types/errors.types';
import { ColorPalette } from '../value-objects/color-palette';
import { ThemeCategory } from '../value-objects/theme-category';

/**
 * Theme Entity
 * Represents a visual identity configuration
 */
export class Theme implements Entity {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private _icon: string,
    private _description: string,
    private _category: ThemeCategory,
    private _colorPalette: ColorPalette,
    private _cssVariables: Record<string, string>,
    private _features: Record<string, boolean>,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {}

  static create(data: {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: string;
    colorPalette: ColorPalette;
    cssVariables?: Record<string, string>;
    features?: Record<string, boolean>;
  }): Theme {
    if (!data.name || data.name.trim() === '') {
      throw new ValidationError('Theme name cannot be empty');
    }

    const now = new Date();
    return new Theme(
      data.id,
      data.name.trim(),
      data.icon || '🎨',
      data.description || '',
      ThemeCategory.fromString(data.category),
      data.colorPalette,
      data.cssVariables || {},
      data.features || {},
      now,
      now
    );
  }

  static reconstitute(data: {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: string;
    colorPalette: any;
    cssVariables: Record<string, string>;
    features: Record<string, boolean>;
    createdAt: Date;
    updatedAt: Date;
  }): Theme {
    return new Theme(
      data.id,
      data.name,
      data.icon,
      data.description,
      ThemeCategory.fromString(data.category),
      ColorPalette.create(data.colorPalette),
      data.cssVariables,
      data.features,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get icon(): string {
    return this._icon;
  }

  get description(): string {
    return this._description;
  }

  get category(): ThemeCategory {
    return this._category;
  }

  get colorPalette(): ColorPalette {
    return this._colorPalette;
  }

  get cssVariables(): Record<string, string> {
    return { ...this._cssVariables };
  }

  get features(): Record<string, boolean> {
    return { ...this._features };
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Domain methods
  updateColors(colorPalette: ColorPalette): void {
    this._colorPalette = colorPalette;
    this._updatedAt = new Date();
  }

  updateCSSVariables(variables: Record<string, string>): void {
    this._cssVariables = { ...this._cssVariables, ...variables };
    this._updatedAt = new Date();
  }

  updateFeatures(features: Record<string, boolean>): void {
    this._features = { ...this._features, ...features };
    this._updatedAt = new Date();
  }

  hasFeature(featureName: string): boolean {
    return this._features[featureName] === true;
  }

  // Generate complete CSS for this theme
  toCSS(): Record<string, string> {
    return {
      ...this._colorPalette.toCSS(),
      ...this._cssVariables,
    };
  }

  // Generate inline CSS string for injection
  toInlineCSS(): string {
    const css = this.toCSS();
    let styles = ':root {\n';
    for (const [key, value] of Object.entries(css)) {
      styles += `  ${key}: ${value};\n`;
    }
    styles += '}';
    return styles;
  }

  // Serialization
  toJSON() {
    return {
      id: this._id,
      name: this._name,
      icon: this._icon,
      description: this._description,
      category: this._category.value,
      colorPalette: this._colorPalette.toJSON(),
      cssVariables: this._cssVariables,
      features: this._features,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}

