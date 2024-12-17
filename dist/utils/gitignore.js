import * as fs from 'fs/promises';
import * as path from 'path';
export const DEFAULT_IGNORE_PATTERNS = [
    'node_modules/**',
    'package-lock.json',
    '.DS_Store',
    '.gitignore',
    '.git/**',
    'dist/**',
    '.next/**'
];
async function readGitignoreFile(filePath) {
    try {
        const gitignoreContent = await fs.readFile(filePath, 'utf-8');
        return gitignoreContent
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'))
            .map(pattern => pattern.endsWith('/') ? `${pattern}**` : pattern);
    }
    catch (error) {
        return [];
    }
}
export async function getGitignorePatterns() {
    const projectDir = process.cwd();
    const projectGitignorePath = path.join(projectDir, '.gitignore');
    // Get patterns from the project's .gitignore
    const projectPatterns = await readGitignoreFile(projectGitignorePath);
    // Get patterns from any parent .gitignore files
    const parentPatterns = [];
    let currentDir = projectDir;
    let parentDir = path.dirname(currentDir);
    while (parentDir !== currentDir) {
        const parentGitignorePath = path.join(parentDir, '.gitignore');
        const patterns = await readGitignoreFile(parentGitignorePath);
        parentPatterns.push(...patterns);
        currentDir = parentDir;
        parentDir = path.dirname(currentDir);
    }
    // Combine all patterns, removing duplicates
    const allPatterns = [...new Set([...projectPatterns, ...parentPatterns])];
    // Convert relative patterns to absolute if needed
    return allPatterns.map(pattern => {
        if (pattern.startsWith('/')) {
            return pattern.slice(1); // Remove leading slash
        }
        return pattern;
    });
}
