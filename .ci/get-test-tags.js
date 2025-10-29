#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Load mapping
const mapping = JSON.parse(fs.readFileSync('.ci/package-tags.json', 'utf8'));

// Determine changed files via GitHub environment variables
const baseRef = process.env.GITHUB_BASE_REF || process.env.GITHUB_SHA + '~1';
const headRef = process.env.GITHUB_HEAD_REF || process.env.GITHUB_SHA;

// Use git diff to find changed files
let diffOutput = '';
try {
  diffOutput = execSync(`git diff --name-only ${baseRef}...${headRef}`, { encoding: 'utf8' });
} catch (err) {
  // fallback: maybe single commit
  diffOutput = execSync(`git diff --name-only ${headRef}~1 ${headRef}`, { encoding: 'utf8' });
}
const changedFiles = diffOutput.split('\n').filter(Boolean);

const tags = new Set();

for (const file of changedFiles) {
  for (const [pkgPath, pkgTags] of Object.entries(mapping)) {
    if (file.startsWith(pkgPath + '/')) {
      pkgTags.forEach(tag => tags.add(tag));
    }
  }
}

// Print comma separated tags (or empty)
const tagList = Array.from(tags).join(',');
console.log(tagList);
