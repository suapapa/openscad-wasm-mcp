import { randomUUID } from 'node:crypto';

export interface PreviewTokenEntry {
  absolutePath: string;
  format: string;
  mimeType: string;
  expiresAt: Date;
}

export class PreviewTokenStore {
  private readonly tokens = new Map<string, PreviewTokenEntry>();

  constructor(private readonly ttlSeconds: number) {}

  register(input: {
    absolutePath: string;
    format: string;
    mimeType: string;
  }): { token: string; expiresAt: Date } {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + this.ttlSeconds * 1000);
    this.tokens.set(token, {
      absolutePath: input.absolutePath,
      format: input.format,
      mimeType: input.mimeType,
      expiresAt
    });
    return { token, expiresAt };
  }

  resolve(token: string): PreviewTokenEntry | null {
    const entry = this.tokens.get(token);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt.getTime() <= Date.now()) {
      this.tokens.delete(token);
      return null;
    }
    return entry;
  }
}
