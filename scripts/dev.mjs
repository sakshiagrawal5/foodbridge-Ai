import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { concurrently } from 'concurrently';

// Ensure critical Windows System32 directories are in PATH
if (process.platform === 'win32') {
  const systemRoot = process.env.SystemRoot || 'C:\\Windows';
  const system32 = path.join(systemRoot, 'System32');
  const wbem = path.join(systemRoot, 'System32', 'Wbem');
  const powershell = path.join(systemRoot, 'System32', 'WindowsPowerShell', 'v1.0');

  const currentPath = process.env.PATH || '';
  if (!currentPath.toLowerCase().includes('system32')) {
    process.env.PATH = `${system32};${systemRoot};${wbem};${powershell};${currentPath}`;
  }
}

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const { result } = concurrently(
  [
    { command: 'npm --prefix server start', name: 'server', prefixColor: 'blue' },
    { command: 'npm --prefix client run dev', name: 'client', prefixColor: 'green' }
  ],
  {
    cwd: rootDir,
    prefix: 'name'
  }
);

result.catch(() => {
  process.exit(0);
});

