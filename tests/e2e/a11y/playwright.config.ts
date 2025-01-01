import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: 'a11y/**/*.spec.ts',
  use: {
    baseURL: 'https://host.docker.internal:9200',
    personal: '/files/spaces/personal',
    shares: '/files/shares/with-me',
    spaces: '/files/spaces/projects',
    deleted: '/files/trash/personal'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], ignoreHTTPSErrors: true }
    }
  ]
})
