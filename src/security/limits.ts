export const DEFAULT_ALLOWED_EXTENSIONS = new Set([
  '.scad',
  '.stl',
  '.3mf',
  '.off',
  '.csg',
  '.dxf',
  '.svg',
  '.png',
  '.webp',
  '.json',
  '.txt'
]);

export interface LimitConfig {
  maxRenderMs: number;
  maxOutputBytes: number;
  maxInputBytes: number;
  maxParallelJobs: number;
  cleanupJobs: boolean;
}

export class Semaphore {
  private active = 0;
  private readonly queue: Array<() => void> = [];

  constructor(private readonly max: number) {
    if (!Number.isInteger(max) || max < 1) {
      throw new Error('MAX_PARALLEL_JOBS must be a positive integer.');
    }
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  private async acquire(): Promise<void> {
    if (this.active < this.max) {
      this.active += 1;
      return;
    }

    await new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
    this.active += 1;
  }

  private release(): void {
    this.active -= 1;
    const next = this.queue.shift();
    if (next) {
      next();
    }
  }
}

export function mbToBytes(value: number): number {
  return Math.floor(value * 1024 * 1024);
}

export function assertWithinBytes(label: string, byteLength: number, maxBytes: number): void {
  if (byteLength > maxBytes) {
    throw new Error(`${label} is ${byteLength} bytes, above the ${maxBytes} byte limit.`);
  }
}
