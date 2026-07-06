# openscad-wasm Integration Notes

Verified on 2026-07-06 with the pinned `openscad-wasm@0.0.4` package.

## Package Boundary

- The runtime import path is the package ESM entry: `import { createOpenSCAD } from "openscad-wasm"`.
- The package embeds its WASM payload in `openscad.js`, so Node.js 22 does not need extra `.wasm` or data files copied beside the app.
- The package `types` field points at `openscad.js`; the project keeps a local declaration file only to describe the package API at the runner boundary.
- Each render runs in a fresh worker thread and a fresh OpenSCAD instance. Reusing one instance for multiple `callMain()` calls can throw in this build.

## Node.js 22 Initialization

The runner initializes the module with:

```ts
createOpenSCAD({
  noInitialRun: true,
  noExitRuntime: true,
  print,
  printErr
});
```

`print` and `printErr` consistently capture OpenSCAD stdout/stderr for diagnostics parsing.

## Export Format Checks

Fresh-instance checks with minimal models:

| Format | Result                                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------- |
| `stl`  | Succeeds                                                                                                |
| `off`  | Succeeds                                                                                                |
| `csg`  | Succeeds                                                                                                |
| `dxf`  | Succeeds with a 2D model                                                                                |
| `svg`  | Succeeds with a 2D model                                                                                |
| `3mf`  | The build advertises the extension but throws `null function or function signature mismatch` in Node.js |
| `png`  | The build advertises the extension but exits with code `1` and produces no artifact                     |

The MCP runner keeps `3mf` in the public allowlist because OpenSCAD advertises it, but returns a clear failed tool result when this specific WASM build cannot export it. Preview rendering does not use OpenSCAD PNG export.

## Preview Rendering

`openscad_render_preview` exports STL through the normal `OpenScadRunner.export()` path, then renders the STL mesh to WebP inside Node.js. This keeps the OpenSCAD integration behind the same WASM runner boundary and avoids a native OpenSCAD binary, browser automation, or raw OpenSCAD CLI arguments.

The server-side preview renderer supports the public preview options `width`, `height`, `camera`, `projection`, `viewAll`, and `autoCenter`. Camera values are still validated as 6-value vector camera or 7-value gimbal camera tuples, but the rendered view is an approximation of OpenSCAD's GUI/PNG viewport.

Because the renderer starts from STL, previews are shaded mesh previews only. They do not preserve OpenSCAD colors, preview modifiers, GUI overlays, or 2D-only output. If the model cannot export to STL, preview rendering returns the STL export failure.

## Summary File

`--summary all --summary-file /job/summary.json` works in this build. `openscad_analyze_model` asks for summary data during STL export and prefers the summary bounding box. It uses summary facet counts as triangle counts only when the summary marks the geometry as triangular; otherwise it keeps the STL parser triangle count.

## Filesystem Layout

The runner writes the main source to `/job-<id>/input.scad` in the Emscripten filesystem and copies MCP-provided helper files under the same virtual root. Verified behavior:

- `include <parts/lib.scad>` resolves helper files copied under the job root.
- `import("meshes/tiny.stl")` resolves imported assets copied under the job root.
- Final artifacts are copied out to the configured artifact directory by Node.js after the WASM run.

The Docker image uses a read-only root filesystem. Required writes stay in the bind-mounted workspace/artifact directory, Docker `/tmp` tmpfs for job directories, or the in-memory Emscripten filesystem.

## Runtime Safety

WASM execution runs inside a Node.js worker thread. If the render timeout expires, the main MCP process terminates the worker and returns an error diagnostic instead of waiting for a blocked `callMain()`.

Input size is enforced before files are written. Output size is enforced before artifacts are saved. Very complex models may still exhaust WASM memory inside the worker; those failures are returned as OpenSCAD diagnostics or worker errors instead of exposing shell/native process details.

## Libraries and Fonts

No common OpenSCAD libraries are bundled. Callers must provide required `.scad`, mesh, JSON, text, or font-adjacent assets through MCP `files` or workspace tools.

Font-dependent models depend on the selected WASM build and files available in the job filesystem. This project does not install host fonts or mount system font directories into the container.
