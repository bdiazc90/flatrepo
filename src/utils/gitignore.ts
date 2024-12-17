import * as fs from 'fs/promises';

export const DEFAULT_IGNORE_PATTERNS = [
  'node_modules/**',
  '.gitignore',
  '.git/**',
  'dist/**',
  '.next/**'
];

export async function getGitignorePatterns(): Promise<string[]> {
  try {
    const gitignoreContent = await fs.readFile('.gitignore', 'utf-8');
    return gitignoreContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(pattern => pattern.endsWith('/') ? `${pattern}**` : pattern);
  } catch (error) {
    return [];
  }
}