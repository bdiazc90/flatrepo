// v2.0 Implementation - Now with GitHub Archive API support
import { glob } from "glob";
import * as fs from "fs/promises";
import * as path from "path";
import { stringify } from "yaml";
import yauzl from "yauzl";
import { Readable } from "stream";

// Import v2 types
import { 
  RepoSource, 
  RepoData, 
  RepoMeta, 
  FileData, 
  FlatrepoOptions, 
  RepoStats,
  FlatrepoFetchError, 
  FlatrepoProcessError 
} from "./types/v2.js";

// Import v1 utilities
import {
  BINARY_EXTENSIONS,
  EXTENSION_TO_LANGUAGE,
  getBinaryFileType,
} from "./utils/file-types.js";
import {
  DEFAULT_IGNORE_PATTERNS,
  getGitignorePatterns,
  shouldIgnoreFile,
} from "./utils/gitignore.js";

// Import v1 types for compatibility
import { PackageJson } from "./types/index.js";

/**
 * Parse GitHub URL and extract owner, repo, and ref information
 */
function parseGitHubURL(url: string): { owner: string; repo: string; ref?: string } {
  const patterns = [
    // https://github.com/owner/repo
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?(?:\/(?:tree|blob)\/([^\/]+))?/,
    // git@github.com:owner/repo.git
    /^git@github\.com:([^\/]+)\/([^\/]+)(?:\.git)?/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const [, owner, repo, ref] = match;
      return { 
        owner, 
        repo: repo.replace(/\.git$/, ''), 
        ref: ref || undefined 
      };
    }
  }

  throw new FlatrepoFetchError(
    `Invalid GitHub URL format: ${url}`,
    'INVALID_URL',
    { url }
  );
}

/**
 * Download repository as ZIP from GitHub Archive API
 */
