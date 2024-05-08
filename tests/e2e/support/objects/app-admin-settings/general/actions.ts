import { basename } from 'path'
import { Page, expect } from '@playwright/test'

export const uploadLogo = async (path: string, page: Page): Promise<void> => {
  await page.click('#logo-context-btn')

  const logoInput = page.locator('#logo-upload-input')
  await logoInput.setInputFiles(path)

  await page.locator('.oc-notification-message').waitFor()
  await page.reload()
  const logoImg = page.locator('.logo-wrapper img')
  const logoSrc = await logoImg.getAttribute('src')
  expect(logoSrc).toContain(basename(path))
}

export const resetLogo = async (page: Page): Promise<void> => {
  const imgBefore = page.locator('.logo-wrapper img')
  const srcBefore = await imgBefore.getAttribute('src')
  await page.click('#logo-context-btn')

  await page.click('.oc-general-actions-reset-logo-trigger')

  await page.locator('.oc-notification-message').waitFor()
  await page.reload()

  const imgAfter = page.locator('.logo-wrapper img')
  const srcAfter = await imgAfter.getAttribute('src')
  expect(srcAfter).not.toEqual(srcBefore)
}
