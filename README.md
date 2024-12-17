# FlatRepo

A CLI tool for generating a full repository documentation into a single markdown file.

Very useful to load knowledge to your favorite AI Agent like **Claude AI Projects** or **ChatGPT Context**.

## Installation

```bash
npm install -D flatrepo
```

## Usage
- Generate documentation with default filename (flatrepo_YYYYMMDDHHIISS.md):
```bash
flatrepo
```

- Generate documentation with custom filename:
```bash
flatrepo myrepo.md
```


## Features

- Generates markdown documentation of your repository
- Includes YAML header with repository statistics
- Respects .gitignore patterns
- Supports multiple file types
- Formats code blocks according to file type