async function downloadGitHubArchive(
  owner: string, 
  repo: string, 
  ref: string = 'HEAD'
): Promise<{ buffer: Buffer; commitSha: string }> {
  const archiveUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${ref}`;
  
  try {
    const response = await fetch(archiveUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new FlatrepoFetchError(
          `Repository not found or not accessible: ${owner}/${repo}`,
          'REPOSITORY_NOT_FOUND',
          { url: archiveUrl }
        );
      }
      throw new FlatrepoFetchError(
        `GitHub API error: ${response.status} ${response.statusText}`,
        'GITHUB_API_ERROR',
        { url: archiveUrl }
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Extract commit SHA from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition') || '';
    const commitShaMatch = contentDisposition.match(/filename=.*-([a-f0-9]{7,40})\.zip/);
    const commitSha = commitShaMatch ? commitShaMatch[1] : 'HEAD';

    return { buffer, commitSha };
  } catch (error) {
    if (error instanceof FlatrepoFetchError) {
      throw error;
    }
    throw new FlatrepoFetchError(
      `Failed to download repository: ${error}`,
      'DOWNLOAD_ERROR',
      { url: archiveUrl },
      error as Error
    );
  }
}

/**
 * Extract ZIP buffer and convert to FileData array
 */
async function extractZipToFiles(zipBuffer: Buffer): Promise<FileData[]> {
  return new Promise((resolve, reject) => {
    const files: FileData[] = [];
    
    yauzl.fromBuffer(zipBuffer, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        reject(new FlatrepoFetchError(
          `Failed to read ZIP file: ${err.message}`,
          'ZIP_EXTRACTION_ERROR',
          { url: 'buffer' },
          err
        ));
        return;
      }

      if (!zipfile) {
        reject(new FlatrepoFetchError(
          'ZIP file is empty or corrupted',
          'ZIP_EXTRACTION_ERROR',
          { url: 'buffer' }
        ));
        return;
      }

      let rootDirName = '';
      
      zipfile.readEntry();
      
      zipfile.on('entry', (entry) => {
        // Skip directories
        if (/\/$/.test(entry.fileName)) {
          zipfile.readEntry();
          return;
        }

        // Extract root directory name from first file
        if (!rootDirName) {
          const firstSlash = entry.fileName.indexOf('/');
          rootDirName = firstSlash > 0 ? entry.fileName.substring(0, firstSlash) : '';
        }

        // Get relative path by removing root directory
        const relativePath = rootDirName 
          ? entry.fileName.substring(rootDirName.length + 1)
          : entry.fileName;

        if (!relativePath) {
          zipfile.readEntry();
          return;
        }

        zipfile.openReadStream(entry, (err, readStream) => {
          if (err) {
            reject(new FlatrepoFetchError(
              `Failed to read file ${entry.fileName}: ${err.message}`,
              'ZIP_EXTRACTION_ERROR',
              { url: 'buffer' },
              err
            ));
            return;
          }

          const chunks: Buffer[] = [];
          
          readStream!.on('data', (chunk) => {
            chunks.push(chunk);
          });

          readStream!.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const extension = path.extname(relativePath).toLowerCase();
            const isBinary = BINARY_EXTENSIONS.has(extension);

            files.push({
              path: relativePath,
              content: isBinary ? new Uint8Array(buffer) : buffer.toString('utf-8'),
              isBinary,
              extension,
            });

            zipfile.readEntry();
          });

          readStream!.on('error', (err) => {
            reject(new FlatrepoFetchError(
              `Failed to read file content ${entry.fileName}: ${err.message}`,
              'ZIP_EXTRACTION_ERROR',
              { url: 'buffer' },
              err
            ));
          });
        });
      });

      zipfile.on('end', () => {
        resolve(files);
      });

      zipfile.on('error', (err) => {
        reject(new FlatrepoFetchError(
          `ZIP extraction failed: ${err.message}`,
          'ZIP_EXTRACTION_ERROR',
          { url: 'buffer' },
          err
        ));
      });
    });
  });
}

/**
 * v2.0 Implementation: getRepoData for both local filesystem and GitHub repositories
 * Supports both local paths and GitHub URLs
 */
export async function getRepoData(source: RepoSource, verbose: boolean = false): Promise<RepoData> {
  // Handle GitHub URLs
  if ('url' in source) {
    return await getRepoDataFromGitHub(source, verbose);
  }
  
  // Handle local filesystem (existing v1.5 logic)
  return await getRepoDataFromLocal(source, verbose);
}

/**
 * Get repository data from GitHub Archive API
 */
async function getRepoDataFromGitHub(
  source: { url: string; ref?: string; timeoutMs?: number }, 
  verbose: boolean = false
): Promise<RepoData> {
  const { owner, repo, ref: parsedRef } = parseGitHubURL(source.url);
  const finalRef = source.ref || parsedRef || 'HEAD';
  
  if (verbose) {
    console.log(`Downloading from GitHub: ${owner}/${repo}@${finalRef}`);
  }

  // Download repository archive
  const { buffer, commitSha } = await downloadGitHubArchive(owner, repo, finalRef);
  
  if (verbose) {
    console.log(`Downloaded ${(buffer.length / 1024).toFixed(1)}KB, commit: ${commitSha}`);
  }

  // Extract files from ZIP
  const allFiles = await extractZipToFiles(buffer);
  
  if (verbose) {
    console.log(`Extracted ${allFiles.length} files`);
  }

  // Apply gitignore patterns (we don't have access to .gitignore from GitHub, so use defaults only)
  const ignoreList = [...DEFAULT_IGNORE_PATTERNS];
  
  const files = allFiles.filter(file => {
    return !shouldIgnoreFile(file.path, ignoreList);
  });

  if (verbose) {
    console.log(`After filtering: ${files.length} files`);
  }

  // Create RepoMeta for GitHub repository
  const meta: RepoMeta = {
    kind: 'github',
    owner,
    repo,
    ref: finalRef,
    commitSha,
    fetchedAt: new Date().toISOString(),
  };

  return {
    meta,
    files,
  };
}

/**
 * Get repository data from local filesystem (existing v1.5 logic)
 */
async function getRepoDataFromLocal(
  source: { path: string }, 
  verbose: boolean = false
): Promise<RepoData> {

  const { path: dirPath } = source;
  
  try {
    // Validate path exists
    const stat = await fs.stat(dirPath);
    if (!stat.isDirectory()) {
      throw FlatrepoFetchError.pathNotFound(dirPath);
    }
  } catch (error) {
    throw FlatrepoFetchError.pathNotFound(dirPath);
  }

  const files: FileData[] = [];
  const gitignorePatterns = await getGitignorePatterns();
  
  // Build ignore list (same as v1.2 logic, but no outputPath since it's handled at CLI level)
  const ignoreList = [
    ...new Set([
      ...DEFAULT_IGNORE_PATTERNS,
      ...gitignorePatterns,
    ])
  ];

  if (verbose) {
    console.log("Ignored patterns .gitignore:", ignoreList);
  }

  try {
    const matches = await glob(`${dirPath}/**/*.*`, {
      dot: true,
      nodir: true,
    });

    for (const match of matches) {
      // Use relative path for gitignore matching (same as v1.2)
      const relativePath = path.relative(dirPath, match);
      if (shouldIgnoreFile(relativePath, ignoreList)) continue;
      
      try {
        const stat = await fs.stat(match);
        const extension = path.extname(match).toLowerCase();
        const relativePath = path.relative(dirPath, match);

        if (stat.isFile()) {
          if (BINARY_EXTENSIONS.has(extension)) {
            // Binary file - read as Uint8Array
            const content = await fs.readFile(match);
            files.push({
              path: relativePath,
              content: new Uint8Array(content),
              isBinary: true,
              extension,
            });
          } else {
            // Text file - read as string
            const content = await fs.readFile(match, "utf-8");
            files.push({
              path: relativePath,
              content,
              isBinary: false,
              extension,
            });
          }
          
          if (verbose) {
            console.log(`Processing: ${relativePath}`);
          }
        }
      } catch (error) {
        console.warn(`WARNING: Can't process ${match}:`, error);
      }
    }
  } catch (error) {
    throw new FlatrepoFetchError(
      `Error while finding files in ${dirPath}: ${error}`,
      'FILESYSTEM_ERROR',
      source,
      error as Error
    );
  }

  // Create RepoMeta for local filesystem
  const meta: RepoMeta = {
    kind: 'local',
    fetchedAt: new Date().toISOString(),
    path: path.resolve(dirPath),
  };

  return {
    meta,
    files,
  };
}

