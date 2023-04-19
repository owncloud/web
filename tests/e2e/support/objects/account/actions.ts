import { expect } from '@playwright/test'
import { Page } from 'playwright'
import util from 'util'

const accountMenuButton = '.oc-topbar-personal-avatar'
const quotaValue = '.storage-wrapper-text .oc-text-small'
const accountManageButton = '#oc-topbar-account-manage'
const infoValue = '.account-page-info-%s dd'
const requestExportButton = '[data-testid="request-export-btn"]'
const downloadExportButton = '[data-testid="download-export-btn"]'
const exportInProcessMessage = '[data-testid="export-in-process"]'

export const getQuotaValue = async (args: { page: Page }): Promise<string> => {
  const { page } = args
  await page.reload()
  await page.locator(accountMenuButton).click()
  const quotaText = await page.locator(quotaValue).textContent()
  await page.locator(quotaValue).click()

  // parse "0 B of 10 GB used"
  const value = quotaText.split('of')
  return value[1].replace(/[^0-9]/g, '')
}

export const getUserInfo = async (args: { page: Page; key: string }): Promise<string> => {
  const { page, key } = args
  await page.locator(accountMenuButton).click()
  await page.locator(accountManageButton).click()
  return await page.locator(util.format(infoValue, key)).textContent()
}

export const openAccountPage = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  await page.locator(accountMenuButton).click()
  await page.locator(accountManageButton).click()
}

export const requestGdprExport = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith('exportPersonalData') &&
        resp.status() === 201 &&
        resp.request().method() === 'POST'
    ),
    // not waiting for the generation report
    page.route('**/.personal_data_export.json', async (route) => {
      const response = await route.fetch()
      let body = await response.text()
      body = body.replace(
        '<d:status>HTTP/1.1 425 TOO EARLY</d:status>',
        '<d:status>HTTP/1.1 200 OK</d:status>'
      )
      route.fulfill({
        response,
        body
      })
    }),
    page.locator(requestExportButton).click()
  ])
}

export const downloadGdprExport = async (args: { page: Page }): Promise<void> => {
  const { page } = args

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith('.personal_data_export.json') &&
        resp.status() === 200 &&
        resp.request().method() === 'HEAD'
    ),
    page.locator(downloadExportButton).click()
  ])
  await expect(download.suggestedFilename()).toContain('personal_data_export.json')
  await page.locator(requestExportButton).waitFor()
}
