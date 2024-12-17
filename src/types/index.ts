export interface FileInfo {
	path: string;
	content: string;
	extension: string;
	isBinary?: boolean;
}

export interface RepoStats {
	totalFiles: number;
	totalLines: number;
	languages: { [key: string]: number };
	fileTypes: { [key: string]: number };
}

export interface PackageJson {
	name?: string;
	[key: string]: unknown;
}
