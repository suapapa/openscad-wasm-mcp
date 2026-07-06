import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { WorkspaceManager } from '../src/workspace/WorkspaceManager.js';

let tempDir: string;
let manager: WorkspaceManager;

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), 'openscad-workspace-'));
  manager = new WorkspaceManager({
    workspaceDir: path.join(tempDir, 'workspace'),
    artifactDir: path.join(tempDir, 'workspace', 'artifacts'),
    jobTmpDir: path.join(tempDir, 'jobs')
  });
  await manager.init();
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe('WorkspaceManager', () => {
  it('writes, reads, lists, and deletes workspace files', async () => {
    const written = await manager.writeWorkspaceFile({
      path: 'models/cube.scad',
      content: 'cube(10);',
      maxInputBytes: 1024
    });
    expect(written.path).toBe('models/cube.scad');

    const read = await manager.readWorkspaceFile('models/cube.scad');
    expect(read.content).toBe('cube(10);');

    const files = await manager.listFiles('.');
    expect(files.map((file) => file.path)).toContain('models/cube.scad');

    await expect(manager.deleteWorkspaceFile('models/cube.scad')).resolves.toEqual({
      deleted: true
    });
    await expect(manager.readWorkspaceFile('models/cube.scad')).rejects.toThrow();
  });

  it('rejects workspace path traversal', async () => {
    await expect(
      manager.writeWorkspaceFile({
        path: '../escape.scad',
        content: 'cube(1);',
        maxInputBytes: 1024
      })
    ).rejects.toThrow(/traversal/i);
  });

  it('creates and cleans job workspaces', async () => {
    const job = await manager.createJob();
    await manager.writeJobInputs({
      job,
      scad: 'include <lib.scad>\ncube(size);',
      files: { 'lib.scad': 'size = 2;' },
      maxInputBytes: 1024
    });
    await expect(manager.cleanupJob(job, true)).resolves.toBeUndefined();
  });
});
