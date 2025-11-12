#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const isDry = args.includes('--dry');
const isApply = args.includes('--apply');

// Regex: matches "@scope/package@version" or "package@version"
// version part: optional ^~>=< followed by digits and dots/dashes
const regex = /("@?[\w\-\.\/]+)@[~^>=<]*[\d\w\.\-]+"/g;

function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.json', '.lock', '.txt', '.md', '.js', '.ts', '.tsx', '.jsx'].includes(ext)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const newContent = content.replace(regex, '$1"');

  if (content !== newContent) {
    if (isDry) {
      console.log(`[DRY] Would modify: ${filePath}`);
    } else if (isApply) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`[APPLIED] Modified: ${filePath}`);
    } else {
      console.log(`[FOUND] Matches in: ${filePath}`);
    }
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
        walkDir(fullPath);
      }
    } else {
      processFile(fullPath);
    }
  }
}

const rootDir = path.join(__dirname, '..');

if (!isDry && !isApply) {
  console.log('Usage: node remove-versions.js [--dry|--apply]');
  console.log('  --dry    : Preview changes (default)');
  console.log('  --apply  : Apply changes to files');
  process.exit(0);
}

console.log(`\n${isDry ? '[DRY RUN]' : '[APPLYING]'} Removing package versions...\n`);
walkDir(rootDir);
console.log('\nDone.\n');
