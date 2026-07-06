import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AppConfig } from '../src/config.js';
import { MockOpenScadRunner } from '../src/openscad/MockOpenScadRunner.js';
import { Semaphore } from '../src/security/limits.js';
import {
  geometryFromOpenScadSummary,
  handleAnalyzeModel,
  parseStlGeometry
} from '../src/tools/analyzeModel.js';
import { handleExportModel } from '../src/tools/exportModel.js';
import { handleRenderPreview } from '../src/tools/renderPreview.js';
import { handleValidate } from '../src/tools/validate.js';
import type { ToolDependencies } from '../src/tools/index.js';
import { ArtifactStore } from '../src/workspace/artifactStore.js';
import { PreviewTokenStore } from '../src/preview/PreviewTokenStore.js';
import { WorkspaceManager } from '../src/workspace/WorkspaceManager.js';

let tempDir: string;
let deps: ToolDependencies;

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), 'openscad-tools-'));
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

describe('mock tool handlers', () => {
  it('validates SCAD with the mock runner', async () => {
    const result = await handleValidate({ scad: 'cube(1);' }, deps);
    expect(result.ok).toBe(true);
    expect(result.stderr).toBe('');
  });

  it('exports artifacts with metadata', async () => {
    const result = await handleExportModel({ scad: 'cube(1);', format: 'stl' }, deps);
    expect(result.ok).toBe(true);
    expect(result.artifact?.format).toBe('stl');
    expect(result.artifact?.sha256).toHaveLength(64);
  });

  it('renders a WebP preview from the mock STL export', async () => {
    const result = await handleRenderPreview({ scad: 'cube(1);', width: 320, height: 240 }, deps);
    expect(result.ok).toBe(true);
    expect(result.artifact?.format).toBe('webp');
    expect(result.artifact?.mimeType).toBe('image/webp');
    expect(result.artifact?.filename).toMatch(/output\.webp$/);

    const artifactPath = path.join(deps.config.paths.workspaceDir, result.artifact?.path ?? '');
    const artifact = await readFile(artifactPath);
    expect(artifact.subarray(0, 4).toString('ascii')).toBe('RIFF');
    expect(artifact.subarray(8, 12).toString('ascii')).toBe('WEBP');

    const stats = await sharp(artifact).stats();
    expect(stats.channels.some((channel) => channel.stdev > 0)).toBe(true);
  });

  it('analyzes STL triangle count and bounding box through mock export', async () => {
    const result = await handleAnalyzeModel({ scad: 'cube(1);' }, deps);
    expect(result.ok).toBe(true);
    expect(result.summary.triangleCount).toBe(2);
    expect(result.summary.boundingBox).toEqual({ min: [0, 0, 0], max: [1, 1, 0] });
    expect(result.summary.artifact?.format).toBe('stl');
  });
});

describe('parseStlGeometry', () => {
  it('handles empty STL data', () => {
    expect(parseStlGeometry(Buffer.alloc(0))).toEqual({
      triangleCount: 0,
      boundingBox: undefined
    });
  });

  it('falls back safely when binary STL length is malformed', () => {
    const buffer = Buffer.alloc(84);
    buffer.writeUInt32LE(2, 80);

    expect(parseStlGeometry(buffer)).toEqual({
      triangleCount: 0,
      boundingBox: undefined
    });
  });

  it('parses binary STL bbox and triangle count', () => {
    const buffer = Buffer.alloc(84 + 50);
    buffer.writeUInt32LE(1, 80);
    let offset = 84 + 12;
    for (const vertex of [
      [0, 0, 0],
      [2, 0, 0],
      [0, 3, 1]
    ]) {
      buffer.writeFloatLE(vertex[0], offset);
      buffer.writeFloatLE(vertex[1], offset + 4);
      buffer.writeFloatLE(vertex[2], offset + 8);
      offset += 12;
    }

    expect(parseStlGeometry(buffer)).toEqual({
      triangleCount: 1,
      boundingBox: { min: [0, 0, 0], max: [2, 3, 1] }
    });
  });

  it('parses ASCII STL negative coordinates and scientific notation', () => {
    const stl = `solid ascii
      facet normal 0 0 1
        outer loop
          vertex -1.5 0 2e1
          vertex 1.25 -3.5e-1 0
          vertex 0 4.0 -2
        endloop
      endfacet
    endsolid ascii`;

    expect(parseStlGeometry(Buffer.from(stl, 'utf8'))).toEqual({
      triangleCount: 1,
      boundingBox: { min: [-1.5, -0.35, -2], max: [1.25, 4, 20] }
    });
  });
});

describe('geometryFromOpenScadSummary', () => {
  it('extracts bounding box and triangular facet counts', () => {
    expect(
      geometryFromOpenScadSummary({
        geometry: {
          bounding_box: {
            min: [-1, -2, -3],
            max: [4, 5, 6]
          },
          facets: 12,
          triangular: true
        }
      })
    ).toEqual({
      boundingBox: { min: [-1, -2, -3], max: [4, 5, 6] },
      triangleCount: 12
    });
  });

  it('does not treat non-triangular facet count as triangle count', () => {
    expect(
      geometryFromOpenScadSummary({
        geometry: {
          bounding_box: {
            min: [0, 0, 0],
            max: [1, 1, 1]
          },
          facets: 6,
          triangular: false
        }
      })
    ).toEqual({
      boundingBox: { min: [0, 0, 0], max: [1, 1, 1] },
      triangleCount: undefined
    });
  });
});
