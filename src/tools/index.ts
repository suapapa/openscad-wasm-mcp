import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppConfig } from '../config.js';
import type { OpenScadRunner } from '../openscad/OpenScadRunner.js';
import type { Semaphore } from '../security/limits.js';
import type { ArtifactStore } from '../workspace/artifactStore.js';
import type { WorkspaceManager } from '../workspace/WorkspaceManager.js';
import { handleAnalyzeModel, analyzeModelInputSchema } from './analyzeModel.js';
import { handleExportModel, exportModelInputSchema } from './exportModel.js';
import { handleRenderPreview, renderPreviewInputSchema } from './renderPreview.js';
import { asMcpToolResult } from './toolResponse.js';
import { handleValidate, validateInputSchema } from './validate.js';
import {
  handleWorkspaceDeleteFile,
  handleWorkspaceListFiles,
  handleWorkspaceReadFile,
  handleWorkspaceWriteFile,
  workspaceDeleteFileInputSchema,
  workspaceListFilesInputSchema,
  workspaceReadFileInputSchema,
  workspaceWriteFileInputSchema
} from './workspace.js';

export interface ToolDependencies {
  config: AppConfig;
  runner: OpenScadRunner;
  workspace: WorkspaceManager;
  artifacts: ArtifactStore;
  semaphore: Semaphore;
}

export function registerTools(server: McpServer, deps: ToolDependencies): void {
  server.registerTool(
    'openscad_validate',
    {
      title: 'Validate OpenSCAD',
      description: 'Validate OpenSCAD source with openscad-wasm and return diagnostics.',
      inputSchema: validateInputSchema.shape
    },
    async (input) => asMcpToolResult(await handleValidate(input, deps))
  );

  server.registerTool(
    'openscad_export_model',
    {
      title: 'Export OpenSCAD Model',
      description: 'Export OpenSCAD source to an allowed model/vector format.',
      inputSchema: exportModelInputSchema.shape
    },
    async (input) => asMcpToolResult(await handleExportModel(input, deps))
  );

  server.registerTool(
    'openscad_render_preview',
    {
      title: 'Render OpenSCAD Preview',
      description: 'Export STL and render a server-side WebP mesh preview.',
      inputSchema: renderPreviewInputSchema.shape
    },
    async (input) => asMcpToolResult(await handleRenderPreview(input, deps))
  );

  server.registerTool(
    'openscad_analyze_model',
    {
      title: 'Analyze OpenSCAD Model',
      description: 'Export STL and compute a minimal bounding box and triangle count summary.',
      inputSchema: analyzeModelInputSchema.shape
    },
    async (input) => asMcpToolResult(await handleAnalyzeModel(input, deps))
  );

  server.registerTool(
    'workspace_list_files',
    {
      title: 'List Workspace Files',
      description: 'List files inside the configured workspace root.',
      inputSchema: workspaceListFilesInputSchema.shape
    },
    async (input) => asMcpToolResult(await handleWorkspaceListFiles(input, deps))
  );

  server.registerTool(
    'workspace_read_file',
    {
      title: 'Read Workspace File',
      description: 'Read an allowed file from the workspace root.',
      inputSchema: workspaceReadFileInputSchema.shape
    },
    async (input) => asMcpToolResult(await handleWorkspaceReadFile(input, deps))
  );

  server.registerTool(
    'workspace_write_file',
    {
      title: 'Write Workspace File',
      description: 'Write an allowed file under the workspace root.',
      inputSchema: workspaceWriteFileInputSchema.shape
    },
    async (input) => asMcpToolResult(await handleWorkspaceWriteFile(input, deps))
  );

  server.registerTool(
    'workspace_delete_file',
    {
      title: 'Delete Workspace File',
      description: 'Delete an allowed file under the workspace root.',
      inputSchema: workspaceDeleteFileInputSchema.shape
    },
    async (input) => asMcpToolResult(await handleWorkspaceDeleteFile(input, deps))
  );
}
