import { Page } from '@playwright/test'
import util from 'util'

const accountMenuButton = '.oc-topbar-avatar'
const quotaValue = '.storage-wrapper-quota .oc-text-small'
const accountManageButton = '#oc-topbar-account-manage'
const infoValue = '.account-page-info-%s dd'
const requestExportButton = '[data-testid="request-export-btn"]'
const downloadExportButton = '[data-testid="download-export-btn"]'
const languageInput = '[data-testid="language"] .vs__search'
const languageValueDropDown = `.vs__dropdown-menu :text-is("%s")`
const languageValue = '[data-testid="language"] .vs__selected'
const accountPageTitle = '#account-page-title'

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
        resp.status() === 202 &&
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
      await route.fulfill({
        response,
        body
      })
    }),
    page.locator(requestExportButton).click()
  ])
}

export const downloadGdprExport = async (args: { page: Page }): Promise<string> => {
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
  await page.locator(requestExportButton).waitFor()
  return download.suggestedFilename()
}

export const changeLanguage = async (args: {
  page: Page
  language: string
  isAnonymousUser: boolean
}): Promise<string> => {
  const { page, language, isAnonymousUser } = args
  await page.locator(languageInput).waitFor()
  await page.locator(languageInput).click()
  await page.locator(languageInput).pressSequentially(language)
  const promises = []

  if (!isAnonymousUser) {
    promises.push(
      page.waitForResponse(
        (res) =>
          res.url().includes('graph/v1.0/me') &&
          res.request().method() === 'PATCH' &&
          res.status() === 200
      )
    )
  }

  promises.push(page.locator(util.format(languageValueDropDown, language)).press('Enter'))
  await Promise.all(promises)

  return (await page.locator(languageValue).textContent()).trim()
}

export const getTitle = async (args: { page: Page }): Promise<string> => {
  const { page } = args
  return page.locator(accountPageTitle).textContent()
}
