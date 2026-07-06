export function asMcpToolResult<T extends object>(data: T): {
  content: Array<{ type: 'text'; text: string }>;
  structuredContent: Record<string, unknown>;
} {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    structuredContent: data as Record<string, unknown>
  };
}

export function errorRunResult(error: unknown, elapsedMs = 0): {
  ok: false;
  diagnostics: Array<{ level: 'error'; message: string }>;
  stdout: string;
  stderr: string;
  elapsedMs: number;
} {
  const message = error instanceof Error ? error.message : String(error);
  return {
    ok: false,
    diagnostics: [{ level: 'error', message }],
    stdout: '',
    stderr: message,
    elapsedMs
  };
}
