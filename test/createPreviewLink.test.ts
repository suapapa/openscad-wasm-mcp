import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AppConfig } from '../src/config.js';
import { MockOpenScadRunner } from '../src/openscad/MockOpenScadRunner.js';
import { PreviewTokenStore } from '../src/preview/PreviewTokenStore.js';
import { Semaphore } from '../src/security/limits.js';
import { handleCreatePreviewLink } from '../src/tools/createPreviewLink.js';
import type { ToolDependencies } from '../src/tools/index.js';
import { ArtifactStore } from '../src/workspace/artifactStore.js';
import { WorkspaceManager } from '../src/workspace/WorkspaceManager.js';

let tempDir: string;
let deps: ToolDependencies;

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), 'openscad-preview-link-'));
  const config: AppConfig = {
    port: 3333,
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
      publicBaseUrl: 'http://127.0.0.1:3333',
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
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe('openscad_create_preview_link', () => {
  it('creates preview links from SCAD input', async () => {
    const result = await handleCreatePreviewLink({ scad: 'cube(1);' }, deps);
    expect(result.ok).toBe(true);
    expect(result.previewUrl).toMatch(/^http:\/\/127\.0\.0\.1:3333\/viewer\/[0-9a-f-]{36}$/);
    expect(result.modelUrl).toMatch(/\/preview\/[0-9a-f-]{36}\/model\.stl$/);
    expect(result.scadUrl).toMatch(/\/preview\/[0-9a-f-]{36}\/model\.scad$/);
    expect(result.format).toBe('stl');
    expect(result.expiresAt).toBeTruthy();
    expect(result.artifact?.format).toBe('stl');
  });

  it('creates preview links from workspace STL paths', async () => {
    const stlPath = path.join(deps.config.paths.workspaceDir, 'models', 'part.stl');
    await mkdir(path.dirname(stlPath), { recursive: true });
    await writeFile(stlPath, 'solid test\nendsolid test\n', 'utf8');

    const result = await handleCreatePreviewLink({ workspacePath: 'models/part.stl' }, deps);
    expect(result.ok).toBe(true);
    expect(result.previewUrl).toMatch(/\/viewer\//);
    expect(result.scadUrl).toBeUndefined();
    expect(result.artifact?.path).toBe('models/part.stl');
  });

  it('creates preview links from artifact paths', async () => {
    const exportResult = await handleCreatePreviewLink({ scad: 'cube(1);' }, deps);
    expect(exportResult.ok).toBe(true);

    const result = await handleCreatePreviewLink(
      { artifactPath: exportResult.artifact!.path },
      deps
    );
    expect(result.ok).toBe(true);
    expect(result.artifact?.path).toBe(exportResult.artifact?.path);
    expect(result.previewUrl).toMatch(/\/viewer\//);
    expect(result.scadUrl).toBeUndefined();
  });

  it('rejects ambiguous or missing inputs', async () => {
    const missing = await handleCreatePreviewLink({}, deps);
    expect(missing.ok).toBe(false);

    const both = await handleCreatePreviewLink(
      { scad: 'cube(1);', workspacePath: 'models/part.stl' },
      deps
    );
    expect(both.ok).toBe(false);
  });

  it('fails when preview links are disabled', async () => {
    deps.config.preview.enabled = false;
    const result = await handleCreatePreviewLink({ scad: 'cube(1);' }, deps);
    expect(result.ok).toBe(false);
    expect(result.stderr).toContain('disabled');
  });
});
