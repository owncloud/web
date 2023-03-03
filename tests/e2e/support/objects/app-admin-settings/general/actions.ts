import { basename } from 'path'
import { expect } from '@playwright/test'

export const uploadLogo = async (path, page): Promise<void> => {
  await page.click('#logo-context-btn')

  const logoInput = await page.locator('#logo-upload-input')
  await logoInput.setInputFiles(path)

  await page.waitForSelector('.oc-notification-message')
  await page.reload()
  const logoImg = await page.locator('.logo-wrapper img')
  const logoSrc = await logoImg.getAttribute('src')
  expect(logoSrc).toContain(basename(path))
}

export const resetLogo = async (page): Promise<void> => {
  const imgBefore = await page.locator('.logo-wrapper img')
  const srcBefore = await imgBefore.getAttribute('src')
  await page.click('#logo-context-btn')

  await page.click('.oc-general-actions-reset-logo-trigger')

  await page.waitForSelector('.oc-notification-message')
  await page.reload()

  const imgAfter = await page.locator('.logo-wrapper img')
  const srcAfter = await imgAfter.getAttribute('src')
  expect(srcAfter).not.toEqual(srcBefore)
}
