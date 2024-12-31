import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const SELECTORS = Object.freeze({
  previewWrapper: '[data-testid="preview-wrapper"]',
  codemirrorHtml: '[data-testid="codemirror-html"]',
  // We're using class here instead of data attribute because we cannot adjust the default preview component
  // The class is coming from the specified theme
  codemirrorVue: '.cm-s-night',
  tabHtml: '[data-testid="preview-tab-html"]'
})

test.describe('Accessibility', () => {
  test('Login page', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}`)
    await page.fill('#oc-login-username', 'admin')
    await page.fill('#oc-login-password', 'admin')
    await page.click("button[type='submit']")
    await page.locator('#files').waitFor()

    // users settings
    await page.goto(`${baseURL}/admin-settings/users`)
    await page.locator('#user-list').waitFor()

    // https://host.docker.internal:9200/admin-settings/users
    const a11yResult = await new AxeBuilder({ page }).include('#user-list').analyze()
    expect(a11yResult.violations).not.toContainEqual([])
  })
})
