# FlatRepo

A CLI tool for generating a full repository documentation into a single markdown file.

Very useful to load knowledge to your favorite AI Agent like **Claude AI Projects** or **ChatGPT Context**.

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

Generate documentation in to default filename (flatrepo_YYYYMMDDHHIISS.md):

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

## Features

- Generates markdown documentation of your repository
- Includes YAML header with repository statistics
- Ignore binary files (images, videos, zip, etc...)
  - Include with description
- Respects .gitignore patterns
- Supports multiple file types
- Formats code blocks according to file type
