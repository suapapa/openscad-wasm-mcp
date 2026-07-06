import { mimeTypeForFormat } from '../openscad/formats.js';
import { previewUrls } from '../server/previewRoutes.js';
import type { ArtifactMetadata } from '../types/toolResults.js';
import type { ToolDependencies } from '../tools/index.js';
import { resolveSafePath } from '../workspace/safePaths.js';

const STL_EXTENSIONS = new Set(['.stl']);

export interface PreviewLinkFields {
  previewUrl: string;
  modelUrl: string;
  scadUrl?: string;
  expiresAt: string;
}

export async function attachStlPreviewLink(
  deps: ToolDependencies,
  artifact: ArtifactMetadata,
  options?: { scad?: string; jobId?: string }
): Promise<PreviewLinkFields | undefined> {
  if (!deps.config.preview.enabled || artifact.format !== 'stl') {
    return undefined;
  }

  const absolutePath = await resolveSafePath(deps.config.paths.workspaceDir, artifact.path, {
    allowedExtensions: STL_EXTENSIONS,
    mustExist: true
  });

  let scadAbsolutePath: string | undefined;
  if (options?.scad && options.jobId) {
    const scadArtifact = await deps.artifacts.saveScadArtifact({
      jobId: options.jobId,
      scad: options.scad,
      maxBytes: deps.config.limits.maxInputBytes
    });
    scadAbsolutePath = await resolveSafePath(deps.config.paths.workspaceDir, scadArtifact.path, {
      allowedExtensions: new Set(['.scad']),
      mustExist: true
    });
  }

  const { token, expiresAt } = deps.previewTokens.register({
    absolutePath,
    format: 'stl',
    mimeType: mimeTypeForFormat('stl'),
    scadAbsolutePath
  });

  const urls = previewUrls(deps.config.preview.publicBaseUrl, token, Boolean(scadAbsolutePath));
  return {
    previewUrl: urls.previewUrl,
    modelUrl: urls.modelUrl,
    scadUrl: urls.scadUrl,
    expiresAt: expiresAt.toISOString()
  };
}
