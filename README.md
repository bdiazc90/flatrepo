# FlatRepo

A CLI tool for generating a full repository documentation into a single markdown file.

Very useful to upload knowledge to your favorite AI Agent like **Claude AI** or **ChatGPT**.

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

Generate documentation in to default filename (flatrepo_YYYYMMDD_HHIISS.md):

```bash
flatrepo
```

Generate documentation in to a custom filename:

```bash
flatrepo myrepo-flat.md
```

> **Note**: Files matching any of these patterns are automatically ignored to prevent recursive inclusion in subsequent runs:
>
> - `flatrepo_*.md` (default output files)
> - `*_flat.md` or `*-flat.md` (use one of these for custom filenames)
>
> Use custom filenames carefully, to prevent doubling the output size with each run!

Generate documentation including a description of binary files:

```bash
flatrepo --include-bin
```

- Generate documentation for a specific directory:
```bash
flatrepo --dir src
```

- Ignore specific file patterns (comma separated):
```bash
flatrepo --ignore-patterns="*.sql,*.log"
```

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
