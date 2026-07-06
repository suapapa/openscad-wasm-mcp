import { afterEach, describe, expect, it, vi } from 'vitest';
import { PreviewTokenStore } from '../src/preview/PreviewTokenStore.js';

describe('PreviewTokenStore', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('registers and resolves a token before expiry', () => {
    const store = new PreviewTokenStore(3600);
    const { token, expiresAt } = store.register({
      absolutePath: '/tmp/model.stl',
      format: 'stl',
      mimeType: 'model/stl'
    });

    const entry = store.resolve(token);
    expect(entry).toMatchObject({
      absolutePath: '/tmp/model.stl',
      format: 'stl',
      mimeType: 'model/stl'
    });
    expect(entry?.expiresAt.toISOString()).toBe(expiresAt.toISOString());
  });

  it('returns null for unknown tokens', () => {
    const store = new PreviewTokenStore(3600);
    expect(store.resolve('00000000-0000-4000-8000-000000000000')).toBeNull();
  });

  it('expires tokens after ttl', () => {
    vi.useFakeTimers();
    const store = new PreviewTokenStore(60);
    const { token } = store.register({
      absolutePath: '/tmp/model.stl',
      format: 'stl',
      mimeType: 'model/stl'
    });

    vi.advanceTimersByTime(61_000);
    expect(store.resolve(token)).toBeNull();
  });
});
