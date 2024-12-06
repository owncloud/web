import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

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
    expect(a11yResult.violations).toEqual([])
  })
})
