# openscad-wasm-mcp

OpenSCAD MCP server that runs OpenSCAD through `openscad-wasm` from Node.js/TypeScript. It is designed to run with Docker Compose without installing the native OpenSCAD binary on the host.

## Why No Native OpenSCAD Install Is Required

The server loads the npm `openscad-wasm` package and calls the OpenSCAD-compatible WASM entry point from Node.js. User SCAD code and supporting files are copied into a per-job workspace, then the runner builds allowlisted OpenSCAD CLI-style arguments internally. No tool accepts arbitrary shell commands or raw OpenSCAD CLI arguments.

The OpenSCAD execution layer is isolated behind a runner interface so WASM package differences can be handled without changing MCP tool contracts.

## Run With Docker Compose

```bash
docker compose up --build
```

The service listens on `http://127.0.0.1:3333/mcp` from the host. Compose binds only `127.0.0.1:3333:3333`.

To override defaults, copy `.env.example` to `.env` and edit values before starting Compose.

Mock backend smoke check:

```bash
OPENSCAD_BACKEND=mock docker compose up --build
curl -s http://127.0.0.1:3333/healthz
```

## Development

Development and agent handoff notes live in [AGENTS.md](AGENTS.md).

## MCP Client Connection

Use Streamable HTTP transport:

```json
{
  "mcpServers": {
    "openscad-wasm": {
      "url": "http://127.0.0.1:3333/mcp"
    }
  }
}
```

MCP Inspector shortcut:

```bash
npm run mcp:inspector
make mcp-inspector
```

Both commands default to `http://127.0.0.1:3333/mcp`. Override the URL when needed:

```bash
npm run mcp:inspector -- http://127.0.0.1:3333/mcp
make mcp-inspector MCP_ADDR=http://127.0.0.1:3333/mcp
```

The shortcut passes `--transport http --server-url <url>` to `@modelcontextprotocol/inspector`, which is the Inspector CLI form for Streamable HTTP.

Use stdio transport for local process-spawned clients:

```json
{
  "mcpServers": {
    "openscad-wasm": {
      "command": "node",
      "args": ["dist/src/stdio.js"],
      "env": {
        "OPENSCAD_BACKEND": "mock"
      }
    }
  }
}
```

Build first with `npm run build`, or use `npm run dev:stdio` while developing.

Raw JSON-RPC example:

```bash
curl -s http://127.0.0.1:3333/mcp \
  -H 'content-type: application/json' \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "openscad_export_model",
      "arguments": {
        "scad": "cube([10, 20, 5]);",
        "format": "stl"
      }
    }
  }'
```

## Tools

- `openscad_validate`: validate SCAD and return diagnostics/stdout/stderr.
- `openscad_export_model`: export `stl`, `3mf`, `off`, `csg`, `dxf`, or `svg`.
- `openscad_render_preview`: export STL and render a server-side WebP mesh preview.
- `openscad_create_preview_link`: create a browser-viewable interactive STL preview link.
- `openscad_analyze_model`: export STL, parse ASCII/binary STL, return bounding box and triangle count.
- `workspace_list_files`: list files under `/workspace`.
- `workspace_read_file`: read an allowed workspace file.
- `workspace_write_file`: write an allowed workspace file.
- `workspace_delete_file`: delete an allowed workspace file.

Example validation payload:

```json
{
  "scad": "include <parts/hinge.scad>\nbox_width = 30;\ncube([box_width, 20, 8]);",
  "files": {
    "parts/hinge.scad": "// helper file"
  },
  "defines": {
    "box_width": 30,
    "debug": false,
    "label": "demo"
  },
  "enableManifold": true,
  "timeoutMs": 30000
}
```

Preview requests accept only allowlisted render options: `width`, `height`, comma-separated numeric `camera`, `projection`, `viewAll`, and `autoCenter`. Raw OpenSCAD CLI arguments are not accepted. The preview path asks `openscad-wasm` for STL, then renders the mesh to WebP in-process; it does not depend on OpenSCAD PNG export support.

Interactive 3D preview links are served by the same HTTP server:

- `GET /viewer/:token` — Three.js STL viewer page
- `GET /preview/:token/model.stl` — STL model download for the viewer

Use `openscad_create_preview_link` with exactly one of:

- `scad` (+ optional `files`, `defines`, `enableManifold`, `timeoutMs`) to export STL and issue a link
- `workspacePath` for an existing workspace STL file (for example `models/part.stl`)
- `artifactPath` for an existing artifact STL (for example `artifacts/job-...-output.stl`)

The tool returns `previewUrl`, `modelUrl`, and `expiresAt`. Open `previewUrl` in a browser while the server is running. Configure `PUBLIC_BASE_URL` when the server is reached through a reverse proxy or a non-default host/port.

`openscad_export_model` (STL only), `openscad_render_preview`, and `openscad_analyze_model` also include the same preview link fields automatically when `PREVIEW_ENABLED=true`.

## Artifact Output

Artifacts are written under `/workspace/artifacts` inside the container and `./workspace/artifacts` on the host. MCP responses include:

- `path`
- `filename`
- `format`
- `mimeType`
- `sizeBytes`
- `sha256`

## Security Limits

- Zod validates all tool inputs.
- Path traversal, absolute paths, URL-like paths, null bytes, backslashes, and symlink escapes are rejected.
- Allowed file extensions: `.scad`, `.stl`, `.3mf`, `.off`, `.csg`, `.dxf`, `.svg`, `.png`, `.webp`, `.json`, `.txt`.
- No shell command execution is exposed.
- Raw OpenSCAD CLI args are not accepted.
- `-o`, safe `-D name=value`, and `--enable=manifold` are generated by the args builder.
- Each job gets a unique temp directory.
- Artifacts are stored separately from job temp files.
- Input/output size limits, render timeout, cleanup option, and a simple semaphore are configured by env vars.
- Docker Compose uses read-only root filesystem, `/tmp` tmpfs, `cap_drop: ALL`, and `no-new-privileges`.
- WASM execution runs in a worker thread; timed-out renders terminate the worker instead of blocking the MCP process.

## Environment

See `.env.example` for runtime configuration.

## License

This project's own source code is released under the MIT License. See [LICENSE](LICENSE).

### License Notes

Runtime dependencies are distributed under their own license terms. The pinned `openscad-wasm` package is currently declared as GPL-2.0, and `sharp` is declared as Apache-2.0. If you redistribute Docker images, bundled `node_modules`, or other packaged builds that include dependencies, review and comply with those dependency licenses in addition to this project's MIT License.

## openscad-wasm Notes

Integration details for the pinned WASM package are tracked in [docs/openscad-wasm-integration.md](docs/openscad-wasm-integration.md). Remaining follow-up work is tracked in [TODO.md](TODO.md).

## Known Limitations

- Export format support varies by OpenSCAD WASM build.
- WebP previews are generated from exported STL, so they are intended as shaded mesh previews and do not preserve OpenSCAD color, preview modifiers, GUI overlays, or 2D-only output.
- Complex models can be slow or memory intensive in WASM.
- Font behavior depends on files available to the WASM build; this project does not install host fonts or bundle font libraries.
- `include`, `use`, and `import()` resolve helper files copied into the per-job WASM filesystem.
- Common OpenSCAD libraries are not bundled; provide required libraries through MCP files or workspace tools.
- The analyzer prefers OpenSCAD summary-file bounding boxes when available and falls back to STL parsing.
