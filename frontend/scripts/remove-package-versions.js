#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.argv[2] || path.join(__dirname, '..'); // default: frontend folder
const dry = process.argv.includes('--dry');
const apply = process.argv.includes('--apply');

const exts = new Set(['.json', '.lock', '.md', '.txt', '.js', '.ts', '.tsx', '.jsx', '.yaml', '.yml', '.env', '.ini']);

function shouldProcess(filePath) {
  return exts.has(path.extname(filePath).toLowerCase());
}

function walk(dir, list = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      walk(full, list);
    } else {
      if (shouldProcess(full)) list.push(full);
    }
  }
  return list;
}

// Regex explanation:
//  - group1: package name (scoped or unscoped) up to the last @
//  - matches occurrences like "pkg@1.2.3", "@scope/pkg@^1.2.3", "pkg@~1.2.3-beta"
//  - avoids matching emails because version part must start with a digit
const regex = /(@?[^@\s'"]+?)@(?:[=<>~^]*)?([0-9][^'\s",)\]]*)/g;

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  const newContent = content.replace(regex, (match, p1, p2) => {
    // Avoid transforming if p1 looks like a url protocol e.g., http, https (rare)
    const lower = p1.toLowerCase();
    if (lower === 'http' || lower === 'https' || lower.endsWith(':')) return match;
    changed = true;
    return p1;
  });
  if (changed) {
    if (dry && !apply) {
      console.log(`[DRY] Would change: ${file}`);
    } else if (apply) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`[APPLIED] Updated: ${file}`);
    } else {
      console.log(`[FOUND] Matches in: ${file} (run with --apply to modify)`);
    }
  }
}

function main() {
  if (!dry && !apply) {
    console.log('No mode specified. Use --dry to preview or --apply to modify files.');
    console.log('Example: node scripts/remove-package-versions.js --dry');
    console.log('         node scripts/remove-package-versions.js --apply');
  }
  const files = walk(root);
  for (const file of files) {
    try {
      processFile(file);
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }
  console.log('Done.');
}

main();
