// v2.0 Types for FlatRepo Library API

/**
 * Source configuration for getRepoData()
 */
export type RepoSource = 
  | { path: string }  // Local filesystem
  | { url: string; ref?: string; timeoutMs?: number }; // GitHub Archive API

/**
 * Repository metadata
 */
export interface RepoMeta {
  kind: 'local' | 'github';
  fetchedAt: string; // ISO timestamp
  
  // GitHub-specific metadata (undefined for local)
  owner?: string;
  repo?: string;  
  ref?: string;
  commitSha?: string;
  
  // Local-specific metadata (undefined for GitHub)
  path?: string;
}

/**
 * Individual file data within repository
 */
export interface FileData {
  path: string;
  content: string | Uint8Array; // string for text files, Uint8Array for binary
  isBinary: boolean;
  extension: string;
}

/**
 * Complete repository data structure
 */
export interface RepoData {
  meta: RepoMeta;
  files: FileData[];
}

/**
 * Options for flatrepo() processing (compatible with v1 + new options)
 */
export interface FlatrepoOptions {
  // v1 compatibility options
  includeBin?: boolean;
  ignorePatterns?: string; // comma-separated patterns
  
  // v2 new options
  maxBytesPerFile?: number; // default: 100MB
  encoding?: 'utf-8' | 'base64'; // for text output format
}

/**
 * Repository statistics (compatible with v1 RepoStats)
 */
export interface RepoStats {
  totalFiles: number;
  totalLines: number;
  languages: { [key: string]: number };
  fileTypes: { [key: string]: number };
  
  // v2 additions
  binaryFiles: number;
  totalBytes: number;
}

/**
 * Error thrown during repository fetching (I/O phase)
 */
export class FlatrepoFetchError extends Error {
  public readonly code: string;
  public readonly source: RepoSource;
  
  constructor(message: string, code: string, source: RepoSource, cause?: Error) {
    super(message);
    this.name = 'FlatrepoFetchError';
    this.code = code;
    this.source = source;
    
    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
  
  static invalidUrl(url: string, cause?: Error): FlatrepoFetchError {
    return new FlatrepoFetchError(
      `Invalid GitHub URL: ${url}`,
      'INVALID_URL',
      { url },
      cause
    );
  }
  
  static networkError(url: string, statusCode: number, cause?: Error): FlatrepoFetchError {
    return new FlatrepoFetchError(
      `Network error fetching ${url}: HTTP ${statusCode}`,
      'NETWORK_ERROR', 
      { url },
      cause
    );
  }
  
  static timeout(source: RepoSource, timeoutMs: number): FlatrepoFetchError {
    const location = 'path' in source ? source.path : source.url;
    return new FlatrepoFetchError(
      `Timeout after ${timeoutMs}ms fetching ${location}`,
      'TIMEOUT',
      source
    );
  }
  
  static corruptArchive(url: string, cause?: Error): FlatrepoFetchError {
    return new FlatrepoFetchError(
      `Corrupt or invalid archive from ${url}`,
      'CORRUPT_ARCHIVE',
      { url },
      cause
    );
  }
  
  static pathNotFound(path: string): FlatrepoFetchError {
    return new FlatrepoFetchError(
      `Path not found: ${path}`,
      'PATH_NOT_FOUND',
      { path }
    );
  }
}

/**
 * Error thrown during repository processing (flatrepo phase)
 */
export class FlatrepoProcessError extends Error {
  public readonly code: string;
  public readonly filePath?: string;
  
  constructor(message: string, code: string, filePath?: string, cause?: Error) {
    super(message);
    this.name = 'FlatrepoProcessError';
    this.code = code;
    this.filePath = filePath;
    
    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
  
  static fileTooBig(filePath: string, sizeBytes: number, maxBytes: number): FlatrepoProcessError {
    return new FlatrepoProcessError(
      `File ${filePath} (${sizeBytes} bytes) exceeds maxBytesPerFile limit of ${maxBytes}`,
      'FILE_TOO_BIG',
      filePath
    );
  }
  
  static binaryAsText(filePath: string): FlatrepoProcessError {
    return new FlatrepoProcessError(
      `Attempted to process binary file ${filePath} as text`,
      'BINARY_AS_TEXT',
      filePath  
    );
  }
  
  static emptyRepository(): FlatrepoProcessError {
    return new FlatrepoProcessError(
      'Repository contains no processable files',
      'EMPTY_REPOSITORY'
    );
  }
  
  static invalidEncoding(filePath: string, cause?: Error): FlatrepoProcessError {
    return new FlatrepoProcessError(
      `Invalid text encoding in file ${filePath}`,
      'INVALID_ENCODING',
      filePath,
      cause
    );
  }
}

// Export legacy v1 interfaces for backward compatibility
export { FileInfo, PackageJson } from './index.js';