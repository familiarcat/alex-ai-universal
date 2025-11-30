import { ValueObject } from '@shared/types/common.types';
import { ValidationError } from '@shared/types/errors.types';

/**
 * Color Palette value object
 * Represents a theme's color scheme
 */
export class ColorPalette implements ValueObject {
  private constructor(
    private readonly _primary: string,
    private readonly _secondary: string,
    private readonly _accent: string,
    private readonly _background: string,
    private readonly _surface: string,
    private readonly _text: string,
    private readonly _border: string
  ) {}

  static create(data: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    border: string;
  }): ColorPalette {
    // Basic validation
    Object.entries(data).forEach(([key, value]) => {
      if (!value || value.trim() === '') {
        throw new ValidationError(`Color palette ${key} cannot be empty`);
      }
    });

    return new ColorPalette(
      data.primary,
      data.secondary,
      data.accent,
      data.background,
      data.surface,
      data.text,
      data.border
    );
  }

  get primary(): string {
    return this._primary;
  }

  get secondary(): string {
    return this._secondary;
  }

  get accent(): string {
    return this._accent;
  }

  get background(): string {
    return this._background;
  }

  get surface(): string {
    return this._surface;
  }

  get text(): string {
    return this._text;
  }

  get border(): string {
    return this._border;
  }

  equals(other: ColorPalette): boolean {
    return (
      this._primary === other._primary &&
      this._secondary === other._secondary &&
      this._accent === other._accent &&
      this._background === other._background &&
      this._surface === other._surface &&
      this._text === other._text &&
      this._border === other._border
    );
  }

  toCSS(): Record<string, string> {
    return {
      '--primary': this._primary,
      '--secondary': this._secondary,
      '--accent': this._accent,
      '--background': this._background,
      '--surface': this._surface,
      '--text': this._text,
      '--border': this._border,
    };
  }

  toJSON() {
    return {
      primary: this._primary,
      secondary: this._secondary,
      accent: this._accent,
      background: this._background,
      surface: this._surface,
      text: this._text,
      border: this._border,
    };
  }
}

