import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';

describe('loadConfig preview base URL', () => {
  it('uses PUBLIC_BASE_URL when set', () => {
    const config = loadConfig({
      ...process.env,
      PUBLIC_BASE_URL: 'https://preview.example.com',
      PORT: '3333'
    });
    expect(config.preview.publicBaseUrl).toBe('https://preview.example.com');
  });

  it('trims PUBLIC_BASE_URL and ignores blank values', () => {
    const config = loadConfig({
      ...process.env,
      PUBLIC_BASE_URL: '  https://preview.example.com/  ',
      PORT: '4000'
    });
    expect(config.preview.publicBaseUrl).toBe('https://preview.example.com');
  });

  it('falls back to localhost when PUBLIC_BASE_URL is unset', () => {
    const env = { ...process.env };
    delete env.PUBLIC_BASE_URL;
    const config = loadConfig({
      ...env,
      PORT: '4444'
    });
    expect(config.preview.publicBaseUrl).toBe('http://127.0.0.1:4444');
  });
});
