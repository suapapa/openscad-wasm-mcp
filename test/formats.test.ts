import { describe, expect, it } from 'vitest';
import { buildOpenScadArgs, formatDefineValue, formatPreviewCamera } from '../src/openscad/args.js';
import { extensionForFormat, isExportFormat, mimeTypeForFormat } from '../src/openscad/formats.js';

describe('formats', () => {
  it('allows only configured export formats', () => {
    expect(isExportFormat('stl')).toBe(true);
    expect(isExportFormat('3mf')).toBe(true);
    expect(isExportFormat('png')).toBe(false);
    expect(isExportFormat('webp')).toBe(false);
    expect(isExportFormat('obj')).toBe(false);
  });

  it('maps extensions and mime types', () => {
    expect(extensionForFormat('stl')).toBe('.stl');
    expect(extensionForFormat('svg')).toBe('.svg');
    expect(extensionForFormat('webp')).toBe('.webp');
    expect(mimeTypeForFormat('webp')).toBe('image/webp');
  });
});

describe('OpenSCAD args builder', () => {
  it('builds only allowlisted args', () => {
    const args = buildOpenScadArgs({
      inputPath: '/in/input.scad',
      outputPath: '/out/output.stl',
      format: 'stl',
      defines: {
        width: 10,
        label: 'hello "box"',
        enabled: true
      },
      enableManifold: true
    });

    expect(args).toEqual([
      '/in/input.scad',
      '-o',
      '/out/output.stl',
      '--enable=manifold',
      '-D',
      'width=10',
      '-D',
      'label="hello \\"box\\""',
      '-D',
      'enabled=true'
    ]);
  });

  it('adds summary-file args through the allowlisted builder', () => {
    const args = buildOpenScadArgs({
      inputPath: '/in/input.scad',
      outputPath: '/out/output.stl',
      format: 'stl',
      summaryFilePath: '/out/summary.json'
    });

    expect(args).toEqual([
      '/in/input.scad',
      '-o',
      '/out/output.stl',
      '--summary',
      'all',
      '--summary-file',
      '/out/summary.json'
    ]);
  });

  it('rejects unsafe define keys and values', () => {
    expect(() =>
      buildOpenScadArgs({
        inputPath: 'input.scad',
        outputPath: 'output.stl',
        format: 'stl',
        defines: { 'bad-name': 1 }
      })
    ).toThrow(/Unsafe/);

    expect(() => formatDefineValue(Number.NaN)).toThrow(/finite/);
  });

  it('rejects unsafe preview camera values', () => {
    expect(() => formatPreviewCamera('1,2,3')).toThrow(/6 or 7/);
    expect(() => formatPreviewCamera('1,2,3,4,5,--viewall')).toThrow(/finite numbers/);
  });
});
