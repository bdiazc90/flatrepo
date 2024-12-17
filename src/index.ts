import { glob } from "glob";
import * as fs from "fs/promises";
import * as path from "path";
import { stringify } from "yaml";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Types
interface FileInfo {
	path: string;
	content: string;
	extension: string;
}

interface RepoStats {
	totalFiles: number;
	totalLines: number;
	languages: { [key: string]: number };
	fileTypes: { [key: string]: number };
}

interface PackageJson {
	name?: string;
	[key: string]: unknown;
}

// Constants
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
	".js": "javascript",
	".jsx": "jsx",
	".ts": "typescript",
	".tsx": "tsx",
	".md": "markdown",
	".html": "html",
	".css": "css",
	".json": "json",
};

const IGNORE_PATTERNS = ["node_modules/**", ".gitignore", ".git/**", "dist/**", ".next/**"];

// Constantes para las extensiones
const BINARY_EXTENSIONS = new Set([
	// Imágenes
	".jpg",
	".jpeg",
	".png",
	".gif",
	".bmp",
	".ico",
	".webp",
	".svg",
	".tiff",
	// Videos
	".mp4",
	".mov",
	".avi",
	".mkv",
	".wmv",
	".flv",
	".webm",
	// Audio
	".mp3",
	".wav",
	".ogg",
	".m4a",
	".flac",
	".aac",
	// Documentos
	".pdf",
	".doc",
	".docx",
	".xls",
	".xlsx",
	".ppt",
	".pptx",
	// Comprimidos
	".zip",
	".rar",
	".7z",
	".tar",
	".gz",
	// Binarios
	".exe",
	".dll",
	".so",
	".dylib",
	// Fonts
	".ttf",
	".otf",
	".woff",
	".woff2",
	".eot",
]);

async function getGitignorePatterns(): Promise<string[]> {
	try {
		const gitignoreContent = await fs.readFile(".gitignore", "utf-8");
		const patterns = gitignoreContent
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith("#"))
			.map((pattern) => (pattern.endsWith("/") ? `${pattern}**` : pattern));
		return patterns;
	} catch (error) {
		console.log("No se encontró .gitignore");
		return [];
	}
}

// Utility functions
function getLanguageFromExtension(extension: string): string {
	return EXTENSION_TO_LANGUAGE[extension] || "";
}

async function getProjectFiles(outputPath: string): Promise<FileInfo[]> {
	const files: FileInfo[] = [];

	const gitignorePatterns = await getGitignorePatterns();

	const ignorePatterns = [...IGNORE_PATTERNS, ...gitignorePatterns, outputPath];

	console.log("Patrones ignorados:", ignorePatterns);

	try {
		const matches = await glob("**/*.*", {
			ignore: ignorePatterns,
			dot: true,
			nodir: true, // Añadimos esta opción para ignorar directorios
		});

		for (const match of matches) {
			try {
				const stat = await fs.stat(match);
				const extension = path.extname(match).toLowerCase();

				if (stat.isFile() && !BINARY_EXTENSIONS.has(extension)) {
					try {
						const content = await fs.readFile(match, "utf-8");
						files.push({
							path: match,
							content,
							extension,
						});
					} catch (error) {
						console.warn(`Advertencia: El archivo ${match} parece ser binario y será ignorado`);
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
		// Count lines
		stats.totalLines += file.content.split("\n").length;

		// Count file types
		stats.fileTypes[file.extension] = (stats.fileTypes[file.extension] || 0) + 1;

		// Count languages
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
export async function generateDocs(outputPath: string): Promise<void> {
	try {
		const files = await getProjectFiles(outputPath);
		const stats = calculateStats(files);
		const markdown = generateMarkdown(files, stats);
		await fs.writeFile(outputPath, markdown, "utf-8");
	} catch (error: unknown) {
		// Manejo más seguro del error
		if (error instanceof Error) {
			throw new Error(`Failed to generate documentation: ${error.message}`);
		} else {
			throw new Error("Failed to generate documentation: An unknown error occurred");
		}
	}
}

export { FileInfo, RepoStats };
