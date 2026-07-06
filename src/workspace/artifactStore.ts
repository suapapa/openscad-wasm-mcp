import { createHash } from 'node:crypto';
import { mkdir, realpath, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { mimeTypeForFormat, type ExportFormat, type PreviewFormat } from '../openscad/formats.js';
import { assertWithinBytes } from '../security/limits.js';
import { safeArtifactFilename } from '../security/sanitize.js';
import type { ArtifactMetadata } from '../types/toolResults.js';
import { artifactResponsePath } from './paths.js';

export class ArtifactStore {
  constructor(
    private readonly artifactDir: string,
    private readonly maxOutputBytes: number
  ) {}

  async saveScadArtifact(input: {
    jobId: string;
    scad: string;
    maxBytes: number;
  }): Promise<ArtifactMetadata> {
    const data = Buffer.from(input.scad, 'utf8');
    assertWithinBytes('SCAD source', data.byteLength, input.maxBytes);
    await mkdir(this.artifactDir, { recursive: true });
    const artifactRoot = await realpath(this.artifactDir);

    const filename = safeArtifactFilename(input.jobId, 'model.scad');
    const outputPath = path.join(artifactRoot, filename);
    await writeFile(outputPath, data, { flag: 'wx' });

    const metadata = await stat(outputPath);
    return {
      path: artifactResponsePath(artifactRoot, outputPath),
      filename,
      format: 'scad',
      mimeType: 'application/x-openscad',
      sizeBytes: metadata.size,
      sha256: createHash('sha256').update(data).digest('hex')
    };
  }

  async saveArtifact(input: {
    jobId: string;
    suffix: string;
    format: ExportFormat | PreviewFormat;
    data: Buffer;
  }): Promise<ArtifactMetadata> {
    assertWithinBytes('Output artifact', input.data.byteLength, this.maxOutputBytes);
    await mkdir(this.artifactDir, { recursive: true });
    const artifactRoot = await realpath(this.artifactDir);

    const filename = safeArtifactFilename(input.jobId, input.suffix);
    const outputPath = path.join(artifactRoot, filename);
    await writeFile(outputPath, input.data, { flag: 'wx' });

    const metadata = await stat(outputPath);
    return {
      path: artifactResponsePath(artifactRoot, outputPath),
      filename,
      format: input.format,
      mimeType: mimeTypeForFormat(input.format),
      sizeBytes: metadata.size,
      sha256: createHash('sha256').update(input.data).digest('hex')
    };
  }
}
