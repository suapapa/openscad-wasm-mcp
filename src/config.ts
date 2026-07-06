import path from 'node:path';
import * as z from 'zod/v4';
import { mbToBytes, type LimitConfig } from './security/limits.js';
import type { WorkspacePaths } from './workspace/paths.js';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3333),
  HOST: z.string().default('0.0.0.0'),
  WORKSPACE_DIR: z.string().default('/workspace'),
  ARTIFACT_DIR: z.string().default('/workspace/artifacts'),
  JOB_TMP_DIR: z.string().default('/tmp/openscad-jobs'),
  MAX_RENDER_MS: z.coerce.number().int().positive().default(30_000),
  MAX_OUTPUT_MB: z.coerce.number().positive().default(50),
  MAX_INPUT_MB: z.coerce.number().positive().default(10),
  MAX_PARALLEL_JOBS: z.coerce.number().int().positive().default(2),
  CLEANUP_JOBS: z
    .string()
    .default('true')
    .transform((value) => value.toLowerCase() === 'true'),
  OPENSCAD_BACKEND: z.enum(['wasm', 'mock']).default('wasm')
});

export interface AppConfig {
  port: number;
  host: string;
  backend: 'wasm' | 'mock';
  paths: WorkspacePaths;
  limits: LimitConfig;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.parse(env);
  const workspaceDir = path.resolve(parsed.WORKSPACE_DIR);
  const artifactDir = path.resolve(parsed.ARTIFACT_DIR);
  const jobTmpDir = path.resolve(parsed.JOB_TMP_DIR);

  return {
    port: parsed.PORT,
    host: parsed.HOST,
    backend: parsed.OPENSCAD_BACKEND,
    paths: {
      workspaceDir,
      artifactDir,
      jobTmpDir
    },
    limits: {
      maxRenderMs: parsed.MAX_RENDER_MS,
      maxOutputBytes: mbToBytes(parsed.MAX_OUTPUT_MB),
      maxInputBytes: mbToBytes(parsed.MAX_INPUT_MB),
      maxParallelJobs: parsed.MAX_PARALLEL_JOBS,
      cleanupJobs: parsed.CLEANUP_JOBS
    }
  };
}
