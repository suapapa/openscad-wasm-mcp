import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import * as z from 'zod/v4';
import { mimeTypeForFormat } from '../openscad/formats.js';
import { resolveSafePath } from '../workspace/safePaths.js';
import { previewUrls } from '../server/previewRoutes.js';
import type { PreviewLinkToolResult } from '../types/toolResults.js';
import type { ToolDependencies } from './index.js';
import { definesSchema, filesSchema } from './validate.js';
import { errorRunResult } from './toolResponse.js';

const STL_EXTENSIONS = new Set(['.stl']);

export const createPreviewLinkInputSchema = z
  .object({
    scad: z.string().min(1).optional(),
    files: filesSchema.optional(),
    defines: definesSchema.optional(),
    enableManifold: z.boolean().optional(),
    timeoutMs: z.number().int().positive().optional(),
    workspacePath: z.string().min(1).optional(),
    artifactPath: z.string().min(1).optional()
  })
  .superRefine((value, ctx) => {
    const sources = [value.scad, value.workspacePath, value.artifactPath].filter(Boolean);
    if (sources.length !== 1) {
      ctx.addIssue({
        code: 'custom',
        message: 'Exactly one of scad, workspacePath, or artifactPath is required.'
      });
    }
  });

export type CreatePreviewLinkInput = z.infer<typeof createPreviewLinkInputSchema>;

export async function handleCreatePreviewLink(
  rawInput: unknown,
  deps: ToolDependencies
): Promise<PreviewLinkToolResult> {
  const started = performance.now();
  try {
    if (!deps.config.preview.enabled) {
      throw new Error('3D preview links are disabled. Set PREVIEW_ENABLED=true to enable them.');
    }

    const input = createPreviewLinkInputSchema.parse(rawInput);

    if (input.scad) {
      return await createPreviewFromScad(
        {
          scad: input.scad,
          files: input.files,
          defines: input.defines,
          enableManifold: input.enableManifold,
          timeoutMs: input.timeoutMs
        },
        deps
      );
    }

    if (input.workspacePath) {
      return await createPreviewFromWorkspacePath(input.workspacePath, deps);
    }

    if (input.artifactPath) {
      return await createPreviewFromArtifactPath(input.artifactPath, deps);
    }

    throw new Error('Exactly one of scad, workspacePath, or artifactPath is required.');
  } catch (error) {
    return errorRunResult(error, Math.round(performance.now() - started));
  }
}

async function createPreviewFromScad(
  input: {
    scad: string;
    files?: CreatePreviewLinkInput['files'];
    defines?: CreatePreviewLinkInput['defines'];
    enableManifold?: boolean;
    timeoutMs?: number;
  },
  deps: ToolDependencies
): Promise<PreviewLinkToolResult> {
  const job = await deps.workspace.createJob();
  try {
    await deps.workspace.writeJobInputs({
      job,
      scad: input.scad,
      files: input.files,
      maxInputBytes: deps.config.limits.maxInputBytes
    });

    const result = await deps.semaphore.run(() =>
      deps.runner.export({
        scad: input.scad,
        format: 'stl',
        files: input.files,
        defines: input.defines,
        enableManifold: input.enableManifold,
        jobId: job.id,
        jobDir: job.dir,
        timeoutMs: input.timeoutMs ?? deps.config.limits.maxRenderMs
      })
    );

    if (!result.ok) {
      return result;
    }

    const artifact = await deps.artifacts.saveArtifact({
      jobId: job.id,
      suffix: result.filename,
      format: 'stl',
      data: result.data
    });

    return registerPreviewLink({
      deps,
      absolutePath: await resolveSafePath(deps.config.paths.workspaceDir, artifact.path, {
        allowedExtensions: STL_EXTENSIONS,
        mustExist: true
      }),
      artifact,
      diagnostics: result.diagnostics,
      stdout: result.stdout,
      stderr: result.stderr,
      elapsedMs: result.elapsedMs
    });
  } finally {
    await deps.workspace.cleanupJob(job, deps.config.limits.cleanupJobs);
  }
}

async function createPreviewFromWorkspacePath(
  workspacePath: string,
  deps: ToolDependencies
): Promise<PreviewLinkToolResult> {
  const absolutePath = await resolveSafePath(deps.config.paths.workspaceDir, workspacePath, {
    allowedExtensions: STL_EXTENSIONS,
    mustExist: true
  });
  const fileStats = await stat(absolutePath);

  return registerPreviewLink({
    deps,
    absolutePath,
    artifact: {
      path: workspacePath,
      filename: path.basename(absolutePath),
      format: 'stl',
      mimeType: mimeTypeForFormat('stl'),
      sizeBytes: fileStats.size,
      sha256: ''
    },
    diagnostics: [],
    stdout: '',
    stderr: '',
    elapsedMs: 0
  });
}

async function createPreviewFromArtifactPath(
  artifactPath: string,
  deps: ToolDependencies
): Promise<PreviewLinkToolResult> {
  if (!artifactPath.startsWith('artifacts/')) {
    throw new Error('artifactPath must be under artifacts/.');
  }
  if (!artifactPath.toLowerCase().endsWith('.stl')) {
    throw new Error('artifactPath must point to an STL file.');
  }

  const absolutePath = await resolveSafePath(deps.config.paths.workspaceDir, artifactPath, {
    allowedExtensions: STL_EXTENSIONS,
    mustExist: true
  });
  const fileStats = await stat(absolutePath);
  const data = await readFile(absolutePath);

  return registerPreviewLink({
    deps,
    absolutePath,
    artifact: {
      path: artifactPath,
      filename: path.basename(absolutePath),
      format: 'stl',
      mimeType: mimeTypeForFormat('stl'),
      sizeBytes: fileStats.size,
      sha256: createHash('sha256').update(data).digest('hex')
    },
    diagnostics: [],
    stdout: '',
    stderr: '',
    elapsedMs: 0
  });
}

async function registerPreviewLink(input: {
  deps: ToolDependencies;
  absolutePath: string;
  artifact: {
    path: string;
    filename: string;
    format: string;
    mimeType: string;
    sizeBytes: number;
    sha256: string;
  };
  diagnostics: PreviewLinkToolResult['diagnostics'];
  stdout: string;
  stderr: string;
  elapsedMs: number;
}): Promise<PreviewLinkToolResult> {
  const { token, expiresAt } = input.deps.previewTokens.register({
    absolutePath: input.absolutePath,
    format: 'stl',
    mimeType: mimeTypeForFormat('stl')
  });

  const urls = previewUrls(input.deps.config.preview.publicBaseUrl, token);

  return {
    ok: true,
    previewUrl: urls.previewUrl,
    modelUrl: urls.modelUrl,
    expiresAt: expiresAt.toISOString(),
    format: 'stl',
    artifact: input.artifact,
    diagnostics: input.diagnostics,
    stdout: input.stdout,
    stderr: input.stderr,
    elapsedMs: input.elapsedMs
  };
}