/**
 * v1.5 Implementation: flatrepo - pure processing function
 * Migrates logic from generateDocs() without any filesystem I/O
 */
export async function flatrepo(
  repoData: RepoData, 
  options: FlatrepoOptions = {},
  verbose: boolean = false
): Promise<string> {
  const {
    includeBin = false,
    ignorePatterns = '',
    maxBytesPerFile = 100 * 1024 * 1024, // 100MB default
  } = options;

  // Apply custom ignore patterns if provided (replicating v1.2 logic exactly)
  let filteredFiles = repoData.files;
  
  if (ignorePatterns) {
    const customIgnorePatterns = ignorePatterns
      .split(',')
      .map(pattern => pattern.trim())
      .filter(pattern => pattern.length > 0)
      .map(pattern => {
        // Si el patrón es un directorio (termina con /)
        if (pattern.endsWith('/')) {
          return `**/${pattern}**`;  // Asegurar que coincida con cualquier archivo dentro
        }
        // Si el patrón parece ser un directorio sin slash final (como .netlify)
        else if (!pattern.includes('.') || pattern.startsWith('.')) {
          return `**/${pattern}/**`; // Tratar como directorio
        }
        // Si es un patrón de archivo, asegurarse que tenga el formato adecuado para glob
        else if (!pattern.startsWith('/') && !pattern.startsWith('**/')) {
          return `**/${pattern}`;
        }
        return pattern;
      });

    filteredFiles = repoData.files.filter(file => {
      // Use relative path for custom pattern matching (same as gitignore logic)
      return !shouldIgnoreFile(file.path, customIgnorePatterns);
    });
  }

  // Process files based on includeBin option
  const processedFiles: FileData[] = [];
  
  for (const file of filteredFiles) {
    // Check file size limit
    const fileSize = file.isBinary 
      ? (file.content as Uint8Array).length 
      : (file.content as string).length;
      
    if (fileSize > maxBytesPerFile) {
      throw FlatrepoProcessError.fileTooBig(file.path, fileSize, maxBytesPerFile);
    }

    if (file.isBinary) {
      if (includeBin) {
        // Include binary with description (same as v1.2)
        processedFiles.push({
          ...file,
          content: `(Binary file of ${getBinaryFileType(file.extension)})`,
          isBinary: false, // Convert to text description
        });
      }
      // Skip binary files if not includeBin
    } else {
      // Include text file as-is
      processedFiles.push(file);
    }
  }

  if (processedFiles.length === 0) {
    throw FlatrepoProcessError.emptyRepository();
  }

  // Generate stats (same logic as v1.2)
  const stats = calculateStats(processedFiles, repoData.files);
  
  // Generate markdown (same logic as v1.2) 
  const markdown = generateMarkdown(processedFiles, stats, repoData);
  
  // Verbose mode: show processing summary
  if (verbose) {
    console.log(`\nProcessing complete:`);
    console.log(`- Total files processed: ${processedFiles.length}`);
    console.log(`- Total lines: ${stats.totalLines}`);
    console.log(`- Binary files found: ${stats.binaryFiles}`);
    console.log(`- Total bytes: ${stats.totalBytes}`);
  }
  
  return markdown;
}

/**
 * Generate directory tree structure in ASCII format
 */
