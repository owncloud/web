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
      period = `${options.month}_${options.year}`;
    } else if (options.days) {
      const today = new Date();
      today.setDate(today.getDate() - options.days);
      formattedSinceDate = getGitDateFormat(today);
      formattedUntilDate = getGitDateFormat(new Date());
      period = `Last_${options.days}_days`;
    } else {
      console.error('Please provide either days or month and year.');
      return;
    }

    const logOptions = {
      file: 'tests/e2e/cucumber/features',
      '--since': formattedSinceDate,
    };
    if (formattedUntilDate) {
      logOptions['--until'] = formattedUntilDate;
    }

    const logs = await git.log(logOptions);

    const csvRows = [
      ['Test-Type', 'Date', 'Tests Added', 'Tests Changed', 'Tests Deleted', 'commit-ID']
    ];

    for (const log of logs.all) {
      const diff = await git.diff([`${log.hash}~1`, log.hash, '--', 'tests/e2e/cucumber/features']);
      const diffLines = diff.split('\n');

      let commitAddedTests = 0;
      let commitChangedTests = 0;
      let commitDeletedTests = 0;

      let currentFile = null;

      for (const line of diffLines) {
        if (line.startsWith('diff --git')) {
          const match = line.match(/ b\/(tests\/e2e\/cucumber\/features\/[^\s]+)/);
          if (match) {
            currentFile = match[1];
          }
        } else if (line.startsWith('+') && !line.startsWith('+++')) {
          // Consider only the addition of scenarios or features. Example: +  Scenario: activity
          if (line.includes('Scenario:') || line.includes('Feature:')) {
            commitAddedTests += 1;
          }
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          // Consider only the deleting of scenarios or features. Example: -  Scenario: activity
          if (line.includes('Scenario:') || line.includes('Feature:')) {
            commitDeletedTests += 1;
          }
        } else if ((line.includes('@@ Feature:')) && currentFile) {
          // if line contains 'Feature', that is test change. Example @@ -17,8 +17,8 @@ Feature: Download
          commitChangedTests += 1;
        }
      }

      csvRows.push([
        'UI Test',
        log.date,
        commitAddedTests,
        commitChangedTests,
        commitDeletedTests,
        log.hash
      ]);
    }

    const csvContent = csvRows.map(row => row.join(',')).join('\n');

    fs.writeFile(`QA_Activity_Report_${period}.csv`, csvContent, (err) => {
      if (err) {
        console.error('Error writing CSV report:', err);
      } else {
        console.log('CSV report generated successfully.');
      }
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

getRecentChanges();
