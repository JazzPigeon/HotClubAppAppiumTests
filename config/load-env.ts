import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(ROOT, '.env');

// GitHub Secrets are injected only into Actions jobs. Local `npm test` and
// the VS Code debugger read this file instead. Existing process.env values
// (including CI secrets) are not overwritten.
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}
