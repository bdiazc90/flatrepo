import { glob } from "glob";
import * as fs from "fs/promises";
import * as path from "path";
import { stringify } from "yaml";
import { FileInfo, RepoStats, PackageJson } from "./types/index.js";
import { BINARY_EXTENSIONS, EXTENSION_TO_LANGUAGE, getBinaryFileType } from "./utils/file-types.js";
import { DEFAULT_IGNORE_PATTERNS, getGitignorePatterns, shouldIgnoreFile } from "./utils/gitignore.js";

function getLanguageFromExtension(extension: string): string {
	return EXTENSION_TO_LANGUAGE[extension] || "";
}

async function getProjectFiles(outputPath: string, includeBin: boolean): Promise<FileInfo[]> {
	const files: FileInfo[] = [];

	const gitignorePatterns = await getGitignorePatterns();

	const ignorePatterns = [...DEFAULT_IGNORE_PATTERNS, ...gitignorePatterns, outputPath];

	console.log("Patrones ignorados:", ignorePatterns);

	try {
		const matches = await glob("**/*.*", {
			dot: true,
			nodir: true,
		});

		for (const match of matches) {
			if (match === outputPath) continue;

			if (shouldIgnoreFile(match, gitignorePatterns)) continue;
			try {
				const stat = await fs.stat(match);
				const extension = path.extname(match).toLowerCase();

				if (stat.isFile()) {
					if (BINARY_EXTENSIONS.has(extension)) {
						if (includeBin) {
							files.push({
								path: match,
								content: `(Archivo binario de ${getBinaryFileType(extension)})`,
								extension,
								isBinary: true,
							});
						}
					} else {
						const content = await fs.readFile(match, "utf-8");
						files.push({
							path: match,
							content,
							extension,
							isBinary: false,
						});
					}
				}
			} catch (error) {
				console.warn(`Advertencia: No se pudo procesar ${match}:`, error);
			}
		}
	} catch (error) {
		throw new Error(`Error al buscar archivos: ${error}`);
	}

	return files;
}

function calculateStats(files: FileInfo[]): RepoStats {
	const stats: RepoStats = {
		totalFiles: files.length,
		totalLines: 0,
		languages: {},
		fileTypes: {},
	};

	for (const file of files) {
		stats.totalLines += file.content.split("\n").length;

		stats.fileTypes[file.extension] = (stats.fileTypes[file.extension] || 0) + 1;

		const language = getLanguageFromExtension(file.extension);
		if (language) {
			stats.languages[language] = (stats.languages[language] || 0) + 1;
		}
	}

	return stats;
}

function generateHeader(files: FileInfo[], stats: RepoStats): string {
	const pkgFile = files.find((f) => f.path === "package.json");
	const pkgData: PackageJson = pkgFile ? JSON.parse(pkgFile.content) : {};

	const header = {
		repository: {
			name: pkgData.name || path.basename(process.cwd()),
			owner: "unknown",
			url: "",
		},
		generated: {
			timestamp: new Date().toISOString(),
			tool: "FlatRepo",
		},
		statistics: stats,
	};

	return `---\n${stringify(header)}---\n\n`;
}

function formatFileContent(file: FileInfo): string {
	const language = getLanguageFromExtension(file.extension);
	let content = `===  ${file.path}\n`;
	content += `\`\`\`${language}\n`;
	content += file.content;
	if (!file.content.endsWith("\n")) content += "\n";
	content += "```\n";
	content += `=== EOF: ${file.path}\n\n`;
	return content;
}

function generateMarkdown(files: FileInfo[], stats: RepoStats): string {
	const header = generateHeader(files, stats);
	const content = files.map(formatFileContent).join("");
	return header + content;
}

// Main function
export async function generateDocs(outputPath: string, includeBin: boolean = false): Promise<void> {
	try {
		const files = await getProjectFiles(outputPath, includeBin);
		const stats = calculateStats(files);
		const markdown = generateMarkdown(files, stats);
		await fs.writeFile(outputPath, markdown, "utf-8");
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw new Error(`Failed to generate documentation: ${error.message}`);
		} else {
			throw new Error("Failed to generate documentation: An unknown error occurred");
		}
	}
}

export { FileInfo, RepoStats };
