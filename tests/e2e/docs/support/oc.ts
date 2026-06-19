import { Page } from '@playwright/test'

const USER = process.env.OCIS_USER ?? 'admin'
const PASS = process.env.OCIS_PASSWORD ?? 'admin'

/**
 * Log in to ownCloud Web through the built-in IdP and wait until the Files
 * view is ready (the account menu is present in the top bar).
 */
export async function login(page: Page): Promise<void> {
  await page.goto('/')
  const username = page.locator('input[placeholder="Username"]')
  await username.waitFor({ state: 'visible', timeout: 30_000 })
  await username.fill(USER)
  await page.locator('input[placeholder="Password"]').fill(PASS)
  await page.locator('input[placeholder="Password"]').press('Enter')
  await page.getByRole('button', { name: 'My Account' }).waitFor({ state: 'visible', timeout: 30_000 })
  await page.waitForTimeout(600)
}

/** Dismiss any open popover/menu so the next step starts from a clean top bar. */
export async function dismissOverlays(page: Page): Promise<void> {
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(200)
}
