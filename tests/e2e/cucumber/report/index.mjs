import { Command } from 'commander'
import getRepoInfo from 'git-repo-info'
import reporter from 'cucumber-html-reporter'
import os from 'os'
import pkg from '../../../../package.json' with { type: 'json' }

const program = new Command()

program
  .option('--backend-version <semver>', 'version of used backend')
  .option('--environment <type>', 'test environment e.g. docker, local, remote ...')
  .option('--report-open', 'open report in browser', false)
  .option(
    '--report-location <path>',
    'location where the report gets generated to',
    'reports/e2e/cucumber/releaseReport/cucumber_report.html'
  )
  .option(
    '--report-input <path>',
    'location of generated cucumber json',
    'tests/e2e/cucumber/report/cucumber_report.json'
  )

program.parse()

const { backendName, backendVersion, environment, reportOpen, reportLocation, reportInput } =
  program.opts()
const repoInfo = getRepoInfo()

reporter.generate({
  theme: 'bootstrap',
  jsonFile: reportInput,
  output: reportLocation,
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: reportOpen,
  metadata: {
    'web-version': pkg.version,
    platform: os.platform(),
    repository: `${repoInfo.branch}`,
    ...(backendVersion && { ['ocis-version']: backendVersion }),
    ...(environment && { environment: environment })
  }
})
