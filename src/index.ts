// v1.5 - Refactored to use new architecture internally
// External API remains exactly the same for backward compatibility

import * as fs from "fs/promises";
import * as path from "path";
import { getRepoData, flatrepo } from "./v2-core.js";
import { FlatrepoOptions } from "./types/v2.js";
import { getGitModifiedFiles, isGitRepository } from "./utils/git.js";

// v2.0 PUBLIC API EXPORTS
export { getRepoData, flatrepo } from "./v2-core.js";

// Re-export v2 types for public use
export { 
  RepoSource, 
  RepoData, 
  RepoMeta, 
  FileData, 
  FlatrepoOptions,
  RepoStats,
  FlatrepoFetchError, 
  FlatrepoProcessError 
} from "./types/v2.js";

// Re-export v1 types for backward compatibility
export { FileInfo } from "./types/index.js";

/**
 * v1.5 Implementation: generateDocs using new architecture internally
 * External API remains exactly the same - users see no difference
 */
export async function generateDocs(
  outputPath: string,
  includeBin: boolean = false,
  dir: string = ".",
  ignorePatterns: string = "",
  verbose: boolean = false,
  onlyGitDiff: boolean = false
): Promise<void> {
  try {
    // v1.5: Use new architecture internally
    if (verbose) {
      console.log("Ignored patterns attached:", ignorePatterns || "(none)");
    }
    
    // Check if onlyGitDiff is requested
    let gitModifiedFiles: string[] = [];
    if (onlyGitDiff) {
      if (!isGitRepository(dir)) {
        throw new Error("--only-git-diff option requires a git repository");
      }
      gitModifiedFiles = getGitModifiedFiles(dir);
      if (gitModifiedFiles.length === 0) {
        console.log("No uncommitted changes found in git working directory");
        await fs.writeFile(outputPath, "# No uncommitted changes\n\nNo files with uncommitted changes were found in the git working directory.", "utf-8");
        return;
      }
      if (verbose) {
        console.log(`Found ${gitModifiedFiles.length} files with uncommitted changes`);
      }
    }

    // Step 1: Get repository data (replaces getProjectFiles)
    const repoData = await getRepoData({ path: dir }, verbose);

    // Step 2: Filter files based on criteria
    const filteredRepoData = {
      ...repoData,
      files: repoData.files.filter(file => {
        const fullPath = path.resolve(dir, file.path);
        const fullOutputPath = path.resolve(outputPath);

        // Always exclude output file
        if (fullPath === fullOutputPath) {
          return false;
        }

        // If onlyGitDiff is enabled, only include files in git diff
        if (onlyGitDiff) {
          return gitModifiedFiles.includes(fullPath);
        }

        return true;
      })
    };
    
    // Step 3: Process with flatrepo (replaces generateMarkdown + stats)
    const options: FlatrepoOptions = {
      includeBin,
      ignorePatterns,
    };

    // Pass onlyGitDiff flag through metadata extension
    if (onlyGitDiff) {
      (filteredRepoData as any).onlyGitDiff = true;
    }

    const markdown = await flatrepo(filteredRepoData, options, verbose);
    
    // Step 4: Write output (same as v1.2)
    await fs.writeFile(outputPath, markdown, "utf-8");
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate documentation: ${error.message}`);
    } else {
      throw new Error(
        "Failed to generate documentation: An unknown error occurred"
      );
    }
  }
}
