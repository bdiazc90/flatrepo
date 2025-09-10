// v1.5 - Refactored to use new architecture internally
// External API remains exactly the same for backward compatibility

import * as fs from "fs/promises";
import * as path from "path";
import { getRepoData, flatrepo } from "./v2-core.js";
import { FlatrepoOptions } from "./types/v2.js";

// Re-export v1 types for backward compatibility
export { FileInfo, RepoStats } from "./types/index.js";

/**
 * v1.5 Implementation: generateDocs using new architecture internally
 * External API remains exactly the same - users see no difference
 */
export async function generateDocs(
  outputPath: string,
  includeBin: boolean = false,
  dir: string = ".",
  ignorePatterns: string = ""
): Promise<void> {
  try {
    // v1.5: Use new architecture internally
    console.log("Ignored patterns:", ignorePatterns || "(none)");
    
    // Step 1: Get repository data (replaces getProjectFiles)
    const repoData = await getRepoData({ path: dir });
    
    // Step 2: Filter out outputPath from files (same as v1.2 behavior)
    const filteredRepoData = {
      ...repoData,
      files: repoData.files.filter(file => {
        const fullPath = path.resolve(dir, file.path);
        const fullOutputPath = path.resolve(outputPath);
        return fullPath !== fullOutputPath;
      })
    };
    
    // Step 3: Process with flatrepo (replaces generateMarkdown + stats)
    const options: FlatrepoOptions = {
      includeBin,
      ignorePatterns,
    };
    
    const markdown = await flatrepo(filteredRepoData, options);
    
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
