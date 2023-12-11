import { Page } from '@playwright/test'
import util from 'util'

const searchResultMessageSelector = '//p[@class="oc-text-muted"]'
const selectTagDropdownSelector =
  '//div[contains(@class,"files-search-filter-tags")]//button[contains(@class,"oc-filter-chip-button")]'
const tagFilterChipSelector = '//button[contains(@data-test-value,"%s")]'
const mediaTypeFilterSelector = '.item-filter-mediaType'
const mediaTypeFilterItem = '[data-test-id="media-type-%s"]'
const mediaTypeOutside = '.files-search-result-filter'
const clearFilterSelector = '.item-filter-%s .oc-filter-chip-clear'
const lastModifiedFilterSelector = '.item-filter-lastModified'
const lastModifiedFilterItem = '[data-test-value="%s"]'
const enableSearchInFileContentSelector =
  '//div[contains(@class,"files-search-filter-full-text")]//button[contains(@class,"oc-filter-chip-button")]'
const disableSearchInFileContentSelector =
  '//div[contains(@class,"files-search-filter-full-text")]//button[contains(@class,"oc-filter-chip-clear")]'

export const getSearchResultMessage = ({ page }: { page: Page }): Promise<string> => {
  return page.locator(searchResultMessageSelector).innerText()
}

export const selectTagFilter = async ({
  tag,
  page
}: {
  tag: StaticRangeInit
  page: Page
}): Promise<void> => {
  await page.locator(selectTagDropdownSelector).click()
  await page.locator(util.format(tagFilterChipSelector, tag)).click()
}

export const selectMediaTypeFilter = async ({
  mediaType,
  page
}: {
  mediaType: string
  page: Page
}): Promise<void> => {
  await page.locator(mediaTypeFilterSelector).click()
  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().includes('/dav/spaces') &&
        resp.status() === 207 &&
        resp.request().method() === 'REPORT'
    ),
    page.locator(util.format(mediaTypeFilterItem, mediaType.toLowerCase())).click()
  ])
  await page.locator(mediaTypeOutside).click()
}

export const selectLastModifiedFilter = async ({
  lastModified,
  page
}: {
  lastModified: string
  page: Page
}): Promise<void> => {
  await page.locator(lastModifiedFilterSelector).click()
  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().includes('/dav/spaces') &&
        resp.status() === 207 &&
        resp.request().method() === 'REPORT'
    ),
    page.locator(util.format(lastModifiedFilterItem, lastModified)).click()
  ])
}

export const clearFilter = async ({
  page,
  filter
}: {
  page: Page
  filter: string
}): Promise<void> => {
  await page.locator(util.format(clearFilterSelector, filter)).click()
}

export const toggleSearchInFileContent = async ({
  enableOrDisable,
  page
}: {
  enableOrDisable: string
  page: Page
}): Promise<void> => {
  const selector =
    enableOrDisable === 'enable'
      ? enableSearchInFileContentSelector
      : disableSearchInFileContentSelector
  await page.locator(selector).click()
}
