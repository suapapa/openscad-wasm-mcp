import { mkdtemp, rm } from 'node:fs/promises';
import type { Server } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppConfig } from '../src/config.js';
import { MockOpenScadRunner } from '../src/openscad/MockOpenScadRunner.js';
import { PreviewTokenStore } from '../src/preview/PreviewTokenStore.js';
import { Semaphore } from '../src/security/limits.js';
import { startStreamableHttpServer } from '../src/server/transport.js';
import { handleCreatePreviewLink } from '../src/tools/createPreviewLink.js';
import type { ToolDependencies } from '../src/tools/index.js';
import { ArtifactStore } from '../src/workspace/artifactStore.js';
import { WorkspaceManager } from '../src/workspace/WorkspaceManager.js';

let tempDir: string;
let server: Server;
let baseUrl: string;
let deps: ToolDependencies;

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), 'openscad-preview-routes-'));
  const config: AppConfig = {
    port: 0,
    host: '127.0.0.1',
    backend: 'mock',
    paths: {
      workspaceDir: path.join(tempDir, 'workspace'),
      artifactDir: path.join(tempDir, 'workspace', 'artifacts'),
      jobTmpDir: path.join(tempDir, 'jobs')
    },
    limits: {
      maxRenderMs: 1000,
      maxOutputBytes: 1024 * 1024,
      maxInputBytes: 1024 * 1024,
      maxParallelJobs: 2,
      cleanupJobs: true
    },
    preview: {
      enabled: true,
      publicBaseUrl: 'http://127.0.0.1:0',
      ttlSeconds: 3600
    }
  };
  const workspace = new WorkspaceManager(config.paths);
  await workspace.init();
  deps = {
    config,
    runner: new MockOpenScadRunner(),
    workspace,
    artifacts: new ArtifactStore(config.paths.artifactDir, config.limits.maxOutputBytes),
    previewTokens: new PreviewTokenStore(config.preview.ttlSeconds),
    semaphore: new Semaphore(config.limits.maxParallelJobs)
  };

  server = await startStreamableHttpServer(config, deps);
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Expected test HTTP server to listen on a TCP port.');
  }
  baseUrl = `http://127.0.0.1:${address.port}`;
  deps.config.preview.publicBaseUrl = baseUrl;
});

afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await rm(tempDir, { recursive: true, force: true });
});

describe('preview HTTP routes', () => {
  it('serves viewer and STL model for a registered preview token', async () => {
    const result = await handleCreatePreviewLink({ scad: 'cube(1);' }, deps);
    expect(result.ok).toBe(true);
    expect(result.previewUrl).toMatch(new RegExp(`^${baseUrl}/viewer/`));
    expect(result.modelUrl).toMatch(new RegExp(`^${baseUrl}/preview/.+/model\\.stl$`));

    const viewerResponse = await fetch(result.previewUrl!);
    expect(viewerResponse.status).toBe(200);
    expect(viewerResponse.headers.get('content-type')).toContain('text/html');
    expect(viewerResponse.headers.get('content-security-policy')).toContain("'self'");
    expect(viewerResponse.headers.get('content-security-policy')).toContain('https://cdn.jsdelivr.net');
    const viewerHtml = await viewerResponse.text();
    expect(viewerHtml).toContain('OpenSCAD 3D Preview');
    expect(viewerHtml).toContain('aria-label="Download STL"');
    expect(viewerHtml).toContain('aria-label="Download SCAD"');
    expect(viewerHtml).toContain('>STL</span>');
    expect(viewerHtml).toContain('>SCAD</span>');
    expect(viewerHtml).toContain(result.modelUrl!);
    expect(viewerHtml).toContain(result.scadUrl!);

    const modelResponse = await fetch(result.modelUrl!);
    expect(modelResponse.status).toBe(200);
    expect(modelResponse.headers.get('content-type')).toBe('model/stl');
    const modelText = await modelResponse.text();
    expect(modelText).toContain('solid mock');

    const scadResponse = await fetch(result.scadUrl!);
    expect(scadResponse.status).toBe(200);
    expect(scadResponse.headers.get('content-type')).toBe('application/x-openscad');
    const scadText = await scadResponse.text();
    expect(scadText).toBe('cube(1);');
  });

  it('returns 404 for expired preview tokens', async () => {
    vi.useFakeTimers();
    deps.previewTokens = new PreviewTokenStore(1);
    deps.config.preview.ttlSeconds = 1;

    const result = await handleCreatePreviewLink({ scad: 'cube(1);' }, deps);
    expect(result.ok).toBe(true);

    vi.advanceTimersByTime(2000);

    const modelResponse = await fetch(result.modelUrl!);
    expect(modelResponse.status).toBe(404);
    vi.useRealTimers();
  });
});
