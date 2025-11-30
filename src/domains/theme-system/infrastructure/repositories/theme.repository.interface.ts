/**
 * Theme Repository Interface
 * Defines persistence operations for themes
 */

import { Theme } from '../../domain/entities/theme';
import { ThemeCollection } from '../../domain/aggregates/theme-collection';

export interface ThemeRepository {
  /**
   * Get the theme collection
   */
  getCollection(): Promise<ThemeCollection>;

  /**
   * Find theme by ID
   */
  findById(id: string): Promise<Theme | null>;

  /**
   * Find theme by name
   */
  findByName(name: string): Promise<Theme | null>;

  /**
   * List all themes
   */
  findAll(): Promise<Theme[]>;

  /**
   * Save theme (create or update)
   */
  save(theme: Theme): Promise<void>;

  /**
   * Save collection
   */
  saveCollection(collection: ThemeCollection): Promise<void>;

  /**
   * Delete theme
   */
  delete(id: string): Promise<void>;
}

