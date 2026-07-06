# AGENTS.md

Development notes for agents working on `openscad-wasm-mcp`.

## Project Contract

This project is an OpenSCAD MCP server that runs OpenSCAD through `openscad-wasm` in Node.js. Do not add a native OpenSCAD binary dependency, do not automate the browser-based OpenSCAD UI, and do not expose arbitrary shell commands or raw OpenSCAD CLI args.

The server should remain runnable through Docker Compose with:

```bash
docker compose up --build
```

The default MCP transport is Streamable HTTP on `/mcp`, port `3333`. Keep server creation separate from transport wiring so stdio can be added later.

## Development Commands

```bash
npm install
npm run dev
npm test
npm run build
npm run lint
```

Use the mock backend for local development that should not depend on real WASM behavior:

```bash
OPENSCAD_BACKEND=mock npm run dev
```

Before handing off code changes, run at least:

```bash
npm test
npm run build
```

Run `npm run lint` when touching TypeScript, config, or formatting-sensitive files.

## Runtime Configuration

Environment defaults are documented in `.env.example`:

- `PORT=3333`
- `HOST=0.0.0.0`
- `WORKSPACE_DIR=/workspace`
- `ARTIFACT_DIR=/workspace/artifacts`
- `JOB_TMP_DIR=/tmp/openscad-jobs`
- `MAX_RENDER_MS=30000`
- `MAX_OUTPUT_MB=50`
- `MAX_INPUT_MB=10`
- `MAX_PARALLEL_JOBS=2`
- `CLEANUP_JOBS=true`
- `OPENSCAD_BACKEND=wasm|mock`
- `PUBLIC_BASE_URL=http://127.0.0.1:3333`
- `PREVIEW_TTL_SECONDS=3600`
- `PREVIEW_ENABLED=true`

Docker Compose binds only `127.0.0.1:3333:3333` and uses a read-only root filesystem, `/tmp` tmpfs, `cap_drop: ALL`, and `no-new-privileges`.

## Architecture Map

- `src/index.ts`: process entry point; loads config, creates dependencies, starts HTTP transport.
- `src/config.ts`: env parsing and runtime limits.
- `src/server/createMcpServer.ts`: MCP server construction and tool registration.
- `src/server/transport.ts`: Streamable HTTP wiring.
- `src/tools/`: zod schemas and MCP tool handlers.
- `src/openscad/OpenScadRunner.ts`: runner interface and shared runner result types.
- `src/openscad/OpenScadWasmRunner.ts`: real server-side `openscad-wasm` integration boundary.
- `src/openscad/MockOpenScadRunner.ts`: deterministic runner for tests and development.
- `src/openscad/args.ts`: allowlisted OpenSCAD CLI-compatible args builder.
- `src/workspace/`: job workspace, artifact storage, path safety, and workspace tools.
- `src/security/`: size limits, semaphore, and sanitization helpers.
- `test/`: vitest coverage for safety, formats, diagnostics, workspace, and mock tool flows.

## OpenSCAD Runner Rules

Keep OpenSCAD execution behind `OpenScadRunner`.

- `OpenScadWasmRunner` owns `openscad-wasm` imports, Emscripten FS writes, `callMain` args, stdout/stderr capture, output reads, and timeout behavior.
- `MockOpenScadRunner` should stay fast, deterministic, and independent of `openscad-wasm`.
- Tool handlers should not know package-specific WASM details.
- If the `openscad-wasm` API changes, prefer editing `OpenScadWasmRunner.ts` and local type declarations instead of spreading compatibility code through tools.

Current `openscad-wasm` uncertainty is intentional. The scaffold compiles and tests with the mock runner while the real package API is confirmed.

## Security Invariants

Preserve these constraints when adding tools or options:

- Validate all user input with zod.
- Reject path traversal, absolute paths, URL-like paths, null bytes, backslashes, and symlink escapes.
- Keep allowed workspace extensions limited unless there is a clear reason to expand them.
- Do not expose shell execution.
- Do not accept raw OpenSCAD CLI args.
- Build args only through `src/openscad/args.ts`.
- Keep `-D` define keys restricted to safe identifiers.
- Use per-job temp directories.
- Store final artifacts under the artifact directory.
- Enforce input size, output size, timeout, cleanup, and concurrency limits.
- Preview links must use opaque tokens only; never expose workspace or artifact paths directly in URLs.
- Preview HTTP routes are disabled when `PREVIEW_ENABLED=false`. Stdio transport can still register preview-link tokens, but browser URLs require the HTTP server.

## Tool Behavior Expectations

- `openscad_validate`: returns `ok`, `diagnostics`, `stdout`, `stderr`, `elapsedMs`.
- `openscad_export_model`: returns artifact metadata for `stl`, `3mf`, `off`, `csg`, `dxf`, or `svg`.
- `openscad_render_preview`: exports STL and renders a server-side WebP mesh preview.
- `openscad_create_preview_link`: returns `previewUrl`, `modelUrl`, and `expiresAt` for an interactive browser STL viewer on the same HTTP server.
- `openscad_analyze_model`: exports STL first, then computes bbox and triangle count from ASCII/binary STL.
- Workspace tools must never read, write, list, or delete outside `WORKSPACE_DIR`.

MCP responses should include both text content and structured content when practical.

## Testing Guidance

Existing test focus:

- path traversal and symlink escape prevention
- format allowlist and define args builder behavior
- diagnostics parsing
- workspace read/write/list/delete
- mock-runner tool behavior
- STL bbox and triangle count parsing

When changing shared security or workspace behavior, add tests before broadening behavior. When changing `OpenScadWasmRunner`, keep mock tests green and add integration notes or tests if real WASM behavior is available.

## Documentation

- Keep README focused on project purpose, Docker usage, MCP client usage, tools, artifact output, and user-facing limitations.
- Put agent/developer implementation notes in this file.
- Track remaining implementation work in `TODO.md`.
