import { Entity } from '@shared/types/common.types';
import { NotFoundError, ValidationError } from '@shared/types/errors.types';
import { Theme } from '../entities/theme';
import { ThemeCategory } from '../value-objects/theme-category';
import { ThemeSelectedEvent } from '../events/theme-selected.event';

/**
 * Theme Collection Aggregate Root
 * Manages the collection of available themes
 */
export class ThemeCollection implements Entity {
  private _domainEvents: any[] = [];
  private _themes: Map<string, Theme>;

  private constructor(
    private readonly _id: string,
    private _defaultThemeId: string,
    themes: Theme[],
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {
    this._themes = new Map(themes.map(t => [t.id, t]));
  }

  static create(data: {
    id: string;
    defaultThemeId: string;
    themes: Theme[];
  }): ThemeCollection {
    if (!data.themes || data.themes.length === 0) {
      throw new ValidationError('Theme collection must have at least one theme');
    }

    if (!data.themes.find(t => t.id === data.defaultThemeId)) {
      throw new ValidationError('Default theme must exist in collection');
    }

    const now = new Date();
    return new ThemeCollection(
      data.id,
      data.defaultThemeId,
      data.themes,
      now,
      now
    );
  }

  static reconstitute(data: {
    id: string;
    defaultThemeId: string;
    themes: any[];
    createdAt: Date;
    updatedAt: Date;
  }): ThemeCollection {
    const themes = data.themes.map(t => Theme.reconstitute(t));
    return new ThemeCollection(
      data.id,
      data.defaultThemeId,
      themes,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get defaultThemeId(): string {
    return this._defaultThemeId;
  }

  get themes(): Theme[] {
    return Array.from(this._themes.values());
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get count(): number {
    return this._themes.size;
  }

  // Domain methods
  addTheme(theme: Theme): void {
    if (this._themes.has(theme.id)) {
      throw new ValidationError(`Theme ${theme.id} already exists in collection`);
    }

    this._themes.set(theme.id, theme);
    this._updatedAt = new Date();
  }

  removeTheme(themeId: string): void {
    if (themeId === this._defaultThemeId) {
      throw new ValidationError('Cannot remove default theme');
    }

    if (!this._themes.has(themeId)) {
      throw new NotFoundError('Theme', themeId);
    }

    this._themes.delete(themeId);
    this._updatedAt = new Date();
  }

  getTheme(themeId: string): Theme {
    const theme = this._themes.get(themeId);
    if (!theme) {
      throw new NotFoundError('Theme', themeId);
    }
    return theme;
  }

  getDefaultTheme(): Theme {
    return this.getTheme(this._defaultThemeId);
  }

  setDefaultTheme(themeId: string): void {
    if (!this._themes.has(themeId)) {
      throw new NotFoundError('Theme', themeId);
    }

    this._defaultThemeId = themeId;
    this._updatedAt = new Date();
  }

  filterByCategory(category: ThemeCategory): Theme[] {
    return this.themes.filter(t => t.category.equals(category));
  }

  selectTheme(themeId: string, projectId: string): Theme {
    const theme = this.getTheme(themeId);
    
    this.addDomainEvent(new ThemeSelectedEvent(
      projectId,
      themeId,
      theme.name
    ));

    return theme;
  }

  // Find themes by feature
  findByFeature(featureName: string): Theme[] {
    return this.themes.filter(t => t.hasFeature(featureName));
  }

  // Search themes
  search(query: string): Theme[] {
    const lowerQuery = query.toLowerCase();
    return this.themes.filter(t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery)
    );
  }

  // Domain events management
  private addDomainEvent(event: any): void {
    this._domainEvents.push(event);
  }

  getDomainEvents(): any[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  // Serialization
  toJSON() {
    return {
      id: this._id,
      defaultThemeId: this._defaultThemeId,
      themes: this.themes.map(t => t.toJSON()),
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}

