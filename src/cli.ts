#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { generateDocs } from './index.js';
import { getRepoData, flatrepo } from './v2-core.js';
import { RepoSource } from './types/v2.js';
import * as fs from 'fs/promises';

function getDefaultFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `flatrepo_${year}${month}${day}_${hours}${minutes}${seconds}.md`;
}

/**
 * Generate documentation from GitHub repository (v2.0 functionality)
 */
async function generateDocsFromGitHub(
  url: string,
  outputPath: string,
  includeBin: boolean = false,
  ignorePatterns: string = "",
  verbose: boolean = false
): Promise<void> {
  try {
    // Step 1: Get repository data from GitHub  
    const source: RepoSource = { url };
    const repoData = await getRepoData(source, verbose);
    
    // Step 2: Process with flatrepo
    const options = {
      includeBin,
      ignorePatterns,
    };
    
    const markdown = await flatrepo(repoData, options, verbose);
    
    // Step 3: Write output
    await fs.writeFile(outputPath, markdown, "utf-8");
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate documentation from GitHub: ${error.message}`);
    } else {
      throw new Error(
        "Failed to generate documentation from GitHub: An unknown error occurred"
      );
    }
  }
}

interface Arguments {
  output?: string;
  githubFile?: string;
  includeBin?: boolean;
  dir?: string;
  ignorePatterns?: string;
  verbose?: boolean;
}

yargs(hideBin(process.argv))
  .command<Arguments>(
    '$0 [output] [githubFile]',
    'Generate repository documentation from local directory or GitHub URL',
    (yargs) => {
      return yargs
      .positional('output', {
        describe: 'Output markdown file or GitHub URL (if first arg is URL, this becomes output file)',
        type: 'string',
        default: getDefaultFilename()
      })
      .positional('githubFile', {
        describe: 'Output file when first argument is a GitHub URL',
        type: 'string'
      })
      .option('include-bin', {
        type: 'boolean',
        describe: 'Include binary files with description',
        default: false
      })
      .option('dir', {
        type: 'string',
        describe: 'Specific directory to document',
        default: '.'
      })
      .option('ignore-patterns', {
        type: 'string',
        describe: 'Additional patterns to ignore (comma separated)',
        default: ''
      })
      .option('verbose', {
        type: 'boolean',
        describe: 'Show detailed output including ignored patterns',
        default: false
      });
    },
    async (argv) => {
      // Detect if first argument is a GitHub URL
      const firstArg = argv.output;
      const isGitHubUrl = firstArg && (
        firstArg.startsWith('https://github.com/') || 
        firstArg.startsWith('http://github.com/') ||
        firstArg.startsWith('git@github.com:')
      );
      
      let outputFile: string;
      let sourceUrl: string | undefined;
      
      if (isGitHubUrl) {
        // First arg is GitHub URL, second arg (if exists) is output file
        sourceUrl = firstArg;
        outputFile = argv.githubFile || getDefaultFilename();
      } else {
        // Traditional usage: first arg is output file
        outputFile = firstArg || getDefaultFilename();
        sourceUrl = undefined;
      }
      
      // Show version and timestamp info only in normal mode (not verbose)  
      if (!argv.verbose) {
        const now = new Date();
        const humanTime = now.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        });
        console.log(`FlatRepo v2.0.0 - ${humanTime}`);
      } else {
        // En verbose, mostrar el output original con timestamp
        const now = new Date();
        const humanTime = now.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        });
        console.log(`FlatRepo v2.0.0 - Verbose mode`);
        console.log(`${humanTime}`);
      }
      
      try {
        if (sourceUrl) {
          // New v2.0 functionality: GitHub URL
          console.log(`📦 Documenting GitHub repository: ${sourceUrl}`);
          await generateDocsFromGitHub(sourceUrl, outputFile, argv.includeBin, argv.ignorePatterns, argv.verbose);
        } else {
          // Traditional v1.x functionality: local directory  
          await generateDocs(outputFile, argv.includeBin, argv.dir as string, argv.ignorePatterns, argv.verbose);
        }
        console.log(`FlatRepo generated successfully at: ${outputFile}`);
      } catch (error) {
        console.error('Error generating documentation:', error);
        process.exit(1);
      }
    }
  )
  .strict()
  .help()
  .parse();
