import { test } from '@playwright/test'
import path from 'path'

test('download', async ({ page, browser }) => {
  // const browser = await chromium.launch({ channel: 'chrome' })
  console.log('Browser:', browser.version())
  // const context = await browser.newContext({ ignoreHTTPSErrors: true })
  // await context.tracing.start({
  //   screenshots: false,
  //   snapshots: true,
  //   sources: false
  // })
  // const page = await context.newPage()
  await page.goto('https://ocis:9200')
  await page.locator('#oc-login-username').fill('admin')
  await page.locator('#oc-login-password').fill('admin')
  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith('/token') && resp.status() === 200 && resp.request().method() === 'POST'
    ),
    page.locator('button[type="submit"]').click()
  ])
  await page.locator('#web-content').waitFor()

  await page.route('*/**/playwright.png', async (route, req) => {
    if (req.method() === 'HEAD') {
      console.log('Intercepted request:', req.url())
      await route.fulfill('')
      return
    }
    await route.continue()
  })

  // upload
  await page.locator('#upload-menu-btn').click()
  await page.locator('#files-file-upload-input').setInputFiles([path.resolve('playwright.png')])
  await page.waitForTimeout(3000)
  await page.locator('#close-upload-bar-btn').click()
  await page.waitForTimeout(2000)
  await page.locator('[title="playwright.png"]').click()
  // download
  await page.locator('#oc-openfile-contextmenu-trigger').click()
  await page.locator('.oc-files-actions-download-file-trigger').click()
  await page.locator('button#app-top-bar-close').click()
  await page.locator('[title="playwright.png"]').click()

  // await context.tracing.stop({ path: 'trace.zip' })
})
