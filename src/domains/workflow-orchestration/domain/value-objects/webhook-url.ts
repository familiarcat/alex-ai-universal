import { ValueObject } from '@shared/types/common.types';
import { ValidationError } from '@shared/types/errors.types';

/**
 * Webhook URL value object
 * Ensures webhook URLs are valid and properly formatted
 */
export class WebhookURL implements ValueObject {
  private readonly _value: string;
  private readonly _protocol: 'http' | 'https';
  private readonly _hostname: string;
  private readonly _port?: number;
  private readonly _path: string;

  private constructor(
    value: string,
    protocol: 'http' | 'https',
    hostname: string,
    path: string,
    port?: number
  ) {
    this._value = value;
    this._protocol = protocol;
    this._hostname = hostname;
    this._path = path;
    this._port = port;
  }

  static create(urlString: string): WebhookURL {
    if (!urlString || urlString.trim() === '') {
      throw new ValidationError('Webhook URL cannot be empty');
    }

    try {
      const url = new URL(urlString);

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new ValidationError('Webhook URL must use HTTP or HTTPS protocol');
      }

      const protocol = url.protocol.replace(':', '') as 'http' | 'https';
      const hostname = url.hostname;
      const path = url.pathname + url.search;
      const port = url.port ? parseInt(url.port, 10) : undefined;

      return new WebhookURL(urlString, protocol, hostname, path, port);
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new ValidationError(`Invalid webhook URL: ${error.message}`);
    }
  }

  get value(): string {
    return this._value;
  }

  get protocol(): 'http' | 'https' {
    return this._protocol;
  }

  get hostname(): string {
    return this._hostname;
  }

  get path(): string {
    return this._path;
  }

  get port(): number | undefined {
    return this._port;
  }

  get isSecure(): boolean {
    return this._protocol === 'https';
  }

  toString(): string {
    return this._value;
  }

  equals(other: WebhookURL): boolean {
    return this._value === other._value;
  }

  toJSON(): string {
    return this._value;
  }
}

