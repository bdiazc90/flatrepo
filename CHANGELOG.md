# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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