import { basename } from 'path'
import { Page, expect } from '@playwright/test'
import { objects } from '../../..'

export const uploadLogo = async (path: string, page: Page): Promise<void> => {
  await page.click('#logo-context-btn')

  // wait for the visible context menu and run accessibility scan on that menu
  const a11yObject = new objects.a11y.Accessibility({ page })
  const selectors = a11yObject.getSelectors()
  const menuViolations = await a11yObject.getSevereAccessibilityViolations(
    selectors.tippyBoxVisible
  )
  expect(
    menuViolations,
    `Found ${menuViolations.length} severe accessibility violations in logo menu`
  ).toHaveLength(0)

  const logoInput = page.locator('#logo-upload-input')
  await logoInput.setInputFiles(path)

  await page.locator('.oc-notification-message').waitFor()
  await page.reload()

  // run accessibility scan on the logo area after upload
  const logoViolations = await a11yObject.getSevereAccessibilityViolations(selectors.logoWrapper)
  expect(
    logoViolations,
    `Found ${logoViolations.length} severe accessibility violations in logo area after upload`
  ).toHaveLength(0)

  const logoImg = page.locator(`${selectors.logoWrapper} img`)
  const logoSrc = await logoImg.getAttribute('src')
  expect(logoSrc).toContain(basename(path))
}

export const resetLogo = async (page: Page): Promise<void> => {
  const a11yObject = new objects.a11y.Accessibility({ page })
  const selectors = a11yObject.getSelectors()

  const imgBefore = page.locator(`${selectors.logoWrapper} img`)
  const srcBefore = await imgBefore.getAttribute('src')
  await page.click('#logo-context-btn')

  // wait for the visible context menu and run accessibility scan on that menu
  const menuViolations = await a11yObject.getSevereAccessibilityViolations(
    selectors.tippyBoxVisible
  )
  expect(
    menuViolations,
    `Found ${menuViolations.length} severe accessibility violations in logo menu`
  ).toHaveLength(0)

  await page.click('.oc-general-actions-reset-logo-trigger')

  await page.locator('.oc-notification-message').waitFor()
  await page.reload()

  // run accessibility scan on the logo area after reset
  const logoViolations = await a11yObject.getSevereAccessibilityViolations(selectors.logoWrapper)
  expect(
    logoViolations,
    `Found ${logoViolations.length} severe accessibility violations in logo area after reset`
  ).toHaveLength(0)

  const imgAfter = page.locator(`${selectors.logoWrapper} img`)
  const srcAfter = await imgAfter.getAttribute('src')
  expect(srcAfter).not.toEqual(srcBefore)
}
