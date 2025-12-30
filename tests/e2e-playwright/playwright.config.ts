import path from 'node:path'
import { defineConfig, devices, ReporterDescription } from '@playwright/test'
import { config } from '../e2e/config'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const reportsDir = path.resolve(__dirname, '../../', config.reportDir)

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Look for test files in the following directory, relative to this configuration file.
  testDir: 'specs',

  // Run all tests in parallel.
  fullyParallel: false,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 1 : 0,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    (process.env.CI && ['dot']) as ReporterDescription,
    (!process.env.CI && ['list']) as ReporterDescription,
    ['./reporters/a11y.ts', { outputFile: path.join(reportsDir, 'a11y-report.json') }]
  ].filter(Boolean) as ReporterDescription[],
  outputDir: reportsDir,

  use: {
    ignoreHTTPSErrors: true,

    // Collect trace when retrying the failed test.
    trace: config.reportTracing ? 'on' : 'on-first-retry'
  },
  // Configure projects for major browsers.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ]
})
