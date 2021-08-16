const { version } = require('../../package.json')
const reporter = require('cucumber-html-reporter')
const readline = require('readline')
const os = require('os')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const options = {
  theme: 'bootstrap',
  jsonFile: 'tests/report/cucumber_report.json',
  output: 'tests/report/cucumber_report.html',
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: true,
  metadata: {
    'web version': version,
    platform: os.type()
  }
}

const question1 = () => {
  return new Promise((resolve, reject) => {
    rl.question('What version of ocis? ', ocisVersion => {
      options.metadata.ocisVersion = ocisVersion
      resolve()
    })
  })
}

const question2 = () => {
  return new Promise((resolve, reject) => {
    rl.question('What version of ownCloud? ', (oc10Version = 'oc10') => {
      options.metadata.oc10Version = oc10Version
      resolve()
    })
  })
}

const question3 = () => {
  return new Promise((resolve, reject) => {
    rl.question('What your enviroment? (docker or local)', env => {
      options.metadata.environment = env
      resolve()
    })
  })
}

const question4 = () => {
  return new Promise((resolve, reject) => {
    rl.question('What your git branch? ', branch => {
      options.metadata.branch = branch
      resolve()
    })
  })
}

const question5 = () => {
  return new Promise((resolve, reject) => {
    rl.question('What browser and version? ', browser => {
      options.metadata.browser = browser
      resolve()
    })
  })
}

const main = async () => {
  await question1()
  await question2()
  await question3()
  await question4()
  await question5()
  rl.close()
  reporter.generate(options)
}
main()
