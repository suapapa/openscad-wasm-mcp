import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import type { Express, Request, Response } from 'express';
import { assertWithinBytes } from '../security/limits.js';
import { renderViewerPage } from '../preview/viewerPage.js';
import type { ToolDependencies } from '../tools/index.js';

const TOKEN_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidToken(token: string): boolean {
  return TOKEN_PATTERN.test(token);
}

function previewUrls(baseUrl: string, token: string): { previewUrl: string; modelUrl: string } {
  const previewUrl = `${baseUrl}/viewer/${token}`;
  const modelUrl = `${baseUrl}/preview/${token}/model.stl`;
  return { previewUrl, modelUrl };
}

export { previewUrls };

export function registerPreviewRoutes(app: Express, deps: ToolDependencies): void {
  if (!deps.config.preview.enabled) {
    return;
  }

  app.get('/viewer/:token', (req: Request, res: Response) => {
    const token = String(req.params.token);
    if (!isValidToken(token) || !deps.previewTokens.resolve(token)) {
      res.status(404).type('text/plain').send('Preview not found or expired.');
      return;
    }

    const { modelUrl } = previewUrls(deps.config.preview.publicBaseUrl, token);
    res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'unsafe-inline'; connect-src 'self'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.type('html').send(renderViewerPage(modelUrl));
  });

  app.get('/preview/:token/model.stl', async (req: Request, res: Response) => {
    const token = String(req.params.token);
    if (!isValidToken(token)) {
      res.status(404).type('text/plain').send('Preview not found or expired.');
      return;
    }

    const entry = deps.previewTokens.resolve(token);
    if (!entry) {
      res.status(404).type('text/plain').send('Preview not found or expired.');
      return;
    }

    try {
      const fileStats = await stat(entry.absolutePath);
      assertWithinBytes('Preview model', fileStats.size, deps.config.limits.maxOutputBytes);

      res.setHeader('Content-Type', entry.mimeType);
      res.setHeader('Content-Length', String(fileStats.size));
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');

      const stream = createReadStream(entry.absolutePath);
      stream.on('error', () => {
        if (!res.headersSent) {
          res.status(500).type('text/plain').send('Failed to read preview model.');
        }
      });
      stream.pipe(res);
    } catch {
      res.status(404).type('text/plain').send('Preview not found or expired.');
    }
  });
}
