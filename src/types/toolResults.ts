export type DiagnosticLevel = 'info' | 'warning' | 'error';

export interface Diagnostic {
  level: DiagnosticLevel;
  message: string;
  file?: string;
  line?: number;
  column?: number;
}

export interface ArtifactMetadata {
  path: string;
  filename: string;
  format: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
}

export interface ToolRunResult {
  ok: boolean;
  diagnostics: Diagnostic[];
  stdout: string;
  stderr: string;
  elapsedMs: number;
}

export interface ExportToolResult extends ToolRunResult {
  artifact?: ArtifactMetadata;
}

export interface AnalyzeSummary {
  boundingBox?: {
    min: [number, number, number];
    max: [number, number, number];
  };
  triangleCount?: number;
  artifact?: ArtifactMetadata;
}

export interface AnalyzeToolResult extends ToolRunResult {
  summary: AnalyzeSummary;
}

export interface PreviewLinkToolResult extends ToolRunResult {
  previewUrl?: string;
  modelUrl?: string;
  expiresAt?: string;
  format?: string;
  artifact?: ArtifactMetadata;
}
