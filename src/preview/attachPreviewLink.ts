import { mimeTypeForFormat } from '../openscad/formats.js';
import { previewUrls } from '../server/previewRoutes.js';
import type { ArtifactMetadata } from '../types/toolResults.js';
import type { ToolDependencies } from '../tools/index.js';
import { resolveSafePath } from '../workspace/safePaths.js';

const STL_EXTENSIONS = new Set(['.stl']);

export interface PreviewLinkFields {
  previewUrl: string;
  modelUrl: string;
  expiresAt: string;
}

export async function attachStlPreviewLink(
  deps: ToolDependencies,
  artifact: ArtifactMetadata
): Promise<PreviewLinkFields | undefined> {
  if (!deps.config.preview.enabled || artifact.format !== 'stl') {
    return undefined;
  }

  const absolutePath = await resolveSafePath(deps.config.paths.workspaceDir, artifact.path, {
    allowedExtensions: STL_EXTENSIONS,
    mustExist: true
  });

  const { token, expiresAt } = deps.previewTokens.register({
    absolutePath,
    format: 'stl',
    mimeType: mimeTypeForFormat('stl')
  });

  const urls = previewUrls(deps.config.preview.publicBaseUrl, token);
  return {
    previewUrl: urls.previewUrl,
    modelUrl: urls.modelUrl,
    expiresAt: expiresAt.toISOString()
  };
}
