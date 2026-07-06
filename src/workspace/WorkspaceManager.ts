import { mkdir, readdir, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { extensionForFormat } from '../openscad/formats.js';
import { assertWithinBytes, DEFAULT_ALLOWED_EXTENSIONS } from '../security/limits.js';
import { createJobId } from '../security/sanitize.js';
import type { FileInputContent } from '../openscad/OpenScadRunner.js';
import { relativePosixPath, type WorkspacePaths } from './paths.js';
import { resolveSafePath } from './safePaths.js';

export interface JobWorkspace {
  id: string;
  dir: string;
  inputPath: string;
}

export interface WorkspaceFileInfo {
  path: string;
  sizeBytes: number;
  modifiedMs: number;
}

export class WorkspaceManager {
  constructor(private readonly paths: WorkspacePaths) {}

  async init(): Promise<void> {
    await Promise.all([
      mkdir(this.paths.workspaceDir, { recursive: true }),
      mkdir(this.paths.artifactDir, { recursive: true }),
      mkdir(this.paths.jobTmpDir, { recursive: true })
    ]);
  }

  async createJob(): Promise<JobWorkspace> {
    await this.init();
    const id = createJobId();
    const dir = path.join(this.paths.jobTmpDir, id);
    await mkdir(dir, { recursive: false });
    return {
      id,
      dir,
      inputPath: path.join(dir, 'input.scad')
    };
  }

  async writeJobInputs(input: {
    job: JobWorkspace;
    scad: string;
    files?: Record<string, FileInputContent>;
    maxInputBytes: number;
  }): Promise<void> {
    const scadBytes = Buffer.byteLength(input.scad, 'utf8');
    assertWithinBytes('SCAD input', scadBytes, input.maxInputBytes);
    await writeFile(input.job.inputPath, input.scad, 'utf8');

    for (const [requestedPath, contents] of Object.entries(input.files ?? {})) {
      const target = await resolveSafePath(input.job.dir, requestedPath, {
        allowedExtensions: DEFAULT_ALLOWED_EXTENSIONS,
        createParent: true
      });
      const data = decodeFileContent(contents);
      assertWithinBytes(`File ${requestedPath}`, data.byteLength, input.maxInputBytes);
      await writeFile(target, data);
    }
  }

  async cleanupJob(job: JobWorkspace, enabled: boolean): Promise<void> {
    if (enabled) {
      await rm(job.dir, { recursive: true, force: true });
    }
  }

  async listFiles(relativePath = '.'): Promise<WorkspaceFileInfo[]> {
    const workspaceRoot = await this.workspaceRootReal();
    const root = await resolveSafePath(this.paths.workspaceDir, relativePath || '.', {
      allowDirectory: true,
      mustExist: true
    });
    const rootStats = await stat(root);
    if (!rootStats.isDirectory()) {
      const fileStats = await stat(root);
      return [
        {
          path: relativePosixPath(workspaceRoot, root),
          sizeBytes: fileStats.size,
          modifiedMs: fileStats.mtimeMs
        }
      ];
    }

    return this.walkFiles(root, workspaceRoot);
  }

  async readWorkspaceFile(relativePath: string): Promise<{ content: string; sizeBytes: number }> {
    const target = await resolveSafePath(this.paths.workspaceDir, relativePath, {
      allowedExtensions: DEFAULT_ALLOWED_EXTENSIONS,
      mustExist: true
    });
    const data = await readFile(target);
    return {
      content: data.toString('utf8'),
      sizeBytes: data.byteLength
    };
  }

  async writeWorkspaceFile(input: {
    path: string;
    content: string;
    maxInputBytes: number;
  }): Promise<WorkspaceFileInfo> {
    const data = Buffer.from(input.content, 'utf8');
    assertWithinBytes(`File ${input.path}`, data.byteLength, input.maxInputBytes);
    const target = await resolveSafePath(this.paths.workspaceDir, input.path, {
      allowedExtensions: DEFAULT_ALLOWED_EXTENSIONS,
      createParent: true
    });
    await writeFile(target, data);
    const fileStats = await stat(target);
    const workspaceRoot = await this.workspaceRootReal();
    return {
      path: relativePosixPath(workspaceRoot, target),
      sizeBytes: fileStats.size,
      modifiedMs: fileStats.mtimeMs
    };
  }

  async deleteWorkspaceFile(relativePath: string): Promise<{ deleted: boolean }> {
    const target = await resolveSafePath(this.paths.workspaceDir, relativePath, {
      allowedExtensions: DEFAULT_ALLOWED_EXTENSIONS,
      mustExist: true
    });
    const targetStats = await stat(target);
    if (targetStats.isDirectory()) {
      throw new Error('Deleting directories is not supported by this tool.');
    }
    await rm(target, { force: false });
    return { deleted: true };
  }

  outputFilename(format: Parameters<typeof extensionForFormat>[0]): string {
    return `output${extensionForFormat(format)}`;
  }

  private async workspaceRootReal(): Promise<string> {
    return realpath(this.paths.workspaceDir);
  }

  private async walkFiles(root: string, workspaceRoot: string): Promise<WorkspaceFileInfo[]> {
    const files: WorkspaceFileInfo[] = [];
    const entries = await readdir(root, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(root, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await this.walkFiles(fullPath, workspaceRoot)));
      } else if (entry.isFile()) {
        const fileStats = await stat(fullPath);
        files.push({
          path: relativePosixPath(workspaceRoot, fullPath),
          sizeBytes: fileStats.size,
          modifiedMs: fileStats.mtimeMs
        });
      }
    }

    return files.sort((a, b) => a.path.localeCompare(b.path));
  }
}

export function decodeFileContent(input: FileInputContent): Buffer {
  if (typeof input === 'string') {
    return Buffer.from(input, 'utf8');
  }
  if ('base64' in input) {
    return Buffer.from(input.base64, 'base64');
  }
  return Buffer.from(input.contentBase64, 'base64');
}
