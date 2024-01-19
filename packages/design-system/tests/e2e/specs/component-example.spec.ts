import { test, expect } from '@playwright/test'

const SELECTORS = Object.freeze({
  previewWrapper: '[data-testid="preview-wrapper"]',
  codemirrorHtml: '[data-testid="codemirror-html"]',
  // We're using class here instead of data attribute because we cannot adjust the default preview component
  // The class is coming from the specified theme
  codemirrorVue: '.cm-s-night',
  tabHtml: '[data-testid="preview-tab-html"]'
})

test('Components preview is displayed', async ({ page, baseURL }) => {
  await page.goto((baseURL || '') + '/#/' + encodeURIComponent('oC Components') + '/OcButton')

  await expect(page.locator(SELECTORS.previewWrapper)).toBeVisible()
  await expect(page.locator(SELECTORS.codemirrorVue)).toBeVisible()

  await page.locator(SELECTORS.tabHtml).click()

  await expect(page.locator(SELECTORS.codemirrorHtml)).toBeVisible()
})
