import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: process.env.CI === 'true',
  retries: process.env.CI === 'true' ? 2 : 0,
  workers: process.env.CI === 'true' ? 1 : undefined,
  reporter: 'html',

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }

    // Running these browsers currently produces an error in drone CI due to missing deps (even when they are installed first)
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] }
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] }
    // }

    // The mobile view of docs is currently pretty junky and causes various false negatives on mobile tests
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] }
    // },

    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] }
    // }
  ],

  webServer: {
    command: 'NODE_ENV=production pnpm start',
    url: 'http://127.0.0.1:6060',
    reuseExistingServer: process.env.CI !== 'true',
    // Timeout is intentionally pretty high here due to the server boot taking a long time
    timeout: 5 * 60 * 1000
  },

  use: {
    baseURL: 'http://127.0.0.1:6060'
  }
})
