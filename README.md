# FlatRepo

A CLI tool for generating a full repository documentation into a single markdown file.

Very useful to load knowledge to your favorite AI Agent like **Claude AI Projects** or **ChatGPT Context**.

## Installation

```bash
npm install -D flatrepo
```

_Optional: You can set as script in your package.json_
```json
{
  "scripts": {
    "flatrepo": "flatrepo"
  }
}
```

## Usage
- Generate documentation in to default filename (flatrepo_YYYYMMDDHHIISS.md):
```bash
flatrepo
```

- Generate documentation in to a custom filename:
```bash
flatrepo myrepo.md
```

- Generate documentation including a description of binary files:
```bash
flatrepo myrepo.md --include-bin
```

- Generate documentation for a specific directory:
```bash
flatrepo myrepo.md --dir src
```

## Features

- Generates markdown documentation of your repository
- Includes YAML header with repository statistics
- Ignore binary files (images, videos, zip, etc...)
    - Include with description
- Respects .gitignore patterns
- Supports multiple file types
- Formats code blocks according to file type
