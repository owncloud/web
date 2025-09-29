import { expect, test } from '@playwright/test'
import { config as e2eConfig } from '../../e2e/config.js'
import { promises as fs } from 'fs'
import path from 'path'

// This test overrides the runtime config by intercepting /config.json and fulfilling it
// with the contents of the repo's web container config. It then opens the oCIS home
// page and takes a screenshot once the page has finished loading.
test('kw-bridge with config override.json', async ({ page }) => {  
  const overrideConfigPath = path.resolve(process.cwd(), 'packages/web-container/config.kw-bridge.json')
  try {
    await fs.access(overrideConfigPath)
  } catch {
    throw new Error('Missing packages/web-container/config.kw-bridge.json')
  }

  await page.route('**/config.json', async (route) => {
    const raw = await fs.readFile(overrideConfigPath, 'utf-8')
    const payload = JSON.parse(raw)
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(payload)
    })
  })

  const response = await page.goto(e2eConfig.baseUrl, { waitUntil: 'load' })

  // Assert main navigation succeeded (no 404/5xx)
  expect(response, 'navigation response should be defined').toBeTruthy()
  expect(response!.ok(), `Expected navigation 2xx/3xx but got ${response?.status()} ${response?.statusText()}`).toBeTruthy()

  await page.waitForLoadState('networkidle')

  // Sanity check content does not include common 404 markers
  const html = await page.content()
  expect(html).not.toMatch(/\b(404|not found)\b/i)

  // ------------------------------------------------------------
  // Login view  
  // Email input
  const login = process.env.KW_LOGIN
  const password = process.env.KW_PASSWORD
  expect(login, 'KW_LOGIN env var is required').toBeTruthy()
  expect(password, 'KW_PASSWORD env var is required').toBeTruthy()
  
  const emailInput = page.locator('#email')
  await expect(emailInput).toBeVisible() // assert that Kiteworks login view loaded
  await emailInput.waitFor({ state: 'visible' })
  await emailInput.fill(login!)
  await expect(emailInput).toHaveValue(login!)

  // Press "Next"
  await page.click('button:has-text("Next")')

  // Fill password
  await page.fill('#password', password!)

  // Press "Sign in"
  await page.waitForSelector('button:has-text("Sign in")', { state: 'visible' })
  await page.click('button:has-text("Sign in")')

  // ------------------------------------------------------------
  // Grant view
  await page.locator('#btnAccept').waitFor({ state: 'visible' })
  await page.click('#btnAccept')

  // ------------------------------------------------------------
  // Home space view
  // Wait for the space files table to load
  const spaceFilesTable = page.locator('tbody.has-item-context-menu');
  await spaceFilesTable.waitFor({ state: 'visible' });

  // Verify the presence of a specific file in the table
  const fileName = 'upload-PUT.txt';
  await expect(page.locator('main#files')).toContainText(fileName, { timeout: 30000 });

  
  // ------------------------------------------------------------
  // Attach screenshot to the test report to confirm the rendered result
  const screenshot = await page.screenshot({ fullPage: true })
  await test.info().attach('home-screenshot', { body: screenshot, contentType: 'image/png' })
})

