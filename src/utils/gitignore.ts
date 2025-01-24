import * as fs from 'fs/promises';
import * as path from 'path';
import { minimatch } from 'minimatch';

export const DEFAULT_IGNORE_PATTERNS = [
  'node_modules/**',
  'package-lock.json',
  '**/.DS_Store',
  '.gitignore',
  '.git/**',
  'dist/**',
  '.next/**',
  'flatrepo_*.md'
];

async function readGitignoreFile(filePath: string): Promise<string[]> {
  try {
    const gitignoreContent = await fs.readFile(filePath, 'utf-8');
    return gitignoreContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(pattern => {
        if (!pattern.startsWith('/') && !pattern.startsWith('**/')) {
          return `**/${pattern}`;
        }
        return pattern.startsWith('/') ? pattern.slice(1) : pattern;
      });
  } catch (error) {
    return [];
  }
}

export async function getGitignorePatterns(): Promise<string[]> {
  const projectDir = process.cwd();
  const projectGitignorePath = path.join(projectDir, '.gitignore');
  
  const projectPatterns = await readGitignoreFile(projectGitignorePath);
  
  const parentPatterns: string[] = [];
  let currentDir = projectDir;
  let parentDir = path.dirname(currentDir);
  
  while (parentDir !== currentDir) {
    const parentGitignorePath = path.join(parentDir, '.gitignore');
    const patterns = await readGitignoreFile(parentGitignorePath);
    parentPatterns.push(...patterns);
    
    currentDir = parentDir;
    parentDir = path.dirname(currentDir);
  }

  const allPatterns = [...new Set([...DEFAULT_IGNORE_PATTERNS, ...projectPatterns, ...parentPatterns])];
  
  return allPatterns.map(pattern => {
    if (pattern.startsWith('/')) {
      return pattern.slice(1);
    }
    return pattern;
  });
}

export function shouldIgnoreFile(filePath: string, patterns: string[]): boolean {
  return patterns.some(pattern => minimatch(filePath, pattern, { dot: true }));
}