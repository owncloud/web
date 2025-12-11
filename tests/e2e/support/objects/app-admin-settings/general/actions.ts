import { basename } from 'path'
import { Page, expect } from '@playwright/test'
import { objects } from '../../..'
import { World } from '../../../../cucumber/environment/world'

export const uploadLogo = async (path: string, page: Page, world: World): Promise<void> => {
  await page.click('#logo-context-btn')
  const a11yObject = new objects.a11y.Accessibility({ page })
  const a11yViolations = await a11yObject.getSevereAccessibilityViolations('#space-context-drop')
  world.currentStepData = {
    a11yViolations
  }
  expect(a11yViolations).toMatchObject([])
  const logoInput = page.locator('#logo-upload-input')
  await logoInput.setInputFiles(path)

  await page.locator('.oc-notification-message').waitFor()
  await page.reload()
  const selectors = new objects.a11y.Accessibility({ page }).getSelectors()
  // run accessibility scan on the logo area after upload
  await objects.a11y.Accessibility.assertNoSevereA11yViolations(
    page,
    ['logoWrapper'],
    'logo area after upload',
    world
  )

  const logoImg = page.locator(`${selectors.logoWrapper} img`)
  const logoSrc = await logoImg.getAttribute('src')
  expect(logoSrc).toContain(basename(path))
}

export const resetLogo = async (page: Page, world: World): Promise<void> => {
  const imgBefore = page.locator('.logo-wrapper img')
  const srcBefore = await imgBefore.getAttribute('src')
  await page.click('#logo-context-btn')
  const a11yObject = new objects.a11y.Accessibility({ page })

  await page.click('.oc-general-actions-reset-logo-trigger')

  await page.locator('.oc-notification-message').waitFor()
  await page.reload()

  // run accessibility scan on the logo area after reset
  await objects.a11y.Accessibility.assertNoSevereA11yViolations(
    page,
    ['logoWrapper'],
    'logo area after reset',
    world
  )

  const selectors = a11yObject.getSelectors()
  const imgAfter = page.locator(`${selectors.logoWrapper} img`)
  const srcAfter = await imgAfter.getAttribute('src')
  expect(srcAfter).not.toEqual(srcBefore)
}
