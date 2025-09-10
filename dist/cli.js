#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { generateDocs } from './index.js';
function getDefaultFilename() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `flatrepo_${year}${month}${day}_${hours}${minutes}${seconds}.md`;
}
yargs(hideBin(process.argv))
    .command('$0 [output]', 'Generate repository documentation', (yargs) => {
    return yargs
        .positional('output', {
        describe: 'Output markdown file',
        type: 'string',
        default: getDefaultFilename()
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
}, async (argv) => {
    const outputFile = argv.output || getDefaultFilename();
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
        console.log(`FlatRepo v1.4.6 - ${humanTime}`);
    }
    else {
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
        console.log(`FlatRepo v1.4.6 - Verbose mode`);
        console.log(`${humanTime}`);
    }
    try {
        await generateDocs(outputFile, argv.includeBin, argv.dir, argv.ignorePatterns, argv.verbose);
        console.log(`FlatRepo generated successfully at: ${outputFile}`);
    }
    catch (error) {
        console.error('Error generating documentation:', error);
        process.exit(1);
    }
})
    .strict()
    .help()
    .parse();
