import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const targetBranch = process.env.DRONE_TARGET_BRANCH || 'master'

// paths that if changed will run all test suites
const mandatoryPaths = ['tests/e2e/', 'tests/drone/', '.drone.star', '.drone.env', 'package.json']

// INFO: 1 and 2 elements are node and script name respectively
const scriptDir = path.dirname(process.argv[1])
const suitesToCheck = process.argv[2]
  .split(',')
  .map((suite) => suite.trim())
  .filter((suite) => suite)

// list of test suites with dependent packages
// Example:
// {
//   'web-app-ocm': ['ocm'],
//   'web-app-search': ['search']
// }
const packageToTestSuiteMap = {}

/*
--------------------
 web packages
--------------------
 */
const excludePackages = ['web-container', 'web-test-helpers']
// default packages that affect all test suites
const defaultDependentPackages = ['design-system', 'web-client', 'web-runtime', 'web-pkg']
const packagesDir = `${scriptDir}/../../packages`
const allWebPackages = fs
  .readdirSync(packagesDir)
  .filter(
    (entry) =>
      entry.startsWith('web-') &&
      !defaultDependentPackages.includes(entry) &&
      fs.statSync(path.join(packagesDir, entry)).isDirectory() &&
      !excludePackages.includes(entry)
  )

/*
--------------------
 test suites
--------------------
 */
const testSuitesDir = `${scriptDir}/../e2e/cucumber/features`
const testSuites = fs.readdirSync(testSuitesDir).filter((entry) => {
  if (!fs.statSync(path.join(testSuitesDir, entry)).isDirectory()) {
    return false
  }
  const webPackagesFile = path.join(testSuitesDir, entry, 'web-packages.txt')
  if (fs.existsSync(webPackagesFile)) {
    const content = fs.readFileSync(webPackagesFile, 'utf-8')
    const depPackages = content.split('\n').filter((line) => line && line.startsWith('web-'))
    if (depPackages.length) {
      mapDependentPackagesToTestSuite(entry, depPackages)
      return
    }
  }
  // make all packages as dependent
  mapDependentPackagesToTestSuite(entry, allWebPackages)
  return
})

function mapDependentPackagesToTestSuite(testSuite, depPackages) {
  depPackages.forEach((pkg) => {
    if (!fs.existsSync(path.join(packagesDir, pkg))) {
      throw new Error(
        `Package "${pkg}" listed as dependent for test suite "${testSuite}" does not exist.\nPath: ${path.join(packagesDir, pkg)}`
      )
    }

    if (!(pkg in packageToTestSuiteMap)) {
      packageToTestSuiteMap[pkg] = []
    }
    !packageToTestSuiteMap[pkg].includes(testSuite) && packageToTestSuiteMap[pkg].push(testSuite)
  })
  defaultDependentPackages.forEach((pkg) => {
    if (!(pkg in packageToTestSuiteMap)) {
      packageToTestSuiteMap[pkg] = []
    }
    !packageToTestSuiteMap[pkg].includes(testSuite) && packageToTestSuiteMap[pkg].push(testSuite)
  })
}

function getChangedFiles() {
  const changedFiles = execSync(`git diff --name-only origin/${targetBranch} HEAD`).toString()
  console.log('[INFO] Changed files:\n', changedFiles)
  return [...new Set([...changedFiles.split('\n')])].filter((file) => file.trim())
}

function getPackageFromFile(file) {
  if (!file.startsWith('packages/')) {
    return
  }
  const packages = Object.keys(packageToTestSuiteMap)
  for (const pkg of packages) {
    if (file.startsWith(`packages/${pkg}`)) {
      return pkg
    }
  }
}

function getAffectedTestSuites(changedFiles) {
  const affectedSuites = new Set()
  for (const file of changedFiles) {
    if (mandatoryPaths.some((mandatoryPath) => file.startsWith(mandatoryPath))) {
      // run all test suites
      return testSuites
    }
    const packageName = getPackageFromFile(file)
    if (packageName && packageName in packageToTestSuiteMap) {
      packageToTestSuiteMap[packageName].forEach((suite) => affectedSuites.add(suite))
    }
  }
  return Array.from(affectedSuites)
}

function createSuitesToRunEnvFile(suites = []) {
  console.log('[INFO] Provided test suites/features:\n  - ' + suitesToCheck.join('\n  - '))
  console.log('[INFO] Test suites/features to run:\n  - ' + suites.join('\n  - '))
  const envContent = ['TEST_SUITES', suites.join(',')]
  if (suites[0].startsWith('cucumber/')) {
    envContent[0] = ['FEATURE_FILES']
  }
  // create suites.env file in the same directory as the script
  fs.writeFileSync(`${scriptDir}/suites.env`, envContent.join('='))
}

function main() {
  const changedFiles = getChangedFiles()
  if (changedFiles.length === 0) {
    console.log('[INFO] No changes detected.')
    process.exit(78) // Skip the pipeline
  }
  const affectedTestSuites = getAffectedTestSuites(changedFiles)
  if (affectedTestSuites.length === 0) {
    console.log('[INFO] No affected test suites/features to run.')
    process.exit(78) // Skip the pipeline
  }
  if (suitesToCheck.length) {
    const suitesToRun = suitesToCheck.filter((suite) => {
      suite = suite.trim()
      if (suite.startsWith('cucumber/')) {
        suite = suite.replace('cucumber/features/', '').split('/').shift()
      }
      return affectedTestSuites.includes(suite)
    })
    if (suitesToRun.length === 0) {
      console.log(
        '[INFO] The following test suites/features are not affected and will be skipped:\n  - ',
        suitesToCheck.join('\n  - ')
      )
      process.exit(78) // Skip the pipeline
    }
    createSuitesToRunEnvFile(suitesToRun)
    return
  }
  createSuitesToRunEnvFile(affectedTestSuites)
}

main()
