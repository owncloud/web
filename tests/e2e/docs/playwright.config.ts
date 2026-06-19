import { defineConfig } from '@playwright/test'

// Standalone Playwright config for the documentation screenshot capture tool.
// It reuses the repository's Playwright install. Point OCIS_URL at a running
// ownCloud Web / oCIS instance (defaults to https://localhost:9200, admin/admin);
// override credentials with OCIS_USER / OCIS_PASSWORD.
export default defineConfig({
  testDir: '.',
  testMatch: 'capture.spec.ts',
  outputDir: './test-results',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  timeout: 120_000,
  use: {
    baseURL: process.env.OCIS_URL ?? 'https://localhost:9200',
    ignoreHTTPSErrors: true,
    headless: true,
    viewport: { width: 1440, height: 900 }
  }
})
