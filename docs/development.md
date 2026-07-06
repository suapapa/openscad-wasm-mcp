# Development and MCP Client Setup

Notes for local development, MCP client configuration, and example tool payloads.

## Development

Contributor and agent handoff notes live in [AGENTS.md](../AGENTS.md). That file covers project contracts, architecture, security invariants, and test expectations.

Common local commands:

```bash
npm install
npm run dev
npm test
npm run build
npm run lint
```

Use the mock backend when you do not need real WASM behavior:

```bash
OPENSCAD_BACKEND=mock npm run dev
```

Docker Compose remains the primary runtime path:

```bash
docker compose up --build
```

## MCP Client Connection

### Streamable HTTP

The default transport is Streamable HTTP on `/mcp`, port `3333`.

```json
{
  "mcpServers": {
    "openscad-wasm": {
      "url": "http://127.0.0.1:3333/mcp"
    }
  }
}
```

When `MCP_AUTH_TOKEN` is set, every `/mcp` request must include:

```http
Authorization: Bearer <token>
```

`/healthz`, preview viewer routes, and other non-MCP endpoints stay open unless you protect them separately at a reverse proxy.

### Hermes Agent

Add the server to `~/.hermes/config.yaml` (or your Hermes config file):

```yaml
mcp_servers:
  openscad-wasm:
    url: "http://127.0.0.1:3333/mcp"
    headers:
      Authorization: "Bearer ${OPENS_SCAD_MCP_TOKEN}"
```

Put the same secret in your Hermes environment or `.env`:

```bash
OPENS_SCAD_MCP_TOKEN=change-me-to-a-long-random-secret
```

On the MCP server side, set the matching value in `.env`:

```bash
MCP_AUTH_TOKEN=change-me-to-a-long-random-secret
```

If you run the server with Docker Compose, add `MCP_AUTH_TOKEN` to the project `.env` before `docker compose up --build`.

Without `MCP_AUTH_TOKEN`, Hermes can connect with only the `url` field.

### MCP Inspector

Shortcut commands:

```bash
npm run mcp:inspector
make mcp-inspector
```

Both default to `http://127.0.0.1:3333/mcp`. Override the URL when needed:

```bash
npm run mcp:inspector -- http://127.0.0.1:3333/mcp
make mcp-inspector MCP_ADDR=http://127.0.0.1:3333/mcp
```

The shortcut passes `--transport http --server-url <url>` to `@modelcontextprotocol/inspector`, which is the Inspector CLI form for Streamable HTTP.

### Stdio Transport

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

### Raw JSON-RPC Example

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

When `MCP_AUTH_TOKEN` is set, add the bearer header:

```bash
curl -s http://127.0.0.1:3333/mcp \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer change-me-to-a-long-random-secret' \
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

## Tool Payload Examples

Example validation or export payload with helper files and defines:

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

This shape applies to tools that accept inline SCAD input, such as `openscad_validate`, `openscad_export_model`, `openscad_render_preview`, and `openscad_analyze_model`.
