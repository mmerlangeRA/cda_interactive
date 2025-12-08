#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Function to run a command and return a promise
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

// Function to copy files from source to destination
function copyFiles(source, destination) {
  if (!fs.existsSync(source)) {
    console.error(`Source directory does not exist: ${source}`);
    return;
  }

  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const files = fs.readdirSync(source);
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyFiles(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${sourcePath} to ${destPath}`);
    }
  }
}

// Main function
async function main() {
  try {
    // Initial build
    console.log('Running initial build...');
    await runCommand('npx', ['tsc', '-b']);
    await runCommand('npx', ['vite', 'build']);
    copyFiles('dist/assets', '../backend/users/static/frontend/assets');
    
    // Copy PWA files
    console.log('Copying PWA files...');
    if (fs.existsSync('dist/manifest.json')) {
      fs.copyFileSync('dist/manifest.json', '../backend/users/static/frontend/manifest.json');
      console.log('Copied manifest.json');
    }
    if (fs.existsSync('dist/sw.js')) {
      fs.copyFileSync('dist/sw.js', '../backend/users/static/frontend/sw.js');
      console.log('Copied sw.js');
    }
    if (fs.existsSync('dist/icons')) {
      copyFiles('dist/icons', '../backend/users/static/frontend/icons');
      console.log('Copied icons directory');
    }

    // Set up file watcher for TypeScript files
    console.log('Watching for file changes...');
    
    // Start TypeScript in watch mode
    const tsc = spawn('npx', ['tsc', '-b', '--watch', '--preserveWatchOutput', '--watchFile', 'dynamicprioritypolling'], {
      stdio: ['inherit', 'pipe', 'inherit'],
      shell: true
    });

    let buffer = '';
    let buildInProgress = false;

    tsc.stdout.on('data', async (data) => {
      const output = data.toString();
      buffer += output;
      process.stdout.write(output);

      // Check if TypeScript compilation was successful
      if (buffer.includes('Found 0 errors') && !buildInProgress) {
        buffer = '';
        buildInProgress = true;
        
        try {
          console.log('\nTypeScript compilation successful. Running Vite build...');
          await runCommand('npx', ['vite', 'build']);
          console.log('Vite build successful. Copying assets...');
          copyFiles('dist/assets', '../backend/users/static/frontend/assets');
          
          // Copy PWA files
          if (fs.existsSync('dist/manifest.json')) {
            fs.copyFileSync('dist/manifest.json', '../backend/users/static/frontend/manifest.json');
          }
          if (fs.existsSync('dist/sw.js')) {
            fs.copyFileSync('dist/sw.js', '../backend/users/static/frontend/sw.js');
          }
          if (fs.existsSync('dist/icons')) {
            copyFiles('dist/icons', '../backend/users/static/frontend/icons');
          }
          console.log('Assets and PWA files copied successfully.');
        } catch (err) {
          console.error('Error during build or copy:', err);
        } finally {
          buildInProgress = false;
        }
      }
    });

    // Handle process termination
    process.on('SIGINT', () => {
      tsc.kill('SIGINT');
      process.exit(0);
    });
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
