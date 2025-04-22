import { Command } from 'commander'
import getRepoInfo from 'git-repo-info'
import reporter from 'multiple-cucumber-html-reporter'

const program = new Command()

program
  .option('--backend-version <semver>', 'version of used backend')
  .option('--environment <type>', 'test environment e.g. docker, local, remote ...')
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

const { backendVersion, environment, reportLocation, reportInput } =
  program.opts()
const repoInfo = getRepoInfo()

reporter.generate({
  jsonDir: reportLocation,
  reportPath: reportInput,
  customData: {
    title: "Run info",
    data: [
      { label: "Project", value: "web" },
      { label: "Web version", value: repoInfo.tag },
      { label: "Backend version", value: backendVersion },
      { label: "Environment", value: environment },
    ],
  }
});
