#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PACKAGE_NAME = 'flatrepo';

function getCurrentVersion(): string | null {
  try {
    // Try to find package.json in current directory or parent directories
    let currentDir = process.cwd();

    while (currentDir !== path.dirname(currentDir)) {
      const packageJsonPath = path.join(currentDir, 'node_modules', PACKAGE_NAME, 'package.json');

      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        return packageJson.version;
      }

      currentDir = path.dirname(currentDir);
    }

    // Check global installation
    try {
      const globalVersion = execSync(`npm list -g ${PACKAGE_NAME} --json`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      });
      const data = JSON.parse(globalVersion);
      return data.dependencies?.[PACKAGE_NAME]?.version || null;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

function getLatestVersion(): string {
  try {
    const output = execSync(`npm view ${PACKAGE_NAME} version`, { encoding: 'utf-8' });
    return output.trim();
  } catch (error) {
    console.error(`❌ Failed to fetch latest version from npm registry`);
    process.exit(1);
  }
}

function isGlobalInstallation(): boolean {
  try {
    execSync(`npm list -g ${PACKAGE_NAME}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return true;
  } catch {
    return false;
  }
}

function isLocalInstallation(): boolean {
  let currentDir = process.cwd();

  while (currentDir !== path.dirname(currentDir)) {
    const packageJsonPath = path.join(currentDir, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      // Check devDependencies
      if (packageJson.devDependencies?.[PACKAGE_NAME]) {
        return true;
      }

      // Check dependencies
      if (packageJson.dependencies?.[PACKAGE_NAME]) {
        return true;
      }
    }

    currentDir = path.dirname(currentDir);
  }

  return false;
}

function upgrade() {
  console.log(`🔄 FlatRepo Upgrade Utility\n`);

  const currentVersion = getCurrentVersion();
  const latestVersion = getLatestVersion();

  if (!currentVersion) {
    console.log(`⚠️  FlatRepo is not installed. Install it with:`);
    console.log(`    npm install -D ${PACKAGE_NAME}  (for local project)`);
    console.log(`    npm install -g ${PACKAGE_NAME}  (for global use)`);
    process.exit(0);
  }

  console.log(`📦 Current version: ${currentVersion}`);
  console.log(`🆕 Latest version:  ${latestVersion}`);

  if (currentVersion === latestVersion) {
    console.log(`\n✅ You are already on the latest version!`);
    process.exit(0);
  }

  console.log(`\n🚀 Upgrading FlatRepo from ${currentVersion} to ${latestVersion}...\n`);

  try {
    const isGlobal = isGlobalInstallation();
    const isLocal = isLocalInstallation();

    if (isGlobal) {
      console.log(`📍 Upgrading global installation...`);
      execSync(`npm install -g ${PACKAGE_NAME}@latest`, {
        stdio: 'inherit'
      });
      console.log(`✅ Global installation upgraded successfully!`);
    }

    if (isLocal) {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      let packageJson;

      // Find the project's package.json
      let currentDir = process.cwd();
      let foundPackageJson = false;

      while (currentDir !== path.dirname(currentDir)) {
        const pkgPath = path.join(currentDir, 'package.json');

        if (fs.existsSync(pkgPath)) {
          packageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

          if (packageJson.devDependencies?.[PACKAGE_NAME] || packageJson.dependencies?.[PACKAGE_NAME]) {
            foundPackageJson = true;
            console.log(`📍 Upgrading local installation in ${currentDir}...`);

            const isDevDep = !!packageJson.devDependencies?.[PACKAGE_NAME];
            const installCmd = isDevDep
              ? `npm install -D ${PACKAGE_NAME}@latest`
              : `npm install ${PACKAGE_NAME}@latest`;

            execSync(installCmd, {
              cwd: currentDir,
              stdio: 'inherit'
            });

            console.log(`✅ Local installation upgraded successfully!`);
            break;
          }
        }

        currentDir = path.dirname(currentDir);
      }

      if (!foundPackageJson) {
        console.log(`⚠️  Could not find local package.json with ${PACKAGE_NAME}`);
      }
    }

    console.log(`\n🎉 FlatRepo has been upgraded to ${latestVersion}!`);
    console.log(`\nRun 'flatrepo --help' to see all available options.`);

    // Show changelog highlights
    console.log(`\n📝 What's new in v${latestVersion}:`);
    console.log(`   Run 'flatrepo --version' to see the current version`);
    console.log(`   Check https://github.com/bdiazc90/flatrepo/blob/main/CHANGELOG.md for full details\n`);

  } catch (error: any) {
    console.error(`\n❌ Upgrade failed: ${error.message}`);
    console.error(`\nYou can manually upgrade with:`);

    if (isGlobalInstallation()) {
      console.error(`    npm install -g ${PACKAGE_NAME}@latest`);
    }

    if (isLocalInstallation()) {
      console.error(`    npm install -D ${PACKAGE_NAME}@latest`);
    }

    process.exit(1);
  }
}

// Run the upgrade
upgrade();