function generateDirectoryTree(files: FileData[]): string {
  // Build directory structure from file paths
  const structure = new Map<string, Set<string>>();

  // Add all directories and files to the structure
  for (const file of files) {
    const parts = file.path.split('/');

    // Add each directory level
    for (let i = 0; i < parts.length - 1; i++) {
      const currentPath = parts.slice(0, i + 1).join('/');
      const parentPath = i === 0 ? '' : parts.slice(0, i).join('/');

      if (!structure.has(parentPath)) {
        structure.set(parentPath, new Set());
      }
      structure.get(parentPath)!.add(currentPath + '/');
    }

    // Add the file
    const parentDir = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
    if (!structure.has(parentDir)) {
      structure.set(parentDir, new Set());
    }
    structure.get(parentDir)!.add(parts[parts.length - 1]);
  }

  // Sort each directory's contents
  for (const [dir, contents] of structure) {
    const sortedContents = Array.from(contents).sort((a, b) => {
      // Directories first, then files
      const aIsDir = a.endsWith('/');
      const bIsDir = b.endsWith('/');
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });
    structure.set(dir, new Set(sortedContents));
  }

  // Generate the tree representation
  function buildTree(dirPath: string, prefix: string = '', isLast: boolean = true): string[] {
    const lines: string[] = [];
    const contents = structure.get(dirPath);

    if (!contents) return lines;

    const items = Array.from(contents);

    items.forEach((item, index) => {
      const isLastItem = index === items.length - 1;
      const isDirectory = item.endsWith('/');
      const itemName = isDirectory ? item.slice(0, -1) : item;
      const displayName = isDirectory ? itemName.split('/').pop() + '/' : itemName;

      // Choose the right tree characters
      const currentPrefix = isLastItem ? '└── ' : '├── ';
      const nextPrefix = prefix + (isLastItem ? '    ' : '│   ');

      lines.push(prefix + currentPrefix + displayName);

      // Recursively add subdirectories
      if (isDirectory) {
        const fullPath = dirPath ? `${dirPath}/${itemName.split('/').pop()}` : itemName.split('/').pop()!;
        lines.push(...buildTree(fullPath, nextPrefix, isLastItem));
      }
    });

    return lines;
  }

  // Start building from root
  const treeLines = ['.', ...buildTree('')];
  return treeLines.join('\n');
}

/**
 * Calculate repository statistics (migrated from v1.2)
 */
function calculateStats(processedFiles: FileData[], allFiles: FileData[]): RepoStats {
  const stats: RepoStats = {
    totalFiles: processedFiles.length,
    totalLines: 0,
    languages: {},
    fileTypes: {},
    binaryFiles: allFiles.filter(f => f.isBinary).length,
    totalBytes: 0,
  };

  for (const file of processedFiles) {
    const content = file.content as string;
    stats.totalLines += content.split("\n").length;
    stats.totalBytes += content.length;

    stats.fileTypes[file.extension] = (stats.fileTypes[file.extension] || 0) + 1;

    const language = EXTENSION_TO_LANGUAGE[file.extension] || "";
    if (language) {
      stats.languages[language] = (stats.languages[language] || 0) + 1;
    }
  }

  return stats;
}

/**
 * Generate markdown output (migrated from v1.2)
 */
function generateMarkdown(files: FileData[], stats: RepoStats, repoData: RepoData): string {
  const header = generateHeader(files, stats, repoData);
  const content = files.map(formatFileContent).join("");
  return header + content;
}

/**
 * Generate YAML header (migrated from v1.2)
 */
function generateHeader(files: FileData[], stats: RepoStats, repoData: RepoData): string {
  // Try to find package.json for repository name
  const pkgFile = files.find((f) => f.path === "package.json");
  const pkgData: PackageJson = pkgFile ? JSON.parse(pkgFile.content as string) : {};

  const repoName = repoData.meta.kind === 'local'
    ? pkgData.name || path.basename(repoData.meta.path || process.cwd())
    : `${repoData.meta.owner}/${repoData.meta.repo}`;

  // Generate directory tree structure
  const directoryTree = generateDirectoryTree(files);

  const header = {
    repository: {
      name: repoName,
      kind: repoData.meta.kind,
      ...(repoData.meta.kind === 'local' && { path: repoData.meta.path }),
      ...(repoData.meta.kind === 'github' && {
        owner: repoData.meta.owner,
        repo: repoData.meta.repo,
        ref: repoData.meta.ref,
        commitSha: repoData.meta.commitSha,
      }),
    },
    generated: {
      timestamp: repoData.meta.fetchedAt,
      tool: "FlatRepo v2.1.1",
    },
    statistics: stats,
    directory_tree: directoryTree,
  };

  return `---\n${stringify(header)}---\n\n`;
}

/**
 * Format individual file content (same as v1.2)
 */
function formatFileContent(file: FileData): string {
  const language = EXTENSION_TO_LANGUAGE[file.extension] || "";
  let content = `===  ${file.path}\n`;
  content += `\`\`\`${language}\n`;
  content += file.content as string;
  if (!(file.content as string).endsWith("\n")) content += "\n";
  content += "```\n";
  content += `=== EOF: ${file.path}\n\n`;
  return content;
}