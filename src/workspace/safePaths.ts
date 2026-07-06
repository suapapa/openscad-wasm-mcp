import { mkdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_ALLOWED_EXTENSIONS } from '../security/limits.js';
import { assertSafeRelativePath } from '../security/sanitize.js';

export interface ResolveSafePathOptions {
  allowedExtensions?: Set<string>;
  allowDirectory?: boolean;
  mustExist?: boolean;
  createParent?: boolean;
}

export async function resolveSafePath(
  rootDir: string,
  requestedPath: string,
  options: ResolveSafePathOptions = {}
): Promise<string> {
  const normalizedInput = requestedPath || '.';
  if (normalizedInput !== '.') {
    assertSafeRelativePath(normalizedInput);
  }

  await mkdir(rootDir, { recursive: true });
  const rootReal = await realpath(rootDir);
  const normalized = path.posix.normalize(normalizedInput);
  const target = path.resolve(rootReal, normalized);

  assertInsideRoot(rootReal, target);

  const extension = path.extname(target).toLowerCase();
  const allowedExtensions = options.allowedExtensions ?? DEFAULT_ALLOWED_EXTENSIONS;
  if (!options.allowDirectory && !allowedExtensions.has(extension)) {
    throw new Error(`Files with extension "${extension || '(none)'}" are not allowed.`);
  }

  if (options.createParent) {
    await mkdir(path.dirname(target), { recursive: true });
  }

  if (options.mustExist) {
    const targetReal = await realpath(target);
    assertInsideRoot(rootReal, targetReal);
    return targetReal;
  }

  try {
    const targetStats = await stat(target);
    if (targetStats.isDirectory()) {
      if (!options.allowDirectory) {
        throw new Error('Expected a file path, got a directory.');
      }
      const targetReal = await realpath(target);
      assertInsideRoot(rootReal, targetReal);
      return targetReal;
    }

    const targetReal = await realpath(target);
    assertInsideRoot(rootReal, targetReal);
    return targetReal;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  const parentReal = await realpath(path.dirname(target));
  assertInsideRoot(rootReal, parentReal);
  return target;
}

export function assertInsideRoot(rootDir: string, targetPath: string): void {
  const relative = path.relative(rootDir, targetPath);
  if (relative === '') {
    return;
  }
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Resolved path escapes the workspace root.');
  }
}
