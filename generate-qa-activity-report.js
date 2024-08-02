import simpleGit from 'simple-git';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Command } from 'commander';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const git = simpleGit();
const program = new Command();

program
  .option('-d, --days <number>', 'number of days to look back')
  .option('-m, --month <number>', 'month to look back')
  .option('-y, --year <number>', 'year to look back')
  .parse(process.argv);

const options = program.opts();

function getGitDateFormat(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getStartAndEndDate(month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  return { startDate, endDate };
}

async function getRecentChanges() {
  try {
    const repoPath = path.resolve(__dirname);
    await git.cwd(repoPath);

    let formattedSinceDate, formattedUntilDate, period;

    if (options.month && options.year) {
      const { startDate, endDate } = getStartAndEndDate(options.month, options.year);
      formattedSinceDate = getGitDateFormat(startDate);
      formattedUntilDate = getGitDateFormat(endDate);
      period = `Month: ${options.month}, Year: ${options.year}`;
    } else if (options.days) {
      const today = new Date();
      today.setDate(today.getDate() - options.days);
      formattedSinceDate = getGitDateFormat(today);
      formattedUntilDate = getGitDateFormat(new Date());
      period = `Last ${options.days} days`;
    } else {
      console.error('Please provide either days or month and year.');
      return;
    }

    const reportDate = getGitDateFormat(new Date());

    const logOptions = {
      file: 'tests/e2e/cucumber/features',
      '--since': formattedSinceDate,
    };
    if (formattedUntilDate) {
      logOptions['--until'] = formattedUntilDate;
    }

    const logs = await git.log(logOptions);

    let addedLines = 0;
    let deletedLines = 0;
    const commits = [];

    for (const log of logs.all) {
      const diff = await git.diff([`${log.hash}~1`, log.hash, '--', 'tests/e2e/cucumber/features']);
      const diffLines = diff.split('\n');

      let commitAddedLines = 0;
      let commitDeletedLines = 0;
      const features = new Map(); // Track changes per feature file
      let currentFile = null;

      for (const line of diffLines) {
        if (line.startsWith('diff --git')) {
          const match = line.match(/ b\/(tests\/e2e\/cucumber\/features\/[^\s]+)/);
          if (match) {
            currentFile = match[1];
            if (!features.has(currentFile)) {
              features.set(currentFile, { addedLines: 0, deletedLines: 0 });
            }
          }
        } else if (line.startsWith('+++ b/')) {
          const match = line.match(/b\/(tests\/e2e\/cucumber\/features\/[^\s]+)/);
          if (match) {
            currentFile = match[1];
            if (!features.has(currentFile)) {
              features.set(currentFile, { addedLines: 0, deletedLines: 0 });
            }
          }
        } else if (line.startsWith('+') && !line.startsWith('+++')) {
          if (currentFile) {
            features.get(currentFile).addedLines += 1;
            commitAddedLines += 1;
          }
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          if (currentFile) {
            features.get(currentFile).deletedLines += 1;
            commitDeletedLines += 1;
          }
        }
      }

      addedLines += commitAddedLines;
      deletedLines += commitDeletedLines;

      commits.push({
        hash: log.hash,
        date: log.date,
        message: log.message,
        author: log.author_name,
        features: Array.from(features.entries()).map(([file, stats]) => ({
          file,
          ...stats
        })),
        addedLines: commitAddedLines,
        deletedLines: commitDeletedLines
      });
    }

    const reportContent = `
# QA Activity Report for ${period}
Date: ${reportDate}

## Summary
- **Added steps to the .feature files:** ${addedLines}
- **Deleted steps in the .feature files:** ${deletedLines}
- **Modified steps in the .feature files:** ${addedLines + deletedLines}

## Commits:
${commits.map(commit => `
### Commit: ${commit.hash}
- **Date:** ${commit.date}
- **Author:** ${commit.author}
- **Message:** ${commit.message}
${commit.features.map(feature => `
- **Feature:** ${feature.file}
  - **Added steps:** ${feature.addedLines}
  - **Deleted steps:** ${feature.deletedLines}
`).join('')}
- **Total Added steps:** ${commit.addedLines}
- **Total Deleted steps:** ${commit.deletedLines}
`).join('')}
    `;

    fs.writeFile('QA_Activity_Report.md', reportContent, (err) => {
      if (err) {
        console.error('Error writing report:', err);
      } else {
        console.log('Report generated successfully.');
      }
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

getRecentChanges();
