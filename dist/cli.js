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
    return `flatrepo_${year}${month}${day}${hours}${minutes}${seconds}.md`;
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
    });
}, async (argv) => {
    const outputFile = argv.output || getDefaultFilename();
    try {
        await generateDocs(outputFile, argv.includeBin, argv.dir);
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
