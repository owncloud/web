import { Page } from '@playwright/test'
import util from 'util'

const searchResultMessageSelector = '//p[@class="oc-text-muted"]'
const selectTagDropdownSelector =
  '//div[contains(@class,"files-search-filter-tags")]//button[contains(@class,"oc-filter-chip-button")]'
const tagFilterChipSelector = '//button[contains(@data-test-value,"%s")]'
const mediaTypeFilterSelector = '.item-filter-mediaType'
const mediaTypeFilterItem = '[data-test-id="media-type-%s"]'
const mediaTypeOutside = '.files-search-result-filter'
const clearTagFilterSelector =
  '//div[contains(@class,"files-search-filter-tags")]//button[contains(@class,"oc-filter-chip-clear")]'
const clearMediaTypeFilterSelector =
  '//div[contains(@class,"item-filter-mediaType")]//button[contains(@class,"oc-filter-chip-clear")]'
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

export const clearTagFilter = async ({ page }: { page: Page }): Promise<void> => {
  await page.locator(clearTagFilterSelector).click()
}

export const selectMediaTypeFilter = async ({
  mediaType,
  page
}: {
  mediaType: string
  page: Page
}): Promise<void> => {
  await page.locator(mediaTypeFilterSelector).click()
  await page.locator(util.format(mediaTypeFilterItem, mediaType.toLowerCase())).click()
  await page.locator(mediaTypeOutside).click()
}

export const clearMediaTypeFilter = async ({ page }: { page: Page }): Promise<void> => {
  await page.locator(clearMediaTypeFilterSelector).click()
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
