# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2025-09-15

### 🚨 Critical Fix - Missing Core Files

### Fixed
- **CRITICAL**: Fixed .gitignore configuration excluding core v2.0 files from NPM distribution
- **CRITICAL**: Added missing `src/v2-core.ts` and `src/types/v2.ts` to repository and NPM package
- **FIXED**: v2.0+ library API now works correctly - users can import `getRepoData` and `flatrepo` functions

### Technical Details
- Removed incorrect .gitignore entries that were preventing core files from being published
- Force-added essential TypeScript files containing v2.0+ functionality
- Updated tool signature to "FlatRepo v2.1.1"
- Enhanced README.md with directory tree feature documentation

### Impact
- **Before v2.1.1**: NPM package was missing core functionality, library API didn't work
- **After v2.1.1**: Complete working package with all v2.0+ features available

### Compatibility
- **✅ 100% BACKWARD COMPATIBLE**: All existing functionality preserved
- **✅ WORKING LIBRARY API**: `getRepoData()` and `flatrepo()` functions now properly available
- **✅ ENHANCED DOCS**: README updated with directory tree examples

---

## [2.1.0] - 2025-09-15

### 🚀 New Feature - Directory Tree Structure

### Added
- **NEW**: Directory tree visualization in YAML header - see complete repository structure at a glance
- **ENHANCED**: ASCII tree representation showing folders and files hierarchy
- **ENHANCED**: Tool signature updated to "FlatRepo v2.1.0" in generated markdown

### Example Output
The YAML header now includes a `directory_tree` section:
```yaml
directory_tree: |-
  .
  ├── src/
  │   ├── components/
  │   │   ├── Header.tsx
  │   │   └── Footer.tsx
  │   └── utils/
  │       └── helpers.ts
  ├── tests/
  │   └── utils.test.ts
  └── package.json
```

### Compatibility
- **✅ 100% BACKWARD COMPATIBLE**: All existing functionality preserved
- **✅ NO BREAKING CHANGES**: CLI options and library API unchanged
- **✅ ENHANCED METADATA**: Richer YAML header without affecting file content sections

---

## [2.0.0] - 2025-09-10

### 🚀 Major Release - Library API + GitHub Support

### Added
- **NEW**: Public library API - use `getRepoData()` and `flatrepo()` functions programmatically
- **NEW**: GitHub repository support - document any public GitHub repository
- **NEW**: CLI GitHub support - `flatrepo https://github.com/user/repo output.md`
- **NEW**: GitHub Archive API integration for efficient repository downloading
- **NEW**: ZIP file extraction with yauzl library
- **ENHANCED**: TypeScript interfaces exported for library usage (`RepoSource`, `RepoData`, `FileData`, etc.)

### Changed
- **BREAKING**: Tool signature updated to "FlatRepo v2.0.0" in generated markdown
- **BREAKING**: Version bumped to 2.0.0 due to major new functionality
- **ENHANCED**: CLI now detects GitHub URLs automatically
- **ENHANCED**: Repository metadata includes commit SHA for GitHub repositories

### Library API
```typescript
import { getRepoData, flatrepo } from 'flatrepo';

// Local directory
const localRepo = await getRepoData({ path: './src' });

// GitHub repository  
const githubRepo = await getRepoData({ url: 'https://github.com/user/repo' });

// Generate markdown
const markdown = await flatrepo(repoData, options);
```

### Compatibility
- **✅ 100% BACKWARD COMPATIBLE**: CLI interface for local directories unchanged
- **✅ IDENTICAL OUTPUT**: Generated markdown format unchanged (except tool version)
- **✅ SAME OPTIONS**: All existing CLI options work identically
- **✅ API COMPATIBLE**: `generateDocs()` function still available for library usage

### Technical Details
- Added yauzl dependency for ZIP file extraction
- GitHub Archive API integration with proper error handling
- Commit SHA extraction from Content-Disposition headers
- Automatic gitignore pattern application (defaults only for remote repos)

---

## [1.4.6] - 2025-09-10

### Fixed
- **DOCUMENTATION**: Added missing --verbose option to README.md with usage examples
- **DOCUMENTATION**: Added --verbose option to Features list in README.md

### Technical Details  
- Fixed documentation gap identified after v1.4.5 release
- Enhanced README.md with complete --verbose usage information
- Followed improved release protocol to prevent future documentation omissions

---

## [1.4.5] - 2025-09-10

### Added
- **NEW**: `--verbose` option to show detailed output including ignored patterns
- **ENHANCED**: Clean CLI output by default showing only version and timestamp in human-readable format

### Changed
- **IMPROVED**: Ignored patterns are now hidden by default (use `--verbose` to show them)
- **ENHANCED**: CLI shows "FlatRepo v1.4.5 - [human readable date/time]" in normal mode
- **ENHANCED**: Tool signature updated to "FlatRepo v1.4.5" in generated markdown

### Technical Details
- Added `verbose` parameter to `generateDocs()` function (backward compatible)
- Enhanced CLI with better user experience for normal usage
- Maintained full backward compatibility for library usage

---

## [1.4.0] - 2025-09-10

### Changed
- **INTERNAL**: Complete architecture refactor to prepare for v2.0 library functionality
- **INTERNAL**: Separation of I/O operations (`getRepoData()`) from processing logic (`flatrepo()`)
- **ENHANCED**: Repository metadata now includes `kind` (local/remote) and absolute `path` for local repos
- **ENHANCED**: Extended statistics with `binaryFiles` count and `totalBytes` metrics
- **ENHANCED**: Tool signature updated to "FlatRepo v1.4" for version tracking

### Technical Details
- Introduced internal `getRepoData({ path })` function for filesystem operations
- Introduced internal `flatrepo(repoData, options)` function for pure markdown processing
- Added TypeScript interfaces for future v2.0 API (`RepoData`, `RepoMeta`, `FileData`)
- Added error classes `FlatrepoFetchError` and `FlatrepoProcessError` for improved error handling
- Improved file filtering with relative path matching for gitignore patterns

### Compatibility
- **✅ 100% BACKWARD COMPATIBLE**: CLI interface remains exactly the same
- **✅ IDENTICAL OUTPUT**: Generated markdown format unchanged (except enhanced metadata)
- **✅ SAME OPTIONS**: All existing CLI options work identically
- **✅ API COMPATIBLE**: `generateDocs()` function signature unchanged for library usage

### Performance
- **IMPROVED**: Better memory efficiency through internal streaming architecture
- **IMPROVED**: More accurate gitignore pattern matching
- **IMPROVED**: Cleaner output with automatic exclusion of development files

---

## [1.2.0] - 2025-09-09

### Added
- Initial stable release with core functionality
- CLI tool for generating repository documentation 
- Support for binary file inclusion with `--include-bin`
- Custom ignore patterns via `--ignore-patterns`
- Directory-specific documentation with `--dir`
- Gitignore pattern support
- YAML frontmatter with repository statistics
- Automatic file type detection and syntax highlighting

### Features
- Generates single markdown file with entire repository content
- Respects .gitignore patterns (including parent directories)  
- Binary file detection with optional descriptions
- Language detection for syntax highlighting
- Configurable output filename with timestamp defaults
- Cross-platform support (Windows, macOS, Linux)