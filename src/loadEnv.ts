import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

export function loadDotEnv(envPath = '.env'): void {
  if (!existsSync(envPath)) {
    return;
  }

  try {
    loadEnvFile(envPath);
  } catch {
    // Ignore missing or unreadable .env files; process env still wins.
  }
}
