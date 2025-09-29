import { execSync } from 'child_process';
import * as path from 'path';

export function getGitModifiedFiles(cwd: string): string[] {
  try {
    const output = execSync('git status --porcelain', {
      cwd,
      encoding: 'utf-8'
    });

    if (!output.trim()) {
      return [];
    }

    const files = output
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const match = line.match(/^..\s+(.+)$/);
        return match ? match[1] : null;
      })
      .filter((file): file is string => file !== null)
      .map(file => path.resolve(cwd, file));

    return files;
  } catch (error) {
    console.warn('Warning: Unable to get git status. Make sure you are in a git repository.');
    return [];
  }
}

export function isGitRepository(cwd: string): boolean {
  try {
    execSync('git rev-parse --git-dir', {
      cwd,
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    return true;
  } catch {
    return false;
  }
}