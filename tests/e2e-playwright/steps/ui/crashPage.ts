import { CrashPage } from '../../../e2e/support/objects/crash-page'
import { config } from '../../../e2e/config'
import { Page } from '@playwright/test'

export function expectCrashPageToBeVisible({ page }: { page: Page }) {
  const crashPageObject = new CrashPage({ page })
  return crashPageObject.assertVisibility()
}

export function openCrashPage({ page, errorCode }: { page: Page; errorCode: string }) {
  return page.goto(`${config.baseUrl}/crash?errorCode=${errorCode}`)
}

export async function expectCrashPageHasNoAccessibilityViolations({ page }: { page: Page }) {
  if (config.skipA11y) {
    return
  }

  const crashPageObject = new CrashPage({ page })
  const a11yViolations = await crashPageObject.getAccessibilityViolations()

  expect(
    a11yViolations,
    `Found ${a11yViolations.length} severe accessibility violations in crash page`
  ).toHaveLength(0)
}
