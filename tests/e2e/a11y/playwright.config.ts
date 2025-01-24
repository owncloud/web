import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: 'a11y/**/*.spec.ts',
  use: {
    baseURL: 'https://host.docker.internal:9200'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], ignoreHTTPSErrors: true }
    }
  ]
})
