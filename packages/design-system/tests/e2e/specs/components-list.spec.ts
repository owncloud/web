import { test, expect } from '@playwright/test'

const SELECTORS = Object.freeze({
  listWrapper: '[data-testid="components-list"]',
  listRow: '[data-testid="component-list-row"]'
})

test('Components list is loaded', async ({ page, baseURL }) => {
  await page.goto(baseURL || '')

  await expect(page.locator(SELECTORS.listWrapper)).toBeVisible()
  expect((await page.$$(SELECTORS.listRow)).length).toBeGreaterThan(10)
})
