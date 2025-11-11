import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const targetBranch = process.env.DRONE_TARGET_BRANCH || 'master'

// INFO: 1 and 2 elements are node and script name respectively
const scriptDir = path.dirname(process.argv[1])
const suitesToCheck = process.argv[2]

const pacToTests = {
  'web-app-activities': [],
  'web-app-admin-settings': ['admin-settings', 'keycloak', 'smoke', 'user-settings'],
  'web-app-app-store': ['app-store'],
  'web-app-epub-reader': [],
  'web-app-external': ['app-provider'],
  'web-app-files': [
    'a11y',
    'admin-settings',
    'app-provider',
    'app-store',
    'file-action',
    'journeys',
    'keycloak',
    'navigation',
    'ocm',
    'oidc',
    'search',
    'shares',
    'smoke',
    'spaces',
    'user-settings'
  ],
  'web-app-ocm': ['ocm'],
  'web-app-password-protected-folders': ['file-action'],
  'web-app-pdf-viewer': [],
  'web-app-preview': ['spaces', 'shares', 'file-action', 'navigation', 'ocm'],
  'web-app-search': [
    'a11y',
    'admin-settings',
    'app-provider',
    'app-store',
    'file-action',
    'journeys',
    'keycloak',
    'navigation',
    'ocm',
    'oidc',
    'search',
    'shares',
    'smoke',
    'spaces',
    'user-settings'
  ],
  'web-app-text-editor': ['keycloak', 'oidc'],
  'web-app-webfinger': []
}

// get test suites
const testSuitesDir = `${scriptDir}/../e2e/cucumber/features`
const testSuites = fs
  .readdirSync(testSuitesDir)
  .filter((entry) => fs.statSync(path.join(testSuitesDir, entry)).isDirectory())

function getChangedFiles() {
  const changedFiles = execSync(`git diff --name-only origin/${targetBranch} HEAD`).toString()
  console.log('[INFO] Changed files:\n', changedFiles)
  return [...new Set([...changedFiles.split('\n')])].filter((file) => file)
}

function getPackageFromFile(file) {
  if (!file.startsWith('packages/')) {
    return
  }
  const packages = Object.keys(pacToTests)
  for (const pkg of packages) {
    if (file.startsWith(`packages/${pkg}`)) {
      return pkg
    }
  }
}

function getAffectedTestSuites(changedFiles) {
  const affectedSuites = new Set()
  for (const file of changedFiles) {
    if (
      file.startsWith('tests/e2e/') ||
      file.startsWith('tests/drone/') ||
      file === '.drone.star' ||
      file === 'package.json'
    ) {
      // run all test suites
      return testSuites
    }
    const packageName = getPackageFromFile(file)
    if (packageName && packageName in pacToTests) {
      pacToTests[packageName].forEach((suite) => affectedSuites.add(suite))
    }
  }
  return Array.from(affectedSuites)
}

function createSuitesToRunEnvFile(suites = []) {
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
    console.log('[INFO] No affected test suites to run.')
    process.exit(78) // Skip the pipeline
  }
  if (suitesToCheck) {
    const suitesToRun = suitesToCheck.split(',').filter((suite) => {
      suite = suite.trim()
      if (suite.startsWith('cucumber/')) {
        suite = suite.replace('cucumber/features/', '').split('/').shift()
      }
      return affectedTestSuites.includes(suite)
    })
    if (suitesToRun.length === 0) {
      console.log(
        '[INFO] The following test suites are not affected and will be skipped:',
        suitesToCheck.split(',').join('\n')
      )
      process.exit(78) // Skip the pipeline
    }
    createSuitesToRunEnvFile(suitesToRun)
    return
  }
  createSuitesToRunEnvFile(affectedTestSuites)
}

main()
