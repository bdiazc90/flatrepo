# FlatRepo

A CLI tool and library for generating repository documentation into a single markdown file from both local and remote repositories.

Very useful to upload knowledge to your favorite AI Agent like **Claude AI** or **ChatGPT**.

## ✨ v2.2.1 Features

- 🏠 **Local repositories**: Document any directory on your filesystem
- 🌐 **GitHub repositories**: Document any public GitHub repository directly
- 🌳 **Directory tree**: Visual repository structure in YAML header
- 📚 **Library API**: Use as a Node.js library in your projects
- 🔧 **CLI tool**: Same familiar command-line interface

## Installation

### Local Installation (Recommended for projects)

```bash
npm install -D flatrepo
```

### Global Installation (Use from anywhere)

```bash
npm install -g flatrepo
```

After global installation, you can use `flatrepo` command from any directory.

### 🔄 Upgrading to Latest Version

When a new version is released, you can easily upgrade using:

```bash
# Using npx (recommended - no installation needed)
npx flatrepo-upgrade

# Or if you have flatrepo installed
flatrepo-upgrade
```

The upgrade utility will:
- Detect your current version (local or global)
- Compare with the latest version on npm
- Automatically upgrade if a newer version is available
- Show what's new in the latest version

### Optional: Add as npm script

```json
{
  "scripts": {
    "flatrepo": "flatrepo"
  }
}
```

## Usage

### 🔧 CLI Usage

Generate documentation from current directory:

```bash
flatrepo
```

Generate documentation from a specific local directory:

```bash
flatrepo --dir src
```

Generate documentation from a GitHub repository:

```bash
flatrepo https://github.com/user/repo output.md
```

### 📚 Library Usage (v2.0)

```typescript
import { getRepoData, flatrepo } from 'flatrepo';

// Document a local directory
const localRepo = await getRepoData({ path: './src' });
const markdown = await flatrepo(localRepo);

// Document a GitHub repository  
const githubRepo = await getRepoData({ 
  url: 'https://github.com/user/repo',
  ref: 'main' // optional, defaults to default branch
});
const markdown = await flatrepo(githubRepo, {
  includeBin: false,
  ignorePatterns: '*.log,dist/*'
});

console.log(markdown);
```

### 🛠️ CLI Options

- **Custom filename**: `flatrepo myrepo-flat.md`
- **Include binary files**: `flatrepo --include-bin`
- **Specific directory**: `flatrepo --dir src`
- **Ignore patterns**: `flatrepo --ignore-patterns="*.sql,*.log"`
- **Verbose output**: `flatrepo --verbose`
- **GitHub repository**: `flatrepo https://github.com/user/repo`
- **Only git changes**: `flatrepo --only-git-diff` (v2.2+)

> **Note**: Files matching patterns like `flatrepo_*.md`, `*_flat.md` or `*-flat.md` are automatically ignored to prevent recursive inclusion.

## Features

- Generates markdown documentation of your repository
- Includes YAML header with repository statistics and **directory tree structure**
- **Directory tree visualization** - ASCII tree showing complete repository structure
- Ignore binary files (images, videos, zip, etc...)
  - Include with description
- Respects .gitignore patterns
- Supports multiple file types
- Formats code blocks according to file type
- Specify a single directory to document instead of the entire repository
- Specify custom patterns to ignore with the --ignore-patterns option
- Show detailed processing information with --verbose option
- **Git diff mode** (v2.2+) - Document only files with uncommitted changes

## 🌳 Directory Tree Feature (v2.1+)

The generated markdown now includes a visual directory tree in the YAML header:

```yaml
---
repository:
  name: my-project
  kind: local
generated:
  timestamp: 2025-09-15T10:30:00Z
  tool: FlatRepo v2.1.1
statistics:
  totalFiles: 12
  totalLines: 450
directory_tree: |-
  .
  ├── src/
  │   ├── components/
  │   │   ├── Header.tsx
  │   │   └── Footer.tsx
  │   ├── utils/
  │   │   └── helpers.ts
  │   └── index.ts
  ├── tests/
  │   └── utils.test.ts
  ├── package.json
  └── README.md
---
```

This provides an instant overview of your repository structure, making it easier for AI agents to understand the codebase organization.

## 📝 Git Diff Mode (v2.2+)

The `--only-git-diff` option allows you to generate documentation only for files with uncommitted changes in your git working directory:

```bash
# Document only modified, added, or deleted files
flatrepo --only-git-diff

# Combine with other options
flatrepo --only-git-diff --include-bin output.md
```

This is particularly useful when:
- You want to quickly review recent changes with an AI assistant
- You need to document only the work in progress
- You want to reduce the context size by focusing on current modifications

**Note**: This option requires the directory to be a git repository. If no uncommitted changes are found, a minimal document will be generated indicating no changes.
