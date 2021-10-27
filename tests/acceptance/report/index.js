const { program, Option } = require('commander')
const getRepoInfo = require('git-repo-info')
const pkg = require('../../../package.json')
const reporter = require('cucumber-html-reporter')
const os = require('os')

program
  .addOption(
    new Option('--backend-name <name>', 'which backend is used')
      .default('ocis')
      .choices(['ocis', 'oc10'])
  )
  .option('--backend-version <semver>', 'version of used backend')
  .option('--environment <type>', 'test environment e.g. docker, local, remote ...')
  .option('--report-open', 'open report in browser', false)
  .option(
    '--report-location <path>',
    'location where the report gets generated to',
    'tests/report/cucumber_report.html'
  )
  .option(
    '--report-input <path>',
    'location of generated cucumber json',
    'tests/report/cucumber_report.json'
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
    ...(backendVersion && { [`${backendName}-verison`]: backendVersion }),
    ...(environment && { environment: environment })
  }
})
