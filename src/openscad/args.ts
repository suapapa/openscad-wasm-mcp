import { assertSafeIdentifier } from '../security/sanitize.js';
import type { ExportFormat } from './formats.js';

export type DefineValue = string | number | boolean;

export interface BuildOpenScadArgsInput {
  inputPath: string;
  outputPath: string;
  format: ExportFormat;
  defines?: Record<string, DefineValue>;
  enableManifold?: boolean;
  summaryFilePath?: string;
}

export function buildOpenScadArgs(input: BuildOpenScadArgsInput): string[] {
  const args: string[] = [input.inputPath, '-o', input.outputPath];

  if (input.enableManifold) {
    args.push('--enable=manifold');
  }

  for (const [key, value] of Object.entries(input.defines ?? {})) {
    assertSafeIdentifier(key);
    args.push('-D', `${key}=${formatDefineValue(value)}`);
  }

  if (input.summaryFilePath) {
    args.push('--summary', 'all', '--summary-file', input.summaryFilePath);
  }

  return args;
}

export function formatDefineValue(value: DefineValue): string {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('OpenSCAD define numbers must be finite.');
    }
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return JSON.stringify(value);
}

export function formatPreviewCamera(value: string): string {
  const parts = value.split(',').map((part) => part.trim());
  if (parts.length !== 6 && parts.length !== 7) {
    throw new Error('OpenSCAD preview camera must contain 6 or 7 comma-separated finite numbers.');
  }

  return parts
    .map((part) => {
      if (!isCliNumber(part)) {
        throw new Error('OpenSCAD preview camera must contain only finite numbers.');
      }
      const parsed = Number(part);
      if (!Number.isFinite(parsed)) {
        throw new Error('OpenSCAD preview camera must contain only finite numbers.');
      }
      return String(parsed);
    })
    .join(',');
}

function isCliNumber(value: string): boolean {
  return /^[-+]?(?:(?:\d+\.?\d*)|(?:\.\d+))(?:[eE][-+]?\d+)?$/.test(value);
}
