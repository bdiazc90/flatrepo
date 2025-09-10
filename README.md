# FlatRepo

A CLI tool and library for generating repository documentation into a single markdown file from both local and remote repositories.

Very useful to upload knowledge to your favorite AI Agent like **Claude AI** or **ChatGPT**.

## ✨ v2.0 Features

- 🏠 **Local repositories**: Document any directory on your filesystem
- 🌐 **GitHub repositories**: Document any public GitHub repository directly
- 📚 **Library API**: Use as a Node.js library in your projects  
- 🔧 **CLI tool**: Same familiar command-line interface

## Installation

```bash
npm install -D flatrepo
```

Optional: You can set as script in your package.json

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

> **Note**: Files matching patterns like `flatrepo_*.md`, `*_flat.md` or `*-flat.md` are automatically ignored to prevent recursive inclusion.

## Features

- Generates markdown documentation of your repository
- Includes YAML header with repository statistics
- Ignore binary files (images, videos, zip, etc...)
  - Include with description
- Respects .gitignore patterns
- Supports multiple file types
- Formats code blocks according to file type
- Specify a single directory to document instead of the entire repository
- Specify custom patterns to ignore with the --ignore-patterns option
- Show detailed processing information with --verbose option
